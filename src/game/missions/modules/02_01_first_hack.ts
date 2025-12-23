import { MissionModule } from '../MissionModule';
import { createFirstHackEmail } from '../../emails/emailTemplates';
import { getMissionTitle, getMissionDescription, getTaskObjective, getTaskHints, getTaskDescription } from '../missionContentHelpers';

/**
 * First Hack Mission Module
 * Category: Script Kiddie (02)
 * Mission Number: 01
 * Mission ID: n00b-01
 */
export const firstHackMissionModule: MissionModule = {
  missionId: 'n00b-01',
  
  // World Graph Relationships
  worldGraph: {
    clientOrganizationId: 'neoncloud', // Mission provided by NeonCloud
    targetHostIds: ['megacorp-server-01'], // Target host
    targetOrganizationIds: ['megacorp'], // Target organization
    contactId: 'agent-smith', // Contact who briefs the player
  },
  
  mission: {
    id: 'n00b-01',
    title: getMissionTitle('n00b-01', 'First Hack: Server-01 Penetration Test'),
    description: getMissionDescription('n00b-01', 'Complete your first contract: Penetration test on server-01. Check your email for mission details and encrypted credentials.'),
    category: 'script-kiddie',
    learningObjectives: [
      'Use purchased software tools',
      'Understand VPN for anonymity',
      'Use password cracking tools',
      'Access protected systems',
    ],
    difficulty: 'beginner',
    tasks: [
      {
        id: 'task-1',
        description: 'Read the contract email',
        type: 'command',
        objective: getTaskObjective('n00b-01', 'Check your email for the server-01 contract details'),
        hints: getTaskHints('n00b-01', [
          'Type "mail" to view your inbox',
          'Read the email from contracts@neoncloud-ops.org',
          'The email contains mission details and an encrypted credentials file',
        ]),
        solution: 'mail read',
        reward: 20,
      },
      {
        id: 'task-1a',
        description: getTaskDescription('n00b-01', 'Discover Megacorp IP address'),
        type: 'command',
        objective: getTaskObjective('n00b-01', 'Use ping or nslookup to discover megacorp.com IP address'),
        hints: getTaskHints('n00b-01', [
          'The email mentions megacorp.com - use your training tools to investigate',
          'Try "ping megacorp.com" to discover the IP address',
          'Or use "nslookup megacorp.com" to get DNS records',
          'This will reveal the organization\'s public IP address',
        ]),
        solution: 'ping megacorp.com',
        reward: 25,
      },
      {
        id: 'task-2',
        description: getTaskDescription('n00b-01', 'Scan the Megacorp network to discover hosts'),
        type: 'command',
        objective: getTaskObjective('n00b-01', 'Use the Network Scanner to scan the Megacorp network range and discover active hosts including server-01'),
        hints: getTaskHints('n00b-01', [
          'From the IP address you discovered, determine the network range',
          'If the IP is 203.0.113.1, try scanning 203.0.113.0/24',
          'Use "scan 203.0.113.0/24" to scan the network range',
          'This will discover server-01 so you know what to connect to',
          'The scan results will show server-01 with its IP address',
        ]),
        solution: 'scan 203.0.113.0/24',
        reward: 30,
      },
      {
        id: 'task-3',
        description: 'Purchase a Basic VPN',
        type: 'learn',
        objective: 'Buy a Basic VPN from the store',
        hints: [
          'Type "store" to open the software store',
          'Purchase "Basic VPN" (200 NC)',
          'You need to complete training missions first to earn NeonCoins',
        ],
        solution: 'vpn-basic',
        reward: 20,
      },
      {
        id: 'task-4',
        description: 'Connect to the VPN',
        type: 'command',
        objective: 'Use the VPN to hide your IP address',
        hints: [
          'Type "vpn connect" after purchasing',
          'VPN encrypts your connection',
        ],
        solution: 'vpn connect',
        reward: 20,
      },
      {
        id: 'task-6',
        description: 'Purchase a Basic Password Cracker',
        type: 'learn',
        objective: 'Buy a Basic Password Cracker from the store',
        hints: [
          'Type "store" to open the software store',
          'Purchase "Basic Password Cracker" (300 NC)',
          'You need enough NeonCoins to purchase it',
        ],
        solution: 'password-cracker-basic',
        reward: 30,
      },
      {
        id: 'task-5',
        description: getTaskDescription('n00b-01', 'Decrypt the server-01 credentials file'),
        type: 'command',
        objective: getTaskObjective('n00b-01', 'Crack the encrypted credentials file from the email'),
        hints: getTaskHints('n00b-01', [
          'The credentials file is in your Documents folder',
          'Use "crack server-01-credentials.enc" to decrypt it',
          'Make sure you purchased the password cracker first',
        ]),
        solution: 'crack',
        reward: 30,
      },
      {
        id: 'task-7',
        description: getTaskDescription('n00b-01', 'Connect to server-01'),
        type: 'command',
        objective: getTaskObjective('n00b-01', 'Connect to server-01 using the extracted credentials'),
        hints: getTaskHints('n00b-01', [
          'Type "ssh server-01" or "ssh admin@server-01" after decrypting the credentials',
          'Credentials are automatically loaded after decryption',
          'You can also use "connect server-01" as an alias',
          'You need to be connected to VPN first',
        ]),
        solution: 'ssh server-01',
        reward: 30,
      },
      {
        id: 'task-8',
        description: getTaskDescription('n00b-01', 'Read secret.txt on server-01'),
        type: 'command',
        objective: getTaskObjective('n00b-01', 'Read the secret file in /home/admin/data/secret.txt on server-01'),
        hints: getTaskHints('n00b-01', [
          'You start in /home/admin, navigate to the data directory',
          'Type "cd data" then "cat secret.txt" or "cat /home/admin/data/secret.txt"',
        ]),
            solution: 'cat /home/admin/data/secret.txt',
        reward: 50,
      },
      {
        id: 'task-9',
        description: getTaskDescription('n00b-01', 'Disconnect from server-01'),
        type: 'command',
        objective: getTaskObjective('n00b-01', 'Disconnect from server-01 after completing the mission'),
        hints: getTaskHints('n00b-01', [
          'Use "logout" to disconnect from the server',
          'You can also use "disconnect" as an alias',
          'You should always disconnect after completing your objectives',
        ]),
        solution: 'logout',
        reward: 20,
      },
    ],
    prerequisites: ['network-03'],
    // unlocks: ['n00b-02'] - Removed: Dynamic ordering system handles next mission automatically
    reward: 300,
  },

  // Email sent when mission starts (triggered when network-03 completes)
  startEmails: [createFirstHackEmail()],

  completionEmails: undefined,
  unlockLore: undefined,
  fileSystemAdditions: undefined,
  requiredSoftware: ['network-scanner-basic', 'vpn-basic', 'password-cracker-basic'],
  
  // Expected completion time: 15 minutes
  expectedCompletionTime: 15 * 60,
  
  // Purchase task mapping: which purchases complete which tasks
  purchaseTaskMapping: {
    'vpn-basic': 'task-3', // Purchase VPN completes task-3
    'password-cracker-basic': 'task-6', // Purchase password cracker completes task-6
  },
};

