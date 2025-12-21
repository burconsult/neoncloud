# NeonCloud World Graph Architecture

## Overview

A modular, graph-based system for representing the game world, connecting all resources (hosts, organizations, contacts, tools, missions) in a coherent, expandable structure.

## Core Concepts

### 1. Entities (Nodes in the Graph)

Entities are the fundamental units of the game world:

- **Host**: A server, domain, or network endpoint
- **Organization**: A company, group, or entity (NeonCloud, corporations, etc.)
- **Contact**: A person who can contact the player or be discovered
- **Vendor**: An organization that sells tools/software
- **Network**: A subnet or network segment

### 2. Relationships (Edges in the Graph)

Relationships connect entities:

- **Owns/Manages**: Organization → Host
- **Has DNS Record**: Host → DNS Record
- **Contains FileSystem**: Host → FileSystem
- **Has Security Config**: Host → Security Config
- **Has Contact**: Organization → Contact
- **Sells Tools**: Vendor → Tool/Software
- **Connects To**: Host → Host (network topology)
- **Belongs To**: Host → Organization
- **Targeted By**: Mission → Host/Organization

### 3. Discovery System

Resources start unknown to the player. Discovery happens through:
- **Mission Assignment**: Mission briefings reveal targets
- **Network Scanning**: Player discovers hosts through scan commands
- **DNS Lookups**: Discovering domains and IPs
- **Contact Introduction**: Contacts reveal information
- **File System Exploration**: Finding references to other hosts/orgs

## Architecture

### File Structure

```
src/game/world/
├── entities/
│   ├── hosts/
│   │   ├── index.ts              # Host registry exports
│   │   ├── server-01.ts          # Individual host definition
│   │   ├── server-02.ts
│   │   ├── neoncloud-hq.ts
│   │   └── megacorp-server.ts
│   ├── organizations/
│   │   ├── index.ts
│   │   ├── neoncloud.ts          # NeonCloud organization
│   │   ├── megacorp.ts           # Corporation to hack
│   │   └── shadowtech.ts
│   ├── contacts/
│   │   ├── index.ts
│   │   ├── agent-smith.ts        # NeonCloud contact
│   │   └── ceo-johnson.ts        # Corporate contact
│   └── vendors/
│       ├── index.ts
│       └── darknet-market.ts     # Tool vendor
├── types/
│   ├── Host.ts                   # Host entity type
│   ├── Organization.ts           # Organization entity type
│   ├── Contact.ts                # Contact entity type
│   ├── Vendor.ts                 # Vendor entity type
│   ├── DNSRecord.ts              # DNS record type
│   └── NetworkTopology.ts        # Network connection type
├── registry/
│   ├── WorldRegistry.ts          # Central registry for all entities
│   ├── HostRegistry.ts           # Host-specific registry
│   ├── OrganizationRegistry.ts
│   └── ContactRegistry.ts
├── graph/
│   ├── WorldGraph.ts             # Graph relationship manager
│   └── GraphQueries.ts           # Query utilities
├── discovery/
│   ├── DiscoveryStore.ts         # Player discovery state (Zustand)
│   └── DiscoverySystem.ts        # Discovery logic
└── loader.ts                     # Initialize and load all world entities

```

## Entity Templates

### Host Template

```typescript
// src/game/world/entities/hosts/server-01.ts
import { Host, HostSecurityConfig, HostFileSystem } from '../../types/Host';
import { createServer01FileSystem } from '../../../filesystem/serverFileSystems';

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
  role: 'web-server', // web-server, database, file-server, etc.
  
  // Security Configuration
  security: {
    sshPort: 22,
    sshEnabled: true,
    firewallRules: ['allow-ssh-from-internal'],
    encryptionLevel: 'standard', // standard, enhanced, military
    hasIntrusionDetection: false,
    passwordPolicy: 'basic',
    allowedProtocols: ['ssh', 'http', 'https'],
  },
  
  // Credentials (for missions)
  credentials: {
    username: 'admin',
    password: 'cyberpass123', // Will be encrypted in email attachments
    requiresCracking: true,
  },
  
  // File System
  fileSystemId: 'server-01',
  
  // Network Topology
  networkConnections: [
    { hostId: 'megacorp-gateway', protocol: 'ssh', port: 22 },
  ],
  networkSegment: 'megacorp-internal',
  
  // Discovery
  discoveryMethods: ['mission', 'scan'], // How player can discover this
  discoveryDifficulty: 'easy',
  
  // Metadata
  description: 'Primary web server for Megacorp internal network',
  tags: ['web-server', 'linux', 'megacorp'],
  location: 'data-center-1',
};
```

### Organization Template

