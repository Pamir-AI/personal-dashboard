from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
import json
import os
import subprocess
import threading
from pathlib import Path
from datetime import datetime

app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)

# Add CSP header to allow external images
@app.after_request
def add_security_headers(response):
    # Allow images from any source (for Hypebeast images)
    response.headers['Content-Security-Policy'] = "img-src 'self' data: blob: https: http:;"
    return response


class DistillerProxyFix:
    """Strip Distiller proxy prefix so Flask can match routes normally."""

    PROXY_PREFIX_ROOT = '/distiller/proxy/'

    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        path = environ.get('PATH_INFO', '')
        method = environ.get('REQUEST_METHOD', '')
        prefix = environ.get('HTTP_X_FORWARDED_PREFIX')

        # Debug logging
        print(f"[ProxyFix] Method: {method}, Original path: {path}")

        # Infer prefix from known Distiller proxy pattern if header is missing
        if not prefix and path.startswith(self.PROXY_PREFIX_ROOT):
            remainder = path[len(self.PROXY_PREFIX_ROOT):]
            port, _, rest = remainder.partition('/')
            if port.isdigit():
                prefix = f'{self.PROXY_PREFIX_ROOT}{port}'
                path = rest if rest.startswith('/') else f'/{rest}' if rest else '/'

        if prefix:
            if path.startswith(prefix):
                stripped = path[len(prefix):]
                environ['PATH_INFO'] = stripped if stripped else '/'
            else:
                environ['PATH_INFO'] = path
            original_script = environ.get('SCRIPT_NAME', '')
            if not original_script.endswith(prefix):
                environ['SCRIPT_NAME'] = f'{original_script}{prefix}'
        else:
            environ['PATH_INFO'] = path or '/'

        # Debug logging
        print(f"[ProxyFix] Final path: {environ['PATH_INFO']}, Prefix: {prefix}")

        return self.app(environ, start_response)


app.wsgi_app = DistillerProxyFix(app.wsgi_app)  # type: ignore[assignment]

# Paths
DROPS_DIR = Path(__file__).parent.parent / 'drops'
SCRAPERS_DIR = Path(__file__).parent.parent / 'scrapers'

# Ensure output directory exists
DROPS_DIR.mkdir(parents=True, exist_ok=True)

# API Endpoints (MUST come BEFORE catch-all routes)

@app.route('/api/health')
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'timestamp': datetime.now().isoformat()})

@app.route('/api/drops', methods=['GET'])
def get_drops():
    """Get cached data from all sources"""
    try:
        # Read Slickdeals data
        slickdeals_file = DROPS_DIR / 'slickdeals.json'
        slickdeals_data = {}
        if slickdeals_file.exists():
            with open(slickdeals_file, 'r') as f:
                slickdeals_data = json.load(f)

        # Read Product Hunt data
        producthunt_file = DROPS_DIR / 'producthunt.json'
        producthunt_data = {}
        if producthunt_file.exists():
            with open(producthunt_file, 'r') as f:
                producthunt_data = json.load(f)

        # Get most recent timestamp
        timestamps = [
            slickdeals_data.get('lastUpdated'),
            producthunt_data.get('lastUpdated')
        ]
        timestamps = [t for t in timestamps if t]
        last_updated = timestamps[0] if timestamps else None

        return jsonify({
            'success': True,
            'slickdeals': slickdeals_data,
            'producthunt': producthunt_data,
            'last_updated': last_updated
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def run_scrapers_background():
    """Background task to run all scrapers"""
    results = {}

    # Define all scrapers
    scrapers = {
        'slickdeals': 'slickdeals.js',
        'producthunt': 'producthunt.js'
    }

    # Run each scraper
    for name, script in scrapers.items():
        script_path = SCRAPERS_DIR / script

        try:
            result = subprocess.run(
                ['node', str(script_path)],
                cwd=str(SCRAPERS_DIR),
                capture_output=True,
                text=True,
                timeout=120
            )

            results[name] = {
                'success': result.returncode == 0,
                'output': result.stdout[-300:] if result.stdout else '',
                'error': result.stderr[-200:] if result.returncode != 0 else None
            }
        except subprocess.TimeoutExpired:
            results[name] = {
                'success': False,
                'error': f'{name} scraper timeout (120s)'
            }
        except Exception as e:
            results[name] = {
                'success': False,
                'error': str(e)
            }

    print(f"Background scraping completed: {results}")

@app.route('/api/refresh', methods=['POST'])
def refresh_drops():
    """Trigger all scrapers to get fresh data (runs in background)"""
    try:
        # Start scrapers in background thread
        thread = threading.Thread(target=run_scrapers_background, daemon=True)
        thread.start()

        # Return immediately
        return jsonify({
            'success': True,
            'message': 'Refresh started in background. Data will be updated in 1-2 minutes.',
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Frontend serving routes (MUST come AFTER API routes)
@app.route('/')
def serve_frontend():
    """Serve the main frontend page"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static assets"""
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    print(f"📁 Drops output directory: {DROPS_DIR}")
    print(f"🎭 Scrapers directory: {SCRAPERS_DIR}")
    print(f"🚀 Starting Flask server on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
