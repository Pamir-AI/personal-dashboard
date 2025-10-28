/**
 * Example: Data Extraction with Retry Logic
 *
 * This example demonstrates:
 * - Extracting structured data from a page
 * - Using retry logic for flaky elements
 * - Extracting text and attributes
 * - Processing and saving data
 */

const fs = require('fs');
const { chromium } = require('playwright');
const { retryWithBackoff, extractText, extractAttributes, captureScreenshot } = require('../lib/utils.js');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const targetUrl = process.env.TARGET_URL || 'https://example.com/products';
    console.log(`📊 Extracting data from ${targetUrl}...`);

    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await captureScreenshot(page, 'page-loaded.png');

    // Extract data with retry logic
    const data = await retryWithBackoff(async () => {
      console.log('🔍 Looking for data elements...');

      // Wait for content to load
      await page.waitForSelector('.product-item, .data-row, article', { timeout: 10000 });

      // Extract product/data items
      const items = await page.$$('.product-item, .data-row, article');

      if (items.length === 0) {
        throw new Error('No data items found');
      }

      console.log(`📦 Found ${items.length} items, extracting details...`);

      const results = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        try {
          // Extract different types of data
          const title = await item.$eval('.title, h2, h3', el => el.textContent.trim())
            .catch(() => 'No title');

          const price = await item.$eval('.price, .cost', el => el.textContent.trim())
            .catch(() => 'No price');

          const description = await item.$eval('.description, p', el => el.textContent.trim())
            .catch(() => 'No description');

          const link = await item.$eval('a', el => el.href)
            .catch(() => 'No link');

          const imageUrl = await item.$eval('img', el => el.src)
            .catch(() => 'No image');

          results.push({
            index: i + 1,
            title,
            price,
            description: description.substring(0, 100), // Truncate long descriptions
            link,
            imageUrl
          });

          console.log(`  ✓ Item ${i + 1}: ${title}`);

        } catch (error) {
          console.log(`  ⚠️  Failed to extract item ${i + 1}: ${error.message}`);
        }
      }

      return results;

    }, {
      maxRetries: 3,
      initialDelay: 2000,
      onRetry: (attempt) => {
        console.log(`🔄 Retry attempt ${attempt}/3...`);
      }
    });

    console.log(`✅ Successfully extracted ${data.length} items`);

    // Alternative: Extract using utility functions
    console.log('\n🔧 Using utility functions for extraction...');

    const titles = await extractText(page, '.title, h2, h3');
    const prices = await extractText(page, '.price, .cost');
    const links = await extractAttributes(page, 'a', 'href');

    console.log(`Found ${titles.length} titles, ${prices.length} prices, ${links.length} links`);

    // Save data to JSON file
    const outputFile = 'extracted-data.json';
    const output = {
      extractedAt: new Date().toISOString(),
      url: targetUrl,
      totalItems: data.length,
      items: data,
      summary: {
        titles: titles.length,
        prices: prices.length,
        links: links.length
      }
    };

    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
    console.log(`\n💾 Data saved to ${outputFile}`);

    // Print summary
    console.log('\n📋 Summary:');
    data.slice(0, 5).forEach(item => {
      console.log(`\n  ${item.index}. ${item.title}`);
      console.log(`     Price: ${item.price}`);
      console.log(`     Link: ${item.link}`);
    });

    if (data.length > 5) {
      console.log(`\n  ... and ${data.length - 5} more items`);
    }

    console.log('\n🎉 Data extraction complete!');

  } catch (error) {
    console.error('❌ Error during data extraction:', error.message);
    await captureScreenshot(page, 'extraction-error.png');
    throw error;
  } finally {
    await browser.close();
  }
})();
