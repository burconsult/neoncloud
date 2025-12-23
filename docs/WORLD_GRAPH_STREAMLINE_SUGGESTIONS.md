# World Graph Streamlining Suggestions

Based on best practices for graph systems, here are recommendations to streamline and improve the World Graph implementation.

## Current Architecture Analysis

### Strengths ✅
- Clear separation between Registry (storage) and Graph (relationships)
- Modular entity definitions
- Type-safe entity interfaces
- Singleton pattern for global access
- Discovery system integration

### Areas for Improvement ⚠️
- Query performance (iterates through all entities)
- No relationship validation/integrity checks
- Limited indexing for common queries
- No caching for expensive operations
- Missing bidirectional relationship management
- No event system for entity changes
- Type safety gaps (`any` types in some queries)

---

## 1. Performance Optimizations

### 1.1 Add Indexes for Common Queries

**Problem**: Queries like `getHostsByOrganization` iterate through all hosts every time.

**Solution**: Maintain reverse indexes in the registry.

```typescript
// src/game/world/registry/WorldRegistry.ts
export class WorldRegistry {
  private hosts: Map<string, Host> = new Map();
  private organizations: Map<string, Organization> = new Map();
  
  // Reverse indexes for O(1) lookups
  private hostsByOrganization: Map<string, Set<string>> = new Map();
  private contactsByOrganization: Map<string, Set<string>> = new Map();
  private hostsByNetworkSegment: Map<string, Set<string>> = new Map();
  private hostsByDiscoveryMethod: Map<string, Set<string>> = new Map();
  
  registerHost(host: Host): void {
    this.hosts.set(host.id, host);
    
    // Update indexes
    if (!this.hostsByOrganization.has(host.organizationId)) {
      this.hostsByOrganization.set(host.organizationId, new Set());
    }
    this.hostsByOrganization.get(host.organizationId)!.add(host.id);
    
    // Index by network segment
    if (host.networkSegment) {
      if (!this.hostsByNetworkSegment.has(host.networkSegment)) {
        this.hostsByNetworkSegment.set(host.networkSegment, new Set());
      }
      this.hostsByNetworkSegment.get(host.networkSegment)!.add(host.id);
    }
    
    // Index by discovery method
    host.discoveryMethods.forEach(method => {
      if (!this.hostsByDiscoveryMethod.has(method)) {
        this.hostsByDiscoveryMethod.set(method, new Set());
      }
      this.hostsByDiscoveryMethod.get(method)!.add(host.id);
    });
  }
  
  getHostsByOrganization(orgId: string): Host[] {
    const hostIds = this.hostsByOrganization.get(orgId);
    if (!hostIds) return [];
    
    return Array.from(hostIds)
      .map(id => this.hosts.get(id))
      .filter((host): host is Host => host !== undefined);
  }
}
```

**Benefits**:
- O(1) lookup instead of O(n) iteration
- Scales better with many entities
- Cleaner query code

---

### 1.2 Add Query Result Caching

**Problem**: Expensive queries (like path finding) are recalculated every time.

**Solution**: Cache query results with invalidation on entity changes.

```typescript
// src/game/world/graph/WorldGraph.ts
export class WorldGraph {
  private queryCache: Map<string, { result: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60000; // 1 minute
  
  private getCached<T>(key: string, compute: () => T): T {
    const cached = this.queryCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.result as T;
    }
    
    const result = compute();
    this.queryCache.set(key, { result, timestamp: Date.now() });
    return result;
  }
  
  invalidateCache(): void {
    this.queryCache.clear();
  }
  
  findPath(fromHostId: string, toHostId: string): Path | null {
    const cacheKey = `path:${fromHostId}:${toHostId}`;
    return this.getCached(cacheKey, () => {
      // Original path finding logic
      // ...
    });
  }
}
```

**Benefits**:
- Faster repeated queries
- Reduces computation for expensive operations
- Configurable TTL

---

## 2. Relationship Integrity

### 2.1 Validate Relationships on Registration

**Problem**: No validation that referenced entities exist.

**Solution**: Validate relationships when registering entities.

```typescript
// src/game/world/registry/WorldRegistry.ts
registerHost(host: Host): void {
  // Validate organization exists
  if (!this.organizations.has(host.organizationId)) {
    throw new Error(`Cannot register host ${host.id}: Organization ${host.organizationId} does not exist`);
  }
  
  // Validate network connections
  if (host.networkConnections) {
    host.networkConnections.forEach(conn => {
      if (!this.hosts.has(conn.hostId)) {
        console.warn(`Host ${host.id} references non-existent host ${conn.hostId}`);
      }
    });
  }
  
  this.hosts.set(host.id, host);
  this.updateIndexes(host);
}
```

**Benefits**:
- Catches errors early
- Prevents broken references
- Better debugging

---

### 2.2 Maintain Bidirectional Relationships

