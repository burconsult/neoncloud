# World Graph System - Complete Documentation

## Table of Contents

1. [Overview](#overview)
2. [Core Principles](#core-principles)
3. [Architecture](#architecture)
4. [Current Implementation Status](#current-implementation-status)
5. [Usage Guide](#usage-guide)
6. [Entity Types](#entity-types)
7. [Asset Mapping](#asset-mapping)
8. [Query System](#query-system)
9. [Future Considerations](#future-considerations)

---

## Overview

The World Graph is the central abstraction layer that ties all game assets together. **Nothing should be hardcoded** - everything flows through the graph/registry system, making the game infinitely expandable.

### Core Principle

**All game entities are defined as modular assets and connected through the World Graph.**

### Key Benefits

1. **Zero Hardcoding**: All references through IDs and queries
2. **Infinite Expandability**: Add assets without code changes
3. **Consistency**: All relationships in one place
4. **Discoverability**: Find related assets easily
5. **Maintainability**: Clear structure for all assets
6. **Dynamic Content**: Generate content from graph data

---

## Core Principles

1. **Define relationships in asset definitions** - Not in code
2. **Query through graph helpers** - Never hardcode IDs
3. **Everything is discoverable** - Use graph traversal
4. **Single source of truth** - Entity names/IDs come from registry

---

## Architecture

### System Components

```
World Graph System
├── World Registry (Storage)
│   ├── Central storage for all entities
│   ├── Registration methods
│   └── Retrieval methods (get, find by IP/domain/etc)
│
├── World Graph (Relationships)
│   ├── Relationship queries
│   ├── Graph traversal
│   └── Query helpers
│
├── Discovery System
│   ├── Player knowledge tracking
│   ├── Discovery state management
│   └── Persistent storage
│
└── Entity Definitions
    ├── Organizations
    ├── Hosts
    ├── Contacts
    └── Vendors
```

### File Structure

```
src/game/world/
├── entities/              # Asset definitions
│   ├── hosts/            # Server definitions
│   ├── organizations/    # Organization definitions
│   └── contacts/         # Contact definitions
├── registry/             # Central storage
│   └── WorldRegistry.ts
├── graph/                # Relationship queries
│   ├── WorldGraph.ts     # Core graph queries
│   └── WorldGraphQueries.ts  # High-level helpers
├── discovery/            # Player knowledge
│   └── DiscoveryStore.ts
└── utils/                # Helper utilities
    └── hostIdUtils.ts    # ID resolution
```

### Relationship Types

1. **Ownership**: Organization → Hosts, Contacts
2. **Vendor**: Organization → Tools
3. **Mission Target**: Mission → Hosts, Organizations
4. **Mission Client**: Mission → Organization
5. **Email Sender**: Email → Contact/Organization
6. **Tool Provider**: Tool → Vendor/Organization
7. **Discovery Chain**: Player → Discovered Entities

---

## Current Implementation Status

### ✅ Core Infrastructure (FULLY IMPLEMENTED)

#### 1. World Registry
**File**: `src/game/world/registry/WorldRegistry.ts`
- ✅ Central storage for all entities (Hosts, Organizations, Contacts, Vendors)
- ✅ Registration methods for each entity type
- ✅ Retrieval methods (get, getAll, find by IP/domain/email)
- ✅ Generic entity lookup
- ✅ Clear method for hot reload

**Current Entities Registered**:
- Organizations: 2 (neoncloud, megacorp)
- Contacts: 1 (agent-smith)
- Hosts: 4 (localhost, megacorp-server-01, megacorp-database-01, megacorp-webserver-01)

#### 2. World Graph
**File**: `src/game/world/graph/WorldGraph.ts`
- ✅ Relationship queries (getHostsByOrganization, getOrganizationByHost)
- ✅ Mission-related queries (getHostsByMission, getOrganizationsByMission)
- ✅ Network topology queries (getConnectedHosts, findPath)
- ✅ Discovery queries (getHostsByDiscoveryMethod)
- ✅ Vendor queries (getVendorsByTool)
- ✅ Domain/IP queries (findOrganizationByDomain, getHostsByIPRange)

**Limitations**:
- ⚠️ No indexes (queries iterate through all entities) - Performance optimization opportunity
- ⚠️ No caching - Performance optimization opportunity

#### 3. Discovery System
**File**: `src/game/world/discovery/DiscoveryStore.ts`
- ✅ Tracks discovered hosts, organizations, contacts
- ✅ Tracks DNS lookups and scanned IP ranges
- ✅ Persistent storage with proper Set serialization
- ✅ Methods: discoverHost, discoverOrganization, discoverContact

#### 4. World Graph Queries (High-Level Helpers)
**File**: `src/game/world/graph/WorldGraphQueries.ts`
- ✅ Mission queries (getMissionTargetHosts, getMissionsByHost)
- ✅ Email queries (getEmailsByMission, getEmailsByHost)
- ✅ Tool queries (getToolsByVendor, getVendorByTool)
- ✅ Display name helpers (getHostDisplayName, getOrganizationDisplayName, etc.)

### ✅ Integration Status (FULLY COMPLETE)

#### 1. Mission System Integration
- ✅ Mission modules define `targetHostIds`, `targetOrganizationIds`, `involvedContactIds`
- ✅ `initializeMission()` discovers entities via world graph
- ✅ Mission event handlers use graph queries (no hardcoded IDs)
- ✅ Mission descriptions/hints use dynamic helpers
- ✅ Task completion checks use graph queries

**Files**:
- ✅ `src/game/missions/MissionModule.ts` - Has worldGraph properties
- ✅ `src/game/missions/modules/*.ts` - All use dynamic content helpers
- ✅ `src/game/missions/missionEventHandlers.ts` - Uses graph queries
- ✅ `src/game/missions/missionContentHelpers.ts` - Dynamic content generation

#### 2. Email System Integration
- ✅ Email interface has `worldGraph` properties
- ✅ Email templates define relationships
- ✅ Email content uses dynamic display names
- ✅ Email content dynamically generated from graph data

**Files**:
- ✅ `src/types/email.ts` - Has worldGraph interface
- ✅ `src/game/emails/emailTemplates.ts` - Uses dynamic content

#### 3. Tool System Integration
- ✅ Tool modules define `vendorId`
- ✅ Tools can reference vendors
- ✅ Vendor relationships work correctly

**Files**:
- ✅ `src/game/tools/ToolModule.ts` - Has vendorId
- ✅ `src/game/state/useInventoryStore.ts` - Uses vendor relationships

#### 4. Filesystem Integration
- ✅ Host filesystems defined in host entity files
- ✅ Filesystems retrieved through world registry
- ✅ No hardcoded filesystem references

**Files**:
- ✅ `src/game/world/entities/hosts/*.ts` - Define fileSystemFactory
- ✅ `src/game/filesystem/serverFileSystems.ts` - Queries registry

#### 5. Network/DNS Simulation Integration
- ✅ DNS simulation uses `worldRegistry.findHostByDomain()`
- ✅ Network simulation uses `worldRegistry.findHostByIP()`
- ✅ Discovery events properly emitted

**Files**:
- ✅ `src/game/network/dnsSimulation.ts` - Uses world registry
- ✅ `src/game/network/networkSimulation.ts` - Uses world registry

### ✅ Completed: Hardcoded References Removed

1. ✅ Mission event handlers - All use `getMissionTargetHosts()` and graph queries
2. ✅ Email templates - All use display name helpers and dynamic content
3. ✅ Mission modules - All descriptions/hints use dynamic helpers
4. ✅ Network/DNS simulation - Already using world registry

---

## Usage Guide

### Quick Start

#### 1. Define Mission Relationships

```typescript
// src/game/missions/modules/my_mission.ts
export const myMissionModule: MissionModule = {
  missionId: 'my-mission',
  
  // World Graph Relationships
  worldGraph: {
    clientOrganizationId: 'neoncloud',           // Who provides the mission
    targetHostIds: ['megacorp-server-01'],       // Which hosts are targeted
    targetOrganizationIds: ['megacorp'],         // Which orgs are targeted
    involvedContactIds: ['agent-smith'],         // Who briefs the player
  },
  
  mission: {
    // ... mission definition
  },
};
```

#### 2. Define Email Relationships

```typescript
// src/game/emails/emailTemplates.ts
export function createMyEmail(): Email {
  return {
    id: 'email-my-001',
    from: 'agent@neoncloud-ops.org',
    to: 'player@neoncloud.local',
    subject: 'Mission Briefing',
    
    // World Graph Relationships
    worldGraph: {
      fromContactId: 'agent-smith',              // Who sent it
      fromOrganizationId: 'neoncloud',           // Which org sent it
      relatedHostIds: ['megacorp-server-01'],    // Hosts mentioned
      relatedOrganizationIds: ['megacorp'],      // Orgs mentioned
    },
    
    // ... email content (use dynamic helpers)
    body: `Target: ${getHostDisplayName('megacorp-server-01')}`,
  };
}
```

#### 3. Query Through Graph Helpers

```typescript
import {
  getMissionTargetHosts,
  getMissionClientOrganization,
  getMissionsByHost,
  getEmailsByHost,
  getToolsByVendor,
  getHostDisplayName,
  getOrganizationDisplayName,
} from '@/game/world/graph/WorldGraphQueries';

// Get all hosts targeted by a mission
const targetHosts = getMissionTargetHosts('n00b-01');
// Returns: ['megacorp-server-01']

// Get the client organization
const client = getMissionClientOrganization('n00b-01');
// Returns: 'neoncloud'

// Find all missions targeting a host
const missions = getMissionsByHost('megacorp-server-01');
// Returns: [firstHackMissionModule]

// Get display names
const hostName = getHostDisplayName('megacorp-server-01');
// Returns: 'Megacorp Server-01' or fallback to ID
```

### Replacing Hardcoded References

#### Before (Hardcoded)
```typescript
// ❌ BAD: Hardcoded host ID
if (activeServerId === 'server-01' && event.filename === 'secret.txt') {
  missionStore.completeTask(currentMission.id, task.id);
}

// ❌ BAD: Hardcoded host name in email body
body: `Target: server-01 at 192.168.1.100`
```

#### After (Graph Query)
```typescript
// ✅ GOOD: Query through graph
import { getMissionTargetHosts } from '@/game/world/graph/WorldGraphQueries';

const targetHosts = getMissionTargetHosts(currentMission.id);
if (targetHosts.includes(activeServerId) && event.filename === 'secret.txt') {
  missionStore.completeTask(currentMission.id, task.id);
}

// ✅ GOOD: Use graph to get host info
import { worldRegistry } from '@/game/world/registry/WorldRegistry';
import { getHostDisplayName } from '@/game/world/graph/WorldGraphQueries';

const hostName = getHostDisplayName('megacorp-server-01');
const host = worldRegistry.getHost('megacorp-server-01');
body: `Target: ${hostName} at ${host.ipAddress}`
```

### Available Query Functions

#### Mission Queries
- `getMissionTargetHosts(missionId)` - Get all hosts targeted by mission
- `getMissionClientOrganization(missionId)` - Get client org
- `getMissionTargetOrganizations(missionId)` - Get target orgs
- `getMissionContact(missionId)` - Get briefing contact
- `getMissionsByHost(hostId)` - Find missions targeting a host
- `getMissionsByOrganization(orgId)` - Find missions for an org
- `getMissionsByTool(toolId)` - Find missions requiring a tool

#### Email Queries
- `getEmailsByMission(missionId)` - Get emails for a mission
- `getEmailsByHost(hostId)` - Get emails mentioning a host
- `getEmailsByContact(contactId)` - Get emails from a contact

#### Tool Queries
- `getToolsByVendor(vendorId)` - Get tools sold by vendor
- `getVendorByTool(toolId)` - Get vendor for a tool
- `getToolsByMission(missionId)` - Get tools required by mission

#### Display Name Helpers
- `getHostDisplayName(hostId)` - Get display name with fallback
- `getOrganizationDisplayName(orgId)` - Get display name with fallback
- `getContactDisplayName(contactId)` - Get display name with fallback

### Adding New Assets

#### 1. Create the Asset Definition

```typescript
// src/game/world/entities/hosts/my-server.ts
export const myServerHost: Host = {
  id: 'my-org-server-01',  // Use hierarchical IDs: {org-id}-{role}-{instance}
  name: 'my-server',
  displayName: 'My Organization Server-01',
  organizationId: 'my-org',
  ipAddress: '203.0.113.10',
  domainName: 'server-01.my-org.com',
  // ... other properties
};
```

#### 2. Register in Loader

```typescript
// src/game/world/loader.ts
import { myServerHost } from './entities/hosts/my-server';

export function loadWorldEntities(): void {
  worldRegistry.registerHost(myServerHost);
  // ... other registrations
}
```

#### 3. Reference in Mission

```typescript
// src/game/missions/modules/my_mission.ts
export const myMissionModule: MissionModule = {
  missionId: 'my-mission',
  worldGraph: {
    targetHostIds: ['my-org-server-01'], // Reference by ID
  },
  // ...
};
```

#### 4. Query Anywhere

```typescript
// Anywhere in code
const hosts = getMissionTargetHosts('my-mission');
// Automatically gets ['my-org-server-01']
```

---

## Entity Types

### 1. Organizations
- **Purpose**: Companies, groups, institutions in the game world
- **Examples**: NeonCloud, Megacorp
- **Properties**: 
  - Can be vendors (sell tools)
  - Can have contacts
  - Can own hosts
  - Can be mission targets/clients
  - Have IP ranges
  - Have domains

### 2. Hosts
- **Purpose**: Servers, computers, network devices
- **Examples**: localhost, megacorp-server-01, megacorp-database-01
- **Properties**:
  - Belong to organizations
  - Have file systems (defined via factory functions)
  - Have security configurations
  - Have DNS records
  - Have IP addresses and domains
  - Can be mission targets
  - Use hierarchical IDs: `{org-id}-{role}-{instance}`

### 3. Contacts
- **Purpose**: NPCs, agents, people in the game world
- **Examples**: Agent Smith, mission contacts
- **Properties**:
  - Belong to organizations
  - Can send emails
  - Can provide missions
  - Can be discovered
  - Have email addresses

### 4. Vendors
- **Purpose**: Organizations that sell tools/software
- **Properties**:
  - Extends Organization
  - Has tool catalog
  - Has pricing
  - Has access requirements

---

## Asset Mapping

### Current Assets

#### Organizations
- `neoncloud` - NeonCloud Special Cyberoperations Group (player's employer, vendor)
- `megacorp` - Megacorp Industries (target organization)

#### Hosts
- `localhost` - Player's local workstation (neoncloud)
- `megacorp-server-01` - Megacorp server-01 (megacorp)
- `megacorp-database-01` - Megacorp database server (megacorp)
- `megacorp-webserver-01` - Megacorp public web server (megacorp)

#### Contacts
- `agent-smith` - Agent Smith, handler at NeonCloud

For complete asset inventory and relationships, see the codebase entity definitions in `src/game/world/entities/`.

---

## Query System

### World Registry (Storage)

```typescript
import { worldRegistry } from '@/game/world/registry/WorldRegistry';

// Get entities
const host = worldRegistry.getHost('megacorp-server-01');
const org = worldRegistry.getOrganization('megacorp');
const contact = worldRegistry.getContact('agent-smith');

// Find entities
const hostByIP = worldRegistry.findHostByIP('203.0.113.2');
const hostByDomain = worldRegistry.findHostByDomain('server-01.megacorp.com');
const orgByDomain = worldRegistry.findOrganizationByDomain('megacorp.com');

// Get all
const allHosts = worldRegistry.getAllHosts();
const allOrgs = worldRegistry.getAllOrganizations();
```

### World Graph (Relationships)

```typescript
import { worldGraph } from '@/game/world/graph/WorldGraph';

// Organization relationships
const hosts = worldGraph.getHostsByOrganization('megacorp');
const contacts = worldGraph.getContactsByOrganization('neoncloud');

// Mission relationships
const missionHosts = worldGraph.getHostsByMission('n00b-01');
const missionOrgs = worldGraph.getOrganizationsByMission('n00b-01');

// Network topology
const connectedHosts = worldGraph.getConnectedHosts('megacorp-server-01');
const path = worldGraph.findPath('localhost', 'megacorp-server-01');
```

### High-Level Query Helpers

```typescript
import {
  getMissionTargetHosts,
  getHostDisplayName,
  // ... other helpers
} from '@/game/world/graph/WorldGraphQueries';

// Use helpers for common queries
const targetHosts = getMissionTargetHosts('n00b-01');
const displayName = getHostDisplayName('megacorp-server-01');
```

---

## Future Considerations

### Performance Optimizations

The current implementation is functional but could benefit from:

1. **Reverse Indexes**: For O(1) lookups instead of O(n) iterations
   - `hostsByOrganization` map
   - `contactsByOrganization` map
   - `hostsByNetworkSegment` map

2. **Query Caching**: Cache expensive query results
   - Cache with TTL
   - Invalidate on entity changes

3. **Batch Operations**: Register multiple entities at once

### Relationship Integrity

Future enhancements:

1. **Validation**: Validate that referenced entities exist on registration
2. **Bidirectional Relationships**: Automatically maintain both directions
3. **Relationship Registry**: Centralized relationship management

### Advanced Features

Potential future extensions:

1. **Event System**: Entity change events for reactive updates
2. **Query Builder**: Fluent API for complex queries
3. **Graph Traversal**: Advanced traversal utilities
4. **Performance Monitoring**: Track query performance

### Future Feature Support

The graph is designed to support:

- Email sending system
- Phishing/social engineering
- Credential extraction
- Contact interaction systems
- Dynamic content generation
- Multi-step social engineering chains

See separate documentation for specific feature plans.

---

## Migration Checklist

When updating existing code to use the graph:

- [ ] Replace hardcoded host IDs with `getMissionTargetHosts()`
- [ ] Replace hardcoded org IDs with `getMissionClientOrganization()`
- [ ] Replace hardcoded contact IDs with `getMissionContact()`
- [ ] Add `worldGraph` to all MissionModules
- [ ] Add `worldGraph` to all Emails
- [ ] Use query helpers instead of direct ID checks
- [ ] Use display name helpers instead of hardcoded names
- [ ] Use `resolveHostId()` for ID resolution when needed

---

## Success Criteria

The graph system is considered "solid" when:

1. ✅ **Zero hardcoded entity IDs** in mission/email/command logic
2. ✅ **All entity lookups** go through world registry
3. ✅ **All relationship queries** go through world graph
4. ✅ **Dynamic content** uses graph queries (display names, etc.)
5. ⚠️ **Performance** is acceptable (indexes for common queries) - Optional optimization
6. ⚠️ **Integrity** is maintained (validation, bidirectional relationships) - Optional enhancement

**Current Status**: ✅ Production-ready (criteria 1-4 complete)

---

## Related Documentation

- **Host ID Migration**: See `docs/HOST_ID_MIGRATION_PLAN.md` for information on hierarchical host IDs
- **Mission Creation**: See `docs/MISSION_CREATION_GUIDE.md` for creating missions with graph integration
- **Visual Mindmap**: See `docs/WORLD_GRAPH_MINDMAP.md` for visual representation

