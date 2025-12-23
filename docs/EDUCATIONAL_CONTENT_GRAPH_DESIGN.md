# Educational Content, Tips, and Lore - Graph Integration Design

## Overview

Educational content, tips, and lore should be integrated into the world graph system, making them discoverable, queryable, and modular.

## Current State

### Educational Content
- **EducationalPopup** component exists and is used
- **EducationalContent** type defined but not fully utilized
- **useEducationalStore** manages popup state
- Content is currently hardcoded in commands/missions

### Lore System
- **LoreEntry** type exists
- **useLoreStore** manages lore entries
- Lore entries are unlocked by missions
- Not connected to world graph

### Tips/Hints
- Mission tasks have hints
- Challenge system has hints
- Not unified or graph-connected

## Proposed Architecture

### 1. Educational Content as Graph Assets

```typescript
// src/game/world/types/EducationalContent.ts
export interface EducationalContent {
  id: string;
  title: string;
  content: string; // Markdown supported
  type: 'concept' | 'example' | 'diagram' | 'interactive' | 'tip' | 'warning';
  
  // World Graph Relationships
  worldGraph?: {
    relatedHostIds?: string[]; // Hosts this content relates to
    relatedOrganizationIds?: string[]; // Organizations
    relatedCommandIds?: string[]; // Commands this explains
    relatedMissionIds?: string[]; // Missions that unlock this
    relatedToolIds?: string[]; // Tools this explains
    prerequisiteContentIds?: string[]; // Content that must be seen first
  };
  
  // Display Configuration
  trigger?: {
    type: 'command-first-use' | 'mission-start' | 'mission-task' | 'manual';
    commandName?: string; // For command-first-use
    missionId?: string; // For mission triggers
    taskId?: string; // For task triggers
  };
  
  // Metadata
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: 'networking' | 'security' | 'tools' | 'general';
  tags?: string[];
}
```

### 2. Lore as Graph Assets

```typescript
// src/game/world/types/Lore.ts (extend existing)
export interface LoreEntry {
  id: string;
  title: string;
  content: string; // Markdown supported
  category: 'world' | 'organization' | 'technology' | 'mission' | 'character';
  
  // World Graph Relationships
  worldGraph?: {
    relatedOrganizationIds?: string[]; // Organizations this lore is about
    relatedHostIds?: string[]; // Hosts mentioned
    relatedContactIds?: string[]; // Contacts involved
    relatedMissionIds?: string[]; // Missions that unlock this
    prerequisiteLoreIds?: string[]; // Lore that must be unlocked first
  };
  
  // Unlock Configuration
  unlockConditions?: {
    type: 'mission-complete' | 'discovery' | 'manual';
    missionId?: string;
    hostId?: string;
    organizationId?: string;
  };
  
  // Metadata
  unlockedAt?: number; // Timestamp when unlocked
  tags?: string[];
}
```

### 3. Tips as Graph Assets

```typescript
// src/game/world/types/Tip.ts
export interface Tip {
  id: string;
  content: string; // Short tip text
  type: 'hint' | 'tip' | 'warning' | 'info';
  
  // World Graph Relationships
  worldGraph?: {
    relatedCommandIds?: string[]; // Commands this tip helps with
    relatedMissionIds?: string[]; // Missions this tip applies to
    relatedTaskIds?: string[]; // Specific tasks
    relatedToolIds?: string[]; // Tools this tip is about
  };
  
  // Display Configuration
  context?: 'mission-task' | 'command-help' | 'tool-usage' | 'general';
  difficulty?: 'easy' | 'medium' | 'hard';
  
  // Metadata
  tags?: string[];
}
```

## Integration Points

### 1. World Registry Extension

```typescript
// Extend WorldRegistry to handle educational content
class WorldRegistry {
  // ... existing methods
  
  registerEducationalContent(content: EducationalContent): void;
  getEducationalContent(id: string): EducationalContent | undefined;
  getAllEducationalContent(): EducationalContent[];
  
  registerLore(lore: LoreEntry): void;
  getLore(id: string): LoreEntry | undefined;
  getAllLore(): LoreEntry[];
  
  registerTip(tip: Tip): void;
  getTip(id: string): Tip | undefined;
  getAllTips(): Tip[];
}
```

