/**
 * Email system types
 */

export interface EmailAttachment {
  filename: string;
  encrypted: boolean; // If true, file contains encrypted data that needs cracking
  encryptedContent: string; // Encrypted gibberish content
  decryptedContent?: string; // Content after decryption
  password?: string; // Password revealed after cracking (for server credentials)
}

export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: number;
  read: boolean;
  attachments?: EmailAttachment[];
  missionId?: string; // Associated mission ID if this email is part of a mission
}

export interface LoreEntry {
  id: string;
  title: string;
  content: string;
  category: 'world' | 'organization' | 'technology' | 'mission' | 'character';
  unlockedAt?: number; // Timestamp when unlocked
  missionId?: string; // Mission that unlocked this lore entry
}

