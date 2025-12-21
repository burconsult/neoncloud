/**
 * Debug Test for n00b-02 Mission
 * This test walks through the mission step by step to identify issues
 */

import { test, expect } from '@playwright/test';

test.describe('n00b-02 Mission Debug Test', () => {
  test.use({ browserName: 'chromium' });
  
  test('walk through mission and check for issues', async ({ page }) => {
    // Navigate to game
    await page.goto('http://localhost:5173');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find terminal input
    const input = page.locator('input[aria-label*="Terminal"], input[aria-label*="terminal"], textarea[aria-label*="Terminal"]').first();
    await input.waitFor({ timeout: 10000 });
    
    // Start new game
    await input.fill('testuser');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    // Click start button if visible
    const startButton = page.getByRole('button', { name: /start new game/i });
    if (await startButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await startButton.click();
      await page.waitForTimeout(1500);
    }
    
    // Jump to mission
    console.log('Jumping to n00b-02 mission...');
    await input.fill('testmission n00b-02');
    await input.press('Enter');
    await page.waitForTimeout(2000);
    
    // Check mission started
    const missionTitle = page.getByText(/Data Extraction.*Server-02/i);
    await expect(missionTitle).toBeVisible({ timeout: 5000 });
    console.log('✓ Mission started');
    
    // Read email (task-1)
    console.log('Task 1: Reading email...');
    await input.fill('mail');
    await input.press('Enter');
    await page.waitForTimeout(1000);
    
    await input.fill('mail read 1');
    await input.press('Enter');
    await page.waitForTimeout(2000);
    
    // Check if email was read (look for email content)
    const emailContent = page.getByText(/Contract Assignment.*Server-02/i);
    await expect(emailContent).toBeVisible({ timeout: 5000 });
    console.log('✓ Email read');
    
    // Connect VPN (task-2)
    console.log('Task 2: Connecting VPN...');
    await input.fill('vpn connect');
    await input.press('Enter');
    await page.waitForTimeout(3000); // Wait for VPN connection animation
    
    // Check VPN connected
    const vpnConnected = page.getByText(/Connected.*VPN/i);
    await expect(vpnConnected).toBeVisible({ timeout: 5000 });
    console.log('✓ VPN connected');
    
    // Purchase Log Shredder (task-3)
    console.log('Task 3: Purchasing Log Shredder...');
    await input.fill('store');
    await input.press('Enter');
    await page.waitForTimeout(1500);
    
    // Look for Log Shredder purchase button
    const shredderPurchase = page.getByRole('button', { name: /purchase.*log.*shredder/i }).first();
    if (await shredderPurchase.isVisible({ timeout: 3000 }).catch(() => false)) {
      await shredderPurchase.click();
      await page.waitForTimeout(1500);
      console.log('✓ Log Shredder purchased');
    } else {
      console.log('⚠ Log Shredder button not found or already owned');
    }
    
    // Decrypt credentials (task-4)
    console.log('Task 4: Decrypting credentials...');
    await input.fill('ls Documents');
    await input.press('Enter');
    await page.waitForTimeout(1000);
    
    await input.fill('crack Documents/server-02-credentials.enc');
    await input.press('Enter');
    await page.waitForTimeout(5000); // Wait for decryption (takes time)
    
    // Check for decryption success
    const decryptedFile = page.getByText(/server-02-credentials\.txt/i);
    await expect(decryptedFile).toBeVisible({ timeout: 5000 });
    console.log('✓ Credentials decrypted');
    
    // Connect to server-02 (task-5)
    console.log('Task 5: Connecting to server-02...');
    await input.fill('connect server-02');
    await input.press('Enter');
    await page.waitForTimeout(3000);
    
    // Check connection (prompt should change)
    const serverPrompt = page.getByText(/admin@server-02/i);
    await expect(serverPrompt).toBeVisible({ timeout: 5000 });
    console.log('✓ Connected to server-02');
    
    // Extract customer data (task-6)
    console.log('Task 6: Extracting customer-data.txt...');
    await input.fill('cat /home/database/customers/customer-data.txt');
    await input.press('Enter');
    await page.waitForTimeout(2000);
    
    // Check for file content
    const customerData = page.getByText(/CUSTOMER DATABASE/i);
    await expect(customerData).toBeVisible({ timeout: 5000 });
    console.log('✓ Customer data extracted');
    
    // Extract financial report (task-7)
    console.log('Task 7: Extracting financial-report.txt...');
    await input.fill('cat /home/database/reports/financial-report.txt');
    await input.press('Enter');
    await page.waitForTimeout(2000);
    
    // Check for file content
    const financialReport = page.getByText(/FINANCIAL REPORT/i);
    await expect(financialReport).toBeVisible({ timeout: 5000 });
    console.log('✓ Financial report extracted');
    
    // Shred logs (task-8)
    console.log('Task 8: Shredding access logs...');
    await input.fill('shred /home/logs/access.log');
    await input.press('Enter');
    await page.waitForTimeout(3000);
    
    // Check for shredding success
    const shredSuccess = page.getByText(/Successfully shredded/i);
    await expect(shredSuccess).toBeVisible({ timeout: 5000 });
    console.log('✓ Logs shredded');
    
    // Disconnect (task-9)
    console.log('Task 9: Disconnecting from server...');
    await input.fill('disconnect');
    await input.press('Enter');
    await page.waitForTimeout(2000);
    
    // Check disconnection
    const disconnected = page.getByText(/Disconnected from server-02/i);
    await expect(disconnected).toBeVisible({ timeout: 5000 });
    console.log('✓ Disconnected');
    
    // Take a screenshot for inspection
    await page.screenshot({ path: 'n00b-02-test-result.png', fullPage: true });
    console.log('✓ Screenshot saved as n00b-02-test-result.png');
    
    // Check mission panel for task completion status
    const missionPanel = page.locator('[data-testid="mission-panel"], .mission-panel').first();
    if (await missionPanel.isVisible({ timeout: 2000 }).catch(() => false)) {
      const missionStatus = await missionPanel.textContent();
      console.log('Mission Panel Status:', missionStatus?.substring(0, 200));
    }
    
    console.log('✓ All tasks completed. Check browser console for any errors.');
  });
});

