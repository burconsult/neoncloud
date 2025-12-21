/**
 * Organization entity type definition
 * Represents a company, group, or entity in the game world
 */

export type OrganizationType = 'corporation' | 'government' | 'neoncloud' | 'vendor' | 'neutral';
export type OrganizationClassification = 'target' | 'employer' | 'vendor' | 'neutral';
export type OrganizationDiscoveryMethod = 'mission' | 'dns-lookup' | 'contact' | 'scan';
export type OrganizationVisibility = 'hidden' | 'known' | 'discovered';

export interface Organization {
  // Identity
  id: string;
  name: string;
  displayName: string;
  
  // Type and Classification
  type: OrganizationType;
  classification: OrganizationClassification;
  
  // Network Infrastructure
  domain?: string; // Primary domain (e.g., 'megacorp.com')
  publicDomain?: string; // Public-facing domain
  internalDomain?: string; // Internal domain (e.g., 'megacorp.local')
  networkSegments?: string[]; // Network segments owned by this org
  ipRange?: string; // IP range (CIDR notation, e.g., '192.168.1.0/24')
  
  // Relationships
  hostIds: string[]; // Hosts owned/managed by this organization
  contactIds: string[]; // Contacts associated with this organization
  
  // Vendor Relationships
  vendorInfo?: {
    toolIds?: string[]; // Tools/software sold by this vendor
    pricingMultiplier?: number; // Price adjustment (1.0 = normal, 0.9 = 10% discount)
    accessRequirements?: {
      requiresVpn?: boolean;
      requiresMission?: string[]; // Missions that unlock access
      requiresCredential?: string;
    };
  };
  
  // Mission Relationships
  missionIds?: string[]; // Missions involving this organization
  
  // Discovery
  discoveryMethods: OrganizationDiscoveryMethod[];
  initialVisibility: OrganizationVisibility; // Starting visibility state
  
  // Metadata
  description?: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  tags?: string[];
  reputation?: string; // e.g., 'trusted', 'questionable', 'hostile'
}

