// API base URL - relative path for Distiller proxy compatibility
// This resolves to either /api or /distiller/proxy/5000/api depending on context
const API_BASE = './api';

console.log('=== DROPS APP LOADED ===');
console.log('API_BASE:', API_BASE);
console.log('Current location:', window.location.href);

// DOM elements
let refreshBtn, lastUpdatedEl, statusMessageEl, initialLoader, content;
let hypebeastArticleEl, hypebeastDropsEl;
let hackernewsStoriesEl, githubReposEl, arxivPapersEl;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded - initializing app');
  // Get DOM elements
  refreshBtn = document.getElementById('refresh-btn');
  lastUpdatedEl = document.getElementById('last-updated');
  statusMessageEl = document.getElementById('status-message');
  initialLoader = document.getElementById('initial-loader');
  content = document.getElementById('content');
  hypebeastArticleEl = document.getElementById('hypebeast-article');
  hypebeastDropsEl = document.getElementById('hypebeast-drops');
  hackernewsStoriesEl = document.getElementById('hackernews-stories');
  githubReposEl = document.getElementById('github-repos');
  arxivPapersEl = document.getElementById('arxiv-papers');

  // Set up event listeners
  refreshBtn.addEventListener('click', handleRefresh);

  // Load initial data
  loadDropsData();
});

// Load drops data from API
async function loadDropsData() {
  try {
    console.log('Fetching from:', `${API_BASE}/drops`);
    const response = await fetch(`${API_BASE}/drops`);
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Data received:', data);

    if (data.success) {
      renderData(data);
      updateLastUpdated(data.last_updated);
      showContent();
    } else {
      console.error('API returned success=false');
      showError('Failed to load drops data');
      showContent();
    }
  } catch (error) {
    console.error('Error loading data:', error);
    console.error('Error details:', error.message, error.stack);
    showError(`Error loading data: ${error.message}`);
    showContent(); // Show empty state
  }
}

// Render the drops data
function renderData(data) {
  // Render Hacker News stories
  const hackernewsData = data.hackernews;
  if (hackernewsData && hackernewsData.stories && hackernewsData.stories.length > 0) {
    renderHackernewsStories(hackernewsData);
  } else {
    hackernewsStoriesEl.innerHTML = '<p class="empty-state">No stories available. Click "Refresh" to fetch latest.</p>';
  }

  // Render GitHub trending repos
  const githubData = data.github;
  if (githubData && githubData.repos && githubData.repos.length > 0) {
    renderGithubRepos(githubData);
  } else {
    githubReposEl.innerHTML = '<p class="empty-state">No repositories available. Click "Refresh" to fetch latest.</p>';
  }

  // Render arXiv papers
  const arxivData = data.arxiv;
  if (arxivData && arxivData.papers && arxivData.papers.length > 0) {
    renderArxivPapers(arxivData);
  } else {
    arxivPapersEl.innerHTML = '<p class="empty-state">No papers available. Click "Refresh" to fetch latest.</p>';
  }

  // Render Hypebeast drops
  const hypebeastData = data.hypebeast;
  if (hypebeastData && hypebeastData.latestArticle) {
    renderHypebeastDrops(hypebeastData);
  } else {
    hypebeastArticleEl.innerHTML = '<p class="empty-state">No weekly drops data available. Click "Refresh" to fetch latest drops.</p>';
  }
}

