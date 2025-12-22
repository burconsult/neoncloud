import { MissionModule } from '../MissionModule';
import { createDataExtractionEmail } from '../../emails/emailTemplates';

/**
 * Data Extraction Mission Module
 * Category: Script Kiddie (02)
 * Mission Number: 02
 * Mission ID: n00b-02
 * 
 * A more complex mission requiring:
 * - Multiple file extractions
 * - Log file deletion using Log Shredder
 * - More complex file system navigation
 */
export const dataExtractionMissionModule: MissionModule = {
  missionId: 'n00b-02',
  
  // World Graph Relationships
  worldGraph: {
    clientOrganizationId: 'neoncloud', // Mission provided by NeonCloud
    targetHostIds: ['server-02'], // Target host
    targetOrganizationIds: ['megacorp'], // Target organization
    contactId: 'agent-smith', // Contact who briefs the player
  },
  
  mission: {
    id: 'n00b-02',
    title: 'Data Extraction: Server-02 Database Access',
    description: 'Extract multiple files from a database server and cover your tracks. This mission requires using Log Shredder to delete access logs.',
    category: 'script-kiddie',
    learningObjectives: [
      'Extract multiple files from different directories',
      'Use Log Shredder to cover tracks',
      'Navigate complex file system structures',
      'Complete multi-step operations',
    ],
    difficulty: 'intermediate',
    tasks: [
      {
        id: 'task-1',
        description: 'Read the contract email',
        type: 'command',
        objective: 'Check your email for the server-02 contract details',
        hints: [
          'Type "mail" to view your inbox',
          'Read the email from contracts@neoncloud-ops.org',
          'The email contains mission details and encrypted credentials',
        ],
        solution: 'mail read',
        reward: 25,
      },
      {
        id: 'task-2',
        description: 'Connect to VPN',
        type: 'command',
        objective: 'Use VPN to hide your IP address',
        hints: [
          'Type "vpn connect" if you have a VPN',
          'VPN is required for all operations',
        ],
        solution: 'vpn connect',
        reward: 20,
      },
      {
        id: 'task-3',
        description: 'Purchase Log Shredder tool',
        type: 'learn',
        objective: 'Buy a Log Shredder from the store',
        hints: [
          'Type "store" to open the software store',
          'Purchase "Log Shredder" (450 NC)',
          'You need this tool to delete access logs',
        ],
        solution: 'log-shredder',
        reward: 30,
      },
      {
        id: 'task-4',
        description: 'Decrypt server-02 credentials file',
        type: 'command',
        objective: 'Crack the encrypted credentials file from the email',
        hints: [
          'The credentials file is in your Documents folder',
          'Use "crack server-02-credentials.enc" to decrypt it',
          'Make sure you have the password cracker tool',
        ],
        solution: 'crack',
        reward: 30,
      },
      {
        id: 'task-5',
        description: 'Connect to server-02',
        type: 'command',
        objective: 'Connect to server-02 using the extracted credentials',
        hints: [
          'Type "connect server-02" after decrypting credentials',
          'Credentials are automatically loaded after decryption',
        ],
        solution: 'connect server-02',
        reward: 30,
      },
      {
        id: 'task-6',
        description: 'Extract customer-data.txt',
        type: 'command',
            objective: 'Read customer-data.txt from /home/admin/database/customers/',
            hints: [
              'You start in /home/admin, navigate to database/customers',
              'Use "cd database/customers" then "cat customer-data.txt"',
              'Or use "cat /home/admin/database/customers/customer-data.txt"',
        ],
        solution: 'cat',
        reward: 50,
      },
      {
        id: 'task-7',
        description: 'Extract financial-report.txt',
        type: 'command',
            objective: 'Read financial-report.txt from /home/admin/database/reports/',
            hints: [
              'Navigate to the reports directory under database',
              'Use "cd database/reports" then "cat financial-report.txt"',
              'Or use "cat /home/admin/database/reports/financial-report.txt"',
        ],
        solution: 'cat',
        reward: 50,
      },
      {
        id: 'task-8',
        description: 'Delete access logs with Log Shredder',
        type: 'command',
        objective: 'Use Log Shredder to delete /home/logs/access.log',
        hints: [
          'Use "shred /home/logs/access.log" to delete the log file',
          'This covers your tracks after the extraction',
          'Make sure you purchased Log Shredder first',
        ],
        solution: 'shred',
        reward: 60,
      },
      {
        id: 'task-9',
        description: 'Disconnect from server-02',
        type: 'command',
        objective: 'Disconnect from server-02 after completing the mission',
        hints: [
          'Use "disconnect" to disconnect from the server',
          'Always disconnect after completing objectives',
        ],
        solution: 'disconnect',
        reward: 25,
      },
    ],
    prerequisites: ['n00b-01'],
    unlocks: [],
    reward: 400,
  },

  // Email sent when mission starts
  startEmails: [createDataExtractionEmail()],

  completionEmails: undefined,
  unlockLore: undefined,
  fileSystemAdditions: undefined,
  requiredSoftware: ['vpn-basic', 'password-cracker-basic', 'log-shredder'],
  
  // Expected completion time: 20 minutes
  expectedCompletionTime: 20 * 60,
  
  // Purchase task mapping: which purchases complete which tasks
  purchaseTaskMapping: {
    'log-shredder': 'task-3', // Purchase Log Shredder completes task-3
  },
};

