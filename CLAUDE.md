# 👋 Welcome to Your Personal Dashboard!

Hi! I'm Claude, and I'm here to help you build a customized dashboard that tracks everything you care about on the internet.

Think of this as your personal command center - a single page that shows you:
- Breaking tech news from Hacker News
- Trending GitHub repositories
- Latest research papers from arXiv
- Fashion drops from Hypebeast
- **...or whatever YOU want to track!**

## 🚀 Let's Get Started!

I'll guide you through three simple questions to customize your dashboard. After that, I'll set everything up for you automatically.

**Ready? Just say:**

```
"I'm ready to customize my dashboard!"
```

Or if you want to jump straight in:

```
"Set up my dashboard with [topics] using [theme], updating [frequency]"
```

---

## Step 1: What Do You Want to Track?

This is the fun part! Tell me what interests you, and I'll create custom scrapers to fetch that data.

### 🎯 Already Built-In (Ready to Use)

Your dashboard comes with these sources pre-installed:

- **Hacker News** - Top tech stories and discussions
- **GitHub Trending** - Hottest open source projects
- **arXiv** - Latest computer science research papers
- **Hypebeast** - Weekly fashion and streetwear drops

### 💡 Popular Custom Ideas

Not sure what to track? Here are ideas organized by interest:

**👨‍💻 For Developers & Tech Enthusiasts**
- Product Hunt daily launches
- Stack Overflow trending questions
- Dev.to top posts
- Reddit r/programming frontpage
- npm trending packages

**💰 For Finance & Crypto**
- CoinMarketCap top movers
- Stock market indices (S&P 500, NASDAQ)
- Crypto fear & greed index
- Economic calendar events
- Reddit r/wallstreetbets hot posts

**📰 For News Junkies**
- Twitter/X trending topics
- Reddit r/worldnews or r/news
- TechCrunch latest articles
- Medium trending stories
- Wikipedia trending articles

**🛍️ For Shopping & Deals**
- Amazon Gold Box deals
- Slickdeals frontpage
- Etsy trending items
- Upcoming sneaker releases (StockX, GOAT)
- Woot daily deals

**🎬 For Entertainment**
- IMDb upcoming releases
- Letterboxd popular reviews
- Songkick concert listings
- Twitch top streams
- Podcast charts (Apple, Spotify)

**📚 For Learning**
- Coursera new courses
- YouTube trending in your categories
- Khan Academy new content
- Udemy deals
- arXiv in specific fields (physics, math, biology)

### 🎨 Or Track Something Unique!

Tell me any website and I'll build a scraper for it. Examples:
- "Track my local restaurant's reservations on OpenTable"
- "Monitor when concert tickets go on sale"
- "Watch for new job postings on a specific site"
- "Track prices on a specific product"

**Just tell me:**
```
"I want to track [website/topic]"
```

---

## Step 2: Choose Your Theme

Your dashboard should look good! Pick a theme or describe what you want:

### 🎨 Pre-Made Themes

**1. Hacker News Orange** (Default)
```
Classic tech aesthetic
- Background: Off-white (#f6f6ef)
- Accent: Orange (#ff6600)
- Font: Monospace
- Vibe: Retro terminal, minimal
```
Perfect for: Developers, tech enthusiasts

**2. Minimal Dark**
```
Modern dark mode
- Background: Dark grey (#1a1a1a)
- Accent: Teal (#00d9ff)
- Font: Sans-serif
- Vibe: Clean, professional
```
Perfect for: Night owls, extended reading

**3. Light & Airy**
```
Clean and spacious
- Background: White (#ffffff)
- Accent: Blue (#0066cc)
- Font: System default
- Vibe: Professional, easy on eyes
```
Perfect for: Daytime use, sharing

**4. Synthwave**
```
80s retro vibes
- Background: Deep purple (#1e1e2e)
- Accent: Neon pink (#ff79c6)
- Font: Rounded sans-serif
- Vibe: Fun, eye-catching
```
Perfect for: Standing out, creative projects

**5. Nord Theme**
```
Calm and sophisticated
- Background: Blue-grey (#2e3440)
- Accent: Muted blue (#88c0d0)
- Font: Sans-serif
- Vibe: Calm, nordic minimalism
```
Perfect for: Focus, productivity

**6. Solarized Light**
```
Scientifically designed colors
- Background: Cream (#fdf6e3)
- Accent: Blue (#268bd2)
- Font: Monospace
- Vibe: Easy on eyes, balanced
```
Perfect for: Long reading sessions

### 🌈 Custom Theme

Want something different? Tell me:
- Your favorite colors
- A website you like the look of
- Your company/brand colors
- Or just describe the vibe: "I want it to look like..."

**Just tell me:**
```
"I want [theme name]" or "Make it look like [description]"
```

---

## Step 3: Set Update Frequency

How often should your dashboard fetch fresh data?

### ⏱️ Frequency Options

**Very Frequent (Real-time feel)**
```
Every 15 minutes - Breaking news, stock prices, live events
Every 30 minutes - Social media, active communities
```
⚠️ Higher server load, respect rate limits

**Regular Updates (Recommended)**
```
Every 1 hour   - General news, tech sites (RECOMMENDED)
Every 3 hours  - Blog posts, articles
Every 6 hours  - Shopping deals, releases
```
✅ Good balance of freshness and efficiency

