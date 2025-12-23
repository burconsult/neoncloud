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

    // Start the mission (bypasses prerequisite checks since we're using startMission directly)
    // But first, mark prerequisite missions as completed so mission doesn't think it's locked
    const missionStore = useMissionStore.getState();
    
    // Temporarily mark prerequisites as completed (for testing only)
    // Also grant tools from prerequisite missions
    const inventoryStore = useInventoryStore.getState();
    if (mission.prerequisites && mission.prerequisites.length > 0) {
      const completedMissions = [...missionStore.completedMissions];
      mission.prerequisites.forEach(prereq => {
        if (!completedMissions.includes(prereq)) {
          completedMissions.push(prereq);
        }
        
        // Grant tools from prerequisite missions
        const prereqModule = missionRegistry.get(prereq);
        if (prereqModule && prereqModule.requiredSoftware) {
          prereqModule.requiredSoftware.forEach(softwareId => {
            if (!inventoryStore.ownsSoftware(softwareId)) {
              // Add directly to inventory (bypass purchase logic for testing)
              const currentOwned = inventoryStore.ownedSoftware;
              if (!currentOwned.includes(softwareId)) {
                useInventoryStore.setState({
                  ownedSoftware: [...currentOwned, softwareId]
                });
                console.log(`[TestMission] Granted tool ${softwareId} from prerequisite mission ${prereq}`);
              }
            }
          });
        }
      });
      // Use the set function from zustand
      useMissionStore.setState({ completedMissions });
    }

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

