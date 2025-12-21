import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Software, getSoftwareById } from '../inventory/inventoryTypes';
import { useCurrencyStore } from './useCurrencyStore';
import { useMissionStore } from './useMissionStore';
import { useGameSettingsStore } from './useGameSettingsStore';
import { toolRegistry } from '../tools/ToolModule';
import { applyPriceMultiplier } from '../settings/difficultyConfig';
import { createLogger } from '../../utils/logger';

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

const BASE_STORAGE = 100; // Base storage capacity

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
        return ownedIds
          .map(id => getSoftwareById(id))
          .filter((software): software is Software => software !== undefined);
      },

      getStorageUsage: () => {
        // For future implementation - track actual file system usage
        return 0;
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

