# World Graph System - Current Status

## Overview

This document provides a clear assessment of what's **actually implemented** vs what's **planned**, focusing on getting the core graph system solid before building on it.

---

## ✅ Core Infrastructure (IMPLEMENTED)

### 1. World Registry (`src/game/world/registry/WorldRegistry.ts`)
**Status**: ✅ Fully Implemented

- ✅ Central storage for all entities (Hosts, Organizations, Contacts, Vendors)
- ✅ Registration methods for each entity type
- ✅ Retrieval methods (get, getAll, find by IP/domain/email)
- ✅ Generic entity lookup
- ✅ Clear method for hot reload

**Current Entities Registered**:
- Organizations: 2 (neoncloud, megacorp)
- Contacts: 1 (agent-smith)
- Hosts: 3 (localhost, server-01, server-02)

**Usage**: ✅ Used in `loader.ts` to register entities at startup

### 2. World Graph (`src/game/world/graph/WorldGraph.ts`)
**Status**: ✅ Implemented (Basic Queries)

- ✅ Relationship queries (getHostsByOrganization, getOrganizationByHost)
- ✅ Mission-related queries (getHostsByMission, getOrganizationsByMission)
- ✅ Network topology queries (getConnectedHosts, findPath)
- ✅ Discovery queries (getHostsByDiscoveryMethod)
- ✅ Vendor queries (getVendorsByTool)
- ✅ Domain/IP queries (findOrganizationByDomain, getHostsByIPRange)

**Limitations**:
- ⚠️ No indexes (queries iterate through all entities)
- ⚠️ No caching
- ⚠️ Some queries use `any` types

**Usage**: ✅ Used in `missionLoader.ts` for entity discovery

### 3. Discovery System (`src/game/world/discovery/DiscoveryStore.ts`)
**Status**: ✅ Fully Implemented

- ✅ Tracks discovered hosts, organizations, contacts
- ✅ Tracks DNS lookups and scanned IP ranges
- ✅ Persistent storage with proper Set serialization
- ✅ Methods: discoverHost, discoverOrganization, discoverContact

**Usage**: ✅ Used throughout for tracking player knowledge

### 4. World Graph Queries (`src/game/world/graph/WorldGraphQueries.ts`)
**Status**: ✅ Implemented (High-Level Helpers)

- ✅ Mission queries (getMissionTargetHosts, getMissionsByHost)
- ✅ Email queries (getEmailsByMission, getEmailsByHost)
- ✅ Tool queries (getToolsByVendor, getVendorByTool)
- ✅ Display name helpers

**Usage**: ✅ Available but not heavily used yet

---

## ⚠️ Partial Integration

### 1. Mission System Integration
**Status**: ⚠️ Partially Integrated

**What Works**:
- ✅ Mission modules define `targetHostIds`, `targetOrganizationIds`, `involvedContactIds`
- ✅ `initializeMission()` discovers entities via world graph
- ✅ Missions can reference world entities by ID

**What's Missing**:
- ❌ Mission descriptions still hardcode entity names (e.g., "server-01", "Megacorp")
- ❌ Task objectives/hints hardcode entity references
- ❌ Mission event handlers still check hardcoded IDs

**Files**:
- ✅ `src/game/missions/MissionModule.ts` - Has worldGraph properties
- ⚠️ `src/game/missions/modules/*.ts` - Define relationships but hardcode names
- ⚠️ `src/game/missions/missionEventHandlers.ts` - Hardcoded checks

### 2. Email System Integration
**Status**: ⚠️ Partially Integrated

**What Works**:
- ✅ Email interface has `worldGraph` properties
- ✅ Email templates define relationships

**What's Missing**:
- ❌ Email content hardcodes entity names
- ❌ No email sending system (only receiving)
- ❌ No email response system

**Files**:
- ✅ `src/types/email.ts` - Has worldGraph interface
- ⚠️ `src/game/emails/emailTemplates.ts` - Hardcodes names in content

### 3. Tool System Integration
**Status**: ⚠️ Partially Integrated

**What Works**:
- ✅ Tool modules define `vendorId`
- ✅ Tools can reference vendors