### 2. World Graph Queries

```typescript
// Extend WorldGraph with educational content queries
class WorldGraph {
  // ... existing methods
  
  // Educational Content Queries
  getEducationalContentByCommand(commandId: string): EducationalContent[];
  getEducationalContentByMission(missionId: string): EducationalContent[];
  getEducationalContentByHost(hostId: string): EducationalContent[];
  getEducationalContentByTool(toolId: string): EducationalContent[];
  
  // Lore Queries
  getLoreByOrganization(orgId: string): LoreEntry[];
  getLoreByMission(missionId: string): LoreEntry[];
  getLoreByHost(hostId: string): LoreEntry[];
  
  // Tip Queries
  getTipsByCommand(commandId: string): Tip[];
  getTipsByMission(missionId: string): Tip[];
  getTipsByTask(missionId: string, taskId: string): Tip[];
}
```

### 3. Mission Integration

```typescript
// MissionModule extension
export interface MissionModule {
  // ... existing properties
  
  educationalContent?: {
    // Content unlocked when mission starts
    startContentIds?: string[];
    // Content unlocked when mission completes
    completeContentIds?: string[];
    // Content unlocked per task
    taskContentMapping?: Record<string, string[]>; // taskId -> contentIds[]
  };
  
  lore?: {
    // Lore unlocked when mission starts
    startLoreIds?: string[];
    // Lore unlocked when mission completes
    completeLoreIds?: string[];
  };
  
  tips?: {
    // Tips available during mission
    tipIds?: string[];
    // Tips per task
    taskTipMapping?: Record<string, string[]>; // taskId -> tipIds[]
  };
}
```

## Implementation Plan

### Phase 1: Type Definitions
1. Create `EducationalContent` type with worldGraph relationships
2. Extend `LoreEntry` type with worldGraph relationships
3. Create `Tip` type with worldGraph relationships

### Phase 2: Registry Extension
1. Extend WorldRegistry to handle educational content, lore, tips
2. Create loader for educational content modules
3. Create loader for lore modules
4. Create loader for tip modules

### Phase 3: Graph Queries
1. Add educational content queries to WorldGraph
2. Add lore queries to WorldGraph
3. Add tip queries to WorldGraph

### Phase 4: Integration
1. Update MissionModule to reference content/lore/tips by ID
2. Update command system to query educational content
3. Update educational popup system to use graph queries
4. Update lore system to use graph queries

### Phase 5: Module Creation
1. Create educational content modules (one per concept)
2. Create lore modules (one per lore entry)
3. Create tip modules (organized by context)

## Benefits

1. **Modularity**: Each piece of content is self-contained
2. **Discoverability**: Find content through graph queries
3. **Relationships**: Content connected to commands, missions, hosts, etc.
4. **Consistency**: All content flows through graph
5. **Expandability**: Add new content without code changes

## Example Structure

```
src/game/world/entities/
├── educational/
│   ├── index.ts
│   ├── networking/
│   │   ├── ping-concept.ts
│   │   ├── dns-resolution.ts
│   │   └── network-topology.ts
│   ├── security/
│   │   ├── vpn-anonymity.ts
│   │   └── password-security.ts
│   └── tools/
│       ├── network-scanner.ts
│       └── password-cracker.ts
├── lore/
│   ├── index.ts
│   ├── organizations/
│   │   ├── neoncloud-org.ts
│   │   └── megacorp-org.ts
│   └── world/
│       └── cyberoperations.ts
└── tips/
    ├── index.ts
    ├── commands/
    │   ├── ping-tips.ts
    │   └── connect-tips.ts
    └── missions/
        └── n00b-01-tips.ts
```

## Next Steps

1. Complete host filesystem integration (current task)
2. Design educational content module structure
3. Create type definitions
4. Extend registry and graph
5. Migrate existing content to modules
6. Update systems to use graph queries

