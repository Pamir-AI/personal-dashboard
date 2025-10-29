#!/usr/bin/env node

/**
 * Product Hunt Scraper
 * Fetches trending products from Product Hunt Atom feed
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const FEED_URL = 'https://www.producthunt.com/feed';
const OUTPUT_FILE = path.join(__dirname, '../drops/producthunt.json');

async function fetchProductHunt() {
  console.log(`[${new Date().toISOString()}] 🚀 Fetching Product Hunt...`);

  try {
    // Fetch the Atom feed
    const xml = await new Promise((resolve, reject) => {
      https.get(FEED_URL, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });

    // Parse Atom entries
    const entryMatches = xml.match(/<entry>([\s\S]*?)<\/entry>/g) || [];

    const products = entryMatches.map((entry) => {
      const titleMatch = entry.match(/<title>(.*?)<\/title>/s);
      const linkMatch = entry.match(/<link[^>]*href="([^"]*)"[^>]*>/);
      const publishedMatch = entry.match(/<published>(.*?)<\/published>/s);
      const contentMatch = entry.match(/<content[^>]*>(.*?)<\/content>/s);
      const authorMatch = entry.match(/<name>(.*?)<\/name>/s);
      const idMatch = entry.match(/<id>.*Post\/(\d+)<\/id>/);

      const title = titleMatch ? titleMatch[1].trim() : 'Unknown';
      const link = linkMatch ? linkMatch[1] : '';
      const publishedDate = publishedMatch ? new Date(publishedMatch[1]).toISOString() : new Date().toISOString();

      // Clean up content (remove HTML tags)
      let description = '';
      if (contentMatch) {
        description = contentMatch[1]
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/<[^>]*>/g, '')
          .trim()
          .split('\n')[0]  // Take first line only
          .substring(0, 200);
      }

      const author = authorMatch ? authorMatch[1].trim() : 'Unknown';
      const productId = idMatch ? idMatch[1] : '';

      return {
        id: productId,
        title,
        link,
        publishedDate,
        description,
        author,
        source: 'producthunt'
      };
    });

    // Save to JSON
    const output = {
      lastUpdated: new Date().toISOString(),
      count: products.length,
      products
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

    console.log(`[${new Date().toISOString()}] ✅ Saved ${products.length} products to ${OUTPUT_FILE}`);
    return output;

  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error fetching Product Hunt:`, error.message);

    // Save error state
    const errorOutput = {
      lastUpdated: new Date().toISOString(),
      error: error.message,
      count: 0,
      products: []
    };
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(errorOutput, null, 2));

    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  fetchProductHunt()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = fetchProductHunt;
