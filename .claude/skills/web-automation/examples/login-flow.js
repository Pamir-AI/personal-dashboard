/**
 * Example: Login Flow Automation with Session Persistence
 *
 * This example demonstrates:
 * - Using stealth mode to avoid bot detection
 * - Session persistence with cookies
 * - Human-like typing
 * - Safe click with retries
 * - Screenshot capture
 */

require('dotenv').config();
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const { saveCookies, loadCookies, humanType, safeClick, captureScreenshot } = require('../lib/utils.js');

// Enable stealth mode
chromium.use(stealth);

(async () => {
  const browser = await chromium.launch({
    headless: false, // Set to true for background execution
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  try {
    const loginUrl = process.env.LOGIN_URL || 'https://example.com/login';
    const dashboardUrl = process.env.DASHBOARD_URL || 'https://example.com/dashboard';
    const sessionFile = 'session-cookies.json';

    // Try to load saved session
    const hasCookies = await loadCookies(context, sessionFile);

    if (hasCookies) {
      console.log('🔑 Using saved session, navigating to dashboard...');
      await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // Check if still logged in
      if (page.url().includes('login')) {
        console.log('🔄 Session expired, need to login again');
        // Fall through to login
      } else {
        console.log('✅ Successfully accessed dashboard with saved session!');
        await captureScreenshot(page, 'dashboard.png');
        return; // Exit, we're done
      }
    }

    // Need to login
    console.log('🏠 Navigating to login page...');
    await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await captureScreenshot(page, 'login-page.png');

    console.log('🔐 Logging in...');

    // Fill login form with human-like typing
    await humanType(page, '#email', process.env.LOGIN_EMAIL || 'user@example.com', { delay: 80 });
    await humanType(page, '#password', process.env.LOGIN_PASSWORD || 'password123', { delay: 70 });

    // Click submit button with retry logic
    await safeClick(page, 'button[type="submit"]', { retries: 3, timeout: 10000 });

    // Wait for navigation after login
    await page.waitForTimeout(3000);

    // Check if login was successful
    if (page.url().includes('login')) {
      console.error('❌ Login failed - still on login page');
      await captureScreenshot(page, 'login-failed.png');
      process.exit(1);
    }

    console.log('✅ Login successful!');

    // Save session for next time
    await saveCookies(context, sessionFile);

    // Navigate to dashboard
    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });
    await captureScreenshot(page, 'dashboard.png');

    console.log('🎉 Automation complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await captureScreenshot(page, 'error.png');
    throw error;
  } finally {
    await browser.close();
  }
})();
