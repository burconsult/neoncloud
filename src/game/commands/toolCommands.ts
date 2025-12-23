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
import { toolRegistry } from '../tools/ToolModule';
import { useGameSettingsStore } from '../state/useGameSettingsStore';
import { applyDurationMultiplier } from '../settings/difficultyConfig';
import { actionQueue } from '../time/actionQueue';

/**
 * SSH to server command
 * Primary command: ssh
 * Supports: ssh admin@server-01, ssh server-01, connect server-01 (alias)
 */
export const connectCommand: Command = {
  name: 'ssh',
  aliases: ['connect', 'remote'],
  description: 'Connect to a remote server via SSH',
  usage: 'ssh [user@]server',
  requiresUnlock: false,
  execute: async (args: string[]): Promise<CommandResult> => {
    const connectionStore = useConnectionStore.getState();
    
    if (args.length === 0 || !args[0]) {
      return {
        output: [
          'Usage: ssh [user@]server',
          '',
          'Connect to a remote server via SSH.',
          '',
          'Examples:',
          '  ssh admin@server-01',
          '  ssh server-01',
          '  connect server-01    (alias)',
          '',
          'To disconnect from a server, use: logout',
          'To connect/disconnect VPN, use: vpn connect | vpn disconnect',
          '',
          'You need to extract the password first by cracking encrypted credential files.',
        ],
        success: false,
        error: 'Missing arguments',
      };
    }
    
    // Parse server and username from arguments
    // Support: "ssh admin@server-01", "ssh server-01", "connect server-01" (alias)
    let server: string;
    let requestedUsername: string | null = null;
    
    const target = args[0];
    if (!target) {
      return {
        output: 'Missing server argument. Usage: ssh [user@]server',
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
          output: 'Invalid format. Use: ssh user@server',
          success: false,
          error: 'Invalid format',
        };
      }
    } else {
      server = target;
    }
    
    // Resolve host ID early to handle both old and new formats
    const { resolveHostId } = await import('../world/utils/hostIdUtils');
    const resolvedServerId = resolveHostId(server);
    
    // Check if already connected to a different server (compare resolved IDs)
    const currentServer = connectionStore.getCurrentRemoteServer();
    if (currentServer) {
      const resolvedCurrentServer = resolveHostId(currentServer);
      if (resolvedCurrentServer !== resolvedServerId) {
        return {
          output: [
            `Already connected to ${currentServer}.`,
            'Use "disconnect" first to disconnect, then connect to another server.',
          ],
          success: false,
          error: 'Already connected',
        };
      }
      
      if (resolvedCurrentServer === resolvedServerId) {
        return {
          output: `Already connected to ${server}. Use "disconnect" to disconnect.`,
          success: false,
          error: 'Already connected',
        };
      }
    }
    
    // Validate host exists in world registry FIRST
    const { worldRegistry } = await import('../world/registry/WorldRegistry');
    const { useDiscoveryStore } = await import('../world/discovery/DiscoveryStore');
    const host = worldRegistry.getHost(resolvedServerId);
    
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
    
    // Check if host has been discovered (use resolved ID)
    const discoveryStore = useDiscoveryStore.getState();
    if (!discoveryStore.isHostDiscovered(resolvedServerId)) {
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
    
    // Check VPN requirement using mission system
    const { useMissionStore } = await import('../state/useMissionStore');
    const missionStore = useMissionStore.getState();
    const currentMission = missionStore.currentMission;
    
    if (currentMission) {
      // Check if current mission has a VPN connect task that should be completed first
      const vpnTask = currentMission.tasks.find(t => {
        if (t.type !== 'command' || !t.solution) return false;
        const solution = t.solution.toLowerCase().trim();
        return solution.startsWith('vpn connect');
      });
      
      // If mission has a VPN task and it's not completed, require VPN connection
      if (vpnTask && !missionStore.isTaskCompleted(currentMission.id, vpnTask.id)) {
        if (!connectionStore.isVPNConnected()) {
          return {
            output: [
              `Cannot connect to ${server} without VPN protection.`,
              '',
              'This mission requires connecting to VPN first for security.',
              'Complete the VPN connection task before accessing remote servers.',
              '',
              'Use: vpn connect',
            ],
            success: false,
            error: 'VPN required',
          };
        }
      }
    }
    
    // Check if we have credentials for this server (use resolved ID)
    // Only accept credentials from cracked files (mission-provided), not host defaults
    let credentials = connectionStore.getServerCredentials(resolvedServerId);
    
    // If no mission credentials, check if host has credentials that require cracking
    if (!credentials && host.credentials) {
      if (host.credentials.requiresCracking) {
        // Credentials require cracking - must come from mission files
        credentials = null;
      } else {
        // Host has non-cracked credentials - only allow if explicitly permitted by mission
        // For now, we'll be strict: credentials must come from cracked files
        credentials = null;
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
          '',
          'Note: Credentials must be obtained by cracking encrypted files from mission emails.',
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
    
    // Verify server file system exists (query through world graph, use resolved ID)
    const fileSystemStore = useFileSystemStore.getState();
    const serverFileSystem = await getServerFileSystem(resolvedServerId);
    
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
    // Connection duration: 3 seconds base, no tool module needed for this
    const baseDuration = 3;
    const difficulty = useGameSettingsStore.getState().difficulty;
    const duration = applyDurationMultiplier(baseDuration, difficulty);
    
    return new Promise((resolve) => {
      actionQueue.enqueue({
        id: `connect-server-${Date.now()}`,
        type: 'command',
        label: `Connecting to ${server}`,
        duration: duration,
        onComplete: () => {
          connectionStore.connectRemoteServer(resolvedServerId);
          // Set active server with username so we can start in the correct home directory
          fileSystemStore.setActiveServer(resolvedServerId, credentials.username);
          emitServerConnected(resolvedServerId, credentials.username);
          
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
