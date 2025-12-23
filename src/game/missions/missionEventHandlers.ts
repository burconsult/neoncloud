/**
 * Mission Event Handlers
 * 
 * Handles mission task completion based on game events.
 * This decouples missions from commands - missions react to events instead.
 * Uses graph queries for context instead of hardcoding mission-specific logic.
 */

import { eventBus, CommandExecutedEvent, FileReadEvent, ServerConnectedEvent, ServerDisconnectedEvent, ToolUsedEvent, EmailReadEvent } from '../events/eventBus';
import { useMissionStore } from '../state/useMissionStore';
import { useFileSystemStore } from '../state/useFileSystemStore';
import { createCommandRegistry } from '../commands/commandRegistry';
import { getMissionTargetHosts, getEmailsByMission } from '../world/graph/WorldGraphQueries';
import { missionRegistry } from './MissionModule';
import { resolveFilePath } from '../filesystem/fileSystem';
import { resolveHostId } from '../world/utils/hostIdUtils';

/**
 * Parse a solution string into command and arguments
 */
function parseSolution(solution: string): { command: string; args: string[] } {
  const parts = solution.toLowerCase().trim().split(/\s+/);
  return {
    command: parts[0] || '',
    args: parts.slice(1),
  };
}

/**
 * Graph-based task validation helper
 * Uses the world graph to validate task completion conditions
 */
function validateTaskCompletion(
  missionId: string,
  taskSolution: string,
  eventContext: {
    serverId?: string | null;
    filePath?: string;
    filename?: string;
    target?: string;
    command?: string;
    args?: string[];
  }
): boolean {
  const missionModule = missionRegistry.get(missionId);
  if (!missionModule) return false;
  
  const parsedSolution = parseSolution(taskSolution.toLowerCase().trim());
  const targetHostIds = getMissionTargetHosts(missionId);
  const fileSystemStore = useFileSystemStore.getState();
  const activeServerId = fileSystemStore.activeServerId;
  
  // Validate server context for commands that require being on a specific host
  const requiresServerContext = ['cat', 'pwd', 'cd', 'ls', 'shred'].includes(parsedSolution.command);
  if (requiresServerContext && targetHostIds.length > 0) {
    if (!activeServerId || !targetHostIds.includes(activeServerId)) {
      return false; // Not on a mission target host
    }
  }
  
  // Validate specific server for connect/disconnect commands
  if (parsedSolution.command === 'connect' || parsedSolution.command === 'ssh') {
    if (parsedSolution.args.length > 0) {
      let targetServer = parsedSolution.args[0];
      if (targetServer.includes('@')) {
        targetServer = targetServer.split('@')[1];
      }
      // Must match exact server from solution
      return eventContext.serverId === targetServer;
    }
    // No specific server in solution - only valid if exactly one target host
    return targetHostIds.length === 1 && eventContext.serverId === targetHostIds[0];
  }
  
  if (parsedSolution.command === 'disconnect') {
    if (parsedSolution.args.length > 0) {
      // Must disconnect from specific server in solution
      return eventContext.serverId === parsedSolution.args[0];
    }
    // No specific server - only valid if exactly one target host
    return targetHostIds.length === 1 && eventContext.serverId === targetHostIds[0];
  }
  
  // Validate file paths using graph and filesystem resolution
  if (parsedSolution.command === 'shred' || parsedSolution.command === 'cat') {
    if (!eventContext.target && !eventContext.filePath) return false;
    
    const fileSystem = fileSystemStore.getActiveFileSystem();
    const currentPath = fileSystemStore.currentDirectory;
    const solutionPath = parsedSolution.args.join(' ').toLowerCase();
    
    // Resolve event target/filePath to full path
    const targetToResolve = eventContext.target || eventContext.filePath || '';
    const resolvedEvent = resolveFilePath(fileSystem, currentPath, targetToResolve);
    
    if (!resolvedEvent.success || !resolvedEvent.fullPath || !resolvedEvent.filename) {
      return false;
    }
    
    const eventFullPath = (resolvedEvent.fullPath + '/' + resolvedEvent.filename).toLowerCase();
    const solutionParts = solutionPath.split('/').filter(Boolean);
    const solutionFilename = solutionParts.pop() || '';
    const solutionDirPath = '/' + solutionParts.join('/');
    
    // Match paths
    return eventFullPath === solutionPath ||
           (resolvedEvent.filename.toLowerCase() === solutionFilename &&
            resolvedEvent.fullPath.toLowerCase() === solutionDirPath) ||
           eventFullPath.endsWith(solutionPath);
  }
  
  return true; // Default: pass validation (specific matching handled elsewhere)
}

