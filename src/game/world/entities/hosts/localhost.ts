/**
 * Localhost Host
 * The player's local machine
 */

import { Host } from '../../types/Host';

export const localhostHost: Host = {
  id: 'localhost',
  name: 'localhost',
  displayName: 'Localhost',
  
  // Network Identity
  ipAddress: '127.0.0.1',
  domainName: 'localhost',
  macAddress: '00:00:00:00:00:00',
  
  // DNS Records
  dnsRecords: {
    A: ['127.0.0.1'],
    AAAA: ['::1'],
    CNAME: [],
    MX: [],
    TXT: [],
  },
  
  // Organization Relationship (player's machine, no organization)
  organizationId: 'neoncloud', // Considered part of NeonCloud infrastructure
  role: 'workstation',
  
  // Security Configuration (not applicable for localhost)
  security: {
    sshPort: 22,
    sshEnabled: false,
    firewallRules: [],
    encryptionLevel: 'standard',
    hasIntrusionDetection: false,
    passwordPolicy: 'basic',
    allowedProtocols: [],
    requiresFirewallBypass: false,
  },
  
  // No credentials needed for localhost
  
  // File System (uses default file system)
  fileSystemId: 'default',
  
  // Network Topology
  networkConnections: [],
  networkSegment: 'local',
  
  // Discovery
  discoveryMethods: ['mission'], // Known from start
  discoveryDifficulty: 'easy',
  
  // Metadata
  description: 'Your local machine',
  tags: ['localhost', 'workstation'],
  location: 'local',
  isOnline: true,
  baseLatency: 0,
};

