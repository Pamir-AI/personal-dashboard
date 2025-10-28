const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Session Management
 */

/**
 * Save browser cookies to a file for session persistence
 * @param {BrowserContext} context - Playwright browser context
 * @param {string} filepath - Path to save cookies (relative or absolute)
 */
async function saveCookies(context, filepath) {
  try {
    const cookies = await context.cookies();
    const fullPath = path.isAbsolute(filepath) ? filepath : path.join(process.cwd(), filepath);
    fs.writeFileSync(fullPath, JSON.stringify(cookies, null, 2));
    console.log(`💾 Session saved to ${filepath}`);
    return true;
  } catch (error) {
    console.error(`Failed to save cookies: ${error.message}`);
    return false;
  }
}

/**
 * Load browser cookies from a file to restore session
 * @param {BrowserContext} context - Playwright browser context
 * @param {string} filepath - Path to load cookies from
 * @returns {boolean} - True if cookies were loaded, false if file doesn't exist
 */
async function loadCookies(context, filepath) {
  try {
    const fullPath = path.isAbsolute(filepath) ? filepath : path.join(process.cwd(), filepath);
    if (!fs.existsSync(fullPath)) {
      return false;
    }
    const cookieData = fs.readFileSync(fullPath, 'utf-8');
    const cookies = JSON.parse(cookieData);
    await context.addCookies(cookies);
    console.log(`🔑 Session restored from ${filepath}`);
    return true;
  } catch (error) {
    console.error(`Failed to load cookies: ${error.message}`);
    return false;
  }
}

/**
 * Interaction Helpers
 */

/**
 * Type text with human-like delays between keystrokes
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector to type into
 * @param {string} text - Text to type
 * @param {Object} options - Options object
 * @param {number} options.delay - Base delay between keystrokes in ms (default: 100)
 * @param {boolean} options.random - Add random variation to delay (default: true)
 */
async function humanType(page, selector, text, options = {}) {
  const { delay = 100, random = true } = options;

  await page.waitForSelector(selector, { state: 'visible', timeout: 10000 });

  for (const char of text) {
    await page.type(selector, char, {
      delay: random ? delay + Math.random() * delay * 0.5 : delay
    });
  }
}

/**
 * Click with retry logic and error handling
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector to click
 * @param {Object} options - Options object
 * @param {number} options.retries - Number of retry attempts (default: 3)
 * @param {number} options.timeout - Timeout per attempt in ms (default: 10000)
 * @param {number} options.delay - Delay between retries in ms (default: 1000)
 */
async function safeClick(page, selector, options = {}) {
  const { retries = 3, timeout = 10000, delay = 1000 } = options;

  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      await page.waitForSelector(selector, { state: 'visible', timeout });
      await page.click(selector, { timeout });
      return true;
    } catch (error) {
      lastError = error;
      console.log(`Click attempt ${i + 1}/${retries} failed, retrying...`);
      if (i < retries - 1) {
        await page.waitForTimeout(delay);
      }
    }
  }
  throw new Error(`Failed to click ${selector} after ${retries} attempts: ${lastError.message}`);
}

/**
 * Screenshot & Debugging
 */

/**
 * Capture screenshot with error handling and automatic directory creation
 * @param {Page} page - Playwright page object
 * @param {string} filepath - Path to save screenshot
 * @param {Object} options - Playwright screenshot options
 */
async function captureScreenshot(page, filepath, options = {}) {
  try {
    const fullPath = path.isAbsolute(filepath) ? filepath : path.join(process.cwd(), filepath);
    const dir = path.dirname(fullPath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await page.screenshot({ path: fullPath, ...options });
    console.log(`📸 Screenshot saved: ${filepath}`);
    return true;
  } catch (error) {
    console.error(`Failed to capture screenshot: ${error.message}`);
    return false;
  }
}

/**
 * Retry Logic
 */

/**
 * Retry an async operation with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Options object
 * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
 * @param {number} options.initialDelay - Initial delay in ms (default: 1000)
 * @param {number} options.backoffMultiplier - Backoff multiplier (default: 2)
 * @param {Function} options.onRetry - Callback on retry (receives attempt number)
 * @returns {Promise} - Result of the function
 */
async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    backoffMultiplier = 2,
    onRetry = null
  } = options;

  let delay = initialDelay;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        console.log(`Attempt ${attempt}/${maxRetries} failed: ${error.message}`);
        if (onRetry) {
          onRetry(attempt);
        }
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= backoffMultiplier;
      }
    }
  }

  throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
}

/**
 * Server Detection
 */

/**
 * Detect running development servers on localhost
 * @param {Array<number>} ports - Ports to check (default: common dev ports)
 * @returns {Promise<Array>} - Array of { port, url } objects for running servers
 */
