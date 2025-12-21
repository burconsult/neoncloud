/**
 * Log Shredder Tool Module
 * 
 * Self-contained module for Log Shredder tool
 */

import { ToolModule } from '../ToolModule';
import { Command, CommandResult, GameContext } from '@/types';
import { useInventoryStore } from '../../state/useInventoryStore';
import { useFileSystemStore } from '../../state/useFileSystemStore';
import { resolveFilePath, readFile } from '../../filesystem/fileSystem';
import { updateFileContent } from '../../filesystem/fileSystemOperations';
import { emitToolUsed } from '../../events/eventBus';
import { queueToolAction } from '../../time/actionQueue';
import { useTerminalStore } from '../../state/useTerminalStore';
import { useConnectionStore } from '../../state/useConnectionStore';

export const logShredderToolModule: ToolModule = {
  toolId: 'log-shredder',

  software: {
    id: 'log-shredder',
    name: 'Log Shredder',
    description: 'Securely delete log files to cover your tracks. Essential for stealth operations.',
    category: 'utility',
    rarity: 'uncommon',
    price: 450,
    requirements: {
      completedMissions: ['n00b-01'],
    },
    effects: {
      unlockCommands: ['shred', 'clear-logs'],
      enableFeatures: ['log-deletion'],
    },
  },

  duration: {
    basic: 10, // Standard shredding: 10 seconds
  },

  command: {
    name: 'shred',
    aliases: ['clear-logs', 'delete-logs'],
    description: 'Securely delete log files to cover your tracks',
    usage: 'shred <file>',
    requiresUnlock: false, // Tool ownership is checked inside execute function
    execute: async (args: string[], context?: GameContext): Promise<CommandResult> => {
      if (args.length === 0) {
        return {
          output: [
            'Usage: shred <file>',
            '',
            'Examples:',
            '  shred access.log',
            '  shred /var/log/syslog',
            '',
            'You need to own a Log Shredder tool to use this command.',
          ],
          success: false,
          error: 'Missing target',
        };
      }

      const inventoryStore = useInventoryStore.getState();
      if (!inventoryStore.ownsSoftware('log-shredder')) {
        return {
          output: [
            'Log Shredder not available. You need to purchase one first.',
            '',
            'Available tools:',
            '  • Log Shredder (450 NC) - Type "store" to purchase',
          ],
          success: false,
          error: 'Log Shredder not owned',
        };
      }

      const fileSystemStore = useFileSystemStore.getState();
      const fileSystem = fileSystemStore.getActiveFileSystem();
      const currentPath = fileSystemStore.getCurrentDirectory();
      const targetFile = args[0];

      const resolveResult = resolveFilePath(fileSystem, currentPath, targetFile);

      if (!resolveResult.success || !resolveResult.fullPath || !resolveResult.filename) {
        return {
          output: `shred: ${targetFile}: No such file or directory`,
          success: false,
          error: resolveResult.error || 'File not found',
        };
      }

      const fileNode = resolveResult.file;
      if (!fileNode || fileNode.type !== 'file') {
        return {
          output: `shred: ${targetFile}: Not a file`,
          success: false,
          error: 'Not a file',
        };
      }

      const duration = logShredderToolModule.duration.basic;
      const fullPath = resolveResult.fullPath;
      const filename = resolveResult.filename;

      // Queue the shredding action
      queueToolAction(
        'log-shredder',
        `Log Shredder: Shredding ${targetFile}...`,
        duration,
        async () => {
          // Simulate shredding by clearing content and marking as shredded
          const updateResult = updateFileContent(
            fileSystem,
            fullPath,
            filename,
            '[LOGS SHREDDED]'
          );

          if (updateResult.success) {
            // Emit tool used event
            emitToolUsed('log-shredder', targetFile, true);

            // Add completion message to terminal
            const terminalStore = useTerminalStore.getState();
            const connectionContext = {
              hostname: fileSystemStore.activeServerId || 'neoncloud',
              vpnConnected: useConnectionStore.getState().isVPNConnected(),
              vpnType: useConnectionStore.getState().vpnType,
            };

            terminalStore.addLine({
              type: 'output',
              content: [
                `✓ Successfully shredded ${targetFile}. No traces left.`,
                '',
                '💡 Tip: Shredding logs helps maintain anonymity and cover your tracks during operations.',
              ],
              connectionContext,
            });
          } else {
            const terminalStore = useTerminalStore.getState();
            terminalStore.addLine({
              type: 'error',
              content: `shred: Failed to shred ${targetFile}: ${updateResult.error}`,
            });
          }
        }
      );

      // Return immediately (progress bar will show)
      return {
        output: [
          `Shredding ${targetFile}...`,
          '',
          'Overwriting data multiple times...',
          'Verifying deletion...',
        ],
        success: true,
        educationalContent: {
          id: 'log-shredding-explanation',
          title: 'Log Shredding',
          content: `**Log shredding** is the process of securely deleting log files to prevent forensic analysis.

**Why it's used:**
- To remove evidence of unauthorized access.
- To maintain anonymity and operational security.

**Methods:**
- Overwriting file contents multiple times with random data.
- Deleting file metadata.

**Importance:**
- Essential for covering tracks in sensitive operations.`,
          type: 'concept',
          relatedCommands: ['shred'],
          relatedMissions: ['future-stealth-mission'],
          difficulty: 2,
        },
      };
    },
  },
};

