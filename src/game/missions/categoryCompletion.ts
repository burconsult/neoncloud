/**
 * Category Completion Detection
 * 
 * Detects when a mission category is completed and triggers appropriate events
 */

import { MissionCategory } from '@/types';
import { getAllMissions } from './missionLoader';
import { useMissionStore } from '../state/useMissionStore';
import { isCategoryComplete } from './categoryUtils';
import { eventBus } from '../events/eventBus';

/**
 * Check if a category was just completed and emit event
 */
export function checkCategoryCompletion(completedMissionId: string): MissionCategory | null {
  const allMissions = getAllMissions();
  const mission = allMissions.find(m => m.id === completedMissionId);
  if (!mission) return null;
  
  const category = mission.category;
  
  // Check if this category is now complete
  if (isCategoryComplete(category)) {
    // Emit category completion event
    eventBus.emit({
      type: 'category:completed',
      category,
      missionId: completedMissionId,
      timestamp: Date.now(),
    });
    
    return category;
  }
  
  return null;
}

/**
 * Get all missions in a category
 */
export function getMissionsByCategory(category: MissionCategory): string[] {
  const allMissions = getAllMissions();
  return allMissions
    .filter(m => m.category === category)
    .map(m => m.id);
}