async function detectDevServers(ports = [3000, 3001, 3002, 4200, 5000, 5173, 8000, 8080, 8888, 9000]) {
  const servers = [];

  for (const port of ports) {
    try {
      // Try to connect to the port
      const { chromium } = require('playwright');
      const browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
      const page = await context.newPage();

      try {
        const url = `http://localhost:${port}`;
        await page.goto(url, { timeout: 3000, waitUntil: 'domcontentloaded' });
        servers.push({ port, url });
        console.log(`✅ Found server at ${url}`);
      } catch (error) {
        // Port not responding, skip
      } finally {
        await browser.close();
      }
    } catch (error) {
      // Browser launch error, skip
    }
  }

  return servers;
}

/**
 * Alternative server detection using netstat (faster but less reliable)
 */
function detectDevServersSync(ports = [3000, 3001, 3002, 4200, 5000, 5173, 8000, 8080, 8888, 9000]) {
  const servers = [];

  try {
    // Use netstat to find listening ports
    const netstat = execSync('netstat -tuln 2>/dev/null || ss -tuln 2>/dev/null', { encoding: 'utf-8' });

    for (const port of ports) {
      // Check if port is in the netstat output
      const regex = new RegExp(`:(${port})\\s`, 'g');
      if (regex.test(netstat)) {
        servers.push({ port, url: `http://localhost:${port}` });
        console.log(`✅ Found server at http://localhost:${port}`);
      }
    }
  } catch (error) {
    console.error('Failed to detect servers with netstat:', error.message);
  }

  return servers;
}

/**
 * Lock File Management (for concurrent execution control)
 */

/**
 * Check if a lock file exists and is not stale
 * @param {string} lockPath - Path to lock file
 * @param {number} timeoutMs - Lock timeout in ms (default: 180000 = 3 minutes)
 * @returns {boolean} - True if lock is active, false otherwise
 */
function isLocked(lockPath, timeoutMs = 180000) {
  if (!fs.existsSync(lockPath)) {
    return false;
  }

  const stats = fs.statSync(lockPath);
  const lockAge = Date.now() - stats.mtimeMs;

  if (lockAge < timeoutMs) {
    return true; // Lock is active
  } else {
    console.log('⚠️  Removing stale lock file');
    fs.unlinkSync(lockPath);
    return false;
  }
}

/**
 * Create a lock file
 * @param {string} lockPath - Path to lock file
 */
function createLock(lockPath) {
  const dir = path.dirname(lockPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(lockPath, process.pid.toString());
}

/**
 * Remove a lock file
 * @param {string} lockPath - Path to lock file
 */
function removeLock(lockPath) {
  if (fs.existsSync(lockPath)) {
    fs.unlinkSync(lockPath);
  }
}

/**
 * Wait Utilities
 */

/**
 * Wait with retry logic for a selector to appear
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector to wait for
 * @param {Object} options - Options object
 * @param {number} options.timeout - Timeout per attempt in ms (default: 10000)
 * @param {number} options.retries - Number of retry attempts (default: 3)
 * @param {boolean} options.reload - Reload page between retries (default: false)
 */
async function waitForSelectorWithRetry(page, selector, options = {}) {
  const { timeout = 10000, retries = 3, reload = false } = options;

  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      await page.waitForSelector(selector, { state: 'attached', timeout });
      return true;
    } catch (error) {
      lastError = error;
      console.log(`Wait attempt ${i + 1}/${retries} failed for ${selector}`);
      if (i < retries - 1) {
        if (reload) {
          console.log('Reloading page...');
          await page.reload({ waitUntil: 'domcontentloaded', timeout });
        }
        await page.waitForTimeout(2000);
      }
    }
  }
  throw new Error(`Selector ${selector} not found after ${retries} attempts: ${lastError.message}`);
}

/**
 * Human-Like Behavior Utilities
 */

/**
 * Generate random delay for human-like timing
 * @param {number} min - Minimum delay in ms
 * @param {number} max - Maximum delay in ms
 * @returns {number} - Random delay value
 */
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Click element with human-like mouse movement
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector to click
 * @param {Object} options - Options object
 * @param {number} options.timeout - Timeout in ms (default: 10000)
 */
async function humanClick(page, selector, options = {}) {
  const { timeout = 10000 } = options;

  await page.waitForSelector(selector, { state: 'visible', timeout });
  const element = await page.locator(selector);
  const box = await element.boundingBox();

  if (!box) {
    throw new Error(`Element not visible: ${selector}`);
  }

  // Random position within element (avoid exact center)
  const x = box.x + randomDelay(5, Math.max(box.width - 5, 5));
  const y = box.y + randomDelay(5, Math.max(box.height - 5, 5));

  // Move cursor with random steps (creates curved path)
  await page.mouse.move(x, y, {
    steps: randomDelay(10, 30)
  });

  // Random delay before click (human hesitation)
  await page.waitForTimeout(randomDelay(100, 300));

  // Click
  await page.mouse.click(x, y);
}

