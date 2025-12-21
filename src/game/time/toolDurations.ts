/**
 * Tool Duration Definitions
 * 
 * Defines how long tools take to execute in real-time (seconds).
 * These durations will be accelerated by the speedup multiplier.
 * Durations are also affected by difficulty level (easy = faster, hard = slower).
 */

import { applyDurationMultiplier } from '../settings/difficultyConfig';
import { useGameSettingsStore } from '../state/useGameSettingsStore';

/**
 * Tool duration in real-time seconds
 * - basic: Duration for basic/premium version
 * - premium: Duration for premium/advanced version (if different)
 */
export interface ToolDuration {
  basic: number; // Real-time seconds
  premium?: number; // Real-time seconds (optional, defaults to basic if not specified)
}

/**
 * Tool durations in real-time seconds
 * These are realistic durations that will be accelerated by speedup
 */
export const TOOL_DURATIONS: Record<string, ToolDuration> = {
  // VPN connection time
  'vpn': {
    basic: 5,    // Basic VPN: 5 seconds
    premium: 2,  // Premium VPN: 2 seconds (faster connection)
  },
  
  // Password cracking time
  'password-cracker': {
    basic: 45,   // Basic cracker: 45 seconds
    premium: 15, // Advanced cracker: 15 seconds (faster brute force)
  },
  
  // Log shredding time
  'log-shredder': {
    basic: 10,   // Standard shredding: 10 seconds
    premium: 5,  // Advanced: 5 seconds (faster overwrite)
  },
  
  // Network analysis
  'network-analyzer': {
    basic: 20,   // Standard analysis: 20 seconds
    premium: 8,  // Advanced: 8 seconds (faster scanning)
  },
  
  // Firewall bypass
  'firewall-bypass': {
    basic: 30,   // Standard bypass: 30 seconds
    premium: 10, // Advanced: 10 seconds (faster scanning)
  },
  
  // Server connection (SSH)
  'connect': {
    basic: 3,    // Standard connection: 3 seconds
  },
  
  // File operations
  'file-read': {
    basic: 0.5,  // Reading files: 0.5 seconds (very fast, only show if > 1s game-time)
  },
};

/**
 * Get tool duration based on tool ID and version
 * @param toolId Tool identifier (e.g., 'vpn', 'password-cracker')
 * @param isPremium Whether the premium/advanced version is being used
 * @returns Duration in real-time seconds
 * 
 * NOTE: This function now checks tool modules first, then falls back to legacy TOOL_DURATIONS.
 * Prefer using tool modules directly.
 */
export function getToolDuration(toolId: string, isPremium: boolean = false): number {
  let baseDuration: number;
  
  // Use legacy duration definitions (tool modules handle their own durations)
  const duration = TOOL_DURATIONS[toolId];
  if (!duration) {
    console.warn(`Tool duration not found for: ${toolId}, using default 5s`);
    baseDuration = 5;
  } else {
    baseDuration = isPremium && duration.premium !== undefined ? duration.premium : duration.basic;
  }
  
  // Apply difficulty multiplier
  const difficulty = useGameSettingsStore.getState().difficulty;
  return applyDurationMultiplier(baseDuration, difficulty);
}

/**
 * Map inventory software IDs to tool IDs for duration lookup
 */
const SOFTWARE_TO_TOOL_MAP: Record<string, string> = {
  'vpn-basic': 'vpn',
  'vpn-premium': 'vpn',
  'password-cracker-basic': 'password-cracker',
  'password-cracker-advanced': 'password-cracker',
  'log-shredder': 'log-shredder',
  'network-analyzer': 'network-analyzer',
  'firewall-bypass': 'firewall-bypass',
};

/**
 * Check if a software ID is premium/advanced
 */
function isPremiumSoftware(softwareId: string): boolean {
  return softwareId.includes('premium') || 
         softwareId.includes('advanced') ||
         softwareId.includes('epic') ||
         softwareId.includes('legendary');
}

/**
 * Get tool duration from software ID
 * @param softwareId Software ID from inventory (e.g., 'vpn-basic', 'vpn-premium')
 * @returns Duration in real-time seconds
 * 
 * NOTE: This function now uses tool modules directly instead of mapping.
 */
export function getToolDurationFromSoftware(softwareId: string): number {
  // Map software ID to tool ID and use legacy durations
  // Tool modules handle their own durations when tools are executed
  const toolId = SOFTWARE_TO_TOOL_MAP[softwareId];
  let baseDuration: number;
  
  if (!toolId) {
    console.warn(`No tool mapping found for software: ${softwareId}, using default 5s`);
    baseDuration = 5;
  } else {
    const isPremium = isPremiumSoftware(softwareId);
    // Get base duration (before difficulty multiplier) from legacy
    const duration = TOOL_DURATIONS[toolId];
    if (!duration) {
      baseDuration = 5;
    } else {
      baseDuration = isPremium && duration.premium !== undefined ? duration.premium : duration.basic;
    }
  }
  
  // Apply difficulty multiplier
  const difficulty = useGameSettingsStore.getState().difficulty;
  return applyDurationMultiplier(baseDuration, difficulty);
}

