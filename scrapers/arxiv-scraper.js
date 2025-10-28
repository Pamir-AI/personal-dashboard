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

  console.log('\n=== ARXIV - RECENT CS PAPERS ===\n');

  try {
    // Go to arXiv recent submissions in Computer Science
    await page.goto('https://arxiv.org/list/cs/recent', {
      timeout: 60000
    });

    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'arxiv.png'), fullPage: false });

    // Extract papers
    const papers = await page.evaluate(() => {
      const results = [];
      const paperEntries = document.querySelectorAll('dl dt');

      paperEntries.forEach((dt, idx) => {
        if (idx >= 20) return; // Get top 20 papers

        // Get paper ID and link
        const linkEl = dt.querySelector('a[title="Abstract"]');
        if (!linkEl) return;

        const paperId = linkEl.textContent.replace('arXiv:', '').trim();
        const paperUrl = 'https://arxiv.org' + linkEl.getAttribute('href');

        // Get the corresponding dd element with details
        let dd = dt.nextElementSibling;
        if (!dd || dd.tagName !== 'DD') return;

        // Get title
        const titleEl = dd.querySelector('.list-title');
        const title = titleEl ? titleEl.textContent.replace('Title:', '').trim() : '';

        // Get authors
        const authorsEl = dd.querySelector('.list-authors');
        let authors = [];
        if (authorsEl) {
          const authorLinks = authorsEl.querySelectorAll('a');
          authors = Array.from(authorLinks).map(a => a.textContent.trim());
        }

        // Get subjects
        const subjectsEl = dd.querySelector('.list-subjects');
        const subjects = subjectsEl ? subjectsEl.textContent.replace('Subjects:', '').trim() : '';

        // Get abstract
        const abstractEl = dd.querySelector('.mathjax');
        const abstract = abstractEl ? abstractEl.textContent.trim() : '';

        results.push({
          rank: idx + 1,
          id: paperId,
          url: paperUrl,
          pdfUrl: `https://arxiv.org/pdf/${paperId}.pdf`,
          title: title,
          authors: authors.slice(0, 3), // First 3 authors
          totalAuthors: authors.length,
          subjects: subjects,
          abstract: abstract.substring(0, 300) + (abstract.length > 300 ? '...' : '')
        });
      });

      return results;
    });

    console.log(`Found ${papers.length} recent papers:\n`);

    papers.forEach(paper => {
      console.log(`${paper.rank}. ${paper.title}`);
      console.log(`   ID: ${paper.id}`);
      console.log(`   Authors: ${paper.authors.join(', ')}${paper.totalAuthors > 3 ? ` (+${paper.totalAuthors - 3} more)` : ''}`);
      console.log(`   Subjects: ${paper.subjects}`);
      console.log(`   Abstract: ${paper.abstract}`);
      console.log(`   URL: ${paper.url}\n`);
    });

    // Save output
    const output = {
      timestamp: new Date().toString(),
      papers: papers
    };

    const outputFile = path.join(OUTPUT_DIR, 'arxiv.json');
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
    console.log(`✅ Saved to ${outputFile}`);

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'arxiv-error.png'), fullPage: false });
  }

  await browser.close();
})();
