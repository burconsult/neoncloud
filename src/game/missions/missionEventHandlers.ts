/**
 * Mission Event Handlers
 * 
 * Handles mission task completion based on game events.
 * This decouples missions from commands - missions react to events instead.
 */

import { eventBus, CommandExecutedEvent, FileReadEvent, ServerConnectedEvent, ServerDisconnectedEvent, ToolUsedEvent, EmailReadEvent } from '../events/eventBus';
import { useMissionStore } from '../state/useMissionStore';
import { useFileSystemStore } from '../state/useFileSystemStore';
import { createCommandRegistry } from '../commands/commandRegistry';

/**
 * Task matcher interface
 * Defines how to match events to mission tasks
 */
export interface TaskMatcher {
  missionId: string;
  taskId: string;
  match: (event: any) => boolean;
}

/**
 * Register event handlers for mission task completion
 * This replaces the inline task completion checks in commands
 */
export function registerMissionEventHandlers(): void {
  // Command executed handler
  eventBus.on<CommandExecutedEvent>('command:executed', (event) => {
    const missionStore = useMissionStore.getState();
    const currentMission = missionStore.currentMission;
    
    if (!currentMission) return;

    // Check each task in current mission
    currentMission.tasks.forEach((task) => {
      if (task.type !== 'command' || !task.solution) return;
      
      // Skip if already completed
      if (missionStore.isTaskCompleted(currentMission.id, task.id)) return;

      // Match command to task solution
      const solution = task.solution.toLowerCase().trim();
      const command = event.command.toLowerCase();
      const args = event.args || [];
      const argsString = args.join(' ').toLowerCase();

      // Check if command matches solution
      // For crack commands, only complete if the command succeeded (tool:used event handles actual success)
      // For other commands, only complete if the command succeeded
      if (matchesCommandSolution(command, solution, argsString, task.id, currentMission.id, event.success)) {
        missionStore.completeTask(currentMission.id, task.id);
      }
    });
  });

  // File read handler
  // Note: This handler currently doesn't run because cat command doesn't emit file:read events
  // File reading tasks are handled via command:executed events instead
  // However, we keep this for future use if we add file:read event emission
  eventBus.on<FileReadEvent>('file:read', (event) => {
    const missionStore = useMissionStore.getState();
    const currentMission = missionStore.currentMission;
    
    if (!currentMission) return;

    // Check for file-reading tasks - use exact filename matching to avoid false positives
    currentMission.tasks.forEach((task) => {
      if (task.type !== 'command' || !task.solution) return;
      if (missionStore.isTaskCompleted(currentMission.id, task.id)) return;

      const solution = task.solution.toLowerCase().trim();
      
      // Only check tasks that are specifically about reading files
      if (solution.includes('cat') || solution.includes('read')) {
        const fileSystemStore = useFileSystemStore.getState();
        const activeServerId = fileSystemStore.activeServerId;
        
        // For n00b-01 task-8: reading secret.txt on server-01
        // Must be exactly 'secret.txt' (not a substring match like 'credentials.enc' containing something)
        if (currentMission.id === 'n00b-01' && task.id === 'task-8') {
          // Check exact filename match and server
          if (activeServerId === 'server-01' && event.filename === 'secret.txt') {
            // Verify the path contains /home/admin/data or /data to ensure it's the correct file location
            if (event.filePath.includes('/home/admin/data') || event.filePath.includes('/data')) {
              missionStore.completeTask(currentMission.id, task.id);
            }
          }
        }
        // For n00b-02 task-6: reading customer-data.txt on server-02
        if (currentMission.id === 'n00b-02' && task.id === 'task-6') {
          if (activeServerId === 'server-02' && event.filename === 'customer-data.txt') {
            // Verify path contains /home/admin/database/customers or /database/customers
            if (event.filePath.includes('/home/admin/database/customers') || event.filePath.includes('/database/customers')) {
              missionStore.completeTask(currentMission.id, task.id);
            }
          }
        }
        // For n00b-02 task-7: reading financial-report.txt on server-02
        if (currentMission.id === 'n00b-02' && task.id === 'task-7') {
          if (activeServerId === 'server-02' && event.filename === 'financial-report.txt') {
            // Verify path contains /home/admin/database/reports or /database/reports
            if (event.filePath.includes('/home/admin/database/reports') || event.filePath.includes('/database/reports')) {
              missionStore.completeTask(currentMission.id, task.id);
            }
          }
        }
      }
    });
  });

  // Server connected handler
  eventBus.on<ServerConnectedEvent>('server:connected', (event) => {
    const missionStore = useMissionStore.getState();
    const currentMission = missionStore.currentMission;
    
    if (!currentMission) return;

    // Check for server connection tasks
    currentMission.tasks.forEach((task) => {
      if (task.type !== 'command' || !task.solution) return;
      if (missionStore.isTaskCompleted(currentMission.id, task.id)) return;

      // Check if this task is about connecting to a specific server
      // Use exact matching to prevent 'disconnect' from matching (which contains 'connect' as substring)
      const solution = task.solution.toLowerCase().trim();
      
      // Only match connect/ssh solutions, not disconnect
      const isConnectOrSSHSolution = (
        solution === 'connect' || 
        solution === 'ssh' ||
        (solution.startsWith('connect ') && !solution.startsWith('disconnect ')) ||
        solution.startsWith('ssh ')
      );
      
      if (isConnectOrSSHSolution) {
        // For n00b-01 task-7: connect to server-01
        if (currentMission.id === 'n00b-01' && task.id === 'task-7') {
          if (event.serverId === 'server-01') {
            missionStore.completeTask(currentMission.id, task.id);
          }
        }
        // For n00b-02 task-5: connect to server-02
        if (currentMission.id === 'n00b-02' && task.id === 'task-5') {
          if (event.serverId === 'server-02') {
            missionStore.completeTask(currentMission.id, task.id);
          }
        }
      }
    });
  });

  // Server disconnected handler
  // This handler is responsible for completing disconnect tasks
  // It fires when a server:disconnected event is emitted, which happens ONLY in disconnectCommand
  // IMPORTANT: This event should NEVER fire when connecting to a server
  eventBus.on<ServerDisconnectedEvent>('server:disconnected', (event) => {
    const missionStore = useMissionStore.getState();
    const currentMission = missionStore.currentMission;
    
    if (!currentMission) return;

    // Check for disconnect tasks - these should be completed based on the server:disconnected event
    // Only complete tasks where the solution is exactly 'disconnect' (not 'connect' or 'ssh')
    currentMission.tasks.forEach((task) => {
      if (task.type !== 'command' || !task.solution) return;
      if (missionStore.isTaskCompleted(currentMission.id, task.id)) return;

      const solution = task.solution.toLowerCase().trim();
      
      // CRITICAL: Only match if solution is exactly 'disconnect'
      // This prevents false positives from 'connect' commands
      if (solution !== 'disconnect') {
        return; // Skip tasks that aren't disconnect tasks
      }
      
      // Match disconnect tasks based on mission and task ID
          // For n00b-01 task-9: disconnect from server-01
          if (currentMission.id === 'n00b-01' && task.id === 'task-9') {
        if (event.serverId === 'server-01') {
          missionStore.completeTask(currentMission.id, task.id);
        }
      }
      // For n00b-02 task-9: disconnect from server-02
      if (currentMission.id === 'n00b-02' && task.id === 'task-9') {
        if (event.serverId === 'server-02') {
          missionStore.completeTask(currentMission.id, task.id);
        }
      }
    });
  });

  // Tool used handler
  eventBus.on<ToolUsedEvent>('tool:used', (event) => {
    const missionStore = useMissionStore.getState();
    const currentMission = missionStore.currentMission;
    
    if (!currentMission) return;

    // Check for tool usage tasks
    currentMission.tasks.forEach((task) => {
      if (task.type !== 'command' || !task.solution) return;
      if (missionStore.isTaskCompleted(currentMission.id, task.id)) return;

      const solution = task.solution.toLowerCase().trim();
      
      // Check if task is about using a specific tool
      if (solution.includes('crack')) {
        // For n00b-01 task-5: crack encrypted file
        if (currentMission.id === 'n00b-01' && task.id === 'task-5') {
          if (event.toolId === 'crack' && event.target?.includes('credentials.enc')) {
            missionStore.completeTask(currentMission.id, task.id);
          }
        }
        // For n00b-02 task-4: decrypt server-02 credentials file
        if (currentMission.id === 'n00b-02' && task.id === 'task-4') {
          if (event.toolId === 'crack' && event.target?.includes('server-02-credentials.enc')) {
            missionStore.completeTask(currentMission.id, task.id);
          }
        }
      }
      
      if (solution.includes('vpn')) {
        // For n00b-01 task-3: connect to VPN
        if (currentMission.id === 'n00b-01' && task.id === 'task-3') {
          if (event.toolId === 'vpn') {
            missionStore.completeTask(currentMission.id, task.id);
          }
        }
        // For n00b-02 task-2: connect to VPN
        if (currentMission.id === 'n00b-02' && task.id === 'task-2') {
          if (event.toolId === 'vpn') {
            missionStore.completeTask(currentMission.id, task.id);
          }
        }
      }
      
      if (solution.includes('shred')) {
        // For n00b-02 task-8: shred access logs
        if (currentMission.id === 'n00b-02' && task.id === 'task-8') {
          if (event.toolId === 'log-shredder' && event.target?.includes('access.log')) {
            missionStore.completeTask(currentMission.id, task.id);
          }
        }
      }
    });
  });

  // Email read handler
  eventBus.on<EmailReadEvent>('email:read', (event) => {
    const missionStore = useMissionStore.getState();
    const currentMission = missionStore.currentMission;
    
    if (!currentMission) return;

    // Check for email reading tasks
    currentMission.tasks.forEach((task) => {
      if (task.type !== 'command' || !task.solution) return;
      if (missionStore.isTaskCompleted(currentMission.id, task.id)) return;

      const solution = task.solution.toLowerCase().trim();
      
      if (solution.includes('mail read') || solution.includes('read email')) {
        // For welcome-00 task-2: read welcome email (email-welcome-001)
        if (currentMission.id === 'welcome-00' && task.id === 'welcome-task-2') {
          if (event.emailId === 'email-welcome-001' || event.missionId === 'welcome-00') {
            missionStore.completeTask(currentMission.id, task.id);
          }
        }
        // For n00b-01 task-1: read contract email (email-first-hack-001)
        if (currentMission.id === 'n00b-01' && task.id === 'task-1') {
          if (event.emailId === 'email-first-hack-001' || event.missionId === 'n00b-01') {
            missionStore.completeTask(currentMission.id, task.id);
          }
        }
        // For n00b-02 task-1: read contract email (email-data-extraction-001)
        if (currentMission.id === 'n00b-02' && task.id === 'task-1') {
          if (event.emailId === 'email-data-extraction-001' || event.missionId === 'n00b-02') {
            missionStore.completeTask(currentMission.id, task.id);
          }
        }
      }
    });
  });
}

