# NeonCloud Mission Tree

This document tracks the complete mission structure, prerequisites, and unlocks for the NeonCloud game. This helps maintain consistency and avoid issues when adding or modifying missions.

## Mission Categories

- **Training (01)**: Beginner missions teaching basic concepts
- **Script Kiddie (02)**: First real challenges requiring purchased tools
- **Cyber Warrior (03)**: Intermediate missions (TODO)
- **Digital Ninja (04)**: Advanced missions (TODO)

## Mission Structure

```
welcome-00 (Training)
  ├─ prerequisites: []
  ├─ unlocks: ['tutorial-01']
  └─ category: training
  
tutorial-01 / Terminal Navigation Basics (Training)
  ├─ prerequisites: ['welcome-00']
  ├─ unlocks: ['network-01']
  └─ category: training
  
network-01 / Network Connectivity Basics (Training)
  ├─ prerequisites: ['tutorial-01']
  ├─ unlocks: ['network-02']
  └─ category: training
  
network-02 / Network Topology (Training)
  ├─ prerequisites: ['network-01']
  ├─ unlocks: ['network-03']
  └─ category: training
  
network-03 / DNS and Domain Resolution (Training)
  ├─ prerequisites: ['network-02']
  ├─ unlocks: ['n00b-01']
  └─ category: training
  
n00b-01 / First Hack: Server-01 Penetration Test (Script Kiddie)
  ├─ prerequisites: ['network-03']
  ├─ unlocks: ['n00b-02']
  ├─ category: script-kiddie
  ├─ requiredSoftware: ['vpn-basic', 'password-cracker-basic']
  └─ tasks:
      ├─ task-1: Read the contract email
      ├─ task-2: Purchase a Basic VPN
      ├─ task-3: Connect to the VPN
      ├─ task-4: Purchase a Basic Password Cracker
      ├─ task-5: Decrypt the server-01 credentials file
      ├─ task-6: Connect to server-01
      ├─ task-7: Read secret.txt on server-01
      └─ task-8: Disconnect from server-01
  
n00b-02 / Data Extraction: Server-02 Database Access (Script Kiddie)
  ├─ prerequisites: ['n00b-01']
  ├─ unlocks: []
  ├─ category: script-kiddie
  ├─ requiredSoftware: ['vpn-basic', 'password-cracker-basic', 'log-shredder']
  ├─ expectedCompletionTime: 180 (3 minutes)
  └─ tasks:
      ├─ task-1: Read the contract email
      ├─ task-2: Connect to VPN
      ├─ task-3: Purchase Log Shredder tool
      ├─ task-4: Decrypt server-02 credentials file
      ├─ task-5: Connect to server-02
      ├─ task-6: Extract customer-data.txt
      ├─ task-7: Extract financial-report.txt
      ├─ task-8: Delete access logs with Log Shredder
      └─ task-9: Disconnect from server-02
```

## Mission Chain (Complete Path)

1. **welcome-00** → 2. **tutorial-01** → 3. **network-01** → 4. **network-02** → 5. **network-03** → 6. **n00b-01** → 7. **n00b-02**

## Mission Files

All missions are defined in `src/game/missions/modules/` following the naming convention:
`{category_number}_{mission_number}_{mission_name}.ts`

- `01_01_welcome.ts` → `welcome-00`
- `01_02_terminal_navigation.ts` → `tutorial-01`
- `01_03_network_connectivity.ts` → `network-01`
- `01_04_network_topology.ts` → `network-02`
- `01_05_dns_exploration.ts` → `network-03`
- `02_01_first_hack.ts` → `n00b-01`
- `02_02_data_extraction.ts` → `n00b-02`

## Registration

All missions are registered in `src/game/missions/missionLoader.ts` in the `loadMissionModules()` function.

## Notes

- Each mission must have matching `prerequisites` and `unlocks` to maintain the chain
- When a mission completes, the auto-loading system looks for missions whose prerequisites are met
- The first mission (welcome-00) has no prerequisites and should auto-start when the game begins
- Mission categories are used for UI grouping and player rank progression

## Adding New Missions

1. Create a new file following the naming convention
2. Define the mission module with correct `prerequisites` and `unlocks`
3. Register it in `missionLoader.ts`
4. Update this file with the new mission information
5. Ensure the mission chain remains intact

