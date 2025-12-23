/**
 * Megacorp Organization
 * A target corporation for hacking missions
 */

import { Organization } from '../../types/Organization';

export const megacorpOrg: Organization = {
  id: 'megacorp',
  name: 'Megacorp Industries',
  displayName: 'Megacorp Industries',
  
  type: 'corporation',
  classification: 'target',
  
  domain: 'megacorp.com',
  publicDomain: 'megacorp.com',
  internalDomain: 'megacorp.local',
  networkSegments: ['megacorp-internal', 'megacorp-dmz'],
  ipRange: '203.0.113.0/24', // Public IP range (TEST-NET-3, safe for examples)
  
  hostIds: ['megacorp-webserver', 'megacorp-server-01', 'megacorp-database-01'], // Servers owned by Megacorp (web server + internal servers)
  contactIds: [], // No contacts initially
  
  vendorInfo: null,
  
  missionIds: ['n00b-01', 'n00b-02'], // Missions targeting Megacorp
  
  discoveryMethods: ['mission'],
  initialVisibility: 'hidden', // Discovered through mission briefings
  
  description: 'Large corporation, frequent target for security audits',
  industry: 'technology',
  size: 'enterprise',
  tags: ['corporation', 'target', 'technology'],
  reputation: 'neutral',
};

