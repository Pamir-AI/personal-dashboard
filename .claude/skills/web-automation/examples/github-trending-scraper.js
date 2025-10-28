const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const { captureScreenshot } = require('../lib/utils.js');
const fs = require('fs');
const path = require('path');

chromium.use(stealth);

const OUTPUT_DIR = path.join(__dirname, '../../../../drops-output');
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

  console.log('\n=== GITHUB - TRENDING REPOSITORIES (TODAY) ===\n');

  try {
    await page.goto('https://github.com/trending?since=daily', {
      timeout: 60000
    });

    await page.waitForTimeout(3000);
    await captureScreenshot(page, path.join(OUTPUT_DIR, 'github-trending.png'));

    // Extract trending repositories
    const repos = await page.evaluate(() => {
      const results = [];
      const articles = document.querySelectorAll('article.Box-row');

      articles.forEach((article, idx) => {
        if (idx >= 25) return; // Get top 25 repos

        // Get repo name and link
        const titleEl = article.querySelector('h2 a');
        if (!titleEl) return;

        const repoFullName = titleEl.getAttribute('href').replace('/', '');
        const repoUrl = 'https://github.com' + titleEl.getAttribute('href');

        // Get description
        const descEl = article.querySelector('p');
        const description = descEl ? descEl.textContent.trim() : '';

        // Get language
        const langEl = article.querySelector('[itemprop="programmingLanguage"]');
        const language = langEl ? langEl.textContent.trim() : null;

        // Get stars today
        const starsEl = article.querySelector('.float-sm-right');
        let starsToday = null;
        if (starsEl) {
          const match = starsEl.textContent.match(/(\d+(?:,\d+)*)\s*stars today/);
          if (match) {
            starsToday = parseInt(match[1].replace(/,/g, ''));
          }
        }

        // Get total stars
        const totalStarsEl = article.querySelector('svg.octicon-star')?.parentElement;
        let totalStars = null;
        if (totalStarsEl) {
          const match = totalStarsEl.textContent.trim().match(/^([\d,]+)/);
          if (match) {
            totalStars = parseInt(match[1].replace(/,/g, ''));
          }
        }

        // Get forks
        const forksEl = article.querySelector('svg.octicon-repo-forked')?.parentElement;
        let forks = null;
        if (forksEl) {
          const match = forksEl.textContent.trim().match(/^([\d,]+)/);
          if (match) {
            forks = parseInt(match[1].replace(/,/g, ''));
          }
        }

        results.push({
          rank: idx + 1,
          name: repoFullName,
          url: repoUrl,
          description: description,
          language: language,
          stars: totalStars,
          forks: forks,
          starsToday: starsToday
        });
      });

      return results;
    });

    console.log(`Found ${repos.length} trending repositories:\n`);

    repos.forEach(repo => {
      console.log(`${repo.rank}. ${repo.name}`);
      if (repo.description) console.log(`   ${repo.description}`);
      console.log(`   Language: ${repo.language || 'N/A'} | ⭐ ${repo.stars || 0} (${repo.starsToday || 0} today) | Forks: ${repo.forks || 0}`);
      console.log(`   URL: ${repo.url}\n`);
    });

    // Save output
    const output = {
      timestamp: new Date().toString(),
      repos: repos
    };

    const outputFile = path.join(OUTPUT_DIR, 'github-trending.json');
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
    console.log(`✅ Saved to ${outputFile}`);

  } catch (error) {
    console.error('Error:', error.message);
    await captureScreenshot(page, path.join(OUTPUT_DIR, 'github-trending-error.png'));
  }

  await browser.close();
})();
