import { MissionModule } from '../MissionModule';
import { getMissionTitle, getMissionDescription, getTaskObjective, getTaskHints, getTaskDescription } from '../missionContentHelpers';
import { Email } from '@/types/email';
import { getHostDisplayName, getOrganizationDisplayName } from '../../world/graph/WorldGraphQueries';
import { worldRegistry } from '../../world/registry/WorldRegistry';

/**
 * Network Investigation Mission Module
 * Category: Script Kiddie (02)
 * Mission Number: 03
 * Mission ID: n00b-03
 * 
 * This mission tests the graph system robustness and uses multiple training commands:
 * - ping: Verify server connectivity
 * - traceroute: Trace network path
 * - nslookup: DNS resolution
 * - ls, cd, cat: File system navigation
 * - pwd: Verify current location
 */

/**
 * Create email for network investigation mission
 */
function createNetworkInvestigationEmail(): Email {
  const targetHostName = getHostDisplayName('server-01');
  const targetOrgName = getOrganizationDisplayName('megacorp');
  const host = worldRegistry.getHost('server-01');
  const hostIP = host?.ipAddress || '192.168.1.100';
  const hostDomain = host?.domainName || 'server-01.megacorp.local';
  const org = worldRegistry.getOrganization('megacorp');
  const orgDomain = org?.domain || 'megacorp.com';
  
  return {
    id: 'email-network-investigation-001',
    from: 'contracts@neoncloud-ops.org',
    to: 'agent@neoncloud.local',
    subject: `Contract Assignment: Network Investigation - ${targetHostName}`,
    worldGraph: {
      fromContactId: 'agent-smith',
      fromOrganizationId: 'neoncloud',
      relatedHostIds: ['server-01'],
      relatedOrganizationIds: ['megacorp'],
    },
    body: `Agent,

We need you to conduct a comprehensive network investigation on ${targetHostName}. This mission will test your understanding of network protocols and system navigation.

**Target Information:**
- Organization: ${targetOrgName}
- Target Server: ${targetHostName}
- IP Address: ${hostIP}
- Domain: ${hostDomain}
- Organization Domain: ${orgDomain}

**Mission Objectives:**
1. Use network commands to investigate the target server before connecting
2. Verify connectivity using ping
3. Trace the network path using traceroute
4. Resolve DNS information using nslookup
5. Connect to the server and locate a specific configuration file
6. Extract network configuration details

**Required Skills:**
This mission requires you to use commands learned in training:
- \`ping\` - Test network connectivity
- \`traceroute\` - Trace network path
- \`nslookup\` - DNS resolution
- \`ls\`, \`cd\`, \`cat\` - File system navigation
- \`pwd\` - Verify current directory

**Important Notes:**
- Use VPN for anonymity (you should already have this from previous missions)
- The server credentials are the same as your previous mission (admin/cyberpass123)
- Look for a network configuration file in /etc directory
- Document your findings as you progress

This mission tests your ability to combine multiple skills learned in training. Good luck.

NC-SCOG Operations
contracts@neoncloud-ops.org`,
    timestamp: Date.now(),
    read: false,
    attachments: [],
    missionId: 'n00b-03',
  };
}