**What's Missing**:
- ❌ Vendor access requirements not fully checked
- ❌ Tool availability not fully queried through graph

**Files**:
- ✅ `src/game/tools/ToolModule.ts` - Has vendorId
- ⚠️ `src/game/state/useInventoryStore.ts` - Partial vendor checking

### 4. Filesystem Integration
**Status**: ✅ Fully Integrated

- ✅ Host filesystems defined in host entity files
- ✅ Filesystems retrieved through world registry
- ✅ No hardcoded filesystem references

**Files**:
- ✅ `src/game/world/entities/hosts/*.ts` - Define fileSystemFactory
- ✅ `src/game/filesystem/serverFileSystems.ts` - Queries registry

---

## ❌ Not Yet Implemented

### 1. Performance Optimizations
- ❌ No indexes for common queries
- ❌ No query result caching
- ❌ Queries iterate through all entities

### 2. Relationship Integrity
- ❌ No validation that referenced entities exist
- ❌ No bidirectional relationship maintenance
- ❌ No relationship registry

### 3. Event System
- ❌ No entity change events
- ❌ No automatic relationship updates on events

### 4. Advanced Features
- ❌ No email sending system
- ❌ No credential extraction system
- ❌ No social engineering system

---

## Current Usage Analysis

### Where World Graph IS Used ✅

1. **Mission Initialization** (`missionLoader.ts`)
   ```typescript
   // Discovers entities when mission starts
   worldGraph.getOrganizationsByMission(missionId)
   worldGraph.getHostsByMission(missionId)
   worldGraph.getContactsByMission(missionId)
   ```

2. **Server Connection** (`toolCommands.ts`)
   ```typescript
   // Validates host exists via registry
   const host = worldRegistry.getHost(server)
   ```

3. **Filesystem Retrieval** (`serverFileSystems.ts`)
   ```typescript
   // Gets filesystem from host entity
   const host = worldRegistry.getHost(serverId)
   return host.fileSystemFactory()
   ```

### Where World Graph SHOULD Be Used But Isn't ⚠️

1. **Mission Event Handlers** (`missionEventHandlers.ts`)
   - Currently checks hardcoded IDs like `'server-01'`, `'server-02'`
   - Should query: `worldGraph.getHostsByMission(missionId)`

2. **Email Content** (`emailTemplates.ts`)
   - Hardcodes "server-01", "Megacorp" in email body
   - Should use: `worldGraph.getHostDisplayName(hostId)`

3. **Mission Descriptions** (mission modules)
   - Hardcodes entity names in descriptions/hints
   - Should use graph queries for dynamic content

4. **DNS Simulation** (`dnsSimulation.ts`)
   - May have hardcoded host lookups
   - Should use: `worldRegistry.findHostByDomain()`

5. **Network Simulation** (`networkSimulation.ts`)
   - May have hardcoded host references
   - Should use: `worldRegistry.findHostByIP()`

---

## Critical Path: Making Graph System Solid

### Phase 1: Complete Current Integration (HIGH PRIORITY)

**Goal**: Remove all hardcoded entity references, use graph everywhere

#### 1.1 Mission System
- [ ] Update mission event handlers to use graph queries
- [ ] Replace hardcoded host IDs with graph queries
- [ ] Use display names from graph instead of hardcoded names

#### 1.2 Email System
- [ ] Replace hardcoded names in email content with graph queries
- [ ] Use `getHostDisplayName()`, `getOrganizationDisplayName()` helpers

#### 1.3 Command System
- [ ] Ensure all commands use graph for entity lookups
- [ ] Replace hardcoded checks with graph queries

#### 1.4 DNS/Network Simulation
- [ ] Verify using `worldRegistry.findHostByDomain()`
- [ ] Verify using `worldRegistry.findHostByIP()`

### Phase 2: Add Performance Optimizations (MEDIUM PRIORITY)

**Goal**: Make graph queries fast and scalable

- [ ] Add reverse indexes in WorldRegistry
- [ ] Add query result caching in WorldGraph
- [ ] Remove `any` types, improve type safety

