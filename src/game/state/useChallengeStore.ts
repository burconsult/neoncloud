import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Challenge } from '../challenges/ChallengeModule';
import { generateChallenge, verifyChallengeAnswer } from '../challenges/challengeLoader';
// Ensure challenge generators are loaded
import '../challenges/challengeLoader';

interface ChallengeState {
  currentChallenge: Challenge | null;
  rootPassword: string | null;
  attempts: number;
  isRoot: boolean;
  
  // Actions
  generateNewChallenge: () => Challenge;
  solveChallenge: (answer: string) => { success: boolean; message: string };
  setRootPassword: (password: string) => void;
  clearChallenge: () => void;
  becomeRoot: () => void;
  exitRoot: () => void;
}

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set, get) => ({
  currentChallenge: null,
  rootPassword: null,
  attempts: 0,
  isRoot: false,

  generateNewChallenge: () => {
    const challenge = generateChallenge();
    set({
      currentChallenge: challenge,
      attempts: 0,
    });
    return challenge;
  },

  solveChallenge: (answer: string) => {
    const { currentChallenge } = get();
    
    if (!currentChallenge) {
      return {
        success: false,
        message: 'No active challenge. Generate one first.',
      };
    }

    const isCorrect = verifyChallengeAnswer(currentChallenge, answer);
    
    if (isCorrect) {
      // Generate root password (based on challenge answer)
      const password = `root_${currentChallenge.answer}_${Date.now().toString().slice(-4)}`;
      set({
        rootPassword: password,
        attempts: get().attempts + 1,
      });
      
      return {
        success: true,
        message: `Correct! Root password: ${password}\nUse 'su' or 'su root' to switch to root user.`,
      };
    } else {
      set({
        attempts: get().attempts + 1,
      });
      
      const attempts = get().attempts;
      let hint = '';
      if (attempts >= 2) {
        hint = `\nHint: ${currentChallenge.hint}`;
      }
      if (attempts >= 3) {
        hint += `\nExplanation: ${currentChallenge.explanation}`;
      }
      
      return {
        success: false,
        message: `Incorrect answer. Try again.${hint}`,
      };
    }
  },

  setRootPassword: (password: string) => {
    set({ rootPassword: password });
  },

  clearChallenge: () => {
    set({
      currentChallenge: null,
      attempts: 0,
    });
  },

  becomeRoot: () => {
    set({ isRoot: true });
  },

  exitRoot: () => {
    set({ isRoot: false });
  },
    }),
    {
      name: 'neoncloud-challenge',
      partialize: (state) => ({
        isRoot: state.isRoot,
        rootPassword: state.rootPassword,
        attempts: state.attempts,
        // Note: currentChallenge is not persisted as it's regenerated
      }),
    }
  )
);

