#!/usr/bin/env bash
# Mixtape Revival — smoke check (also run by the .kiro PostTaskExec hook).
# Fails loudly on: JS syntax errors, missing file references, or any
# external http(s) resource referenced from index.html.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== node --check =="
node --check songs.js && echo "songs.js OK"
node --check app.js && echo "app.js OK"

echo "== file references =="
for f in styles.css songs.js app.js assets/favicon.svg; do
  if [ ! -f "$f" ]; then echo "MISSING: $f"; exit 1; fi
done
grep -q 'href="styles.css"' index.html || { echo "index.html does not reference styles.css"; exit 1; }
grep -q 'src="songs.js"' index.html || { echo "index.html does not reference songs.js"; exit 1; }
grep -q 'src="app.js"' index.html || { echo "index.html does not reference app.js"; exit 1; }
echo "references OK"

echo "== no external resources in index.html =="
if grep -Eo 'https?://[^"'\'' >]+' index.html | grep -v 'www.w3.org' | grep -q .; then
  echo "external URL found in index.html:"; grep -Eo 'https?://[^"'\'' >]+' index.html
  exit 1
fi
echo "no external resources OK"

echo "== catalog sanity =="
node -e "
const fs = require('fs');
const SONGS = new Function(fs.readFileSync('songs.js', 'utf8') + '; return SONGS;')();
if (SONGS.length < 18) throw new Error('catalog has fewer than 18 songs: ' + SONGS.length);
if (new Set(SONGS.map(s => s.id)).size !== SONGS.length) throw new Error('duplicate song ids');
for (const s of SONGS) {
  if (!(s.durationSec >= 135 && s.durationSec <= 255)) throw new Error('bad duration: ' + s.id);
  if (!Array.isArray(s.melody) || s.melody.length < 8) throw new Error('bad melody: ' + s.id);
  if (!Array.isArray(s.bass) || !s.bass.length) throw new Error('bad bass: ' + s.id);
}
console.log('catalog OK (' + SONGS.length + ' songs)');
"

echo "SMOKE CHECK PASSED"
