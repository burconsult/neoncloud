import { Command, CommandResult } from '@/types';
import { lookupDNS, formatDNSRecord } from '../network/dnsSimulation';
import { isCommandAvailableForMission } from '../missions/missionProgression';

/**
 * Nslookup command - Query DNS records
 */
export const nslookupCommand: Command = {
  name: 'nslookup',
  description: 'Query DNS records for a domain',
  usage: 'nslookup <domain> [type]',
  educationalNote: 'Nslookup queries DNS servers to resolve domain names to IP addresses and retrieve DNS records.',
  execute: (args: string[]): CommandResult => {
    // Check mission availability
    const availability = isCommandAvailableForMission('nslookup');
    if (!availability.available) {
      return {
        output: [
          `⚠️  Command not available yet`,
          '',
          availability.message || 'This command will be available in a later mission.',
          '',
          'Complete the current mission to unlock new commands!',
        ],
        success: false,
        error: 'Command locked',
      };
    }

    if (args.length === 0) {
      return {
        output: [
          'nslookup: missing domain operand',
          'Usage: nslookup <domain> [type]',
          '',
          'Record types: A, AAAA, MX, TXT, NS, CNAME',
          '',
          'Examples:',
          '  nslookup example.com',
          '  nslookup example.com A',
          '  nslookup example.com MX',
        ],
        success: false,
        error: 'Missing argument',
      };
    }

    const domain = args[0];
    if (!domain || typeof domain !== 'string') {
      return {
        output: 'Usage: nslookup <domain> [record-type]',
        success: false,
        error: 'Missing domain',
      };
    }
    const recordType = args.length > 1 ? args[1] : undefined;

    const { records, found } = lookupDNS(domain, recordType);

    if (!found) {
      return {
        output: `nslookup: ${domain}: Name or service not known`,
        success: false,
        error: 'Domain not found',
      };
    }

    if (records.length === 0) {
      return {
        output: `No ${recordType || ''} records found for ${domain}`,
        success: false,
        error: 'No records found',
      };
    }

    const output: string[] = [];
    output.push(`DNS records for ${domain}:`);
    output.push('');
    output.push('Name'.padEnd(30) + 'TTL'.padStart(6) + ' Class Type'.padStart(12) + ' Value');
    output.push('-'.repeat(80));

    records.forEach((record) => {
      output.push(formatDNSRecord(record));
    });

    // Add educational note
    output.push('');
    output.push('💡 Tip: DNS (Domain Name System) translates domain names to IP addresses.');
    output.push('   Different record types serve different purposes (A=IPv4, AAAA=IPv6, MX=Mail).');

    return {
      output,
      success: true,
      educationalContent: {
        id: 'nslookup-explanation',
        title: 'Understanding DNS and Nslookup',
        content: `DNS (Domain Name System) is like a phone book for the internet, translating human-readable domain names into IP addresses.

**How DNS works:**
1. Your computer asks a DNS server for the IP address of a domain
2. DNS server looks up the record and returns the IP
3. Your computer connects to that IP address

**DNS Record Types:**
- **A**: IPv4 address (e.g., 192.168.1.1)
- **AAAA**: IPv6 address (e.g., 2001:db8::1)
- **MX**: Mail exchange server
- **TXT**: Text records (often used for verification)
- **NS**: Name server (authoritative DNS server)
- **CNAME**: Canonical name (alias)

**Common uses:**
- Finding IP addresses of domains
- Checking DNS configuration
- Diagnosing DNS-related issues`,
        type: 'concept',
        relatedCommands: ['nslookup'],
        relatedMissions: [],
        difficulty: 2,
      },
    };
  },
};

