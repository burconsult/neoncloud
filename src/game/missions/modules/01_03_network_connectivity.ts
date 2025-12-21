import { MissionModule } from '../MissionModule';

/**
 * Network Connectivity Mission Module
 * Category: Training (01)
 * Mission Number: 03
 * Mission ID: network-01
 */
export const networkConnectivityMissionModule: MissionModule = {
  missionId: 'network-01',
  
  mission: {
    id: 'network-01',
    title: 'Network Connectivity Basics',
    description: 'Learn to test network connectivity using ping.',
    category: 'training',
    learningObjectives: [
      'Understand what ping does',
      'Learn about ICMP protocol',
      'Understand network latency',
      'Test connectivity to different hosts',
    ],
    difficulty: 'beginner',
    tasks: [
      {
        id: 'task-1',
        description: 'Ping localhost to test local connectivity',
        type: 'command',
        objective: 'Use ping to test connectivity to localhost',
        hints: [
          'Type "ping localhost" and press Enter',
          'Localhost is your own computer (127.0.0.1)',
        ],
        solution: 'ping localhost',
      },
      {
        id: 'task-2',
        description: 'Ping a DNS server (8.8.8.8)',
        type: 'command',
        objective: 'Test connectivity to Google DNS server',
        hints: [
          'Type "ping 8.8.8.8" and press Enter',
          '8.8.8.8 is Google\'s public DNS server',
        ],
        solution: 'ping 8.8.8.8',
      },
      {
        id: 'task-3',
        description: 'Ping a domain name (example.com)',
        type: 'command',
        objective: 'Test connectivity using a domain name',
        hints: [
          'Type "ping example.com" and press Enter',
          'DNS will resolve the domain name to an IP address',
        ],
        solution: 'ping example.com',
      },
    ],
    prerequisites: ['tutorial-01'],
    unlocks: ['network-02'],
    reward: 100,
  },

  startEmails: undefined,
  completionEmails: undefined,
  unlockLore: undefined,
  fileSystemAdditions: undefined,
  requiredSoftware: [],
  expectedCompletionTime: 10 * 60, // 10 minutes
};

