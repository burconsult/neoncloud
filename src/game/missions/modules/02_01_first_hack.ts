import { MissionModule } from '../MissionModule';
import { createFirstHackEmail } from '../../emails/emailTemplates';

/**
 * First Hack Mission Module
 * Category: Script Kiddie (02)
 * Mission Number: 01
 * Mission ID: n00b-01
 */
export const firstHackMissionModule: MissionModule = {
  missionId: 'n00b-01',
  
  mission: {
    id: 'n00b-01',
    title: 'First Hack: Server-01 Penetration Test',
    description: 'Complete your first contract: Penetration test on server-01. Check your email for mission details and encrypted credentials.',
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
        objective: 'Check your email for the server-01 contract details',
        hints: [
          'Type "mail" to view your inbox',
          'Read the email from contracts@neoncloud-ops.org',
          'The email contains mission details and an encrypted credentials file',
        ],
        solution: 'mail read',
        reward: 20,
      },
      {
        id: 'task-2',
        description: 'Scan the Megacorp network to discover hosts',
        type: 'command',
        objective: 'Use the Network Scanner to scan the Megacorp network (192.168.1.0/24) and discover active hosts',
        hints: [
          'The email mentions Megacorp network: 192.168.1.0/24',
          'Use "scan 192.168.1.0/24" to scan the network range',
          'This will discover server-01 and other active hosts',
        ],
        solution: 'scan 192.168.1.0/24',
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
        description: 'Decrypt the server-01 credentials file',
        type: 'command',
        objective: 'Crack the encrypted credentials file from the email',
        hints: [
          'The credentials file is in your Documents folder',
          'Use "crack server-01-credentials.enc" to decrypt it',
          'Make sure you purchased the password cracker first',
        ],
        solution: 'crack',
        reward: 30,
      },
      {
        id: 'task-7',
        description: 'Connect to server-01',
        type: 'command',
        objective: 'Connect to server-01 using the extracted credentials',
        hints: [
          'Type "connect server-01" after decrypting the credentials',
          'Credentials are automatically loaded after decryption',
          'You need to be connected to VPN first',
        ],
        solution: 'connect server-01',
        reward: 30,
      },
      {
        id: 'task-8',
        description: 'Read secret.txt on server-01',
        type: 'command',
        objective: 'Read the secret file in /home/data/secret.txt on server-01',
        hints: [
          'Use "cat" to read files',
          'The file is in /home/data/secret.txt',
          'Type "cat /home/data/secret.txt" or "cd /home/data" then "cat secret.txt"',
        ],
        solution: 'cat',
        reward: 50,
      },
      {
        id: 'task-9',
        description: 'Disconnect from server-01',
        type: 'command',
        objective: 'Disconnect from server-01 after completing the mission',
        hints: [
          'Use "disconnect" or "connect disconnect" to disconnect',
          'You should always disconnect after completing your objectives',
        ],
        solution: 'disconnect',
        reward: 20,
      },
    ],
    prerequisites: ['network-03'],
    unlocks: ['n00b-02'],
    reward: 300,
  },

  // Email sent when mission starts (triggered when network-03 completes)
  startEmails: [createFirstHackEmail()],

  completionEmails: undefined,
  unlockLore: undefined,
  fileSystemAdditions: undefined,
  requiredSoftware: ['network-scanner-basic', 'vpn-basic', 'password-cracker-basic'],
};

