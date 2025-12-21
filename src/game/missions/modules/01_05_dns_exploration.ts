import { MissionModule } from '../MissionModule';

/**
 * DNS Exploration Mission Module
 * Category: Training (01)
 * Mission Number: 05
 * Mission ID: network-03
 */
export const dnsExplorationMissionModule: MissionModule = {
  missionId: 'network-03',
  
  mission: {
    id: 'network-03',
    title: 'DNS and Domain Resolution',
    description: 'Learn how DNS translates domain names to IP addresses.',
    category: 'training',
    learningObjectives: [
      'Understand DNS resolution',
      'Learn about DNS record types',
      'Query DNS records',
      'Understand domain name system',
    ],
    difficulty: 'intermediate',
    tasks: [
      {
        id: 'task-1',
        description: 'Lookup A record for example.com',
        type: 'command',
        objective: 'Query the IPv4 address of example.com',
        hints: [
          'Type "nslookup example.com A" and press Enter',
          'A records contain IPv4 addresses',
        ],
        solution: 'nslookup example.com A',
      },
      {
        id: 'task-2',
        description: 'Lookup MX record for example.com',
        type: 'command',
        objective: 'Find the mail server for example.com',
        hints: [
          'Type "nslookup example.com MX" and press Enter',
          'MX records specify mail exchange servers',
        ],
        solution: 'nslookup example.com MX',
      },
      {
        id: 'task-3',
        description: 'Lookup all records for a domain',
        type: 'command',
        objective: 'See all DNS records for example.com',
        hints: [
          'Type "nslookup example.com" without a type',
          'This shows all available DNS records',
        ],
        solution: 'nslookup example.com',
      },
    ],
    prerequisites: ['network-02'],
    unlocks: ['n00b-01'],
    reward: 200,
  },

  startEmails: undefined,
  completionEmails: undefined,
  unlockLore: undefined,
  fileSystemAdditions: undefined,
  requiredSoftware: [],
  expectedCompletionTime: 15 * 60, // 15 minutes
};

