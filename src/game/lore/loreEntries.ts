import { LoreEntry } from '@/types/email';

/**
 * Lore entries for the NeonCloud universe
 */

export const loreEntries: Record<string, LoreEntry> = {
  'lore-neoncloud-org': {
    id: 'lore-neoncloud-org',
    title: 'NeonCloud Special Cyberoperations Group',
    content: `NeonCloud Special Cyberoperations Group (NC-SCOG) is an elite cybersecurity organization that trains and deploys agents to protect digital infrastructure and combat cyber threats.

**Organization Structure:**
- Headquarters: Classified
- Operations: Global
- Focus: Network security, penetration testing, threat analysis

**Agent Ranks:**
- Trainee (Level 1)
- Agent (Level 2-3)
- Specialist (Level 4-5)
- Elite Agent (Level 6+)

Agents are assigned contracts from various clients requiring penetration testing, security audits, and threat assessment.`,
    category: 'organization',
  },
  
  'lore-world': {
    id: 'lore-world',
    title: 'The Digital World',
    content: `In the NeonCloud universe, the internet is a vast network of interconnected systems, servers, and networks. Cybersecurity professionals work to protect these digital assets from threats.

**Key Concepts:**
- Networks connect computers and servers globally
- Servers host websites, applications, and data
- VPNs provide secure, encrypted connections
- Encryption protects sensitive information
- Penetration testing helps identify vulnerabilities

Understanding how these systems work is essential for cybersecurity professionals.`,
    category: 'world',
  },
  
  'lore-neoncoin': {
    id: 'lore-neoncoin',
    title: 'NeonCoin Currency',
    content: `NeonCoin (NC) is the virtual currency used within the NeonCloud ecosystem. Agents earn NeonCoins by completing missions and tasks.

**Usage:**
- Purchase software tools (VPN, password crackers, etc.)
- Upgrade existing tools to premium versions
- Expand storage capacity

**Earning NeonCoins:**
- Complete mission objectives
- Finish training tasks
- Achieve mission bonuses

NeonCoins are essential for accessing advanced tools and progressing through missions.`,
    category: 'technology',
  },
};

/**
 * Unlock a lore entry
 */
export function unlockLoreEntry(entryId: string): LoreEntry | null {
  return loreEntries[entryId] || null;
}

