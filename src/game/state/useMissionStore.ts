import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Mission } from '@/types';
import { getMissionById, getAllMissions } from '../missions/missionLoader';
import { getTaskReward, getMissionReward, calculateMissionReward } from '../rewards/rewardDefinitions';
import { useCurrencyStore } from './useCurrencyStore';
import { initializeMission, finalizeMission } from '../missions/missionLoader';
import { useGameTimeStore } from '../time/useGameTimeStore';
import { qualifiesForSpeedBonus } from '../time/missionTimer';
import { createLogger } from '../../utils/logger';

const logger = createLogger('MissionStore');

interface MissionState {
  currentMission: Mission | null;
  completedMissions: string[];
  taskProgress: Record<string, Record<string, boolean>>; // missionId -> taskId -> completed
  missionStartTime: number | null; // Real-time timestamp when mission timer started (null = not started yet)
  hintUsage: Record<string, Set<string>>; // missionId -> Set of taskIds where hints were used
  
  // Actions
  setCurrentMission: (mission: Mission | null) => void;
  startMission: (missionId: string) => Promise<boolean>;
  startMissionTimer: () => void; // Start timer on first command
  completeTask: (missionId: string, taskId: string) => void;
  recordHintUsage: (missionId: string, taskId: string) => void; // Track when a hint is viewed
  completeMission: (missionId: string) => Promise<void>;
  isTaskCompleted: (missionId: string, taskId: string) => boolean;
  isMissionCompleted: (missionId: string) => boolean;
  getMissionProgress: (missionId: string) => number; // Returns 0-100
  getMissionElapsedTime: () => number; // Returns elapsed time in real-time seconds
  hasUsedHints: (missionId: string) => boolean; // Check if any hints were used in a mission
  hasPerfectCompletion: (missionId: string) => boolean; // Check if all tasks completed
}

interface MissionStatePersisted {
  currentMissionId: string | null;
  completedMissions: string[];
  taskProgress: Record<string, Record<string, boolean>>;
  missionStartTime: number | null;
  hintUsage: Record<string, string[]>; // missionId -> array of taskIds where hints were used
}

