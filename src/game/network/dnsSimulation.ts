/**
 * DNS simulation system for educational DNS commands
 */

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
 * Simulated DNS zones
 */
const dnsZones: DNSZone[] = [
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
 */
export function lookupDNS(
  domain: string,
  recordType?: string
): { records: DNSRecord[]; found: boolean } {
  const normalizedDomain = domain.toLowerCase().trim();
  const normalizedType = recordType?.toUpperCase().trim();

  const zone = dnsZones.find((z) => z.domain === normalizedDomain);

  if (!zone) {
    return { records: [], found: false };
  }

  let records = zone.records;

  // Filter by record type if specified
  if (normalizedType && ['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS'].includes(normalizedType)) {
    records = records.filter((r) => r.type === normalizedType);
  }

  return { records, found: true };
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

