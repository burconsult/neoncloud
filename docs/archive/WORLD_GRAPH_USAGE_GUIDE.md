# World Graph Usage Guide

## Overview

The World Graph system ties all game assets together through relationships. **No hardcoded references** - everything flows through the graph.

## Core Principles

1. **Define relationships in asset definitions** - Not in code
2. **Query through graph helpers** - Never hardcode IDs
3. **Everything is discoverable** - Use graph traversal

## Quick Start

### 1. Define Mission Relationships

```typescript
// src/game/missions/modules/my_mission.ts
export const myMissionModule: MissionModule = {
  missionId: 'my-mission',
  
  // World Graph Relationships
  worldGraph: {
    clientOrganizationId: 'neoncloud',    // Who provides the mission
    targetHostIds: ['server-01'],         // Which hosts are targeted
    targetOrganizationIds: ['megacorp'],  // Which orgs are targeted
    contactId: 'agent-smith',            // Who briefs the player
  },
  
  mission: {
    // ... mission definition
  },
};
```

### 2. Define Email Relationships

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
      fromContactId: 'agent-smith',           // Who sent it
      fromOrganizationId: 'neoncloud',        // Which org sent it
      relatedHostIds: ['server-01'],          // Hosts mentioned
      relatedOrganizationIds: ['megacorp'],    // Orgs mentioned
    },
    
    // ... email content
  };
}
```

### 3. Query Through Graph Helpers

```typescript
import {
  getMissionTargetHosts,
  getMissionClientOrganization,
  getMissionsByHost,
  getEmailsByHost,
  getToolsByVendor,
} from '@/game/world/graph/WorldGraphQueries';

// Get all hosts targeted by a mission
const targetHosts = getMissionTargetHosts('n00b-01');
// Returns: ['server-01']

// Get the client organization
const client = getMissionClientOrganization('n00b-01');
// Returns: 'neoncloud'

// Find all missions targeting a host
const missions = getMissionsByHost('server-01');
// Returns: [firstHackMissionModule]

// Find all emails mentioning a host
const emails = getEmailsByHost('server-01');
// Returns: [createFirstHackEmail()]

// Find all tools sold by a vendor
const tools = getToolsByVendor('neoncloud');
// Returns: [networkScannerToolModule, ...]
```

## Replacing Hardcoded References

### Before (Hardcoded)
```typescript
// ❌ BAD: Hardcoded host ID
if (activeServerId === 'server-01' && event.filename === 'secret.txt') {
  missionStore.completeTask(currentMission.id, task.id);
}
```

### After (Graph Query)
```typescript
// ✅ GOOD: Query through graph
import { getMissionTargetHosts } from '@/game/world/graph/WorldGraphQueries';

const targetHosts = getMissionTargetHosts(currentMission.id);
if (targetHosts.includes(activeServerId) && event.filename === 'secret.txt') {
  missionStore.completeTask(currentMission.id, task.id);
}
```

### Before (Hardcoded in Email)
```typescript
// ❌ BAD: Hardcoded host name in email body
body: `Target: server-01 at 192.168.1.100`
```

### After (Dynamic from Graph)
```typescript
// ✅ GOOD: Use graph to get host info
import { worldRegistry } from '@/game/world/registry/WorldRegistry';
import { getMissionTargetHosts } from '@/game/world/graph/WorldGraphQueries';

const targetHosts = getMissionTargetHosts('n00b-01');
const host = worldRegistry.getHost(targetHosts[0]);
body: `Target: ${host.displayName} at ${host.ipAddress}`
```

## Available Query Functions

### Mission Queries
- `getMissionTargetHosts(missionId)` - Get all hosts targeted by mission
- `getMissionClientOrganization(missionId)` - Get client org
- `getMissionTargetOrganizations(missionId)` - Get target orgs
- `getMissionContact(missionId)` - Get briefing contact
- `getMissionsByHost(hostId)` - Find missions targeting a host
- `getMissionsByOrganization(orgId)` - Find missions for an org
- `getMissionsByTool(toolId)` - Find missions requiring a tool

### Email Queries
- `getEmailsByMission(missionId)` - Get emails for a mission
- `getEmailsByHost(hostId)` - Get emails mentioning a host
- `getEmailsByContact(contactId)` - Get emails from a contact

### Tool Queries
- `getToolsByVendor(vendorId)` - Get tools sold by vendor
- `getVendorByTool(toolId)` - Get vendor for a tool
- `getToolsByMission(missionId)` - Get tools required by mission

### Display Name Helpers
- `getHostDisplayName(hostId)` - Get display name with fallback
- `getOrganizationDisplayName(orgId)` - Get display name with fallback
- `getContactDisplayName(contactId)` - Get display name with fallback

## Adding New Assets

### 1. Create the Asset Definition

```typescript
// src/game/world/entities/hosts/my-server.ts
export const myServerHost: Host = {
  id: 'my-server',
  name: 'my-server',
  displayName: 'My Server',
  organizationId: 'megacorp',
  // ... other properties
};
```

### 2. Register in Loader

```typescript
// src/game/world/loader.ts
import { myServerHost } from './entities/hosts/my-server';

export function loadWorldEntities(): void {
  worldRegistry.registerHost(myServerHost);
  // ... other registrations
}
```

### 3. Reference in Mission

```typescript
// src/game/missions/modules/my_mission.ts
export const myMissionModule: MissionModule = {
  missionId: 'my-mission',
  worldGraph: {
    targetHostIds: ['my-server'], // Reference by ID
  },
  // ...
};
```

### 4. Query Anywhere

```typescript
// Anywhere in code
const hosts = getMissionTargetHosts('my-mission');
// Automatically gets ['my-server']
```

## Benefits

1. **No Hardcoding**: All references through IDs and queries
2. **Easy Expansion**: Add assets without code changes
3. **Consistency**: All relationships in one place
4. **Discoverability**: Find related assets easily
5. **Maintainability**: Clear structure for all assets

## Migration Checklist

When updating existing code:

- [ ] Replace hardcoded host IDs with `getMissionTargetHosts()`
- [ ] Replace hardcoded org IDs with `getMissionClientOrganization()`
- [ ] Replace hardcoded contact IDs with `getMissionContact()`
- [ ] Add `worldGraph` to all MissionModules
- [ ] Add `worldGraph` to all Emails
- [ ] Use query helpers instead of direct ID checks
- [ ] Use display name helpers instead of hardcoded names

