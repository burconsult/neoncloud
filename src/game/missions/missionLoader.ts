import { missionRegistry } from './MissionModule';
import { Mission, MissionCategory } from '@/types';
import { useEmailStore } from '../state/useEmailStore';
import { useLoreStore } from '../state/useLoreStore';
import { createLogger } from '../../utils/logger';
import { welcomeMissionModule } from './modules/01_01_welcome';

const logger = createLogger('MissionLoader');
import { terminalNavigationMissionModule } from './modules/01_02_terminal_navigation';
import { networkConnectivityMissionModule } from './modules/01_03_network_connectivity';
import { networkTopologyMissionModule } from './modules/01_04_network_topology';
import { dnsExplorationMissionModule } from './modules/01_05_dns_exploration';
import { firstHackMissionModule } from './modules/02_01_first_hack';
import { dataExtractionMissionModule } from './modules/02_02_data_extraction';
import { networkInvestigationMissionModule } from './modules/02_03_network_investigation';
import { advancedPenetrationMissionModule } from './modules/03_01_advanced_penetration';

/**
 * Load all mission modules
 * This function imports and registers all mission modules
 * 
 * File naming convention: {category_number}_{mission_number}_{mission_name}.ts
 * Category numbers: Training=01, Script Kiddie=02, Cyber Warrior=03, Digital Ninja=04
 * 
 * To add a new mission:
 * 1. Create a new file in src/game/missions/modules/ following the naming convention
 * 2. Export a MissionModule object
 * 3. Import it here and register it
 */
export function loadMissionModules(): void {
  // Clear existing modules to prevent duplicates on hot reload in development
  if (import.meta.env.DEV) {
    missionRegistry.clear();
  }

  // Training missions (01)
  missionRegistry.register(welcomeMissionModule); // 01_01_welcome
  missionRegistry.register(terminalNavigationMissionModule); // 01_02_terminal_navigation
  missionRegistry.register(networkConnectivityMissionModule); // 01_03_network_connectivity
  missionRegistry.register(networkTopologyMissionModule); // 01_04_network_topology
  missionRegistry.register(dnsExplorationMissionModule); // 01_05_dns_exploration
  
  // Script Kiddie missions (02)
  missionRegistry.register(firstHackMissionModule); // 02_01_first_hack
  missionRegistry.register(dataExtractionMissionModule); // 02_02_data_extraction
  missionRegistry.register(networkInvestigationMissionModule); // 02_03_network_investigation
  
  // Cyber Warrior missions (03)
  missionRegistry.register(advancedPenetrationMissionModule); // 03_01_advanced_penetration
  
  // Digital Ninja missions (04)
  // Future missions will be added here
}

/**
 * Initialize a mission when it starts
 * Handles emails, lore, file system, world entity discovery, etc.
 */
export async function initializeMission(missionId: string): Promise<void> {
      const module = missionRegistry.get(missionId);
      if (!module) {
        logger.warn(`Mission module not found: ${missionId}`);
        return;
      }

  // Discover world entities associated with this mission
  const { worldGraph } = await import('../world/graph/WorldGraph');
  const { useDiscoveryStore } = await import('../world/discovery/DiscoveryStore');
  const discoveryStore = useDiscoveryStore.getState();
  
  // Discover organizations involved in this mission
  const missionOrgs = worldGraph.getOrganizationsByMission(missionId);
  missionOrgs.forEach(org => {
    if (!discoveryStore.isOrganizationDiscovered(org.id)) {
      discoveryStore.discoverOrganization(org.id, 'mission');
    }
  });
  
  // Discover hosts involved in this mission
  const missionHosts = worldGraph.getHostsByMission(missionId);
  missionHosts.forEach(host => {
    if (!discoveryStore.isHostDiscovered(host.id)) {
      discoveryStore.discoverHost(host.id, 'mission');
    }
  });
  
  // Discover contacts involved in this mission
  const missionContacts = worldGraph.getContactsByMission(missionId);
  missionContacts.forEach(contact => {
    if (!discoveryStore.discoveredContacts.has(contact.id)) {
      discoveryStore.discoverContact(contact.id, 'mission');
    }
  });

  // Send start emails (duplicate prevention handled by emailStore.addEmail)
  if (module.startEmails && module.startEmails.length > 0) {
    const emailStore = useEmailStore.getState();
    module.startEmails.forEach(email => {
      emailStore.addEmail(email);
    });
  }

  // Unlock lore entries
  if (module.unlockLore && module.unlockLore.length > 0) {
    const loreStore = useLoreStore.getState();
    module.unlockLore.forEach(lore => {
      loreStore.unlockEntry(lore);
    });
  }

  // Add file system changes
  if (module.fileSystemAdditions) {
    // File system additions are handled by server-specific file systems
    // See serverFileSystems.ts for implementation
  }

  // Call custom initialization
  if (module.onStart) {
    await module.onStart();
  }
}

/**
 * Handle mission completion
 * Handles completion emails, cleanup, etc.
 */
export async function finalizeMission(missionId: string): Promise<void> {
  const module = missionRegistry.get(missionId);
  if (!module) {
    return;
  }

  // Send completion emails
  if (module.completionEmails && module.completionEmails.length > 0) {
    const emailStore = useEmailStore.getState();
    module.completionEmails.forEach(email => {
      emailStore.addEmail(email);
    });
  }

  // Call custom completion logic
  if (module.onComplete) {
    await module.onComplete();
  }
}

/**
 * Get mission by ID from registry
 */
export function getMissionById(missionId: string): Mission | undefined {
  const module = missionRegistry.get(missionId);
  return module?.mission;
}

/**
 * Get all missions from registry
 */
export function getAllMissions(): Mission[] {
  return missionRegistry.getAllMissions();
}

/**
 * Get all mission categories
 */
export function getMissionCategories(): MissionCategory[] {
  return ['training', 'script-kiddie', 'cyber-warrior', 'digital-ninja'];
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: MissionCategory): string {
  const names: Record<MissionCategory, string> = {
    'training': 'Training',
    'script-kiddie': 'Script Kiddie (n00b)',
    'cyber-warrior': 'Cyber Warrior (h4x0r)',
    'digital-ninja': 'Digital Ninja (l33t)',
  };
  return names[category];
}

