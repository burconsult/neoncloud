/**
 * Difficulty System Configuration
 * 
 * Defines difficulty levels and their effects on gameplay:
 * - Price multipliers (higher difficulty = more expensive tools)
 * - Time multipliers (higher difficulty = shorter completion times)
 * - Hint availability (higher difficulty = fewer/no hints)
 */

export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'expert';

export interface DifficultyConfig {
  /** Display name for the difficulty level */
  name: string;
  
  /** Multiplier for tool prices (1.0 = normal, >1.0 = more expensive) */
  priceMultiplier: number;
  
  /** Multiplier for tool durations (1.0 = normal, <1.0 = faster/shorter) */
  durationMultiplier: number;
  
  /** Multiplier for mission completion times (1.0 = normal, <1.0 = shorter) */
  missionTimeMultiplier: number;
  
  /** Whether to show hints in missions (true = show, false = hide) */
  showHints: boolean;
  
  /** Whether to show optional hints (true = show all hints, false = only essential) */
  showOptionalHints: boolean;
}

/**
 * Difficulty configurations
 */
export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    name: 'Easy (Training)',
    priceMultiplier: 0.8,      // 20% cheaper tools
    durationMultiplier: 0.75,   // Tools take 25% less time (faster, easier)
    missionTimeMultiplier: 1.5, // Missions have 50% more time
    showHints: true,
    showOptionalHints: true,    // Show all hints
  },
  normal: {
    name: 'Normal',
    priceMultiplier: 1.0,       // Standard prices
    durationMultiplier: 1.0,    // Standard durations
    missionTimeMultiplier: 1.0, // Standard times
    showHints: true,
    showOptionalHints: true,    // Show all hints
  },
  hard: {
    name: 'Hard',
    priceMultiplier: 1.5,       // 50% more expensive tools
    durationMultiplier: 1.5,    // Tools take 50% more time (slower, harder)
    missionTimeMultiplier: 0.75, // Missions have 25% less time
    showHints: true,
    showOptionalHints: false,   // Only show essential hints
  },
  expert: {
    name: 'Expert',
    priceMultiplier: 2.0,       // 100% more expensive tools (double price)
    durationMultiplier: 2.0,    // Tools take 100% more time (much slower, very hard)
    missionTimeMultiplier: 0.5, // Missions have 50% less time
    showHints: false,           // No hints at all
    showOptionalHints: false,
  },
};

/**
 * Get configuration for a difficulty level
 */
export function getDifficultyConfig(level: DifficultyLevel): DifficultyConfig {
  return DIFFICULTY_CONFIGS[level];
}

/**
 * Apply price multiplier based on difficulty
 */
export function applyPriceMultiplier(basePrice: number, difficulty: DifficultyLevel): number {
  const config = getDifficultyConfig(difficulty);
  return Math.round(basePrice * config.priceMultiplier);
}

/**
 * Apply duration multiplier based on difficulty
 */
export function applyDurationMultiplier(baseDuration: number, difficulty: DifficultyLevel): number {
  const config = getDifficultyConfig(difficulty);
  return Math.round(baseDuration * config.durationMultiplier);
}

/**
 * Apply mission time multiplier based on difficulty
 */
export function applyMissionTimeMultiplier(baseTime: number, difficulty: DifficultyLevel): number {
  const config = getDifficultyConfig(difficulty);
  return Math.round(baseTime * config.missionTimeMultiplier);
}

/**
 * Check if hints should be shown for a difficulty level
 */
export function shouldShowHints(difficulty: DifficultyLevel): boolean {
  const config = getDifficultyConfig(difficulty);
  return config.showHints;
}

/**
 * Check if optional hints should be shown for a difficulty level
 */
export function shouldShowOptionalHints(difficulty: DifficultyLevel): boolean {
  const config = getDifficultyConfig(difficulty);
  return config.showOptionalHints;
}