/**
 * Check if command arguments match solution arguments
 * Uses flexible matching: solution args must be present in command args
 * Handles cases like CIDR notation (192.168.1.0/24) that might be split or combined
 */
function matchArguments(commandArgs: string[], solutionArgs: string[]): boolean {
  if (solutionArgs.length === 0) {
    return true; // No args required
  }
  
  const commandArgsString = commandArgs.join(' ').toLowerCase();
  const solutionArgsString = solutionArgs.join(' ').toLowerCase();
  
  // Exact match (handles both joined and split args)
  if (commandArgsString === solutionArgsString) {
    return true;
  }
  
  // For multi-part solution args (like "192.168.1.0/24"), check if all parts are present
  // This handles cases where args might be split differently
  const solutionParts = solutionArgsString.split(/[\s\/]+/).filter(Boolean);
  const commandParts = commandArgsString.split(/[\s\/]+/).filter(Boolean);
  
  // All solution parts must be present in command
  return solutionParts.every(part => commandParts.includes(part) || commandArgsString.includes(part));
}

/**
 * Check if a command matches a task solution using graph-driven logic
 */
function matchesCommandSolution(
  command: string,
  solution: string,
  argsString: string,
  args: string[],
  taskId: string,
  missionId: string,
  commandSuccess?: boolean
): boolean {
  const parsedSolution = parseSolution(solution);
  const solutionCommand = parsedSolution.command;
  const solutionArgs = parsedSolution.args;
  
  // Get command registry for alias checking (used throughout this function)
  const registry = createCommandRegistry();
  
  // For crack commands, rely on tool:used event instead of command:executed
  if (solutionCommand === 'crack' && command === 'crack') {
    return false; // Handled by tool:used event
  }
  
  // For ssh/connect commands, rely on server:connected event for accurate server matching
  const commandObj = registry.get(command);
  const solutionCommandObj = registry.get(solutionCommand);
  const sshCommandObj = registry.get('ssh');
  
  if (commandObj && solutionCommandObj && sshCommandObj && 
      commandObj.name === sshCommandObj.name && 
      solutionCommandObj.name === sshCommandObj.name) {
    return false; // Handled by server:connected event for precise server matching
  }
  
  // For logout/disconnect commands, rely on server:disconnected event
  const logoutCommandObj = registry.get('logout');
  if (commandObj && solutionCommandObj && logoutCommandObj && 
      commandObj.name === logoutCommandObj.name && 
      solutionCommandObj.name === logoutCommandObj.name) {
    return false; // Handled by server:disconnected event
  }
  
  // Check if command matches solution command (including aliases)
  // The registry maps aliases to the same command object, so we can compare by name
  // Reuse commandObj and solutionCommandObj already declared above
  
  if (!commandObj || !solutionCommandObj) {
    return false;
  }
  
  // Commands match if they resolve to the same command object (handles aliases automatically)
  // Example: 'ssh' and 'connect' both resolve to connectCommand, so commandObj.name === solutionCommandObj.name
  const commandsMatch = commandObj.name === solutionCommandObj.name;
  
  if (!commandsMatch) {
    return false;
  }
  
  // If commandSuccess is provided, only match on success
  if (commandSuccess !== undefined && !commandSuccess) {
    return false;
  }
  
  // Match arguments
  if (!matchArguments(args, solutionArgs)) {
    return false;
  }
  
  // For commands that require being on a mission target host, check via graph
  const requiresTargetHost = ['cat', 'pwd', 'cd', 'ls', 'shred'].includes(solutionCommand);
  if (requiresTargetHost) {
    const targetHostIds = getMissionTargetHosts(missionId);
    const fileSystemStore = useFileSystemStore.getState();
    const activeServerId = fileSystemStore.activeServerId;
    
    // If mission has target hosts, player must be on one of them
    if (targetHostIds.length > 0 && !targetHostIds.includes(activeServerId || '')) {
      return false;
    }
  }
  
  // Connect/ssh commands are handled by server:connected event (checked above)
  // No need to validate here as they return false above
  
  return true;
}

