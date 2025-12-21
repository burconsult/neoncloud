/**
 * Tool Module Interface
 * 
 * Each tool module is self-contained and includes everything needed for that tool:
 * - Software definition (for inventory/store)
 * - Duration (basic/premium versions)
 * - Command implementation
 * - All tool-specific logic
 * 
 * This makes it easy to add new tools by creating a new module file.
 */

import { Command } from '@/types';
import { Software } from '../inventory/inventoryTypes';

/**
 * Tool duration definition
 */
export interface ToolDuration {
  basic: number;    // Real-time seconds for basic version
  premium?: number; // Real-time seconds for premium version (optional)
}

/**
 * Tool Module Interface
 * 
 * A complete, self-contained definition of a tool/command
 */
export interface ToolModule {
  /**
   * Unique tool identifier (e.g., 'vpn', 'password-cracker')
   * Used for internal references, duration lookup, etc.
   */
  toolId: string;

  /**
   * Software definitions
   * If tool has basic/premium versions, provide both
   * If tool has only one version, provide only software
   */
  software?: Software;           // Single version tool
  basicSoftware?: Software;      // Basic version (if applicable)
  premiumSoftware?: Software;    // Premium/Advanced version (if applicable)

  /**
   * Duration in real-time seconds
   */
  duration: ToolDuration;

  /**
   * Command implementation
   * The command that uses this tool
   */
  command: Command;

  /**
   * Optional initialization function
   * Called when tool module is registered
   */
  onInit?: () => void | Promise<void>;
}

/**
 * Tool Registry
 * All tool modules are registered here
 */
class ToolRegistry {
  private modules: Map<string, ToolModule> = new Map();

  /**
   * Register a tool module
   */
  register(module: ToolModule): void {
    if (this.modules.has(module.toolId)) {
      console.warn(`Tool module ${module.toolId} is already registered. Overwriting...`);
    }
    this.modules.set(module.toolId, module);
  }

  /**
   * Get a tool module by ID
   */
  get(toolId: string): ToolModule | undefined {
    return this.modules.get(toolId);
  }

  /**
   * Get all registered tool modules
   */
  getAll(): ToolModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get all software definitions from tool modules
   */
  getAllSoftware(): Software[] {
    const software: Software[] = [];
    
    this.modules.forEach(module => {
      if (module.software) {
        software.push(module.software);
      }
      if (module.basicSoftware) {
        software.push(module.basicSoftware);
      }
      if (module.premiumSoftware) {
        software.push(module.premiumSoftware);
      }
    });
    
    return software;
  }

  /**
   * Get tool duration by software ID
   */
  getDurationBySoftwareId(softwareId: string): number {
    for (const module of this.modules.values()) {
      // Check single version
      if (module.software && module.software.id === softwareId) {
        return module.duration.basic;
      }
      
      // Check basic version
      if (module.basicSoftware && module.basicSoftware.id === softwareId) {
        return module.duration.basic;
      }
      
      // Check premium version
      if (module.premiumSoftware && module.premiumSoftware.id === softwareId) {
        return module.duration.premium || module.duration.basic;
      }
    }
    
    console.warn(`Tool duration not found for software: ${softwareId}, using default 5s`);
    return 5; // Default
  }

  /**
   * Get tool module by software ID
   */
  getBySoftwareId(softwareId: string): ToolModule | undefined {
    for (const module of this.modules.values()) {
      if (module.software?.id === softwareId ||
          module.basicSoftware?.id === softwareId ||
          module.premiumSoftware?.id === softwareId) {
        return module;
      }
    }
    return undefined;
  }

  /**
   * Clear all registered modules (useful for testing)
   */
  clear(): void {
    this.modules.clear();
  }
}

// Export singleton instance
export const toolRegistry = new ToolRegistry();

