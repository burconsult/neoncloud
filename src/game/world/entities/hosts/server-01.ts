/**
 * Server-01 Host
 * Training server for first hack mission (n00b-01)
 */

import { Host } from '../../types/Host';
import { FileSystem } from '@/types';

export const server01Host: Host = {
  id: 'server-01',
  name: 'server-01',
  displayName: 'Server-01',
  
  // Network Identity
  ipAddress: '192.168.1.100',
  domainName: 'server-01.megacorp.local',
  macAddress: '00:1B:44:11:3A:B7',
  
  // DNS Records
  dnsRecords: {
    A: ['192.168.1.100'],
    AAAA: [],
    CNAME: [],
    MX: [],
    TXT: ['v=spf1 include:_spf.megacorp.local'],
  },
  
  // Organization Relationship
  organizationId: 'megacorp',
  role: 'web-server',
  
  // Security Configuration
  security: {
    sshPort: 22,
    sshEnabled: true,
    firewallRules: ['allow-ssh-from-internal'],
    encryptionLevel: 'standard',
    hasIntrusionDetection: false,
    passwordPolicy: 'basic',
    allowedProtocols: ['ssh', 'http', 'https'],
    requiresFirewallBypass: false, // Firewall disabled for training
  },
  
  // Credentials (for missions)
  credentials: {
    username: 'admin',
    password: 'cyberpass123',
    requiresCracking: true,
  },
  
  // File System
  fileSystemId: 'server-01',
  fileSystemFactory: () => {
    // Import dynamically to avoid circular dependencies
    // This will be resolved at runtime
    return null as any; // Actual implementation via getServerFileSystem fallback
  },
  
  // Network Topology
  networkConnections: [
    { hostId: 'megacorp-gateway', protocol: 'ssh', port: 22 },
  ],
  networkSegment: 'megacorp-internal',
  
  // Discovery
  discoveryMethods: ['mission'], // Discovered through mission briefing
  discoveryDifficulty: 'easy',
  
  // Metadata
  description: 'Primary web server for Megacorp internal network - Training target',
  tags: ['web-server', 'linux', 'megacorp', 'training'],
  location: 'data-center-1',
  isOnline: true,
  baseLatency: 10, // 10ms base latency for ping
};

