/**
 * Server-02 Host
 * Second training server for data extraction mission (n00b-02)
 */

import { Host } from '../../types/Host';
import { FileSystem } from '@/types';

export const server02Host: Host = {
  id: 'server-02',
  name: 'server-02',
  displayName: 'Server-02',
  
  // Network Identity
  ipAddress: '192.168.1.101',
  domainName: 'server-02.megacorp.local',
  macAddress: '00:1B:44:11:3A:B8',
  
  // DNS Records
  dnsRecords: {
    A: ['192.168.1.101'],
    AAAA: [],
    CNAME: [],
    MX: [],
    TXT: ['v=spf1 include:_spf.megacorp.local'],
  },
  
  // Organization Relationship
  organizationId: 'megacorp',
  role: 'database-server',
  
  // Security Configuration
  security: {
    sshPort: 22,
    sshEnabled: true,
    firewallRules: ['allow-ssh-from-internal', 'restrict-external-access'],
    encryptionLevel: 'enhanced',
    hasIntrusionDetection: false,
    passwordPolicy: 'medium',
    allowedProtocols: ['ssh', 'https'],
    requiresFirewallBypass: false, // Can be enhanced in future missions
  },
  
  // Credentials (for missions)
  credentials: {
    username: 'admin',
    password: 'cyberpass456',
    requiresCracking: true,
  },
  
  // File System
  fileSystemId: 'server-02',
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
  description: 'Database server for Megacorp - Contains customer and financial data',
  tags: ['database-server', 'linux', 'megacorp', 'training'],
  location: 'data-center-1',
  isOnline: true,
  baseLatency: 12, // Slightly higher latency than server-01
};

