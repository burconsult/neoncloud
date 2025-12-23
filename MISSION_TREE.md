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
  ├─ unlocks: [] (Dynamic ordering handles next mission)
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

n00b-03 / Network Investigation: Server-01 Analysis (Script Kiddie)
  ├─ prerequisites: ['n00b-02']
  ├─ unlocks: [] (Dynamic ordering handles next mission)
  ├─ category: script-kiddie
  ├─ requiredSoftware: ['vpn-basic', 'password-cracker-basic'] (should already be owned)
  ├─ expectedCompletionTime: 720 (12 minutes)
  └─ tasks:
      ├─ task-1: Read the investigation email
      ├─ task-2: Connect to VPN
      ├─ task-3: Ping the target server
      ├─ task-4: Trace network path to server
      ├─ task-5: Resolve DNS for target domain
      ├─ task-6: Connect to server-01
      ├─ task-7: Verify current directory (pwd)
      ├─ task-8: Navigate to /etc directory
      ├─ task-9: List files in /etc
      ├─ task-10: Read hostname file
      └─ task-11: Disconnect from server
```

## Mission Chain (Complete Path)

1. **welcome-00** → 2. **tutorial-01** → 3. **network-01** → 4. **network-02** → 5. **network-03** → 6. **n00b-01** → 7. **n00b-02** → 8. **n00b-03** → 9. **h4x0r-01**

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
- `02_03_network_investigation.ts` → `n00b-03`
- `03_01_advanced_penetration.ts` → `h4x0r-01`

## Registration

All missions are registered in `src/game/missions/missionLoader.ts` in the `loadMissionModules()` function.

## Notes

- **Dynamic Mission Ordering**: The system automatically determines next missions based on category and mission number. No need to manually update `unlocks` arrays.
- Each mission must have correct `prerequisites` to maintain the chain
- When a mission completes, the auto-loading system uses dynamic ordering to find the next mission
- The first mission (welcome-00) has no prerequisites and should auto-start when the game begins
- Mission categories are used for UI grouping and player rank progression
- When the last mission is completed, an end screen is shown

## Adding New Missions

1. Create a new file following the naming convention: `{category_number}_{mission_number}_{mission_name}.ts`
   - Category numbers: Training=01, Script Kiddie=02, Cyber Warrior=03, Digital Ninja=04
   - Mission numbers: Sequential within category (01, 02, 03, etc.)
2. Define the mission module with correct `prerequisites` (no need for `unlocks` - handled automatically)
3. Register it in `missionLoader.ts` in the appropriate category section
4. Update this file (MISSION_TREE.md) with the new mission information
5. The dynamic ordering system will automatically place it in the correct position

