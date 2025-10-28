const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Save output to project root drops-output directory
const OUTPUT_DIR = path.join(__dirname, '../drops-output');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  console.log('\n=== HYPEBEAST - WEEKLY DROPS ===\n');

  try {
    await page.goto('https://hypebeast.com/tags/weekly-drops', {
      timeout: 60000
    });

    // Handle cookies
    try {
      const acceptBtn = await page.waitForSelector('button:has-text("Accept")', { timeout: 3000 });
      await acceptBtn.click();
      console.log('✓ Accepted cookies');
    } catch (e) {
      console.log('No cookie popup');
    }

    // Wait for content
    console.log('Waiting for content...');
    await page.waitForTimeout(5000);

    // Scroll down to load more content
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'hypebeast-final.png'), fullPage: false });

    // Extract weekly drops articles
    const articles = await page.evaluate(() => {
      const results = [];
      const seen = new Set();

      // Method 1: Find articles with headings
      const headings = document.querySelectorAll('h1, h2, h3');

      headings.forEach(heading => {
        const text = heading.textContent.trim();

        // Skip navigation and category headers
        if (text.length < 10 || text.length > 200) return;
        if (['Fashion', 'Footwear', 'Art', 'Music'].includes(text)) return;

        // Find link in or near heading
        let link = heading.querySelector('a');
        if (!link) link = heading.closest('a');
        if (!link && heading.parentElement) {
          link = heading.parentElement.querySelector('a');
        }

        if (link && link.href.includes('/2025/')) {
          const href = link.href;
          if (seen.has(href)) return;
          seen.add(href);

          // Find date
          let date = 'Unknown';
          let container = heading.parentElement;
          for (let i = 0; i < 5 && container; i++) {
            const timeEl = container.querySelector('time');
            if (timeEl) {
              date = timeEl.textContent.trim();
              break;
            }
            container = container.parentElement;
          }

          results.push({
            title: text,
            date: date,
            link: href
          });
        }
      });

      return results;
    });

    console.log(`Found ${articles.length} weekly drops articles:\n`);

    articles.forEach((article, idx) => {
      console.log(`${idx + 1}. ${article.title}`);
      console.log(`   Date: ${article.date}`);
      console.log(`   Link: ${article.link}\n`);
    });

    // Now fetch the latest article to extract the actual drops
    if (articles.length > 0) {
      console.log('\n=== EXTRACTING DROPS FROM LATEST ARTICLE ===\n');

      const latestArticle = articles[0];
      await page.goto(latestArticle.link, { timeout: 60000 });
      await page.waitForTimeout(5000);

      await page.screenshot({ path: path.join(OUTPUT_DIR, 'hypebeast-article.png'), fullPage: false });

      // Extract the actual product drops from the article
      const drops = await page.evaluate(() => {
        const products = [];
        const brands = ['Supreme', 'Palace', 'Nike', 'adidas', 'Jordan', 'Carhartt WIP', 'Pokémon', 'Pokemon', 'New Balance', 'KITH', 'Stüssy', 'Yeezy'];

        // Look for product sections (typically h2, h3, or strong tags followed by details)
        const articleContent = document.querySelector('article') || document.querySelector('.article-content') || document.querySelector('main');
        if (!articleContent) return [];

        // Get all headings and strong tags that might be product names
        const productHeaders = articleContent.querySelectorAll('h2, h3, h4, strong, b');

        productHeaders.forEach(header => {
          const headerText = header.textContent.trim();

          // Check if this looks like a product header (contains a brand name)
          const matchedBrand = brands.find(brand => headerText.includes(brand));

          if (matchedBrand && headerText.length > 10 && headerText.length < 200) {
            let price = null;
            let link = null;
            let image = null;

            // Build a product section: header + next few siblings until we hit another header or go too far
            const sectionElements = [];
            let nextEl = header.nextElementSibling;
            let collectedText = '';

            // Collect up to 5 sibling elements or until we hit another product header
            for (let i = 0; i < 5 && nextEl; i++) {
              const nextText = nextEl.textContent || '';

              // Stop if we hit another product heading
              const hasAnotherBrand = brands.some(brand => nextText.includes(brand));
              if ((nextEl.tagName === 'H2' || nextEl.tagName === 'H3' || nextEl.tagName === 'H4' || nextEl.tagName === 'STRONG') && hasAnotherBrand) {
                break;
              }

              sectionElements.push(nextEl);
              collectedText += ' ' + nextText;
              nextEl = nextEl.nextElementSibling;
            }

            // Now extract from this limited section only
            // Look for price in the collected text
            const priceMatch = collectedText.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/);
            if (priceMatch) {
              price = '$' + priceMatch[1];
            }

            // Look for links in the section elements
            for (const el of sectionElements) {
              if (!link) {
                const linkEl = el.querySelector('a[href*="http"]') || (el.tagName === 'A' ? el : null);
                if (linkEl && !linkEl.href.includes('tags/')) { // Skip tag links
                  link = linkEl.href;
                }
              }

              if (!image) {
                const imgEl = el.querySelector('img') || (el.tagName === 'IMG' ? el : null);
                if (imgEl) {
                  image = imgEl.src || imgEl.dataset.src || imgEl.getAttribute('data-src') || '';
                }
              }
            }

            // Only add if we have at least a name
            if (!products.find(p => p.name === headerText)) {
              products.push({
                name: headerText,
                brand: matchedBrand,
                price: price,
                link: link,
                image: image
              });
            }
          }
        });

        return products.slice(0, 15); // Limit to first 15
      });

      console.log(`Found ${drops.length} product drops:\n`);

      drops.forEach((drop, idx) => {
        console.log(`${idx + 1}. [${drop.brand}] ${drop.name}`);
        if (drop.price) console.log(`   Price: ${drop.price}`);
        if (drop.link) console.log(`   Link: ${drop.link}`);
        console.log('');
      });

      // Save everything (using local time)
      const output = {
        timestamp: new Date().toString(), // Local timestamp
        latestArticle: latestArticle,
        articles: articles,
        drops: drops
      };

      const outputFile = path.join(OUTPUT_DIR, 'hypebeast-drops.json');
      fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
      console.log(`\n✅ Saved to ${outputFile}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'hypebeast-error.png'), fullPage: false }).catch(() => {});
  }

  await browser.close();
})();
