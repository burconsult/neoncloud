# Codebase Cleanup Plan

## Unused Functionality

### 1. Diagram Component (NOT USED)
- **Files**: 
  - `src/components/ui/Diagram.tsx`
  - `src/utils/diagramGenerator.ts`
  - `src/styles/diagrams.css`
- **Status**: Created but never imported/used
- **Action**: Document as available for future use, or remove if not needed
- **Decision**: Keep but document as "available for future educational content"

### 2. Asset Loader - Diagram Path (NOT USED)
- **File**: `src/utils/assetLoader.ts`
- **Function**: `getDiagramPath()` - not used anywhere
- **Action**: Remove or keep for future use
- **Decision**: Keep for future use

### 3. EducationalContent Type (PARTIALLY USED)
- **File**: `src/types/index.ts`
- **Status**: Defined but only used in Command type, not actively used
- **Action**: Keep - may be used for future educational content integration

### 4. Challenge Generator (DEPRECATED BUT USED)
- **File**: `src/game/challenges/challengeGenerator.ts`
- **Status**: Marked deprecated, re-exports from challengeLoader
- **Action**: Migrate remaining usages to challengeLoader, then remove wrapper
- **Files using it**: 
  - `src/game/state/useChallengeStore.ts`
  - `src/game/save/saveSystem.ts`

## Legacy Code

### 1. Deprecated Challenge Generator
- **Action**: Migrate to challengeLoader directly

### 2. REFACTORING_AUDIT.md
- **Status**: Outdated - many items completed
- **Action**: Update with current status or archive

## Documentation Cleanup

### Archive These (Outdated/Completed):
- `docs/REFACTORING_AUDIT.md` - Most items completed
- `docs/REFACTORING_PLAN.md` - Completed
- `docs/WORLD_GRAPH_IMPROVEMENTS.md` - Superseded by new docs
- `docs/WORLD_GRAPH_IMPLEMENTATION_SUMMARY.md` - Superseded by new docs
- `docs/WORLD_SYSTEM_STATUS.md` - Superseded by WORLD_GRAPH_IMPLEMENTATION_STATUS.md

### Keep These (Current/Useful):
- `docs/WORLD_GRAPH.md` - Complete consolidated world graph documentation (architecture, usage, status, mapping)
- `docs/WORLD_GRAPH_MINDMAP.md` - Visual representation of world graph
- `docs/REFACTORING_COMPLETE.md` - Summary of completed work
- `docs/MISSION_CREATION_GUIDE.md` - Active guide
- `docs/architecture.md` - Main architecture doc
- `docs/game-design.md` - Game design doc

## Action Items

1. ✅ Document Diagram component as available for future use
2. ✅ Migrate challengeGenerator.ts usages to challengeLoader
3. ✅ Archive outdated documentation
4. ✅ Update REFACTORING_AUDIT.md or archive it
5. ✅ Clean up unused imports/comments