export const networkInvestigationMissionModule: MissionModule = {
  missionId: 'n00b-03',
  
  // World Graph Relationships
  worldGraph: {
    clientOrganizationId: 'neoncloud',
    targetHostIds: ['server-01'],
    targetOrganizationIds: ['megacorp'],
    contactId: 'agent-smith',
  },
  
  mission: {
    id: 'n00b-03',
    title: getMissionTitle('n00b-03', 'Network Investigation: Server-01 Analysis'),
    description: getMissionDescription('n00b-03', 'Conduct a comprehensive network investigation using training commands. Verify connectivity, trace network paths, resolve DNS, and extract configuration files.'),
    category: 'script-kiddie',
    learningObjectives: [
      'Apply network commands from training in a real scenario',
      'Combine multiple commands to investigate a target',
      'Understand network topology and DNS resolution',
      'Navigate server filesystems to find configuration files',
    ],
    difficulty: 'intermediate',
    tasks: [
      {
        id: 'task-1',
        description: getTaskDescription('n00b-03', 'Read the investigation email'),
        type: 'command',
        objective: getTaskObjective('n00b-03', 'Read the email with network investigation instructions'),
        hints: getTaskHints('n00b-03', [
          'Type "mail" to view your inbox',
          'Read the email from contracts@neoncloud-ops.org',
        ]),
        solution: 'mail read',
        reward: 20,
      },
      {
        id: 'task-2',
        description: getTaskDescription('n00b-03', 'Connect to VPN'),
        type: 'command',
        objective: getTaskObjective('n00b-03', 'Connect to VPN for anonymity'),
        hints: getTaskHints('n00b-03', [
          'Type "vpn connect" if you have a VPN',
          'You should already have VPN from previous missions',
        ]),
        solution: 'vpn connect',
        reward: 15,
      },
      {
        id: 'task-3',
        description: getTaskDescription('n00b-03', 'Ping the target server'),
        type: 'command',
        objective: getTaskObjective('n00b-03', 'Use ping to verify connectivity to server-01'),
        hints: getTaskHints('n00b-03', [
          'Use "ping server-01" or "ping 192.168.1.100"',
          'This verifies the server is reachable',
        ]),
        solution: 'ping server-01',
        reward: 20,
      },
      {
        id: 'task-4',
        description: getTaskDescription('n00b-03', 'Trace network path to server'),
        type: 'command',
        objective: getTaskObjective('n00b-03', 'Use traceroute to trace the network path to server-01'),
        hints: getTaskHints('n00b-03', [
          'Use "traceroute server-01" or "traceroute 192.168.1.100"',
          'This shows the network path to the target',
        ]),
        solution: 'traceroute server-01',
        reward: 25,
      },
      {
        id: 'task-5',
        description: getTaskDescription('n00b-03', 'Resolve DNS for target domain'),
        type: 'command',
        objective: getTaskObjective('n00b-03', 'Use nslookup to resolve DNS for server-01.megacorp.local'),
        hints: getTaskHints('n00b-03', [
          'Use "nslookup server-01.megacorp.local"',
          'This resolves the domain name to IP address',
        ]),
        solution: 'nslookup server-01.megacorp.local',
        reward: 25,
      },
      {
        id: 'task-6',
        description: getTaskDescription('n00b-03', 'Connect to server-01'),
        type: 'command',
        objective: getTaskObjective('n00b-03', 'Connect to server-01 using credentials from previous mission'),
        hints: getTaskHints('n00b-03', [
          'Use "connect server-01"',
          'Credentials: admin / cyberpass123 (same as n00b-01)',
        ]),
        solution: 'connect server-01',
        reward: 30,
      },
      {
        id: 'task-7',
        description: getTaskDescription('n00b-03', 'Verify current directory'),
        type: 'command',
        objective: getTaskObjective('n00b-03', 'Use pwd to verify you are in /home/admin'),
        hints: getTaskHints('n00b-03', [
          'Type "pwd" to print working directory',
          'You should be in /home/admin after connecting',
        ]),
        solution: 'pwd',
        reward: 15,
      },
      {
        id: 'task-8',
        description: getTaskDescription('n00b-03', 'Navigate to /etc directory'),
        type: 'command',
        objective: getTaskObjective('n00b-03', 'Use cd to navigate to /etc directory'),
        hints: getTaskHints('n00b-03', [
          'Use "cd /etc" to change to the etc directory',
          'This is where system configuration files are stored',
        ]),
        solution: 'cd /etc',
        reward: 20,
      },
      {
        id: 'task-9',
        description: getTaskDescription('n00b-03', 'List files in /etc'),
        type: 'command',
        objective: getTaskObjective('n00b-03', 'Use ls to list files in /etc directory'),
        hints: getTaskHints('n00b-03', [
          'Type "ls" to list directory contents',
          'Look for configuration files like hostname, passwd',
        ]),
        solution: 'ls',
        reward: 15,
      },
      {
        id: 'task-10',
        description: getTaskDescription('n00b-03', 'Read hostname file'),
        type: 'command',
        objective: getTaskObjective('n00b-03', 'Use cat to read /etc/hostname file'),
        hints: getTaskHints('n00b-03', [
          'Use "cat hostname" or "cat /etc/hostname"',
          'This file contains the server hostname',
        ]),
        solution: 'cat hostname',
        reward: 25,
      },
      {
        id: 'task-11',
        description: getTaskDescription('n00b-03', 'Disconnect from server'),
        type: 'command',
        objective: getTaskObjective('n00b-03', 'Disconnect from server-01 after completing investigation'),
        hints: getTaskHints('n00b-03', [
          'Use "disconnect" to disconnect from the server',
          'Always disconnect after completing objectives',
        ]),
        solution: 'disconnect',
        reward: 20,
      },
    ],
    prerequisites: ['n00b-02'],
    // unlocks: [] - Removed: Dynamic ordering system handles next mission automatically
    reward: 350,
  },

  // Email sent when mission starts
  startEmails: [createNetworkInvestigationEmail()],

  completionEmails: undefined,
  unlockLore: undefined,
  fileSystemAdditions: undefined,
  requiredSoftware: ['vpn-basic', 'password-cracker-basic'], // Should already be owned
  
  // Expected completion time: 12 minutes
  expectedCompletionTime: 12 * 60,
  
  // No purchase task mapping needed (tools should already be owned)
  purchaseTaskMapping: {},
};

