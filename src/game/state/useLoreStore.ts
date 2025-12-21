import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LoreEntry } from '@/types/email';

interface LoreState {
  entries: LoreEntry[];
  
  // Actions
  unlockEntry: (entry: LoreEntry) => void;
  isUnlocked: (entryId: string) => boolean;
  getEntriesByCategory: (category: LoreEntry['category']) => LoreEntry[];
  getAllEntries: () => LoreEntry[];
}

export const useLoreStore = create<LoreState>()(
  persist(
    (set, get) => ({
      entries: [],

      unlockEntry: (entry: LoreEntry) => {
        const existing = get().entries.find((e) => e.id === entry.id);
        if (!existing) {
          set((state) => ({
            entries: [...state.entries, { ...entry, unlockedAt: Date.now() }],
          }));
        }
      },

      isUnlocked: (entryId: string) => {
        return get().entries.some((entry) => entry.id === entryId);
      },

      getEntriesByCategory: (category: LoreEntry['category']) => {
        return get().entries.filter((entry) => entry.category === category);
      },

      getAllEntries: () => {
        return get().entries;
      },
    }),
    {
      name: 'neoncloud-lore',
      partialize: (state) => ({
        entries: state.entries,
      }),
    }
  )
);

