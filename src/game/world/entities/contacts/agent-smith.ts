/**
 * Agent Smith Contact
 * Player's handler at NeonCloud
 */

import { Contact } from '../../types/Contact';

export const agentSmithContact: Contact = {
  id: 'agent-smith',
  name: 'Agent Smith',
  displayName: 'Agent Smith',
  
  organizationId: 'neoncloud',
  role: 'handler',
  
  email: 'agent.smith@neoncloud-ops.org',
  emailDomain: 'neoncloud-ops.org',
  
  canContactPlayer: true,
  canBeContacted: false, // Future feature
  
  missionIds: ['welcome-00', 'n00b-01'], // Missions where Agent Smith contacts player
  
  discoveryMethod: 'mission',
  initialVisibility: 'known', // Known from game start
  
  description: 'Your handler at NeonCloud Special Cyberoperations Group',
  tags: ['neoncloud', 'handler', 'mission-giver'],
  position: 'Mission Handler',
};

