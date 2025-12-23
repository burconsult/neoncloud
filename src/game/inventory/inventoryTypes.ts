/**
 * Inventory and software types
 */

export type SoftwareCategory = 
  | 'network'
  | 'security'
  | 'storage'
  | 'analysis'
  | 'utility';

export type SoftwareRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Software {
  id: string;
  name: string;
  description: string;
  category: SoftwareCategory;
  rarity: SoftwareRarity;
  price: number;
  storageSize?: number; // Storage space required (in units). Defaults to 10 if not specified
  icon?: string;
  requirements?: {
    completedMissions?: string[];
    minimumLevel?: number;
  };
  effects?: {
    unlockCommands?: string[];
    increaseStorage?: number; // For storage upgrades - increases capacity
    reduceLatency?: number;
    enableFeatures?: string[];
  };
}

/**
 * Software catalog - items available for purchase
 * 
 * NOTE: Tool definitions are now in tool modules (see toolLoader.ts).
 * This catalog only contains non-tool items like storage upgrades.
 * 
 * Tools (VPN, Password Cracker, Log Shredder, Network Scanner) are defined
 * in their respective tool modules under src/game/tools/modules/
 */
export const SOFTWARE_CATALOG: Software[] = [
  // Storage Upgrades (not tools, just inventory upgrades)

  // Storage Upgrades (these take no storage space themselves, they increase capacity)
  // All values are in TB (Terabytes)
  {
    id: 'storage-upgrade-1',
    name: 'Storage Upgrade I',
    description: 'Add 0.5 TB to your storage capacity.',
    category: 'storage',
    rarity: 'common',
    price: 150,
    storageSize: 0, // Upgrades don't take storage space
    requirements: {
      completedMissions: ['tutorial-01'],
    },
    effects: {
      increaseStorage: 50, // 0.5 TB (internal: 50 units = 0.5 TB)
    },
  },
  {
    id: 'storage-upgrade-2',
    name: 'Storage Upgrade II',
    description: 'Add 1 TB to your storage capacity.',
    category: 'storage',
    rarity: 'uncommon',
    price: 400,
    storageSize: 0, // Upgrades don't take storage space
    requirements: {
      completedMissions: ['network-01'],
    },
    effects: {
      increaseStorage: 100, // 1 TB (internal: 100 units = 1 TB)
    },
  },
  {
    id: 'storage-upgrade-3',
    name: 'Storage Upgrade III',
    description: 'Add 5 TB to your storage capacity.',
    category: 'storage',
    rarity: 'rare',
    price: 1200,
    storageSize: 0, // Upgrades don't take storage space
    requirements: {
      completedMissions: ['n00b-01'],
    },
    effects: {
      increaseStorage: 500, // 5 TB (internal: 500 units = 5 TB)
    },
  },

];

/**
 * Get software by ID
 * 
 * NOTE: This function only checks the minimal SOFTWARE_CATALOG (storage upgrades).
 * Tool modules are checked separately in useInventoryStore.purchaseSoftware.
 * 
 * For tools, use toolRegistry.getBySoftwareId() from ToolModule.ts
 */
export function getSoftwareById(id: string): Software | undefined {
  // Only check non-tool catalog items (storage upgrades, etc.)
  return SOFTWARE_CATALOG.find(software => software.id === id);
}

/**
 * Get available software based on player progress and ownership
 * Premium versions are available if basic version is owned OR if mission requirements are met
 * 
 * NOTE: This function only returns non-tool items (storage upgrades).
 * Tool modules are checked separately via getAllSoftwareFromTools() from toolLoader.
 */
export function getAvailableSoftware(
  completedMissions: string[],
  ownedSoftwareIds: string[] = []
): Software[] {
  // Only return non-tool catalog items (storage upgrades, etc.)
  // Tools are handled by tool modules
  
  // Note: Upgrade paths for tools are handled in tool modules
  // Storage upgrade paths are hardcoded here since they're not tool modules
  const storageUpgradePaths: Record<string, string> = {
    'storage-upgrade-2': 'storage-upgrade-1',
    'storage-upgrade-3': 'storage-upgrade-2',
  };
  
  // For tools, check tool modules dynamically (async would be cleaner but this function is sync)
  // For now, we'll handle tool upgrade paths in the UI/store layer where we have access to tool modules
  
  return SOFTWARE_CATALOG.filter(software => {
    // Use storage upgrade paths (tool upgrade paths handled separately)
    const upgradePaths = storageUpgradePaths;

    // Check if this is a premium/upgrade version
    const basicVersionId = upgradePaths[software.id];
    
    // If it's an upgrade version and player owns the basic version, show it
    if (basicVersionId && ownedSoftwareIds.includes(basicVersionId)) {
      return true;
    }

    // If already owned, don't show (or show as owned - we'll handle this in UI)
    // Actually, let's show owned items so players can see what they have
    
    // Check mission requirements
    if (!software.requirements) {
      return true; // No requirements, always available
    }
    
    if (software.requirements.completedMissions) {
      return software.requirements.completedMissions.every(missionId =>
        completedMissions.includes(missionId)
      );
    }
    
    return true;
  });
}

