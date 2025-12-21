/**
 * World Graph
 * Manages relationships between world entities
 */

import { worldRegistry } from '../registry/WorldRegistry';
import { Host } from '../types/Host';
import { Organization } from '../types/Organization';
import { Contact } from '../types/Contact';
import { NetworkConnection } from '../types/Host';

export interface Path {
  from: string;
  to: string;
  hops: string[];
}

export class WorldGraph {
  /**
   * Get all hosts owned by an organization
   */
  getHostsByOrganization(orgId: string): Host[] {
    const org = worldRegistry.getOrganization(orgId);
    if (!org) return [];
    
    return org.hostIds
      .map(hostId => worldRegistry.getHost(hostId))
      .filter((host): host is Host => host !== undefined);
  }

  /**
   * Get organization that owns a host
   */
  getOrganizationByHost(hostId: string): Organization | null {
    const host = worldRegistry.getHost(hostId);
    if (!host) return null;
    
    return worldRegistry.getOrganization(host.organizationId) || null;
  }

  /**
   * Get all contacts associated with an organization
   */
  getContactsByOrganization(orgId: string): Contact[] {
    const org = worldRegistry.getOrganization(orgId);
    if (!org) return [];
    
    return org.contactIds
      .map(contactId => worldRegistry.getContact(contactId))
      .filter((contact): contact is Contact => contact !== undefined);
  }

  /**
   * Get all hosts involved in a mission
   */
  getHostsByMission(missionId: string): Host[] {
    const allOrgs = worldRegistry.getAllOrganizations();
    const missionOrgs = allOrgs.filter(org => 
      org.missionIds?.includes(missionId)
    );
    
    const hostIds = new Set<string>();
    missionOrgs.forEach(org => {
      org.hostIds.forEach(hostId => hostIds.add(hostId));
    });
    
    return Array.from(hostIds)
      .map(hostId => worldRegistry.getHost(hostId))
      .filter((host): host is Host => host !== undefined);
  }

  /**
   * Get all organizations involved in a mission
   */
  getOrganizationsByMission(missionId: string): Organization[] {
    return worldRegistry.getAllOrganizations().filter(org =>
      org.missionIds?.includes(missionId)
    );
  }

  /**
   * Get all contacts associated with a mission
   */
  getContactsByMission(missionId: string): Contact[] {
    return worldRegistry.getAllContacts().filter(contact =>
      contact.missionIds?.includes(missionId)
    );
  }

  /**
   * Get hosts directly connected to a host via network
   */
  getConnectedHosts(hostId: string): Host[] {
    const host = worldRegistry.getHost(hostId);
    if (!host || !host.networkConnections) return [];
    
    return host.networkConnections
      .map(conn => worldRegistry.getHost(conn.hostId))
      .filter((h): h is Host => h !== undefined);
  }

  /**
   * Find network path between two hosts
   */
  findPath(fromHostId: string, toHostId: string): Path | null {
    const visited = new Set<string>();
    const queue: Array<{ hostId: string; path: string[] }> = [
      { hostId: fromHostId, path: [fromHostId] }
    ];
    
    while (queue.length > 0) {
      const { hostId, path } = queue.shift()!;
      
      if (hostId === toHostId) {
        return {
          from: fromHostId,
          to: toHostId,
          hops: path,
        };
      }
      
      if (visited.has(hostId)) continue;
      visited.add(hostId);
      
      const connectedHosts = this.getConnectedHosts(hostId);
      for (const connectedHost of connectedHosts) {
        if (!visited.has(connectedHost.id)) {
          queue.push({
            hostId: connectedHost.id,
            path: [...path, connectedHost.id],
          });
        }
      }
    }
    
    return null; // No path found
  }

  /**
   * Get all hosts in a network segment
   */
  getHostsByNetworkSegment(segment: string): Host[] {
    return worldRegistry.getAllHosts().filter(host =>
      host.networkSegment === segment
    );
  }

  /**
   * Get all hosts that can be discovered via a specific method
   */
  getHostsByDiscoveryMethod(method: string): Host[] {
    return worldRegistry.getAllHosts().filter(host =>
      host.discoveryMethods.includes(method as any)
    );
  }

  /**
   * Get vendors (organizations) that sell a specific tool
   */
  getVendorsByTool(toolId: string): Organization[] {
    return worldRegistry.getAllOrganizations().filter(org =>
      org.vendorInfo?.toolIds?.includes(toolId)
    );
  }

  /**
   * Get hosts in an IP range (for scanning validation)
   */
  getHostsByIPRange(ipRange: string): Host[] {
    // Simple check: if host IP starts with the base IP range prefix
    // For full CIDR validation, would need a proper IP range library
    const baseIP = ipRange.split('/')[0];
    const prefixParts = baseIP.split('.').slice(0, 3); // Get first 3 octets for /24
    
    return worldRegistry.getAllHosts().filter(host => {
      const hostIPParts = host.ipAddress.split('.');
      return hostIPParts.slice(0, 3).every((part, i) => part === prefixParts[i]);
    });
  }

  /**
   * Get all undiscovered hosts (for scan results, etc.)
   */
  getUndiscoveredHosts(discoveryStore: any): Host[] {
    return worldRegistry.getAllHosts().filter(host =>
      !discoveryStore.isHostDiscovered(host.id)
    );
  }

  /**
   * Get organization by domain name
   */
  findOrganizationByDomain(domain: string): Organization | null {
    const normalizedDomain = domain.toLowerCase();
    
    return worldRegistry.getAllOrganizations().find(org => {
      return (
        org.domain?.toLowerCase() === normalizedDomain ||
        org.publicDomain?.toLowerCase() === normalizedDomain ||
        org.internalDomain?.toLowerCase() === normalizedDomain
      ) || null;
    }) || null;
  }
}

// Singleton instance
export const worldGraph = new WorldGraph();

