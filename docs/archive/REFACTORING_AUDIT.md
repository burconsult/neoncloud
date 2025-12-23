# Codebase Refactoring Audit

## Summary
Comprehensive scan for legacy code, refactoring candidates, and unimplemented logic.

## Issues Found

### 1. Type Safety Issues (High Priority)

#### Type Casts (`as any`, `as unknown`)
**Locations:**
- `src/game/world/entities/hosts/server-01.ts:56` - `return null as any`
- `src/game/world/entities/hosts/server-02.ts:56` - `return null as any`
- `src/game/tools/toolLoader.ts:70` - `as unknown as number`
- `src/game/world/discovery/DiscoveryStore.ts:137` - `as unknown as DiscoveryStatePersisted`
- `src/game/state/useMissionStore.ts:274` - `as unknown as MissionStatePersisted`
- `src/game/state/useMissionPanelStore.ts:85` - `as unknown as MissionPanelStatePersisted`
- `src/game/state/useEducationalStore.ts:65` - `as unknown as EducationalStatePersisted`
- `src/game/world/graph/WorldGraph.ts:153` - `as any` for discovery method

**Action:** Fix type casts with proper type guards or refactoring.

#### @ts-ignore Usage
**Locations:**
- `src/game/commands/debugCommands.ts:32, 180` - `@ts-ignore` for `import.meta.env.DEV`

**Action:** Create proper type definitions or use conditional compilation.

### 2. TODO Items / Unimplemented Logic (Medium Priority)

#### Vendor Access Requirements
**Location:** `src/game/state/useInventoryStore.ts:64`
```typescript
// TODO: Implement full vendor access requirement checking
```
**Status:** Partially implemented, needs completion

#### Server Password Cracking
**Location:** `src/game/tools/modules/passwordCracker.ts:314`
```typescript
// Note: This is a placeholder for future server password cracking
```
**Status:** Unimplemented feature

#### Perfect Completion Tracking
**Location:** `src/game/state/useMissionStore.ts:176`
```typescript
perfectCompletion: true, // TODO: Check if all tasks completed perfectly
noHints: true, // TODO: Track hint usage
```
**Status:** Unimplemented tracking logic

#### Storage Usage Tracking
**Location:** `src/game/state/useInventoryStore.ts:19, 149`
```typescript
getStorageUsage: () => number; // For future use
// For future implementation - track actual file system usage
```
**Status:** Interface exists but not implemented

### 3. Console.log Statements (Medium Priority)

**Found 15 instances** that should be:
- Removed for production
- Replaced with proper logging utility
- Or kept only for development

**Locations:**
- `src/game/state/useInventoryStore.ts` (5 instances)
- `src/game/tools/ToolModule.ts` (1 instance)
- `src/game/missions/missionLoader.ts` (1 instance)
- `src/game/world/loader.ts` (1 instance)
- `src/game/world/discovery/DiscoveryStore.ts` (3 instances)
- `src/game/missions/modules/01_01_welcome.ts` (1 instance)
- `src/game/tools/modules/passwordCracker.ts` (1 instance - console.error)

**Action:** Create a logging utility or remove/replace with proper logging.

### 4. Legacy Code (Low Priority - Educational Value)

#### Legacy DNS Zones
**Location:** `src/game/network/dnsSimulation.ts:119`
- Educational domains (example.com, dns.google, etc.)
- Used as fallback when not found in world registry
- **Status:** Keep for educational purposes

#### Legacy Network Hosts
**Location:** `src/game/network/networkSimulation.ts:56`
- Educational hosts (gateway, dns servers)
- Used as fallback when not found in world registry
- **Status:** Keep for educational purposes

### 5. Hardcoded Mappings (Medium Priority)

#### Purchase Task Mapping
**Location:** `src/game/state/useInventoryStore.ts:106`
```typescript
const purchaseTaskMap: Record<string, Record<string, string>> = {
  'n00b-01': { ... },
  'n00b-02': { ... },
};
```
**Issue:** Hardcoded mission-to-task mapping
**Action:** Move to mission modules or create a registry

#### Mission Expected Times
**Location:** `src/game/time/missionTimer.ts:15`
```typescript
export const MISSION_EXPECTED_TIMES: Record<string, number> = {
  'welcome-00': 5 * 60,
  // ...
};
```
**Issue:** Hardcoded times, should be in mission modules
**Action:** Add to MissionModule interface

#### Upgrade Paths
**Location:** `src/game/inventory/inventoryTypes.ts:118`
```typescript
const upgradePaths: Record<string, string> = {
  'vpn-premium': 'vpn-basic',
  // ...
};
```
**Issue:** Hardcoded upgrade relationships
**Action:** Move to tool modules or create upgrade registry

### 6. Inconsistent Patterns (Low Priority)

#### File System Factory
**Locations:** `server-01.ts`, `server-02.ts`
- Returns `null as any` but works via fallback
- **Action:** Properly implement or document the pattern

#### Command Organization
- Inline commands in `commandRegistry.ts` (fine for simple commands)
- Tool commands in modules (good)
- Network commands in separate files (good)
- **Status:** Acceptable, but could be more consistent

### 7. Deprecated/Comments (Low Priority)

#### Deprecated challengeGenerator.ts
**Location:** `src/game/challenges/challengeGenerator.ts:4`
- Marked as DEPRECATED but still used for backward compatibility
- **Status:** Acceptable as wrapper

#### Outdated Comments
- Various "Note:" and "TODO:" comments
- Some reference future features
- **Action:** Clean up or implement

### 8. Unused/Dead Code (Low Priority)

#### Unused Interface Methods
**Location:** `src/game/state/useInventoryStore.ts`
- `getStorageUsage()` defined but not used
- **Action:** Remove or implement

## Recommended Refactoring Order

### Phase 1: Type Safety (High Priority)
1. Fix `as any` casts in host fileSystemFactory
2. Replace @ts-ignore with proper types
3. Fix discovery method type casting

### Phase 2: Unimplemented Features (Medium Priority)
1. Complete vendor access requirement checking
2. Implement perfect completion tracking
3. Move purchase task mapping to mission modules
4. Move mission expected times to mission modules

### Phase 3: Code Quality (Medium Priority)
1. Create logging utility
2. Replace console.log with proper logging
3. Remove unused methods or implement them

### Phase 4: Consistency (Low Priority)
1. Move upgrade paths to tool modules
2. Document file system factory pattern
3. Clean up outdated comments

### Phase 5: Future Features (Optional)
1. Implement server password cracking
2. Implement storage usage tracking
3. Implement contact system

## Files to Refactor

### High Priority
- `src/game/world/entities/hosts/server-01.ts`
- `src/game/world/entities/hosts/server-02.ts`
- `src/game/commands/debugCommands.ts`
- `src/game/world/graph/WorldGraph.ts`

### Medium Priority
- `src/game/state/useInventoryStore.ts`
- `src/game/state/useMissionStore.ts`
- `src/game/time/missionTimer.ts`
- `src/game/inventory/inventoryTypes.ts`

### Low Priority
- `src/game/tools/modules/passwordCracker.ts`
- Various files with console.log

