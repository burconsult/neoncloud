import { Command, CommandResult } from '@/types';
import { exportGameSave, downloadSaveFile, importGameSave, loadSaveFile } from '../save/saveSystem';
import { useConnectionStore } from '../state/useConnectionStore';

/**
 * Save command - Save game to file
 * Only works when on localhost (not connected to remote servers)
 */
export const saveCommand: Command = {
  name: 'save',
  aliases: ['savegame', 'export'],
  description: 'Save your game progress to a file (only available on localhost)',
  usage: 'save',
  execute: (): CommandResult => {
    // Check if connected to a remote server
    const connectionStore = useConnectionStore.getState();
    const currentServer = connectionStore.getCurrentRemoteServer();
    
    if (currentServer) {
      return {
        output: [
          'Cannot save game while connected to a remote server.',
          '',
          `You are currently connected to ${currentServer}.`,
          'Disconnect first using "disconnect" or "connect disconnect", then save your game.',
          '',
          '💡 Tip: Save/load functionality is only available from your local system.',
        ],
        success: false,
        error: 'Not on localhost',
      };
    }

    try {
      downloadSaveFile();
      return {
        output: [
          'Game saved successfully!',
          '',
          'Your save file has been downloaded to your computer.',
          'You can load it later using the "loadfile" command.',
        ],
        success: true,
      };
    } catch (error) {
      return {
        output: `Failed to save game: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
        error: 'Save failed',
      };
    }
  },
};

/**
 * Load command - Load game from file
 * Only works when on localhost (not connected to remote servers)
 */
export const loadCommand: Command = {
  name: 'load',
  aliases: ['loadgame', 'import'],
  description: 'Load a previously saved game (only available on localhost)',
  usage: 'load',
  execute: (): CommandResult => {
    // Check if connected to a remote server
    const connectionStore = useConnectionStore.getState();
    const currentServer = connectionStore.getCurrentRemoteServer();
    
    if (currentServer) {
      return {
        output: [
          'Cannot load game while connected to a remote server.',
          '',
          `You are currently connected to ${currentServer}.`,
          'Disconnect first using "disconnect" or "connect disconnect", then load your game.',
          '',
          '💡 Tip: Save/load functionality is only available from your local system.',
        ],
        success: false,
        error: 'Not on localhost',
      };
    }

    return {
      output: [
        'To load a saved game:',
        '',
        '1. Use the "loadfile" command to open the file picker',
        '2. Select your save file (.json)',
        '3. Your game progress will be restored',
        '',
        'Alternatively, you can drag and drop a save file into the terminal window.',
      ],
      success: true,
    };
  },
};

/**
 * Load file command - Opens file picker to load save
 * Only works when on localhost (not connected to remote servers)
 * Note: This is handled specially in TerminalWindow to trigger file input
 */
export const loadFileCommand: Command = {
  name: 'loadfile',
  aliases: ['importfile'],
  description: 'Open file picker to load a saved game (only available on localhost)',
  usage: 'loadfile',
  execute: (): CommandResult => {
    // Check if connected to a remote server
    const connectionStore = useConnectionStore.getState();
    const currentServer = connectionStore.getCurrentRemoteServer();
    
    if (currentServer) {
      return {
        output: [
          'Cannot load game while connected to a remote server.',
          '',
          `You are currently connected to ${currentServer}.`,
          'Disconnect first using "disconnect" or "connect disconnect", then load your game.',
          '',
          '💡 Tip: Save/load functionality is only available from your local system.',
        ],
        success: false,
        error: 'Not on localhost',
      };
    }

    return {
      output: [
        'Please select your NeonCloud save file (.json) using the file picker.',
        'The file picker should open automatically.',
      ],
      success: true,
    };
  },
};

