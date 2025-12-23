import { Command, CommandResult, GameContext } from '@/types';
import { useConnectionStore } from '../state/useConnectionStore';
import { useFileSystemStore } from '../state/useFileSystemStore';
import { emitServerDisconnected } from '../events/eventBus';

/**
 * Logout command - Disconnect from remote server (SSH/RDP)
 * Primary command: logout
 * For VPN disconnection, use "vpn disconnect"
 */
export const disconnectCommand: Command = {
  name: 'logout',
  aliases: ['disconnect', 'dc', 'exit-server', 'exit'],
  description: 'Disconnect from remote server (SSH/RDP). Use "vpn disconnect" for VPN.',
  usage: 'logout [server]',
  requiresUnlock: false,
  execute: (args: string[], _context?: GameContext): CommandResult => {
    const connectionStore = useConnectionStore.getState();
    const currentServer = connectionStore.getCurrentRemoteServer();
    
    // If server specified in args, validate it matches current connection
    if (args.length > 0 && args[0]) {
      const requestedServer = args[0];
      if (currentServer !== requestedServer) {
          return {
            output: [
              `Error: Not connected to ${requestedServer}.`,
              currentServer 
                ? `Currently connected to ${currentServer}. Use "logout" to disconnect.`
                : 'Not connected to any remote server.',
              '',
              'Usage: logout [server]',
              '  logout          - Disconnect from current server',
              '  logout server-01 - Disconnect from server-01 (if connected)',
              '  disconnect      - Alias for logout',
              '',
              'For VPN: Use "vpn disconnect"',
            ],
            success: false,
            error: 'Server mismatch',
          };
      }
    }
    
    if (!currentServer) {
      return {
        output: [
          'Not connected to any remote server.',
          '',
          'Usage: logout [server]',
          '  logout          - Disconnect from current server',
          '  disconnect      - Alias for logout',
          '',
          'For VPN disconnection, use: vpn disconnect',
        ],
        success: false,
        error: 'Not connected',
      };
    }
    
    // Disconnect from remote server
    connectionStore.disconnectRemoteServer();
    
    // Switch back to local file system
    const fileSystemStore = useFileSystemStore.getState();
    fileSystemStore.setActiveServer(null);
    
    // Emit server disconnected event (mission handlers will check if this completes a task)
    emitServerDisconnected(currentServer);
    
    return {
      output: [
        `Disconnected from ${currentServer}`,
        'You are now back on your local system.',
      ],
      success: true,
    };
  },
};

