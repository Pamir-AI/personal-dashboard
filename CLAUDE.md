# Personal Dashboard Creator

This project helps you build a customized web dashboard that tracks your interests from across the internet. Built with Flask + Vite, featuring automated data collection and a beautiful, shareable web interface.

## What You'll Get

A personal dashboard that:
- Aggregates content from multiple sources based on YOUR interests
- Auto-updates on a schedule you choose (hourly, daily, etc.)
- Has a theme that matches your style
- Is accessible anywhere via public HTTPS URL
- Loads instantly with cached data

## Getting Started

### Step 1: Choose Your Content Sources

I'll help you build scrapers for websites you care about. Here are some popular options:

#### Already Available (Ready to Use)
- **Hacker News** - Top tech stories and discussions
- **GitHub Trending** - Popular open source repositories
- **arXiv** - Latest research papers (AI/ML, physics, etc.)
- **Hypebeast** - Fashion and streetwear drops

#### Suggestions for Custom Scrapers
**Tech & Developer:**
- Product Hunt daily launches
- Stack Overflow trending questions
- Dev.to top posts
- Lobsters tech community

**Finance & Markets:**
- CoinMarketCap top movers
- Stock market indices
- Crypto fear & greed index
- Economic calendar events

**News & Media:**
- Reddit frontpage or specific subreddits
- Twitter/X trending topics
- Medium trending stories
- TechCrunch latest articles

**Lifestyle & Shopping:**
- Amazon deals of the day
- Etsy trending items
- Upcoming sneaker releases (StockX, GOAT)
- Restaurant reservations (OpenTable)

**Entertainment:**
- Upcoming movie/show releases (TMDB, IMDb)
- Concert/event listings (Songkick, Bandsintown)
- New podcast episodes
- Twitch top streams

**Learning & Knowledge:**
- Coursera new courses
- YouTube trending in your categories
- Podcast charts
- Wikipedia trending articles

### Step 2: Select Your Dashboard Theme

Choose a theme that matches your style:

#### Available Themes

