/**
 * Discovery Store
 * Tracks what the player has discovered in the game world
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createLogger } from '../../../utils/logger';

const logger = createLogger('Discovery');
import { DNSRecord } from '../../network/dnsSimulation';

export type DiscoveryMethod = 'mission' | 'scan' | 'dns-lookup' | 'contact' | 'file-system';

interface DiscoveryState {
  // Discovered entities
  discoveredHosts: Set<string>;
  discoveredOrganizations: Set<string>;
  discoveredContacts: Set<string>;
  discoveredVendors: Set<string>;
  
  // DNS knowledge
  knownDNSRecords: Map<string, DNSRecord[]>;
  
  // Network scanning
  scannedIPRanges: Set<string>;
  
  // Actions
  discoverHost: (hostId: string, method: DiscoveryMethod) => void;
  discoverOrganization: (orgId: string, method?: DiscoveryMethod) => void;
  discoverContact: (contactId: string, method?: DiscoveryMethod) => void;
  discoverVendor: (vendorId: string, method?: DiscoveryMethod) => void;
  recordDNSLookup: (domain: string, records: DNSRecord[]) => void;
  recordScan: (ipRange: string, discoveredHosts: string[]) => void;
  isHostDiscovered: (hostId: string) => boolean;
  isOrganizationDiscovered: (orgId: string) => boolean;
  reset: () => void;
}

interface DiscoveryStatePersisted {
  discoveredHosts: string[];
  discoveredOrganizations: string[];
  discoveredContacts: string[];
  discoveredVendors: string[];
  knownDNSRecords: Array<[string, DNSRecord[]]>;
  scannedIPRanges: string[];
}

export const useDiscoveryStore = create<DiscoveryState>()(
  persist(
    (set, get) => ({
      discoveredHosts: new Set<string>(),
      discoveredOrganizations: new Set<string>(),
      discoveredContacts: new Set<string>(),
      discoveredVendors: new Set<string>(),
      knownDNSRecords: new Map<string, DNSRecord[]>(),
      scannedIPRanges: new Set<string>(),

      discoverHost: (hostId: string, method: DiscoveryMethod) => {
        set((state) => ({
          discoveredHosts: new Set(state.discoveredHosts).add(hostId),
        }));
        logger.debug(`Host ${hostId} discovered via ${method}`);
      },

      discoverOrganization: (orgId: string, method: DiscoveryMethod = 'mission') => {
        set((state) => ({
          discoveredOrganizations: new Set(state.discoveredOrganizations).add(orgId),
        }));
        logger.debug(`Organization ${orgId} discovered via ${method}`);
      },

      discoverContact: (contactId: string, method: DiscoveryMethod = 'mission') => {
        set((state) => ({
          discoveredContacts: new Set(state.discoveredContacts).add(contactId),
        }));
        logger.debug(`Contact ${contactId} discovered via ${method}`);
      },

      discoverVendor: (vendorId: string, method: DiscoveryMethod = 'mission') => {
        set((state) => ({
          discoveredVendors: new Set(state.discoveredVendors).add(vendorId),
        }));
        logger.debug(`Vendor ${vendorId} discovered via ${method}`);
      },

      recordDNSLookup: (domain: string, records: DNSRecord[]) => {
        set((state) => {
          const newMap = new Map(state.knownDNSRecords);
          newMap.set(domain.toLowerCase(), records);
          return { knownDNSRecords: newMap };
        });
      },

      recordScan: (ipRange: string, discoveredHosts: string[]) => {
        set((state) => {
          const newScanned = new Set(state.scannedIPRanges).add(ipRange);
          const newDiscovered = new Set(state.discoveredHosts);
          discoveredHosts.forEach(hostId => newDiscovered.add(hostId));
          
          return {
            scannedIPRanges: newScanned,
            discoveredHosts: newDiscovered,
          };
        });
      },

      isHostDiscovered: (hostId: string) => {
        return get().discoveredHosts.has(hostId);
      },

      isOrganizationDiscovered: (orgId: string) => {
        return get().discoveredOrganizations.has(orgId);
      },

      reset: () => {
        set({
          discoveredHosts: new Set<string>(),
          discoveredOrganizations: new Set<string>(),
          discoveredContacts: new Set<string>(),
          discoveredVendors: new Set<string>(),
          knownDNSRecords: new Map<string, DNSRecord[]>(),
          scannedIPRanges: new Set<string>(),
        });
      },
    }),
    {
      name: 'neoncloud-discovery',
      partialize: (state): DiscoveryStatePersisted => ({
        discoveredHosts: Array.from(state.discoveredHosts),
        discoveredOrganizations: Array.from(state.discoveredOrganizations),
        discoveredContacts: Array.from(state.discoveredContacts),
        discoveredVendors: Array.from(state.discoveredVendors),
        knownDNSRecords: Array.from(state.knownDNSRecords.entries()),
        scannedIPRanges: Array.from(state.scannedIPRanges),
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) return;
        
        const persisted = state as unknown as DiscoveryStatePersisted;
        (state as DiscoveryState).discoveredHosts = new Set(persisted.discoveredHosts || []);
        (state as DiscoveryState).discoveredOrganizations = new Set(persisted.discoveredOrganizations || []);
        (state as DiscoveryState).discoveredContacts = new Set(persisted.discoveredContacts || []);
        (state as DiscoveryState).discoveredVendors = new Set(persisted.discoveredVendors || []);
        (state as DiscoveryState).knownDNSRecords = new Map(persisted.knownDNSRecords || []);
        (state as DiscoveryState).scannedIPRanges = new Set(persisted.scannedIPRanges || []);
      },
    }
  )
);

