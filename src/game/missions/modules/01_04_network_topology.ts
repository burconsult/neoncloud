import { MissionModule } from '../MissionModule';

/**
 * Network Topology Mission Module
 * Category: Training (01)
 * Mission Number: 04
 * Mission ID: network-02
 */
export const networkTopologyMissionModule: MissionModule = {
  missionId: 'network-02',
  
  mission: {
    id: 'network-02',
    title: 'Understanding Network Paths',
    description: 'Learn how data travels across networks using traceroute.',
    category: 'training',
    learningObjectives: [
      'Understand network routing',
      'Learn about network hops',
      'Understand how traceroute works',
      'Visualize network topology',
    ],
    difficulty: 'intermediate',
    tasks: [
      {
        id: 'task-1',
        description: 'Trace route to localhost',
        type: 'command',
        objective: 'Use traceroute to see the path to localhost',
        hints: [
          'Type "traceroute localhost" and press Enter',
          'Traceroute shows each router (hop) in the path',
        ],
        solution: 'traceroute localhost',
      },
      {
        id: 'task-2',
        description: 'Trace route to a remote server',
        type: 'command',
        objective: 'See the network path to example.com',
        hints: [
          'Type "traceroute example.com" and press Enter',
          'Each hop represents a router your data passes through',
        ],
        solution: 'traceroute example.com',
      },
    ],
    prerequisites: ['network-01'],
    unlocks: ['network-03'],
    reward: 150,
  },

  startEmails: undefined,
  completionEmails: undefined,
  unlockLore: undefined,
  fileSystemAdditions: undefined,
  requiredSoftware: [],
};

