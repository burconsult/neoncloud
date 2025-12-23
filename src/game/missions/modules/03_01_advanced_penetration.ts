import { MissionModule } from '../MissionModule';
import { getMissionTitle, getMissionDescription, getTaskObjective, getTaskHints, getTaskDescription } from '../missionContentHelpers';
import { Email } from '@/types/email';
import { getHostDisplayName, getOrganizationDisplayName } from '../../world/graph/WorldGraphQueries';
import { worldRegistry } from '../../world/registry/WorldRegistry';

/**
 * Advanced Penetration Mission Module
 * Category: Cyber Warrior (03)
 * Mission Number: 01
 * Mission ID: h4x0r-01
 * 
 * This mission tests the graph system robustness with advanced tools:
 * - Premium Network Scanner: Fast network scanning
 * - Premium VPN: Faster connection speeds
 * - Advanced Password Cracker: Faster decryption
 * - Log Shredder: Cover tracks on multiple servers
 * - Multiple server access and file operations
 */

/**
 * Create email for advanced penetration mission
 */
function createAdvancedPenetrationEmail(): Email {
  const targetOrgName = getOrganizationDisplayName('megacorp');
  const org = worldRegistry.getOrganization('megacorp');
  const ipRange = org?.ipRange || '192.168.1.0/24';
  
  // Get both servers for dynamic content
  const server01Name = getHostDisplayName('server-01');
  const server02Name = getHostDisplayName('server-02');
  const server01 = worldRegistry.getHost('server-01');
  const server02 = worldRegistry.getHost('server-02');
  
  return {
    id: 'email-advanced-penetration-001',
    from: 'contracts@neoncloud-ops.org',
    to: 'agent@neoncloud.local',
    subject: `High-Priority Contract: Multi-Server Penetration Test`,
    worldGraph: {
      fromContactId: 'agent-smith',
      fromOrganizationId: 'neoncloud',
      relatedHostIds: ['server-01', 'server-02'],
      relatedOrganizationIds: ['megacorp'],
    },
    body: `Agent,

This is a high-priority contract requiring advanced skills and premium tools. You've proven yourself capable, and now it's time to demonstrate mastery.

**Target Information:**
- Organization: ${targetOrgName}
- Network: ${ipRange}
- Targets: Multiple servers (discover via network scan)
- Security Level: Enhanced

**Mission Objectives:**
1. Use Premium Network Scanner to discover all active hosts
2. Connect via Premium VPN for optimal performance
3. Extract credentials from encrypted files (Advanced Password Cracker recommended)
4. Access ${server01Name} and extract configuration files
5. Access ${server02Name} and extract database schemas
6. Cover your tracks on both servers using Log Shredder
7. Document all findings

**Required Tools:**
- Premium Network Scanner (for fast scanning)
- Premium VPN (for faster connections)
- Advanced Password Cracker (recommended - faster decryption)
- Log Shredder (for covering tracks)

**Important Notes:**
- This mission requires premium tools for optimal performance
- You'll need to access multiple servers
- Use advanced tools to complete objectives faster
- Always cover your tracks after extraction

**Encrypted Credentials:**
Two encrypted credential files are attached:
- server-01-advanced-credentials.enc (for ${server01Name})
- server-02-advanced-credentials.enc (for ${server02Name})

Extract both passwords, then access the servers. The Advanced Password Cracker will significantly speed up this process.

This mission tests your ability to coordinate multiple operations and use advanced tools effectively. Good luck.

NC-SCOG Operations
contracts@neoncloud-ops.org`,
    timestamp: Date.now(),
    read: false,
    attachments: [
      {
        filename: 'server-01-advanced-credentials.enc',
        encrypted: true,
        encryptedContent: `K9#mP7$vL3@qR8%tN2&wY6!jU4*oZ1^eB9(cF5)dH7+eI3-fJ8_gN2=hO5{kP7}qR4|sT9~uW2`,
        password: 'cyberpass123',
      },
      {
        filename: 'server-02-advanced-credentials.enc',
        encrypted: true,
        encryptedContent: `M3#nP9$wK5@rL7%tM2&xY8!jV4*oZ6^eB2(cF9)dH5+eI7-fJ3_gN8=hO4{kP2}qR7|sT5~uW9`,
        password: 'cyberpass456',
      },
    ],
    missionId: 'h4x0r-01',
  };
}