/**
 * Register event handlers for mission task completion
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

      // Match command to task solution using graph-driven logic
      const solution = task.solution.toLowerCase().trim();
      const command = event.command.toLowerCase();
      const args = event.args || [];
      const argsString = args.join(' ').toLowerCase();

      if (matchesCommandSolution(command, solution, argsString, args, task.id, currentMission.id, event.success)) {
        missionStore.completeTask(currentMission.id, task.id);
      }
    });
  });

  // File read handler (for cat command tasks)
  eventBus.on<FileReadEvent>('file:read', (event) => {
    const missionStore = useMissionStore.getState();
    const currentMission = missionStore.currentMission;
    
    if (!currentMission) return;

    // Check for file reading tasks
    currentMission.tasks.forEach((task) => {
      if (task.type !== 'command' || !task.solution) return;
      if (missionStore.isTaskCompleted(currentMission.id, task.id)) return;

      const solution = task.solution.toLowerCase().trim();
      const parsedSolution = parseSolution(solution);
      
      // Only handle cat commands
      if (parsedSolution.command !== 'cat') return;
      
      // Get target hosts from graph
      const targetHostIds = getMissionTargetHosts(currentMission.id);
      const fileSystemStore = useFileSystemStore.getState();
      const activeServerId = fileSystemStore.activeServerId;
      
      // Must be on a mission target host
      if (targetHostIds.length > 0 && !targetHostIds.includes(activeServerId || '')) {
        return;
      }
      
      // Check if filename or filePath matches solution args
      // Solution can be: "cat README.txt" or "cat /home/admin/database/README.txt"
      // Note: event.filePath is the directory path, event.filename is the filename
      // e.g., solution: "cat /home/admin/database/README.txt" 
      //       event: filePath="/home/admin/database", filename="README.txt"
      const solutionArgs = parsedSolution.args.join(' ').toLowerCase();
      const eventFilename = event.filename?.toLowerCase() || '';
      const eventFilePath = event.filePath?.toLowerCase() || '';
      
      // Extract filename from solution (last part of path)
      const solutionFilename = solutionArgs.split('/').pop() || solutionArgs;
      
      // Extract directory path from solution (everything except filename)
      const solutionPathParts = solutionArgs.split('/').filter(Boolean);
      solutionPathParts.pop(); // Remove filename
      const solutionDirPath = '/' + solutionPathParts.join('/');
      
      // Match if:
      // 1. Filename matches exactly (e.g., solution: "cat README.txt", event: filename="README.txt")
      // 2. Filename matches AND directory path matches (e.g., solution: "cat /home/admin/database/README.txt", 
      //    event: filePath="/home/admin/database", filename="README.txt")
      // 3. Full path constructed from event matches solution (e.g., event: filePath="/home/admin/database", 
      //    filename="README.txt" -> "/home/admin/database/readme.txt" matches solution)
      const filenameMatches = eventFilename === solutionFilename;
      const dirPathMatches = eventFilePath === solutionDirPath;
      const fullPathMatches = eventFilePath && eventFilename && 
                              (eventFilePath + '/' + eventFilename) === solutionArgs;
      
      if (filenameMatches && (solutionArgs === solutionFilename || dirPathMatches || fullPathMatches)) {
        missionStore.completeTask(currentMission.id, task.id);
      }
    });
  });

  // Server connected handler
  eventBus.on<ServerConnectedEvent>('server:connected', (event) => {
    const missionStore = useMissionStore.getState();
    const currentMission = missionStore.currentMission;
    
    if (!currentMission) return;

    // Get target hosts from graph
    const targetHostIds = getMissionTargetHosts(currentMission.id);
    
    // Check for server connection tasks
    currentMission.tasks.forEach((task) => {
      if (task.type !== 'command' || !task.solution) return;
      if (missionStore.isTaskCompleted(currentMission.id, task.id)) return;

      const solution = task.solution.toLowerCase().trim();
      const parsedSolution = parseSolution(solution);
      
      // Check if solution command is ssh/connect (or any alias) using registry
      const registry = createCommandRegistry();
      const solutionCommandObj = registry.get(parsedSolution.command);
      const sshCommandObj = registry.get('ssh');
      
      // Only handle ssh/connect commands (including aliases like 'connect', 'remote', 'rdp' if added)
      if (!solutionCommandObj || !sshCommandObj || solutionCommandObj.name !== sshCommandObj.name) {
        return;
      }
      
      // Check if connected server matches solution args
      // IMPORTANT: Only complete if solution specifies this exact server
      // Use ID resolution to handle both old and new host ID formats
      const resolvedEventServerId = resolveHostId(event.serverId);
      
      const solutionArgs = parsedSolution.args;
      if (solutionArgs.length > 0) {
        // Extract server ID from solution args (handle user@server format)
        let targetServer = solutionArgs[0];
        if (targetServer.includes('@')) {
          targetServer = targetServer.split('@')[1];
        }
        // Resolve solution server ID to handle old/new formats
        const resolvedTargetServer = resolveHostId(targetServer);
        
        // Match ONLY if connected server matches solution server exactly (after resolution)
        // This prevents completing server-01 task when connecting to server-02
        if (resolvedEventServerId === resolvedTargetServer) {
          missionStore.completeTask(currentMission.id, task.id);
        }
      } else {
        // No specific server in solution, any mission target host works
        // But only if there's exactly one target host (to avoid ambiguity)
        // Resolve target host IDs for comparison
        const resolvedTargetHostIds = targetHostIds.map(id => resolveHostId(id));
        if (targetHostIds.length === 1 && resolvedTargetHostIds.includes(resolvedEventServerId)) {
          missionStore.completeTask(currentMission.id, task.id);
        }
      }
    });
  });

  // Server disconnected handler
  eventBus.on<ServerDisconnectedEvent>('server:disconnected', (event) => {
    const missionStore = useMissionStore.getState();
    const currentMission = missionStore.currentMission;
    
    if (!currentMission) return;

    // Get target hosts from graph
    const targetHostIds = getMissionTargetHosts(currentMission.id);
    
    // Check for disconnect tasks
    currentMission.tasks.forEach((task) => {
      if (task.type !== 'command' || !task.solution) return;
      if (missionStore.isTaskCompleted(currentMission.id, task.id)) return;

      const solution = task.solution.toLowerCase().trim();
      const parsedSolution = parseSolution(solution);
      
      // Only handle logout/disconnect commands (not VPN disconnect)
      // Check if solution command is logout using registry
      const registry = createCommandRegistry();
      const solutionCommandObj = registry.get(parsedSolution.command);
      const logoutCommandObj = registry.get('logout');
      
      // Only handle logout/disconnect commands (not VPN disconnect)
      if (!solutionCommandObj || !logoutCommandObj || solutionCommandObj.name !== logoutCommandObj.name) {
        return;
      }
      
      // Check if solution specifies a particular server to disconnect from
      const solutionArgs = parsedSolution.args;
      
      if (solutionArgs.length > 0) {
        // Solution specifies a server (e.g., "logout server-01")
        // Only complete if disconnecting from that specific server
        if (event.serverId === solutionArgs[0]) {
          missionStore.completeTask(currentMission.id, task.id);
        }
      } else {
        // No specific server in solution - need to match based on task order and server context
        // Strategy: Find the first incomplete logout task that comes after a connect task for this server
        // OR if there's only one logout task, complete it when disconnecting from any target host
        // OR if there's only one target host, complete the logout task
        const logoutTasks = currentMission.tasks.filter(t => {
          if (t.type !== 'command' || !t.solution) return false;
          if (missionStore.isTaskCompleted(currentMission.id, t.id)) return false; // Only consider incomplete tasks
          const taskSolution = t.solution.toLowerCase().trim();
          const taskParsed = parseSolution(taskSolution);
          const taskCmdObj = registry.get(taskParsed.command);
          return taskCmdObj && taskCmdObj.name === 'logout';
        });
        
        // If there's only one incomplete logout task, complete it when disconnecting from any target host
        if (logoutTasks.length === 1 && targetHostIds.includes(event.serverId)) {
          // Only one logout task remaining, must be for this server
          if (logoutTasks[0].id === task.id) {
            missionStore.completeTask(currentMission.id, task.id);
          }
        } else if (targetHostIds.length === 1 && targetHostIds.includes(event.serverId)) {
          // Only one target host in mission, so this logout must be for it
          missionStore.completeTask(currentMission.id, task.id);
        } else {
          // Multiple logout tasks - match by finding the one that comes after a connect task for this server
          const taskIndex = currentMission.tasks.findIndex(t => t.id === task.id);
          if (taskIndex === -1) return;
          
          // Look backwards from this logout task to find the most recent connect task
          // If that connect task is for the disconnected server, this logout task matches
          for (let i = taskIndex - 1; i >= 0; i--) {
            const prevTask = currentMission.tasks[i];
            if (prevTask.type !== 'command' || !prevTask.solution) continue;
            
            const prevSolution = prevTask.solution.toLowerCase().trim();
            const prevParsed = parseSolution(prevSolution);
            const prevCmdObj = registry.get(prevParsed.command);
            const sshCmdObj = registry.get('ssh');
            
            // Check if this is a connect/ssh task
            if (prevCmdObj && sshCmdObj && prevCmdObj.name === sshCmdObj.name) {
              // Extract server from connect task solution
              if (prevParsed.args.length > 0) {
                let connectServer = prevParsed.args[0];
                if (connectServer.includes('@')) {
                  connectServer = connectServer.split('@')[1];
                }
                // If the connect task is for the disconnected server, this logout task matches
                if (connectServer === event.serverId) {
                  missionStore.completeTask(currentMission.id, task.id);
                  return;
                }
              }
            }
          }
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
      const parsedSolution = parseSolution(solution);
      
      // Handle crack commands
      // The command is 'crack' but the toolId is 'password-cracker'
      if (parsedSolution.command === 'crack' && event.toolId === 'password-cracker') {
        // If solution has no args, complete task if cracking any credential file
        const solutionArgs = parsedSolution.args.join(' ');
        if (!solutionArgs || solutionArgs.trim() === '') {
          // No specific file in solution - complete if cracking any credential file
          if (event.target && event.target.includes('credentials')) {
            missionStore.completeTask(currentMission.id, task.id);
          }
        } else {
          // Solution specifies a file - check if target matches (handle both old and new ID formats)
          if (event.target) {
            const normalizedTarget = event.target.toLowerCase();
            const normalizedSolution = solutionArgs.toLowerCase();
            
            // Match if target includes solution args (handles partial matches)
            if (normalizedTarget.includes(normalizedSolution) || normalizedSolution.includes(normalizedTarget)) {
              missionStore.completeTask(currentMission.id, task.id);
            }
          }
        }
      }
      
      // Handle VPN connections
      if (parsedSolution.command === 'vpn' && event.toolId === 'vpn') {
        missionStore.completeTask(currentMission.id, task.id);
      }
      
      // Handle scan commands
      if (parsedSolution.command === 'scan' && event.toolId === 'network-scanner') {
        // Check if target IP range matches solution args
        const solutionArgs = parsedSolution.args.join(' ').toLowerCase();
        if (event.target && solutionArgs) {
          // Match CIDR notation (e.g., "192.168.1.0/24")
          // Also handle variations like "192.168.1.0/24" vs "192.168.1.0/24"
          const normalizedTarget = event.target.toLowerCase().trim();
          const normalizedSolution = solutionArgs.trim();
          
          // Exact match or target contains solution (handles partial matches)
          if (normalizedTarget === normalizedSolution || normalizedTarget.includes(normalizedSolution)) {
            missionStore.completeTask(currentMission.id, task.id);
          }
        }
      }
      
      // Handle shred commands
      if (parsedSolution.command === 'shred' && event.toolId === 'log-shredder') {
        // Get target hosts from graph
        const targetHostIds = getMissionTargetHosts(currentMission.id);
        const fileSystemStore = useFileSystemStore.getState();
        const activeServerId = fileSystemStore.activeServerId;
        
        // Must be on a mission target host
        if (targetHostIds.length > 0 && !targetHostIds.includes(activeServerId || '')) {
          return;
        }
        
        // Resolve paths to handle both absolute and relative paths
        // Solution can be: "shred /var/log/auth.log" or "shred auth.log"
        // Event.target is the original argument (could be relative)
        const solutionArgs = parsedSolution.args.join(' ');
        const solutionPath = solutionArgs.toLowerCase();
        
        if (!event.target) return;
        
        // Get current file system and path
        const fileSystem = fileSystemStore.getActiveFileSystem();
        const currentPath = fileSystemStore.currentDirectory;
        
        // Resolve the event target to a full path (handles relative paths)
        const resolvedEvent = resolveFilePath(fileSystem, currentPath, event.target);
        if (!resolvedEvent.success || !resolvedEvent.fullPath || !resolvedEvent.filename) {
          return;
        }
        
        // Construct full path from resolved result
        const eventFullPath = (resolvedEvent.fullPath + '/' + resolvedEvent.filename).toLowerCase();
        
        // Extract filename and directory from solution
        const solutionParts = solutionPath.split('/').filter(Boolean);
        const solutionFilename = solutionParts.pop() || '';
        const solutionDirPath = '/' + solutionParts.join('/');
        
        // Match if:
        // 1. Full paths match exactly
        // 2. Filename matches and directory path matches
        // 3. Event path ends with solution path (handles relative vs absolute)
        const fullPathMatches = eventFullPath === solutionPath;
        const filenameAndDirMatch = resolvedEvent.filename.toLowerCase() === solutionFilename &&
                                     resolvedEvent.fullPath.toLowerCase() === solutionDirPath;
        const pathEndsWithSolution = eventFullPath.endsWith(solutionPath);
        
        if (fullPathMatches || filenameAndDirMatch || pathEndsWithSolution) {
          missionStore.completeTask(currentMission.id, task.id);
        }
      }
    });
  });

  // Email read handler
  eventBus.on<EmailReadEvent>('email:read', (event) => {
    const missionStore = useMissionStore.getState();
    const currentMission = missionStore.currentMission;
    
    if (!currentMission) return;

    // Get emails for this mission from graph
    const missionEmails = getEmailsByMission(currentMission.id);
    
    // Check for email reading tasks
    currentMission.tasks.forEach((task) => {
      if (task.type !== 'command' || !task.solution) return;
      if (missionStore.isTaskCompleted(currentMission.id, task.id)) return;

      const solution = task.solution.toLowerCase().trim();
      
      // Check if solution involves reading email
      if (solution.includes('mail read') || solution.includes('read email')) {
        // Check if the read email belongs to this mission
        const emailMatches = missionEmails.some(email => 
          email.id === event.emailId || event.missionId === currentMission.id
        );
        
        if (emailMatches) {
          missionStore.completeTask(currentMission.id, task.id);
        }
      }
    });
  });
}
