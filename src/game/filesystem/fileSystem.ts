import { FileSystem, File, Directory } from '@/types';

/**
 * Create a default file system structure for the game
 */
export function createDefaultFileSystem(): FileSystem {
  return {
    '/home/neoncloud-user': {
      type: 'directory',
      name: 'neoncloud-user',
      children: {
        'Documents': {
          type: 'directory',
          name: 'Documents',
          children: {
            'README.txt': {
              type: 'file',
              name: 'README.txt',
              content: `Welcome to NeonCloud Terminal!

This is your home directory. You can explore the file system using commands:
- ls    : List files and directories
- cd    : Change directory
- cat   : Display file contents
- pwd   : Print working directory

Start your journey by exploring the Documents folder.`,
            },
            'mission-01.txt': {
              type: 'file',
              name: 'mission-01.txt',
              content: `MISSION BRIEFING - Tutorial Mission

OBJECTIVE: Learn basic terminal navigation

TASKS:
1. List files in current directory (ls)
2. Navigate to Documents folder (cd Documents)
3. Read the README file (cat README.txt)

Good luck!`,
            },
          },
        },
        'Downloads': {
          type: 'directory',
          name: 'Downloads',
          children: {
            'network-diagram.txt': {
              type: 'file',
              name: 'network-diagram.txt',
              content: `Network Topology Reference

Basic Network Structure:
- Client -> Router -> Server

This simple structure shows how data travels across networks.
Each component plays a crucial role in data transmission.`,
            },
          },
        },
        '.hidden': {
          type: 'file',
          name: '.hidden',
          content: 'Hidden files start with a dot (.). Use ls -a to see them!',
        },
      },
    },
  };
}

/**
 * Get a directory node from the file system by path
 * Handles:
 * - Local file system: /home/neoncloud-user
 * - Server file systems: /, /home, /home/<username>, /var, /etc, /tmp, etc.
 */
export function getDirectoryByPath(fileSystem: FileSystem, path: string): Directory | null {
  // Normalize path
  const normalizedPath = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
  
  // Check if path exists directly in file system (e.g., /home, /var, /etc, /home/admin)
  if (fileSystem[normalizedPath]) {
    const node = fileSystem[normalizedPath];
    if (node.type === 'directory') {
      return node;
    }
    return null;
  }
  
  // Check for root directory
  if (normalizedPath === '/') {
    const rootNode = fileSystem['/'];
    if (rootNode && rootNode.type === 'directory') {
      return rootNode;
    }
    // Fallback: try to find any root directory
    const keys = Object.keys(fileSystem);
    if (keys.length === 0) return null;
    const firstKey = keys[0];
    if (!firstKey) return null;
    const node = fileSystem[firstKey];
    return node && node.type === 'directory' ? node : null;
  }

  // Split path into parts and filter out empty strings
  const parts = normalizedPath.split('/').filter(Boolean);
  if (parts.length === 0) return null;
  
  // Determine root key based on file system structure
  let rootKey: string;
  if (fileSystem['/home/neoncloud-user']) {
    // Local file system
    rootKey = '/home/neoncloud-user';
  } else if (fileSystem['/']) {
    // Server file system with root
    rootKey = '/';
  } else if (fileSystem['/home']) {
    // Server file system starting from /home
    rootKey = '/home';
  } else {
    // Fallback: find first root directory
    const keys = Object.keys(fileSystem);
    if (keys.length === 0) return null;
    rootKey = keys[0] || '/';
  }
  
  // Start from root directory
  const rootNode = fileSystem[rootKey];
  if (!rootNode || rootNode.type !== 'directory') {
    return null;
  }
  
  let current: Directory = rootNode;

  // Navigate through path parts
  // For local: skip 'home' and 'neoncloud-user' (indices 0 and 1), start at index 2
  // For server: start from index 0 (parts are relative to / or /home)
  const startIndex = rootKey === '/home/neoncloud-user' ? 2 : (rootKey === '/' ? 0 : 1);

  for (let i = startIndex; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    
    // Check if current directory has the child
    if (!current.children || !current.children[part]) {
      // For server file systems with root, also check if it's a top-level directory
      if (rootKey === '/' && i === 0 && fileSystem[`/${part}`]) {
        const node = fileSystem[`/${part}`];
        if (node.type === 'directory') {
          current = node;
          continue;
        }
      }
      return null;
    }
    
    const nextNode = current.children[part];
    if (nextNode.type !== 'directory') {
      return null;
    }
    
    current = nextNode;
  }

  return current;
}

/**
 * Navigate to a path in the file system
 * Handles both local and server file systems with realistic Linux paths
 */
