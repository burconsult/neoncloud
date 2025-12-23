import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Software, getSoftwareById } from '../inventory/inventoryTypes';
import { useCurrencyStore } from './useCurrencyStore';
import { useMissionStore } from './useMissionStore';
import { useGameSettingsStore } from './useGameSettingsStore';
import { useFileSystemStore } from './useFileSystemStore';
import { toolRegistry } from '../tools/ToolModule';
import { applyPriceMultiplier } from '../settings/difficultyConfig';
import { createLogger } from '../../utils/logger';
import { FileSystem, File } from '@/types';

/**
 * Default files that are part of the base system and shouldn't count toward storage
 * These are tutorial/reference files that come with the OS
 */
const DEFAULT_SYSTEM_FILES = new Set([
  'README.txt',
  'mission-01.txt',
  'network-diagram.txt',
  '.hidden',
]);

/**
 * Calculate storage used by files in the file system
 * File size is calculated as: content length (bytes) / 10 (rounded up)
 * Default system files (tutorial files) are excluded from storage calculation
 * This gives us a reasonable storage unit measurement
 */
function calculateFileSystemStorage(fileSystem: FileSystem): number {
  let totalStorage = 0;
  
  function traverseDirectory(fs: FileSystem): void {
    for (const key in fs) {
      const item = fs[key];
      if (item.type === 'file') {
        const file = item as File;
        // Skip default system files (they're part of the OS/base system)
        if (DEFAULT_SYSTEM_FILES.has(file.name)) {
          continue;
        }
        // Calculate storage: content length / 10 (minimum 1 unit)
        const fileSize = Math.max(1, Math.ceil(file.content.length / 10));
        totalStorage += fileSize;
      } else if (item.type === 'directory' && item.children) {
        traverseDirectory(item.children);
      }
    }
  }
  
  traverseDirectory(fileSystem);
  return totalStorage;
}

const logger = createLogger('Inventory');

interface InventoryState {
  ownedSoftware: string[]; // Array of software IDs
  storageCapacity: number; // Base storage + upgrades
  baseStorageCapacity: number;
  
  // Actions
  purchaseSoftware: (softwareId: string) => boolean;
  ownsSoftware: (softwareId: string) => boolean;
  getOwnedSoftware: () => Software[];
  getStorageUsage: () => number; // For future use
  getStorageRemaining: () => number;
  reset: () => void;
}

