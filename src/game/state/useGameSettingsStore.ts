/**
 * Game Settings Store
 * 
 * Manages game-wide settings including difficulty level.
 * Persisted to localStorage so settings are remembered.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DifficultyLevel } from '../settings/difficultyConfig';

interface GameSettingsState {
  difficulty: DifficultyLevel;
  
  // Actions
  setDifficulty: (difficulty: DifficultyLevel) => void;
  reset: () => void;
}

interface GameSettingsPersisted {
  difficulty: DifficultyLevel;
}

const DEFAULT_DIFFICULTY: DifficultyLevel = 'normal';

export const useGameSettingsStore = create<GameSettingsState>()(
  persist(
    (set) => ({
      difficulty: DEFAULT_DIFFICULTY,

      setDifficulty: (difficulty: DifficultyLevel) => {
        set({ difficulty });
      },

      reset: () => {
        set({ difficulty: DEFAULT_DIFFICULTY });
      },
    }),
    {
      name: 'neoncloud-game-settings',
      partialize: (state): GameSettingsPersisted => ({
        difficulty: state.difficulty,
      }),
    }
  )
);

