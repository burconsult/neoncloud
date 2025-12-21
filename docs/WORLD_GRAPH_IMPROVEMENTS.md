# World Graph Model Improvements

This document outlines suggested improvements to better integrate the world graph model throughout the codebase.

## 1. Tool-Vendor Integration

### Current State
- Tools are defined in tool modules but not explicitly tied to vendors
- Software store doesn't check vendor access requirements
- No vendor-specific pricing or availability

### Improvements

#### 1.1 Add `vendorId` to ToolModule
```typescript
// src/game/tools/ToolModule.ts
export interface ToolModule {
  toolId: string;
  vendorId?: string; // Organization ID that sells this tool (null = NeonCloud provides)
  software?: Software;
  // ... rest
}
```

#### 1.2 Enforce Vendor Access Requirements
```typescript
// src/game/state/useInventoryStore.ts
purchaseSoftware: (softwareId: string) => {
  // ... existing code ...
  
  // Check vendor access requirements
  const toolModule = toolRegistry.getBySoftwareId(softwareId);
  if (toolModule?.vendorId) {
    const vendor = worldRegistry.getOrganization(toolModule.vendorId);
    if (vendor?.vendorInfo?.accessRequirements) {
      const reqs = vendor.vendorInfo.accessRequirements;
      
      // Check VPN requirement
      if (reqs.requiresVpn && !connectionStore.isVPNConnected()) {
        return false; // Must be on VPN
      }
      
      // Check mission requirement
      if (reqs.requiresMission) {
        const completed = missionStore.completedMissions;
        const hasRequired = reqs.requiresMission.some(m => completed.includes(m));
        if (!hasRequired) {
          return false; // Mission not completed
        }
      }
      
      // Check credential requirement
      if (reqs.requiresCredential) {
        // Future: Check if player has required credential
      }
    }
    
    // Apply vendor pricing multiplier
    if (vendor?.vendorInfo?.pricingMultiplier) {
      adjustedPrice *= vendor.vendorInfo.pricingMultiplier;
    }
  }
}
```

#### 1.3 Update Software Store to Show Vendor Info
```typescript
// src/components/store/SoftwareStore.tsx
// Show vendor name, access requirements, and pricing info
```

## 2. Connection System Integration

### Current State
- `connect` command validates server existence via file system check
- Doesn't use world registry to validate host existence
- Doesn't check host security requirements (firewall, intrusion detection)

### Improvements

#### 2.1 Validate Host via World Registry
```typescript
// src/game/commands/toolCommands.ts
execute: async (args: string[]) => {
  // ... existing code ...
  
  // Validate host exists in world registry
  const host = worldRegistry.getHost(server);
  if (!host) {
    return {
      output: `Host ${server} not found in network registry.`,
      success: false,
      error: 'Host not found',
    };
  }
  
  // Check if host is online
  if (host.isOnline === false) {
    return {
      output: `Host ${server} is offline or unreachable.`,
      success: false,
      error: 'Host offline',
    };
  }
  
  // Check security requirements
  if (host.security.requiresFirewallBypass) {
    const inventoryStore = useInventoryStore.getState();
    if (!inventoryStore.ownsSoftware('firewall-bypass')) {
      return {
        output: `Host ${server} is protected by a firewall. You need a Firewall Bypass Tool.`,
        success: false,
        error: 'Firewall protection',
      };
    }
  }
  
  // Check if host has been discovered
  const discoveryStore = useDiscoveryStore.getState();
  if (!discoveryStore.isHostDiscovered(server)) {
    return {
      output: `Host ${server} is not in your network registry. Scan the network first.`,
      success: false,
      error: 'Host not discovered',
    };
  }
}
```

#### 2.2 Use Host Credentials from World Registry
```typescript
// Use host.credentials from world registry as fallback
// Still allow mission-provided credentials to override
```

## 3. File System Integration

### Current State
- Server file systems are hardcoded in `serverFileSystems.ts`
- Not referenced from host entities
- No way to dynamically generate file systems

