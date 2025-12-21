/**
 * World Loader
 * Initializes and loads all world entities
 */

import { worldRegistry } from './registry/WorldRegistry';
import { createLogger } from '../../utils/logger';

// Import all entities
import { neoncloudOrg, megacorpOrg } from './entities/organizations';
import { agentSmithContact } from './entities/contacts';
import { localhostHost, server01Host, server02Host } from './entities/hosts';

const logger = createLogger('WorldLoader');

/**
 * Load all world entities into the registry
 */
export function loadWorldEntities(): void {
  // Clear existing entities (for hot reload in development)
  if (import.meta.env?.DEV) {
    worldRegistry.clear();
  }

  // Register organizations
  worldRegistry.registerOrganization(neoncloudOrg);
  worldRegistry.registerOrganization(megacorpOrg);

  // Register contacts
  worldRegistry.registerContact(agentSmithContact);

  // Register hosts
  worldRegistry.registerHost(localhostHost);
  worldRegistry.registerHost(server01Host);
  worldRegistry.registerHost(server02Host);

      logger.debug('Loaded world entities', {
        organizations: worldRegistry.getAllOrganizations().length,
        contacts: worldRegistry.getAllContacts().length,
        hosts: worldRegistry.getAllHosts().length,
      });
}

/**
 * Initialize discovery state for known entities
 * (e.g., NeonCloud organization and contacts should be known from start)
 */
export function initializeDiscoveryState(): void {
  // Import dynamically to avoid circular dependencies
  import('./discovery/DiscoveryStore').then(({ useDiscoveryStore }) => {
    const discoveryStore = useDiscoveryStore.getState();

    // Mark NeonCloud as known (player's employer)
    discoveryStore.discoverOrganization('neoncloud', 'mission');
    discoveryStore.discoverContact('agent-smith', 'mission');
  });
}

