/**
 * Contact entity type definition
 * Represents a person who can contact the player or be discovered
 */

export type ContactRole = 'handler' | 'target' | 'informant' | 'vendor' | 'neutral';
export type ContactDiscoveryMethod = 'mission' | 'contact' | 'file-system' | 'scan';
export type ContactVisibility = 'hidden' | 'known' | 'discovered';

export interface Contact {
  // Identity
  id: string;
  name: string;
  displayName: string;
  
  // Organization Relationship
  organizationId: string;
  role: ContactRole;
  
  // Contact Information
  email: string;
  emailDomain: string;
  
  // Communication
  canContactPlayer: boolean; // Can send emails to player
  canBeContacted?: boolean; // Player can contact them (future feature)
  
  // Mission Relationships
  missionIds?: string[]; // Missions they appear in
  
  // Discovery
  discoveryMethod: ContactDiscoveryMethod;
  initialVisibility: ContactVisibility;
  
  // Metadata
  description?: string;
  tags?: string[];
  position?: string; // Job title/position
}

