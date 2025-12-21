import { Command, CommandResult } from '@/types';
import { useLoreStore } from '../state/useLoreStore';

/**
 * Lore command - View unlocked lore entries
 */
export const loreCommand: Command = {
  name: 'lore',
  aliases: ['knowledge', 'info'],
  description: 'View unlocked lore entries about the NeonCloud world',
  usage: 'lore [category]',
  requiresUnlock: false,
  execute: (args: string[]): CommandResult => {
    const loreStore = useLoreStore.getState();
    const allEntries = loreStore.getAllEntries();

    if (allEntries.length === 0) {
      return {
        output: [
          'No lore entries unlocked yet.',
          '',
          'Lore entries are unlocked as you progress through missions.',
          'Complete missions to discover more about the NeonCloud world.',
        ],
        success: true,
      };
    }

    // If category is specified, filter by category
    if (args.length > 0 && args[0]) {
      const categoryInput = args[0].toLowerCase();
      const validCategories: Array<'world' | 'organization' | 'technology' | 'mission' | 'character'> = 
        ['world', 'organization', 'technology', 'mission', 'character'];
      
      if (!validCategories.includes(categoryInput as any)) {
        return {
          output: [
            `Invalid category: ${categoryInput}`,
            '',
            'Available categories: world, organization, technology, mission, character',
          ],
          success: false,
          error: 'Invalid category',
        };
      }
      
      const category = categoryInput as 'world' | 'organization' | 'technology' | 'mission' | 'character';
      const categoryEntries = loreStore.getEntriesByCategory(category);

      if (categoryEntries.length === 0) {
        return {
          output: [
            `No lore entries found for category: ${category}`,
            '',
            'Available categories: world, organization, technology, mission, character',
          ],
          success: false,
          error: 'Category not found',
        };
      }

      const output: string[] = [
        `Lore Entries - ${category.charAt(0).toUpperCase() + category.slice(1)}`,
        '',
        '─'.repeat(70),
      ];

      categoryEntries.forEach((entry) => {
        output.push(`\n[${entry.title}]`);
        output.push('─'.repeat(70));
        output.push(entry.content);
        output.push('');
      });

      return {
        output,
        success: true,
      };
    }

    // Show all entries grouped by category
    const categories: Array<'world' | 'organization' | 'technology' | 'mission' | 'character'> = 
      ['world', 'organization', 'technology', 'mission', 'character'];
    
    const output: string[] = [
      'NeonCloud Lore Database',
      `${allEntries.length} entry(ies) unlocked`,
      '',
      '─'.repeat(70),
    ];

    categories.forEach((category) => {
      const categoryEntries = loreStore.getEntriesByCategory(category);
      if (categoryEntries.length > 0) {
        output.push(`\n[${category.charAt(0).toUpperCase() + category.slice(1)}]`);
        output.push('─'.repeat(70));
        categoryEntries.forEach((entry) => {
          output.push(`\n${entry.title}`);
          output.push(entry.content);
          output.push('');
        });
      }
    });

    output.push('─'.repeat(70));
    output.push('');
    output.push('Use "lore <category>" to view entries by category.');
    output.push('Categories: world, organization, technology, mission, character');

    return {
      output,
      success: true,
    };
  },
};