/**
 * Bot Detection Helpers
 */

/**
 * Track Cloudflare blocks in JSON file
 * @param {string} filepath - Path to blocks tracking file
 * @returns {Object} - Block data { consecutive, total, history }
 */
function getCloudflareBlocks(filepath = 'cloudflare-blocks.json') {
  try {
    const fullPath = path.isAbsolute(filepath) ? filepath : path.join(process.cwd(), filepath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      return content.trim() ? JSON.parse(content) : { consecutive: 0, total: 0, history: [] };
    }
  } catch (error) {
    console.error('Error reading Cloudflare blocks:', error.message);
  }
  return { consecutive: 0, total: 0, history: [] };
}

/**
 * Log Cloudflare block event
 * @param {boolean} blocked - True if blocked, false if cleared
 * @param {string} filepath - Path to blocks tracking file
 * @returns {Object} - Updated block data
 */
function logCloudflareBlock(blocked, filepath = 'cloudflare-blocks.json') {
  try {
    const fullPath = path.isAbsolute(filepath) ? filepath : path.join(process.cwd(), filepath);
    const blocks = getCloudflareBlocks(filepath);

    if (blocked) {
      blocks.consecutive += 1;
      blocks.total += 1;
      blocks.history.push({ timestamp: new Date().toISOString(), blocked: true });
    } else {
      blocks.consecutive = 0; // Reset on success
      blocks.history.push({ timestamp: new Date().toISOString(), blocked: false });
    }

    // Keep last 100 entries
    if (blocks.history.length > 100) {
      blocks.history = blocks.history.slice(-100);
    }

    fs.writeFileSync(fullPath, JSON.stringify(blocks, null, 2));
    return blocks;
  } catch (error) {
    console.error('Error logging Cloudflare block:', error.message);
    return { consecutive: 0, total: 0, history: [] };
  }
}

/**
 * Detect and handle Cloudflare challenges with smart polling
 * @param {Page} page - Playwright page object
 * @param {BrowserContext} context - Playwright browser context (for saving cookies)
 * @param {string} location - Context description for logging
 * @param {Object} options - Options object
 * @param {number} options.maxWaitSeconds - Maximum wait in seconds (default: 90)
 * @param {number} options.pollIntervalSeconds - Poll interval in seconds (default: 10)
 * @param {string} options.cookiePath - Path to save cookies after solve
 * @param {string} options.blocksPath - Path to blocks tracking file
 * @returns {Promise<boolean>} - True if challenge detected and cleared, false if no challenge
 * @throws {Error} - If challenge detected but not cleared within timeout
 */
async function detectCloudflare(page, context = null, location = 'page load', options = {}) {
  const {
    maxWaitSeconds = 90,
    pollIntervalSeconds = 10,
    cookiePath = null,
    blocksPath = 'cloudflare-blocks.json'
  } = options;

  console.log(`🔍 Checking for Cloudflare challenge (${location})...`);

  // Check for Cloudflare challenge indicators
  const cloudflareDetected =
    await page.locator('text=Verify you are human').count() > 0 ||
    await page.locator('[name="cf-turnstile-response"]').count() > 0 ||
    await page.locator('.cf-turnstile').count() > 0 ||
    await page.locator('text=Verifying you are human').count() > 0;

  if (!cloudflareDetected) {
    // No challenge detected - log success
    logCloudflareBlock(false, blocksPath);
    return false;
  }

  // Cloudflare challenge detected!
  const blocks = getCloudflareBlocks(blocksPath);
  const newBlocks = logCloudflareBlock(true, blocksPath);

  console.log(`🤖 ALERT: Cloudflare challenge detected at ${location}! (Consecutive: ${newBlocks.consecutive}, Total: ${newBlocks.total})`);
  await captureScreenshot(page, 'cloudflare-detected.png');

  // Alert if 3+ consecutive blocks
  if (newBlocks.consecutive >= 3) {
    console.log(`⚠️ WARNING: ${newBlocks.consecutive} consecutive Cloudflare blocks! Session may be flagged.`);
  }

  // Poll every N seconds for max wait time
  console.log(`⏳ Waiting up to ${maxWaitSeconds}s for Cloudflare challenge to auto-solve...`);
  const maxIterations = Math.floor(maxWaitSeconds / pollIntervalSeconds);

  for (let i = 0; i < maxIterations; i++) {
    await page.waitForTimeout(pollIntervalSeconds * 1000);

    // Re-check if challenge cleared
    const stillBlocked =
      await page.locator('text=Verify you are human').count() > 0 ||
      await page.locator('[name="cf-turnstile-response"]').count() > 0 ||
      await page.locator('.cf-turnstile').count() > 0 ||
      await page.locator('text=Verifying you are human').count() > 0;

    if (!stillBlocked) {
      // Challenge auto-solved!
      console.log('✅ Cloudflare challenge auto-solved!');
      await captureScreenshot(page, 'cloudflare-cleared.png');

      // Save cookies immediately if context and path provided
      if (context && cookiePath) {
        await saveCookies(context, cookiePath);
      }

      return true;
    }

    // Progress update every 30 seconds (every 3 iterations for 10s polls)
    if (pollIntervalSeconds === 10 && (i + 1) % 3 === 0) {
      const elapsed = (i + 1) * pollIntervalSeconds;
      console.log(`⏳ Still waiting... (${elapsed}s / ${maxWaitSeconds}s elapsed)`);
    }
  }

  // Timeout after max wait
  console.log(`❌ ALERT: Cloudflare challenge not solved after ${maxWaitSeconds}s. Aborting.`);
  await captureScreenshot(page, 'cloudflare-timeout.png');
  throw new Error(`Cloudflare challenge not solved after ${maxWaitSeconds}s wait`);
}

