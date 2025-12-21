/**
 * Manual Playwright test script for n00b-02 mission
 * Run with: node test-n00b-02-manual.js
 */

const { chromium } = require('playwright');

async function testN00b02Mission() {
  console.log('Starting browser...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    
    // Wait for terminal input
    console.log('Waiting for terminal input...');
    const input = page.locator('input[aria-label*="Terminal"], input[aria-label*="terminal"]').first();
    await input.waitFor({ timeout: 10000 });
    
    // Start new game
    console.log('Starting new game...');
    await input.fill('testuser');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    const startButton = page.getByRole('button', { name: /start new game/i });
    if (await startButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await startButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Jump to n00b-02 mission
    console.log('Jumping to n00b-02 mission...');
    await input.fill('testmission n00b-02');
    await input.press('Enter');
    await page.waitForTimeout(2000);
    
    // Check for mission start
    const missionText = page.getByText(/Data Extraction/i);
    if (await missionText.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✓ Mission started successfully');
    } else {
      console.log('✗ Mission did not start');
    }
    
    // Read email
    console.log('Reading email...');
    await input.fill('mail');
    await input.press('Enter');
    await page.waitForTimeout(1000);
    
    await input.fill('mail read 1');
    await input.press('Enter');
    await page.waitForTimeout(2000);
    
    // Connect VPN
    console.log('Connecting VPN...');
    await input.fill('vpn connect');
    await input.press('Enter');
    await page.waitForTimeout(3000); // Wait for VPN connection
    
    // Purchase Log Shredder
    console.log('Purchasing Log Shredder...');
    await input.fill('store');
    await input.press('Enter');
    await page.waitForTimeout(1000);
    
    const shredderButton = page.getByRole('button', { name: /purchase.*log.*shredder/i }).first();
    if (await shredderButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await shredderButton.click();
      await page.waitForTimeout(1000);
      console.log('✓ Log Shredder purchased');
    }
    
    // Decrypt credentials
    console.log('Decrypting credentials...');
    await input.fill('crack Documents/server-02-credentials.enc');
    await input.press('Enter');
    await page.waitForTimeout(4000); // Wait for decryption
    
    // Connect to server-02
    console.log('Connecting to server-02...');
    await input.fill('connect server-02');
    await input.press('Enter');
    await page.waitForTimeout(3000);
    
    // Extract customer data
    console.log('Extracting customer-data.txt...');
    await input.fill('cat /home/database/customers/customer-data.txt');
    await input.press('Enter');
    await page.waitForTimeout(2000);
    
    // Extract financial report
    console.log('Extracting financial-report.txt...');
    await input.fill('cat /home/database/reports/financial-report.txt');
    await input.press('Enter');
    await page.waitForTimeout(2000);
    
    // Shred logs
    console.log('Shredding access logs...');
    await input.fill('shred /home/logs/access.log');
    await input.press('Enter');
    await page.waitForTimeout(3000);
    
    // Disconnect
    console.log('Disconnecting from server...');
    await input.fill('disconnect');
    await input.press('Enter');
    await page.waitForTimeout(2000);
    
    console.log('Test completed. Check browser for any errors or issues.');
    console.log('Press any key to close browser...');
    
    // Keep browser open for inspection
    await page.waitForTimeout(60000); // Wait 60 seconds for manual inspection
    
  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
  } finally {
    await browser.close();
  }
}

testN00b02Mission().catch(console.error);

