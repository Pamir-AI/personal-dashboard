/**
 * Example: Form Submission with Screenshots
 *
 * This example demonstrates:
 * - Multi-step form filling
 * - Different input types (text, select, checkbox)
 * - Human-like typing delays
 * - Screenshot capture at each step
 * - Error handling
 */

const { chromium } = require('playwright');
const { humanType, safeClick, captureScreenshot } = require('../lib/utils.js');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('📝 Starting form submission automation...');

    // Navigate to form
    const formUrl = process.env.FORM_URL || 'https://example.com/form';
    await page.goto(formUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await captureScreenshot(page, 'screenshots/step-1-form-loaded.png');

    console.log('✏️  Filling out form...');

    // Fill text inputs with human-like typing
    await humanType(page, '#firstName', 'John', { delay: 80 });
    await humanType(page, '#lastName', 'Doe', { delay: 75 });
    await humanType(page, '#email', 'john.doe@example.com', { delay: 60 });
    await humanType(page, '#phone', '555-1234', { delay: 90 });

    await captureScreenshot(page, 'screenshots/step-2-basic-info.png');

    // Fill textarea
    const message = 'This is an automated message sent via Playwright.';
    await humanType(page, '#message', message, { delay: 50 });

    // Select dropdown
    await page.selectOption('#country', 'US');
    await page.selectOption('#state', 'CA');

    await captureScreenshot(page, 'screenshots/step-3-location.png');

    // Check checkboxes
    await page.check('#terms');
    await page.check('#newsletter');

    // Select radio button
    await page.check('input[name="contact-method"][value="email"]');

    await captureScreenshot(page, 'screenshots/step-4-preferences.png');

    console.log('📸 Form filled, capturing final state...');
    await captureScreenshot(page, 'screenshots/step-5-before-submit.png');

    // Submit the form
    console.log('🚀 Submitting form...');
    await safeClick(page, 'button[type="submit"]', { retries: 3, timeout: 10000 });

    // Wait for success message or redirect
    try {
      await page.waitForSelector('.success-message, .confirmation', { timeout: 15000 });
      console.log('✅ Form submitted successfully!');
      await captureScreenshot(page, 'screenshots/step-6-success.png');
    } catch (error) {
      console.log('⚠️  No success message found, checking URL...');
      if (page.url().includes('success') || page.url().includes('thank-you')) {
        console.log('✅ Redirected to success page!');
        await captureScreenshot(page, 'screenshots/step-6-success-redirect.png');
      } else {
        throw new Error('Form submission may have failed');
      }
    }

    console.log('🎉 Automation complete!');

  } catch (error) {
    console.error('❌ Error during form submission:', error.message);
    await captureScreenshot(page, 'screenshots/error.png');
    throw error;
  } finally {
    await browser.close();
  }
})();