/**
 * Data Extraction Helpers
 */

/**
 * Extract all text from elements matching a selector
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @returns {Promise<Array<string>>} - Array of text content
 */
async function extractText(page, selector) {
  try {
    const elements = await page.$$(selector);
    const texts = await Promise.all(elements.map(el => el.textContent()));
    return texts.map(t => t.trim()).filter(t => t.length > 0);
  } catch (error) {
    console.error(`Failed to extract text from ${selector}: ${error.message}`);
    return [];
  }
}

/**
 * Extract attribute values from elements
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {string} attribute - Attribute name to extract
 * @returns {Promise<Array<string>>} - Array of attribute values
 */
async function extractAttributes(page, selector, attribute) {
  try {
    const elements = await page.$$(selector);
    const attributes = await Promise.all(elements.map(el => el.getAttribute(attribute)));
    return attributes.filter(a => a !== null);
  } catch (error) {
    console.error(`Failed to extract ${attribute} from ${selector}: ${error.message}`);
    return [];
  }
}

/**
 * Peak Window Detection (for time-based automation)
 */

/**
 * Check if current time is within a peak window
 * @param {Array<Object>} windows - Array of { hourUTC, minuteUTC, durationMinutes } objects
 * @returns {boolean} - True if within any peak window
 */
function isPeakWindow(windows) {
  const now = new Date();
  const currentHour = now.getUTCHours();
  const currentMinute = now.getUTCMinutes();

  for (const window of windows) {
    const { hourUTC, minuteUTC = 0, durationMinutes = 3 } = window;

    // Calculate window start and end
    const windowStart = hourUTC * 60 + minuteUTC;
    const windowEnd = windowStart + durationMinutes;
    const currentTime = currentHour * 60 + currentMinute;

    // Handle day wrap-around
    if (windowEnd >= 1440) { // 1440 minutes = 24 hours
      if (currentTime >= windowStart || currentTime < (windowEnd % 1440)) {
        return true;
      }
    } else {
      if (currentTime >= windowStart && currentTime < windowEnd) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get peak-aware timeout value
 * @param {number} normalTimeout - Normal timeout in ms
 * @param {number} peakMultiplier - Peak multiplier (default: 2)
 * @param {Array<Object>} windows - Peak windows (optional)
 * @returns {number} - Timeout value in ms
 */
function getPeakAwareTimeout(normalTimeout, peakMultiplier = 2, windows = []) {
  if (windows.length === 0 || !isPeakWindow(windows)) {
    return normalTimeout;
  }
  return normalTimeout * peakMultiplier;
}

module.exports = {
  // Session Management
  saveCookies,
  loadCookies,

  // Interaction Helpers
  humanType,
  safeClick,
  humanClick,

  // Human-Like Behavior
  randomDelay,

  // Screenshot & Debugging
  captureScreenshot,

  // Retry Logic
  retryWithBackoff,

  // Server Detection
  detectDevServers,
  detectDevServersSync,

  // Lock File Management
  isLocked,
  createLock,
  removeLock,

  // Wait Utilities
  waitForSelectorWithRetry,

  // Bot Detection Helpers
  detectCloudflare,
  getCloudflareBlocks,
  logCloudflareBlock,

  // Data Extraction
  extractText,
  extractAttributes,

  // Peak Window Detection
  isPeakWindow,
  getPeakAwareTimeout
};
