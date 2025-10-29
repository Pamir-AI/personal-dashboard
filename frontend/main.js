// API base URL - relative path for Distiller proxy compatibility
const API_BASE = './api';

console.log('=== Personal Dashboard Loaded ===');

// DOM elements
let refreshBtn, lastUpdatedEl, statusMessageEl, initialLoader, content;
let slickdealsList, producthuntList;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded - initializing app');

  // Get DOM elements
  refreshBtn = document.getElementById('refresh-btn');
  lastUpdatedEl = document.getElementById('last-updated');
  statusMessageEl = document.getElementById('status-message');
  initialLoader = document.getElementById('initial-loader');
  content = document.getElementById('content');
  slickdealsList = document.getElementById('slickdeals-list');
  producthuntList = document.getElementById('producthunt-list');

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
      showError('Failed to load drops data');
      showContent();
    }
  } catch (error) {
    console.error('Error loading data:', error);
    showError(`Error loading data: ${error.message}`);
    showContent();
  }
}

// Render the drops data
function renderData(data) {
  // Render Slickdeals
  const slickdealsData = data.slickdeals;
  if (slickdealsData && slickdealsData.deals && slickdealsData.deals.length > 0) {
    renderSlickdeals(slickdealsData);
  } else {
    slickdealsList.innerHTML = '<p class="empty-state">No deals available. Click "Refresh" to fetch latest.</p>';
  }

  // Render Product Hunt
  const producthuntData = data.producthunt;
  if (producthuntData && producthuntData.products && producthuntData.products.length > 0) {
    renderProductHunt(producthuntData);
  } else {
    producthuntList.innerHTML = '<p class="empty-state">No products available. Click "Refresh" to fetch latest.</p>';
  }
}

// Render Slickdeals
function renderSlickdeals(data) {
  const deals = data.deals.slice(0, 20); // Show top 20

  slickdealsList.innerHTML = `
    <div class="deals-list">
      ${deals.map((deal, idx) => `
        <div class="deal-item">
          <div class="deal-header">
            <span class="deal-rank">${idx + 1}.</span>
            <a href="${escapeHtml(deal.link)}" target="_blank" class="deal-title" ${deal.image ? `data-image="${escapeHtml(deal.image)}"` : ''}>${escapeHtml(deal.title)}</a>
          </div>
          ${deal.description ? `<div class="deal-description">${escapeHtml(deal.description)}</div>` : ''}
          <div class="deal-meta">
            by ${escapeHtml(deal.author)} | ${formatTime(deal.pubDate)}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Add image hover listeners
  addImageHoverListeners();
}

// Render Product Hunt
function renderProductHunt(data) {
  const products = data.products.slice(0, 20); // Show top 20

  producthuntList.innerHTML = `
    <div class="products-list">
      ${products.map((product, idx) => `
        <div class="product-item">
          <div class="product-header">
            <span class="product-rank">${idx + 1}.</span>
            <a href="${escapeHtml(product.link)}" target="_blank" class="product-title">${escapeHtml(product.title)}</a>
          </div>
          ${product.description ? `<div class="product-description">${escapeHtml(product.description)}</div>` : ''}
          <div class="product-meta">
            by ${escapeHtml(product.author)} | ${formatTime(product.publishedDate)}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Handle refresh button click
async function handleRefresh() {
  setRefreshLoading(true);
  showStatus('Fetching fresh data...', 'info');

  try {
    const response = await fetch(`${API_BASE}/refresh`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      showStatus('Refresh started! Data will update shortly.', 'success');

      // Reload data after a short delay
      setTimeout(() => {
        loadDropsData();
      }, 3000);
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
  lastUpdatedEl.textContent = `Last updated: ${formatTime(date.toISOString())}`;
}

// Format timestamp
function formatTime(isoString) {
  if (!isoString) return 'Unknown';

  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffMins < 1440) {
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  } else {
    const diffDays = Math.floor(diffMins / 1440);
    return `${diffDays}d ago`;
  }
}

// Show content (hide initial loader)
function showContent() {
  initialLoader.style.display = 'none';
  content.style.display = 'block';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Add image hover listeners
function addImageHoverListeners() {
  const elementsWithImages = document.querySelectorAll('[data-image]');

  elementsWithImages.forEach(el => {
    const imageUrl = el.getAttribute('data-image');
    if (!imageUrl || imageUrl === 'null' || imageUrl === '') {
      return;
    }

    let currentTooltip = null;
    let mouseMoveHandler = null;

    // Create tooltip on mouseenter
    el.addEventListener('mouseenter', (e) => {
      currentTooltip = document.createElement('div');
      currentTooltip.className = 'image-tooltip';

      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = 'Product image';

      // Add error handler
      img.onerror = () => {
        if (currentTooltip && currentTooltip.parentNode) {
          currentTooltip.innerHTML = '<div class="tooltip-error">Image failed to load</div>';
        }
      };

      currentTooltip.appendChild(img);
      document.body.appendChild(currentTooltip);

      // Position tooltip near cursor
      mouseMoveHandler = (event) => {
        if (currentTooltip) {
          // Position to the right and below cursor
          const x = event.pageX + 15;
          const y = event.pageY + 15;

          // Keep tooltip on screen
          const tooltipRect = currentTooltip.getBoundingClientRect();
          const maxX = window.innerWidth - tooltipRect.width - 10;
          const maxY = window.innerHeight - tooltipRect.height - 10;

          currentTooltip.style.left = Math.min(x, maxX) + 'px';
          currentTooltip.style.top = Math.min(y, maxY) + 'px';
        }
      };

      mouseMoveHandler(e); // Initial position
      el.addEventListener('mousemove', mouseMoveHandler);
    });

    // Remove tooltip on mouseleave
    el.addEventListener('mouseleave', () => {
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
