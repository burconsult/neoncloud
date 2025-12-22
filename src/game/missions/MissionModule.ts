import { Mission } from '@/types';
import { Email } from '@/types/email';
import { LoreEntry } from '@/types/email';
import { FileSystem } from '@/types';
import { createLogger } from '../../utils/logger';

const logger = createLogger('MissionRegistry');

/**
 * Mission Module Interface
 * 
 * Each mission module is self-contained and includes everything needed for that mission:
 * - Mission definition
 * - Emails sent when mission starts/completes
 * - Lore entries unlocked
 * - File system changes
 * - Required software/tools
 * - Other dependencies
 * 
 * This makes it easy to create new missions by creating a new module file.
 */
export interface MissionModule {
  /**
   * Unique mission identifier
   */
  missionId: string;

  /**
   * The mission definition
   */
  mission: Mission;

  /**
   * Emails to send when this mission starts
   */
  startEmails?: Email[];

  /**
   * Emails to send when this mission completes
   */
  completionEmails?: Email[];

  /**
   * Lore entries to unlock when mission starts
   */
  unlockLore?: LoreEntry[];

  /**
   * File system additions/changes for this mission
   * These files will be added to the player's file system when mission starts
   */
  fileSystemAdditions?: FileSystem;

  /**
   * Required software/tools that must be available for this mission
   * This is informational - actual availability is checked by the inventory system
   */
  requiredSoftware?: string[];

  /**
   * Expected completion time in real-time seconds
   * Used for speed bonus calculations
   * If not provided, defaults to 15 minutes
   */
  expectedCompletionTime?: number;

  /**
   * Mapping of software IDs to task IDs that complete when software is purchased
   * Example: { 'vpn-basic': 'task-2' } means purchasing vpn-basic completes task-2
   */
  purchaseTaskMapping?: Record<string, string>;

  /**
   * Optional initialization function called when mission starts
   * Can be used for custom setup logic
   */
  onStart?: () => void | Promise<void>;

  /**
   * Optional completion function called when mission completes
   * Can be used for custom cleanup or setup for next mission
   */
  onComplete?: () => void | Promise<void>;

  /**
   * World Graph Relationships
   * These connect the mission to world entities through the graph
   */
  worldGraph?: {
    /**
     * Organization that provides/contracts this mission (client)
     * e.g., 'neoncloud' for NeonCloud missions
     */
    clientOrganizationId?: string;
    
    /**
     * Hosts targeted in this mission
     * e.g., ['server-01'] for missions targeting server-01
     */
    targetHostIds?: string[];
    
    /**
     * Organizations targeted in this mission
     * e.g., ['megacorp'] for missions targeting Megacorp
     */
    targetOrganizationIds?: string[];
    
    /**
     * Contact who briefs the player for this mission
     * e.g., 'agent-smith' for NeonCloud handler
     */
    contactId?: string;
  };
}

/**
 * Mission Registry
 * All mission modules are registered here
 */
class MissionRegistry {
  private modules: Map<string, MissionModule> = new Map();

  /**
   * Register a mission module
   */
  register(module: MissionModule): void {
    if (this.modules.has(module.missionId)) {
      logger.warn(`Mission module ${module.missionId} is already registered. Overwriting...`);
    }
    this.modules.set(module.missionId, module);
  }

  /**
   * Get a mission module by ID
   */
  get(missionId: string): MissionModule | undefined {
    return this.modules.get(missionId);
  }

  /**
   * Get all registered mission modules
   */
  getAll(): MissionModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get all mission definitions
   */
  getAllMissions(): Mission[] {
    return this.getAll().map(module => module.mission);
  }

  /**
   * Clear all registered modules (useful for testing)
   */
  clear(): void {
    this.modules.clear();
  }
}

// Export singleton instance
export const missionRegistry = new MissionRegistry();

