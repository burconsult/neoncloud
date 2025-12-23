/**
 * DNS simulation system for educational DNS commands
 * Now integrated with world registry for host/organization DNS records
 */

import { worldRegistry } from '../world/registry/WorldRegistry';
import { useDiscoveryStore } from '../world/discovery/DiscoveryStore';
import { worldGraph } from '../world/graph/WorldGraph';

export interface DNSRecord {
  type: 'A' | 'AAAA' | 'MX' | 'TXT' | 'CNAME' | 'NS';
  name: string;
  value: string;
  ttl: number;
  priority?: number; // For MX records
}

export interface DNSZone {
  domain: string;
  records: DNSRecord[];
}

/**
 * Convert host DNS records to DNSRecord array
 */
function convertHostDNSRecordsToDNSRecords(
  domain: string,
  hostRecords: {
    A?: string[];
    AAAA?: string[];
    CNAME?: string[];
    MX?: { priority: number; value: string }[];
    TXT?: string[];
    NS?: string[];
  }
): DNSRecord[] {
  const records: DNSRecord[] = [];
  const defaultTTL = 3600; // Default TTL for game hosts

  // A records
  if (hostRecords.A) {
    hostRecords.A.forEach(ip => {
      records.push({
        type: 'A',
        name: domain,
        value: ip,
        ttl: defaultTTL,
      });
    });
  }

  // AAAA records
  if (hostRecords.AAAA) {
    hostRecords.AAAA.forEach(ip => {
      records.push({
        type: 'AAAA',
        name: domain,
        value: ip,
        ttl: defaultTTL,
      });
    });
  }

  // CNAME records
  if (hostRecords.CNAME) {
    hostRecords.CNAME.forEach(alias => {
      records.push({
        type: 'CNAME',
        name: domain,
        value: alias,
        ttl: defaultTTL,
      });
    });
  }

  // MX records
  if (hostRecords.MX) {
    hostRecords.MX.forEach(mx => {
      records.push({
        type: 'MX',
        name: domain,
        value: mx.value,
        ttl: defaultTTL,
        priority: mx.priority,
      });
    });
  }

  // TXT records
  if (hostRecords.TXT) {
    hostRecords.TXT.forEach(txt => {
      records.push({
        type: 'TXT',
        name: domain,
        value: txt,
        ttl: defaultTTL,
      });
    });
  }

  // NS records
  if (hostRecords.NS) {
    hostRecords.NS.forEach(ns => {
      records.push({
        type: 'NS',
        name: domain,
        value: ns,
        ttl: 86400, // NS records typically have longer TTL
      });
    });
  }

  return records;
}

/**
 * Legacy DNS zones for educational domains (example.com, dns.google, etc.)
 * These are kept for backward compatibility with existing missions
 */
const legacyDNSZones: DNSZone[] = [
  {
    domain: 'example.com',
    records: [
      { type: 'A', name: 'example.com', value: '93.184.216.34', ttl: 3600 },
      { type: 'AAAA', name: 'example.com', value: '2606:2800:220:1:248:1893:25c8:1946', ttl: 3600 },
      { type: 'MX', name: 'example.com', value: 'mail.example.com', ttl: 3600, priority: 10 },
      { type: 'NS', name: 'example.com', value: 'ns1.example.com', ttl: 86400 },
      { type: 'NS', name: 'example.com', value: 'ns2.example.com', ttl: 86400 },
      { type: 'TXT', name: 'example.com', value: 'v=spf1 include:_spf.example.com ~all', ttl: 3600 },
    ],
  },
  {
    domain: 'dns.google',
    records: [
      { type: 'A', name: 'dns.google', value: '8.8.8.8', ttl: 300 },
      { type: 'A', name: 'dns.google', value: '8.8.4.4', ttl: 300 },
      { type: 'AAAA', name: 'dns.google', value: '2001:4860:4860::8888', ttl: 300 },
    ],
  },
  {
    domain: 'one.one.one.one',
    records: [
      { type: 'A', name: 'one.one.one.one', value: '1.1.1.1', ttl: 300 },
      { type: 'AAAA', name: 'one.one.one.one', value: '2606:4700:4700::1111', ttl: 300 },
    ],
  },
  {
    domain: 'localhost',
    records: [
      { type: 'A', name: 'localhost', value: '127.0.0.1', ttl: 0 },
      { type: 'AAAA', name: 'localhost', value: '::1', ttl: 0 },
    ],
  },
];

/**
 * Lookup DNS records for a domain
 * First checks world registry for hosts/organizations, then falls back to legacy zones
 */
