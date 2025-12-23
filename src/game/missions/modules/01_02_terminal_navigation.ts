import { MissionModule } from '../MissionModule';

/**
 * Terminal Navigation Mission Module
 * Category: Training (01)
 * Mission Number: 02
 * Mission ID: tutorial-01
 */
export const terminalNavigationMissionModule: MissionModule = {
  missionId: 'tutorial-01',
  
  mission: {
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
    // unlocks: ['network-01'] - Removed: Dynamic ordering system handles next mission automatically
    reward: 50,
  },

  // No emails for this mission
  startEmails: undefined,
  completionEmails: undefined,

  // No lore entries for this mission
  unlockLore: undefined,

  // No file system additions needed
  fileSystemAdditions: undefined,

  // No required software
  requiredSoftware: [],
  expectedCompletionTime: 10 * 60, // 10 minutes
};

