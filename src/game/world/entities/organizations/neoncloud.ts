/**
 * NeonCloud Organization
 * The player's employer organization
 */

import { Organization } from '../../types/Organization';

export const neoncloudOrg: Organization = {
  id: 'neoncloud',
  name: 'NeonCloud Special Cyberoperations Group',
  displayName: 'NeonCloud Special Cyberoperations Group',
  
  type: 'neoncloud',
  classification: 'employer',
  
  domain: 'neoncloud-ops.org',
  publicDomain: 'neoncloud-ops.org',
  internalDomain: 'neoncloud.internal',
  networkSegments: ['neoncloud-internal'],
  ipRange: '10.0.0.0/24',
  
  hostIds: [], // NeonCloud hosts can be added later
  contactIds: ['agent-smith'], // Main handler contact
  
  // NeonCloud provides basic tools to its agents
  vendorInfo: {
    toolIds: ['network-scanner-basic'], // Basic Network Scanner provided to new agents
    pricingMultiplier: 1.0,
    accessRequirements: {
      requiresVpn: false,
      requiresMission: [],
    },
  },
  
  missionIds: ['welcome-00', 'n00b-01', 'n00b-02'], // Missions involving NeonCloud
  
  discoveryMethods: ['mission'],
  initialVisibility: 'known', // Player knows about their employer from the start
  
  description: 'Your employer - a special cyberoperations group conducting security audits',
  industry: 'cybersecurity',
  size: 'enterprise',
  tags: ['neoncloud', 'employer', 'cybersecurity'],
  reputation: 'trusted',
};

