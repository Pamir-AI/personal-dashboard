#!/usr/bin/env node

/**
 * Slickdeals Scraper
 * Fetches hot deals from Slickdeals RSS feed
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const RSS_URL = 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1';
const OUTPUT_FILE = path.join(__dirname, '../drops/slickdeals.json');

async function fetchSlickdeals() {
  console.log(`[${new Date().toISOString()}] 🛍️  Fetching Slickdeals...`);

  try {
    // Fetch the RSS feed
    const xml = await new Promise((resolve, reject) => {
      https.get(RSS_URL, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });

    // Parse RSS items
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

    const deals = itemMatches.map((item) => {
      const titleMatch = item.match(/<title>(.*?)<\/title>/s);
      const linkMatch = item.match(/<link>(.*?)<\/link>/s);
      const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/s);
      const descMatch = item.match(/<description>(.*?)<\/description>/s);
      const contentMatch = item.match(/<content:encoded>(.*?)<\/content:encoded>/s);
      const creatorMatch = item.match(/<dc:creator>(.*?)<\/dc:creator>/s);

      const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : 'Unknown';
      const link = linkMatch ? linkMatch[1].trim() : '';
      const pubDate = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();

      // Clean description
      let description = '';
      if (descMatch) {
        description = descMatch[1]
          .replace(/<!\[CDATA\[|\]\]>/g, '')
          .replace(/<[^>]*>/g, '')
          .trim()
          .substring(0, 200);
      }

      // Extract image from content:encoded
      let imageUrl = null;
      if (contentMatch) {
        const content = contentMatch[1];
        const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
        if (imgMatch) {
          imageUrl = imgMatch[1].replace(/&amp;/g, '&');
        }
      }

      const author = creatorMatch ? creatorMatch[1].trim() : 'Unknown';

      return {
        title,
        link,
        pubDate,
        description,
        author,
        image: imageUrl,
        source: 'slickdeals'
      };
    });

    // Save to JSON
    const output = {
      lastUpdated: new Date().toISOString(),
      count: deals.length,
      deals
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

    console.log(`[${new Date().toISOString()}] ✅ Saved ${deals.length} deals to ${OUTPUT_FILE}`);
    return output;

  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error fetching Slickdeals:`, error.message);

    // Save error state
    const errorOutput = {
      lastUpdated: new Date().toISOString(),
      error: error.message,
      count: 0,
      deals: []
    };
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(errorOutput, null, 2));

    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  fetchSlickdeals()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = fetchSlickdeals;
