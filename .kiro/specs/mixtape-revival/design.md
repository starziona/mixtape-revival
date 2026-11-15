# Design — Mixtape Revival

## Overview
Single-page static app. Four files: `index.html` (structure),
`styles.css` (all styling incl. print), `songs.js` (catalog data),
`app.js` (state, UI, playback, share/persist). No build step, no
dependencies. Deployed to GitHub Pages as-is.

## Data model
```js
// songs.js
const SONGS = [
  { id: "s01", title, artist, durationSec, genre, mood,
    bpm, melody: [ [midiNote, beats], ... ], bass: [midiNote, ... ] }
  // 20 songs, genres: rock, pop, soul, punk, new-wave, hip-hop
  // melody: 8–16 steps, short loopable phrase per song
];
// app.js state
state = {
  title, to, from, message, theme,       // cover
  sideA: [songId, ...], sideB: [songId, ...],
  currentSide: "A" | "B",
  currentIndex: number, positionSec: number, playing: bool
}
```
Song durations are fixed catalog data (e.g. 2:30–4:10). Melody length is
independent of duration: the melody loops for the track's duration.

## Playback engine (WebAudio)
- One `AudioContext`, created lazily on first user gesture; `resume()` on
  every Play click.
- Scheduler: lookahead loop with `setInterval(25ms)` scheduling notes
  0.1s ahead. Lead voice: triangle oscillator + gain envelope
  (attack 0.01, decay per note). Bass: sine oscillator, one note per bar.
- Tape hiss: looping buffer of filtered white noise at low gain
  (created once via `createBuffer`), started/stopped with playback.
- Position tracking: `performance.now()`-based clock per track; FF/RW
  adjust `positionSec` ±10s (clamped). Track end → next track or stop.
- Reels: CSS animation class `.spinning` toggled on the cassette element
  while `state.playing`; tape counter shows mm:ss of the current track.

## Sharing / persistence
- Share: `encodeTape()` → `JSON.stringify(state sans playback)` →
  `btoa` with base64url alphabet → `#t=<payload>`; `navigator.clipboard`
  with fallback (temporary textarea + `execCommand`).
- Load: on start, if `location.hash` has `t=`, try decode; on failure
  show notice and fall back to localStorage/empty tape.
- Autosave: `localStorage.setItem("mixtape-revival-v1", JSON.stringify(tape))`
  on every mutation (debounced 300ms).

## UI layout (desktop)
```
header: logo + tagline + actions (Share, Export, Import, Print, Clear)
main (3 columns → 1 column on mobile):
  1. Catalog: search input, genre select, mood select, song list
  2. The tape: CSS cassette (reels, counter, transport buttons),
     Side A list + meter, Side B list + meter, side switch
  3. Cover designer: title/to/from/message inputs, theme swatches,
     live J-card preview
footer: note that melodies are generated, no recordings
```
Cassette visual: pure CSS — rounded dark body, two reel gears (rotating
`conic-gradient` discs), label window showing current track, A/B badge.

## Themes (J-card + accents)
1. **Sunset Cassette** (orange/pink), 2. **Midnight Radio** (deep blue),
3. **Mint Tape** (green/cream), 4. **Bubblegum** (pink/purple).
Theme = `data-theme` attribute on `<body>`; CSS variables do the work.

## Print
`@media print`: hide everything except `#jcard`; J-card prints at
~10×16 cm card size. "Print cover" button calls `window.print()`.

## Error handling
- Empty-side Play → inline notice, no exception.
- Full side on add → inline notice, song not added.
- Bad share hash / bad import file → inline notice, keep current tape.
- Clipboard API unavailable → fallback to prompt with the link text.
- AudioContext creation failure → transport buttons show "Audio unavailable".

## Verification
- `node --check songs.js app.js`
- `scripts/smoke-check.sh`: node checks + grep that index.html references
  all four files + that no `http://`/`https://` external resource is
  referenced (except the GitHub Pages link in README/docs).
- Headless Chromium load: page renders, no console errors, key elements
  present (`#catalog`, `#tape`, `#jcard`, `#transport`).
