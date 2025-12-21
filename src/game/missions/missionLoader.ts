import { missionRegistry } from './MissionModule';
import { Mission } from '@/types';
import { useEmailStore } from '../state/useEmailStore';
import { useLoreStore } from '../state/useLoreStore';
import { welcomeMissionModule } from './modules/01_01_welcome';
import { terminalNavigationMissionModule } from './modules/01_02_terminal_navigation';
import { networkConnectivityMissionModule } from './modules/01_03_network_connectivity';
import { networkTopologyMissionModule } from './modules/01_04_network_topology';
import { dnsExplorationMissionModule } from './modules/01_05_dns_exploration';
import { firstHackMissionModule } from './modules/02_01_first_hack';
import { dataExtractionMissionModule } from './modules/02_02_data_extraction';

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
  
  // Cyber Warrior missions (03)
  // TODO: Add cyber warrior missions here
  
  // Digital Ninja missions (04)
  // TODO: Add digital ninja missions here
}

/**
 * Initialize a mission when it starts
 * Handles emails, lore, file system, etc.
 */
export async function initializeMission(missionId: string): Promise<void> {
  const module = missionRegistry.get(missionId);
  if (!module) {
    console.warn(`Mission module not found: ${missionId}`);
    return;
  }

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
    // TODO: Implement file system merging logic
    // For now, file systems are static - this is a placeholder for future enhancement
    console.log(`File system additions for ${missionId} would be applied here`);
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

