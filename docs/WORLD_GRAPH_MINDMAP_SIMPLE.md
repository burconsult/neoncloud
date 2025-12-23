# NeonCloud World Graph - Simple Text Mindmap

A simple, text-based visualization of the world graph for easy editing and understanding.

## Entity Hierarchy

```
NeonCloud (Organization)
├── Owns: localhost (Host)
├── Employs: Agent Smith (Contact)
├── Sells Tools:
│   ├── Network Scanner (free)
│   ├── VPN Basic
│   ├── Password Cracker Basic
│   └── Log Shredder Basic
└── Missions:
    ├── Welcome to NeonCloud
    ├── First Hack
    └── Data Extraction

Megacorp (Organization)
├── Owns:
│   ├── server-01 (Host)
│   └── server-02 (Host)
└── Targeted by Missions:
    ├── First Hack
    └── Data Extraction

Agent Smith (Contact)
├── Works for: NeonCloud
├── Sends Emails:
│   ├── Welcome Email
│   ├── First Hack Email
│   └── Data Extraction Email
└── Involved in Missions:
    ├── Welcome to NeonCloud
    ├── First Hack
    └── Data Extraction

localhost (Host)
├── Owned by: NeonCloud
└── Connects to:
    ├── server-01
    └── server-02

server-01 (Host)
├── Owned by: Megacorp
├── IP: 192.168.1.100
├── Domain: server-01.megacorp.local
├── Role: web-server
├── Targeted by: First Hack mission
├── Mentioned in: First Hack Email
└── Connects to: server-02

server-02 (Host)
├── Owned by: Megacorp
├── IP: 192.168.1.101
├── Domain: server-02.megacorp.local
├── Role: database-server
├── Targeted by: Data Extraction mission
└── Mentioned in: Data Extraction Email
```

## Mission Flow

```
Training Missions (Category)
│
├── Welcome to NeonCloud (welcome-00)
│   ├── Targets: NeonCloud
│   ├── Involves: Agent Smith
│   ├── Requires: Network Scanner
│   ├── Unlocks:
│   │   ├── Terminal Navigation mission
│   │   ├── Network Scanner tool
│   │   └── NeonCloud Lore
│   └── Sends: Welcome Email
│
├── Terminal Navigation (tutorial-01)
│   ├── Prerequisite: Welcome to NeonCloud
│   └── Unlocks: Network Connectivity mission
│
├── Network Connectivity (network-02)
│   ├── Prerequisite: Terminal Navigation
│   └── Unlocks: Network Topology mission
│
├── Network Topology (network-03)
│   ├── Prerequisite: Network Connectivity
│   └── Unlocks: DNS Exploration mission
│
└── DNS Exploration (network-04)
    ├── Prerequisite: Network Topology
    └── Unlocks: First Hack mission

Script Kiddie Missions (Category)
│
├── First Hack (n00b-01)
│   ├── Prerequisite: DNS Exploration
│   ├── Targets:
│   │   ├── Megacorp (Organization)
│   │   └── server-01 (Host)
│   ├── Involves: Agent Smith
│   ├── Requires:
│   │   ├── VPN Basic
│   │   └── Password Cracker Basic
│   ├── Unlocks:
│   │   ├── Data Extraction mission
│   │   ├── VPN Basic tool
│   │   └── Password Cracker Basic tool
│   └── Sends: First Hack Email
│
└── Data Extraction (n00b-02)
    ├── Prerequisite: First Hack
    ├── Targets:
    │   ├── Megacorp (Organization)
    │   └── server-02 (Host)
    ├── Involves: Agent Smith
    ├── Requires:
    │   ├── VPN Basic
    │   ├── Password Cracker Basic
    │   └── Log Shredder Basic
    ├── Unlocks: Log Shredder Basic tool
    └── Sends: Data Extraction Email
```

## Tool Relationships

```
Network Scanner (network-scanner-basic)
├── Sold by: NeonCloud (free)
├── Unlocked by: Welcome to NeonCloud mission
└── Required by: Welcome to NeonCloud mission

VPN Basic (vpn-basic)
├── Sold by: NeonCloud
├── Unlocked by: First Hack mission
└── Required by:
    ├── First Hack mission
    └── Data Extraction mission

Password Cracker Basic (password-cracker-basic)
├── Sold by: NeonCloud
├── Unlocked by: First Hack mission
└── Required by:
    ├── First Hack mission
    └── Data Extraction mission

Log Shredder Basic (log-shredder-basic)
├── Sold by: NeonCloud
├── Unlocked by: Data Extraction mission
└── Required by: Data Extraction mission
```

## Email Relationships

```
Welcome Email (email-welcome-001)
├── From: Agent Smith (Contact)
├── From: NeonCloud (Organization)
├── Related to: Welcome to NeonCloud mission
└── Unlocks: NeonCloud Lore

First Hack Email (email-first-hack-001)
├── From: Agent Smith (Contact)
├── From: NeonCloud (Organization)
├── Related to: First Hack mission
├── Mentions: server-01 (Host)
├── Mentions: Megacorp (Organization)
└── Attachments: server-01-credentials.enc

Data Extraction Email (email-data-extraction-001)
├── From: Agent Smith (Contact)
├── From: NeonCloud (Organization)
├── Related to: Data Extraction mission
├── Mentions: server-02 (Host)
├── Mentions: Megacorp (Organization)
└── Attachments: server-02-credentials.enc
```

## Network Topology

```
Network Connections:
│
├── localhost
│   ├── → server-01
│   └── → server-02
│
└── server-01
    └── ↔ server-02 (bidirectional)
```

## Quick Reference: Adding New Entities

### Add Organization
```
New Organization (org-id)
├── Owns: [host-ids]
├── Employs: [contact-ids]
├── Sells: [tool-ids]
└── Missions: [mission-ids]
```

### Add Host
```
New Host (host-id)
├── Owned by: [org-id]
├── IP: [ip-address]
├── Domain: [domain-name]
├── Role: [role]
├── Targeted by: [mission-ids]
└── Connects to: [host-ids]
```

### Add Mission
```
New Mission (mission-id)
├── Prerequisite: [mission-ids]
├── Targets Organizations: [org-ids]
├── Targets Hosts: [host-ids]
├── Involves Contacts: [contact-ids]
├── Requires Tools: [tool-ids]
├── Unlocks Missions: [mission-ids]
├── Unlocks Tools: [tool-ids]
└── Sends Emails: [email-ids]
```

### Add Tool
```
New Tool (tool-id)
├── Sold by: [org-id]
├── Unlocked by: [mission-ids]
└── Required by: [mission-ids]
```

### Add Email
```
New Email (email-id)
├── From Contact: [contact-id]
├── From Organization: [org-id]
├── Related to Mission: [mission-id]
├── Mentions Hosts: [host-ids]
└── Mentions Organizations: [org-ids]
```

## Statistics

- **Total Entities**: 21
  - Organizations: 2
  - Contacts: 1
  - Hosts: 3
  - Missions: 7
  - Tools: 4
  - Emails: 3
  - Lore: 1

- **Total Relationships**: ~70+
- **Mission Chain Length**: 7 missions (longest path)
- **Most Connected Entity**: NeonCloud (connects to 10+ entities)
- **Most Targeted Entity**: Megacorp (targeted by 2 missions)

