/**
 * Anti-Detection Example - Production-Ready Bot Protection Bypass
 *
 * Demonstrates all HIGH PRIORITY anti-detection techniques:
 * - Random delays (no fixed timing)
 * - Human-like mouse movements
 * - Intelligent Cloudflare handling with smart polling
 * - Block tracking and analytics
 *
 * Usage:
 *   node examples/anti-detection.js
 *
 * Based on production learnings from tockstalk-playwright bot
 */

const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const {
  saveCookies,
  loadCookies,
  humanClick,
  humanType,
  randomDelay,
  detectCloudflare,
  getCloudflareBlocks,
  captureScreenshot
} = require('../lib/utils.js');

// Enable stealth mode
chromium.use(stealth);

async function main() {
  const browser = await chromium.launch({
    headless: false, // Visible for debugging
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  try {
    // Load saved session if exists
    const hasCookies = await loadCookies(context, 'session.json');

    if (!hasCookies) {
      console.log('🔑 No saved session, performing login...');

      // Navigate to login page
      await page.goto('https://example.com/login', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });

      // Random delay before typing (human hesitation)
      await page.waitForTimeout(randomDelay(1000, 2000));

      // Check for Cloudflare on login page
      await detectCloudflare(page, context, 'login page', {
        maxWaitSeconds: 90,
        cookiePath: 'session.json'
      });

      // Human-like typing (not instant fill)
      await humanType(page, '#email', 'user@example.com', { delay: 80 });

      // Random pause between fields
      await page.waitForTimeout(randomDelay(500, 1200));

      await humanType(page, '#password', 'password123', { delay: 70 });

      // Random pause before submit
      await page.waitForTimeout(randomDelay(800, 1500));

      // Human-like click with mouse movement
      await humanClick(page, 'button[type="submit"]');

      // Wait for navigation
      await page.waitForNavigation({ timeout: 15000 });

      // Save session for future runs
      await saveCookies(context, 'session.json');
      console.log('✅ Login successful, session saved!');

    } else {
      console.log('🔑 Using saved session');
    }

    // Navigate to protected page
    await page.goto('https://example.com/dashboard', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Random delay after page load
    await page.waitForTimeout(randomDelay(1500, 2500));

    // Check for Cloudflare on protected page
    await detectCloudflare(page, context, 'dashboard', {
      maxWaitSeconds: 90,
      cookiePath: 'session.json'
    });

    // Interact with page using human-like behavior
    console.log('📋 Extracting data from dashboard...');

    // Random delay before interaction
    await page.waitForTimeout(randomDelay(1000, 2000));

    // Human-like click on tab/button
    await humanClick(page, '.tab-button');

    // Wait with random delay
    await page.waitForTimeout(randomDelay(1500, 2500));

    // Extract data
    const data = await page.$$eval('.data-row', rows =>
      rows.map(row => row.textContent.trim())
    );

    console.log('✅ Data extracted:', data.slice(0, 3), '...');

    // Screenshot success state
    await captureScreenshot(page, 'success.png');

    // Show Cloudflare block statistics
    const blocks = getCloudflareBlocks();
    console.log('\n📊 Cloudflare Block Statistics:');
    console.log(`   Consecutive blocks: ${blocks.consecutive}`);
    console.log(`   Total blocks: ${blocks.total}`);
    console.log(`   Success rate: ${((1 - blocks.total / (blocks.history.length || 1)) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await captureScreenshot(page, 'error.png');
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