export const useMissionStore = create<MissionState>()(
  persist(
    (set, get) => ({
      currentMission: null,
      completedMissions: [],
      taskProgress: {},
      missionStartTime: null,
      hintUsage: {},

  setCurrentMission: (mission: Mission | null) => {
    set({ currentMission: mission });
  },

  startMission: async (missionId: string) => {
    const mission = getMissionById(missionId);
    if (!mission) {
      return false;
    }

    // Don't restart missions that are already completed
    if (get().isMissionCompleted(missionId)) {
      console.log(`Mission ${missionId} is already completed, skipping restart`);
      return false;
    }

    // Initialize task progress if not exists
    const taskProgress = get().taskProgress;
    const isAlreadyCompleted = get().isMissionCompleted(missionId);
    
    if (!taskProgress[missionId]) {
      taskProgress[missionId] = {};
    }
    const missionProgress = taskProgress[missionId]!; // Non-null assertion safe here
    
    // If mission is already completed, preserve all task progress
    // Otherwise, initialize tasks that don't exist yet (but preserve any existing progress)
    mission.tasks.forEach((task) => {
      if (missionProgress[task.id] === undefined) {
        missionProgress[task.id] = false;
      }
      // If task.id already exists (true or false), keep it as is (preserve existing progress)
    });

    set({
      currentMission: mission,
      taskProgress: { ...taskProgress },
      missionStartTime: null, // Timer starts on first command, not mission start
    });

    // Initialize mission module (emails, lore, file system, etc.)
    await initializeMission(missionId);

    return true;
  },

  startMissionTimer: () => {
    const state = get();
    // Only start timer if mission exists and timer hasn't started yet
    if (state.currentMission && state.missionStartTime === null) {
      set({ missionStartTime: Date.now() });
    }
  },

  getMissionElapsedTime: () => {
    const state = get();
    if (!state.missionStartTime) {
      return 0; // Timer hasn't started yet
    }
    return (Date.now() - state.missionStartTime) / 1000; // Return in seconds
  },

  completeTask: (missionId: string, taskId: string) => {
    const taskProgress = get().taskProgress;
    if (!taskProgress[missionId]) {
      taskProgress[missionId] = {};
    }
    
    // Check if task was already completed (don't reward twice)
    const wasAlreadyCompleted = taskProgress[missionId][taskId] === true;
    
    taskProgress[missionId][taskId] = true;

    set({ taskProgress: { ...taskProgress } });

    // Award neoncoins for task completion (only first time)
    if (!wasAlreadyCompleted) {
      const reward = getTaskReward();
      const currencyStore = useCurrencyStore.getState();
      
      currencyStore.earn(
        reward.amount,
        reward.description,
        'task'
      );
    }

    // Check if mission is complete (but only if it's the current mission to avoid race conditions)
    const currentMission = get().currentMission;
    if (currentMission && currentMission.id === missionId) {
      const mission = getMissionById(missionId);
      if (mission && taskProgress[missionId]) {
        const missionTaskProgress = taskProgress[missionId]!; // Non-null assertion safe here
        const allTasksCompleted = mission.tasks.every(
          (task) => missionTaskProgress[task.id] === true
        );
        if (allTasksCompleted) {
          // Use a longer delay to ensure all async events have been processed (especially for disconnect)
          // Events are processed asynchronously, so we need to wait for them to complete
          setTimeout(() => {
            // Double-check that mission is still current and all tasks are still complete
            const state = get();
            if (state.currentMission?.id === missionId) {
              const finalCheck = mission.tasks.every(
                (task) => state.taskProgress[missionId]?.[task.id] === true
              );
              if (finalCheck) {
                get().completeMission(missionId).catch(console.error);
              }
            }
          }, 250); // 250ms delay to allow async disconnect event to fully process
        }
      }
    }
  },

  completeMission: async (missionId: string) => {
    const completedMissions = [...get().completedMissions];
    if (!completedMissions.includes(missionId)) {
      completedMissions.push(missionId);
      set({ completedMissions });
      
      // Award neoncoins for mission completion
      const reward = getMissionReward(missionId);
      
      if (reward) {
        // Calculate elapsed time for speed bonus
        const elapsedTime = get().getMissionElapsedTime();
        const speedBonus = qualifiesForSpeedBonus(missionId, elapsedTime);
        
        // Calculate bonuses
        const bonuses = {
          perfectCompletion: get().hasPerfectCompletion(missionId),
          speedBonus: speedBonus, // Now calculated based on elapsed time
          noHints: !get().hasUsedHints(missionId), // Check if no hints were used
        };
        
        const totalReward = calculateMissionReward(missionId, bonuses);
        const currencyStore = useCurrencyStore.getState();
        
        currencyStore.earn(
          totalReward,
          reward.description,
          'mission'
        );
      }
      
      // Auto-load next mission if available
      const allMissions = getAllMissions();
      
      // Find the next mission that should be unlocked
      // A mission is unlocked if:
      // 1. It has prerequisites AND all prerequisites are completed
      // 2. The mission itself is not yet completed
      const nextMission = allMissions.find((mission: Mission) => {
        // Skip missions that are already completed
        if (completedMissions.includes(mission.id)) {
          return false;
        }
        
        // Check if this mission has prerequisites
        if (mission.prerequisites && mission.prerequisites.length > 0) {
          // All prerequisites must be met
          const allPrereqsMet = mission.prerequisites.every(prereq => 
            completedMissions.includes(prereq)
          );
          return allPrereqsMet;
        }
        
        // Missions without prerequisites are not auto-loaded (they must be manually started)
        return false;
      });
      
      if (nextMission) {
        logger.debug(`Auto-loading next mission: ${nextMission.id} after completing ${missionId}`);
        
        // Finalize current mission (completion emails, cleanup, etc.)
        await finalizeMission(missionId);
        
        // Start the next mission automatically
        await get().startMission(nextMission.id);
      } else {
        logger.debug(`No next mission found after completing ${missionId}`);
        // No more missions, clear current mission
        set({ currentMission: null });
      }
    }
  },

  isTaskCompleted: (missionId: string, taskId: string) => {
    const taskProgress = get().taskProgress;
    return taskProgress[missionId]?.[taskId] === true;
  },

  isMissionCompleted: (missionId: string) => {
    return get().completedMissions.includes(missionId);
  },

  recordHintUsage: (missionId: string, taskId: string) => {
    const state = get();
    const hintUsage = { ...state.hintUsage };
    if (!hintUsage[missionId]) {
      hintUsage[missionId] = new Set<string>();
    } else {
      hintUsage[missionId] = new Set(hintUsage[missionId]);
    }
    hintUsage[missionId].add(taskId);
    set({ hintUsage });
  },

  hasUsedHints: (missionId: string) => {
    const hintUsage = get().hintUsage[missionId];
    return hintUsage ? hintUsage.size > 0 : false;
  },

  hasPerfectCompletion: (missionId: string) => {
    const mission = getMissionById(missionId);
    if (!mission) return false;
    
    const taskProgress = get().taskProgress[missionId];
    if (!taskProgress) return false;
    
    // Check if all tasks are completed
    return mission.tasks.every(task => taskProgress[task.id] === true);
  },

  getMissionProgress: (missionId: string) => {
    const mission = getMissionById(missionId);
    if (!mission) {
      return 0;
    }

    const taskProgress = get().taskProgress[missionId];
    if (!taskProgress) {
      return 0;
    }

    const completedTasks = mission.tasks.filter(
      (task) => taskProgress[task.id] === true
    ).length;

    return Math.round((completedTasks / mission.tasks.length) * 100);
  },
    }),
    {
      name: 'neoncloud-missions',
      partialize: (state): MissionStatePersisted => ({
        // Store mission ID instead of full mission object
        currentMissionId: state.currentMission?.id || null,
        completedMissions: state.completedMissions,
        taskProgress: state.taskProgress,
        missionStartTime: state.missionStartTime,
        hintUsage: Object.fromEntries(
          Object.entries(state.hintUsage).map(([missionId, taskIds]) => [
            missionId,
            Array.from(taskIds),
          ])
        ),
      }),
      // On rehydrate, restore the full Mission object from ID
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) return;
        
        // Restore current mission from ID
        const persisted = state as unknown as MissionStatePersisted;
        if (persisted.currentMissionId) {
          const mission = getMissionById(persisted.currentMissionId);
          if (mission) {
            (state as MissionState).currentMission = mission;
          } else {
            (state as MissionState).currentMission = null;
          }
        } else {
          (state as MissionState).currentMission = null;
        }
      },
    }
  )
);