### Phase 3: Add Relationship Integrity (MEDIUM PRIORITY)

**Goal**: Ensure relationships are valid and consistent

- [ ] Add relationship validation on registration
- [ ] Maintain bidirectional relationships automatically
- [ ] Add relationship registry for centralized management

### Phase 4: Add Event System (LOW PRIORITY)

**Goal**: Enable reactive updates

- [ ] Add entity change events
- [ ] Auto-update relationships on events
- [ ] Enable reactive UI updates

---

## ✅ Completed: Hardcoded References Removed

### 1. Mission Event Handlers ✅
- ✅ `src/game/missions/missionEventHandlers.ts` - All hardcoded IDs replaced with `getMissionTargetHosts()`
- ✅ Server connection/disconnection/file reading checks now use graph queries
- ✅ New missions work automatically without code changes

### 2. Email Templates ✅
- ✅ `src/game/emails/emailTemplates.ts` - All hardcoded names replaced with display name helpers
- ✅ Uses `getHostDisplayName()` and `getOrganizationDisplayName()`
- ✅ Dynamically gets IP addresses and IP ranges from world registry
- ✅ Email content generated from graph data

### 3. Mission Modules ✅
- ✅ `src/game/missions/modules/02_01_first_hack.ts` - All descriptions/hints use dynamic helpers
- ✅ `src/game/missions/modules/02_02_data_extraction.ts` - All descriptions/hints use dynamic helpers
- ✅ Created `missionContentHelpers.ts` for reusable dynamic content generation
- ✅ Mission titles, descriptions, objectives, and hints all flow through graph

### 4. Network/DNS Simulation ✅
- ✅ `src/game/network/dnsSimulation.ts` - Already uses `worldRegistry.findHostByDomain()`
- ✅ `src/game/network/networkSimulation.ts` - Already uses `worldRegistry.findHostByIP()`

---

## Success Criteria

The graph system will be "solid" when:

1. ✅ **Zero hardcoded entity IDs** in mission/email/command logic - **COMPLETE**
2. ✅ **All entity lookups** go through world registry - **COMPLETE**
3. ✅ **All relationship queries** go through world graph - **COMPLETE**
4. ✅ **Dynamic content** uses graph queries (display names, etc.) - **COMPLETE**
5. ⚠️ **Performance** is acceptable (indexes for common queries) - **TODO: Add indexes**
6. ⚠️ **Integrity** is maintained (validation, bidirectional relationships) - **TODO: Add validation**

---

## Next Steps

1. **Audit**: Find all hardcoded references
2. **Replace**: Update to use graph queries
3. **Test**: Ensure everything still works
4. **Optimize**: Add indexes and caching
5. **Validate**: Add relationship integrity checks

---

## Files Summary

### Core Graph System ✅
- `src/game/world/registry/WorldRegistry.ts` - ✅ Complete
- `src/game/world/graph/WorldGraph.ts` - ✅ Complete (basic)
- `src/game/world/graph/WorldGraphQueries.ts` - ✅ Complete
- `src/game/world/discovery/DiscoveryStore.ts` - ✅ Complete

### Entity Definitions ✅
- `src/game/world/entities/organizations/*.ts` - ✅ Complete
- `src/game/world/entities/contacts/*.ts` - ✅ Complete
- `src/game/world/entities/hosts/*.ts` - ✅ Complete (with filesystems)

### Integration Points ⚠️
- `src/game/missions/missionLoader.ts` - ✅ Uses graph
- `src/game/missions/missionEventHandlers.ts` - ⚠️ Needs graph queries
- `src/game/emails/emailTemplates.ts` - ⚠️ Needs graph queries
- `src/game/commands/toolCommands.ts` - ✅ Uses registry
- `src/game/filesystem/serverFileSystems.ts` - ✅ Uses registry

---

## Conclusion

**Current State**: Core graph infrastructure is solid ✅
**Gap**: Integration is incomplete - hardcoded references remain ⚠️
**Priority**: Complete integration before adding new features

**Focus**: Remove hardcoded references, use graph everywhere, then optimize.

