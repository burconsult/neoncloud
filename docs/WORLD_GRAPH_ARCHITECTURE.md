# World Graph Architecture - Complete System Design

## Overview

The World Graph is the central abstraction layer that ties all game assets together. Nothing should be hardcoded - everything flows through the graph/registry system, making the game infinitely expandable.

## Core Principle

**All game entities are defined as modular assets and connected through the World Graph.**

## Entity Types

### 1. Organizations
- **Purpose**: Companies, groups, institutions in the game world
- **Examples**: NeonCloud, Megacorp, other corporations
- **Properties**: 
  - Can be vendors (sell tools)
  - Can have contacts
  - Can own hosts
  - Can be mission targets/clients

### 2. Hosts
- **Purpose**: Servers, computers, network devices
- **Examples**: server-01, server-02, localhost, gateways
- **Properties**:
  - Belong to organizations
  - Have file systems
  - Have security configurations
  - Have DNS records
  - Can be mission targets

### 3. Contacts
- **Purpose**: NPCs, agents, people in the game world
- **Examples**: Agent Smith, mission contacts
- **Properties**:
  - Belong to organizations
  - Can send emails
  - Can provide missions
  - Can be discovered

### 4. Vendors
- **Purpose**: Organizations that sell tools/software
- **Properties**:
  - Extends Organization
  - Has tool catalog
  - Has pricing
  - Has access requirements

## Current Implementation Status

### ✅ Implemented
- World Registry (central storage)
- World Graph (relationship queries)
- Discovery System (player knowledge tracking)
- Modular entity definitions (organizations, hosts, contacts)
- Basic graph queries

### ⚠️ Partially Implemented
- Mission-to-world connections (some hardcoded)
- Email-to-world connections (some hardcoded)
- Tool-to-vendor connections (basic implementation)

### ❌ Missing/Incomplete
- Mission asset definitions (missions not in world graph)
- Email asset definitions (emails not in world graph)
- Tool asset definitions (tools partially in graph)
- Comprehensive relationship mapping
- Asset discovery through graph traversal

## Architecture Design

### Asset Definition Pattern

Every game asset should follow this pattern:

```typescript
// 1. Define the asset entity
export const myAsset: AssetType = {
  id: 'unique-id',
  // ... properties
  // Relationships defined by IDs
  organizationId: 'neoncloud',
  relatedHostIds: ['server-01'],
  // ...
};

// 2. Register in world registry
worldRegistry.registerAsset(myAsset);

// 3. Query through world graph
const related = worldGraph.getRelatedAssets(myAsset.id);
```

### Relationship Types

1. **Ownership**: Organization → Hosts, Contacts
2. **Vendor**: Organization → Tools
3. **Mission Target**: Mission → Hosts, Organizations
4. **Mission Client**: Mission → Organization
5. **Email Sender**: Email → Contact/Organization
6. **Tool Provider**: Tool → Vendor/Organization
7. **Discovery Chain**: Player → Discovered Entities

## Proposed Structure

### Mission Assets
Missions should be assets in the world graph:
- Mission → Organization (client/employer)
- Mission → Hosts (targets)
- Mission → Contacts (briefing contact)
- Mission → Tools (required/purchasable)

### Email Assets
Emails should reference world entities:
- Email → Contact (sender)
- Email → Organization (from organization)
- Email → Mission (related mission)
- Email → Hosts (mentioned hosts)

### Tool Assets
Tools should be fully integrated:
- Tool → Vendor (seller)
- Tool → Organization (provider)
- Tool → Missions (required by missions)

## Implementation Plan

### Phase 1: Asset Registry Extension
- Extend WorldRegistry to handle all asset types
- Create unified asset interface
- Add relationship tracking

### Phase 2: Mission Integration
- Move mission-to-world connections to graph
- Remove hardcoded host/organization references
- Use graph queries for mission requirements

### Phase 3: Email Integration
- Connect emails to world entities
- Use graph for email routing
- Dynamic email generation from graph

### Phase 4: Tool Integration
- Complete vendor-to-tool connections
- Tool availability through graph
- Tool requirements from graph

### Phase 5: Discovery System
- Asset discovery through graph traversal
- Progressive revelation of game world
- Discovery-based mission unlocking

## Benefits

1. **Infinite Expandability**: Add new assets without code changes
2. **Consistency**: All relationships tracked in one place
3. **Query Power**: Find related assets easily
4. **Dynamic Content**: Generate missions/emails from graph
5. **Testing**: Easy to test relationships
6. **Modularity**: Each asset is self-contained