### Improvements

#### 3.1 Reference File System from Host Entity
```typescript
// src/game/world/types/Host.ts
export interface Host {
  // ... existing fields ...
  fileSystemId: string; // Already exists!
  fileSystemFactory?: () => FileSystem; // Optional: dynamic generation
}
```

#### 3.2 Create File System Registry
```typescript
// src/game/filesystem/fileSystemRegistry.ts
import { worldRegistry } from '../world/registry/WorldRegistry';

export function getServerFileSystem(serverId: string): FileSystem | null {
  // First check world registry
  const host = worldRegistry.getHost(serverId);
  if (host?.fileSystemFactory) {
    return host.fileSystemFactory();
  }
  
  // Fall back to legacy hardcoded systems
  // ... existing switch statement ...
}
```

#### 3.3 Allow File Systems to Reference World Entities
```typescript
// Files could contain references to other hosts/orgs
// When read, could trigger discovery
```

## 4. Email System Integration

### Current State
- Emails have hardcoded `from` addresses
- Don't reference world contacts explicitly

### Improvements

#### 4.1 Reference Contacts in Emails
```typescript
// src/types/email.ts
export interface Email {
  // ... existing fields ...
  fromContactId?: string; // Reference to Contact entity
  toContactId?: string; // Reference to Contact entity (usually player)
}
```

#### 4.2 Auto-populate Email from Contact
```typescript
// src/game/emails/emailTemplates.ts
export function createEmailFromContact(
  contactId: string,
  subject: string,
  body: string
): Email {
  const contact = worldRegistry.getContact(contactId);
  if (!contact) throw new Error(`Contact ${contactId} not found`);
  
  return {
    from: contact.email,
    fromContactId: contactId,
    // ... rest
  };
}
```

## 5. Network Scanning Improvements

### Current State
- Scanner discovers hosts but doesn't validate against organization IP ranges
- Doesn't discover organizations when scanning their networks

### Improvements

#### 5.1 Validate Scan Range Against Organizations
```typescript
// src/game/tools/modules/networkScanner.ts
function scanIPRange(ipRange: string) {
  // ... existing code ...
  
  // Also check if this IP range belongs to an organization
  const orgs = worldRegistry.getAllOrganizations();
  const matchingOrg = orgs.find(org => {
    if (!org.ipRange) return false;
    return isIPInRange(ipRange, org.ipRange); // Helper function
  });
  
  if (matchingOrg) {
    // Discover organization through scanning
    discoveryStore.discoverOrganization(matchingOrg.id, 'scan');
  }
}
```

#### 5.2 Show Organization Info in Scan Results
```typescript
// Display which organization owns discovered hosts
```

## 6. World Graph Query Enhancements

### Current State
- Basic queries exist but could be expanded

### Improvements

#### 6.1 Add More Query Methods
```typescript
// src/game/world/graph/WorldGraph.ts
export class WorldGraph {
  // Get vendors that sell a specific tool
  getVendorsByTool(toolId: string): Organization[] {
    return worldRegistry.getAllOrganizations().filter(org =>
      org.vendorInfo?.toolIds?.includes(toolId)
    );
  }
  
  // Get hosts in an IP range
  getHostsByIPRange(ipRange: string): Host[] {
    // Parse CIDR and find matching hosts
  }
  
  // Get all discoverable entities (not yet discovered)
  getUndiscoveredHosts(): Host[] {
    const discoveryStore = useDiscoveryStore.getState();
    return worldRegistry.getAllHosts().filter(host =>
      !discoveryStore.isHostDiscovered(host.id)
    );
  }
  
  // Get network topology path between hosts
  findNetworkPath(from: string, to: string): Path | null {
    // Already exists, but could be enhanced
  }
}
```

## 7. Host Security Configuration Enforcement

### Current State
- Host security configs are defined but not enforced

### Improvements

#### 7.1 Enforce Firewall Requirements
```typescript
// Already suggested in #2.1
// Check host.security.requiresFirewallBypass
```