**Scheduled Updates**
```
Twice daily    - Morning (8am) and Evening (6pm)
Daily at 7am   - Overnight updates, market opens
Weekly         - Fashion drops, curated content
```
💡 Best for content that changes on a schedule

### 📅 Smart Scheduling Tips

**Match the source:**
- Hacker News / Reddit → Every 1-3 hours
- Research papers → Daily
- Fashion drops → Weekly
- Stock prices → Every 15-30 minutes
- Blog posts → Every 6 hours

**Consider your timezone:**
Schedule updates before you typically check the dashboard

**Avoid over-scraping:**
Be respectful of websites - don't hammer them with requests

**Just tell me:**
```
"Update every [frequency]" or "Update daily at [time]"
```

---

## 🎯 Quick Examples

Not sure how to phrase it? Here are complete examples:

**Example 1: Tech Enthusiast**
```
"Set up my dashboard with Hacker News, GitHub Trending, and Product Hunt.
Use the dark theme and update every hour."
```

**Example 2: Crypto Trader**
```
"I want to track Bitcoin price from CoinMarketCap, crypto news from Reddit
r/cryptocurrency, and fear & greed index. Synthwave theme, update every 15 minutes."
```

**Example 3: Researcher**
```
"Track arXiv papers in machine learning, Papers with Code trending, and
Google Scholar alerts. Solarized light theme, update daily at 7am."
```

**Example 4: Fashion Fan**
```
"Keep Hypebeast weekly drops, add StockX upcoming releases and Grailed trending.
Light & airy theme, update twice daily."
```

**Example 5: Custom**
```
"I want a dashboard like Hacker News but for design. Track Dribbble popular shots,
Behance trending, and Designer News. Orange theme, update every 3 hours."
```

---

## 🤖 What Happens Next?

Once you tell me what you want, here's what I'll do:

### 1. Build Your Scrapers (2-5 minutes)
I'll create custom Playwright scripts that:
- Navigate to your chosen websites
- Extract exactly the data you want
- Handle pagination, popups, and dynamic content
- Save clean JSON data
- Include error handling

### 2. Update Your Backend (1 minute)
I'll modify the Flask API to:
- Read your new data sources
- Serve them via REST endpoints
- Handle caching properly

### 3. Update Your Frontend (2 minutes)
I'll update the UI to:
- Display your data beautifully
- Apply your chosen theme
- Format everything nicely (timestamps, numbers, links)

### 4. Set Up Automation (1 minute)
I'll create cron jobs to:
- Run your scrapers automatically
- Update data on your schedule
- Log results for monitoring

### 5. Test Everything (1 minute)
I'll run a test to make sure:
- Scrapers work correctly
- Data displays properly
- Theme looks good
- Refresh button works

**Total time: ~10 minutes**

Then you'll have a fully functional, customized dashboard!

---

## 🆘 Need Help Deciding?

### Not Sure What to Track?

**Ask yourself:**
- What websites do I check every morning?
- What newsletters do I subscribe to?
- What do I Google regularly?
- What would save me time if it was in one place?

**Or ask me:**
```
"What should I track if I'm interested in [topic]?"
"Show me examples of dashboards for [profession/hobby]"
```

### Can't Pick a Theme?

**Ask yourself:**
- When will I use this most? (Day/night)
- What colors do I like?
- Do I want it professional or fun?

**Or just say:**
```
"Surprise me with a theme!" (I'll pick based on your content)
```

### Not Sure About Update Frequency?

**Start with:**
- **Every hour** for most sources (you can change it later)
- **Twice daily** if you only check morning/evening
- **As needed** and just use the manual refresh button

---

## 🎬 Ready to Start?

Just say one of these to begin:

```
"I'm ready to customize my dashboard!"
```
(I'll ask you the three questions)

```
"Set up my dashboard with [topics], [theme], and update [frequency]"
```
(I'll do it all at once)

```
"Help me decide what to track"
```
(I'll ask about your interests and suggest sources)

```
"Show me a demo setup"
```
(I'll set up a sample dashboard so you can see how it works)

---

## 📝 Advanced Options

Once your dashboard is running, you can always ask me to:

### Add Features
- "Add search/filter functionality"
- "Add email notifications when certain items appear"
- "Add data export (CSV/JSON)"
- "Add dark/light mode toggle"
- "Track historical data (graphs/charts)"

### Customize Further
- "Change just the colors but keep the layout"
- "Add custom CSS animations"
- "Make the cards bigger/smaller"
- "Add images/thumbnails for items"

### Manage Data
- "Show me the scrapers' debug output"
- "Why isn't [source] updating?"
- "Delete old data older than 7 days"
- "Show me what websites are being slow"

### Scale Up
- "Add 10 more sources"
- "Set different update frequencies per source"
- "Add authentication/password protection"
- "Set up multiple dashboards for different topics"

---

## 💬 I'm Here to Help!

Think of me as your pair programmer for this project. Ask me anything:

- ✅ "Can you scrape [specific website]?"
- ✅ "Why is [source] not working?"
- ✅ "How do I change [feature]?"
- ✅ "Make it look more like [website]"
- ✅ "Add a section for [new content type]"

Let's build something awesome together! 🚀

---

**So... what would you like to track?** 👀