**Problem**: Relationships are one-way (e.g., Host → Organization, but Organization doesn't automatically know its hosts).

**Solution**: Automatically maintain bidirectional relationships.

```typescript
// Already partially done with indexes, but make it explicit
registerHost(host: Host): void {
  this.hosts.set(host.id, host);
  
  // Ensure organization knows about this host
  const org = this.organizations.get(host.organizationId);
  if (org && !org.hostIds.includes(host.id)) {
    org.hostIds.push(host.id);
  }
  
  this.updateIndexes(host);
}
```

**Benefits**:
- Consistent state
- Easier queries
- No manual relationship management

---

## 3. Type Safety Improvements

### 3.1 Remove `any` Types

**Problem**: `getUndiscoveredHosts` uses `any` for discoveryStore.

**Solution**: Use proper types.

```typescript
// src/game/world/graph/WorldGraph.ts
import { useDiscoveryStore } from '../discovery/DiscoveryStore';

getUndiscoveredHosts(discoveryStore: ReturnType<typeof useDiscoveryStore.getState>): Host[] {
  return worldRegistry.getAllHosts().filter(host =>
    !discoveryStore.isHostDiscovered(host.id)
  );
}

// Or better: make it a method that doesn't need external state
getUndiscoveredHosts(discoveredHostIds: Set<string>): Host[] {
  return worldRegistry.getAllHosts().filter(host =>
    !discoveredHostIds.has(host.id)
  );
}
```

---

### 3.2 Add Generic Query Types

**Solution**: Use generics for type-safe queries.

```typescript
// src/game/world/graph/WorldGraph.ts
getEntitiesByRelationship<T extends Entity>(
  entityId: string,
  relationship: 'organization' | 'host' | 'contact',
  getRelatedIds: (entity: Entity) => string[]
): T[] {
  const entity = worldRegistry.getEntity(entityId, relationship);
  if (!entity) return [];
  
  const relatedIds = getRelatedIds(entity);
  return relatedIds
    .map(id => worldRegistry.getEntity(id, relationship))
    .filter((e): e is T => e !== undefined);
}
```

---

## 4. Event System

### 4.1 Add Entity Change Events

**Problem**: No way to react to entity registration/changes.

**Solution**: Implement event emitter pattern.

```typescript
// src/game/world/registry/WorldRegistry.ts
type EntityEvent = 'host:registered' | 'host:updated' | 'organization:registered' | 'contact:registered';

class WorldRegistry {
  private eventListeners: Map<EntityEvent, Set<(entity: Entity) => void>> = new Map();
  
  on(event: EntityEvent, callback: (entity: Entity) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.eventListeners.get(event)?.delete(callback);
    };
  }
  
  private emit(event: EntityEvent, entity: Entity): void {
    this.eventListeners.get(event)?.forEach(callback => callback(entity));
  }
  
  registerHost(host: Host): void {
    this.hosts.set(host.id, host);
    this.updateIndexes(host);
    this.emit('host:registered', host);
  }
}

// Usage
worldRegistry.on('host:registered', (host) => {
  console.log(`New host registered: ${host.id}`);
  // Update UI, invalidate cache, etc.
});
```

**Benefits**:
- Decoupled components
- Easy to add new listeners
- Better reactivity

---

## 5. Query Builder Pattern

### 5.1 Fluent Query API

**Problem**: Complex queries require multiple method calls.

**Solution**: Implement query builder pattern.

```typescript
// src/game/world/graph/QueryBuilder.ts
export class GraphQueryBuilder {
  private filters: Array<(entity: Entity) => boolean> = [];
  
  whereHost(condition: (host: Host) => boolean): this {
    this.filters.push((entity) => {
      if (entity.type !== 'host') return false;
      return condition(entity as Host);
    });
    return this;
  }
  
  whereOrganization(condition: (org: Organization) => boolean): this {
    this.filters.push((entity) => {
      if (entity.type !== 'organization') return false;
      return condition(entity as Organization);
    });
    return this;
  }
  
  inNetworkSegment(segment: string): this {
    return this.whereHost(host => host.networkSegment === segment);
  }
  
  discoveredBy(method: string): this {
    return this.whereHost(host => host.discoveryMethods.includes(method));
  }
  
  execute<T extends Entity>(): T[] {
    const allEntities = [
      ...worldRegistry.getAllHosts(),
      ...worldRegistry.getAllOrganizations(),
      ...worldRegistry.getAllContacts(),
    ];
    
    return allEntities.filter(entity => 
      this.filters.every(filter => filter(entity))
    ) as T[];
  }
}

// Usage
const megacorpHosts = new GraphQueryBuilder()
  .whereHost(h => h.organizationId === 'megacorp')
  .inNetworkSegment('megacorp-internal')
  .execute<Host>();
```

**Benefits**:
- More readable queries
- Composable filters
- Type-safe results

---

## 6. Batch Operations

### 6.1 Batch Registration

**Solution**: Support registering multiple entities at once.

```typescript
// src/game/world/registry/WorldRegistry.ts
registerHosts(hosts: Host[]): void {
  hosts.forEach(host => this.registerHost(host));
}

registerBatch(entities: {
  hosts?: Host[];
  organizations?: Organization[];
  contacts?: Contact[];
}): void {
  if (entities.organizations) {
    entities.organizations.forEach(org => this.registerOrganization(org));
  }
  if (entities.hosts) {
    entities.hosts.forEach(host => this.registerHost(host));
  }
  if (entities.contacts) {
    entities.contacts.forEach(contact => this.registerContact(contact));
  }
}
```

---

## 7. Graph Traversal Utilities

### 7.1 Advanced Traversal Methods

**Solution**: Add more graph traversal utilities.

```typescript
// src/game/world/graph/WorldGraph.ts
/**
 * Get all entities reachable from a starting entity
 */
getReachableEntities(
  startId: string,
  getNeighbors: (entity: Entity) => string[],
  maxDepth: number = Infinity
): Entity[] {
  const visited = new Set<string>();
  const queue: Array<{ id: string; depth: number }> = [{ id: startId, depth: 0 }];
  const result: Entity[] = [];
  
  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (visited.has(id) || depth > maxDepth) continue;
    
    visited.add(id);
    const entity = worldRegistry.getEntity(id, 'host'); // Determine type
    if (entity) result.push(entity);
    
    const neighbors = getNeighbors(entity);
    neighbors.forEach(neighborId => {
      if (!visited.has(neighborId)) {
        queue.push({ id: neighborId, depth: depth + 1 });
      }
    });
  }
  
  return result;
}

/**
 * Find all paths between two entities
 */
findAllPaths(fromId: string, toId: string, maxDepth: number = 10): Path[] {
  const paths: Path[] = [];
  const visited = new Set<string>();
  
  const dfs = (current: string, path: string[]) => {
    if (path.length > maxDepth) return;
    if (current === toId) {
      paths.push({ from: fromId, to: toId, hops: path });
      return;
    }
    
    visited.add(current);
    const entity = worldRegistry.getHost(current);
    if (entity?.networkConnections) {
      entity.networkConnections.forEach(conn => {
        if (!visited.has(conn.hostId)) {
          dfs(conn.hostId, [...path, conn.hostId]);
        }
      });
    }
    visited.delete(current);
  };
  
  dfs(fromId, [fromId]);
  return paths;
}
```

---

## 8. Validation Layer

### 8.1 Entity Validator

**Solution**: Centralized validation before registration.

```typescript
// src/game/world/validation/EntityValidator.ts
export class EntityValidator {
  static validateHost(host: Host, registry: WorldRegistry): ValidationResult {
    const errors: string[] = [];
    
    if (!host.id || host.id.trim() === '') {
      errors.push('Host ID is required');
    }
    
    if (!registry.getOrganization(host.organizationId)) {
      errors.push(`Organization ${host.organizationId} does not exist`);
    }
    
    if (host.networkConnections) {
      host.networkConnections.forEach(conn => {
        if (!registry.getHost(conn.hostId)) {
          errors.push(`Network connection references non-existent host: ${conn.hostId}`);
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Usage in registry
registerHost(host: Host): void {
  const validation = EntityValidator.validateHost(host, this);
  if (!validation.valid) {
    throw new Error(`Invalid host: ${validation.errors.join(', ')}`);
  }
  // ... register
}
```

---

## 9. Performance Monitoring

### 9.1 Query Performance Tracking

**Solution**: Track query performance for optimization.

```typescript
// src/game/world/graph/WorldGraph.ts
private queryMetrics: Map<string, { count: number; totalTime: number }> = new Map();

private trackQuery<T>(queryName: string, queryFn: () => T): T {
  const start = performance.now();
  const result = queryFn();
  const duration = performance.now() - start;
  
  const metrics = this.queryMetrics.get(queryName) || { count: 0, totalTime: 0 };
  metrics.count++;
  metrics.totalTime += duration;
  this.queryMetrics.set(queryName, metrics);
  
  return result;
}

getQueryStats(): Record<string, { avgTime: number; count: number }> {
  const stats: Record<string, { avgTime: number; count: number }> = {};
  this.queryMetrics.forEach((metrics, queryName) => {
    stats[queryName] = {
      avgTime: metrics.totalTime / metrics.count,
      count: metrics.count,
    };
  });
  return stats;
}
```

---

## 10. Recommended Implementation Order

### Phase 1: Critical Performance (High Priority)
1. ✅ Add reverse indexes for common queries
2. ✅ Add query result caching
3. ✅ Remove `any` types

### Phase 2: Data Integrity (Medium Priority)
4. ✅ Add relationship validation
5. ✅ Maintain bidirectional relationships
6. ✅ Add entity validator

### Phase 3: Developer Experience (Medium Priority)
7. ✅ Add event system
8. ✅ Add query builder pattern
9. ✅ Add batch operations

### Phase 4: Advanced Features (Low Priority)
10. ✅ Add graph traversal utilities
11. ✅ Add performance monitoring
12. ✅ Add generic query types

---

## Summary

These improvements will:
- **Improve performance** by 10-100x for common queries
- **Prevent bugs** through validation and type safety
- **Enhance developer experience** with better APIs
- **Enable advanced features** like graph traversal
- **Maintain scalability** as the game grows

The most impactful changes are:
1. **Indexes** - Immediate performance boost
2. **Validation** - Prevents runtime errors
3. **Event system** - Enables reactive updates

Start with Phase 1 for immediate benefits, then proceed based on needs.

