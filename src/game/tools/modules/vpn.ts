/**
 * VPN Tool Module
 * 
 * Self-contained module for VPN tool (Basic and Premium versions)
 */

import { ToolModule } from '../ToolModule';
import { Command, CommandResult, GameContext } from '@/types';
import { useInventoryStore } from '../../state/useInventoryStore';
import { useConnectionStore } from '../../state/useConnectionStore';
import { emitToolUsed } from '../../events/eventBus';
import { queueToolAction } from '../../time/actionQueue';
import { useTerminalStore } from '../../state/useTerminalStore';

export const vpnToolModule: ToolModule = {
  toolId: 'vpn',

  basicSoftware: {
    id: 'vpn-basic',
    name: 'Basic VPN',
    description: 'Encrypt your connection and hide your IP address. Essential for secure operations.',
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
    description: 'Advanced VPN with multiple server locations and faster speeds.',
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
    basic: 5,    // Basic VPN: 5 seconds
    premium: 2,  // Premium VPN: 2 seconds
  },

  command: {
    name: 'vpn',
    aliases: ['connect-vpn'],
    description: 'Connect to or disconnect from VPN',
    usage: 'vpn [connect] | vpn disconnect',
    requiresUnlock: false,
    execute: async (args: string[], context?: GameContext): Promise<CommandResult> => {
      const connectionStore = useConnectionStore.getState();
      const inventoryStore = useInventoryStore.getState();

      // Handle disconnect
      if (args.length > 0 && args[0].toLowerCase() === 'disconnect') {
        if (!connectionStore.isVPNConnected()) {
          return {
            output: 'Not connected to VPN.',
            success: false,
            error: 'Not connected',
          };
        }

        const vpnType = connectionStore.vpnType === 'premium' ? 'Premium' : 'Basic';
        connectionStore.disconnectVPN();

        return {
          output: [
            `Disconnected from ${vpnType} VPN`,
            'Your IP address is now visible.',
          ],
          success: true,
        };
      }

      // Check if already connected
      if (connectionStore.isVPNConnected()) {
        const vpnType = connectionStore.vpnType === 'premium' ? 'Premium' : 'Basic';
        return {
          output: `Already connected to ${vpnType} VPN. Use 'vpn disconnect' to disconnect.`,
          success: false,
          error: 'Already connected',
        };
      }

      // Check if player owns a VPN
      const hasBasicVPN = inventoryStore.ownsSoftware('vpn-basic');
      const hasPremiumVPN = inventoryStore.ownsSoftware('vpn-premium');

      if (!hasBasicVPN && !hasPremiumVPN) {
        return {
          output: [
            'VPN not available. You need to purchase a VPN first.',
            '',
            'Available VPNs:',
            '  • Basic VPN (200 NC) - Type "store" to purchase',
            '  • Premium VPN (500 NC) - Type "store" to purchase',
            '',
            'VPN encrypts your connection and hides your IP address for secure operations.',
          ],
          success: false,
          error: 'VPN not owned',
        };
      }

      const vpnType = hasPremiumVPN ? 'premium' : 'basic';
      const vpnTypeDisplay = hasPremiumVPN ? 'Premium' : 'Basic';
      const softwareId = hasPremiumVPN ? 'vpn-premium' : 'vpn-basic';
      const duration = (vpnType === 'premium' && vpnToolModule.duration.premium !== undefined)
        ? vpnToolModule.duration.premium
        : vpnToolModule.duration.basic;

      // Queue the VPN connection action
      queueToolAction(
        'vpn',
        `${vpnTypeDisplay} VPN: Connecting...`,
        duration,
        async () => {
          // Connect to VPN (actual work happens here)
          connectionStore.connectVPN(vpnType);

          // Emit tool used event (mission handlers will check if this completes a task)
          emitToolUsed('vpn', vpnType, true);

          // Add completion message to terminal
          const terminalStore = useTerminalStore.getState();
          const connectionContext = {
            hostname: 'neoncloud',
            vpnConnected: true,
            vpnType: vpnType as 'basic' | 'premium',
          };

          terminalStore.addLine({
            type: 'output',
            content: [
              `Connected to ${vpnTypeDisplay} VPN`,
              'Your IP address is now hidden.',
              'All network traffic is encrypted.',
            ],
            connectionContext,
          });
        }
      );

      // Return immediately (progress bar will show)
      return {
        output: [
          `Connecting to ${vpnTypeDisplay} VPN...`,
          'Establishing secure connection...',
        ],
        success: true,
        educationalContent: {
          id: 'vpn-explanation',
          title: 'Virtual Private Network (VPN)',
          content: `A VPN creates a secure, encrypted tunnel between your device and a remote server.

**Benefits:**
- Encrypts your internet traffic
- Hides your IP address
- Bypasses geographic restrictions
- Protects privacy on public networks

**How it works:**
- Your data is encrypted before leaving your device
- Sent through a secure tunnel to the VPN server
- Server decrypts and forwards to destination
- Response comes back through the encrypted tunnel`,
          type: 'concept',
          relatedCommands: ['vpn'],
          relatedMissions: ['n00b-01'],
          difficulty: 1,
        },
      };
    },
  },
};

