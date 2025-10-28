# Personal Dashboard

> Build your own customizable web dashboard that tracks your interests from across the internet

A lightweight, self-hosted personal dashboard built with Flask + Vite. Aggregate content from multiple sources, customize the look, and access it anywhere via HTTPS.

![Dashboard Screenshot](https://img.shields.io/badge/status-active-success)
![Python](https://img.shields.io/badge/python-3.9+-blue)
![Node](https://img.shields.io/badge/node-18+-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- **Multi-Source Aggregation** - Fetch data from multiple websites in one place
- **Built-in Scrapers** - Hacker News, GitHub Trending, arXiv papers, Hypebeast drops
- **Customizable Themes** - Choose from 6 pre-made themes or create your own
- **Auto-Updates** - Schedule data refreshes with cron jobs
- **One-Click Refresh** - Manual refresh button for on-demand updates
- **Public Access** - Share via HTTPS with Distiller proxy (or keep it private)
- **Fast & Lightweight** - Cached data means instant loading
- **Mobile Friendly** - Responsive design works on any device

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- Chromium (for web scraping)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/personal-dashboard.git
   cd personal-dashboard
   ```

2. **Set up backend (Flask)**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cd ..
   ```

3. **Set up scrapers (Playwright)**
   ```bash
   cd scrapers
   npm install
   npx playwright install chromium
   cd ..
   ```

4. **Set up frontend (optional, for development)**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Run the Dashboard

**Option 1: Quick Start (Recommended)**
```bash
./start.sh
```

**Option 2: Manual Start**
```bash
cd backend
source venv/bin/activate
python app.py
```

Then open your browser to **http://localhost:5000**

## Project Structure

```
personal-dashboard/
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   └── venv/              # Virtual environment (created on setup)
├── frontend/
│   ├── index.html         # Dashboard UI
│   ├── main.js            # Frontend logic
│   ├── styles.css         # Theme & styling
│   ├── package.json       # Node dependencies
│   └── vite.config.js     # Vite configuration
├── scrapers/
│   ├── hypebeast-scraper.js       # Fashion drops
│   ├── hackernews-scraper.js      # Tech news
│   ├── github-trending-scraper.js # Trending repos
│   ├── arxiv-scraper.js           # Research papers
│   └── package.json               # Scraper dependencies
├── drops-output/          # Cached data (JSON files)
├── CLAUDE.md             # Interactive setup guide
├── README.md             # This file
├── .gitignore
└── start.sh              # Quick start script
```

## How It Works

1. **Scrapers** run (manually or via cron) and fetch data from websites
2. **Data** is saved as JSON files in `drops-output/`
3. **Flask backend** serves the cached data via REST API
4. **Frontend** displays the data in a beautiful, themed interface
5. **Refresh button** triggers scrapers to fetch fresh data

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│  Scrapers   │ ───▶ │ drops-output │ ───▶ │ Flask API    │
│ (Playwright)│      │   (JSON)     │      │ (localhost)  │
└─────────────┘      └──────────────┘      └──────┬───────┘
                                                   │
                                                   ▼
                                            ┌──────────────┐
                                            │   Frontend   │
                                            │  (Vite UI)   │
                                            └──────────────┘
```

## Available Scrapers

| Scraper | Description | Output File |
|---------|-------------|-------------|
| **Hacker News** | Top 30 tech stories with points, comments | `hackernews.json` |
| **GitHub Trending** | Top 25 trending repos with stars, forks | `github-trending.json` |
| **arXiv** | Latest 20 CS research papers with abstracts | `arxiv.json` |
| **Hypebeast** | Weekly fashion/streetwear drops with prices | `hypebeast-drops.json` |

## Running Scrapers

### Manual Run (One-Time)
```bash
cd scrapers
node hackernews-scraper.js
node github-trending-scraper.js
node arxiv-scraper.js
node hypebeast-scraper.js
```

### Via Dashboard (One-Click)
Click the **"Refresh Data"** button in the dashboard UI

### Automated (Cron Job)
Edit your crontab:
```bash
crontab -e
```

Add a schedule (example: every hour):
```bash
0 * * * * cd /path/to/personal-dashboard/scrapers && /usr/bin/node hackernews-scraper.js
0 * * * * cd /path/to/personal-dashboard/scrapers && /usr/bin/node github-trending-scraper.js
```

## API Endpoints

### `GET /api/health`
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-28T18:00:00.000Z"
}
```

### `GET /api/drops`
Get all cached data

**Response:**
```json
{
  "success": true,
  "hypebeast": { ... },
  "hackernews": { ... },
  "github": { ... },
  "arxiv": { ... },
  "last_updated": "2025-10-28T18:00:00.000Z"
}
```

### `POST /api/refresh`
Trigger all scrapers (runs in background)

**Response:**
```json
{
  "success": true,
  "message": "Refresh started in background. Data will be updated in 1-2 minutes.",
  "timestamp": "2025-10-28T18:00:00.000Z"
}
```

## Customization

### Add New Scraper

1. Create a new file in `scrapers/` (e.g., `reddit-scraper.js`)
2. Use Playwright to scrape your target website
3. Save output to `../drops-output/yourdata.json`
4. Update `backend/app.py` to read and serve the new data
5. Update `frontend/main.js` to display the new data

**Template:**
```javascript
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../drops-output');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://example.com');

  const data = await page.evaluate(() => {
    // Extract data from page
    return { items: [] };
  });

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'yourdata.json'),
    JSON.stringify({ timestamp: new Date().toString(), data }, null, 2)
  );

  await browser.close();
})();
```

### Change Theme

Edit `frontend/styles.css` to customize colors, fonts, and layout. See `CLAUDE.md` for theme inspiration and examples.

### Change Update Frequency

Edit your crontab to adjust how often scrapers run. See cron patterns:
- `*/15 * * * *` - Every 15 minutes
- `0 */3 * * *` - Every 3 hours
- `0 8,18 * * *` - Twice daily (8am, 6pm)
- `0 8 * * *` - Daily at 8am

## Public Access (Optional)

### Via Distiller Proxy

If running on a Distiller device, your dashboard is automatically accessible via:

```
https://{subdomain}.devices.pamir.ai/distiller/proxy/5000/
```

The app is already configured with proxy-compatible routing (relative paths, DistillerProxyFix middleware).

### Via Ngrok/Cloudflare Tunnel

For other setups, use ngrok or Cloudflare Tunnel:

```bash
# Ngrok
ngrok http 5000

# Cloudflare Tunnel
cloudflared tunnel --url http://localhost:5000
```

## Troubleshooting

### No data showing?

Click the "Refresh Data" button to run scrapers for the first time.

### Scrapers fail with "browser not found"?

Install Chromium:
```bash
cd scrapers
npx playwright install chromium
```

### Port 5000 already in use?

Change port in `backend/app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=5001)  # Use 5001 instead
```

### Frontend not loading?

Make sure you're accessing the correct URL:
- Local: `http://localhost:5000`
- Proxy: `https://{subdomain}.devices.pamir.ai/distiller/proxy/5000/`

Hard refresh your browser: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)

## Development

### Frontend Development (with Vite)

For frontend-only development with hot reload:

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
python app.py

# Terminal 2: Frontend
cd frontend
npm run dev
```

Open `http://localhost:3000` (Vite dev server with hot reload)

### Production Build

Build the frontend for production:

```bash
cd frontend
npm run build
```

Built files will be in `frontend/` and served by Flask at `http://localhost:5000`

## Interactive Setup

See **CLAUDE.md** for an interactive guide that helps you:
- Choose content sources to track
- Pick a theme that matches your style
- Set up automated updates
- Customize the dashboard to your needs

## Tech Stack

- **Backend**: [Flask](https://flask.palletsprojects.com/) - Python web framework
- **Frontend**: [Vite](https://vitejs.dev/) - Fast build tool for modern web
- **Scraping**: [Playwright](https://playwright.dev/) - Browser automation
- **Scheduling**: cron - Native Linux task scheduling

## Contributing

Contributions welcome! Please feel free to:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Ideas for contributions:**
- New scrapers (Reddit, Twitter, Product Hunt, etc.)
- New themes
- Data visualization features
- Search/filter functionality
- Dark mode toggle
- Export features (CSV, RSS)

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with the Flask-Vite starter template
- Inspired by Hacker News, GitHub Trending, and personal aggregator tools
- Powered by Playwright for reliable web scraping

---

**Made with Claude Code** 🤖

*Need help customizing? Check out CLAUDE.md or open an issue!*