export function navigateToPath(
  fileSystem: FileSystem,
  currentPath: string,
  targetPath: string
): { success: boolean; newPath?: string; error?: string } {
  // Determine root path based on file system type
  let rootPath: string;
  if (fileSystem['/home/neoncloud-user']) {
    rootPath = '/home/neoncloud-user';
  } else if (fileSystem['/']) {
    rootPath = '/';
  } else if (fileSystem['/home']) {
    rootPath = '/home';
  } else {
    // Fallback
    const keys = Object.keys(fileSystem);
    rootPath = keys[0] || '/';
  }
  
  // Handle absolute paths
  if (targetPath.startsWith('/')) {
    const normalizedPath = targetPath.endsWith('/') ? targetPath.slice(0, -1) : targetPath;
    const finalPath = normalizedPath === '/' ? rootPath : normalizedPath;
    
    const dir = getDirectoryByPath(fileSystem, finalPath);
    if (dir) {
      return { success: true, newPath: finalPath };
    }
    return { success: false, error: `Directory not found: ${targetPath}` };
  }

  // Handle relative paths
  const currentParts = currentPath.split('/').filter(Boolean);
  const targetParts = targetPath.split('/').filter(Boolean);

  let newParts = [...currentParts];

  for (const part of targetParts) {
    if (part === '.') {
      continue;
    } else if (part === '..') {
      // For local: keep at least /home/neoncloud-user (2 parts)
      // For server: keep at least /home (1 part)
      const minLength = rootPath === '/home/neoncloud-user' ? 2 : 1;
      if (newParts.length > minLength) {
        newParts.pop();
      }
    } else {
      newParts.push(part);
    }
  }

  const newPath = '/' + newParts.join('/');
  const normalizedPath = newPath === '/' ? rootPath : newPath;

  const dir = getDirectoryByPath(fileSystem, normalizedPath);
  if (dir) {
    return { success: true, newPath: normalizedPath };
  }

  return { success: false, error: `Directory not found: ${targetPath}` };
}

/**
 * Get directory contents
 */
export function getDirectoryContents(
  fileSystem: FileSystem,
  path: string,
  showHidden: boolean = false
): { files: string[]; directories: string[] } {
  const node = getDirectoryByPath(fileSystem, path);

  if (!node) {
    return { files: [], directories: [] };
  }

  const children = node.children || {};
  const files: string[] = [];
  const directories: string[] = [];

  Object.keys(children).forEach((name) => {
    if (!showHidden && name.startsWith('.')) {
      return;
    }

    const child = children[name];
    if (child) {
      if (child.type === 'file') {
        files.push(name);
      } else if (child.type === 'directory') {
        directories.push(name);
      }
    }
  });

  return { files, directories };
}

/**
 * Read a file
 */
export function readFile(
  fileSystem: FileSystem,
  path: string,
  filename: string
): { success: boolean; content?: string; error?: string } {
  const node = getDirectoryByPath(fileSystem, path);

  if (!node) {
    return { success: false, error: `Not a directory: ${path}` };
  }

  const children = node.children || {};
  const file = children[filename];

  if (!file) {
    return { success: false, error: `File not found: ${filename}` };
  }

  if (file.type !== 'file') {
    return { success: false, error: `Not a file: ${filename}` };
  }

  return { success: true, content: file.content };
}

/**
 * Resolve a file path (handles relative paths)
 * Returns the file node if the file exists
 */
export function resolveFilePath(
  fileSystem: FileSystem,
  currentPath: string,
  filePath: string
): { success: boolean; fullPath?: string; filename?: string; file?: File; error?: string } {
  // Handle absolute paths
  if (filePath.startsWith('/')) {
    const parts = filePath.split('/').filter(Boolean);
    const filename = parts.pop();
    const dirPath = '/' + parts.join('/');
    
    if (!filename) {
      return { success: false, error: 'Invalid file path' };
    }

    const dir = getDirectoryByPath(fileSystem, dirPath || '/home/neoncloud-user');
    if (dir && dir.children && dir.children[filename]) {
      const file = dir.children[filename];
      if (file.type === 'file') {
        return { success: true, fullPath: dirPath || '/home/neoncloud-user', filename, file };
      }
    }
    return { success: false, error: `File not found: ${filename}` };
  }

  // Handle relative paths
  const parts = filePath.split('/').filter(Boolean);
  const filename = parts.pop();
  
  if (!filename) {
    return { success: false, error: 'Invalid file path' };
  }

  let targetDirPath = currentPath;
  
  if (parts.length > 0) {
    // Navigate to directory first
    const dirPath = parts.join('/');
    const navResult = navigateToPath(fileSystem, currentPath, dirPath);
    
    if (!navResult.success) {
      return { success: false, error: navResult.error };
    }
    
    targetDirPath = navResult.newPath || currentPath;
  }

  // Get file from target directory
  const dir = getDirectoryByPath(fileSystem, targetDirPath);
  if (dir && dir.children && dir.children[filename]) {
    const file = dir.children[filename];
    if (file.type === 'file') {
      return { success: true, fullPath: targetDirPath, filename, file };
    }
  }

  return { success: false, error: `File not found: ${filename}` };
}