const BASE_STORAGE = 100; // Base storage capacity (1 TB = 100 units internally)
const OS_STORAGE = 30; // OS takes 0.3 TB (30 units), leaving 0.7 TB (70 units) available for tools

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      ownedSoftware: [],
      storageCapacity: BASE_STORAGE,
      baseStorageCapacity: BASE_STORAGE,

      purchaseSoftware: (softwareId: string) => {
        // Try tool modules first (new system)
        let software: Software | undefined;
        const toolModule = toolRegistry.getBySoftwareId(softwareId);
        if (toolModule) {
          // Extract the software definition from the module
          if (toolModule.software && toolModule.software.id === softwareId) {
            software = toolModule.software;
          } else if (toolModule.basicSoftware && toolModule.basicSoftware.id === softwareId) {
            software = toolModule.basicSoftware;
          } else if (toolModule.premiumSoftware && toolModule.premiumSoftware.id === softwareId) {
            software = toolModule.premiumSoftware;
          }
        }
        
        // Fall back to legacy catalog (for storage/analysis tools not yet migrated)
        if (!software) {
          software = getSoftwareById(softwareId);
        }
        
        if (!software) return false;

        // Check if already owned
        if (get().ownsSoftware(softwareId)) {
          return false;
        }

        // Check storage space (only for tools that take storage, not upgrades)
        const storageSize = software.storageSize !== undefined ? software.storageSize : 10; // Default 10 if not specified
        if (storageSize > 0) {
          const currentUsage = get().getStorageUsage();
          const storageRemaining = get().storageCapacity - currentUsage;
          
          if (storageRemaining < storageSize) {
            logger.warn(`Insufficient storage: need ${storageSize} units, have ${storageRemaining} remaining`);
            return false;
          }
        }

        // Check vendor access requirements
        // Note: Currently only logs, full validation can be added later
        // For now, vendorId is primarily for organization/reference
        if (toolModule?.vendorId && toolModule.vendorId !== 'neoncloud') {
          // TODO: Implement full vendor access requirement checking
          // This would require async imports and more complex validation
          logger.debug(`Tool ${softwareId} is sold by vendor: ${toolModule.vendorId}`);
        }
        
        // Apply difficulty multiplier to price
        const difficulty = useGameSettingsStore.getState().difficulty;
        let adjustedPrice = applyPriceMultiplier(software.price, difficulty);
        
        // Check if can afford (using adjusted price)
        const currencyStore = useCurrencyStore.getState();
        if (!currencyStore.canAfford(adjustedPrice)) {
          return false;
        }

        // Purchase (using adjusted price)
        const purchased = currencyStore.spend(
          adjustedPrice,
          `Purchased ${software.name}`,
          'purchase'
        );

        if (!purchased) return false;

        // Add to inventory
        set((state) => ({
          ownedSoftware: [...state.ownedSoftware, softwareId],
        }));

        // Apply storage upgrade if applicable
        if (software.effects?.increaseStorage) {
          set((state) => ({
            storageCapacity: state.storageCapacity + software.effects!.increaseStorage!,
          }));
        }

        // Check if this purchase completes any mission tasks
        const missionStore = useMissionStore.getState();
        const currentMission = missionStore.currentMission;

        if (currentMission) {
          // Get purchase task mapping from mission module (dynamic import to avoid circular deps)
          import('../missions/MissionModule').then(({ missionRegistry }) => {
            const missionModule = missionRegistry.get(currentMission.id);
            const taskId = missionModule?.purchaseTaskMapping?.[softwareId];

            if (taskId) {
              // Check if this task hasn't been completed yet
              if (!missionStore.isTaskCompleted(currentMission.id, taskId)) {
                missionStore.completeTask(currentMission.id, taskId);
              }
            }
          }).catch(() => {
            // Silently fail if mission registry not available
          });
        }

        return true;
      },

      ownsSoftware: (softwareId: string) => {
        return get().ownedSoftware.includes(softwareId);
      },

      getOwnedSoftware: () => {
        const ownedIds = get().ownedSoftware;
        const softwareList: Software[] = [];
        
        ownedIds.forEach(id => {
          // First check tool modules (tools like VPN, password cracker, etc.)
          const toolModule = toolRegistry.getBySoftwareId(id);
          if (toolModule) {
            let software: Software | undefined;
            if (toolModule.software && toolModule.software.id === id) {
              software = toolModule.software;
            } else if (toolModule.basicSoftware && toolModule.basicSoftware.id === id) {
              software = toolModule.basicSoftware;
            } else if (toolModule.premiumSoftware && toolModule.premiumSoftware.id === id) {
              software = toolModule.premiumSoftware;
            }
            if (software) {
              softwareList.push(software);
              return; // Found in tool modules, skip legacy catalog
            }
          }
          
          // Fall back to legacy catalog (storage upgrades, etc.)
          const catalogSoftware = getSoftwareById(id);
          if (catalogSoftware) {
            softwareList.push(catalogSoftware);
          }
        });
        
        return softwareList;
      },

      getStorageUsage: () => {
        // OS always takes 0.3 TB (30 units)
        let totalStorage = OS_STORAGE;
        
        // Calculate storage used by owned software (tools)
        const ownedIds = get().ownedSoftware;
        let toolStorage = 0;
        
        ownedIds.forEach(softwareId => {
          // Check tool modules first
          const toolModule = toolRegistry.getBySoftwareId(softwareId);
          if (toolModule) {
            let software: Software | undefined;
            if (toolModule.software && toolModule.software.id === softwareId) {
              software = toolModule.software;
            } else if (toolModule.basicSoftware && toolModule.basicSoftware.id === softwareId) {
              software = toolModule.basicSoftware;
            } else if (toolModule.premiumSoftware && toolModule.premiumSoftware.id === softwareId) {
              software = toolModule.premiumSoftware;
            }
            
            if (software?.storageSize !== undefined) {
              toolStorage += software.storageSize;
            } else {
              // Default storage size if not specified
              toolStorage += 10;
            }
          } else {
            // Check legacy catalog (storage upgrades don't take space - storageSize: 0)
            const catalogSoftware = getSoftwareById(softwareId);
            if (catalogSoftware?.storageSize !== undefined && catalogSoftware.storageSize > 0) {
              toolStorage += catalogSoftware.storageSize;
            }
          }
        });
        
        // Calculate storage used by files in file system
        // Access file system store directly (stores can access each other)
        try {
          const fileSystemStore = useFileSystemStore.getState();
          const fileSystem = fileSystemStore.getActiveFileSystem();
          
          const fileStorage = calculateFileSystemStorage(fileSystem);
          return totalStorage + toolStorage + fileStorage;
        } catch (error) {
          // If file system store not available (during initialization), just return OS + tool storage
          return totalStorage + toolStorage;
        }
      },

      getStorageRemaining: () => {
        return get().storageCapacity - get().getStorageUsage();
      },

      reset: () => {
        set({
          ownedSoftware: [],
          storageCapacity: BASE_STORAGE,
          baseStorageCapacity: BASE_STORAGE,
        });
      },
    }),
    {
      name: 'neoncloud-inventory',
      partialize: (state) => ({
        ownedSoftware: state.ownedSoftware,
        storageCapacity: state.storageCapacity,
        baseStorageCapacity: state.baseStorageCapacity,
      }),
    }
  )
);

