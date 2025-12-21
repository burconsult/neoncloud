import { CommandResult, GameContext } from '@/types';
import { ParsedCommand } from '../parser/commandParser';
import { emitCommandExecuted } from '../events/eventBus';
import { useConnectionStore } from '../state/useConnectionStore';
import { useFileSystemStore } from '../state/useFileSystemStore';
import { useMissionStore } from '../state/useMissionStore';

export async function executeCommand(
  parsed: ParsedCommand,
  context: GameContext
): Promise<CommandResult> {
  const { command, args } = parsed;

  if (!command) {
    return {
      output: '',
      success: true,
    };
  }

  const commandHandler = context.commandRegistry?.get(command);

  if (!commandHandler) {
    return {
      output: `Command not found: ${command}. Type 'help' to see available commands.`,
      success: false,
      error: 'Command not found',
    };
  }

  // Check if command requires unlock
  if (
    commandHandler.requiresUnlock &&
    !context.player.unlockedCommands.includes(commandHandler.name)
  ) {
    return {
      output: `Command '${commandHandler.name}' is locked. Complete missions to unlock it.`,
      success: false,
      error: 'Command locked',
    };
  }

  // Validate arguments if validator exists
  if (commandHandler.validate) {
    const validation = commandHandler.validate(args);
    if (!validation.valid) {
      return {
        output: validation.error || 'Invalid command arguments',
        success: false,
        error: 'Validation failed',
      };
    }
  }

  try {
    // Start mission timer on first command execution
    const missionStore = useMissionStore.getState();
    missionStore.startMissionTimer();
    
    const result = commandHandler.execute(args, context);
    
    // Handle both sync and async results
    const finalResult = result instanceof Promise ? await result : result;
    
    // Emit command executed event (for mission task completion)
    // This decouples commands from missions - missions listen to events
    const connectionStore = useConnectionStore.getState();
    const fileSystemStore = useFileSystemStore.getState();
    
    emitCommandExecuted(
      command,
      args || [],
      finalResult.success,
      {
        hostname: connectionStore.getCurrentRemoteServer() || 'neoncloud',
        vpnConnected: connectionStore.isVPNConnected(),
        currentDirectory: fileSystemStore.getCurrentDirectory(),
        activeServerId: fileSystemStore.activeServerId,
      }
    );
    
    return finalResult;
  } catch (error) {
    // Emit failed command event
    const connectionStore = useConnectionStore.getState();
    const fileSystemStore = useFileSystemStore.getState();
    
    emitCommandExecuted(
      command,
      args || [],
      false,
      {
        hostname: connectionStore.getCurrentRemoteServer() || 'neoncloud',
        vpnConnected: connectionStore.isVPNConnected(),
        currentDirectory: fileSystemStore.getCurrentDirectory(),
        activeServerId: fileSystemStore.activeServerId,
      }
    );
    
    return {
      output: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`,
      success: false,
      error: 'Execution error',
    };
  }
}

