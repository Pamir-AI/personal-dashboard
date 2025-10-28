# Playwright Skill for Claude Code

General-purpose browser automation skill with intelligent utilities extracted from production bots.

## Features

- **Session Persistence**: Save/restore cookies to skip login flows
- **Stealth Mode**: Built-in bot detection bypass
- **Retry Logic**: Automatic retries with exponential backoff
- **Human-Like Interactions**: Typing with random delays, safe clicks
- **Server Detection**: Auto-detect running dev servers
- **Lock File Management**: Prevent concurrent execution
- **Cloudflare Handling**: Detect and wait for challenge resolution
- **Screenshot Utilities**: Capture evidence at any step
- **Peak Window Detection**: Time-aware timeout adjustments

## Quick Start

### Installation

```bash
cd .claude/skills/playwright
npm run setup
```

This will install Playwright, stealth plugins, and Chromium browser.

### Run Examples

```bash
# Login flow with session persistence
node examples/login-flow.js

# Form submission with screenshots
node examples/form-submission.js

# Data extraction with retry logic
node examples/data-extraction.js

# Cloudflare challenge handling
node examples/cloudflare-handler.js
```

### Run Custom Scripts

```bash
# From file
node run.js path/to/your-script.js

# Inline code
node run.js "await page.goto('https://example.com'); await page.screenshot({ path: 'test.png' });"

# From stdin
cat script.js | node run.js
```

## Usage in Claude Code

When you need general-purpose browser automation:

1. Ask Claude to use the `playwright` skill
2. Describe what you want to automate
3. Claude will generate and execute scripts using this skill

Example prompts:
- "Use the playwright skill to test logging into this website"
- "Automate filling out this form"
- "Take responsive screenshots of this page"
- "Extract all product data from this page"

## Utilities Reference

### Session Management

```javascript
const { saveCookies, loadCookies } = require('./lib/utils.js');

// Save session after login
await saveCookies(context, 'session.json');

// Restore session on next run
const restored = await loadCookies(context, 'session.json');
```

### Safe Interactions

```javascript
const { humanType, safeClick } = require('./lib/utils.js');

// Type with human-like delays
await humanType(page, '#email', 'user@example.com', { delay: 80 });

// Click with automatic retry
await safeClick(page, 'button.submit', { retries: 3, timeout: 10000 });
```

### Screenshots

```javascript
const { captureScreenshot } = require('./lib/utils.js');

// Capture with auto directory creation
await captureScreenshot(page, 'screenshots/step-1.png');
```

### Retry Logic

```javascript
const { retryWithBackoff } = require('./lib/utils.js');

const data = await retryWithBackoff(async () => {
  await page.waitForSelector('.dynamic-content');
  return await page.textContent('.dynamic-content');
}, { maxRetries: 3, initialDelay: 1000 });
```

### Data Extraction

```javascript
const { extractText, extractAttributes } = require('./lib/utils.js');

// Extract all text from elements
const titles = await extractText(page, 'h1, h2, h3');

// Extract attributes
const links = await extractAttributes(page, 'a', 'href');
```

### Cloudflare Detection

```javascript
const { detectCloudflare, waitForCloudflareResolution } = require('./lib/utils.js');

// Detect challenge
if (await detectCloudflare(page)) {
  // Wait for manual solving
  await waitForCloudflareResolution(page, { maxWait: 60000 });
}
```

### Peak Window Detection

```javascript
const { isPeakWindow, getPeakAwareTimeout } = require('./lib/utils.js');

// Define peak windows (in UTC)
const windows = [
  { hourUTC: 19, minuteUTC: 59, durationMinutes: 3 }, // 7:59 PM UTC
  { hourUTC: 2, minuteUTC: 0, durationMinutes: 3 }    // 2:00 AM UTC
];

// Check if currently in peak window
if (isPeakWindow(windows)) {
  console.log('Peak traffic time!');
}

// Get adaptive timeout
const timeout = getPeakAwareTimeout(30000, 2, windows); // 30s normal, 60s during peak
```

### Server Detection

```javascript
const { detectDevServers, detectDevServersSync } = require('./lib/utils.js');

// Async detection (more reliable)
const servers = await detectDevServers([3000, 8080, 5173]);

// Sync detection (faster)
const servers = detectDevServersSync([3000, 8080]);
```

### Lock File Management

```javascript
const { isLocked, createLock, removeLock } = require('./lib/utils.js');

const lockPath = '/tmp/my-script.lock';

if (isLocked(lockPath)) {
  console.log('Another instance is running');
  process.exit(0);
}

createLock(lockPath);
try {
  // ... your automation code ...
} finally {
  removeLock(lockPath);
}
```

## Environment Variables

Create a `.env` file in your automation project:

```bash
# Target configuration
TARGET_URL=https://example.com
LOGIN_EMAIL=user@example.com
LOGIN_PASSWORD=secretpass

# Automation settings
HEADLESS=false
TIMEOUT=30000

# Optional: Notification webhook
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

## vs. web-monitor-bot Skill

| Feature | playwright (this skill) | web-monitor-bot |
|---------|------------------------|-----------------|
| **Purpose** | One-off automation | Scheduled monitoring |
| **Execution** | Manual/on-demand | Cron-based |
| **Analytics** | No | Yes (dashboard) |
| **Notifications** | Manual setup | Built-in Slack |
| **Best For** | Testing, scraping, workflows | Availability tracking |

Use `playwright` for interactive automation tasks.
Use `web-monitor-bot` for periodic monitoring with alerts.

## Best Practices

1. **Always use session persistence** to speed up repeated runs
2. **Capture screenshots** at critical steps for debugging
3. **Use retry logic** for flaky network requests or dynamic content
4. **Enable stealth mode** when dealing with bot detection
5. **Clean up resources** in `finally` blocks
6. **Use environment variables** for sensitive data
7. **Use lock files** when running via cron to prevent overlaps

## Troubleshooting

**Elements not found:**
- Increase timeouts: `{ timeout: 60000 }`
- Use `waitForSelector()` before interactions
- Check selectors in browser DevTools
- Use `captureScreenshot()` to debug page state

**Bot detection:**
- Enable stealth mode with `playwright-extra`
- Use `humanType()` instead of `fill()`
- Add random delays
- Handle Cloudflare with manual intervention pattern

**Session not persisting:**
- Check file permissions
- Re-login and save fresh cookies
- Verify cookie expiration times

## Credits

This skill improves upon [lackeyjb/playwright-skill](https://github.com/lackeyjb/playwright-skill) with production-tested patterns from real automation bots, including:
- Session management from Tock reservation bot
- Peak window detection for high-traffic scenarios
- Cloudflare challenge handling
- Lock file management for cron execution
- Retry logic with backoff
- Human-like interaction patterns

## License

MIT
