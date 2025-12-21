# Tool Module Architecture

## Problem

Currently, tool/command information is scattered across multiple files:
- **Command implementation**: `src/game/commands/toolCommands.ts` (all tools in one file)
- **Tool duration**: `src/game/time/toolDurations.ts`
- **Inventory/Software definition**: `src/game/inventory/inventoryTypes.ts`
- **Tool effects**: Spread across multiple places

This makes adding new tools tedious - need to update 3-4 files.

## Solution: Modular Tool System

Similar to the MissionModule pattern, create a **ToolModule** system where each tool is self-contained in its own file.

## Structure

```
src/game/tools/
  ToolModule.ts          # Interface and registry
  modules/
    vpn.ts               # VPN tool (Basic + Premium)
    passwordCracker.ts   # Password Cracker tool
    logShredder.ts       # Log Shredder tool
    networkAnalyzer.ts   # Network Analyzer tool
    firewallBypass.ts    # Firewall Bypass tool
  toolLoader.ts          # Load all tool modules
```

## ToolModule Interface

```typescript
export interface ToolModule {
  /**
   * Unique tool identifier (e.g., 'vpn', 'password-cracker')
   */
  toolId: string;

  /**
   * Software definition (for inventory/store)
   */
  software: Software;

  /**
   * Basic version software (if this tool has basic/premium versions)
   */
  basicSoftware?: Software;

  /**
   * Premium/Advanced version software
   */
  premiumSoftware?: Software;

  /**
   * Duration in real-time seconds
   */
  duration: {
    basic: number;
    premium?: number;
  };

  /**
   * Command implementation
   */
  command: Command;

  /**
   * Custom initialization (optional)
   */
  onInit?: () => void | Promise<void>;
}
```

## Example: VPN Tool Module

```typescript
// src/game/tools/modules/vpn.ts

export const vpnToolModule: ToolModule = {
  toolId: 'vpn',
  
  basicSoftware: {
    id: 'vpn-basic',
    name: 'Basic VPN',
    description: 'Encrypt your connection and hide your IP address.',
    category: 'network',
    rarity: 'common',
    price: 200,
    requirements: {
      completedMissions: ['tutorial-01'],
    },
    effects: {
      enableFeatures: ['vpn-connect', 'ip-masking'],
    },
  },
  
  premiumSoftware: {
    id: 'vpn-premium',
    name: 'Premium VPN',
    description: 'Advanced VPN with faster speeds.',
    category: 'network',
    rarity: 'uncommon',
    price: 500,
    requirements: {
      completedMissions: ['network-01'],
    },
    effects: {
      enableFeatures: ['vpn-connect', 'ip-masking', 'server-selection'],
      reduceLatency: 20,
    },
  },
  
  duration: {
    basic: 5,    // 5 seconds
    premium: 2,  // 2 seconds
  },
  
  command: {
    name: 'vpn',
    aliases: ['connect-vpn'],
    description: 'Connect to VPN',
    usage: 'vpn [connect]',
    requiresUnlock: false,
    execute: async (args, context) => {
      // Implementation here - can use this.duration, this.software, etc.
      // All tool-specific logic in one place
    },
  },
};
```

## Benefits

1. **Single Source of Truth**: Everything about a tool is in one file
2. **Easy to Add**: Just create a new file, register it, done
3. **Self-Contained**: No cross-file dependencies
4. **Type-Safe**: TypeScript ensures consistency
5. **Testable**: Easy to test individual tools
6. **Discoverable**: All tool info in one place

## Migration Strategy

1. Create `ToolModule` interface and registry
2. Create example tool module (VPN)
3. Migrate existing tools one by one
4. Update command registry to use tool modules
5. Update inventory store to use tool modules
6. Update duration system to use tool modules
7. Remove old scattered definitions

## Integration Points

### Command Registry
- Register commands from tool modules
- Commands can access their module via `this.toolModule`

### Inventory Store
- Software catalog built from tool modules
- Pricing, requirements, effects all from modules

### Duration System
- Tool durations from tool modules
- No separate duration file needed

### Action Queue
- Tool durations accessed via tool module
- Commands can queue actions using module duration

