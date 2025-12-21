import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MissionPanelStatePersisted {
  expandedMissions: string[];
  expandedMissionId: string | null;
}

interface MissionPanelState {
  expandedMissions: Set<string>;
  expandedMissionId: string | null; // Currently expanded mission
  
  // Actions
  expandMission: (missionId: string) => void;
  collapseMission: (missionId: string) => void;
  toggleMission: (missionId: string) => void;
  isMissionExpanded: (missionId: string) => boolean;
  setExpandedMission: (missionId: string | null) => void;
}

export const useMissionPanelStore = create<MissionPanelState>()(
  persist(
    (set, get) => ({
  expandedMissions: new Set<string>(),
  expandedMissionId: null,

  expandMission: (missionId: string) => {
    set((state) => {
      const newExpanded = new Set(state.expandedMissions);
      newExpanded.add(missionId);
      return {
        expandedMissions: newExpanded,
        expandedMissionId: missionId,
      };
    });
  },

  collapseMission: (missionId: string) => {
    set((state) => {
      const newExpanded = new Set(state.expandedMissions);
      newExpanded.delete(missionId);
      return {
        expandedMissions: newExpanded,
        expandedMissionId: state.expandedMissionId === missionId ? null : state.expandedMissionId,
      };
    });
  },

  toggleMission: (missionId: string) => {
    const isExpanded = get().isMissionExpanded(missionId);
    if (isExpanded) {
      get().collapseMission(missionId);
    } else {
      get().expandMission(missionId);
    }
  },

  isMissionExpanded: (missionId: string) => {
    return get().expandedMissions.has(missionId);
  },

  setExpandedMission: (missionId: string | null) => {
    set(() => {
      const newExpanded = new Set<string>();
      if (missionId) {
        newExpanded.add(missionId);
      }
      return {
        expandedMissions: newExpanded,
        expandedMissionId: missionId,
      };
    });
  },
    }),
    {
      name: 'neoncloud-mission-panel',
      partialize: (state): MissionPanelStatePersisted => ({
        expandedMissions: Array.from(state.expandedMissions),
        expandedMissionId: state.expandedMissionId,
      }),
      // On rehydrate, convert arrays back to Sets
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) return;
        
        const persisted = state as unknown as MissionPanelStatePersisted;
        (state as MissionPanelState).expandedMissions = new Set(persisted.expandedMissions || []);
      },
    }
  )
);

