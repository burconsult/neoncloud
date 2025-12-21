# Mission Creation Guide

This guide explains how to create new missions for NeonCloud using the modular mission system.

## Overview

The modular mission system allows you to create self-contained mission modules that include everything needed for that mission: the mission definition, emails, lore entries, file system changes, and custom initialization logic.

## Mission Module Structure

Each mission module is a TypeScript file that exports a `MissionModule` object. Here's the structure:

```typescript
import { MissionModule } from '../MissionModule';
import { Email } from '@/types/email';
import { LoreEntry } from '@/types/email';

export const myMissionModule: MissionModule = {
  missionId: 'unique-mission-id',
  
  mission: {
    id: 'unique-mission-id',
    title: 'Mission Title',
    description: 'Mission description',
    category: 'training' | 'script-kiddie' | 'cyber-warrior' | 'digital-ninja',
    learningObjectives: ['Objective 1', 'Objective 2'],
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    tasks: [
      {
        id: 'task-1',
        description: 'Task description',
        type: 'command' | 'learn',
        objective: 'What the player needs to do',
        hints: ['Hint 1', 'Hint 2'],
        solution: 'command-to-execute',
        reward: 25, // Optional NeonCoin reward
      },
    ],
    prerequisites: ['mission-id-1', 'mission-id-2'], // Mission IDs that must be completed first
    unlocks: ['next-mission-id'], // Missions unlocked by completing this one
    reward: 100, // Optional NeonCoin reward for completion
  },

  // Optional: Emails sent when mission starts
  startEmails: [
    {
      id: 'email-unique-id',
      from: 'sender@example.com',
      to: 'agent@neoncloud.local',
      subject: 'Email Subject',
      body: 'Email body with **markdown** support',
      timestamp: Date.now(),
      read: false,
      attachments: [
        {
          filename: 'file.enc',
          encrypted: true,
          encryptedContent: 'encrypted gibberish',
          decryptedContent: 'Decrypted content',
          password: 'extracted-password', // Optional: password extracted after cracking
        },
      ],
      missionId: 'unique-mission-id',
    },
  ],

  // Optional: Emails sent when mission completes
  completionEmails: [],

  // Optional: Lore entries unlocked when mission starts
  unlockLore: [
    {
      id: 'lore-entry-id',
      title: 'Lore Entry Title',
      content: 'Lore content with **markdown** support',
      category: 'world' | 'organization' | 'technology' | 'mission' | 'character',
      missionId: 'unique-mission-id',
    },
  ],

  // Optional: File system files/folders to add
  fileSystemAdditions: {
    '/home/neoncloud-user/Documents': {
      type: 'directory',
      name: 'Documents',
      children: {
        'new-file.txt': {
          type: 'file',
          name: 'new-file.txt',
          content: 'File contents',
        },
      },
    },
  },

  // Optional: Required software (informational)
  requiredSoftware: ['vpn-basic', 'password-cracker-basic'],

  // Optional: Custom initialization function
  onStart: async () => {
    // Custom logic when mission starts
  },

  // Optional: Custom completion function
  onComplete: async () => {
    // Custom logic when mission completes
  },
};
```

## Step-by-Step Guide

### 1. Create Mission Module File

Create a new file in `src/game/missions/modules/` with a descriptive name, e.g., `myNewMission.ts`.

### 2. Define Your Mission

Start with the basic mission structure:

```typescript
export const myNewMissionModule: MissionModule = {
  missionId: 'my-new-mission',
  mission: {
    id: 'my-new-mission',
    title: 'My New Mission',
    description: 'What this mission is about',
    category: 'training',
    // ... rest of mission definition
  },
};
```

### 3. Add Tasks

Define tasks that players need to complete:

```typescript
tasks: [
  {
    id: 'task-1',
    description: 'Complete this task',
    type: 'command', // Use 'command' for terminal commands, 'learn' for purchases
    objective: 'Execute a command',
    hints: ['Try using the ls command'],
    solution: 'ls', // The command or action that completes the task
    reward: 25,
  },
],
```

**Task Types:**
- `'command'`: Completed by executing a terminal command (e.g., `ls`, `cd Documents`)
- `'learn'`: Completed by purchasing software (e.g., `vpn-basic`)

### 4. Add Prerequisites and Unlocks

```typescript
prerequisites: ['tutorial-01'], // Must complete tutorial-01 first
unlocks: ['next-mission-id'], // Unlocks next-mission-id when completed
```

### 5. Add Emails (Optional)

Emails are sent automatically when the mission starts or completes:

```typescript
startEmails: [
  {
    id: 'email-id',
    from: 'sender@neoncloud-ops.org',
    to: 'agent@neoncloud.local',
    subject: 'Mission Briefing',
    body: 'Your mission is...',
    // ... email definition
  },
],
```

### 6. Add Lore Entries (Optional)

Lore entries are automatically unlocked when the mission starts:

```typescript
unlockLore: [
  {
    id: 'lore-id',
    title: 'Lore Title',
    content: 'Lore content',
    category: 'world',
  },
],
```

### 7. Register Your Mission

In `src/game/missions/missionLoader.ts`, import and register your mission:

```typescript
import { myNewMissionModule } from './modules/myNewMission';

export function loadMissionModules(): void {
  // ... existing registrations
  missionRegistry.register(myNewMissionModule);
}
```

### 8. Update Mission Definitions Export (Backward Compatibility)

For backward compatibility with existing code, you may need to export the mission in `missionDefinitions.ts`:

```typescript
export const myNewMission = myNewMissionModule.mission;
export const missions: Mission[] = [
  // ... existing missions
  myNewMission,
];
```

## Tips

1. **Mission IDs**: Use kebab-case and be descriptive (e.g., `network-01`, `hack-server-02`)

2. **Categories**: Choose the appropriate category:
   - `'training'`: Basic tutorials and learning missions
   - `'script-kiddie'`: Beginner hacking missions
   - `'cyber-warrior'`: Intermediate hacking missions
   - `'digital-ninja'`: Advanced hacking missions

3. **Email Attachments**: Use encrypted attachments for mission-critical files:
   ```typescript
   attachments: [{
     filename: 'credentials.enc',
     encrypted: true,
     encryptedContent: 'Xk9#mP2$vL8@qR4%tN7&wY3!jU6*eI1^zA5',
     decryptedContent: 'Username: admin\nPassword: secret123',
     password: 'secret123', // Extracted when file is cracked
   }]
   ```

4. **Markdown Support**: Both email bodies and lore entries support markdown:
   - `**bold text**` for bold
   - `- item` for bullet lists
   - `1. item` for numbered lists

5. **Task Solutions**: 
   - For commands, use the exact command (e.g., `'ls'`, `'mail read'`)
   - For purchases, use the software ID (e.g., `'vpn-basic'`)

## Example: Complete Mission Module

See `src/game/missions/modules/welcomeMission.ts` for a complete example.

## Next Steps

Once you've created your mission module, test it thoroughly:
1. Verify the mission appears in the mission panel
2. Check that emails are sent correctly
3. Test task completion logic
4. Verify lore entries are unlocked
5. Test mission progression and unlocking

Happy mission creating! 🚀

