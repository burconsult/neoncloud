import { Mission } from '@/types';
import { useMissionStore } from '../state/useMissionStore';
import { getAllMissions, getMissionById } from './missionLoader';

/**
 * Get the current mission progress
 */
export function getCurrentMissionProgress(): {
  currentMissionId: string | null;
  completedMissions: string[];
  unlockedMissions: string[];
} {
  const missionStore = useMissionStore.getState();
  const currentMission = missionStore.currentMission;
  const completedMissions = missionStore.completedMissions || [];
  
  // Get all missions to check unlocks
  const allMissions = getAllMissions();
  
  // Determine unlocked missions
  const unlockedMissions = allMissions
    .filter((mission: Mission) => {
      // Tutorial is always unlocked
      if (mission.id === 'tutorial-01') return true;
      
      // Check if prerequisites are met
      if (mission.prerequisites && mission.prerequisites.length > 0) {
        return mission.prerequisites.every(prereq => completedMissions.includes(prereq));
      }
      
      return false;
    })
    .map((mission: Mission) => mission.id);

  return {
    currentMissionId: currentMission?.id || null,
    completedMissions,
    unlockedMissions,
  };
}

/**
 * Check if a command is available for the current mission progress
 */
export function isCommandAvailableForMission(commandName: string): {
  available: boolean;
  requiredMission?: string;
  message?: string;
} {
  const { completedMissions, unlockedMissions } = getCurrentMissionProgress();
  
  // Command to mission mapping
  const commandMissionMap: Record<string, string> = {
    'ping': 'network-01',
    'traceroute': 'network-02',
    'tracert': 'network-02',
    'nslookup': 'network-03',
  };

  const requiredMission = commandMissionMap[commandName.toLowerCase()];
  
  if (!requiredMission) {
    // Command is always available (basic commands)
    return { available: true };
  }

  if (completedMissions.includes(requiredMission)) {
    // Mission completed, command available
    return { available: true };
  }

  if (unlockedMissions.includes(requiredMission)) {
    // Mission unlocked but not completed - allow with warning
    return {
      available: true,
      requiredMission,
      message: `This command is part of the "${getMissionName(requiredMission)}" mission. Complete the current mission first for the best learning experience.`,
    };
  }

  // Mission not unlocked yet
  const prerequisiteMission = getPrerequisiteMission(requiredMission);
  return {
    available: false,
    requiredMission,
    message: `This command will be available in a later mission. Complete "${getMissionName(prerequisiteMission)}" first.`,
  };
}

/**
 * Get mission name by ID
 */
function getMissionName(missionId: string): string {
  const mission = getMissionById(missionId);
  return mission?.title || 'the required mission';
}

/**
 * Get prerequisite mission for a given mission
 */
function getPrerequisiteMission(missionId: string): string {
  const mission = getMissionById(missionId);
  
  if (mission?.prerequisites && mission.prerequisites.length > 0) {
    const lastPrereq = mission.prerequisites[mission.prerequisites.length - 1];
    return lastPrereq || 'tutorial-01';
  }
  
  return 'tutorial-01';
}

