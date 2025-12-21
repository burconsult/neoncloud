/**
 * Game Time Store
 * 
 * Manages game clock and speedup settings.
 * All durations are in real-time seconds, converted to game-time via speedup multiplier.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameTimeState {
  // Game start time (real-time timestamp)
  gameStartTime: number;
  
  // Speedup multiplier (1 = real-time, 5 = 5x faster, etc.)
  speedup: number;
  
  // Actions
  setSpeedup: (multiplier: number) => void;
  
  /**
   * Convert real-time duration (seconds) to game-time duration (milliseconds)
   * Game-time is faster based on speedup multiplier
   */
  toGameDuration: (realDurationSeconds: number) => number;
  
  /**
   * Get elapsed game time since game started (in real-time seconds)
   * This is actual elapsed time, not game-time
   */
  getElapsedRealTime: () => number;
  
  /**
   * Initialize game start time (called when game starts)
   */
  initializeGameTime: () => void;
  
  /**
   * Reset game time (for new game)
   */
  resetGameTime: () => void;
}

const DEFAULT_SPEEDUP = 5; // 5x faster by default
const MIN_SPEEDUP = 1;
const MAX_SPEEDUP = 20;

export const useGameTimeStore = create<GameTimeState>()(
  persist(
    (set, get) => ({
      gameStartTime: Date.now(),
      speedup: DEFAULT_SPEEDUP,

      setSpeedup: (multiplier: number) => {
        // Clamp speedup between min and max
        const clampedSpeedup = Math.max(MIN_SPEEDUP, Math.min(MAX_SPEEDUP, multiplier));
        set({ speedup: clampedSpeedup });
      },

      toGameDuration: (realDurationSeconds: number): number => {
        const speedup = get().speedup;
        // Convert to milliseconds and divide by speedup
        return (realDurationSeconds * 1000) / speedup;
      },

      getElapsedRealTime: (): number => {
        const startTime = get().gameStartTime;
        return (Date.now() - startTime) / 1000; // Return in seconds
      },

      initializeGameTime: () => {
        set({ gameStartTime: Date.now() });
      },

      resetGameTime: () => {
        set({ gameStartTime: Date.now() });
      },
    }),
    {
      name: 'neoncloud-gametime',
      partialize: (state) => ({
        speedup: state.speedup,
        // Don't persist gameStartTime - reset on page reload
      }),
    }
  )
);

/**
 * Format duration in a human-readable way
 */
export function formatDuration(seconds: number): string {
  if (seconds < 1) {
    return `${Math.round(seconds * 1000)}ms`;
  }
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Format mission time (MM:SS format)
 */
export function formatMissionTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

