import { Email, EmailAttachment } from '@/types/email';

/**
 * Format email content for terminal display
 * Converts markdown formatting to terminal-friendly text while preserving structure
 */
export function formatEmailForTerminal(email: Email): string[] {
  const lines: string[] = [];
  
  // Header separator
  lines.push('═'.repeat(70));
  
  // Email header with better formatting
  lines.push(`From:    ${email.from}`);
  lines.push(`To:      ${email.to}`);
  lines.push(`Subject: ${email.subject}`);
  lines.push(`Date:    ${new Date(email.timestamp).toLocaleString()}`);
  
  lines.push('═'.repeat(70));
  lines.push('');
  
  // Email body with markdown formatting converted to text
  const formattedBody = formatMarkdownForTerminal(email.body);
  lines.push(...formattedBody);
  
  // Attachments section
  if (email.attachments && email.attachments.length > 0) {
    lines.push('');
    lines.push('─'.repeat(70));
    lines.push('Attachments:');
    lines.push('');
    
    email.attachments.forEach((attachment) => {
      const status = attachment.decryptedContent ? '[Decrypted]' : '[Encrypted]';
      const statusColor = attachment.decryptedContent ? '✓' : '🔒';
      lines.push(`  ${statusColor} ${attachment.filename.padEnd(45)} ${status}`);
    });
    
    lines.push('');
    lines.push('Note: Attachments have been saved to your Documents folder.');
    lines.push('─'.repeat(70));
  }
  
  lines.push('');
  lines.push('═'.repeat(70));
  
  return lines;
}

/**
 * Convert markdown formatting to terminal-friendly text
 */
function formatMarkdownForTerminal(text: string): string[] {
  const lines: string[] = [];
  const paragraphs = text.split(/\n\n+/);
  
  paragraphs.forEach((paragraph) => {
    const trimmed = paragraph.trim();
    if (!trimmed) {
      lines.push('');
      return;
    }
    
    // Check if it's a list
    const listItems = trimmed.split('\n').filter(line => 
      line.trim().startsWith('-') || /^\d+\.\s/.test(line.trim())
    );
    
    if (listItems.length > 0) {
      // It's a list - format each item
      const nonListContent = trimmed.split('\n').filter(line => 
        !line.trim().startsWith('-') && !/^\d+\.\s/.test(line.trim())
      );
      
      // Add non-list content before the list
      if (nonListContent.length > 0) {
        const nonListText = nonListContent.join(' ').replace(/\*\*/g, '').trim();
        if (nonListText) {
          lines.push(wordWrap(nonListText, 68));
        }
      }
      
      // Format list items
      listItems.forEach((item) => {
        const cleaned = item.trim().replace(/^[-•]\s+/, '• ').replace(/^\d+\.\s+/, '  ');
        const text = cleaned.replace(/\*\*/g, '').trim();
        lines.push(`  ${text}`);
      });
    } else {
      // Regular paragraph - wrap text and remove markdown
      const cleaned = trimmed.replace(/\*\*(.+?)\*\*/g, '$1'); // Remove bold, keep content
      lines.push(wordWrap(cleaned, 68));
    }
  });
  
  return lines;
}

/**
 * Word wrap text to fit terminal width
 */
function wordWrap(text: string, maxWidth: number): string {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach((word) => {
    if ((currentLine + word).length <= maxWidth) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines.length > 0 ? lines.join('\n') : text;
}

