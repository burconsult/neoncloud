/**
 * File System Types
 * Extended types for realistic file system operations
 */

import { File, Directory } from '@/types';

/**
 * File metadata for realistic file system operations
 * Supports future features like FTP, permissions, ownership
 */
export interface FileMetadata {
  /** File permissions in octal format (e.g., '0644', '0755') */
  permissions?: string;
  /** File owner username */
  owner?: string;
  /** File group */
  group?: string;
  /** File size in bytes */
  size?: number;
  /** Last modified timestamp */
  modified?: number;
  /** Whether file is executable (for future tool/script functionality) */
  executable?: boolean;
  /** File type hint (for future functionality) */
  mimeType?: string;
}

/**
 * Extended file type with metadata
 */
export interface ExtendedFile extends File {
  metadata?: FileMetadata;
}

/**
 * Extended directory type
 */
export interface ExtendedDirectory {
  type: 'directory';
  name: string;
  metadata?: FileMetadata;
  children?: {
    [name: string]: ExtendedFile | ExtendedDirectory;
  };
}

/**
 * Extended file system type
 */
export interface ExtendedFileSystem {
  [path: string]: ExtendedDirectory | ExtendedFile;
}

/**
 * Default file metadata
 */
export const DEFAULT_FILE_METADATA: FileMetadata = {
  permissions: '0644',
  owner: 'root',
  group: 'root',
  size: 0,
  modified: Date.now(),
  executable: false,
  mimeType: 'text/plain',
};

/**
 * Default executable file metadata
 */
export const EXECUTABLE_FILE_METADATA: FileMetadata = {
  ...DEFAULT_FILE_METADATA,
  permissions: '0755',
  executable: true,
};

/**
 * User home directory metadata
 */
export const USER_HOME_METADATA: FileMetadata = {
  permissions: '0755',
  owner: 'user',
  group: 'user',
  size: 4096,
  modified: Date.now(),
  executable: false,
};

