const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');


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

  console.log('\n=== HACKER NEWS - TOP STORIES ===\n');

  try {
    await page.goto('https://news.ycombinator.com/', {
      timeout: 60000
    });

    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'hackernews.png'), fullPage: false });

    // Extract top stories
    const stories = await page.evaluate(() => {
      const results = [];
      const rows = document.querySelectorAll('tr.athing');

      rows.forEach((row, idx) => {
        if (idx >= 30) return; // Get top 30 stories

        const titleLink = row.querySelector('.titleline > a');
        if (!titleLink) return;

        const title = titleLink.textContent.trim();
        const url = titleLink.href;

        // Get the next row which contains points and comments
        const subtext = row.nextElementSibling;
        let points = null;
        let comments = null;
        let author = null;
        let time = null;

        if (subtext && subtext.classList.contains('subtext')) {
          const scoreEl = subtext.querySelector('.score');
          if (scoreEl) {
            points = parseInt(scoreEl.textContent.match(/\d+/)[0]);
          }

          const userEl = subtext.querySelector('.hnuser');
          if (userEl) {
            author = userEl.textContent;
          }

          const ageEl = subtext.querySelector('.age');
          if (ageEl) {
            time = ageEl.textContent;
          }

          const commentLinks = subtext.querySelectorAll('a');
          commentLinks.forEach(link => {
            if (link.textContent.includes('comment')) {
              const match = link.textContent.match(/(\d+)/);
              comments = match ? parseInt(match[1]) : 0;
            }
          });

          // If no comments found, set to 0
          if (comments === null) {
            comments = 0;
          }
        }

        results.push({
          rank: idx + 1,
          title: title,
          url: url,
          points: points,
          author: author,
          time: time,
          comments: comments
        });
      });

      return results;
    });

    console.log(`Found ${stories.length} stories:\n`);

    stories.forEach(story => {
      console.log(`${story.rank}. ${story.title}`);
      console.log(`   Points: ${story.points || 'N/A'} | Comments: ${story.comments} | ${story.time || 'N/A'}`);
      console.log(`   URL: ${story.url}\n`);
    });

    // Save output
    const output = {
      timestamp: new Date().toString(),
      stories: stories
    };

    const outputFile = path.join(OUTPUT_DIR, 'hackernews.json');
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
    console.log(`✅ Saved to ${outputFile}`);

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'hackernews-error.png'), fullPage: false });
  }

  await browser.close();
})();
