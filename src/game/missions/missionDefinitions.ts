import { Mission, MissionCategory } from '@/types';

/**
 * Welcome Mission - Introduction to NeonCloud
 */
export const welcomeMission: Mission = {
  id: 'welcome-00',
  title: 'Welcome to NeonCloud',
  description: 'Welcome to NeonCloud Special Cyberoperations Group. Learn the basics of the system.',
  category: 'training',
  learningObjectives: [
    'Access your email system',
    'Read welcome email',
    'Understand the NeonCloud organization',
  ],
  difficulty: 'beginner',
  tasks: [
    {
      id: 'welcome-task-1',
      description: 'Access your email',
      type: 'command',
      objective: 'Use the mail command to view your inbox',
      hints: [
        'Type "mail" to view your email inbox',
        'Check for new messages from NeonCloud',
      ],
      solution: 'mail',
    },
    {
      id: 'welcome-task-2',
      description: 'Read the welcome email',
      type: 'command',
      objective: 'Read the welcome email from NC-SCOG',
      hints: [
        'Use "mail read 1" to read the first email',
        'Or use "mail read email-welcome-001"',
      ],
      solution: 'mail read',
    },
  ],
  prerequisites: [],
  unlocks: ['tutorial-01'],
  reward: 25,
};

/**
 * Tutorial Mission - Introduction to Terminal Navigation
 */
export const tutorialMission: Mission = {
  id: 'tutorial-01',
  title: 'Terminal Navigation Basics',
  description: 'Learn the fundamentals of navigating the terminal and file system.',
  category: 'training',
  learningObjectives: [
    'Understand basic terminal commands',
    'Navigate the file system',
    'Read file contents',
    'Understand directory structure',
  ],
  difficulty: 'beginner',
  tasks: [
    {
      id: 'task-1',
      description: 'List files in the current directory',
      type: 'command',
      objective: 'Use the ls command to see what files and directories are available',
      hints: [
        'Type "ls" and press Enter',
        'The ls command lists directory contents',
      ],
      solution: 'ls',
    },
    {
      id: 'task-2',
      description: 'Navigate to the Documents folder',
      type: 'command',
      objective: 'Use cd to change into the Documents directory',
      hints: [
        'Type "cd Documents" and press Enter',
        'Use cd followed by the directory name',
      ],
      solution: 'cd Documents',
    },
    {
      id: 'task-3',
      description: 'Read the README file',
      type: 'command',
      objective: 'Use cat to display the contents of README.txt',
      hints: [
        'Type "cat README.txt" and press Enter',
        'The cat command displays file contents',
      ],
      solution: 'cat README.txt',
    },
  ],
  prerequisites: ['welcome-00'],
  unlocks: ['network-01'],
};

/**
 * Network Connectivity Mission
 */
export const networkConnectivityMission: Mission = {
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
};

/**
 * Network Topology Mission
 */
export const networkTopologyMission: Mission = {
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
};

/**
 * DNS Exploration Mission
 */
export const dnsExplorationMission: Mission = {
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
};

/**
 * Script Kiddie (n00b) Mission - First Real Challenge
 * Requires using purchased tools
 */
export const scriptKiddieMission: Mission = {
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
      description: 'Purchase a Basic VPN',
      type: 'learn',
      objective: 'Buy a Basic VPN from the store',
      hints: [
        'Type "store" to open the software store',
        'Purchase "Basic VPN" (200 NC)',
        'You need to complete training missions first to earn NeonCoins',
      ],
      solution: 'vpn-basic', // Software ID that completes this task
      reward: 20,
    },
    {
      id: 'task-3',
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
      id: 'task-4',
      description: 'Purchase a Basic Password Cracker',
      type: 'learn',
      objective: 'Buy a Basic Password Cracker from the store',
      hints: [
        'Type "store" to open the software store',
        'Purchase "Basic Password Cracker" (300 NC)',
        'You need enough NeonCoins to purchase it',
      ],
      solution: 'password-cracker-basic', // Software ID that completes this task
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
      id: 'task-6',
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
      id: 'task-7',
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
      id: 'task-8',
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
  unlocks: [],
  reward: 300,
};

/**
 * All available missions
 */
export const missions: Mission[] = [
  welcomeMission,
  tutorialMission,
  networkConnectivityMission,
  networkTopologyMission,
  dnsExplorationMission,
  scriptKiddieMission,
];

/**
 * Get a mission by ID
 * Checks registry first, falls back to static missions array
 */
export function getMissionById(id: string): Mission | undefined {
  // Try registry first (preferred method)
  try {
    // Dynamic import to avoid circular dependency
    // Using require for dynamic loading at runtime
    // @ts-ignore - require is available at runtime
    const { missionRegistry } = require('./MissionModule');
    const module = missionRegistry.get(id);
    if (module) {
      return module.mission;
    }
  } catch (e) {
    // Registry not available, use static list
  }
  // Fallback to static missions array
  return missions.find((mission) => mission.id === id);
}

/**
 * Get all missions
 * Uses registry if available, falls back to static list for backward compatibility
 */
export function getAllMissions(): Mission[] {
  // Try to get from registry first (preferred method)
  try {
    // Dynamic import to avoid circular dependency
    // Using require for dynamic loading at runtime
    // @ts-ignore - require is available at runtime
    const { missionRegistry } = require('./MissionModule');
    const registryMissions = missionRegistry.getAllMissions();
    if (registryMissions.length > 0) {
      // Merge with static missions to ensure backward compatibility
      const missionMap = new Map<string, Mission>();
      // Add registry missions first (they take precedence)
      registryMissions.forEach((m: Mission) => missionMap.set(m.id, m));
      // Add static missions that aren't in registry
      missions.forEach((m: Mission) => {
        if (!missionMap.has(m.id)) {
          missionMap.set(m.id, m);
        }
      });
      return Array.from(missionMap.values());
    }
  } catch (e) {
    // Registry not initialized yet, use static list
  }
  // Fallback to static missions array
  return missions;
}

/**
 * Get missions by difficulty
 */
export function getMissionsByDifficulty(difficulty: Mission['difficulty']): Mission[] {
  return missions.filter((mission) => mission.difficulty === difficulty);
}

/**
 * Get missions by category
 */
export function getMissionsByCategory(category: MissionCategory): Mission[] {
  return missions.filter((mission) => mission.category === category);
}

/**
 * Get all mission categories
 */
export function getMissionCategories(): MissionCategory[] {
  return ['training', 'script-kiddie', 'cyber-warrior', 'digital-ninja'];
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: MissionCategory): string {
  const names: Record<MissionCategory, string> = {
    'training': 'Training',
    'script-kiddie': 'Script Kiddie (n00b)',
    'cyber-warrior': 'Cyber Warrior (h4x0r)',
    'digital-ninja': 'Digital Ninja (l33t)',
  };
  return names[category];
}

