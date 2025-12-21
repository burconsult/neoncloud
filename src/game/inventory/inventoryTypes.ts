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
  icon?: string;
  requirements?: {
    completedMissions?: string[];
    minimumLevel?: number;
  };
  effects?: {
    unlockCommands?: string[];
    increaseStorage?: number;
    reduceLatency?: number;
    enableFeatures?: string[];
  };
}

/**
 * Software catalog - items available for purchase
 * 
 * NOTE: This catalog is now built from tool modules.
 * Individual tool modules define their software.
 * This array is kept for backward compatibility but should eventually be removed.
 * Use getAllSoftwareFromTools() from toolLoader instead.
 */
export const SOFTWARE_CATALOG: Software[] = [
  // Network Tools
  {
    id: 'vpn-basic',
    name: 'Basic VPN',
    description: 'Encrypt your connection and hide your IP address. Essential for secure operations.',
    category: 'network',
    rarity: 'common',
    price: 200,
    requirements: {
      completedMissions: ['tutorial-01'],
    },
    effects: {
      enableFeatures: ['vpn-connect', 'ip-masking'],
    },
  },
  {
    id: 'vpn-premium',
    name: 'Premium VPN',
    description: 'Advanced VPN with multiple server locations and faster speeds.',
    category: 'network',
    rarity: 'uncommon',
    price: 500,
    requirements: {
      completedMissions: ['network-01'],
    },
    effects: {
      enableFeatures: ['vpn-connect', 'ip-masking', 'server-selection'],
      reduceLatency: 20,
    },
  },
  {
    id: 'network-analyzer',
    name: 'Network Analyzer',
    description: 'Advanced network analysis tools for deep packet inspection.',
    category: 'network',
    rarity: 'rare',
    price: 1000,
    requirements: {
      completedMissions: ['network-02'],
    },
    effects: {
      unlockCommands: ['analyze', 'packet-capture'],
    },
  },

  // Security Tools
  {
    id: 'password-cracker-basic',
    name: 'Basic Password Cracker',
    description: 'Simple brute-force password cracking tool. Slow but effective.',
    category: 'security',
    rarity: 'common',
    price: 300,
    requirements: {
      completedMissions: ['tutorial-01'],
    },
    effects: {
      unlockCommands: ['crack'],
    },
  },
  {
    id: 'password-cracker-advanced',
    name: 'Advanced Password Cracker',
    description: 'Fast dictionary and rainbow table attacks. Much faster than basic version.',
    category: 'security',
    rarity: 'uncommon',
    price: 750,
    requirements: {
      completedMissions: ['network-01'],
    },
    effects: {
      unlockCommands: ['crack', 'dictionary-attack', 'rainbow-table'],
    },
  },
  {
    id: 'firewall-bypass',
    name: 'Firewall Bypass Tool',
    description: 'Advanced tool to bypass network firewalls and security measures.',
    category: 'security',
    rarity: 'rare',
    price: 1500,
    requirements: {
      completedMissions: ['network-02'],
    },
    effects: {
      unlockCommands: ['bypass-firewall'],
      enableFeatures: ['stealth-mode'],
    },
  },
  {
    id: 'encryption-suite',
    name: 'Encryption Suite',
    description: 'Professional encryption and decryption tools for secure communications.',
    category: 'security',
    rarity: 'epic',
    price: 2500,
    requirements: {
      completedMissions: ['network-03'],
    },
    effects: {
      unlockCommands: ['encrypt', 'decrypt', 'keygen'],
    },
  },

  // Storage
  {
    id: 'storage-upgrade-1',
    name: 'Storage Upgrade I',
    description: 'Increase your storage capacity by 50%.',
    category: 'storage',
    rarity: 'common',
    price: 150,
    effects: {
      increaseStorage: 50,
    },
  },
  {
    id: 'storage-upgrade-2',
    name: 'Storage Upgrade II',
    description: 'Double your storage capacity.',
    category: 'storage',
    rarity: 'uncommon',
    price: 400,
    requirements: {
      completedMissions: ['tutorial-01'],
    },
    effects: {
      increaseStorage: 100,
    },
  },
  {
    id: 'storage-upgrade-3',
    name: 'Storage Upgrade III',
    description: 'Massive storage expansion. 5x your original capacity.',
    category: 'storage',
    rarity: 'rare',
    price: 1200,
    requirements: {
      completedMissions: ['network-01'],
    },
    effects: {
      increaseStorage: 500,
    },
  },

  // Analysis Tools
  {
    id: 'log-analyzer',
    name: 'Log Analyzer',
    description: 'Analyze system logs and find security vulnerabilities.',
    category: 'analysis',
    rarity: 'uncommon',
    price: 600,
    requirements: {
      completedMissions: ['network-01'],
    },
    effects: {
      unlockCommands: ['analyze-logs'],
    },
  },
  {
    id: 'vulnerability-scanner',
    name: 'Vulnerability Scanner',
    description: 'Scan systems for known vulnerabilities and security holes.',
    category: 'analysis',
    rarity: 'rare',
    price: 1800,
    requirements: {
      completedMissions: ['network-02'],
    },
    effects: {
      unlockCommands: ['scan-vuln'],
    },
  },

  // Utility
  {
    id: 'auto-script',
    name: 'Automation Script',
    description: 'Automate repetitive tasks with custom scripts.',
    category: 'utility',
    rarity: 'common',
    price: 250,
    requirements: {
      completedMissions: ['tutorial-01'],
    },
    effects: {
      enableFeatures: ['scripting'],
    },
  },
  {
    id: 'multi-tool',
    name: 'Multi-Tool Suite',
    description: 'Collection of useful utilities for various tasks.',
    category: 'utility',
    rarity: 'uncommon',
    price: 550,
    requirements: {
      completedMissions: ['network-01'],
    },
    effects: {
      unlockCommands: ['batch', 'schedule'],
    },
  },
  {
    id: 'log-shredder',
    name: 'Log Shredder',
    description: 'Securely delete log files to cover your tracks. Essential for stealth operations.',
    category: 'utility',
    rarity: 'uncommon',
    price: 450,
    requirements: {
      completedMissions: ['n00b-01'],
    },
    effects: {
      unlockCommands: ['shred', 'clear-logs'],
      enableFeatures: ['log-deletion'],
    },
  },
];

