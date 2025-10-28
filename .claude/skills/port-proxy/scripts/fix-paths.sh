#!/bin/bash

# fix-paths.sh - Automatically fix absolute path issues for reverse proxy

set -e

DRY_RUN=false

if [ $# -eq 0 ]; then
    echo "Usage: $0 <path-to-project> [--dry-run]"
    echo ""
    echo "Options:"
    echo "  --dry-run    Show what would be changed without modifying files"
    exit 1
fi

PROJECT_PATH="$1"

if [ "$2" == "--dry-run" ]; then
    DRY_RUN=true
    echo "🔍 DRY RUN MODE - No files will be modified"
    echo ""
fi

if [ ! -d "$PROJECT_PATH" ]; then
    echo "Error: Directory not found: $PROJECT_PATH"
    exit 1
fi

echo "🔧 Fixing absolute paths in: $PROJECT_PATH"
echo ""

CHANGES_MADE=0

# Function to fix file
fix_file() {
    local file="$1"
    local pattern="$2"
    local replacement="$3"
    local description="$4"

    if grep -q "$pattern" "$file" 2>/dev/null; then
        echo "  📝 $file - $description"
        if [ "$DRY_RUN" = false ]; then
            sed -i "s|$pattern|$replacement|g" "$file"
        fi
        CHANGES_MADE=$((CHANGES_MADE + 1))
    fi
}

# Fix HTML files
echo "📄 Fixing HTML files..."
HTML_FILES=$(find "$PROJECT_PATH" -type f -name "*.html" 2>/dev/null || true)

for file in $HTML_FILES; do
    # Fix href="/..." to href="..."
    fix_file "$file" 'href="/' 'href="' "Fix absolute href paths"

    # Fix src="/..." to src="..."
    fix_file "$file" 'src="/' 'src="' "Fix absolute src paths"
done

# Fix JavaScript files
echo ""
echo "📜 Fixing JavaScript files..."
JS_FILES=$(find "$PROJECT_PATH" -type f -name "*.js" 2>/dev/null || true)

for file in $JS_FILES; do
    # Fix API_BASE = '/api' to API_BASE = 'api'
    fix_file "$file" "= '/" "= '" "Fix absolute string assignments"
    fix_file "$file" '= "/' '= "' "Fix absolute string assignments"

    # Fix fetch('/...') to fetch('...')
    fix_file "$file" "fetch('/" "fetch('" "Fix absolute fetch paths"
    fix_file "$file" 'fetch("/' 'fetch("' "Fix absolute fetch paths"
done

echo ""
echo "────────────────────────────────────────"

if [ $CHANGES_MADE -eq 0 ]; then
    echo "✅ No changes needed - files already use relative paths!"
else
    if [ "$DRY_RUN" = true ]; then
        echo "ℹ️  Would fix $CHANGES_MADE file(s)"
        echo ""
        echo "Run without --dry-run to apply changes:"
        echo "  $0 $PROJECT_PATH"
    else
        echo "✅ Fixed $CHANGES_MADE file(s)!"
        echo ""
        echo "Next steps:"
        echo "  1. Test locally: http://localhost:{PORT}/"
        echo "  2. Test via proxy: https://{subdomain}.devices.pamir.ai/vscode/proxy/{PORT}/"
        echo "  3. Hard refresh browser (Ctrl+Shift+R)"
    fi
fi
