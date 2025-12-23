import { Command, CommandResult } from '@/types';
import { useCurrencyStore } from '../state/useCurrencyStore';
import { useInventoryStore } from '../state/useInventoryStore';

export const storeCommand: Command = {
  name: 'store',
  aliases: ['shop', 'market'],
  description: 'Open the software store',
  usage: 'store [balance|inventory]',
  execute: (args: string[]): CommandResult => {
    const currencyStore = useCurrencyStore.getState();
    const inventoryStore = useInventoryStore.getState();

    if (args.length > 0) {
      const subcommand = args[0].toLowerCase();

      if (subcommand === 'balance' || subcommand === 'bal') {
        return {
          output: [
            `NeonCoin Balance: ${currencyStore.balance.toLocaleString()} NC`,
            `Total Earned: ${currencyStore.totalEarned.toLocaleString()} NC`,
            `Total Spent: ${currencyStore.totalSpent.toLocaleString()} NC`,
          ],
          success: true,
        };
      }

      if (subcommand === 'inventory' || subcommand === 'inv') {
        const ownedSoftware = inventoryStore.getOwnedSoftware();
        const storageUsage = inventoryStore.getStorageUsage();
        const storageRemaining = inventoryStore.getStorageRemaining();
        const storageCapacity = inventoryStore.storageCapacity;
        
        // Convert to TB for display (100 units = 1 TB)
        const formatStorage = (units: number): string => {
          const tb = (units / 100).toFixed(2);
          return `${tb} TB`;
        };
        
        if (ownedSoftware.length === 0) {
          return {
            output: [
              'You don\'t own any software yet. Visit the store to purchase items!',
              '',
              `Storage: ${formatStorage(storageUsage)} / ${formatStorage(storageCapacity)} used`,
              `Remaining: ${formatStorage(storageRemaining)}`,
            ],
            success: true,
          };
        }

        const output = [
          'Owned Software:',
          '',
          ...ownedSoftware.map(software => {
            const storageSize = software.storageSize !== undefined ? software.storageSize : 10;
            const storageTB = (storageSize / 100).toFixed(2);
            return `  • ${software.name} (${software.category}) - ${storageTB} TB`;
          }),
          '',
          `Storage: ${formatStorage(storageUsage)} / ${formatStorage(storageCapacity)} used`,
          `Remaining: ${formatStorage(storageRemaining)}`,
        ];

        return {
          output,
          success: true,
        };
      }

      return {
        output: `Unknown subcommand: ${subcommand}. Use 'store balance' or 'store inventory'`,
        success: false,
        error: 'Invalid subcommand',
      };
    }

    return {
      output: [
        'Software Store',
        '',
        'Use the Store button in the sidebar to browse and purchase software.',
        '',
        'Available commands:',
        '  store balance  - Show your neoncoin balance',
        '  store inventory - List your owned software',
        '',
        `Current Balance: ${currencyStore.balance.toLocaleString()} NC`,
      ],
      success: true,
    };
  },
};