#### 7.2 Enforce Intrusion Detection
```typescript
// If host has intrusion detection, certain actions could trigger alerts
// Could affect mission success or require stealth tools
```

#### 7.3 Use Encryption Level
```typescript
// Different encryption levels could require different tools
// Basic encryption = basic cracker
// Advanced encryption = advanced cracker
```

## 8. Mission-Host Relationship Enhancement

### Current State
- Missions reference hosts via organization relationships
- Could be more explicit

### Improvements

#### 8.1 Add Direct Host References to Missions
```typescript
// src/game/missions/MissionModule.ts
export interface MissionModule {
  // ... existing fields ...
  targetHostIds?: string[]; // Direct host references
  targetOrganizationIds?: string[]; // Direct org references
}
```

#### 8.2 Auto-discover Mission Targets
```typescript
// When mission starts, discover all target hosts/orgs
// Even if not explicitly mentioned in email
```

## 9. Discovery Method Implementation

### Current State
- Discovery methods are defined but not all are fully implemented

### Improvements

#### 9.1 File System Discovery
```typescript
// When reading files, check for host/org references
// Example: config file mentions "megacorp-server-03"
// Could trigger discovery of that host
```

#### 9.2 DNS Discovery Enhancement
```typescript
// DNS lookups could discover organizations
// If looking up megacorp.com, discover Megacorp organization
```

#### 9.3 Contact Discovery
```typescript
// Contacts could reveal information about hosts/orgs
// "I know someone at Megacorp who mentioned server-03"
```

## 10. Organization IP Range Validation

### Current State
- Organizations have IP ranges but not used for validation

### Improvements

#### 10.1 Validate Scan Targets
```typescript
// When scanning, validate that target IP range makes sense
// Could warn if scanning outside known organization ranges
```

#### 10.2 Auto-discover Organization Networks
```typescript
// When scanning an organization's IP range, auto-discover the org
```

## 11. Vendor System Completion

### Current State
- Vendor type exists but not fully utilized
- No vendor-specific UI or commands

### Improvements

#### 11.1 Create Vendor Commands
```typescript
// src/game/commands/vendorCommand.ts
// "vendor list" - List discovered vendors
// "vendor show <vendor-id>" - Show vendor details and tools
// "vendor buy <tool-id>" - Buy from specific vendor
```

#### 11.2 Vendor Discovery
```typescript
// Vendors should be discoverable through missions, contacts, or scanning
// Not all vendors should be available from start
```

## 12. Network Topology Visualization

### Current State
- Network connections are defined but not visualized

### Improvements

#### 12.1 Add Network Map Command
```typescript
// "network map" - Show discovered network topology
// Visual representation of hosts and their connections
```

## 13. Host Status Tracking

### Current State
- Hosts have `isOnline` but it's static

### Improvements

#### 13.1 Dynamic Host Status
```typescript
// Hosts could go offline/online based on player actions
// Or based on mission events
```

## 14. Credential Management

### Current State
- Credentials stored in connection store
- Not referenced from host entities

### Improvements

#### 14.1 Use Host Credentials from Registry
```typescript
// Host entities have credentials defined
// Use as fallback if mission credentials not available
// Could support multiple credential sets per host
```

## Priority Recommendations

### High Priority
1. **Tool-Vendor Integration** (#1) - Makes vendor system functional
2. **Connection System Integration** (#2) - Uses world registry for validation
3. **File System Integration** (#3) - Makes file systems part of world graph

### Medium Priority
4. **Network Scanning Improvements** (#5) - Better discovery
5. **World Graph Query Enhancements** (#6) - More useful queries
6. **Host Security Configuration Enforcement** (#7) - Gameplay depth

### Low Priority
7. **Email System Integration** (#4) - Nice to have
8. **Vendor System Completion** (#11) - Future feature
9. **Network Topology Visualization** (#12) - UI enhancement

## Implementation Notes

- These improvements should be implemented incrementally
- Each should maintain backward compatibility
- Test thoroughly after each change
- Update documentation as features are added

