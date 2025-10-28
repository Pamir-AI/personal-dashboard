/**
 * Example: Handling Cloudflare Challenges
 *
 * This example demonstrates:
 * - Detecting Cloudflare bot protection
 * - Waiting for manual challenge solving
 * - Continuing automation after resolution
 * - Screenshot capture for debugging
 */

const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const { detectCloudflare, waitForCloudflareResolution, captureScreenshot } = require('../lib/utils.js');

// Enable stealth mode to reduce detection
chromium.use(stealth);

(async () => {
  const browser = await chromium.launch({
    headless: false, // Must be visible for manual challenge solving
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  try {
    const targetUrl = process.env.TARGET_URL || 'https://example.com';
    console.log(`🌐 Navigating to ${targetUrl}...`);

    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Check for Cloudflare challenge
    const hasCloudflare = await detectCloudflare(page);

    if (hasCloudflare) {
      console.log('🤖 Cloudflare challenge detected!');

      // Wait for manual solving (or automatic bypass if stealth works)
      const resolved = await waitForCloudflareResolution(page, {
        maxWait: 60000, // Wait up to 60 seconds
        checkInterval: 2000 // Check every 2 seconds
      });

      if (!resolved) {
        console.error('❌ Failed to pass Cloudflare challenge');
        process.exit(1);
      }

      console.log('✅ Cloudflare challenge passed!');
    } else {
      console.log('✅ No Cloudflare challenge detected');
    }

    // Continue with normal automation
    await page.waitForTimeout(2000);
    await captureScreenshot(page, 'after-cloudflare.png');

    console.log('🔍 Proceeding with automation...');

    // Example: Extract page title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);

    // Example: Count links
    const linkCount = await page.$$eval('a', links => links.length);
    console.log(`🔗 Found ${linkCount} links on the page`);

    // Example: Extract headings
    const headings = await page.$$eval('h1, h2, h3', headers =>
      headers.map(h => ({ tag: h.tagName, text: h.textContent.trim() }))
    );

    console.log('\n📋 Headings found:');
    headings.slice(0, 10).forEach((h, i) => {
      console.log(`  ${i + 1}. ${h.tag}: ${h.text}`);
    });

    await captureScreenshot(page, 'final-state.png');

    console.log('\n🎉 Automation complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await captureScreenshot(page, 'error.png');
    throw error;
  } finally {
    await browser.close();
  }
})();
