/**
 * Category Utilities
 * 
 * Utilities for mission categories including colors, star ratings, and completion tracking
 */

import { MissionCategory } from '@/types';
import { getAllMissions } from './missionLoader';
import { useMissionStore } from '../state/useMissionStore';

/**
 * Category color scheme - consistent across the app
 */
export const CATEGORY_COLORS: Record<MissionCategory, string> = {
  'training': '#00d4ff',      // Cyan - beginner friendly
  'script-kiddie': '#ff6b00',  // Orange - energetic
  'cyber-warrior': '#9d00ff',  // Purple - powerful
  'digital-ninja': '#ff0066',  // Pink/Magenta - elite
};

/**
 * Category display names
 */
export const CATEGORY_NAMES: Record<MissionCategory, string> = {
  'training': 'Training',
  'script-kiddie': 'Script Kiddie',
  'cyber-warrior': 'Cyber Warrior',
  'digital-ninja': 'Digital Ninja',
};

/**
 * Star rating for each category (1-4 stars)
 */
export const CATEGORY_STARS: Record<MissionCategory, number> = {
  'training': 1,
  'script-kiddie': 2,
  'cyber-warrior': 3,
  'digital-ninja': 4,
};

/**
 * Get star rating for a category
 */
export function getCategoryStars(category: MissionCategory): number {
  return CATEGORY_STARS[category];
}

/**
 * Get color for a category
 */
export function getCategoryColor(category: MissionCategory): string {
  return CATEGORY_COLORS[category];
}

/**
 * Get display name for a category
 */
export function getCategoryName(category: MissionCategory): string {
  return CATEGORY_NAMES[category];
}

/**
 * Check if all missions in a category are completed
 */
export function isCategoryComplete(category: MissionCategory): boolean {
  const allMissions = getAllMissions();
  const missionStore = useMissionStore.getState();
  const completedMissions = missionStore.completedMissions || [];
  
  const categoryMissions = allMissions.filter(m => m.category === category);
  if (categoryMissions.length === 0) return false;
  
  return categoryMissions.every(mission => completedMissions.includes(mission.id));
}

/**
 * Get category completion stats
 */
export function getCategoryStats(category: MissionCategory): {
  completed: number;
  total: number;
  percentage: number;
  isComplete: boolean;
} {
  const allMissions = getAllMissions();
  const missionStore = useMissionStore.getState();
  const completedMissions = missionStore.completedMissions || [];
  
  const categoryMissions = allMissions.filter(m => m.category === category);
  const completed = categoryMissions.filter(m => completedMissions.includes(m.id)).length;
  const total = categoryMissions.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return {
    completed,
    total,
    percentage,
    isComplete: completed === total && total > 0,
  };
}

/**
 * Get the category that was just completed (if any)
 */
export function getJustCompletedCategory(completedMissionId: string): MissionCategory | null {
  const allMissions = getAllMissions();
  const mission = allMissions.find(m => m.id === completedMissionId);
  if (!mission) return null;
  
  const category = mission.category;
  if (isCategoryComplete(category)) {
    return category;
  }
  
  return null;
}

