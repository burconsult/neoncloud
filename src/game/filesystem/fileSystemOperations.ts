import { FileSystem } from '@/types';
import { EmailAttachment } from '@/types/email';
import { getDirectoryByPath } from './fileSystem';
import { encryptContent, generateEncryptedGibberish } from '@/utils/fileEncryption';

/**
 * Operations for modifying the file system
 * Used for adding files from email attachments, etc.
 */

/**
 * Add a file to the file system at a specific path
 */
export function addFileToFileSystem(
  fileSystem: FileSystem,
  directoryPath: string,
  filename: string,
  content: string
): { success: boolean; error?: string } {
  // Find the directory
  const dir = getDirectoryByPath(fileSystem, directoryPath);
  
  if (!dir) {
    return { success: false, error: `Directory not found: ${directoryPath}` };
  }

  // Add the file
  if (!dir.children) {
    dir.children = {};
  }

  dir.children[filename] = {
    type: 'file',
    name: filename,
    content: content,
  };

  return { success: true };
}

/**
 * Add an email attachment as a file to the file system
 * If attachment is encrypted, stores it with encryption flag and encrypted content
 */
export async function addEmailAttachmentToFileSystem(
  fileSystem: FileSystem,
  directoryPath: string,
  attachment: EmailAttachment
): Promise<{ success: boolean; error?: string }> {
  if (attachment.encrypted && !attachment.decryptedContent && attachment.password) {
    // File is encrypted - encrypt the actual content and store it
    try {
      // Extract server ID from filename (e.g., "server-01-credentials.enc" -> "server-01")
      const serverIdMatch = attachment.filename.match(/(server-\d+)/);
      const serverId: string = serverIdMatch ? serverIdMatch[1] : 'server-01';
      
      // Extract server number for display (e.g., "server-01" -> "01")
      const serverNumber = serverId.replace('server-', '');
      
      // Create plaintext content in the format expected by the password cracker
      const plaintext = `Server-${serverNumber} Credentials

Username: admin
Password: ${attachment.password}

Server Details:
- Host: ${serverId}
- Port: 22
- Protocol: SSH
- Security: ${serverId === 'server-01' ? 'Standard' : 'Enhanced'}`;
      
      const encryptedContent = await encryptContent(plaintext, attachment.password || 'default-key');
      
      // Find the directory
      const dir = getDirectoryByPath(fileSystem, directoryPath);
      
      if (!dir) {
        return { success: false, error: `Directory not found: ${directoryPath}` };
      }

      // Add the file with encryption flag
      if (!dir.children) {
        dir.children = {};
      }

      dir.children[attachment.filename] = {
        type: 'file',
        name: attachment.filename,
        content: encryptedContent, // Store encrypted content
        isEncrypted: true,
        encryptionKey: attachment.password, // Store key identifier
      };

      return { success: true };
    } catch (error) {
      console.error('Failed to encrypt attachment:', error);
      // Fallback: use gibberish
      const gibberish = generateEncryptedGibberish(200);
      const dir = getDirectoryByPath(fileSystem, directoryPath);
      if (!dir) {
        return { success: false, error: `Directory not found: ${directoryPath}` };
      }
      if (!dir.children) {
        dir.children = {};
      }
      dir.children[attachment.filename] = {
        type: 'file',
        name: attachment.filename,
        content: gibberish,
        isEncrypted: true,
        encryptionKey: attachment.password,
      };
      return { success: true };
    }
  } else {
    // File is not encrypted or already decrypted
    const content = attachment.decryptedContent || attachment.encryptedContent;
    return addFileToFileSystem(fileSystem, directoryPath, attachment.filename, content);
  }
}

/**
 * Update file content in the file system (e.g., decrypt an encrypted file)
 */
export function updateFileContent(
  fileSystem: FileSystem,
  directoryPath: string,
  filename: string,
  newContent: string
): { success: boolean; error?: string } {
  const dir = getDirectoryByPath(fileSystem, directoryPath);
  
  if (!dir) {
    return { success: false, error: `Directory not found: ${directoryPath}` };
  }

  if (!dir.children || !dir.children[filename]) {
    return { success: false, error: `File not found: ${filename}` };
  }

  const file = dir.children[filename];
  if (file.type !== 'file') {
    return { success: false, error: `Not a file: ${filename}` };
  }

  // Update content
  dir.children[filename] = {
    ...file,
    content: newContent,
  };

  return { success: true };
}

