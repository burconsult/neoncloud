/**
 * Network simulation system for educational network commands
 * Simulates network hosts, IPs, and connectivity
 */

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
 * Default network hosts for simulation
 */
export const networkHosts: NetworkHost[] = [
  {
    name: 'localhost',
    ip: '127.0.0.1',
    domain: 'localhost',
    isOnline: true,
    baseLatency: 0,
    description: 'Local machine',
  },
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
  {
    name: 'offline-host',
    ip: '192.168.1.100',
    domain: 'offline.local',
    isOnline: false,
    baseLatency: 0,
    description: 'Offline host (for testing)',
  },
];

/**
 * Find a host by name, IP, or domain
 */
export function findHost(query: string): NetworkHost | null {
  const lowerQuery = query.toLowerCase().trim();
  
  return (
    networkHosts.find(
      (host) =>
        host.name.toLowerCase() === lowerQuery ||
        host.ip === query ||
        host.domain?.toLowerCase() === lowerQuery
    ) || null
  );
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

