import { Command, CommandResult, GameContext } from '@/types';
import { 
  navigateToPath, 
  getDirectoryContents, 
  readFile, 
  resolveFilePath 
} from '../filesystem/fileSystem';
import { generateEncryptedGibberish } from '@/utils/fileEncryption';
import { useFileSystemStore } from '../state/useFileSystemStore';
import { useAuthStore } from '../state/useAuthStore';
import { useChallengeStore } from '../state/useChallengeStore';
import { loginCommand, logoutCommand } from './loginCommand';
import { challengeCommand, solveCommand, hintCommand, suCommand, exitCommand } from './rootCommands';
import { pingCommand } from './pingCommand';
import { tracerouteCommand } from './tracerouteCommand';
import { nslookupCommand } from './nslookupCommand';
import { storeCommand } from './storeCommand';
import { connectCommand } from './toolCommands'; // Keep connectCommand here (not a tool, it's a connection command)
import { disconnectCommand } from './disconnectCommand';
import { saveCommand, loadCommand, loadFileCommand } from './saveCommand';
import { mailCommand } from './mailCommand';
import { loreCommand } from './loreCommand';
import { testMissionCommand, listMissionsCommand, mineCommand } from './debugCommands';
import { toolRegistry } from '../tools/ToolModule';
import { loadToolModules } from '../tools/toolLoader';
import { emitFileRead } from '../events/eventBus';

// Simple echo command
const echoCommand: Command = {
  name: 'echo',
  description: 'Display a line of text',
  usage: 'echo [text]',
  execute: (args: string[]): CommandResult => {
    const text = args.join(' ');
    return {
      output: text || '',
      success: true,
    };
  },
};

// Help command
const helpCommand: Command = {
  name: 'help',
  aliases: ['?'],
  description: 'Display available commands',
  usage: 'help [command]',
  execute: (args: string[], context?: GameContext): CommandResult => {
    const registry = context?.commandRegistry;
    if (!registry) {
      return {
        output: 'Command registry not available.',
        success: false,
        error: 'Registry missing',
      };
    }

    if (args.length > 0 && args[0]) {
      const commandName = args[0].toLowerCase();
      const command = registry.get(commandName);
      
      if (command && command.name) {
        return {
          output: [
            `Command: ${command.name}`,
            `Description: ${command.description}`,
            `Usage: ${command.usage}`,
            command.aliases && command.aliases.length > 0 ? `Aliases: ${command.aliases.join(', ')}` : '',
          ].filter(Boolean),
          success: true,
        };
      }
      
      return {
        output: `Command '${commandName}' not found. Type 'help' to see all commands.`,
        success: false,
        error: 'Command not found',
      };
    }

    // Get unique commands (avoid duplicates from aliases)
    // Exclude hidden commands from help (mine command)
    const hiddenCommands = new Set(['mine']);
    const uniqueCommands = new Map<string, Command>();
    registry.forEach((cmd, key) => {
      // Only add if this is the primary command name, not an alias
      // Skip hidden commands (like 'mine')
      if (cmd.name.toLowerCase() === key && !hiddenCommands.has(cmd.name.toLowerCase())) {
        uniqueCommands.set(cmd.name.toLowerCase(), cmd);
      }
    });
    
    const commands = Array.from(uniqueCommands.values());
    const commandList = commands
      .map((cmd) => `  ${cmd.name.padEnd(12)} - ${cmd.description}`)
      .join('\n');

    return {
      output: [
        'Available commands:',
        '',
        commandList,
        '',
        '',
        "Type 'help <command>' for more information about a specific command.",
      ],
      success: true,
    };
  },
};

// Clear command
const clearCommand: Command = {
  name: 'clear',
  aliases: ['cls'],
  description: 'Clear the terminal screen',
  usage: 'clear',
  execute: (): CommandResult => {
    // This will be handled by the terminal component
    return {
      output: '',
      success: true,
    };
  },
};

// Whoami command
const whoamiCommand: Command = {
  name: 'whoami',
  description: 'Display current user information',
  usage: 'whoami',
  execute: (): CommandResult => {
    const authState = useAuthStore.getState();
    const challengeStore = useChallengeStore.getState();
    
    const currentUser = challengeStore.isRoot ? 'root' : authState.username;
    const output = [
      currentUser,
      challengeStore.isRoot ? '(root)' : authState.isAuthenticated ? '(authenticated)' : '(guest)',
    ];
    
    if (authState.isAuthenticated && authState.sessionStartTime && !challengeStore.isRoot) {
      const duration = authState.getSessionDuration();
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      output.push(`Session: ${minutes}m ${seconds}s`);
    }
    
    return {
      output: output.join(' '),
      success: true,
    };
  },
};

// Pwd command
const pwdCommand: Command = {
  name: 'pwd',
  description: 'Print working directory',
  usage: 'pwd',
  execute: (_args: string[]): CommandResult => {
    const fileSystemStore = useFileSystemStore.getState();
    return {
      output: fileSystemStore.getCurrentDirectory(),
      success: true,
    };
  },
};

