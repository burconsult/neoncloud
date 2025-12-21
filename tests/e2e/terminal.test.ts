/**
 * E2E Test for Terminal Interface
 * 
 * To run with Playwright:
 * npx playwright test tests/e2e/terminal.test.ts
 * 
 * Or use Playwright MCP tools for interactive testing
 */

import { test, expect } from '@playwright/test';

test.describe('Terminal Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should display terminal interface', async ({ page }) => {
    // Check header
    await expect(page.getByRole('heading', { name: 'NeonCloud' })).toBeVisible();
    
    // Check welcome message
    await expect(page.getByText('NeonCloud Terminal')).toBeVisible();
    await expect(page.getByText("Type 'help' to see available commands.")).toBeVisible();
    
    // Check terminal input
    const input = page.getByLabel('Terminal command input');
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();
  });

  test('should execute help command', async ({ page }) => {
    const input = page.getByLabel('Terminal command input');
    
    await input.fill('help');
    await input.press('Enter');
    
    // Wait for output
    await page.waitForTimeout(500);
    
    // Check for help output
    await expect(page.getByText('Available commands:')).toBeVisible();
    await expect(page.getByText(/echo.*Display a line of text/)).toBeVisible();
  });

  test('should execute echo command', async ({ page }) => {
    const input = page.getByLabel('Terminal command input');
    
    await input.fill('echo Hello World');
    await input.press('Enter');
    
    await page.waitForTimeout(500);
    
    await expect(page.getByText('Hello World')).toBeVisible();
  });

  test('should execute whoami command', async ({ page }) => {
    const input = page.getByLabel('Terminal command input');
    
    await input.fill('whoami');
    await input.press('Enter');
    
    await page.waitForTimeout(500);
    
    await expect(page.getByText('neoncloud-user')).toBeVisible();
  });

  test('should execute pwd command', async ({ page }) => {
    const input = page.getByLabel('Terminal command input');
    
    await input.fill('pwd');
    await input.press('Enter');
    
    await page.waitForTimeout(500);
    
    await expect(page.getByText('/home/neoncloud-user')).toBeVisible();
  });

  test('should clear terminal with clear command', async ({ page }) => {
    const input = page.getByLabel('Terminal command input');
    
    // Execute a command first
    await input.fill('echo test');
    await input.press('Enter');
    await page.waitForTimeout(300);
    
    // Clear terminal
    await input.fill('clear');
    await input.press('Enter');
    await page.waitForTimeout(300);
    
    // Welcome message should reappear
    await expect(page.getByText('NeonCloud Terminal')).toBeVisible();
  });

  test('should handle command history navigation', async ({ page }) => {
    const input = page.getByLabel('Terminal command input');
    
    // Execute multiple commands
    await input.fill('echo first');
    await input.press('Enter');
    await page.waitForTimeout(200);
    
    await input.fill('echo second');
    await input.press('Enter');
    await page.waitForTimeout(200);
    
    // Navigate history with up arrow
    await input.press('ArrowUp');
    await expect(input).toHaveValue('echo second');
    
    await input.press('ArrowUp');
    await expect(input).toHaveValue('echo first');
    
    // Navigate down
    await input.press('ArrowDown');
    await expect(input).toHaveValue('echo second');
  });

  test('should handle invalid commands', async ({ page }) => {
    const input = page.getByLabel('Terminal command input');
    
    await input.fill('invalidcommand');
    await input.press('Enter');
    
    await page.waitForTimeout(500);
    
    await expect(page.getByText(/Command not found/)).toBeVisible();
  });

  test('should display command prompt correctly', async ({ page }) => {
    // Check for prompt in output area
    await expect(page.getByText('neoncloud-user@neoncloud:~$')).toBeVisible();
  });
});

