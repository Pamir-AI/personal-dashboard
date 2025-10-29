#!/bin/bash

# Run all scrapers
# This script is called by cron to update data

cd "$(dirname "$0")"

echo "[$(date)] Running scrapers..."

# Run Slickdeals scraper
node scrapers/slickdeals.js

# Run Product Hunt scraper
node scrapers/producthunt.js

echo "[$(date)] Scrapers completed"
