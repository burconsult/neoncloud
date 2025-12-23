# Host ID Migration Plan

## Problem Statement

Current host IDs like `server-01`, `server-02` will cause conflicts as more organizations and hosts are added. We need a unique, scalable ID system.

## Proposed Solution: Hierarchical ID System

### Format
- Pattern: `{org-id}-{host-name}`
- Examples:
  - `megacorp-server-01` (instead of `server-01`)
  - `megacorp-webserver` (instead of `megacorp-webserver` - already correct!)
  - `megacorp-database-01` (instead of `server-02`)
  - `neoncloud-dns-server` (for future hosts)

### Benefits
1. **Uniqueness**: Guaranteed unique across all organizations
2. **Readability**: Still human-readable and self-documenting
3. **Scalability**: Easy to add new hosts without conflicts
4. **Graph Integration**: Makes ownership clear in the graph system
5. **Minimal Display Impact**: `displayName` remains user-friendly ("Server-01", "Web Server")

### Migration Strategy

1. **Update Host Definitions**
   - Change `id` field to hierarchical format
   - Keep `name` as short identifier (for internal use)
   - Keep `displayName` as user-facing name

2. **Update All References**
   - Mission task solutions
   - Email templates
   - Credential file naming patterns
   - Connection store keys
   - File system IDs
   - Mission target host IDs

3. **Backwards Compatibility**
   - Add helper function to resolve old IDs to new IDs (for legacy save files)
   - Update credential extraction logic to handle both formats

## Current Host Inventory

| Old ID | New ID | Organization | Display Name |
|--------|--------|--------------|--------------|
| `localhost` | `localhost` | `neoncloud` | "Localhost" |
| `server-01` | `megacorp-server-01` | `megacorp` | "Server-01" |
| `server-02` | `megacorp-database-01` | `megacorp` | "Server-02" |
| `megacorp-webserver` | `megacorp-webserver` | `megacorp` | "Megacorp Web Server" |

## Files Requiring Updates

1. **Host Definitions**
   - `src/game/world/entities/hosts/server-01.ts`
   - `src/game/world/entities/hosts/server-02.ts`
   - `src/game/world/entities/organizations/megacorp.ts` (hostIds array)

2. **Mission Modules**
   - All mission modules that reference host IDs
   - Task solutions that mention hosts

3. **Email Templates**
   - Credential file naming patterns
   - Host references in email bodies

4. **Commands**
   - SSH command (credential checks)
   - Mail command (credential extraction)
   - Disconnect command

5. **State Management**
   - Connection store (credential keys)
   - File system store (active server ID)

6. **Event Handlers**
   - Mission event handlers (server connection/disconnection)

7. **Discovery System**
   - Discovery store (host IDs)

## Implementation Order

1. Create ID migration helper utilities
2. Update host definitions
3. Update credential validation logic
4. Update mission modules
5. Update email templates
6. Update commands
7. Update state management
8. Test thoroughly

