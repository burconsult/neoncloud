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
import { networkScannerToolModule } from './modules/networkScanner';

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
  toolRegistry.register(networkScannerToolModule);

  // Initialize all modules
  toolRegistry.getAll().forEach(module => {
    if (module.onInit) {
      const initResult = module.onInit();
      if (initResult && typeof initResult.catch === 'function') {
        initResult.catch(console.error);
      }
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
 * Get upgrade path mapping for tools (premium -> basic)
 * This allows the UI to check if a premium version requires a basic version
 */
export function getToolUpgradePaths(): Record<string, string> {
  const upgradePaths: Record<string, string> = {};
  
  toolRegistry.getAll().forEach(module => {
    // If tool has both basic and premium versions, map premium -> basic
    if (module.basicSoftware && module.premiumSoftware) {
      upgradePaths[module.premiumSoftware.id] = module.basicSoftware.id;
    }
  });
  
  return upgradePaths;
}

/**
 * Get tool duration by software ID
 * Returns difficulty-adjusted duration in real-time seconds
 */
export function getToolDurationBySoftwareId(softwareId: string): number {
  // Get base duration from tool registry
  const baseDuration = toolRegistry.getDurationBySoftwareId(softwareId);
  
  // Apply difficulty multiplier
  // Use dynamic import to avoid circular dependencies
  return import('../state/useGameSettingsStore').then(({ useGameSettingsStore }) => {
    return import('../settings/difficultyConfig').then(({ applyDurationMultiplier }) => {
      const difficulty = useGameSettingsStore.getState().difficulty;
      return applyDurationMultiplier(baseDuration, difficulty);
    });
  }).then(result => result) as unknown as number; // For now, return base duration
  // TODO: Make this async or handle differently
}

// Simpler version that returns base duration (difficulty is applied in tool modules)
export function getToolDurationBySoftwareIdSync(softwareId: string): number {
  return toolRegistry.getDurationBySoftwareId(softwareId);
}

/**
 * Get tool module by software ID
 */
export function getToolModuleBySoftwareId(softwareId: string) {
  return toolRegistry.getBySoftwareId(softwareId);
}

