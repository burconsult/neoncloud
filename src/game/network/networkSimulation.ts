/**
 * Network simulation system for educational network commands
 * Simulates network hosts, IPs, and connectivity
 * Now integrated with world registry for host information
 */

import { worldRegistry } from '../world/registry/WorldRegistry';
import { useDiscoveryStore } from '../world/discovery/DiscoveryStore';
import { worldGraph } from '../world/graph/WorldGraph';

export interface NetworkHost {
  name: string;
  ip: string;
  domain?: string;
  isOnline: boolean;
  baseLatency: number; // Base latency in ms
  description?: string;
}

export interface PingResult {
  success: boolean;
  host: string;
  ip: string;
  time: number;
  ttl?: number;
  packetLoss?: number;
  sequence?: number;
}

export interface TracerouteHop {
  hop: number;
  ip: string;
  hostname?: string;
  time: number;
  time2?: number;
  time3?: number;
}

/**
 * Convert world registry Host to NetworkHost format
 */
function convertHostToNetworkHost(host: any): NetworkHost {
  return {
    name: host.name,
    ip: host.ipAddress,
    domain: host.domainName,
    isOnline: host.isOnline !== undefined ? host.isOnline : true,
    baseLatency: host.baseLatency !== undefined ? host.baseLatency : 10,
    description: host.description,
  };
}

/**
 * Legacy network hosts for educational purposes (gateway, dns servers, etc.)
 * These are kept for backward compatibility with existing missions
 */
const legacyNetworkHosts: NetworkHost[] = [
  {
    name: 'gateway',
    ip: '192.168.1.1',
    domain: 'gateway.local',
    isOnline: true,
    baseLatency: 5,
    description: 'Network gateway/router',
  },
  {
    name: 'dns-server',
    ip: '8.8.8.8',
    domain: 'dns.google',
    isOnline: true,
    baseLatency: 15,
    description: 'Google DNS server',
  },
  {
    name: 'cloudflare-dns',
    ip: '1.1.1.1',
    domain: 'one.one.one.one',
    isOnline: true,
    baseLatency: 12,
    description: 'Cloudflare DNS server',
  },
  {
    name: 'example-server',
    ip: '93.184.216.34',
    domain: 'example.com',
    isOnline: true,
    baseLatency: 45,
    description: 'Example web server',
  },
];

/**
 * Find a host by name, IP, or domain
 * First checks world registry, then falls back to legacy hosts
 * Also resolves organization domains through the graph system
 */
export function findHost(query: string): NetworkHost | null {
  const lowerQuery = query.toLowerCase().trim();
  
  // First, try to find host in world registry by name, IP, or domain
  const worldHost = 
    worldRegistry.getHost(lowerQuery) ||
    worldRegistry.findHostByIP(query) ||
    worldRegistry.findHostByDomain(lowerQuery);
  
  if (worldHost) {
    // Discover host if not already discovered
    const discoveryStore = useDiscoveryStore.getState();
    if (!discoveryStore.isHostDiscovered(worldHost.id)) {
      discoveryStore.discoverHost(worldHost.id, 'scan'); // Using 'scan' as default discovery method
    }
    
    return convertHostToNetworkHost(worldHost);
  }
  
  // Try to resolve organization domain through graph system
  // This allows ping/nslookup megacorp.com to work
  const org = worldGraph.findOrganizationByDomain(lowerQuery);
  if (org) {
    // Find the organization's web server or primary host that matches this domain
    const orgHosts = worldGraph.getHostsByOrganization(org.id);
    const domainHost = orgHosts.find(h => 
      h.domainName?.toLowerCase() === lowerQuery
    );
    
    if (domainHost) {
      // Discover organization and host
      const discoveryStore = useDiscoveryStore.getState();
      if (!discoveryStore.isOrganizationDiscovered(org.id)) {
        discoveryStore.discoverOrganization(org.id, 'dns-lookup');
      }
      if (!discoveryStore.isHostDiscovered(domainHost.id)) {
        discoveryStore.discoverHost(domainHost.id, 'dns-lookup');
      }
      
      return convertHostToNetworkHost(domainHost);
    }
    
    // If no specific host found, use the first host as fallback
    // Or create a synthetic host for the organization domain
    if (org.hostIds && org.hostIds.length > 0) {
      const primaryHost = worldRegistry.getHost(org.hostIds[0]);
      if (primaryHost) {
        // Discover organization
        const discoveryStore = useDiscoveryStore.getState();
        if (!discoveryStore.isOrganizationDiscovered(org.id)) {
          discoveryStore.discoverOrganization(org.id, 'dns-lookup');
        }
        
        // Return a NetworkHost with the organization domain
        return {
          name: org.displayName || org.name,
          ip: primaryHost.ipAddress,
          domain: org.publicDomain || org.domain || lowerQuery,
          isOnline: primaryHost.isOnline !== undefined ? primaryHost.isOnline : true,
          baseLatency: primaryHost.baseLatency !== undefined ? primaryHost.baseLatency : 25,
          description: `${org.displayName || org.name} web server`,
        };
      }
    }
  }
  
  // Fall back to legacy network hosts
  const legacyHost = legacyNetworkHosts.find(
    (host) =>
      host.name.toLowerCase() === lowerQuery ||
      host.ip === query ||
      host.domain?.toLowerCase() === lowerQuery
  );
  
  return legacyHost || null;
}