```typescript
// src/game/world/entities/organizations/megacorp.ts
import { Organization } from '../../types/Organization';

export const megacorpOrg: Organization = {
  id: 'megacorp',
  name: 'Megacorp Industries',
  displayName: 'Megacorp Industries',
  
  // Type and Classification
  type: 'corporation', // corporation, government, neoncloud, vendor
  classification: 'target', // target, employer, vendor, neutral
  
  // Network Infrastructure
  domain: 'megacorp.local',
  publicDomain: 'megacorp.com',
  networkSegments: ['megacorp-internal', 'megacorp-dmz'],
  ipRange: '192.168.1.0/24',
  
  // Hosts owned by this organization
  hostIds: ['server-01', 'server-02', 'megacorp-gateway'],
  
  // Contacts
  contactIds: ['ceo-johnson', 'it-admin'],
  
  // Vendor Relationships
  vendorInfo: null, // Not a vendor
  
  // Mission Relationships
  missionIds: ['n00b-01', 'n00b-02'], // Missions involving this org
  
  // Discovery
  discoveryMethods: ['mission', 'dns-lookup'],
  initialVisibility: 'hidden', // hidden, known, discovered
  
  // Metadata
  description: 'Large corporation, frequent target for security audits',
  industry: 'technology',
  size: 'enterprise',
  tags: ['corporation', 'target', 'technology'],
};
```

### Contact Template

```typescript
// src/game/world/entities/contacts/agent-smith.ts
import { Contact } from '../../types/Contact';

export const agentSmithContact: Contact = {
  id: 'agent-smith',
  name: 'Agent Smith',
  displayName: 'Agent Smith',
  
  // Organization Relationship
  organizationId: 'neoncloud',
  role: 'handler', // handler, target, informant, vendor
  
  // Contact Information
  email: 'agent.smith@neoncloud-ops.org',
  emailDomain: 'neoncloud-ops.org',
  
  // Communication
  canContactPlayer: true, // Can send emails to player
  canBeContacted: false, // Player can contact them (future feature)
  
  // Mission Relationships
  missionIds: ['welcome-00', 'n00b-01'], // Missions they appear in
  
  // Discovery
  discoveryMethod: 'mission', // How player discovers them
  initialVisibility: 'known', // known at game start (NeonCloud contacts)
  
  // Metadata
  description: 'Your handler at NeonCloud Special Cyberoperations Group',
  tags: ['neoncloud', 'handler', 'mission-giver'],
};
```

### Vendor Template

```typescript
// src/game/world/entities/vendors/darknet-market.ts
import { Vendor } from '../../types/Vendor';

export const darknetMarketVendor: Vendor = {
  id: 'darknet-market',
  name: 'Darknet Market',
  displayName: 'Darknet Market',
  
  // Vendor Information
  organizationId: 'darknet-market', // Self-referencing org
  type: 'vendor',
  category: 'tool-vendor', // tool-vendor, data-vendor, service-vendor
  
  // Tools/Software Sold
  toolIds: ['password-cracker-advanced', 'firewall-bypass-pro'], // Premium tools
  
  // Access Requirements
  accessRequirements: {
    requiresVpn: true,
    requiresMission: ['cyber-warrior-01'], // Mission unlocks access
    requiresCredential: null,
  },
  
  // Pricing (optional, can override tool base prices)
  pricingMultiplier: 0.9, // 10% discount
  
  // Discovery
  discoveryMethod: 'mission',
  initialVisibility: 'hidden',
  
  // Metadata
  description: 'Underground market for advanced hacking tools',
  reputation: 'questionable',
  tags: ['vendor', 'darknet', 'advanced-tools'],
};
```

## Graph System

### WorldGraph Class

```typescript
// src/game/world/graph/WorldGraph.ts
export class WorldGraph {
  private entities: Map<string, Entity>;
  private relationships: Map<string, Relationship[]>;
  
  // Query methods
  getHostsByOrganization(orgId: string): Host[]
  getOrganizationByHost(hostId: string): Organization | null
  getContactsByOrganization(orgId: string): Contact[]
  getHostsByMission(missionId: string): Host[]
  findPath(from: string, to: string): Path | null
  getConnectedHosts(hostId: string): Host[]
}
```

### Discovery System

```typescript
// src/game/world/discovery/DiscoveryStore.ts
interface DiscoveryState {
  discoveredHosts: Set<string>;
  discoveredOrganizations: Set<string>;
  discoveredContacts: Set<string>;
  discoveredVendors: Set<string>;
  knownDNSRecords: Map<string, DNSRecord[]>;
  scannedIPRanges: Set<string>;
  
  // Actions
  discoverHost: (hostId: string, method: DiscoveryMethod) => void;
  discoverOrganization: (orgId: string) => void;
  recordDNSLookup: (domain: string, records: DNSRecord[]) => void;
  recordScan: (ipRange: string, discoveredHosts: string[]) => void;
}
```

## Benefits

1. **Modularity**: Each entity in its own file, easy to add new ones
2. **Consistency**: Centralized types ensure all entities have required fields
3. **Relationships**: Graph system tracks all connections
4. **Discovery**: Built-in system for progressive revelation
5. **Expandability**: Add new entity types without breaking existing code
6. **Coherence**: All relationships tracked centrally
7. **Realism**: Rich metadata for each entity supports realistic gameplay

## Migration Strategy

1. Create type definitions
2. Create registry system
3. Create graph system
4. Migrate existing hosts (server-01, server-02) to new format
5. Create organization entities
6. Update DNS simulation to use world registry
7. Update network simulation to use world registry
8. Integrate discovery system
9. Update missions to reference world entities