**1. Hacker News Orange**
- Minimal, retro terminal aesthetic
- Orange accent (#FF6600)
- Perfect for developers and tech enthusiasts

**2. Minimal Dark**
- Modern dark mode with high contrast
- Teal/cyan accents
- Great for extended reading sessions

**3. Light & Airy**
- Clean white background with subtle shadows
- Blue accents (#0066CC)
- Professional and easy on the eyes

**4. Synthwave**
- Neon purple/pink on dark background
- 80s retro vibes
- Fun and eye-catching

**5. Nord Theme**
- Muted blue-grey palette
- Calm and sophisticated
- Popular with developers

**6. Solarized**
- Carefully designed color contrast
- Available in light or dark
- Easy on the eyes for long sessions

**Custom Theme?** I can create a theme based on:
- Your favorite colors
- Your company/brand colors
- Any inspiration (website, app, image)

### Step 3: Set Update Frequency

Choose how often your dashboard should fetch fresh data:

#### Recommended Schedules

**Frequent Updates (High Activity Sources)**
```
Every 15 minutes - Breaking news, live events, stock prices
Every 30 minutes - Social media, tech news
Every hour       - General news, trending topics
```

**Moderate Updates (Daily Content)**
```
Every 3 hours    - Blog posts, articles, most websites
Every 6 hours    - Shopping deals, releases
Twice daily      - Morning (8am) and evening (6pm)
```

**Infrequent Updates (Weekly/Curated Content)**
```
Daily at 7am     - Overnight news, market opens
Once daily       - Research papers, long-form content
Weekly           - Fashion drops, upcoming events
```

**Smart Scheduling Tips:**
- Match update frequency to how often content changes
- Avoid over-scraping (respect websites, avoid rate limits)
- Consider timezone (schedule for when YOU check it)
- Use different schedules for different sources

## Interactive Setup

Ready to build your dashboard? Just ask me:

**Option 1: Quick Start**
```
"Set up a dashboard tracking [topics] with [theme] theme, updating [frequency]"
```

Example: *"Set up a dashboard tracking crypto prices, tech news, and GitHub trending with dark theme, updating every hour"*

**Option 2: Guided Setup**
```
"Help me create a personal dashboard"
```

I'll ask you questions about:
1. What websites/topics you want to track
2. What theme you prefer (with preview examples)
3. How often you want updates
4. Custom data you want to see (prices, images, etc.)

**Option 3: Copy Existing**
```
"I want a dashboard like [website] but for [different topic]"
```

Example: *"I want a dashboard like Hacker News but for machine learning papers"*

## What I'll Build For You

### 1. Custom Web Scrapers
Using Playwright, I'll create scrapers that:
- Extract exactly the data you want
- Handle pagination, login, dynamic content
- Save structured data (JSON)
- Include error handling and retries
- Take screenshots for debugging

### 2. Flask Backend API
A Python backend that:
- Serves your scraped data via REST API
- Caches data for instant loading
- Triggers scrapers on demand or schedule
- Handles CORS and proxy compatibility

### 3. Beautiful Frontend
A Vite-powered interface with:
- Your chosen theme with custom CSS
- Responsive design (mobile-friendly)
- Real-time loading states
- One-click manual refresh
- Smart data formatting (time ago, number formatting, etc.)

### 4. Automated Updates
Cron jobs that:
- Run on your chosen schedule
- Update data in the background
- Log results for monitoring
- Won't block the UI

### 5. Public Shareable URL
Your dashboard will be accessible at:
```
https://{your-subdomain}.devices.pamir.ai/distiller/proxy/5000/
```
- Secure HTTPS
- No tunnel/proxy setup needed
- Share with friends or keep private
- Works from any device

## Dashboard Features

### Core Features (Included)
- Multiple content sources in one view
- Categorized sections (expandable/collapsible)
- Direct links to original sources
- Last updated timestamp
- Loading indicators
- Error handling with friendly messages
- Mobile responsive

### Optional Features (Just Ask)
- Search/filter data
- Bookmarking/favorites
- Email/Slack notifications for specific items
- Data export (JSON, CSV)
- Historical data tracking
- Custom sorting options
- Dark/light mode toggle
- RSS feed generation

## Example Dashboards I Can Build

### "Tech Scout"
Sources: Hacker News + GitHub Trending + Dev.to + Product Hunt
Theme: Dark minimal
Updates: Every hour
Perfect for: Developers, tech enthusiasts

### "Crypto Command Center"
Sources: CoinMarketCap + CryptoPanic + Reddit r/cryptocurrency
Theme: Synthwave with price charts
Updates: Every 15 minutes
Perfect for: Crypto traders

### "Fashion Forward"
Sources: Hypebeast + Grailed + StockX upcoming drops
Theme: Light & airy with product images
Updates: Twice daily
Perfect for: Sneakerheads, fashion enthusiasts

### "Research Radar"
Sources: arXiv + Papers with Code + Google Scholar alerts
Theme: Solarized light
Updates: Daily at 7am
Perfect for: Researchers, students

### "Deal Hunter"
Sources: Slickdeals + Amazon Gold Box + Woot
Theme: Custom (sale red highlights)
Updates: Every 30 minutes
Perfect for: Bargain hunters

## Technical Details

### Project Structure
```
your-dashboard/
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   └── venv/              # Virtual environment
├── frontend/
│   ├── index.html         # Dashboard UI
│   ├── main.js            # Logic & data fetching
│   ├── styles.css         # Your custom theme
│   └── package.json       # Node dependencies
├── scrapers/              # Your custom scrapers
│   ├── source1-scraper.js
│   ├── source2-scraper.js
│   └── ...
├── drops-output/          # Cached data (JSON files)
├── cron-jobs/             # Automated update scripts
└── start.sh              # One-command startup
```

### Tech Stack
- **Backend**: Flask (Python) - Simple, powerful, easy to extend
- **Frontend**: Vite + Vanilla JS - Fast, no framework bloat
- **Scraping**: Playwright (Node.js) - Handles modern websites
- **Scheduling**: cron - Native Linux scheduling
- **Hosting**: Distiller proxy - Built-in HTTPS exposure

### Resource Usage
- **Disk**: ~50-100MB for scraped data (auto-cleanup available)
- **Memory**: ~200MB for Flask + scrapers
- **CPU**: Minimal (only during scraping)
- **Network**: Depends on sources (typically <1GB/month)

## Maintenance & Updates

### Adding New Sources
```
"Add [website] to my dashboard"
```
I'll create a new scraper and integrate it.

### Changing Theme
```
"Change my dashboard theme to [theme name]"
```
I'll update the CSS with your new theme.

### Adjusting Schedule
```
"Update [source] to refresh [frequency]"
```
I'll modify the cron jobs.

### Debugging
```
"My dashboard isn't showing [source] data"
```
I'll check logs, test scrapers, and fix issues.

## Privacy & Security

### Your Data
- All data stays on your device (no external storage)
- You control what's scraped and when
- Can delete cached data anytime
- No tracking or analytics (unless you add them)

### Scraping Ethics
- Respect robots.txt (I'll check for you)
- Use reasonable rate limits
- Don't scrape user-generated content without permission
- Follow website terms of service

### Access Control
- Dashboard is public by default (via proxy URL)
- Can add password protection if needed
- Can restrict to localhost only
- Can use environment variables for API keys

## Getting Help

### Common Issues

**No data showing?**
- Click "Refresh" button to trigger scrapers
- Check if scrapers completed (look for JSON files in drops-output/)
- Check browser console for API errors

**Scrapers failing?**
- Websites may have changed structure (I'll update selectors)
- Check internet connection
- Some sites block automated access (I can add anti-detection)

**Dashboard not accessible via proxy?**
- Make sure Flask is running on 0.0.0.0:5000
- Check firewall settings
- Verify proxy URL format

**Updates not running automatically?**
- Check cron jobs: `crontab -l`
- Check cron logs: `grep CRON /var/log/syslog`
- Verify script permissions (executable)

### Need Changes?

Just ask me! Examples:
- "Add filtering by keyword"
- "Show images in grid instead of list"
- "Add a section for my Twitter bookmarks"
- "Change colors to match my brand"
- "Add email notifications for specific items"

## Next Steps

**I'm ready to build your dashboard! Just tell me:**

1. **What do you want to track?** (websites, topics, or choose from suggestions above)
2. **What theme do you like?** (pick from list or describe your own)
3. **How often should it update?** (pick a schedule or tell me when you want fresh data)

**Example responses:**
- "I want to track machine learning papers, GitHub ML repos, and AI news. Dark theme with teal accents. Update twice daily at 7am and 6pm."
- "Make me a dashboard like Hacker News but for product launches and startup news. Orange theme. Update every hour."
- "Track Bitcoin price, crypto news from Reddit, and NFT drops. Synthwave theme. Update every 15 minutes."

Or simply say: **"Help me build a dashboard"** and I'll guide you through each step!