/**
 * Check if a command matches a task solution
 * Handles aliases, arguments, and special cases
 */
function matchesCommandSolution(
  command: string,
  solution: string,
  argsString: string,
  taskId: string,
  missionId: string,
  commandSuccess?: boolean
): boolean {
  // For crack commands, rely on tool:used event instead of command:executed
  // Don't match crack commands in command:executed handler - they should only complete via tool:used
  if (solution === 'crack' && command === 'crack') {
    // Crack tasks are handled by tool:used event handler, not command:executed
    // This prevents false positives when crack command fails (e.g., tool not owned)
    return false;
  }
  // Get command registry to check aliases
  const registry = createCommandRegistry();
  
  // Special case: "cat" command - check if reading specific files
  // MUST be checked BEFORE generic command matching to prevent false positives
  // These tasks require reading specific files on specific servers
  if (solution === 'cat' && command === 'cat') {
      // For n00b-01 task-8: must read secret.txt on server-01
    if (missionId === 'n00b-01' && taskId === 'task-7') {
      // Check that user is on server-01 and reading secret.txt
      const fileSystemStore = useFileSystemStore.getState();
      const activeServerId = fileSystemStore.activeServerId;
      // Must be on server-01 AND reading secret.txt (exact filename match, not substring)
      if (activeServerId !== 'server-01') {
        return false; // Not on the correct server
      }
      // Check if the filename contains secret.txt (but not as part of another filename like credentials.enc)
      // Allow paths like "/home/data/secret.txt" or "secret.txt" or "data/secret.txt"
      const normalizedArgs = argsString.trim();
      return normalizedArgs.includes('secret.txt') && !normalizedArgs.includes('credentials');
    }
    // For n00b-02 task-6: must read customer-data.txt on server-02
    if (missionId === 'n00b-02' && taskId === 'task-6') {
      const fileSystemStore = useFileSystemStore.getState();
      const activeServerId = fileSystemStore.activeServerId;
      if (activeServerId !== 'server-02') {
        return false;
      }
      return argsString.includes('customer-data.txt');
    }
    // For n00b-02 task-7: must read financial-report.txt on server-02
    if (missionId === 'n00b-02' && taskId === 'task-7') {
      const fileSystemStore = useFileSystemStore.getState();
      const activeServerId = fileSystemStore.activeServerId;
      if (activeServerId !== 'server-02') {
        return false;
      }
      return argsString.includes('financial-report.txt');
    }
    // For other cat tasks with generic 'cat' solution, don't auto-match
    // They need to be handled explicitly above
    return false;
  }
  
  // Check if command matches solution directly
  // But only if the command succeeded (if success status is provided)
  if (command === solution) {
    // If commandSuccess is explicitly provided, only match on success
    if (commandSuccess !== undefined && !commandSuccess) {
      return false;
    }
    return true;
  }

  // Check if command is an alias of solution
  const solutionCommand = registry.get(solution);
  if (solutionCommand) {
    const aliases = solutionCommand.aliases || [];
    if (aliases.includes(command) || solutionCommand.name === command) {
      // If commandSuccess is explicitly provided, only match on success
      if (commandSuccess !== undefined && !commandSuccess) {
        return false;
      }
      // If solution has arguments, check them
      if (solution.includes(' ')) {
        const solutionArgs = solution.split(' ').slice(1).join(' ').toLowerCase();
        return argsString.includes(solutionArgs) || solutionArgs.includes(argsString);
      }
      return true;
    }
  }

  // Check if solution is a prefix of command (e.g., "mail read" matches "mail")
  if (solution.includes(' ')) {
    const solutionParts = solution.split(' ');
    const solutionBase = solutionParts[0];
    const solutionArgs = solutionParts.slice(1).join(' ').toLowerCase();
    const fullSolutionCommand = `${solutionBase} ${solutionArgs}`.toLowerCase();
    const fullCommandString = `${command} ${argsString}`.trim();
    
    // Check if command matches base
    const baseCommand = solutionBase ? registry.get(solutionBase) : null;
    if (baseCommand && (baseCommand.name === command || baseCommand.aliases?.includes(command))) {
      // For nslookup commands, require exact match to prevent partial matches
      // e.g., "nslookup example.com A" should NOT match "nslookup example.com"
      if (command === 'nslookup' && missionId === 'network-03') {
        // For DNS tasks, require exact argument match
        // task-1: "nslookup example.com a" - args must be exactly "example.com a"
        // task-2: "nslookup example.com mx" - args must be exactly "example.com mx"
        // task-3: "nslookup example.com" - args must be exactly "example.com"
        return argsString.trim() === solutionArgs.trim();
      }
      
      // For other commands, use flexible matching (but still check exact match first)
      if (fullCommandString === fullSolutionCommand) {
        return true;
      }
      // Fallback to includes check for commands that might have additional args
      return argsString.includes(solutionArgs) || solutionArgs.includes(argsString);
    }
  }

  // Special case: "mail" command with "read" subcommand
  if (solution === 'mail read' && command === 'mail') {
    return argsString.includes('read');
  }

  // Special case: "disconnect" command - MUST be checked BEFORE connect/ssh to prevent substring matching
  // For disconnect tasks, we ONLY rely on the server:disconnected event handler
  // Never complete disconnect tasks via command:executed events to prevent false positives
  if (solution === 'disconnect') {
    // Disconnect tasks should only complete via server:disconnected event
    // This prevents false positives when running connect/ssh commands
    return false;
  }

  // Special case: "connect" or "ssh" commands
  // Note: Server connection tasks are primarily handled by server:connected event handler
  // Use exact or prefix matching to prevent 'disconnect' from matching (which contains 'connect' as substring)
  // Match solutions like: "connect", "connect server-01", "ssh", "ssh server-01"
  // But NOT: "disconnect" (which contains "connect" but should not match)
  const isConnectOrSSHSolution = (
    solution === 'connect' || 
    solution === 'ssh' ||
    (solution.startsWith('connect ') && !solution.startsWith('disconnect ')) ||
    solution.startsWith('ssh ')
  );
  const isConnectOrSSHCommand = (command === 'connect' || command === 'ssh');
  
  if (isConnectOrSSHSolution && isConnectOrSSHCommand) {
    // Only match if command succeeded
    if (commandSuccess !== undefined && !commandSuccess) {
      return false;
    }
    // Allow connection commands to match (actual server connection is tracked by server:connected event)
    return true;
  }

  return false;
}

