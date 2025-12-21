import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EducationalStatePersisted {
  dismissedPopups: string[];
  shownPopups: string[];
}

interface EducationalState {
  dismissedPopups: Set<string>;
  shownPopups: Set<string>;
  
  // Actions
  markPopupShown: (id: string) => void;
  dismissPopup: (id: string) => void;
  isPopupDismissed: (id: string) => boolean;
  hasPopupBeenShown: (id: string) => boolean;
  resetDismissed: () => void;
}

export const useEducationalStore = create<EducationalState>()(
  persist(
    (set, get) => ({
  dismissedPopups: new Set<string>(),
  shownPopups: new Set<string>(),

  markPopupShown: (id: string) => {
    set((state) => {
      const newShown = new Set(state.shownPopups);
      newShown.add(id);
      return { shownPopups: newShown };
    });
  },

  dismissPopup: (id: string) => {
    set((state) => {
      const newDismissed = new Set(state.dismissedPopups);
      newDismissed.add(id);
      return { dismissedPopups: newDismissed };
    });
  },

  isPopupDismissed: (id: string) => {
    return get().dismissedPopups.has(id);
  },

  hasPopupBeenShown: (id: string) => {
    return get().shownPopups.has(id);
  },

  resetDismissed: () => {
    set({ dismissedPopups: new Set() });
  },
    }),
    {
      name: 'neoncloud-educational',
      partialize: (state): EducationalStatePersisted => ({
        dismissedPopups: Array.from(state.dismissedPopups),
        shownPopups: Array.from(state.shownPopups),
      }),
      // On rehydrate, convert arrays back to Sets
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) return;
        
        const persisted = state as unknown as EducationalStatePersisted;
        (state as EducationalState).dismissedPopups = new Set(persisted.dismissedPopups || []);
        (state as EducationalState).shownPopups = new Set(persisted.shownPopups || []);
      },
    }
  )
);

