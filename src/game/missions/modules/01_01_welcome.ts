import { MissionModule } from '../MissionModule';
import { createWelcomeEmail } from '../../emails/emailTemplates';
import { loreEntries } from '../../lore/loreEntries';

/**
 * Welcome Mission Module
 * Category: Training (01)
 * Mission Number: 01
 * Mission ID: welcome-00
 * 
 * File naming convention: {category_number}_{mission_number}_{mission_name}.ts
 * This is the first mission in the Training category.
 */
export const welcomeMissionModule: MissionModule = {
  missionId: 'welcome-00',
  
  mission: {
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
  },

  // Email sent when mission starts
  startEmails: [createWelcomeEmail()],

  // Lore entries unlocked when mission starts
  unlockLore: loreEntries['lore-neoncloud-org'] ? [loreEntries['lore-neoncloud-org']] : [],

  // No file system additions needed for this mission
  fileSystemAdditions: undefined,

  // No required software for this mission
  requiredSoftware: [],
};