/**
 * Get software by ID
 * 
 * NOTE: This function now checks both the legacy SOFTWARE_CATALOG
 * and the new tool modules. Prefer using tool modules.
 */
export function getSoftwareById(id: string): Software | undefined {
  // For now, just use legacy catalog
  // Tool modules are checked in useInventoryStore.purchaseSoftware directly
  // This avoids circular dependency issues
  return SOFTWARE_CATALOG.find(software => software.id === id);
}

/**
 * Get available software based on player progress and ownership
 * Premium versions are available if basic version is owned OR if mission requirements are met
 * 
 * NOTE: This function now checks both the legacy SOFTWARE_CATALOG
 * and the new tool modules. Prefer using getAllSoftwareFromTools() from toolLoader.
 */
export function getAvailableSoftware(
  completedMissions: string[],
  ownedSoftwareIds: string[] = []
): Software[] {
  // Get software from tool modules (new system)
  // Note: We can't dynamically import here due to circular dependencies
  // Tool modules should already be loaded in main.tsx before this is called
  // For now, we'll use the legacy catalog and tool modules will override via registry
  // TODO: Refactor to properly merge tool modules and legacy catalog
  
  return SOFTWARE_CATALOG.filter(software => {
    // Define upgrade paths: premium versions that require basic versions
    const upgradePaths: Record<string, string> = {
      'vpn-premium': 'vpn-basic',
      'password-cracker-advanced': 'password-cracker-basic',
      'storage-upgrade-2': 'storage-upgrade-1',
      'storage-upgrade-3': 'storage-upgrade-2',
    };

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