export function lookupDNS(
  domain: string,
  recordType?: string
): { records: DNSRecord[]; found: boolean } {
  const normalizedDomain = domain.toLowerCase().trim();
  const normalizedType = recordType?.toUpperCase().trim();

  // First, try to find a host by domain name
  const host = worldRegistry.findHostByDomain(normalizedDomain);
  
  if (host && host.dnsRecords) {
    // Convert host DNS records to DNSRecord format
    const records = convertHostDNSRecordsToDNSRecords(
      host.domainName || normalizedDomain,
      host.dnsRecords
    );

    // Filter by record type if specified
    let filteredRecords = records;
    if (normalizedType && ['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS'].includes(normalizedType)) {
      filteredRecords = records.filter((r) => r.type === normalizedType);
    }

    // Discover host through DNS lookup
    const discoveryStore = useDiscoveryStore.getState();
    if (!discoveryStore.isHostDiscovered(host.id)) {
      discoveryStore.discoverHost(host.id, 'dns-lookup');
    }
    
    // Record DNS lookup
    discoveryStore.recordDNSLookup(normalizedDomain, filteredRecords);

    return { records: filteredRecords, found: true };
  }

  // Try to find organization by domain
  const org = worldRegistry.findOrganizationByDomain(normalizedDomain);
  if (org) {
    // Find the organization's web server or primary host that matches this domain
    // First, try to find a host with this exact domain name
    const orgHosts = worldGraph.getHostsByOrganization(org.id);
    const domainHost = orgHosts.find(h => 
      h.domainName?.toLowerCase() === normalizedDomain
    );
    
    if (domainHost && domainHost.dnsRecords) {
      // Use the host's DNS records
      const records = convertHostDNSRecordsToDNSRecords(
        normalizedDomain,
        domainHost.dnsRecords
      );
      
      // Filter by record type if specified
      let filteredRecords = records;
      if (normalizedType && ['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS'].includes(normalizedType)) {
        filteredRecords = records.filter((r) => r.type === normalizedType);
      }
      
      // Discover organization and host through DNS lookup
      const discoveryStore = useDiscoveryStore.getState();
      if (!discoveryStore.isOrganizationDiscovered(org.id)) {
        discoveryStore.discoverOrganization(org.id, 'dns-lookup');
      }
      if (!discoveryStore.isHostDiscovered(domainHost.id)) {
        discoveryStore.discoverHost(domainHost.id, 'dns-lookup');
      }
      
      // Record DNS lookup
      discoveryStore.recordDNSLookup(normalizedDomain, filteredRecords);
      
      return { records: filteredRecords, found: true };
    }
    
    // If no specific host found, create organization-level DNS records
    // Use the organization's primary host or create synthetic records
    if (org.hostIds && org.hostIds.length > 0) {
      // Get the first host as a fallback
      const primaryHost = worldRegistry.getHost(org.hostIds[0]);
      if (primaryHost && primaryHost.dnsRecords) {
        const records = convertHostDNSRecordsToDNSRecords(
          normalizedDomain,
          primaryHost.dnsRecords
        );
        
        // Filter by record type if specified
        let filteredRecords = records;
        if (normalizedType && ['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS'].includes(normalizedType)) {
          filteredRecords = records.filter((r) => r.type === normalizedType);
        }
        
        // Discover organization through DNS lookup
        const discoveryStore = useDiscoveryStore.getState();
        if (!discoveryStore.isOrganizationDiscovered(org.id)) {
          discoveryStore.discoverOrganization(org.id, 'dns-lookup');
        }
        
        // Record DNS lookup
        discoveryStore.recordDNSLookup(normalizedDomain, filteredRecords);
        
        return { records: filteredRecords, found: true };
      }
    }
  }

  // Fall back to legacy DNS zones (example.com, dns.google, etc.)
  const zone = legacyDNSZones.find((z) => z.domain === normalizedDomain);
  if (zone) {
    let records = zone.records;

    // Filter by record type if specified
    if (normalizedType && ['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS'].includes(normalizedType)) {
      records = records.filter((r) => r.type === normalizedType);
    }

    // Record DNS lookup for legacy zones too
    const discoveryStore = useDiscoveryStore.getState();
    discoveryStore.recordDNSLookup(normalizedDomain, records);

    return { records, found: true };
  }

  // Domain not found
  return { records: [], found: false };
}

/**
 * Format DNS record for display
 */
export function formatDNSRecord(record: DNSRecord): string {
  let line = `${record.name.padEnd(30)} ${record.ttl.toString().padStart(6)} IN ${record.type.padEnd(6)}`;
  
  if (record.priority !== undefined) {
    line += ` ${record.priority.toString().padStart(3)}`;
  }
  
  line += ` ${record.value}`;
  
  return line;
}

