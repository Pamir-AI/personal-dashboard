---
name: port-proxy
description: This skill should be used when users want to expose local web applications publicly through the Distiller platform's built-in reverse proxy, or when fixing path issues (CSS/JS not loading, API 404s) caused by absolute paths behind reverse proxies. Use when users mention making apps public, proxy errors, or MIME type issues.
---

# Distiller Reverse Proxy

## Overview

The Distiller platform provides a built-in reverse proxy capability that exposes local web applications to the internet via HTTPS without requiring tunnel services, port forwarding, or proxy configuration. This skill addresses the common issue of absolute paths breaking behind reverse proxies and provides tools to fix these issues automatically.

**Key Pattern:**
```
Local App (port 5000) → Distiller Proxy → Public HTTPS URL
http://localhost:5000  → https://subdomain.devices.pamir.ai/distiller/proxy/5000/
```

## When to Use This Skill

Use this skill when users:
- Want to make a local web app publicly accessible
- Report CSS or JavaScript not loading (MIME type errors)
- Experience API calls returning 404 errors
- Ask about exposing apps through the Distiller proxy
- Mention reverse proxy path issues

## Quick Start

### Expose Any App in 3 Steps

**Step 1: Run the app locally**
```bash
# Any web server on any port
python app.py              # Flask on 5000
npm run dev                # Vite on 3000
python -m http.server 8080 # HTTP server on 8080
```

**Step 2: Access via proxy URL**
```
https://{subdomain}.devices.pamir.ai/distiller/proxy/{PORT}/
```

**🔍 Find your subdomain:** Check frpc config
```bash
cat /etc/frp/frpc.toml | grep subdomain
# Example output: subdomain = "test"
# Your URL: https://test.devices.pamir.ai/distiller/proxy/5000/
```

**Step 3: Fix path issues if needed**
```bash
# Check for issues
./scripts/check-paths.sh /path/to/app

# Auto-fix common patterns
./scripts/fix-paths.sh /path/to/app
```

## The Absolute vs Relative Path Problem

**Root cause:** Absolute paths (starting with `/`) resolve to domain root, breaking when behind reverse proxies.

**Symptoms:**
- CSS not loading: "MIME type 'application/json' is not a supported stylesheet"
- JavaScript 404 errors
- API calls fail with 404
- Images don't load

**Examples:**

❌ **Broken (absolute paths):**
```html
<link rel="stylesheet" href="/styles.css">
<script src="/main.js"></script>
```
Resolves to: `https://domain.com/styles.css` (wrong - not behind proxy path)

✅ **Working (relative paths):**
```html
<link rel="stylesheet" href="styles.css">
<script src="main.js"></script>
```
Resolves to: `https://domain.com/distiller/proxy/5000/styles.css` (correct)

## Fixing Path Issues

### Automatic Fix (Recommended)

Use the provided script to automatically fix common patterns:

```bash
# Dry run (preview changes)
./scripts/fix-paths.sh /path/to/app --dry-run

# Apply fixes
./scripts/fix-paths.sh /path/to/app
```

The script fixes:
- HTML: `href="/..."` → `href="..."`
- HTML: `src="/..."` → `src="..."`
- JavaScript: `API_BASE = '/api'` → `API_BASE = 'api'`
- JavaScript: `fetch('/api/...')` → `fetch('api/...')`

### Manual Fix

**HTML Files:**
```html
<!-- BEFORE -->
<link rel="stylesheet" href="/styles.css">
<script src="/main.js"></script>
<img src="/logo.png">

<!-- AFTER -->
<link rel="stylesheet" href="styles.css">
<script src="main.js"></script>
<img src="logo.png">
```

**JavaScript Files:**
```javascript
// BEFORE
const API_BASE = '/api';
fetch('/api/data');

// AFTER
const API_BASE = 'api';
fetch('api/data');
```

**Exception:** Keep absolute paths for external resources:
```html
<!-- These are fine (external URLs) -->
<script src="https://cdn.example.com/library.js"></script>
```

## Framework-Specific Guides

### Flask (Python)

**Works well by default.** Only fix HTML templates.

```python
# No changes needed to Flask code
app = Flask(__name__, static_folder='static')

@app.route('/api/data')
def data():
    return jsonify({'status': 'ok'})
```

**Fix:** Change paths in HTML templates from absolute to relative.

### Vite (JavaScript)

Add base path configuration:

```javascript
// vite.config.js
export default defineConfig({
  base: './', // Use relative base path
  server: {
    host: '0.0.0.0',
    port: 3000
  }
})
```

