/**
 * Reward definitions for the game
 * Defines how many neoncoins players earn for various actions
 */

export interface RewardDefinition {
  id: string;
  amount: number;
  description: string;
  category: 'mission' | 'task' | 'achievement' | 'bonus' | 'first_time';
}

/**
 * Mission completion rewards
 * Base reward + bonus for difficulty
 */
export const MISSION_REWARDS: Record<string, RewardDefinition> = {
  'welcome-00': {
    id: 'mission-welcome-00',
    amount: 25,
    description: 'Completed Welcome to NeonCloud',
    category: 'mission',
  },
  'tutorial-01': {
    id: 'mission-tutorial-01',
    amount: 50,
    description: 'Completed Terminal Navigation Basics',
    category: 'mission',
  },
  'network-01': {
    id: 'mission-network-01',
    amount: 100,
    description: 'Completed Network Connectivity Basics',
    category: 'mission',
  },
  'network-02': {
    id: 'mission-network-02',
    amount: 150,
    description: 'Completed Understanding Network Paths',
    category: 'mission',
  },
  'network-03': {
    id: 'mission-network-03',
    amount: 200,
    description: 'Completed DNS and Domain Resolution',
    category: 'mission',
  },
  'n00b-01': {
    id: 'mission-n00b-01',
    amount: 300,
    description: 'Completed First Hack: Protected Server',
    category: 'mission',
  },
  'n00b-02': {
    id: 'mission-n00b-02',
    amount: 400,
    description: 'Completed Data Extraction: Database Server',
    category: 'mission',
  },
  'n00b-03': {
    id: 'mission-n00b-03',
    amount: 350,
    description: 'Completed Network Investigation',
    category: 'mission',
  },
  'h4x0r-01': {
    id: 'mission-h4x0r-01',
    amount: 600,
    description: 'Completed Advanced Penetration: Multi-Server Exfiltration',
    category: 'mission',
  },
};

/**
 * Task completion rewards
 * Small rewards for individual tasks
 */
export const TASK_REWARDS: RewardDefinition = {
  id: 'task-completion',
  amount: 10,
  description: 'Completed a task',
  category: 'task',
};

/**
 * First-time command usage bonus
 */
export const FIRST_COMMAND_BONUS: RewardDefinition = {
  id: 'first-command',
  amount: 5,
  description: 'First time using a command',
  category: 'first_time',
};

/**
 * Achievement rewards (for future use)
 */
export const ACHIEVEMENT_REWARDS: Record<string, RewardDefinition> = {
  'speed-runner': {
    id: 'achievement-speed-runner',
    amount: 100,
    description: 'Completed a mission quickly',
    category: 'achievement',
  },
  'perfectionist': {
    id: 'achievement-perfectionist',
    amount: 150,
    description: 'Completed all tasks without hints',
    category: 'achievement',
  },
  'explorer': {
    id: 'achievement-explorer',
    amount: 75,
    description: 'Explored all directories',
    category: 'achievement',
  },
};

/**
 * Bonus multipliers for special conditions
 */
export const BONUS_MULTIPLIERS = {
  perfectCompletion: 1.5, // 50% bonus for completing all tasks perfectly
  speedBonus: 1.2, // 20% bonus for completing quickly
  noHints: 1.3, // 30% bonus for not using hints
};

/**
 * Get reward for mission completion
 */
export function getMissionReward(missionId: string): RewardDefinition | null {
  return MISSION_REWARDS[missionId] || null;
}

/**
 * Get reward for task completion
 */
export function getTaskReward(): RewardDefinition {
  return TASK_REWARDS;
}

/**
 * Calculate total reward for mission with bonuses
 */
export function calculateMissionReward(
  missionId: string,
  bonuses: {
    perfectCompletion?: boolean;
    speedBonus?: boolean;
    noHints?: boolean;
  } = {}
): number {
  const baseReward = getMissionReward(missionId);
  if (!baseReward) return 0;

  let total = baseReward.amount;
  let multiplier = 1.0;

  if (bonuses.perfectCompletion) {
    multiplier *= BONUS_MULTIPLIERS.perfectCompletion;
  }
  if (bonuses.speedBonus) {
    multiplier *= BONUS_MULTIPLIERS.speedBonus;
  }
  if (bonuses.noHints) {
    multiplier *= BONUS_MULTIPLIERS.noHints;
  }

  return Math.round(total * multiplier);
}

