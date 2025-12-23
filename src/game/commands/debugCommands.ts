/**
 * Debug Commands
 * 
 * Commands for testing and debugging the game.
 * These should only be available in development mode.
 */

import { Command, CommandResult } from '@/types';
import { useMissionStore } from '../state/useMissionStore';
import { getMissionById, getAllMissions } from '../missions/missionLoader';
import { useCurrencyStore } from '../state/useCurrencyStore';
import { useInventoryStore } from '../state/useInventoryStore';
import { missionRegistry } from '../missions/MissionModule';

/**
 * Test mission command - Jump directly to a mission (bypasses prerequisites)
 * Only available in development mode
 * 
 * Usage: testmission <mission-id>
 * Examples:
 *   testmission n00b-02
 *   testmission welcome-00
 */
export const testMissionCommand: Command = {
  name: 'testmission',
  aliases: ['debugmission', 'tm'],
  description: 'Jump directly to a mission for testing (development only)',
  usage: 'testmission <mission-id>',
  requiresUnlock: false,
  execute: async (args: string[]): Promise<CommandResult> => {
    // Only allow in development mode
    if (!import.meta.env?.DEV) {
      return {
        output: 'This command is only available in development mode.',
        success: false,
        error: 'Not available in production',
      };
    }

    if (args.length === 0 || !args[0]) {
      return {
        output: [
          'Usage: testmission <mission-id>',
          '',
          'Jump directly to a mission for testing (bypasses prerequisites).',
          '',
          'Examples:',
          '  testmission welcome-00',
          '  testmission n00b-01',
          '  testmission n00b-02',
          '',
          'Available mission IDs:',
          '  • welcome-00 - Welcome to NeonCloud',
          '  • tutorial-01 - Terminal Navigation Basics',
          '  • network-01 - Network Connectivity Basics',
          '  • network-02 - Understanding Network Paths',
          '  • network-03 - DNS and Domain Resolution',
          '  • n00b-01 - First Hack: Server-01 Penetration Test',
          '  • n00b-02 - Data Extraction: Server-02 Database Access',
        ],
        success: false,
        error: 'Missing mission ID',
      };
    }

    const missionId = args[0];
    const mission = getMissionById(missionId);

    if (!mission) {
      return {
        output: [
          `Mission "${missionId}" not found.`,
          '',
          'Available missions:',
          '  • welcome-00 - Welcome to NeonCloud',
          '  • tutorial-01 - Terminal Navigation Basics',
          '  • network-01 - Network Connectivity Basics',
          '  • network-02 - Understanding Network Paths',
          '  • network-03 - DNS and Domain Resolution',
          '  • n00b-01 - First Hack: Server-01 Penetration Test',
          '  • n00b-02 - Data Extraction: Server-02 Database Access',
          '  • n00b-03 - Network Investigation: Server-01 Analysis',
          '  • h4x0r-01 - Advanced Penetration: Multi-Server Operation',
        ],
        success: false,
        error: 'Mission not found',
      };
    }

    // For realistic testing: Mark ALL prerequisite missions as completed
    // This ensures proper progression stats and unlocks all required tools
    const missionStore = useMissionStore.getState();
    const inventoryStore = useInventoryStore.getState();
    
    // Recursively collect all prerequisite missions
    const allPrerequisites = new Set<string>();
    const missionsToProcess = [missionId];
    const processedMissions = new Set<string>();
    
    while (missionsToProcess.length > 0) {
      const currentId = missionsToProcess.shift()!;
      if (processedMissions.has(currentId)) continue;
      processedMissions.add(currentId);
      
      const currentMission = getMissionById(currentId);
      if (currentMission && currentMission.prerequisites) {
        currentMission.prerequisites.forEach(prereq => {
          allPrerequisites.add(prereq);
          if (!processedMissions.has(prereq)) {
            missionsToProcess.push(prereq);
          }
        });
      }
    }
    
    // Mark all prerequisites as completed and grant all their tools
    const completedMissions = new Set([...missionStore.completedMissions]);
    const ownedSoftware = new Set([...inventoryStore.ownedSoftware]);
    const { getAllSoftwareFromTools } = await import('../tools/toolLoader');
    const allSoftware = getAllSoftwareFromTools();
    
    // Add all prerequisites to completed missions
    allPrerequisites.forEach(prereqId => {
      completedMissions.add(prereqId);
      
      // Grant all tools from this prerequisite mission
      const prereqModule = missionRegistry.get(prereqId);
      if (prereqModule?.requiredSoftware) {
        prereqModule.requiredSoftware.forEach(softwareId => {
          ownedSoftware.add(softwareId);
          
          // Also grant premium versions if basic is required
          const software = allSoftware.find(s => s.id === softwareId);
          if (software) {
            // Check if there's a premium version of this tool
            const toolModule = allSoftware.find(s => 
              s.id !== softwareId && 
              s.name.includes('Premium') && 
              s.name.replace('Premium', '').trim() === software.name.replace('Basic', '').trim()
            );
            if (toolModule) {
              ownedSoftware.add(toolModule.id);
            }
          }
        });
      }
    });
    
    // Mark all tasks in prerequisite missions as completed for realistic stats
    const taskProgress: Record<string, Record<string, boolean>> = { ...missionStore.taskProgress };
    allPrerequisites.forEach(prereqId => {
      const prereqMission = getMissionById(prereqId);
      if (prereqMission) {
        if (!taskProgress[prereqId]) {
          taskProgress[prereqId] = {};
        }
        prereqMission.tasks.forEach(task => {
          taskProgress[prereqId][task.id] = true;
        });
      }
    });
    
    // Update state
    useMissionStore.setState({ 
      completedMissions: Array.from(completedMissions),
      taskProgress,
    });
    useInventoryStore.setState({ 
      ownedSoftware: Array.from(ownedSoftware),
    });
    
    console.log(`[TestMission] Marked ${allPrerequisites.size} prerequisites as completed`);
    console.log(`[TestMission] Granted ${Array.from(ownedSoftware).length} tools for testing`);

    // For testing, allow restarting completed missions by resetting their completion status
    const wasCompleted = missionStore.isMissionCompleted(missionId);
    if (wasCompleted) {
      // Remove from completed missions temporarily to allow restart
      const completedMissions = missionStore.completedMissions.filter(id => id !== missionId);
      useMissionStore.setState({ completedMissions });
    }

    const success = await missionStore.startMission(missionId);

    if (!success) {
      return {
        output: [
          `Failed to start mission "${missionId}".`,
          '',
          'Use "listmissions" to see mission status.',
        ],
        success: false,
        error: 'Failed to start mission',
      };
    }

    // Give the player enough currency for testing based on mission requirements
    const currencyStore = useCurrencyStore.getState();
    const missionModule = missionRegistry.get(missionId);
    
    // Calculate required funds based on mission's required software
    let requiredFunds = 0;
    if (missionModule?.requiredSoftware) {
      // Get software prices from tool loader
      const { getAllSoftwareFromTools } = await import('../tools/toolLoader');
      
      const allSoftware = getAllSoftwareFromTools();
      const requiredSoftware = missionModule.requiredSoftware;
      
      // Check which required software the player doesn't own
      const missingSoftware = requiredSoftware.filter(softwareId => 
        !inventoryStore.ownsSoftware(softwareId)
      );
      
      // Calculate total cost of missing software
      missingSoftware.forEach(softwareId => {
        const software = allSoftware.find(s => s.id === softwareId);
        if (software) {
          requiredFunds += software.price || 0;
        }
      });
    }
    
    // Give enough funds: required funds + 500 buffer for other expenses
    // Minimum 2000 NC for advanced missions (h4x0r, l33t), 1000 NC for basic missions
    const minFunds = missionId.startsWith('h4x0r') || missionId.startsWith('l33t') ? 2000 : 1000;
    const targetFunds = Math.max(requiredFunds + 500, minFunds);
    
    if (currencyStore.balance < targetFunds) {
      const amountToAdd = targetFunds - currencyStore.balance;
      currencyStore.earn(amountToAdd, `Debug: Test funds for ${missionId}`, 'bonus');
      console.log(`[TestMission] Granted ${amountToAdd} NC (total: ${targetFunds} NC) for testing ${missionId}`);
    }

    return {
      output: [
        `✓ Jumped to mission: ${mission.title}`,
        '',
        `Mission ID: ${mission.id}`,
        `Category: ${mission.category}`,
        `Difficulty: ${mission.difficulty}`,
        '',
        '💡 Tip: This command bypasses prerequisites and gives you test funds/tools.',
        'Use this for testing individual missions.',
      ],
      success: true,
    };
  },
};

