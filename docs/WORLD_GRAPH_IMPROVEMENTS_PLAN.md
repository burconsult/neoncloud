# World Graph Improvements - Implementation Plan

Based on analysis from `WORLD_GRAPH_ANALYSIS.md`, this document outlines which improvements make sense for NeonCloud and how to implement them.

## Analysis Summary

The analysis identified several areas for improvement. This plan prioritizes based on:
1. **Current game needs** (not over-engineering)
2. **Performance impact** (critical bottlenecks)
3. **Code quality** (bugs and maintainability)
4. **Future extensibility** (only if it doesn't add unnecessary complexity)

---

## Priority 1: HIGH PRIORITY - Implement Immediately

### 1.1 Map-Based Indexes for Performance ✅ CRITICAL

**Problem**: Current O(n) lookups will cause performance issues as game grows.

**Current State**:
- `findHostByIP()` iterates through all hosts: `Array.from(this.hosts.values()).find(...)`
- `findHostByDomain()` iterates through all hosts
- `getHostsByOrganization()` in WorldGraph iterates through all organizations
- `getMissionsByHost()` iterates through all missions

**Impact**: With 10+ hosts, these queries become noticeable. With 50+ hosts, they become slow.

**Solution**: Implement reverse indexes using Maps.

**Implementation**:

```typescript
// In WorldRegistry
export class WorldRegistry {
  private hosts: Map<string, Host> = new Map();
  private organizations: Map<string, Organization> = new Map();
  // ... existing maps
  
  // NEW: Reverse indexes
  private hostsByOrg: Map<string, Set<string>> = new Map();  // orgId -> Set<hostId>
  private hostsByIP: Map<string, string> = new Map();        // ip -> hostId
  private hostsByDomain: Map<string, string> = new Map();    // domain -> hostId
  private contactsByOrg: Map<string, Set<string>> = new Map(); // orgId -> Set<contactId>
  
  registerHost(host: Host): void {
    // Existing registration
    if (this.hosts.has(host.id)) {
      console.warn(`Host ${host.id} is already registered. Overwriting...`);
      // Remove from old indexes first
      this.removeHostFromIndexes(host.id);
    }
    this.hosts.set(host.id, host);
    
    // Update indexes
    this.updateHostIndexes(host);
  }
  
  private updateHostIndexes(host: Host): void {
    // Index by organization
    if (!this.hostsByOrg.has(host.organizationId)) {
      this.hostsByOrg.set(host.organizationId, new Set());
    }
    this.hostsByOrg.get(host.organizationId)!.add(host.id);
    
    // Index by IP
    if (host.ipAddress) {
      this.hostsByIP.set(host.ipAddress, host.id);
    }
    
    // Index by domain
    if (host.domainName) {
      this.hostsByDomain.set(host.domainName.toLowerCase(), host.id);
    }
  }
  
  private removeHostFromIndexes(hostId: string): void {
    const host = this.hosts.get(hostId);
    if (!host) return;
    
    // Remove from org index
    const orgSet = this.hostsByOrg.get(host.organizationId);
    if (orgSet) {
      orgSet.delete(hostId);
      if (orgSet.size === 0) {
        this.hostsByOrg.delete(host.organizationId);
      }
    }
    
    // Remove from IP index
    if (host.ipAddress && this.hostsByIP.get(host.ipAddress) === hostId) {
      this.hostsByIP.delete(host.ipAddress);
    }
    
    // Remove from domain index
    if (host.domainName) {
      this.hostsByDomain.delete(host.domainName.toLowerCase());
    }
  }
  
  // O(1) lookup instead of O(n)
  findHostByIP(ip: string): Host | undefined {
    const hostId = this.hostsByIP.get(ip);
    return hostId ? this.hosts.get(hostId) : undefined;
  }
  
  findHostByDomain(domain: string): Host | undefined {
    const hostId = this.hostsByDomain.get(domain.toLowerCase());
    return hostId ? this.hosts.get(hostId) : undefined;
  }
  
  getHostsByOrganization(orgId: string): Host[] {
    const hostIds = this.hostsByOrg.get(orgId);
    if (!hostIds) return [];
    
    return Array.from(hostIds)
      .map(id => this.hosts.get(id))
      .filter((host): host is Host => host !== undefined);
  }
  
  // Similar for contacts
  registerContact(contact: Contact): void {
    // ... existing registration
    this.contacts.set(contact.id, contact);
    
    // Update index
    if (!this.contactsByOrg.has(contact.organizationId)) {
      this.contactsByOrg.set(contact.organizationId, new Set());
    }
    this.contactsByOrg.get(contact.organizationId)!.add(contact.id);
  }
  
  clear(): void {
    // ... existing clear
    this.hostsByOrg.clear();
    this.hostsByIP.clear();
    this.hostsByDomain.clear();
    this.contactsByOrg.clear();
  }
}
```

**Also update WorldGraph** to use registry methods instead of iterating:

```typescript
// In WorldGraph
getHostsByOrganization(orgId: string): Host[] {
  // Use registry's indexed method
  return worldRegistry.getHostsByOrganization(orgId);
}
```

**Testing**: Verify all existing queries still work correctly.

---

### 1.2 ID Validation on Registration ✅ HIGH VALUE

**Problem**: Typos in IDs (e.g., `megacrop` instead of `megacorp`) fail silently, causing bugs that are hard to track down.

**Solution**: Validate relationships when registering entities.

**Implementation**:

```typescript
// In WorldRegistry
registerHost(host: Host): void {
  // Validate organization exists
  if (!this.organizations.has(host.organizationId)) {
    throw new Error(
      `Cannot register host ${host.id}: Organization ${host.organizationId} does not exist. ` +
      `Available organizations: ${Array.from(this.organizations.keys()).join(', ')}`
    );
  }
  
  // Validate hierarchical ID format (if using it)
  // This is optional but helpful
  const expectedPrefix = host.organizationId;
  if (!host.id.startsWith(expectedPrefix) && host.id !== 'localhost') {
    console.warn(
      `Host ID ${host.id} does not follow hierarchical naming convention. ` +
      `Expected to start with ${expectedPrefix}-`
    );
  }
  
  // Continue with registration
  // ... rest of registerHost logic
}

registerContact(contact: Contact): void {
  // Validate organization exists
  if (!this.organizations.has(contact.organizationId)) {
    throw new Error(
      `Cannot register contact ${contact.id}: Organization ${contact.organizationId} does not exist.`
    );
  }
  
  // Continue with registration
  // ... rest of registerContact logic
}

// Add validation method for mission relationships (called by mission loader)
validateMissionRelationships(
  targetHostIds: string[],
  targetOrganizationIds: string[],
  contactId?: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate hosts
  targetHostIds.forEach(hostId => {
    if (!this.hosts.has(hostId)) {
      errors.push(`Mission references non-existent host: ${hostId}`);
    }
  });
  
  // Validate organizations
  targetOrganizationIds.forEach(orgId => {
    if (!this.organizations.has(orgId)) {
      errors.push(`Mission references non-existent organization: ${orgId}`);
    }
  });
  
  // Validate contact
  if (contactId && !this.contacts.has(contactId)) {
    errors.push(`Mission references non-existent contact: ${contactId}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
```

**Usage in loader.ts**:
```typescript
// After all entities are registered, validate mission relationships
export function validateWorldGraph(): void {
  // This can be called after loadWorldEntities()
  // Validates all mission modules' worldGraph relationships
  const { missionRegistry } = require('../missions/MissionModule');
  
  missionRegistry.getAll().forEach(module => {
    if (module.worldGraph) {
      const validation = worldRegistry.validateMissionRelationships(
        module.worldGraph.targetHostIds || [],
        module.worldGraph.targetOrganizationIds || [],
        module.worldGraph.involvedContactIds?.[0]
      );
      
      if (!validation.valid) {
        console.error(`Mission ${module.missionId} has invalid relationships:`, validation.errors);
      }
    }
  });
}
```

**Testing**: 
- Try registering a host with invalid org ID - should throw error
- Try registering with valid IDs - should work
- Check validation catches issues in mission modules

---

## Priority 2: MEDIUM PRIORITY - Good Improvements

### 2.1 Bidirectional Relationship Caching for Missions

**Problem**: To find "missions targeting this host", we currently iterate all missions.

**Current State**:
```typescript
// In WorldGraphQueries
getMissionsByHost(hostId: string): MissionModule[] {
  // Iterates through ALL missions
  return missionRegistry.getAll().filter(mission => {
    return mission.worldGraph?.targetHostIds?.includes(hostId);
  });
}
```

**Solution**: Maintain reverse index of missions by host. Update when missions are registered.

**Implementation**:

```typescript
// In WorldGraph (or create a MissionGraph helper)
export class WorldGraph {
  // Cache of missions by host (lazy-loaded, updated on demand)
  private missionsByHostCache: Map<string, Set<string>> | null = null;
  
  // Invalidate cache when missions change
  invalidateMissionCache(): void {
    this.missionsByHostCache = null;
  }
  
  // Build cache lazily
  private buildMissionsByHostCache(): void {
    if (this.missionsByHostCache !== null) return;
    
    this.missionsByHostCache = new Map();
    const { missionRegistry } = require('../../missions/MissionModule');
    
    missionRegistry.getAll().forEach(mission => {
      const targetHostIds = mission.worldGraph?.targetHostIds || [];
      targetHostIds.forEach(hostId => {
        if (!this.missionsByHostCache!.has(hostId)) {
          this.missionsByHostCache!.set(hostId, new Set());
        }
        this.missionsByHostCache!.get(hostId)!.add(mission.missionId);
      });
    });
  }
  
  // O(1) lookup after cache is built
  getMissionsByHost(hostId: string): string[] {
    this.buildMissionsByHostCache();
    const missionIds = this.missionsByHostCache!.get(hostId);
    return missionIds ? Array.from(missionIds) : [];
  }
}
```

**Note**: Since missions are registered at module load time (not dynamically), this cache only needs to be built once. We can call `buildMissionsByHostCache()` on first use.

**Testing**: Verify `getMissionsByHost()` returns correct missions for known hosts.

---

### 2.2 Clarify State vs Definition (Documentation + Minor Changes)

**Problem**: The analysis raises a valid concern about mutability, but for NeonCloud this is less critical because:
- Most game state is in separate Zustand stores (filesystem, connections, discovery)
- Host entity files define *blueprints* with factory functions for filesystems
- Entities themselves are mostly immutable

**Current State**:
- Entities in registry are the objects from entity files (could be mutated)
- Filesystems are created via factory functions (good!)
- Game state (connections, discovered entities) is in separate stores

**Solution**: 
1. **Document** that entities in registry are blueprints (read-only in practice)
2. **Add clone method** if we ever need mutable copies
3. **Clarify** that filesystem state is separate from host definitions

**Implementation** (minimal):

```typescript
// Add documentation comment to WorldRegistry
/**
 * World Registry
 * 
 * Stores entity BLUEPRINTS (definitions). These should be treated as read-only.
 * Game state (connections, discovered entities, file system contents) is stored
 * in separate Zustand stores, not in the registry.
 * 
 * If you need to modify entity data for gameplay (e.g., host goes offline),
 * create a separate GameState store that tracks mutable state keyed by entity ID.
 */
export class WorldRegistry {
  // ... existing code
}
```

**Optional Enhancement** (only if needed later):
If we ever need to track mutable host state (e.g., "server goes offline"), create:
```typescript
// src/game/world/state/WorldStateStore.ts
export interface HostState {
  hostId: string;
  isOnline: boolean;
  lastSeen: number;
  // ... other mutable state
}

export const useWorldStateStore = create<{
  hostStates: Map<string, HostState>;
  // ...
}>(...)
```

**For now**: Current architecture is fine. Just document it clearly.

---

## Priority 3: LOW PRIORITY - Future Considerations

### 3.1 Type Safety with Branded Types

**Analysis Suggestion**: Use branded types or template literal types for IDs.

**Assessment**: **NOT RECOMMENDED at this time**

**Reasoning**:
- Current string IDs work fine with the ID resolution system (`resolveHostId()`)
- Branded types add complexity without significant benefit at current scale
- Template literal types would break existing code (host IDs have varied formats)
- The hierarchical ID system already provides some structure

**When to reconsider**: If we start seeing ID-related bugs in production.

---

### 3.2 Generic Edge System

**Analysis Suggestion**: Replace property-based relationships with a generic Edge/Relationship system.

**Assessment**: **NOT RECOMMENDED at this time**

**Reasoning**:
- Current property-based relationships are clear and type-safe
- The game's relationship types are well-defined and unlikely to change drastically
- A generic edge system would add complexity without clear benefit
- The current system is easy to understand and maintain

**When to reconsider**: If we need complex relationship types (e.g., "Player HAS_ROOT_ACCESS Host", "Contact TRUSTS Player") that don't fit the current model.

---

### 3.3 Separate Network Topology Graph

**Analysis Suggestion**: Separate logical graph (org ownership) from network graph (router hops).

**Assessment**: **NOT RECOMMENDED at this time**

**Reasoning**:
- Current network simulation is simple (ping, traceroute, nslookup)
- No complex pathfinding or pivoting needed yet
- Can be added later if network topology becomes more complex

**When to reconsider**: If we add features like:
- Multi-hop routing/pivoting
- Firewall traversal
- Network visualization requiring topology graph

---

### 3.4 Event Bus Integration for Entity Changes

**Analysis Suggestion**: Add entity change events to registry.

**Assessment**: **LOW PRIORITY - Optional Enhancement**

**Current State**: Game already has an event bus (`eventBus.ts`) for game events.

**Implementation** (if desired):
```typescript
// In WorldRegistry
private entityEventListeners: Map<string, Set<(entity: Entity) => void>> = new Map();

on(event: 'host:registered' | 'organization:registered', callback: (entity: Entity) => void): () => void {
  if (!this.entityEventListeners.has(event)) {
    this.entityEventListeners.set(event, new Set());
  }
  this.entityEventListeners.get(event)!.add(callback);
  
  return () => {
    this.entityEventListeners.get(event)?.delete(callback);
  };
}

private emit(event: string, entity: Entity): void {
  this.entityEventListeners.get(event)?.forEach(cb => cb(entity));
}

registerHost(host: Host): void {
  // ... registration logic
  this.emit('host:registered', host);
}
```

**When to implement**: If we need reactive UI updates based on entity registration (e.g., dynamic map visualization).

---

### 3.5 Modding Support / Namespaces

**Analysis Suggestion**: Add namespacing for mod support.

**Assessment**: **NOT RECOMMENDED at this time**

**Reasoning**: Too early. Modding is not a current requirement.

**When to reconsider**: If modding becomes a goal.

---

### 3.6 Procedural Generation

**Analysis Suggestion**: Create asset generators for dynamic entity creation.

**Assessment**: **NOT RECOMMENDED at this time**

**Reasoning**: Game currently uses hand-crafted missions and entities. Procedural generation would be a major feature addition.

**When to reconsider**: If we want to add infinite/sandbox mode.

---

## Implementation Order

### Phase 1: Critical Performance (Do First)
1. ✅ **Map-based indexes** in WorldRegistry (1.1)
   - `hostsByOrg`, `hostsByIP`, `hostsByDomain`, `contactsByOrg`
   - Update all find methods to use indexes
   - Update WorldGraph to use indexed methods

### Phase 2: Quality & Reliability (Do Next)
2. ✅ **ID validation** (1.2)
   - Validate on registration (org exists, etc.)
   - Add mission relationship validation
   - Add validation method call in loader

### Phase 3: Optimization (Do If Needed)
3. ⚠️ **Mission cache** (2.1)
   - Only implement if `getMissionsByHost()` becomes a bottleneck
   - Current mission count is low (< 10), so O(n) is fine for now

### Phase 4: Documentation (Do Always)
4. ✅ **State vs Definition clarification** (2.2)
   - Add documentation comments
   - Clarify architecture in WORLD_GRAPH.md

---

## Testing Strategy

### For Index Implementation
1. **Unit tests**:
   - Register hosts, verify indexes are built
   - Query by IP/domain/org, verify O(1) performance
   - Update host, verify indexes update
   - Clear registry, verify indexes clear

2. **Integration tests**:
   - Load all entities, verify all queries work
   - Verify no regressions in existing functionality

### For Validation
1. **Error cases**:
   - Try registering host with invalid org ID - should throw
   - Try registering contact with invalid org ID - should throw
   - Load mission with invalid host ID - should log error

2. **Success cases**:
   - Register all valid entities - should work
   - Load all missions - should validate successfully

---

## Summary

**Implement Now**:
1. Map-based indexes (Priority 1.1) - **Critical for performance**
2. ID validation (Priority 1.2) - **Critical for bug prevention**

**Consider Later**:
3. Mission caching (Priority 2.1) - Only if needed
4. Documentation improvements (Priority 2.2) - Always good

**Skip for Now**:
- Branded types, generic edge system, network topology graph, modding, procedural generation

These can be reconsidered if requirements change, but they add complexity without clear benefit for the current game scope.

