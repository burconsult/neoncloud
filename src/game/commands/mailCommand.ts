import { Command, CommandResult } from '@/types';
import { useEmailStore } from '../state/useEmailStore';
import { useFileSystemStore } from '../state/useFileSystemStore';
import { addEmailAttachmentToFileSystem } from '../filesystem/fileSystemOperations';
import { useConnectionStore } from '../state/useConnectionStore';
import { emitEmailRead } from '../events/eventBus';
import { formatEmailForTerminal } from '@/utils/emailFormatter';

/**
 * Mail command - View and manage emails
 */
export const mailCommand: Command = {
  name: 'mail',
  aliases: ['email', 'inbox'],
  description: 'View and manage your email inbox',
  usage: 'mail [read <id>]',
  requiresUnlock: false,
  execute: (args: string[]): CommandResult => {
    const emailStore = useEmailStore.getState();

    // Handle "read" subcommand
    if (args.length > 0 && args[0]?.toLowerCase() === 'read') {
      if (args.length < 2 || !args[1]) {
        return {
          output: [
            'Usage: mail read <id>',
            '',
            'Examples:',
            '  mail read 1',
            '  mail read email-welcome-001',
          ],
          success: false,
          error: 'Missing email ID',
        };
      }

      const emailId = args[1];
      let email = emailStore.getEmailById(emailId);

      // Also try by index
      if (!email) {
        const index = parseInt(emailId, 10);
        if (!isNaN(index) && index > 0) {
          const emails = emailStore.emails;
          if (index <= emails.length) {
            email = emails[index - 1];
          }
        }
      }

      if (!email) {
        return {
          output: `Email not found: ${emailId}`,
          success: false,
          error: 'Email not found',
        };
      }

      // Mark as read
      emailStore.markAsRead(email.id);

      // Emit email read event (mission handlers will check if this completes a task)
      emitEmailRead(email.id, email.missionId);

      // Process attachments - add them to Documents folder (async encryption)
      if (email.attachments && email.attachments.length > 0) {
        const fileSystemStore = useFileSystemStore.getState();
        const fileSystem = fileSystemStore.getActiveFileSystem();
        const documentsPath = '/home/neoncloud-user/Documents';

        // Process attachments asynchronously (encryption is async)
        // Note: This is fire-and-forget since mailCommand.execute is not async
        // Attachments will be encrypted in the background
        Promise.all(
          email.attachments.map(async (attachment) => {
            await addEmailAttachmentToFileSystem(fileSystem, documentsPath, attachment);
            
            // DO NOT store credentials here - credentials are ONLY set when the encrypted file is cracked
            // The player must use the 'crack' command to decrypt the credential file first
            // This ensures proper workflow: read email -> crack encrypted file -> credentials available -> SSH connection
          })
        ).catch(console.error);
      }

      // Use formatted email output with markdown conversion
      const output = formatEmailForTerminal(email);

      return {
        output,
        success: true,
      };
    }

    // List all emails
    const emails = emailStore.emails;
    const unreadCount = emailStore.getUnreadCount();

    if (emails.length === 0) {
      return {
        output: [
          'No emails in your inbox.',
          '',
          'Emails will appear here when you receive new messages.',
        ],
        success: true,
      };
    }

    const output: string[] = [
      `Inbox: ${emails.length} email(s), ${unreadCount} unread`,
      '',
      '─'.repeat(70),
    ];

    emails.forEach((email, index) => {
      const status = email.read ? ' ' : '*';
      const date = new Date(email.timestamp).toLocaleDateString();
      output.push(
        `${status} [${index + 1}] ${email.subject.padEnd(40)} ${date}`
      );
      output.push(`    From: ${email.from}`);
    });

    output.push('─'.repeat(70));
    output.push('');
    output.push('Use "mail read <id>" to read an email.');
    output.push('Use "mail read <number>" to read by index (e.g., "mail read 1").');

    return {
      output,
      success: true,
    };
  },
};

