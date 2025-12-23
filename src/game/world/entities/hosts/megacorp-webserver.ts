/**
 * Megacorp Web Server Host
 * The main public-facing web server for megacorp.com
 * This is what players discover when they ping/nslookup megacorp.com
 */

import { Host } from '../../types/Host';

export const megacorpWebserverHost: Host = {
  id: 'megacorp-webserver',
  name: 'megacorp-webserver',
  displayName: 'Megacorp Web Server',
  
  // Network Identity
  ipAddress: '203.0.113.1', // Public IP address (TEST-NET-3 range, safe for examples)
  domainName: 'megacorp.com', // Main public domain
  macAddress: '00:1B:44:11:3A:B6',
  
  // DNS Records
  dnsRecords: {
    A: ['203.0.113.1'],
    AAAA: [],
    CNAME: [],
    MX: [
      { priority: 10, value: 'mail.megacorp.com' },
    ],
    TXT: ['v=spf1 include:_spf.megacorp.com ~all'],
    NS: ['ns1.megacorp.com', 'ns2.megacorp.com'],
  },
  
  // Organization Relationship
  organizationId: 'megacorp',
  role: 'web-server',
  
  // Security Configuration
  security: {
    sshPort: 22,
    sshEnabled: false, // Web server, not accessible via SSH
    firewallRules: ['allow-http', 'allow-https', 'block-ssh'],
    encryptionLevel: 'standard',
    hasIntrusionDetection: false,
    passwordPolicy: 'basic',
    allowedProtocols: ['http', 'https'],
    requiresFirewallBypass: false,
  },
  
  // No credentials - this is just for discovery, not for SSH access
  
  // File System - Web servers don't need file systems for this game
  fileSystemId: 'default',
  
  // Network Topology
  networkConnections: [
    { hostId: 'megacorp-gateway', protocol: 'http', port: 80 },
    { hostId: 'megacorp-gateway', protocol: 'https', port: 443 },
  ],
  networkSegment: 'megacorp-dmz',
  
  // Discovery
  discoveryMethods: ['dns-lookup', 'scan'], // Discovered through DNS/ping
  discoveryDifficulty: 'easy',
  
  // Metadata
  description: 'Main public web server for Megacorp Industries',
  tags: ['web-server', 'public-facing', 'megacorp'],
  location: 'data-center-1',
  isOnline: true,
  baseLatency: 25, // Slightly higher latency for public web server
};