/**
 * List all available missions
 * Useful for testing and debugging
 */
export const listMissionsCommand: Command = {
  name: 'listmissions',
  aliases: ['lm', 'missions'],
  description: 'List all available missions',
  usage: 'listmissions',
  requiresUnlock: false,
  execute: (): CommandResult => {
    // Only allow in development mode
    if (!import.meta.env?.DEV) {
      return {
        output: 'This command is only available in development mode.',
        success: false,
        error: 'Not available in production',
      };
    }

    const allMissions = getAllMissions();

    const missionList = allMissions.map((mission) => {
      const status = useMissionStore.getState().isMissionCompleted(mission.id) ? '[✓]' : '[ ]';
      return `  ${status} ${mission.id.padEnd(15)} - ${mission.title}`;
    }).join('\n');

    return {
      output: [
        'Available Missions:',
        '',
        missionList,
        '',
        'Use "testmission <mission-id>" to jump directly to a mission.',
      ],
      success: true,
    };
  },
};

/**
 * Mine command - Generate NeonCoins for testing
 * Hidden debug command - not shown in help, only works in development mode
 * 
 * Usage: mine <amount>
 * Examples:
 *   mine 1000
 *   mine 5000
 */
export const mineCommand: Command = {
  name: 'mine',
  aliases: ['generate', 'coins'],
  description: 'Generate NeonCoins (development/testing only)',
  usage: 'mine <amount>',
  requiresUnlock: false,
  execute: (args: string[]): CommandResult => {
    // Only allow in development mode
    if (!import.meta.env?.DEV) {
      return {
        output: 'This command is only available in development mode.',
        success: false,
        error: 'Not available in production',
      };
    }

    if (args.length === 0 || !args[0]) {
      return {
        output: [
          'Usage: mine <amount>',
          '',
          'Generate NeonCoins for testing purposes.',
          '',
          'Examples:',
          '  mine 1000   # Generate 1000 NeonCoins',
          '  mine 5000   # Generate 5000 NeonCoins',
        ],
        success: false,
        error: 'Missing amount argument',
      };
    }

    const amount = parseInt(args[0], 10);
    
    if (isNaN(amount) || amount <= 0) {
      return {
        output: `Invalid amount: ${args[0]}. Please provide a positive number.`,
        success: false,
        error: 'Invalid amount',
      };
    }

    if (amount > 100000) {
      return {
        output: 'Maximum amount is 100,000 NeonCoins per mine command.',
        success: false,
        error: 'Amount too large',
      };
    }

        const currencyStore = useCurrencyStore.getState();
        currencyStore.earn(
          amount,
          `Mined ${amount} NeonCoins (debug command)`,
          'bonus'
        );

        // Get balance after earning
        const newBalance = useCurrencyStore.getState().balance;

        return {
          output: [
            `✅ Mined ${amount.toLocaleString()} NeonCoins!`,
            '',
            `New balance: ${newBalance.toLocaleString()} NC`,
          ],
          success: true,
        };
  },
};

