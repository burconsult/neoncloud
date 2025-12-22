# World Graph - Complete Asset Mapping

## Overview
This document maps all game assets and their relationships through the world graph system. Everything should flow through the graph - no hardcoded references.

## Asset Types

### 1. Core World Entities (✅ Implemented)
- **Organizations**: Companies, groups (NeonCloud, Megacorp)
- **Hosts**: Servers, computers (localhost, server-01, server-02)
- **Contacts**: People, NPCs (agent-smith)
- **Vendors**: Organizations that sell tools (NeonCloud as vendor)

### 2. Game Systems (⚠️ Partially Integrated)
- **Missions**: Mission modules (welcome-00, tutorial-01, n00b-01, n00b-02)
- **Tools**: Software/tools (VPN, Password Cracker, Network Scanner, etc.)
- **Emails**: Email messages sent to players
- **Lore**: Lore entries unlocked during gameplay

## Current Asset Inventory

### Organizations
| ID | Name | Type | Hosts | Contacts | Missions | Tools |
|----|------|------|--------|----------|----------|-------|
| neoncloud | NeonCloud Special Cyberoperations Group | neoncloud | [] | agent-smith | welcome-00, n00b-01, n00b-02 | network-scanner-basic |
| megacorp | Megacorp Industries | corporation | server-01, server-02 | [] | n00b-01, n00b-02 | [] |

### Hosts
| ID | Name | Organization | Missions | Role | IP | Domain |
|----|------|--------------|----------|------|----|--------|
| localhost | Localhost | neoncloud | [] | workstation | 127.0.0.1 | localhost |
| server-01 | Server-01 | megacorp | n00b-01 | web-server | 192.168.1.100 | server-01.megacorp.local |
| server-02 | Server-02 | megacorp | n00b-02 | database | 192.168.1.101 | server-02.megacorp.local |

### Contacts
| ID | Name | Organization | Role | Missions | Email |
|----|------|--------------|------|----------|-------|
| agent-smith | Agent Smith | neoncloud | handler | welcome-00, n00b-01, n00b-02 | agent.smith@neoncloud-ops.org |

### Missions
| ID | Title | Category | Client Org | Target Hosts | Required Tools | Contact |
|----|-------|----------|------------|--------------|----------------|---------|
| welcome-00 | Welcome to NeonCloud | training | neoncloud | [] | [] | agent-smith |
| tutorial-01 | Terminal Navigation Basics | training | neoncloud | [] | [] | agent-smith |
| network-01 | Network Connectivity Basics | training | neoncloud | localhost | [] | agent-smith |
| network-02 | Understanding Network Paths | training | neoncloud | [] | [] | agent-smith |
| network-03 | DNS and Domain Resolution | training | neoncloud | [] | [] | agent-smith |
| n00b-01 | First Hack: Server-01 Penetration Test | script-kiddie | neoncloud | server-01 | vpn-basic, password-cracker-basic | agent-smith |
| n00b-02 | Data Extraction: Server-02 Database Access | script-kiddie | neoncloud | server-02 | vpn-basic, password-cracker-basic, log-shredder-basic | agent-smith |

### Tools
| ID | Name | Vendor | Missions | Category |
|----|------|--------|----------|----------|
| network-scanner-basic | Basic Network Scanner | neoncloud | n00b-01 | scanning |
| vpn-basic | Basic VPN | neoncloud | n00b-01, n00b-02 | anonymity |
| vpn-premium | Premium VPN | neoncloud | [] | anonymity |
| password-cracker-basic | Basic Password Cracker | neoncloud | n00b-01, n00b-02 | decryption |
| password-cracker-premium | Premium Password Cracker | neoncloud | [] | decryption |
| log-shredder-basic | Basic Log Shredder | neoncloud | n00b-02 | cleanup |

### Emails
| ID | From | To | Mission | Related Hosts | Related Orgs |
|----|------|----|---------|----------------|--------------|
| email-welcome-001 | recruitment@neoncloud-ops.org | agent@neoncloud.local | welcome-00 | [] | neoncloud |
| email-first-hack-001 | contracts@neoncloud-ops.org | agent@neoncloud.local | n00b-01 | server-01 | neoncloud, megacorp |
| email-data-extraction-001 | contracts@neoncloud-ops.org | agent@neoncloud.local | n00b-02 | server-02 | neoncloud, megacorp |

## Relationship Graph