// Render Hypebeast drops
function renderHypebeastDrops(data) {
  // Render latest article
  if (data.latestArticle) {
    hypebeastArticleEl.innerHTML = `
      <div class="featured-article">
        <h3>${escapeHtml(data.latestArticle.title)}</h3>
        <p class="article-date">${escapeHtml(data.latestArticle.date)} | <a href="${escapeHtml(data.latestArticle.link)}" target="_blank" class="article-link">read</a></p>
      </div>
    `;
  }

  // Render product drops
  if (data.drops && data.drops.length > 0) {
    hypebeastDropsEl.innerHTML = `
      <h3>Featured (${data.drops.length} items):</h3>
      <div class="drops-list">
        ${data.drops.map((drop, idx) => {
          // Build product display
          let details = [];
          if (drop.price) details.push(escapeHtml(drop.price));
          if (drop.link) details.push(`<a href="${escapeHtml(drop.link)}" target="_blank" class="drop-link">view</a>`);

          return `
            <div class="hypebeast-drop">
              <span class="drop-name" ${drop.image ? `data-image="${escapeHtml(drop.image)}"` : ''}>${idx + 1}. <span class="brand-badge">[${escapeHtml(drop.brand)}]</span> ${escapeHtml(drop.name)}</span>
              ${details.length > 0 ? `<div class="drop-details">${details.join(' | ')}</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Add hover listeners for images
    addImageHoverListeners();
  }
}

// Render Hacker News stories
function renderHackernewsStories(data) {
  const stories = data.stories.slice(0, 10); // Show top 10

  hackernewsStoriesEl.innerHTML = `
    <div class="story-list">
      ${stories.map(story => `
        <div class="story-item">
          <span class="story-rank">${story.rank}.</span>
          <a href="${escapeHtml(story.url)}" target="_blank" class="story-title">${escapeHtml(story.title)}</a>
          <div class="story-meta">
            ${story.points !== null ? `${story.points} points` : ''}
            ${story.author ? `by ${escapeHtml(story.author)}` : ''}
            ${story.time ? `| ${escapeHtml(story.time)}` : ''}
            ${story.comments !== null ? `| ${story.comments} comments` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Render GitHub trending repos
function renderGithubRepos(data) {
  const repos = data.repos.slice(0, 10); // Show top 10

  githubReposEl.innerHTML = `
    <div class="repo-list">
      ${repos.map(repo => `
        <div class="repo-item">
          <div class="repo-header">
            <span class="repo-rank">${repo.rank}.</span>
            <a href="${escapeHtml(repo.url)}" target="_blank" class="repo-name">${escapeHtml(repo.name)}</a>
          </div>
          ${repo.description ? `<div class="repo-description">${escapeHtml(repo.description)}</div>` : ''}
          <div class="repo-meta">
            ${repo.language ? `<span class="repo-lang">${escapeHtml(repo.language)}</span>` : ''}
            ${repo.stars !== null ? `⭐ ${repo.stars.toLocaleString()}` : ''}
            ${repo.starsToday !== null ? `(+${repo.starsToday.toLocaleString()} today)` : ''}
            ${repo.forks !== null ? `| 🔱 ${repo.forks.toLocaleString()}` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Render arXiv papers
function renderArxivPapers(data) {
  const papers = data.papers.slice(0, 10); // Show top 10

  arxivPapersEl.innerHTML = `
    <div class="paper-list">
      ${papers.map(paper => `
        <div class="paper-item">
          <div class="paper-header">
            <span class="paper-rank">${paper.rank}.</span>
            <a href="${escapeHtml(paper.url)}" target="_blank" class="paper-title">${escapeHtml(paper.title)}</a>
          </div>
          <div class="paper-authors">
            ${paper.authors.join(', ')}${paper.totalAuthors > 3 ? ` (+${paper.totalAuthors - 3} more)` : ''}
          </div>
          ${paper.abstract ? `<div class="paper-abstract">${escapeHtml(paper.abstract)}</div>` : ''}
          <div class="paper-meta">
            <span class="paper-id">${escapeHtml(paper.id)}</span> |
            <a href="${escapeHtml(paper.pdfUrl)}" target="_blank">PDF</a> |
            ${escapeHtml(paper.subjects)}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Handle refresh button click
async function handleRefresh() {
  // Disable button and show loading
  setRefreshLoading(true);
  showStatus('Fetching fresh data... This may take up to 2 minutes.', 'info');

  try {
    const refreshUrl = `${API_BASE}/refresh`;
    console.log('Refresh: Fetching from:', refreshUrl);

    const response = await fetch(refreshUrl, {
      method: 'POST'
    });

    console.log('Refresh: Response status:', response.status);
    console.log('Refresh: Response ok:', response.ok);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Refresh: Result:', result);

    if (result.success) {
      showStatus(result.message || 'Refresh started! Data will update in 1-2 minutes.', 'success');

      // Auto-reload data every 10 seconds to catch the update
      let reloadCount = 0;
      const maxReloads = 18; // Stop after 3 minutes (18 * 10s = 180s)

      const reloadInterval = setInterval(async () => {
        reloadCount++;
        console.log(`Auto-reload ${reloadCount}/${maxReloads}`);

        await loadDropsData();

        if (reloadCount >= maxReloads) {
          clearInterval(reloadInterval);
          console.log('Stopped auto-reload after max attempts');
        }
      }, 10000); // Every 10 seconds
    } else {
      showStatus(`Refresh failed: ${result.error || 'Unknown error'}`, 'error');
    }
  } catch (error) {
    console.error('Error refreshing data:', error);
    showStatus(`Error refreshing data: ${error.message}`, 'error');
  } finally {
    setRefreshLoading(false);
  }
}

// Toggle refresh button loading state
function setRefreshLoading(isLoading) {
  const btnText = refreshBtn.querySelector('.btn-text');
  const loader = refreshBtn.querySelector('.loader');

  refreshBtn.disabled = isLoading;

  if (isLoading) {
    btnText.style.display = 'none';
    loader.style.display = 'inline-block';
  } else {
    btnText.style.display = 'inline';
    loader.style.display = 'none';
  }
}

// Show status message
function showStatus(message, type = 'info') {
  statusMessageEl.textContent = message;
  statusMessageEl.className = `status-message status-${type}`;
  statusMessageEl.style.display = 'block';

  // Auto-hide after 5 seconds
  setTimeout(() => {
    statusMessageEl.style.display = 'none';
  }, 5000);
}

// Show error message
function showError(message) {
  showStatus(message, 'error');
}

// Update last updated timestamp
function updateLastUpdated(timestamp) {
  if (!timestamp) {
    lastUpdatedEl.textContent = '';
    return;
  }

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  let timeAgo;
  if (diffMins < 1) {
    timeAgo = 'just now';
  } else if (diffMins < 60) {
    timeAgo = `${diffMins}m ago`;
  } else {
    const diffHours = Math.floor(diffMins / 60);
    timeAgo = `${diffHours}h ago`;
  }

  lastUpdatedEl.textContent = `Last updated: ${timeAgo}`;
}

// Show content (hide initial loader)
function showContent() {
  initialLoader.style.display = 'none';
  content.style.display = 'block';
}

// Add image hover listeners
function addImageHoverListeners() {
  // Get all elements with data-image attribute
  const elementsWithImages = document.querySelectorAll('[data-image]');

  console.log(`Found ${elementsWithImages.length} elements with images`);

  elementsWithImages.forEach(el => {
    const imageUrl = el.getAttribute('data-image');
    if (!imageUrl || imageUrl === 'null' || imageUrl === '') {
      console.log('Skipping element with empty image URL');
      return;
    }

    console.log('Setting up hover for:', imageUrl.substring(0, 50) + '...');

    let currentTooltip = null;
    let mouseMoveHandler = null;

    // Create tooltip on mouseenter
    el.addEventListener('mouseenter', (e) => {
      console.log('Mouse enter - creating tooltip');

      currentTooltip = document.createElement('div');
      currentTooltip.className = 'image-tooltip';

      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = 'Product image';
      img.referrerPolicy = 'no-referrer'; // Bypass referrer check

      // Add error handler
      img.onerror = () => {
        console.error('Failed to load image:', imageUrl);
        currentTooltip.innerHTML = '<div style="padding:10px;color:#828282;">Image failed to load</div>';
      };

      img.onload = () => {
        console.log('Image loaded successfully');
      };

      currentTooltip.appendChild(img);
      document.body.appendChild(currentTooltip);

      // Position tooltip near cursor
      mouseMoveHandler = (event) => {
        if (currentTooltip) {
          currentTooltip.style.left = (event.pageX + 15) + 'px';
          currentTooltip.style.top = (event.pageY + 15) + 'px';
        }
      };

      mouseMoveHandler(e); // Initial position
      el.addEventListener('mousemove', mouseMoveHandler);
    });

    // Remove tooltip on mouseleave
    el.addEventListener('mouseleave', () => {
      console.log('Mouse leave - removing tooltip');

      if (mouseMoveHandler) {
        el.removeEventListener('mousemove', mouseMoveHandler);
        mouseMoveHandler = null;
      }

      if (currentTooltip && currentTooltip.parentNode) {
        currentTooltip.parentNode.removeChild(currentTooltip);
        currentTooltip = null;
      }
    });
  });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
