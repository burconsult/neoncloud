/**
 * Server File System Utilities
 * 
 * File systems are now defined directly in host entity files (e.g., server-01.ts, server-02.ts).
 * This file provides utilities for retrieving filesystems through the world graph.
 * 
 * Architecture:
 * - Each host defines its own fileSystemFactory in its entity file
 * - getServerFileSystem() queries the world registry to get the host
 * - The host's fileSystemFactory() is called to create the filesystem
 * - This ensures all filesystems are modular and defined with their hosts
 */

import { FileSystem } from '@/types';

/**
 * Get file system for a specific server
 * Queries the world registry for the host and uses its fileSystemFactory
 * This ensures all filesystems are defined in their host entities
 * 
 * @param serverId Server identifier (host ID)
 * @returns FileSystem for the server, or null if not found
 */
export async function getServerFileSystem(serverId: string): Promise<FileSystem | null> {
  try {
    // Import world registry dynamically to avoid circular dependencies
    const { worldRegistry } = await import('../world/registry/WorldRegistry');
    const host = worldRegistry.getHost(serverId);
    
    if (host && host.fileSystemFactory) {
      return host.fileSystemFactory();
    }
    
    // If host not found or no factory, return null
    return null;
  } catch (error) {
    // If world registry not available (shouldn't happen in normal flow)
    console.error(`Error loading file system from world registry for ${serverId}:`, error);
    return null;
  }
}

/**
 * Synchronous version for backward compatibility
 * Note: This will only work if world registry is already loaded
 */
export function getServerFileSystemSync(serverId: string): FileSystem | null {
  try {
    // Try to access world registry synchronously (only works if already imported)
    const { worldRegistry } = require('../world/registry/WorldRegistry');
    const host = worldRegistry.getHost(serverId);
    
    if (host && host.fileSystemFactory) {
      return host.fileSystemFactory();
    }
    
    return null;
  } catch (error) {
    // If require fails, return null (will be handled by async version)
    return null;
  }
}

/**
 * Get home directory path for a server based on username
 * Players start in their home directory (/home/<username>) when SSH'ing in
 * This forces realistic navigation - they must explore to find files
 * 
 * @param serverId Server identifier
 * @param username Username (from credentials)
 * @returns Home directory path
 */
export function getServerHomeDirectory(serverId: string, username?: string): string {
  // Realistic behavior: SSH users start in their home directory
  // Default to 'admin' if username not provided (most servers use admin account)
  const actualUsername = username || 'admin';
  return `/home/${actualUsername}`;
}

