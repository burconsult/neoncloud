/**
 * Network Scanner Tool Module
 * 
 * Self-contained module for Network Scanner tool (Basic and Premium versions)
 * Allows players to scan IP ranges to discover hosts
 */

import { ToolModule } from '../ToolModule';
import { Command, CommandResult, GameContext } from '@/types';
import { useInventoryStore } from '../../state/useInventoryStore';
import { useTerminalStore } from '../../state/useTerminalStore';
import { queueToolAction } from '../../time/actionQueue';
import { emitToolUsed } from '../../events/eventBus';
import { worldRegistry } from '../../world/registry/WorldRegistry';
import { useDiscoveryStore } from '../../world/discovery/DiscoveryStore';
import { useGameTimeStore } from '../../time/useGameTimeStore';

/**
 * Parse IP range (CIDR notation or single IP)
 * Returns array of IP addresses to scan
 */
function parseIPRange(ipRange: string): string[] | null {
  // Check if it's CIDR notation (e.g., 192.168.1.0/24)
  if (ipRange.includes('/')) {
    const [baseIP, prefixLength] = ipRange.split('/');
    const prefix = parseInt(prefixLength, 10);
    
    // For game purposes, we'll scan a limited subset
    // /24 = 256 IPs, we'll scan .1 to .10 for gameplay reasons
    if (prefix === 24) {
      const baseParts = baseIP.split('.').slice(0, 3);
      const ips: string[] = [];
      // Scan .1 to .255 (but limit to .1-.10 for performance)
      for (let i = 1; i <= 10; i++) {
        ips.push([...baseParts, i.toString()].join('.'));
      }
      return ips;
    }
    
    // For other prefixes, just return the base IP
    return [baseIP];
  }
  
  // Single IP address
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipRegex.test(ipRange)) {
    return [ipRange];
  }
  
  return null;
}

/**
 * Scan an IP range and discover hosts
 */
function scanIPRange(ipRange: string): {
  discoveredHosts: string[];
  scannedIPs: string[];
  hostsFound: Array<{ hostId: string; ip: string; name: string }>;
} {
  const ips = parseIPRange(ipRange);
  if (!ips) {
    return { discoveredHosts: [], scannedIPs: [], hostsFound: [] };
  }

  const hostsFound: Array<{ hostId: string; ip: string; name: string }> = [];
  const discoveredHostIds: string[] = [];

  // Check each IP against world registry
  ips.forEach(ip => {
    const host = worldRegistry.findHostByIP(ip);
    if (host && host.isOnline !== false) {
      hostsFound.push({
        hostId: host.id,
        ip: host.ipAddress,
        name: host.displayName || host.name,
      });
      if (!discoveredHostIds.includes(host.id)) {
        discoveredHostIds.push(host.id);
      }
    }
  });

  // Discover hosts through scanning
  const discoveryStore = useDiscoveryStore.getState();
  discoveredHostIds.forEach(hostId => {
    if (!discoveryStore.isHostDiscovered(hostId)) {
      discoveryStore.discoverHost(hostId, 'scan');
    }
  });

  // Record scan
  discoveryStore.recordScan(ipRange, discoveredHostIds);

  return {
    discoveredHosts: discoveredHostIds,
    scannedIPs: ips,
    hostsFound,
  };
}

