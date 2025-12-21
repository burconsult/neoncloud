/**
 * Connection Command
 * 
 * This file contains connection-related commands that are not tools.
 * Tool commands are now in src/game/tools/modules/ (vpn, passwordCracker, logShredder, etc.)
 */

import { Command, CommandResult } from '@/types';
import { useConnectionStore } from '../state/useConnectionStore';
import { useFileSystemStore } from '../state/useFileSystemStore';
import { useInventoryStore } from '../state/useInventoryStore';
import { getServerFileSystem } from '../filesystem/serverFileSystems';
import { emitServerConnected, emitServerDisconnected } from '../events/eventBus';
import { getToolDuration } from '../time/toolDurations';
import { actionQueue } from '../time/actionQueue';

/**
 * Connect to server command
 * Supports: connect server-01, ssh admin@server-01, ssh server-01
 */
export const connectCommand: Command = {
  name: 'connect',
  aliases: ['ssh', 'remote'],
  description: 'Connect to or disconnect from a remote server',
  usage: 'connect <server> | ssh [user@]server | disconnect',
  requiresUnlock: false,
  execute: async (args: string[]): Promise<CommandResult> => {
    const connectionStore = useConnectionStore.getState();
    
    if (args.length === 0 || !args[0]) {
      return {
        output: [
          'Usage: connect <server> | ssh [user@]server | disconnect',
          '',
          'Commands:',
          '  connect <server>     - Connect to a remote server',
          '  ssh [user@]server    - SSH to a remote server (alternative syntax)',
          '  disconnect           - Disconnect from current server',
          '',
          'Examples:',
          '  connect server-01',
          '  ssh admin@server-01',
          '  ssh server-01',
          '  disconnect',
          '',
          'You need to extract the password first by cracking encrypted credential files.',
        ],
        success: false,
        error: 'Missing arguments',
      };
    }
    
    const subcommand = args[0]?.toLowerCase() || '';
    
    // Handle disconnect
    if (subcommand === 'disconnect') {
      const currentServer = connectionStore.getCurrentRemoteServer();
      if (!currentServer) {
        return {
          output: 'Not connected to any remote server.',
          success: false,
          error: 'Not connected',
        };
      }
      
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
    }
    
    // Parse server and username from arguments
    // Support: "connect server-01", "ssh admin@server-01", "ssh server-01"
    let server: string;
    let requestedUsername: string | null = null;
    
    const target = args[0];
    if (!target) {
      return {
        output: 'Missing server argument',
        success: false,
        error: 'Missing argument',
      };
    }
    
    // Check if it's in user@server format
    if (target.includes('@')) {
      const parts = target.split('@');
      if (parts.length === 2 && parts[0] && parts[1]) {
        requestedUsername = parts[0];
        server = parts[1];
      } else {
        return {
          output: 'Invalid format. Use: ssh user@server or connect server',
          success: false,
          error: 'Invalid format',
        };
      }
    } else {
      server = target;
    }
    
    // Check if already connected to a different server
    const currentServer = connectionStore.getCurrentRemoteServer();
    if (currentServer && currentServer !== server) {
      return {
        output: [
          `Already connected to ${currentServer}.`,
          'Use "disconnect" first to disconnect, then connect to another server.',
        ],
        success: false,
        error: 'Already connected',
      };
    }
    
    if (currentServer === server) {
      return {
        output: `Already connected to ${server}. Use "disconnect" to disconnect.`,
        success: false,
        error: 'Already connected',
      };
    }
    
    // Check if we have credentials for this server
    // First check mission-provided credentials (from cracked files), then fall back to host registry
    let credentials = connectionStore.getServerCredentials(server);
    
    // If no mission credentials, check host entity for default credentials
    if (!credentials && host?.credentials) {
      // Host has credentials defined, but they may require cracking
      if (host.credentials.requiresCracking) {
        // Still need to crack them via mission files
        credentials = null;
      } else {
        // Use host credentials directly (rare case)
        credentials = {
          serverId: server,
          username: host.credentials.username,
          password: host.credentials.password,
        };
        // Store them for future use
        connectionStore.setServerCredentials(server, host.credentials.username, host.credentials.password);
      }
    }
    
    if (!credentials) {
      return {
        output: [
          `Cannot connect to ${server} without credentials.`,
          '',
          'You need to extract the username and password first.',
          'Check your email for mission details and encrypted credential files.',
          'Use the crack command on encrypted files to extract passwords.',
          '',
          'Example: crack server-01-credentials.enc',
        ],
        success: false,
        error: 'Missing credentials',
      };
    }
    
    // Validate username if provided
    if (requestedUsername && requestedUsername !== credentials.username) {
      return {
        output: [
          `Authentication failed.`,
          `Username "${requestedUsername}" is not valid for ${server}.`,
          `Use: ssh ${credentials.username}@${server}`,
        ],
        success: false,
        error: 'Invalid username',
      };
    }
    
    // Verify password (use stored password from cracked credentials)
    const password = credentials.password;
    
    if (!password) {
      return {
        output: [
          `Password for ${credentials.username}@${server} not found.`,
          'Make sure you have cracked the encrypted credential file.',
        ],
        success: false,
        error: 'Password not found',
      };
    }
    
    // Validate host exists in world registry
    const { worldRegistry } = await import('../world/registry/WorldRegistry');
    const { useDiscoveryStore } = await import('../world/discovery/DiscoveryStore');
    const host = worldRegistry.getHost(server);
    
    if (!host) {
      return {
        output: [
          `Connecting to ${server}...`,
          '',
          `Connection failed: Host ${server} not found in network registry.`,
          '',
          'Use network scanning to discover hosts before connecting.',
        ],
        success: false,
        error: 'Host not found',
      };
    }
    
    // Check if host is online
    if (host.isOnline === false) {
      return {
        output: [
          `Connecting to ${server}...`,
          '',
          `Connection failed: Host ${server} is offline or unreachable.`,
        ],
        success: false,
        error: 'Host offline',
      };
    }
    
    // Check if host has been discovered
    const discoveryStore = useDiscoveryStore.getState();
    if (!discoveryStore.isHostDiscovered(server)) {
      return {
        output: [
          `Connecting to ${server}...`,
          '',
          `Connection failed: Host ${server} is not in your network registry.`,
          '',
          'Use "scan <ip-range>" to discover hosts on the network first.',
        ],
        success: false,
        error: 'Host not discovered',
      };
    }
    
    // Check security requirements
    if (host.security.requiresFirewallBypass) {
      const inventoryStore = useInventoryStore.getState();
      if (!inventoryStore.ownsSoftware('firewall-bypass')) {
        return {
          output: [
            `Connecting to ${server}...`,
            '',
            `Connection failed: Host ${server} is protected by a firewall.`,
            '',
            'You need a Firewall Bypass Tool to access this host.',
            'Purchase it from the software store.',
          ],
          success: false,
          error: 'Firewall protection',
        };
      }
    }
    
    // Verify server file system exists (fallback to legacy system)
    const fileSystemStore = useFileSystemStore.getState();
    const serverFileSystem = getServerFileSystem(server);
    
    if (!serverFileSystem) {
      return {
        output: [
          `Connecting to ${server}...`,
          '',
          `Connection failed: Server ${server} file system not configured.`,
          '',
          'Available servers will be provided in mission briefings.',
        ],
        success: false,
        error: 'Server not configured',
      };
    }
    
    // Enqueue the connection action
    const duration = getToolDuration('connect');
    
    return new Promise((resolve) => {
      actionQueue.enqueue({
        id: `connect-server-${Date.now()}`,
        type: 'command',
        label: `Connecting to ${server}`,
        duration: duration,
        onComplete: () => {
          connectionStore.connectRemoteServer(server);
          // Set active server with username so we can start in the correct home directory
          fileSystemStore.setActiveServer(server, credentials.username);
          emitServerConnected(server, credentials.username);
          
          resolve({
            output: [
              `Connecting to ${server}...`,
              `${credentials.username}@${server}'s password:`,
              '',
              'Authenticating...',
              'Establishing secure connection...',
              '',
              `✓ Connected to ${server}`,
              `Welcome to ${server}!`,
              '',
              `Authenticated as: ${credentials.username}`,
              'You now have access to the protected server!',
              '',
              'Type "ls" to see available files and directories.',
              'Type "cd data" then "cat secret.txt" to access mission files.',
              'Type "disconnect" to return to your local system.',
            ],
            success: true,
            educationalContent: {
              id: 'server-connection-explanation',
              title: 'Server Connections',
              content: `Connecting to remote servers allows you to access systems over a network.

**Common Protocols:**
- **SSH**: Secure Shell for encrypted remote access
- **RDP**: Remote Desktop Protocol
- **Telnet**: Unencrypted (insecure, avoid in production)

**Security:**
- Always use encrypted connections (SSH)
- Use strong passwords or key-based authentication
- Keep software updated
- Monitor access logs`,
              type: 'concept',
              relatedCommands: ['connect', 'ssh'],
              relatedMissions: ['n00b-01'],
              difficulty: 2,
            },
          });
        },
      });
    });
  },
};
