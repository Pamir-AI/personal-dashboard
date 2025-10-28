#!/usr/bin/env node

/**
 * Universal Playwright Script Runner
 *
 * Executes Playwright automation code from files, inline strings, or stdin
 * with automatic dependency detection and smart code wrapping.
 *
 * Usage:
 *   node run.js path/to/script.js                    # Run from file
 *   node run.js "await page.goto('https://...')"     # Run inline code
 *   cat script.js | node run.js                      # Run from stdin
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

/**
 * Check if Playwright is installed, install if needed
 */
function ensurePlaywrightInstalled() {
  try {
    require.resolve('playwright');
    logSuccess('Playwright is installed');
    return true;
  } catch (error) {
    logInfo('Playwright not found, installing...');
    try {
      execSync('npm install playwright playwright-extra puppeteer-extra-plugin-stealth dotenv', {
        stdio: 'inherit',
        cwd: __dirname
      });
      logSuccess('Playwright installed successfully');

      logInfo('Installing Chromium browser...');
      execSync('npx playwright install chromium', {
        stdio: 'inherit',
        cwd: __dirname
      });
      logSuccess('Chromium installed successfully');

      return true;
    } catch (installError) {
      logError('Failed to install Playwright');
      console.error(installError);
      return false;
    }
  }
}

/**
 * Clean up temporary execution files from previous runs
 */
function cleanupTempFiles() {
  const tempPattern = /^playwright-exec-.*\.js$/;
  const files = fs.readdirSync('/tmp');

  let cleaned = 0;
  for (const file of files) {
    if (tempPattern.test(file)) {
      try {
        fs.unlinkSync(path.join('/tmp', file));
        cleaned++;
      } catch (error) {
        // Ignore errors on cleanup
      }
    }
  }

  if (cleaned > 0) {
    logInfo(`Cleaned up ${cleaned} temporary file(s)`);
  }
}

/**
 * Read code from file, inline string, or stdin
 */
async function getCode() {
  const args = process.argv.slice(2);

  // Check if stdin has data (piped input)
  if (!process.stdin.isTTY) {
    logInfo('Reading code from stdin...');
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString('utf-8');
  }

  // No arguments provided
  if (args.length === 0) {
    logError('No code provided!');
    console.log('\nUsage:');
    console.log('  node run.js path/to/script.js');
    console.log('  node run.js "await page.goto(\'https://example.com\')"');
    console.log('  cat script.js | node run.js');
    process.exit(1);
  }

  const input = args[0];

  // Check if it's a file path
  if (fs.existsSync(input)) {
    logInfo(`Reading code from file: ${input}`);
    return fs.readFileSync(input, 'utf-8');
  }

  // Treat as inline code
  logInfo('Executing inline code...');
  return input;
}

/**
 * Wrap user code in async IIFE with proper error handling
 */
function wrapCode(userCode) {
  // Check if code already has its own async wrapper
  const hasAsyncWrapper = /^\s*\(?\s*async\s+\(\s*\)\s*=>\s*\{/.test(userCode) ||
                          /^\s*async\s+function/.test(userCode);

  // Check if code already requires playwright
  const hasPlaywrightRequire = /require\s*\(\s*['"]playwright/.test(userCode);

  // Build the wrapped code
  let wrappedCode = '';

  // Add requires if not present
  if (!hasPlaywrightRequire) {
    wrappedCode += `const { chromium, firefox, webkit } = require('playwright');\n`;
    wrappedCode += `const utils = require('${path.join(__dirname, 'lib', 'utils.js')}');\n\n`;
  }

  // Wrap in async IIFE if needed
  if (hasAsyncWrapper) {
    wrappedCode += userCode;
  } else {
    wrappedCode += `(async () => {\n`;
    wrappedCode += `  try {\n`;

    // Indent user code
    const indentedCode = userCode.split('\n').map(line => `    ${line}`).join('\n');
    wrappedCode += indentedCode;

    wrappedCode += `\n  } catch (error) {\n`;
    wrappedCode += `    console.error('Error during execution:', error);\n`;
    wrappedCode += `    process.exit(1);\n`;
    wrappedCode += `  }\n`;
    wrappedCode += `})();\n`;
  }

  return wrappedCode;
}

/**
 * Execute the wrapped code
 */
async function executeCode(code) {
  // Create temporary file in /tmp to avoid polluting project directory
  const tempFile = path.join('/tmp', `playwright-exec-${Date.now()}.js`);

  try {
    // Write wrapped code to temp file
    fs.writeFileSync(tempFile, code);
    logInfo(`Executing script...`);

    // Execute the script
    execSync(`node ${tempFile}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_PATH: __dirname // Allow requiring from skill directory
      }
    });

    logSuccess('Script executed successfully!');

  } catch (error) {
    if (error.status !== undefined) {
      logError(`Script exited with code ${error.status}`);
      process.exit(error.status);
    } else {
      logError('Script execution failed');
      console.error(error);
      process.exit(1);
    }
  } finally {
    // Clean up temp file
    try {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Main execution flow
 */
async function main() {
  log('\n🎭 Playwright Script Runner\n', 'bright');

  // Clean up old temp files
  cleanupTempFiles();

  // Ensure Playwright is installed
  if (!ensurePlaywrightInstalled()) {
    logError('Cannot proceed without Playwright');
    process.exit(1);
  }

  // Get the code to execute
  const userCode = await getCode();

  if (!userCode || userCode.trim().length === 0) {
    logError('No code to execute!');
    process.exit(1);
  }

  // Wrap the code with proper async handling
  const wrappedCode = wrapCode(userCode);

  // Execute
  await executeCode(wrappedCode);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    logError('Fatal error in script runner');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { wrapCode, executeCode };