```
Organizations
├── neoncloud
│   ├── owns → [localhost]
│   ├── has_contact → [agent-smith]
│   ├── provides_mission → [welcome-00, tutorial-01, network-01, network-02, network-03, n00b-01, n00b-02]
│   ├── sells_tool → [network-scanner-basic, vpn-basic, vpn-premium, password-cracker-basic, password-cracker-premium, log-shredder-basic]
│   └── sends_email → [email-welcome-001, email-first-hack-001, email-data-extraction-001]
│
└── megacorp
    ├── owns → [server-01, server-02]
    └── targeted_by_mission → [n00b-01, n00b-02]

Hosts
├── localhost
│   ├── belongs_to → neoncloud
│   └── used_in_mission → [network-01]
│
├── server-01
│   ├── belongs_to → megacorp
│   ├── targeted_by_mission → [n00b-01]
│   └── mentioned_in_email → [email-first-hack-001]
│
└── server-02
    ├── belongs_to → megacorp
    ├── targeted_by_mission → [n00b-02]
    └── mentioned_in_email → [email-data-extraction-001]

Missions
├── welcome-00
│   ├── client → neoncloud
│   ├── contact → agent-smith
│   └── unlocks_email → [email-welcome-001]
│
├── n00b-01
│   ├── client → neoncloud
│   ├── target_hosts → [server-01]
│   ├── target_orgs → [megacorp]
│   ├── contact → agent-smith
│   ├── requires_tools → [vpn-basic, password-cracker-basic]
│   └── unlocks_email → [email-first-hack-001]
│
└── n00b-02
    ├── client → neoncloud
    ├── target_hosts → [server-02]
    ├── target_orgs → [megacorp]
    ├── contact → agent-smith
    ├── requires_tools → [vpn-basic, password-cracker-basic, log-shredder-basic]
    └── unlocks_email → [email-data-extraction-001]

Tools
├── network-scanner-basic
│   ├── vendor → neoncloud
│   └── required_by_mission → [n00b-01]
│
├── vpn-basic
│   ├── vendor → neoncloud
│   └── required_by_mission → [n00b-01, n00b-02]
│
└── password-cracker-basic
    ├── vendor → neoncloud
    └── required_by_mission → [n00b-01, n00b-02]
```

## Hardcoded References to Remove

### Missions
- ❌ `server-01` hardcoded in `02_01_first_hack.ts` (tasks, descriptions)
- ❌ `server-02` hardcoded in `02_02_data_extraction.ts` (tasks, descriptions)
- ❌ `megacorp` hardcoded in mission descriptions
- ✅ Mission → Organization relationship exists in Organization.missionIds
- ✅ Mission → Host relationship exists via Organization.hostIds

### Emails
- ❌ `server-01`, `server-02`, `megacorp` hardcoded in email templates
- ❌ Email sender hardcoded (should reference Contact)
- ❌ Email recipient hardcoded (should reference player contact)

### Event Handlers
- ❌ `server-01`, `server-02` hardcoded in `missionEventHandlers.ts`
- Should query graph for mission targets instead

### Tools
- ✅ Vendor relationship exists in Organization.vendorInfo.toolIds
- ⚠️ Tool modules don't reference vendor IDs directly
- ⚠️ Tool availability not fully queried through graph

## Proposed Solution

### 1. Extend MissionModule Interface
```typescript
export interface MissionModule {
  // ... existing fields
  
  // World Graph Relationships
  clientOrganizationId?: string; // Organization that provides the mission
  targetHostIds?: string[]; // Hosts targeted in this mission
  targetOrganizationIds?: string[]; // Organizations targeted
  contactId?: string; // Contact who briefs the player
}
```

### 2. Extend Email Interface
```typescript
export interface Email {
  // ... existing fields
  
  // World Graph Relationships
  fromContactId?: string; // Contact sending the email
  fromOrganizationId?: string; // Organization sending the email
  relatedHostIds?: string[]; // Hosts mentioned in email
  relatedOrganizationIds?: string[]; // Organizations mentioned
}
```

### 3. Extend ToolModule Interface
```typescript
export interface ToolModule {
  // ... existing fields
  
  // World Graph Relationships
  vendorId?: string; // Organization that sells this tool
  requiredByMissionIds?: string[]; // Missions that require this tool
}
```

### 4. Create Asset Registry Extension
```typescript
// Unified asset interface
export interface GameAsset {
  id: string;
  type: 'mission' | 'email' | 'tool' | 'lore';
  // ... type-specific properties
}

// Extend WorldRegistry to handle all assets
class WorldRegistry {
  // ... existing methods
  
  registerMission(mission: MissionModule): void;
  registerEmail(email: Email): void;
  registerTool(tool: ToolModule): void;
  
  getMission(id: string): MissionModule | undefined;
  getEmail(id: string): Email | undefined;
  getTool(id: string): ToolModule | undefined;
}
```

### 5. Extend WorldGraph Queries
```typescript
class WorldGraph {
  // ... existing methods
  
  // Mission queries
  getMissionsByHost(hostId: string): MissionModule[];
  getMissionsByOrganization(orgId: string): MissionModule[];
  getMissionsByTool(toolId: string): MissionModule[];
  
  // Email queries
  getEmailsByMission(missionId: string): Email[];
  getEmailsByHost(hostId: string): Email[];
  getEmailsByContact(contactId: string): Email[];
  
  // Tool queries
  getToolsByVendor(vendorId: string): ToolModule[];
  getToolsByMission(missionId: string): ToolModule[];
  getVendorByTool(toolId: string): Organization | null;
}
```

## Implementation Priority

1. **High Priority**: Remove hardcoded host references from missions
2. **High Priority**: Connect emails to world entities
3. **Medium Priority**: Fully integrate tools into graph
4. **Medium Priority**: Create unified asset registry
5. **Low Priority**: Add comprehensive graph queries

## Benefits

1. **Infinite Expandability**: Add new assets without code changes
2. **Consistency**: All relationships in one place
3. **Query Power**: Find related assets easily
4. **Dynamic Content**: Generate content from graph
5. **Testing**: Easy to test relationships
6. **Maintainability**: Clear structure for all assets