// Ls command
const lsCommand: Command = {
  name: 'ls',
  description: 'List directory contents',
  usage: 'ls [directory] [-a]',
  execute: (args: string[]): CommandResult => {
    const fileSystemStore = useFileSystemStore.getState();
    const fileSystem = fileSystemStore.getActiveFileSystem(); // Use getActiveFileSystem() to ensure we get the correct file system
    let targetPath = fileSystemStore.currentDirectory;
    let showHidden = false;

    // Parse arguments
    for (const arg of args) {
      if (arg === '-a' || arg === '--all') {
        showHidden = true;
      } else if (!arg.startsWith('-')) {
        // Directory path
        const navResult = navigateToPath(fileSystem, targetPath, arg);
        if (navResult.success && navResult.newPath) {
          targetPath = navResult.newPath;
        } else {
          return {
            output: `ls: cannot access '${arg}': No such file or directory`,
            success: false,
            error: 'Directory not found',
          };
        }
      }
    }

    const { files, directories } = getDirectoryContents(fileSystem, targetPath, showHidden);
    
    // Sort alphabetically
    directories.sort();
    files.sort();

    const output: string[] = [];
    
    if (directories.length > 0) {
      output.push(...directories.map(dir => `${dir}/`));
    }
    if (files.length > 0) {
      output.push(...files);
    }
    
    if (output.length === 0) {
      return {
        output: '',
        success: true,
      };
    }

    return {
      output: output,
      success: true,
    };
  },
};

// Cd command
const cdCommand: Command = {
  name: 'cd',
  description: 'Change directory',
  usage: 'cd [directory]',
  execute: (args: string[]): CommandResult => {
    const fileSystemStore = useFileSystemStore.getState();
    const fileSystem = fileSystemStore.getActiveFileSystem(); // Use getActiveFileSystem() to ensure we get the correct file system
    const currentPath = fileSystemStore.currentDirectory;

    const targetPath = args.length > 0 && args[0] ? args[0] : '/home/neoncloud-user';

    const navResult = navigateToPath(fileSystem, currentPath, targetPath);

    if (navResult.success && navResult.newPath) {
      fileSystemStore.setCurrentDirectory(navResult.newPath);
      return {
        output: '',
        success: true,
      };
    }

    return {
      output: `cd: no such file or directory: ${targetPath}`,
      success: false,
      error: 'Directory not found',
    };
  },
};

// Cat command
const catCommand: Command = {
  name: 'cat',
  aliases: ['nano'],
  description: 'Display file contents',
  usage: 'cat [file]',
  execute: (args: string[]): CommandResult => {
    if (args.length === 0) {
      return {
        output: 'cat: missing file operand',
        success: false,
        error: 'Missing argument',
      };
    }

    const fileSystemStore = useFileSystemStore.getState();
    const fileSystem = fileSystemStore.getActiveFileSystem(); // Use getActiveFileSystem() to ensure we get the correct file system
    const currentPath = fileSystemStore.currentDirectory;

    const filePath = args[0];
    if (!filePath) {
      return {
        output: 'cat: missing file operand',
        success: false,
        error: 'Missing argument',
      };
    }

    const resolveResult = resolveFilePath(fileSystem, currentPath, filePath);

    if (!resolveResult.success || !resolveResult.fullPath || !resolveResult.filename) {
      return {
        output: `cat: ${filePath}: No such file or directory`,
        success: false,
        error: resolveResult.error || 'File not found',
      };
    }

    const readResult = readFile(fileSystem, resolveResult.fullPath, resolveResult.filename);

    if (!readResult.success) {
      return {
        output: `cat: ${filePath}: ${readResult.error || 'Cannot read file'}`,
        success: false,
        error: readResult.error,
      };
    }

    // Emit file read event for mission tracking (only if file read was successful)
    emitFileRead(
      resolveResult.fullPath!,
      resolveResult.filename!,
      fileSystemStore.activeServerId
    );

    // Check if file is encrypted - show gibberish if encrypted
    const fileNode = resolveResult.file;
    if (fileNode && fileNode.type === 'file' && fileNode.isEncrypted) {
      // File is encrypted - show realistic encrypted gibberish
      const gibberish = generateEncryptedGibberish(300);
      return {
        output: [
          gibberish,
          '',
          '⚠️  This file appears to be encrypted.',
          'Use the "crack" command to decrypt it.',
        ],
        success: true,
      };
    }

    return {
      output: readResult.content || '',
      success: true,
    };
  },
};

// Create command registry
export const createCommandRegistry = (): Map<string, Command> => {
  const registry = new Map<string, Command>();
  
  // Ensure tool modules are loaded before creating registry
  // (They should already be loaded in main.tsx, but this ensures they're available)
  loadToolModules();
  
  // Get all commands from tool modules
  const toolCommands = toolRegistry.getAll().map(module => module.command);
  
  const commands = [
    echoCommand,
    helpCommand,
    clearCommand,
    whoamiCommand,
    pwdCommand,
    lsCommand,
    cdCommand,
    catCommand,
    loginCommand,
    logoutCommand,
    challengeCommand,
    solveCommand,
    hintCommand,
    suCommand,
    exitCommand,
    pingCommand,
    tracerouteCommand,
    nslookupCommand,
    storeCommand,
    connectCommand,
    disconnectCommand,
    mailCommand,
    loreCommand,
    saveCommand,
    loadCommand,
    loadFileCommand,
  // Debug commands (only work in development mode)
  testMissionCommand,
  listMissionsCommand,
  mineCommand,
    // Add commands from tool modules (includes network scanner)
    ...toolCommands,
];

  commands.forEach((command) => {
    registry.set(command.name.toLowerCase(), command);
    if (command.aliases) {
      command.aliases.forEach((alias) => {
        registry.set(alias.toLowerCase(), command);
      });
    }
  });

  return registry;
};

