/**
 * Mission Ordering System
 * 
 * Automatically determines mission order and next missions based on:
 * - Category (Training=01, Script Kiddie=02, Cyber Warrior=03, Digital Ninja=04)
 * - Mission number within category (from filename: 01, 02, 03, etc.)
 * 
 * This eliminates the need for hardcoded `unlocks` arrays in mission modules.
 * When a new mission is added, it automatically fits into the ordering system.
 */

import { MissionModule } from './MissionModule';
import { missionRegistry } from './MissionModule';
import { MissionCategory } from '@/types';
import { createLogger } from '../../utils/logger';

const logger = createLogger('MissionOrdering');

/**
 * Category ordering (lower number = earlier in game)
 */
const CATEGORY_ORDER: Record<MissionCategory, number> = {
  'training': 1,
  'script-kiddie': 2,
  'cyber-warrior': 3,
  'digital-ninja': 4,
};

/**
 * Extract mission number from mission ID
 * Mission IDs follow pattern: {category-prefix}-{number}
 * Examples: welcome-00, tutorial-01, network-01, n00b-01, h4x0r-01, l33t-01
 */
function extractMissionNumber(missionId: string): number {
  // Extract number from end of mission ID
  const match = missionId.match(/-(\d+)$/);
  if (match) {
    return parseInt(match[1], 10);
  }
  // Fallback: try to extract from any number in the ID
  const numberMatch = missionId.match(/\d+/);
  return numberMatch ? parseInt(numberMatch[0], 10) : 999;
}

/**
 * Get category from mission module
 */
function getCategoryFromModule(module: MissionModule): MissionCategory {
  return module.mission.category || 'training';
}

/**
 * Compare two missions for ordering
 * Returns: negative if a comes before b, positive if a comes after b, 0 if equal
 */
function compareMissions(a: MissionModule, b: MissionModule): number {
  const categoryA = CATEGORY_ORDER[getCategoryFromModule(a)];
  const categoryB = CATEGORY_ORDER[getCategoryFromModule(b)];
  
  // First compare by category
  if (categoryA !== categoryB) {
    return categoryA - categoryB;
  }
  
  // Within same category, compare by mission number
  const numberA = extractMissionNumber(a.missionId);
  const numberB = extractMissionNumber(b.missionId);
  
  return numberA - numberB;
}

/**
 * Get all missions sorted by order
 */
export function getOrderedMissions(): MissionModule[] {
  const allMissions = missionRegistry.getAll();
  return [...allMissions].sort(compareMissions);
}

/**
 * Get the next mission after a given mission
 * Returns undefined if there is no next mission (last mission completed)
 */
export function getNextMission(currentMissionId: string): MissionModule | undefined {
  const orderedMissions = getOrderedMissions();
  const currentIndex = orderedMissions.findIndex(m => m.missionId === currentMissionId);
  
  if (currentIndex === -1) {
    logger.warn(`Mission not found in ordered list: ${currentMissionId}`);
    return undefined;
  }
  
  const nextIndex = currentIndex + 1;
  if (nextIndex >= orderedMissions.length) {
    // This is the last mission
    return undefined;
  }
  
  return orderedMissions[nextIndex];
}

/**
 * Get all missions that should be unlocked after completing a mission
 * This replaces the hardcoded `unlocks` array in mission modules
 */
export function getUnlockedMissionsAfterCompletion(completedMissionId: string): MissionModule[] {
  const nextMission = getNextMission(completedMissionId);
  
  if (!nextMission) {
    return []; // No more missions
  }
  
  // Return the next mission (and potentially more if they share the same prerequisites)
  // For now, we'll return just the immediate next mission
  // Future: Could return multiple missions if they have the same prerequisites
  return [nextMission];
}

/**
 * Check if a mission is the last mission in the game
 */
export function isLastMission(missionId: string): boolean {
  const orderedMissions = getOrderedMissions();
  const lastMission = orderedMissions[orderedMissions.length - 1];
  return lastMission?.missionId === missionId;
}

/**
 * Get mission order information for debugging/logging
 */
export function getMissionOrderInfo(): Array<{ id: string; category: MissionCategory; order: number }> {
  const orderedMissions = getOrderedMissions();
  return orderedMissions.map((module, index) => ({
    id: module.missionId,
    category: getCategoryFromModule(module),
    order: index + 1,
  }));
}