export const advancedPenetrationMissionModule: MissionModule = {
  missionId: 'h4x0r-01',
  
  // World Graph Relationships
  worldGraph: {
    clientOrganizationId: 'neoncloud',
    targetHostIds: ['server-01', 'server-02'], // Multiple targets
    targetOrganizationIds: ['megacorp'],
    contactId: 'agent-smith',
  },
  
  mission: {
    id: 'h4x0r-01',
    title: getMissionTitle('h4x0r-01', 'Advanced Penetration: Multi-Server Operation'),
    description: getMissionDescription('h4x0r-01', 'Conduct a comprehensive multi-server penetration test using premium tools. Discover hosts, extract credentials, access multiple servers, and cover your tracks.'),
    category: 'cyber-warrior',
    learningObjectives: [
      'Use premium tools for enhanced performance',
      'Coordinate operations across multiple servers',
      'Apply advanced decryption techniques',
      'Cover tracks on multiple systems',
      'Demonstrate mastery of network security concepts',
    ],
    difficulty: 'advanced',
    tasks: [
      {
        id: 'task-1',
        description: getTaskDescription('h4x0r-01', 'Read the advanced penetration email'),
        type: 'command',
        objective: getTaskObjective('h4x0r-01', 'Read the email with advanced penetration instructions'),
        hints: getTaskHints('h4x0r-01', [
          'Type "mail" to view your inbox',
          'Read the email from contracts@neoncloud-ops.org',
          'This mission requires premium tools',
        ]),
        solution: 'mail read',
        reward: 30,
      },
      {
        id: 'task-2',
        description: getTaskDescription('h4x0r-01', 'Purchase Premium Network Scanner'),
        type: 'learn',
        objective: getTaskObjective('h4x0r-01', 'Purchase Premium Network Scanner from the store (350 NC)'),
        hints: getTaskHints('h4x0r-01', [
          'Type "store" to open the software store',
          'Look for "Premium Network Scanner" (350 NC)',
          'Premium scanner is faster and more efficient',
        ]),
        solution: 'network-scanner-premium',
        reward: 40,
      },
      {
        id: 'task-3',
        description: getTaskDescription('h4x0r-01', 'Scan network with Premium Scanner'),
        type: 'command',
        objective: getTaskObjective('h4x0r-01', 'Use Premium Network Scanner to scan 192.168.1.0/24'),
        hints: getTaskHints('h4x0r-01', [
          'Use "scan 192.168.1.0/24" with Premium Scanner',
          'This will discover all active hosts quickly',
          'Premium scanner is faster than basic version',
        ]),
        solution: 'scan 192.168.1.0/24',
        reward: 50,
      },
      {
        id: 'task-4',
        description: getTaskDescription('h4x0r-01', 'Purchase Premium VPN'),
        type: 'learn',
        objective: getTaskObjective('h4x0r-01', 'Purchase Premium VPN from the store (500 NC)'),
        hints: getTaskHints('h4x0r-01', [
          'Type "store" to open the software store',
          'Look for "Premium VPN" (500 NC)',
          'Premium VPN provides faster connection speeds',
        ]),
        solution: 'vpn-premium',
        reward: 50,
      },
      {
        id: 'task-5',
        description: getTaskDescription('h4x0r-01', 'Connect to Premium VPN'),
        type: 'command',
        objective: getTaskObjective('h4x0r-01', 'Connect to Premium VPN for optimal performance'),
        hints: getTaskHints('h4x0r-01', [
          'Type "vpn connect" after purchasing Premium VPN',
          'Premium VPN connects faster than basic version',
        ]),
        solution: 'vpn connect',
        reward: 30,
      },
      {
        id: 'task-6',
        description: getTaskDescription('h4x0r-01', 'Purchase Advanced Password Cracker'),
        type: 'learn',
        objective: getTaskObjective('h4x0r-01', 'Purchase Advanced Password Cracker from the store (750 NC)'),
        hints: getTaskHints('h4x0r-01', [
          'Type "store" to open the software store',
          'Look for "Advanced Password Cracker" (750 NC)',
          'Advanced cracker is much faster than basic version',
        ]),
        solution: 'password-cracker-advanced',
        reward: 60,
      },
      {
        id: 'task-7',
        description: getTaskDescription('h4x0r-01', 'Decrypt server-01 credentials'),
        type: 'command',
        objective: getTaskObjective('h4x0r-01', 'Crack server-01-advanced-credentials.enc using Advanced Password Cracker'),
        hints: getTaskHints('h4x0r-01', [
          'The file is in your Documents folder',
          'Use "crack server-01-advanced-credentials.enc"',
          'Advanced cracker will decrypt it much faster',
        ]),
        solution: 'crack server-01-advanced-credentials.enc',
        reward: 50,
      },
      {
        id: 'task-8',
        description: getTaskDescription('h4x0r-01', 'Decrypt server-02 credentials'),
        type: 'command',
        objective: getTaskObjective('h4x0r-01', 'Crack server-02-advanced-credentials.enc using Advanced Password Cracker'),
        hints: getTaskHints('h4x0r-01', [
          'The file is in your Documents folder',
          'Use "crack server-02-advanced-credentials.enc"',
          'Advanced cracker handles multiple files efficiently',
        ]),
        solution: 'crack server-02-advanced-credentials.enc',
        reward: 50,
      },
      {
        id: 'task-9',
        description: getTaskDescription('h4x0r-01', 'Connect to server-01'),
        type: 'command',
        objective: getTaskObjective('h4x0r-01', 'Connect to server-01 using extracted credentials'),
        hints: getTaskHints('h4x0r-01', [
          'Type "connect server-01" after decrypting credentials',
          'Credentials are automatically loaded',
        ]),
        solution: 'connect server-01',
        reward: 40,
      },
      {
        id: 'task-10',
        description: getTaskDescription('h4x0r-01', 'Read config.ini on server-01'),
        type: 'command',
        objective: getTaskObjective('h4x0r-01', 'Read /home/admin/data/config.ini on server-01'),
        hints: getTaskHints('h4x0r-01', [
          'Navigate to /home/admin/data',
          'Use "cat config.ini" to read the file',
        ]),
        solution: 'cat /home/admin/data/config.ini',
        reward: 50,
      },
      {
        id: 'task-11',
        description: getTaskDescription('h4x0r-01', 'Shred logs on server-01'),
        type: 'command',
        objective: getTaskObjective('h4x0r-01', 'Use Log Shredder to delete /var/log/auth.log on server-01'),
        hints: getTaskHints('h4x0r-01', [
          'Use "shred /var/log/auth.log"',
          'This covers your tracks on server-01',
        ]),
        solution: 'shred /var/log/auth.log',
        reward: 50,
      },
      {
        id: 'task-12',
        description: getTaskDescription('h4x0r-01', 'Disconnect from server-01'),
        type: 'command',
        objective: getTaskObjective('h4x0r-01', 'Disconnect from server-01'),
        hints: getTaskHints('h4x0r-01', [
          'Use "disconnect" to disconnect from server-01',
        ]),
        solution: 'disconnect',
        reward: 25,
      },
      {
        id: 'task-13',
        description: getTaskDescription('h4x0r-01', 'Connect to server-02'),
        type: 'command',
        objective: getTaskObjective('h4x0r-01', 'Connect to server-02 using extracted credentials'),
        hints: getTaskHints('h4x0r-01', [
          'Type "connect server-02" after decrypting credentials',
          'You need to disconnect from server-01 first',
        ]),
        solution: 'connect server-02',
        reward: 40,
      },
      {
        id: 'task-14',
        description: getTaskDescription('h4x0r-01', 'Read database README on server-02'),
        type: 'command',
        objective: getTaskObjective('h4x0r-01', 'Read /home/admin/database/README.txt on server-02'),
        hints: getTaskHints('h4x0r-01', [
          'Navigate to /home/admin/database',
          'Use "cat README.txt" to read the file',
        ]),
        solution: 'cat /home/admin/database/README.txt',
        reward: 50,
      },
      {
        id: 'task-15',
        description: getTaskDescription('h4x0r-01', 'Shred logs on server-02'),
        type: 'command',
        objective: getTaskObjective('h4x0r-01', 'Use Log Shredder to delete /var/log/auth.log on server-02'),
        hints: getTaskHints('h4x0r-01', [
          'Use "shred /var/log/auth.log"',
          'This covers your tracks on server-02',
        ]),
        solution: 'shred /var/log/auth.log',
        reward: 50,
      },
      {
        id: 'task-16',
        description: getTaskDescription('h4x0r-01', 'Disconnect from server-02'),
        type: 'command',
        objective: getTaskObjective('h4x0r-01', 'Disconnect from server-02'),
        hints: getTaskHints('h4x0r-01', [
          'Use "disconnect" to disconnect from server-02',
          'Always disconnect after completing objectives',
        ]),
        solution: 'disconnect',
        reward: 25,
      },
    ],
    prerequisites: ['n00b-03'],
    // unlocks: [] - Removed: Dynamic ordering system handles next mission automatically
    reward: 750,
  },

  // Email sent when mission starts
  startEmails: [createAdvancedPenetrationEmail()],

  completionEmails: undefined,
  unlockLore: undefined,
  fileSystemAdditions: undefined,
  requiredSoftware: ['network-scanner-premium', 'vpn-premium', 'password-cracker-advanced', 'log-shredder'],
  
  // Expected completion time: 20 minutes (but faster with premium tools)
  expectedCompletionTime: 20 * 60,
  
  // Purchase task mapping
  purchaseTaskMapping: {
    'network-scanner-premium': 'task-2',
    'vpn-premium': 'task-4',
    'password-cracker-advanced': 'task-6',
  },
};

