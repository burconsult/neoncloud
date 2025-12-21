import { Command, CommandResult, GameContext } from '@/types';
import { useConnectionStore } from '../state/useConnectionStore';
import { useFileSystemStore } from '../state/useFileSystemStore';
import { emitServerDisconnected } from '../events/eventBus';

/**
 * Disconnect command - Disconnect from VPN or remote server
 */
export const disconnectCommand: Command = {
  name: 'disconnect',
  aliases: ['dc', 'exit-server'],
  description: 'Disconnect from VPN or remote server',
  usage: 'disconnect',
  requiresUnlock: false,
  execute: (_args: string[], _context?: GameContext): CommandResult => {
    const connectionStore = useConnectionStore.getState();
    
    const isVPNConnected = connectionStore.isVPNConnected();
    const currentServer = connectionStore.getCurrentRemoteServer();
    
    if (!isVPNConnected && !currentServer) {
      return {
        output: 'Not connected to VPN or any remote server.',
        success: false,
        error: 'Not connected',
      };
    }
    
    const messages: string[] = [];
    
    // Disconnect from remote server if connected
    if (currentServer) {
      connectionStore.disconnectRemoteServer();
      
      // Switch back to local file system
      const fileSystemStore = useFileSystemStore.getState();
      fileSystemStore.setActiveServer(null);
      
      messages.push(`Disconnected from ${currentServer}`);
      messages.push('You are now back on your local system.');
      
      // Emit server disconnected event (mission handlers will check if this completes a task)
      emitServerDisconnected(currentServer);
    }
    
    // Disconnect from VPN if connected
    if (isVPNConnected) {
      const vpnType = connectionStore.vpnType === 'premium' ? 'Premium' : 'Basic';
      connectionStore.disconnectVPN();
      messages.push(`Disconnected from ${vpnType} VPN`);
      messages.push('Your IP address is now visible.');
    }
    
    return {
      output: messages,
      success: true,
    };
  },
};