export const networkScannerToolModule: ToolModule = {
  toolId: 'network-scanner',

  basicSoftware: {
    id: 'network-scanner-basic',
    name: 'Basic Network Scanner',
    description: 'Scan IP ranges to discover active hosts on a network. Essential for reconnaissance.',
    category: 'network',
    rarity: 'common',
    price: 100, // Cheaper, given at start or very early
    requirements: {
      completedMissions: [], // Available from start
    },
    effects: {
      enableFeatures: ['network-scan', 'host-discovery'],
    },
  },

  premiumSoftware: {
    id: 'network-scanner-premium',
    name: 'Advanced Network Scanner',
    description: 'Enhanced scanner with faster scanning, port detection, and service identification.',
    category: 'network',
    rarity: 'uncommon',
    price: 350,
    requirements: {
      completedMissions: ['network-01'],
    },
    effects: {
      enableFeatures: ['network-scan', 'host-discovery', 'port-scan', 'service-identification'],
    },
  },

  duration: {
    basic: 8,    // Basic scanner: 8 seconds
    premium: 4,  // Premium scanner: 4 seconds (faster)
  },

  command: {
    name: 'scan',
    aliases: ['nmap', 'netscan'],
    description: 'Scan an IP range or single IP to discover active hosts',
    usage: 'scan <ip-or-range>',
    requiresUnlock: false, // Tool ownership is checked inside execute function
    execute: async (args: string[], context?: GameContext): Promise<CommandResult> => {
      const inventoryStore = useInventoryStore.getState();
      const terminal = useTerminalStore.getState();

      // Check if player owns the scanner
      if (!inventoryStore.ownsSoftware('network-scanner-basic') && 
          !inventoryStore.ownsSoftware('network-scanner-premium')) {
        return {
          output: [
            'Network Scanner not available. You need to purchase it first.',
            'Type "store" to view available software.',
          ],
          success: false,
          error: 'Tool not owned',
        };
      }

      if (args.length === 0) {
        return {
          output: [
            'Usage: scan <ip-or-range>',
            '',
            'Examples:',
            '  scan 192.168.1.100        # Scan single IP',
            '  scan 192.168.1.0/24       # Scan entire subnet (limited to .1-.10 for gameplay)',
            '',
            '💡 Tip: Use CIDR notation (e.g., /24) to scan network ranges.',
            '   Mission briefings often provide network information to scan.',
          ],
          success: false,
          error: 'Missing argument',
        };
      }

      const ipRange = args[0];
      if (!ipRange || typeof ipRange !== 'string') {
        return {
          output: 'scan: invalid IP address or range',
          success: false,
          error: 'Invalid argument',
        };
      }

      // Check if it's a valid IP or IP range
      const parsed = parseIPRange(ipRange);
      if (!parsed) {
        return {
          output: [
            `scan: invalid IP address or range: ${ipRange}`,
            '',
            'Usage: scan <ip-or-range>',
            '  Examples:',
            '    scan 192.168.1.100',
            '    scan 192.168.1.0/24',
          ],
          success: false,
          error: 'Invalid IP range',
        };
      }

      const isPremium = inventoryStore.ownsSoftware('network-scanner-premium');
      
      // Store scan result
      let scanResult: {
        discoveredHosts: string[];
        scannedIPs: string[];
        hostsFound: Array<{ hostId: string; ip: string; name: string }>;
      } | null = null;
      
      // Queue tool action with duration
      const duration = isPremium ? 4 : 8;
      queueToolAction(
        'network-scanner',
        `Scanning ${ipRange}...`,
        duration,
        () => {
          // Perform scan and store result
          scanResult = scanIPRange(ipRange);
          
          // Emit tool used event after scan completes
          emitToolUsed('scan', ipRange, true);
        },
        (progress, remaining) => {
          // Progress callback (optional)
        }
      );

      // Wait for action to complete (use a promise to wait)
      await new Promise(resolve => setTimeout(resolve, duration * 1000 / useGameTimeStore.getState().speedup));

      if (!scanResult) {
        return {
          output: 'scan: scanning cancelled or failed',
          success: false,
          error: 'Scan failed',
        };
      }

      // Format output
      const output: string[] = [];
      output.push(`Scanning ${ipRange}...`);
      output.push('');
      
      if (scanResult.hostsFound.length === 0) {
        output.push(`No active hosts found in range ${ipRange}`);
        output.push('');
        output.push('💡 Tip: Make sure you have the correct IP range.');
        output.push('   Some hosts may be offline or behind a firewall.');
      } else {
        output.push(`Found ${scanResult.hostsFound.length} active host(s):`);
        output.push('');
        output.push('IP Address'.padEnd(20) + 'Hostname'.padEnd(30) + 'Status');
        output.push('-'.repeat(70));
        
        scanResult.hostsFound.forEach(({ ip, name }) => {
          output.push(`${ip.padEnd(20)}${name.padEnd(30)}up`);
        });
        
        output.push('');
        output.push(`✓ Discovered ${scanResult.discoveredHosts.length} new host(s)`);
      }

      return {
        output,
        success: true,
        educationalContent: {
          id: 'network-scanning-explanation',
          title: 'Network Scanning',
          content: `Network scanning is a fundamental reconnaissance technique used to discover active hosts on a network.

**How it works:**
1. Send probes to IP addresses in the target range
2. Wait for responses (ICMP, TCP, etc.)
3. Identify which hosts are online and responsive
4. Discover hostnames, open ports, and running services

**IP Range Formats:**
- Single IP: \`192.168.1.100\`
- CIDR notation: \`192.168.1.0/24\` (scans 192.168.1.0-255)

**Best Practices:**
- Always scan from behind a VPN to protect your identity
- Start with broad scans, then focus on discovered hosts
- Document discovered hosts for later use
- Be aware that scanning may be logged by target networks`,
          type: 'concept',
          relatedCommands: ['scan', 'ping', 'nslookup'],
          relatedMissions: [],
          difficulty: 2,
        },
      };
    },
  },
};

