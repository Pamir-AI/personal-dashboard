
#!/bin/bash

# check-paths.sh - Scan project for absolute path issues

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <path-to-project>"
    exit 1
fi

PROJECT_PATH="$1"

if [ ! -d "$PROJECT_PATH" ]; then
    echo "Error: Directory not found: $PROJECT_PATH"
    exit 1
fi

echo "🔍 Checking for absolute path issues in: $PROJECT_PATH"
echo ""

ISSUES_FOUND=0

# Check HTML files
echo "📄 Checking HTML files..."
HTML_ISSUES=$(grep -rn 'href="/' "$PROJECT_PATH" --include="*.html" 2>/dev/null || true)
HTML_SRC_ISSUES=$(grep -rn 'src="/' "$PROJECT_PATH" --include="*.html" 2>/dev/null || true)

if [ -n "$HTML_ISSUES" ]; then
    echo "⚠️  Found absolute href paths:"
    echo "$HTML_ISSUES"
    echo ""
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if [ -n "$HTML_SRC_ISSUES" ]; then
    echo "⚠️  Found absolute src paths:"
    echo "$HTML_SRC_ISSUES"
    echo ""
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check JavaScript files
echo "📜 Checking JavaScript files..."
JS_FETCH_ISSUES=$(grep -rn "fetch('[/]" "$PROJECT_PATH" --include="*.js" 2>/dev/null || true)
JS_API_ISSUES=$(grep -rn '= ['"'"'"]/' "$PROJECT_PATH" --include="*.js" 2>/dev/null | grep -i api || true)

if [ -n "$JS_FETCH_ISSUES" ]; then
    echo "⚠️  Found absolute fetch() paths:"
    echo "$JS_FETCH_ISSUES"
    echo ""
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if [ -n "$JS_API_ISSUES" ]; then
    echo "⚠️  Found potential absolute API paths:"
    echo "$JS_API_ISSUES"
    echo ""
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo "────────────────────────────────────────"

if [ $ISSUES_FOUND -eq 0 ]; then
    echo "✅ No obvious path issues found!"
else
    echo "⚠️  Found $ISSUES_FOUND potential issue(s)"
    echo ""
    echo "Run fix-paths.sh to automatically fix common patterns:"
    echo "  $0/../fix-paths.sh $PROJECT_PATH --dry-run"
fi
