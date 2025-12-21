import { getDirectoryContents } from '@/game/filesystem/fileSystem';
import { FileSystem } from '@/types';

/**
 * Get autocomplete candidates for a given partial input
 */
export function getAutocompleteCandidates(
  fileSystem: FileSystem,
  currentDirectory: string,
  input: string
): { candidates: string[]; isComplete: boolean } {
  // Parse the input to get command and arguments
  const parts = input.trim().split(/\s+/);
  
  if (parts.length === 0) {
    return { candidates: [], isComplete: false };
  }

  const command = parts[0].toLowerCase();
  const lastArg = parts[parts.length - 1] || '';
  
  // Commands that can use file/directory autocomplete
  const fileCommands = ['cd', 'cat', 'ls', 'cat'];
  
  // If the last part looks like it could be a file/directory path
  if (fileCommands.includes(command) || parts.length > 1) {
    // Get the partial path (could be a directory or file)
    const partialPath = lastArg;
    
    // If it's empty, return all files and directories
    if (!partialPath) {
      const { files, directories } = getDirectoryContents(fileSystem, currentDirectory);
      return {
        candidates: [...directories.map(d => d + '/'), ...files],
        isComplete: false,
      };
    }

    // Check if it contains a path separator
    if (partialPath.includes('/')) {
      // Handle path-based completion
      const pathParts = partialPath.split('/');
      const dirPart = pathParts.slice(0, -1).join('/');
      const filePart = pathParts[pathParts.length - 1];
      
      // Resolve directory path
      // For now, handle simple cases (relative paths from current directory)
      const { files, directories } = getDirectoryContents(fileSystem, currentDirectory);
      const allItems = [...directories.map(d => d + '/'), ...files];
      
      // Filter by filePart prefix
      const matches = allItems.filter(item => 
        item.toLowerCase().startsWith(filePart.toLowerCase())
      );
      
      return {
        candidates: matches.map(match => dirPart ? `${dirPart}/${match}` : match),
        isComplete: matches.length === 1,
      };
    } else {
      // Simple filename completion in current directory
      const { files, directories } = getDirectoryContents(fileSystem, currentDirectory);
      const allItems = [...directories.map(d => d + '/'), ...files];
      
      const matches = allItems.filter(item =>
        item.toLowerCase().startsWith(partialPath.toLowerCase())
      );
      
      return {
        candidates: matches,
        isComplete: matches.length === 1,
      };
    }
  }

  // Command completion (if typing a command)
  if (parts.length === 1) {
    const availableCommands = [
      'help', 'echo', 'clear', 'whoami', 'pwd',
      'ls', 'cd', 'cat',
      'login', 'logout',
      'challenge', 'solve', 'hint', 'su', 'exit',
    ];
    
    const matches = availableCommands.filter(cmd =>
      cmd.toLowerCase().startsWith(input.toLowerCase())
    );
    
    return {
      candidates: matches,
      isComplete: matches.length === 1,
    };
  }

  return { candidates: [], isComplete: false };
}

/**
 * Complete the input with the best match
 */
export function completeInput(
  input: string,
  candidates: string[]
): string {
  if (candidates.length === 0) {
    return input;
  }

  if (candidates.length === 1) {
    // Single match - complete it
    const parts = input.trim().split(/\s+/);
    const lastArg = parts[parts.length - 1] || '';
    
    if (parts.length === 1) {
      // Command completion
      return candidates[0];
    } else {
      // File/directory completion
      const match = candidates[0];
      const beforeLastArg = input.substring(0, input.length - lastArg.length);
      return beforeLastArg + match;
    }
  }

  // Multiple matches - find common prefix
  const parts = input.trim().split(/\s+/);
  const lastArg = parts[parts.length - 1] || '';
  
  if (parts.length === 1) {
    // Command completion - find common prefix
    const commonPrefix = findCommonPrefix(candidates);
    if (commonPrefix.length > lastArg.length) {
      return commonPrefix;
    }
  } else {
    // File completion - find common prefix
    const commonPrefix = findCommonPrefix(candidates);
    if (commonPrefix.length > lastArg.length) {
      const beforeLastArg = input.substring(0, input.length - lastArg.length);
      return beforeLastArg + commonPrefix;
    }
  }

  return input;
}

/**
 * Find the common prefix of an array of strings
 */
function findCommonPrefix(strings: string[]): string {
  if (strings.length === 0) return '';
  if (strings.length === 1) return strings[0];

  let prefix = strings[0];
  
  for (let i = 1; i < strings.length; i++) {
    const str = strings[i];
    let j = 0;
    
    while (j < prefix.length && j < str.length && prefix[j] === str[j]) {
      j++;
    }
    
    prefix = prefix.substring(0, j);
    
    if (prefix === '') break;
  }
  
  return prefix;
}

