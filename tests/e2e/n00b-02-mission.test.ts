/**
 * E2E Test for n00b-02 Mission (Data Extraction)
 * 
 * Tests the complete mission flow:
 * 1. Jump to mission using testmission command
 * 2. Read email
 * 3. Connect VPN
 * 4. Purchase Log Shredder
 * 5. Decrypt credentials
 * 6. Connect to server-02
 * 7. Extract customer-data.txt
 * 8. Extract financial-report.txt
 * 9. Shred access logs
 * 10. Disconnect
 */

import { test, expect } from '@playwright/test';

test.describe('n00b-02 Mission: Data Extraction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="terminal-input"], input[aria-label*="Terminal"]', { timeout: 10000 });
  });

  test('should complete n00b-02 mission successfully', async ({ page }) => {
    const input = page.getByLabel(/terminal.*input/i).first();
    
    // Step 1: Start new game with username
    await input.fill('testuser');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    // Click "Start New Game" button
    const startButton = page.getByRole('button', { name: /start new game/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(1000);
    }

    // Step 2: Jump to n00b-02 mission using testmission command
    await input.fill('testmission n00b-02');
    await input.press('Enter');
    await page.waitForTimeout(1000);
    
    // Verify mission started
    await expect(page.getByText(/Data Extraction.*Server-02/i)).toBeVisible({ timeout: 5000 });

    // Step 3: Read the contract email (task-1)
    await input.fill('mail');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    await input.fill('mail read 1');
    await input.press('Enter');
    await page.waitForTimeout(1000);
    
    // Verify email was read (should show email content)
    await expect(page.getByText(/Contract Assignment.*Server-02/i)).toBeVisible({ timeout: 5000 });

    // Step 4: Connect to VPN (task-2)
    // First purchase VPN if needed
    await input.fill('store');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    // Purchase Basic VPN if not owned
    const vpnButton = page.getByRole('button', { name: /purchase.*basic.*vpn/i }).first();
    if (await vpnButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await vpnButton.click();
      await page.waitForTimeout(500);
    }
    
    // Close store and connect VPN
    await input.fill('vpn connect');
    await input.press('Enter');
    await page.waitForTimeout(2000); // Wait for VPN connection animation

    // Step 5: Purchase Log Shredder (task-3)
    await input.fill('store');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    const shredderButton = page.getByRole('button', { name: /purchase.*log.*shredder/i }).first();
    if (await shredderButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await shredderButton.click();
      await page.waitForTimeout(500);
    }

    // Step 6: Decrypt server-02 credentials (task-4)
    await input.fill('ls Documents');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    await input.fill('crack Documents/server-02-credentials.enc');
    await input.press('Enter');
    await page.waitForTimeout(3000); // Wait for decryption (takes time)

    // Step 7: Connect to server-02 (task-5)
    await input.fill('connect server-02');
    await input.press('Enter');
    await page.waitForTimeout(2000); // Wait for connection

    // Step 8: Extract customer-data.txt (task-6)
    await input.fill('cat /home/database/customers/customer-data.txt');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    // Verify file content is shown
    await expect(page.getByText(/customer.*data/i)).toBeVisible({ timeout: 5000 });

    // Step 9: Extract financial-report.txt (task-7)
    await input.fill('cat /home/database/reports/financial-report.txt');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    // Verify file content is shown
    await expect(page.getByText(/financial.*report/i)).toBeVisible({ timeout: 5000 });

    // Step 10: Shred access logs (task-8)
    await input.fill('shred /home/logs/access.log');
    await input.press('Enter');
    await page.waitForTimeout(2000); // Wait for shredding

    // Step 11: Disconnect from server-02 (task-9)
    await input.fill('disconnect');
    await input.press('Enter');
    await page.waitForTimeout(1000);

    // Verify mission completion (all tasks should be checked)
    // Check mission panel for completion status
    const missionPanel = page.locator('[data-testid="mission-panel"], .mission-panel').first();
    if (await missionPanel.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(missionPanel.getByText(/n00b-02/i)).toBeVisible();
    }
  });
});

