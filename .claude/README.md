# Claude Code Configuration

This directory contains skills and configuration for use with [Claude Code](https://claude.com/claude-code).

## Available Skills

### playwright
General-purpose browser automation skill for Playwright. Use this when you want to:
- Create new web scrapers
- Test interactive flows
- Extract data from dynamic websites
- Handle login flows and authentication

**Location:** `.claude/skills/playwright/`

### web-automation
Extended web automation examples and utilities. Includes:
- Example scrapers (Hypebeast, Hacker News, GitHub, arXiv)
- Anti-detection techniques
- Cloudflare handler
- Form submission examples

**Location:** `.claude/skills/web-automation/`

### port-proxy
Tools and guides for exposing your dashboard via reverse proxy. Use this when you want to:
- Make your local dashboard publicly accessible
- Fix path issues with CSS/JS not loading
- Configure proxy-compatible routing

**Location:** `.claude/skills/port-proxy/`

## Using These Skills with Claude Code

If you're using Claude Code, you can invoke these skills to:

**Create a new scraper:**
```
"Help me create a scraper for [website] using the playwright skill"
```

**Fix proxy issues:**
```
"My dashboard CSS isn't loading through the proxy - use the port-proxy skill"
```

**Extend automation:**
```
"Show me examples from the web-automation skill for handling login"
```

## Project-Specific Skills

You can add project-specific skills by creating new skill directories here. See the [Claude Code Skills documentation](https://docs.claude.com/) for more information.

## Without Claude Code

If you're not using Claude Code, you can still:
- Reference the example scrapers in `.claude/skills/web-automation/examples/`
- Use the Playwright utilities in `.claude/skills/playwright/lib/`
- Read the port-proxy guide in `.claude/skills/port-proxy/SKILL.md`
