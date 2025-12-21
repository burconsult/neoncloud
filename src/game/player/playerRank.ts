import { MissionCategory } from '@/types';
import { useMissionStore } from '../state/useMissionStore';
import { getAllMissions } from '../missions/missionDefinitions';

export type PlayerRank = 
  | 'Trainee'           // Just started, only training missions
  | 'Script Kiddie'     // Completed training, started n00b missions
  | 'Cyber Warrior'     // Completed n00b missions, started h4x0r missions
  | 'Digital Ninja';    // Completed h4x0r missions, started l33t missions

export interface PlayerRankInfo {
  rank: PlayerRank;
  category: MissionCategory;
  description: string;
}

/**
 * Get the player's current rank based on completed missions
 */
export function getPlayerRank(): PlayerRankInfo {
  const missionStore = useMissionStore.getState();
  const completedMissions = missionStore.completedMissions;
  const allMissions = getAllMissions();

  // Count completed missions by category
  const completedByCategory: Record<MissionCategory, number> = {
    'training': 0,
    'script-kiddie': 0,
    'cyber-warrior': 0,
    'digital-ninja': 0,
  };

  completedMissions.forEach(missionId => {
    const mission = allMissions.find(m => m.id === missionId);
    if (mission) {
      completedByCategory[mission.category]++;
    }
  });

  // Count total missions by category
  const totalByCategory: Record<MissionCategory, number> = {
    'training': 0,
    'script-kiddie': 0,
    'cyber-warrior': 0,
    'digital-ninja': 0,
  };

  allMissions.forEach(mission => {
    totalByCategory[mission.category]++;
  });

  // Determine rank based on completed mission categories
  // Player advances rank when they complete ALL missions in a category
  // Priority: digital-ninja > cyber-warrior > script-kiddie > training
  
  // Check if all digital-ninja missions are completed
  if (totalByCategory['digital-ninja'] > 0 && 
      completedByCategory['digital-ninja'] >= totalByCategory['digital-ninja']) {
    return {
      rank: 'Digital Ninja',
      category: 'digital-ninja',
      description: 'Master of cyber operations',
    };
  }
  
  // Check if all cyber-warrior missions are completed
  if (totalByCategory['cyber-warrior'] > 0 && 
      completedByCategory['cyber-warrior'] >= totalByCategory['cyber-warrior']) {
    return {
      rank: 'Cyber Warrior',
      category: 'cyber-warrior',
      description: 'Experienced hacker',
    };
  }
  
  // Check if all training missions are completed - advance to Script Kiddie
  if (totalByCategory['training'] > 0 && 
      completedByCategory['training'] >= totalByCategory['training']) {
    return {
      rank: 'Script Kiddie',
      category: 'script-kiddie',
      description: 'Training complete - Ready for real missions',
    };
  }
  
  // Check if any script-kiddie missions are completed
  if (completedByCategory['script-kiddie'] > 0) {
    return {
      rank: 'Script Kiddie',
      category: 'script-kiddie',
      description: 'Beginner hacker',
    };
  }
  
  // Default: Trainee (in progress with training)
  return {
    rank: 'Trainee',
    category: 'training',
    description: 'Learning the basics',
  };
}

