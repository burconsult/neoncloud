/**
 * Password Cracker Tool Module
 * 
 * Self-contained module for Password Cracker tool (Basic and Advanced versions)
 */

import { ToolModule } from '../ToolModule';
import { Command, CommandResult, GameContext } from '@/types';
import { useInventoryStore } from '../../state/useInventoryStore';
import { useFileSystemStore } from '../../state/useFileSystemStore';
import { useEmailStore } from '../../state/useEmailStore';
import { resolveFilePath, readFile } from '../../filesystem/fileSystem';
import { addFileToFileSystem } from '../../filesystem/fileSystemOperations';
import { decryptContent, isEncryptedContent } from '@/utils/fileEncryption';
import { useConnectionStore } from '../../state/useConnectionStore';
import { emitToolUsed } from '../../events/eventBus';
import { queueToolAction } from '../../time/actionQueue';
import { useTerminalStore } from '../../state/useTerminalStore';

export const passwordCrackerToolModule: ToolModule = {
  toolId: 'password-cracker',

  basicSoftware: {
    id: 'password-cracker-basic',
    name: 'Basic Password Cracker',
    description: 'Simple brute-force password cracking tool. Slow but effective.',
    category: 'security',
    rarity: 'common',
    price: 300,
    requirements: {
      completedMissions: ['tutorial-01'],
    },
    effects: {
      unlockCommands: ['crack'],
    },
  },

  premiumSoftware: {
    id: 'password-cracker-advanced',
    name: 'Advanced Password Cracker',
    description: 'Fast dictionary and rainbow table attacks. Much faster than basic version.',
    category: 'security',
    rarity: 'uncommon',
    price: 750,
    requirements: {
      completedMissions: ['network-01'],
    },
    effects: {
      unlockCommands: ['crack', 'dictionary-attack', 'rainbow-table'],
    },
  },

  duration: {
    basic: 45,   // Basic cracker: 45 seconds
    premium: 15, // Advanced cracker: 15 seconds
  },

  command: {
    name: 'crack',
    aliases: ['crack-password', 'brute-force', 'decrypt'],
    description: 'Crack passwords using brute force or dictionary attacks, or decrypt encrypted files',
    usage: 'crack <target> | crack <file.enc>',
    requiresUnlock: false,
    execute: async (args: string[], context?: GameContext): Promise<CommandResult> => {
      if (args.length === 0) {
        return {
          output: [
            'Usage: crack <target>',
            '',
            'Examples:',
            '  crack server-01',
            '  crack admin-account',
            '',
            'You need to own a password cracker tool to use this command.',
          ],
          success: false,
          error: 'Missing target',
        };
      }
      
      const inventoryStore = useInventoryStore.getState();
      
      // Check if player owns a password cracker
      const hasBasicCracker = inventoryStore.ownsSoftware('password-cracker-basic');
      const hasAdvancedCracker = inventoryStore.ownsSoftware('password-cracker-advanced');
      
      if (!hasBasicCracker && !hasAdvancedCracker) {
        return {
          output: [
            'Password cracker not available. You need to purchase one first.',
            '',
            'Available crackers:',
            '  • Basic Password Cracker (300 NC) - Type "store" to purchase',
            '  • Advanced Password Cracker (750 NC) - Type "store" to purchase',
          ],
          success: false,
          error: 'Password cracker not owned',
        };
      }
      
      const target = args[0];
      const crackerType = hasAdvancedCracker ? 'Advanced' : 'Basic';
      const softwareId = hasAdvancedCracker ? 'password-cracker-advanced' : 'password-cracker-basic';
      const isPremium = hasAdvancedCracker;
      const duration = isPremium 
        ? (passwordCrackerToolModule.duration.premium || passwordCrackerToolModule.duration.basic)
        : passwordCrackerToolModule.duration.basic;
      
      // Check if target is a file (encrypted file to decrypt)
      const fileSystemStore = useFileSystemStore.getState();
      const fileSystem = fileSystemStore.getActiveFileSystem();
      const currentPath = fileSystemStore.getCurrentDirectory();
      
      // Try to resolve as file path
      const filePathResult = resolveFilePath(fileSystem, currentPath, target);
      const isFile = filePathResult.success && filePathResult.filename;
      
      if (isFile && filePathResult.fullPath && filePathResult.filename) {
        // It's a file - try to read it and decrypt
        const fileResult = readFile(fileSystem, filePathResult.fullPath, filePathResult.filename);
        const fileNode = filePathResult.file;
        
        if (fileResult.success && fileResult.content && fileNode && fileNode.type === 'file') {
          // Check if file is marked as encrypted
          if (fileNode.isEncrypted && fileNode.encryptionKey) {
            // File is encrypted - find password from email attachment
            const emailStore = useEmailStore.getState();
            let password: string | undefined;
            let foundAttachment = false;
            
            for (const email of emailStore.emails) {
              if (email.attachments) {
                for (const attachment of email.attachments) {
                  if (attachment.filename === filePathResult.filename && attachment.encrypted && !attachment.decryptedContent) {
                    password = attachment.password;
                    foundAttachment = true;
                    break;
                  }
                }
              }
              if (foundAttachment) break;
            }
            
            if (!foundAttachment || !password) {
              return {
                output: [
                  `File ${target} appears to be encrypted, but decryption key not found.`,
                  'Make sure this is a valid encrypted file from an email attachment.',
                ],
                success: false,
                error: 'Decryption key not found',
              };
            }

            // Queue the cracking/decryption action
            queueToolAction(
              'password-cracker',
              `${crackerType} Password Cracker: Decrypting ${filePathResult.filename}...`,
              duration,
              async () => {
                try {
                  // Attempt real decryption using Web Crypto API
                  const decryptedText = await decryptContent(fileResult.content, password);
                  
                  if (!decryptedText) {
                    const terminalStore = useTerminalStore.getState();
                    terminalStore.addLine({
                      type: 'error',
                      content: [
                        `Decryption failed for ${target}.`,
                        'The file may be corrupted or the password may be incorrect.',
                      ],
                    });
                    return;
                  }
                  
                  // Update attachment status
                  if (foundAttachment) {
                    for (const email of emailStore.emails) {
                      if (email.attachments) {
                        for (const attachment of email.attachments) {
                          if (attachment.filename === filePathResult.filename) {
                            attachment.decryptedContent = decryptedText;
                            break;
                          }
                        }
                      }
                    }
                  }
                  
                  // Format the decrypted content nicely
                  const formattedContent = decryptedText.includes('SERVER_ID:') 
                    ? `Decrypted Credentials for server-01:\nUsername: admin\nPassword: ${password}`
                    : decryptedText;
                  
                  // Create a new .txt file with the decrypted content (keep original .enc file encrypted)
                  // Replace .enc extension with .txt, or append .txt if no .enc extension
                  const decryptedFilename = filePathResult.filename.replace(/\.enc$/i, '.txt');
                  
                  // Add the decrypted file to the file system in the same directory
                  const addResult = addFileToFileSystem(
                    fileSystem,
                    filePathResult.fullPath,
                    decryptedFilename,
                    formattedContent
                  );
                  
                  if (addResult.success) {
                    // Store credentials if password is found
                    if (password && filePathResult.filename.includes('credentials')) {
                      const serverIdMatch = filePathResult.filename.match(/(server-\d+)/);
                      if (serverIdMatch && serverIdMatch[1]) {
                        const serverId = serverIdMatch[1];
                        const username = 'admin';
                        const connectionStore = useConnectionStore.getState();
                        connectionStore.setServerCredentials(serverId, username, password);
                      }
                    }
                    
                    // Emit tool used event
                    emitToolUsed('crack', target, true);
                    
                    // Add completion message to terminal
                    const terminalStore = useTerminalStore.getState();
                    const connectionContext = {
                      hostname: fileSystemStore.activeServerId || 'neoncloud',
                      vpnConnected: useConnectionStore.getState().isVPNConnected(),
                      vpnType: useConnectionStore.getState().vpnType,
                    };
                    
                    terminalStore.addLine({
                      type: 'output',
                      content: [
                        `File decrypted successfully!`,
                        '',
                        `Decrypted file created: ${decryptedFilename}`,
                        `The original encrypted file (${filePathResult.filename}) remains encrypted.`,
                        `Use "cat ${decryptedFilename}" to view the decrypted content.`,
                        '',
                        password ? `Password extracted: ${password}` : '',
                        '',
                        '💡 Tip: The original encrypted file stays encrypted. The decrypted content is in a new .txt file.',
                      ].filter(Boolean),
                      connectionContext,
                    });
                  } else {
                    // Failed to create decrypted file
                    const terminalStore = useTerminalStore.getState();
                    terminalStore.addLine({
                      type: 'error',
                      content: [
                        `Failed to create decrypted file: ${addResult.error || 'Unknown error'}`,
                      ],
                    });
                  }
                } catch (decryptError) {
                  console.error('Decryption error:', decryptError);
                  const terminalStore = useTerminalStore.getState();
                  terminalStore.addLine({
                    type: 'error',
                    content: [
                      `Decryption failed for ${target}.`,
                      'The file may be corrupted or the encryption algorithm is not supported.',
                    ],
                  });
                }
              }
            );

            // Return immediately (progress bar will show)
            return {
              output: [
                `Using ${crackerType} Password Cracker on ${target}...`,
                '',
                'Attempting decryption...',
                'Analyzing encryption algorithm (AES-GCM)...',
                'Applying brute force decryption...',
              ],
              success: true,
              educationalContent: {
                id: 'file-decryption-explanation',
                title: 'File Decryption',
                content: `File decryption is the process of converting encrypted data back into its original form.

**How it works:**
- Uses a decryption key or algorithm to reverse the encryption process.
- Without the correct key, decryption is extremely difficult (brute force).

**Importance:**
- Protects confidential information from unauthorized access.
- Ensures data privacy and integrity.`,
                type: 'concept',
                relatedCommands: ['crack', 'cat'],
                relatedMissions: ['n00b-01'],
                difficulty: 2,
              },
            };
          } else if (isEncryptedContent(fileResult.content)) {
            // Legacy encrypted content handling
            // (Similar logic but for legacy format - can be simplified later)
            return {
              output: [
                `File ${target} appears to be encrypted (legacy format).`,
                'Decryption for legacy format files is not yet fully supported.',
              ],
              success: false,
              error: 'Legacy format not supported',
            };
          }
        }
      }
      
      // Otherwise, treat as server/account target (original behavior)
      // Note: This is a placeholder for future server password cracking
      // For now, we focus on file decryption which is the main use case
      
      return {
        output: [
          `Using ${crackerType} Password Cracker on ${target}...`,
          '',
          'Target type not recognized. Use crack on encrypted files from email attachments.',
          '',
          'Example: crack server-01-credentials.enc',
        ],
        success: false,
        error: 'Invalid target type',
        educationalContent: {
          id: 'password-cracking-explanation',
          title: 'Understanding Password Cracking',
          content: `Password cracking is the process of recovering passwords from stored data.

**Common Methods:**
- **Brute Force**: Try every possible combination
- **Dictionary Attack**: Try common passwords from a list
- **Rainbow Tables**: Pre-computed hash tables
- **Social Engineering**: Tricking users to reveal passwords

**Protection:**
- Use long, complex passwords
- Enable two-factor authentication
- Use password managers
- Never reuse passwords`,
          type: 'concept',
          relatedCommands: ['crack'],
          relatedMissions: ['n00b-01'],
          difficulty: 2,
        },
      };
    },
  },
};

