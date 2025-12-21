/**
 * Host entity type definition
 * Represents a server, domain, or network endpoint in the game world
 */

import { FileSystem } from '@/types';

export interface HostSecurityConfig {
  sshPort: number;
  sshEnabled: boolean;
  firewallRules: string[];
  encryptionLevel: 'basic' | 'standard' | 'enhanced' | 'military';
  hasIntrusionDetection: boolean;
  passwordPolicy: 'basic' | 'medium' | 'strong' | 'complex';
  allowedProtocols: string[];
  requiresFirewallBypass?: boolean; // If true, firewall-bypass tool needed
}

export interface HostCredentials {
  username: string;
  password: string; // Will be encrypted in email attachments
  requiresCracking: boolean; // If true, password cracker needed
}

export interface NetworkConnection {
  hostId: string;
  protocol: string;
  port: number;
}

export type HostDiscoveryMethod = 'mission' | 'scan' | 'dns-lookup' | 'contact' | 'file-system';

export interface Host {
  // Identity
  id: string;
  name: string;
  displayName: string;
  
  // Network Identity
  ipAddress: string;
  domainName?: string;
  macAddress?: string;
  
  // DNS Records (associated with this host)
  dnsRecords?: {
    A?: string[];
    AAAA?: string[];
    CNAME?: string[];
    MX?: { priority: number; value: string }[];
    TXT?: string[];
    NS?: string[];
  };
  
  // Organization Relationship
  organizationId: string;
  role?: string; // web-server, database, file-server, gateway, etc.
  
  // Security Configuration
  security: HostSecurityConfig;
  
  // Credentials (for missions - may be encrypted in emails)
  credentials?: HostCredentials;
  
  // File System
  fileSystemId: string; // References file system in serverFileSystems.ts
  
  // Network Topology
  networkConnections?: NetworkConnection[];
  networkSegment?: string;
  
  // Discovery
  discoveryMethods: HostDiscoveryMethod[]; // How player can discover this
  discoveryDifficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  
  // Metadata
  description?: string;
  tags?: string[];
  location?: string;
  isOnline?: boolean; // Default: true
  baseLatency?: number; // Base latency in ms for ping/traceroute
}

