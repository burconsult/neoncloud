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
  from: string; // Email address (legacy, kept for display)
  to: string; // Email address (legacy, kept for display)
  subject: string;
  body: string;
  timestamp: number;
  read: boolean;
  attachments?: EmailAttachment[];
  missionId?: string; // Associated mission ID if this email is part of a mission
  
  /**
   * World Graph Relationships
   * These connect the email to world entities through the graph
   */
  worldGraph?: {
    /**
     * Contact ID of the sender
     * e.g., 'agent-smith' for emails from Agent Smith
     */
    fromContactId?: string;
    
    /**
     * Organization ID of the sender
     * e.g., 'neoncloud' for emails from NeonCloud
     */
    fromOrganizationId?: string;
    
    /**
     * Hosts mentioned/referenced in this email
     * e.g., ['server-01'] for emails mentioning server-01
     */
    relatedHostIds?: string[];
    
    /**
     * Organizations mentioned/referenced in this email
     * e.g., ['megacorp'] for emails mentioning Megacorp
     */
    relatedOrganizationIds?: string[];
  };
}

export interface LoreEntry {
  id: string;
  title: string;
  content: string;
  category: 'world' | 'organization' | 'technology' | 'mission' | 'character';
  unlockedAt?: number; // Timestamp when unlocked
  missionId?: string; // Mission that unlocked this lore entry
}

