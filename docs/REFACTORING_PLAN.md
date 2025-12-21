# Refactoring Plan: Modular System Cleanup

## Goals
1. Remove legacy code and hardcoded systems
2. Increase modularity and abstraction
3. Integrate challenge generator meaningfully or remove it
4. Complete file system factory implementation

## Tasks

### 1. Challenge Generator Refactoring
**Current State:**
- Used for root access (`su` command)
- Generates math/logic/pattern puzzles
- Has hint system that could be reused

**Options:**
- **Option A**: Keep as-is (it's functional for root access)
- **Option B**: Refactor into modular hint system for missions
- **Option C**: Remove and simplify root access

**Decision**: Refactor into modular hint/challenge system that missions can use for educational puzzles. Keep root access functionality.

### 2. Remove Legacy SOFTWARE_CATALOG
**Current State:**
- Large hardcoded catalog with duplicate definitions
- Most tools already in tool modules
- Some items (storage upgrades, network analyzer, firewall bypass) not yet in modules

**Action Plan:**
- Keep only non-tool items (storage upgrades) in minimal catalog
- Remove all tool definitions (they're in tool modules)
- Update all references to use tool modules

### 3. Remove toolDurations.ts
**Current State:**
- Hardcoded duration map
- Redundant with tool module durations

**Action Plan:**
- Remove `toolDurations.ts`
- Use `toolRegistry.getDurationBySoftwareId()` directly
- Update `getToolDuration()` call in `toolCommands.ts`

### 4. Complete File System Factory
**Current State:**
- Partially implemented in host entities
- Still falls back to hardcoded systems

**Action Plan:**
- Implement proper file system factories in host entities
- Remove hardcoded switch statement in `getServerFileSystem()`

