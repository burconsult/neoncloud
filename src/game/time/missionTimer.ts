/**
 * Mission Timer Utilities
 * 
 * Helper functions for mission timing and speed bonus calculations.
 * Completion times are affected by difficulty level (easy = more time, hard = less time).
 */

import { applyMissionTimeMultiplier } from '../settings/difficultyConfig';
import { useGameSettingsStore } from '../state/useGameSettingsStore';
import { missionRegistry } from '../missions/MissionModule';

/**
 * Get expected completion time for a mission (adjusted by difficulty)
 * First checks mission module for expectedCompletionTime, then falls back to defaults
 */
export function getExpectedCompletionTime(missionId: string): number {
  // Try to get from mission module first
  const missionModule = missionRegistry.get(missionId);
  if (missionModule?.expectedCompletionTime) {
    const baseTime = missionModule.expectedCompletionTime;
    const difficulty = useGameSettingsStore.getState().difficulty;
    return applyMissionTimeMultiplier(baseTime, difficulty);
  }
  
  // Fallback to default times for missions without explicit times
  const DEFAULT_TIMES: Record<string, number> = {
    'welcome-00': 5 * 60,      // 5 minutes - welcome/tutorial
    'tutorial-01': 10 * 60,    // 10 minutes - terminal navigation
    'network-01': 10 * 60,     // 10 minutes - network connectivity
    'network-02': 12 * 60,     // 12 minutes - network topology
    'network-03': 15 * 60,     // 15 minutes - DNS exploration
  };
  
  const baseTime = DEFAULT_TIMES[missionId] || 15 * 60; // Default 15 minutes
  const difficulty = useGameSettingsStore.getState().difficulty;
  return applyMissionTimeMultiplier(baseTime, difficulty);
}

/**
 * Check if mission completion qualifies for speed bonus
 * Speed bonus is awarded if completed in < 75% of expected time
 */
export function qualifiesForSpeedBonus(missionId: string, elapsedTimeSeconds: number): boolean {
  const expectedTime = getExpectedCompletionTime(missionId);
  const threshold = expectedTime * 0.75; // 75% of expected time
  
  return elapsedTimeSeconds < threshold;
}

/**
 * Calculate speed bonus percentage (for display)
 * Returns 0 if no bonus, or percentage faster than expected
 */
export function calculateSpeedBonusPercentage(missionId: string, elapsedTimeSeconds: number): number {
  const expectedTime = getExpectedCompletionTime(missionId);
  if (elapsedTimeSeconds >= expectedTime) {
    return 0;
  }
  
  // Calculate how much faster (as percentage)
  const speedup = ((expectedTime - elapsedTimeSeconds) / expectedTime) * 100;
  return Math.round(speedup);
}