/**
 * Simulate ping to a host
 */
export function simulatePing(
  host: NetworkHost,
  count: number = 4
): PingResult[] {
  const results: PingResult[] = [];
  
  if (!host.isOnline) {
    // Simulate timeout for offline hosts
    for (let i = 0; i < count; i++) {
      results.push({
        success: false,
        host: host.name,
        ip: host.ip,
        time: 0,
        sequence: i + 1,
      });
    }
    return results;
  }

  for (let i = 0; i < count; i++) {
    // Add some randomness to latency (±20%)
    const variance = host.baseLatency * 0.2;
    const randomVariance = (Math.random() * 2 - 1) * variance;
    const latency = Math.max(1, Math.round(host.baseLatency + randomVariance));

    results.push({
      success: true,
      host: host.name,
      ip: host.ip,
      time: latency,
      ttl: 64,
      sequence: i + 1,
    });
  }

  return results;
}

/**
 * Calculate ping statistics
 */
export function calculatePingStats(results: PingResult[]): {
  sent: number;
  received: number;
  lost: number;
  lossPercentage: number;
  minTime: number;
  maxTime: number;
  avgTime: number;
} {
  const successful = results.filter((r) => r.success);
  const sent = results.length;
  const received = successful.length;
  const lost = sent - received;
  const lossPercentage = sent > 0 ? Math.round((lost / sent) * 100) : 0;

  const times = successful.map((r) => r.time);
  const minTime = times.length > 0 ? Math.min(...times) : 0;
  const maxTime = times.length > 0 ? Math.max(...times) : 0;
  const avgTime =
    times.length > 0
      ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      : 0;

  return {
    sent,
    received,
    lost,
    lossPercentage,
    minTime,
    maxTime,
    avgTime,
  };
}

/**
 * Simulate traceroute to a host
 */
export function simulateTraceroute(
  targetHost: NetworkHost,
  maxHops: number = 15
): TracerouteHop[] {
  const hops: TracerouteHop[] = [];
  
  if (!targetHost.isOnline) {
    // Show hops but final destination unreachable
    for (let i = 1; i <= maxHops; i++) {
      hops.push({
        hop: i,
        ip: `192.168.${i}.1`,
        time: 10 + i * 5,
        time2: 12 + i * 5,
        time3: 11 + i * 5,
      });
    }
    return hops;
  }

  // Simulate realistic network path
  const numHops = Math.min(5 + Math.floor(Math.random() * 5), maxHops);
  
  for (let i = 1; i <= numHops; i++) {
    const isLastHop = i === numHops;
    const baseTime = 5 + i * 3;
    
    hops.push({
      hop: i,
      ip: isLastHop ? targetHost.ip : `192.168.${i}.1`,
      hostname: isLastHop ? targetHost.domain : `router-${i}.local`,
      time: baseTime + Math.floor(Math.random() * 5),
      time2: baseTime + Math.floor(Math.random() * 5),
      time3: baseTime + Math.floor(Math.random() * 5),
    });
  }

  return hops;
}

