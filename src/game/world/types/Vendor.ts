/**
 * Vendor entity type definition
 * Represents an organization that sells tools/software
 * Note: Vendors are a specialization of Organization
 */

import { Organization } from './Organization';

export interface VendorAccessRequirements {
  requiresVpn?: boolean;
  requiresMission?: string[]; // Missions that unlock access
  requiresCredential?: string;
}

export interface Vendor extends Organization {
  type: 'vendor';
  
  // Vendor-specific fields
  category: 'tool-vendor' | 'data-vendor' | 'service-vendor';
  
  // Tools/Software Sold (if vendorInfo not sufficient)
  toolIds?: string[];
  
  // Access Requirements (if vendorInfo.accessRequirements not sufficient)
  accessRequirements?: VendorAccessRequirements;
  
  // Pricing (if vendorInfo.pricingMultiplier not sufficient)
  pricingMultiplier?: number;
}

