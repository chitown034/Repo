#!/usr/bin/env bash
# Refreshes assets/content/site.json from the live website.
# Needs python3 with beautifulsoup4 (pip install beautifulsoup4) and curl.
# Usage (from the repo root): tool/content/refresh.sh
set -euo pipefail
SITE=https://www.veteransresourcenetwork.org
WORK=$(mktemp -d)
mkdir -p "$WORK/pages"
curl -fsS "$SITE/sitemap.xml" | grep -o '<loc>[^<]*</loc>' | sed 's#<loc>##; s#</loc>##' > "$WORK/urls.txt"
# Pages the app shows that the sitemap leaves out.
printf '%s\n' "$SITE/terms-and-conditions" "$SITE/why-do-you-want-this-job" >> "$WORK/urls.txt"
sort -u "$WORK/urls.txt" | while read -r url; do
  slug=${url#"$SITE"}; slug=${slug#/}; slug=${slug%/}; [ -z "$slug" ] && slug=home
  curl -fsS "$url" -o "$WORK/pages/$slug.html"
done
python3 -I tool/content/convert.py "$WORK/pages" "$WORK/site.json"
python3 -I tool/content/app_edits.py "$WORK/site.json"
cp "$WORK/site.json" assets/content/site.json
echo "Updated assets/content/site.json ($(ls "$WORK/pages" | wc -l) pages). Run: flutter test"