### Create React App

Update package.json:

```json
{
  "homepage": "."
}
```

### Express (Node.js)

```javascript
const express = require('express');
const app = express();

app.use(express.static('public'));

app.get('/api/data', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(5000, '0.0.0.0');
```

**Fix:** HTML files to use relative paths.

## Common Issues

### CSS loads but styles not applied

**Cause:** MIME type mismatch

**Solution:**
1. Check browser console for error
2. Verify path is relative: `href="styles.css"` not `href="/styles.css"`

### API calls return HTML instead of JSON

**Cause:** Flask returning index.html for missing routes

**Solution:**
```python
# Make sure API routes come BEFORE catch-all
@app.route('/api/data')
def data():
    return jsonify({'status': 'ok'})

# This should be last
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)
```

### Page loads but refresh gives 404

**Cause:** Client-side routing needs server fallback

**Solution:**
```python
@app.errorhandler(404)
def not_found(e):
    # For SPA with client-side routing
    if request.path.startswith('/api/'):
        return jsonify(error='Not found'), 404
    return send_from_directory(app.static_folder, 'index.html')
```

### POST requests timeout or return 404

**Cause:** Long-running operations (>30s) don't work well through proxy

**Symptoms:**
- POST requests hang/timeout after 30-60 seconds
- Request completes on server but browser never gets response
- Works locally but fails through proxy

**Solution:** Use background tasks with immediate response

```python
import threading

def run_long_task():
    """Background task"""
    # Do expensive work here
    time.sleep(60)
    # Save results to file/database

@app.route('/api/process', methods=['POST'])
def process_data():
    # Start task in background
    thread = threading.Thread(target=run_long_task, daemon=True)
    thread.start()

    # Return immediately
    return jsonify({
        'success': True,
        'message': 'Processing started. Check back in 1-2 minutes.'
    })

# Frontend polls for updates
// JavaScript
async function startProcess() {
    const res = await fetch('./api/process', { method: 'POST' });
    const data = await res.json();

    // Poll every 10 seconds for updates
    const interval = setInterval(async () => {
        const status = await fetch('./api/status');
        const result = await status.json();
        if (result.complete) {
            clearInterval(interval);
            // Update UI with results
        }
    }, 10000);
}
```

**Why:** The proxy can't maintain connections for long-running synchronous requests. Background tasks + polling is the standard pattern for web apps.

## Best Practices

1. **Use relative paths everywhere**
   - ✅ `href="style.css"`
   - ❌ `href="/style.css"`

2. **Namespace API routes**
   - ✅ `/api/users`, `/api/data`
   - ❌ `/users` (conflicts with static files)

3. **Test locally first**
   - Test on `http://localhost:5000/`
   - Then test through proxy

4. **Document the public URL**
   ```markdown
   Public: https://subdomain.devices.pamir.ai/distiller/proxy/5000/
   Local: http://localhost:5000/
   ```

## Port Management

### Check what's running

```bash
# See all listening ports
netstat -tuln | grep LISTEN

# Check specific port
lsof -i :5000
```

### Common port assignments

| Port | Typical Use |
|------|-------------|
| 5000 | Flask apps |
| 3000 | Vite/React dev servers |
| 8000 | Django apps |
| 8080 | Generic web servers |

### Kill process on port

```bash
lsof -i :5000
kill -9 {PID}

# Or one-liner
pkill -f "python app.py"
```

## Resources

### scripts/

**check-paths.sh** - Scans project files for absolute path issues and reports potential problems.

**fix-paths.sh** - Automatically fixes common absolute path patterns in HTML and JavaScript files.

Usage examples are shown in the "Fixing Path Issues" section above.

## Quick Reference

```
┌─────────────────────────────────────────────────┐
│ Distiller Proxy Quick Reference                │
├─────────────────────────────────────────────────┤
│ URL Pattern:                                    │
│ https://{subdomain}.devices.pamir.ai/          │
│        distiller/proxy/{PORT}/                  │
│                                                 │
│ Fix Checklist:                                  │
│ □ Remove leading / from href/src               │
│ □ Change API calls to relative paths           │
│ □ Test locally first                           │
│ □ Hard refresh browser (Ctrl+Shift+R)          │
│                                                 │
│ Common Fixes:                                   │
│ href="/style.css"  → href="style.css"          │
│ src="/main.js"     → src="main.js"             │
│ fetch('/api/...')  → fetch('api/...')          │
└─────────────────────────────────────────────────┘
```
