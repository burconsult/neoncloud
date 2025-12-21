/**
 * Tool Loader
 * 
 * Loads and registers all tool modules.
 * Similar to missionLoader for missions.
 */

import { toolRegistry } from './ToolModule';

// Import all tool modules
import { vpnToolModule } from './modules/vpn';
import { passwordCrackerToolModule } from './modules/passwordCracker';
import { logShredderToolModule } from './modules/logShredder';

/**
 * Load all tool modules
 * This function imports and registers all tool modules
 * 
 * To add a new tool:
 * 1. Create a new file in src/game/tools/modules/yourTool.ts
 * 2. Export a ToolModule object
 * 3. Import it here and register it
 */
export function loadToolModules(): void {
  // Clear existing modules to prevent duplicates on hot reload in development
  if (import.meta.env.DEV) {
    toolRegistry.clear();
  }

  // Register all tool modules
  toolRegistry.register(vpnToolModule);
  toolRegistry.register(passwordCrackerToolModule);
  toolRegistry.register(logShredderToolModule);

  // Initialize all modules
  toolRegistry.getAll().forEach(module => {
    if (module.onInit) {
      module.onInit().catch(console.error);
    }
  });
}

/**
 * Get all software definitions from tool modules
 */
export function getAllSoftwareFromTools() {
  return toolRegistry.getAllSoftware();
}

/**
 * Get tool duration by software ID (base duration, before difficulty multiplier)
 * For difficulty-adjusted duration, use getToolDurationFromSoftware from toolDurations.ts
 */
export function getToolDurationBySoftwareId(softwareId: string): number {
  return toolRegistry.getDurationBySoftwareId(softwareId);
}

/**
 * Get tool module by software ID
 */
export function getToolModuleBySoftwareId(softwareId: string) {
  return toolRegistry.getBySoftwareId(softwareId);
}

