# Tasks — Mixtape Revival

Spec: `.kiro/specs/mixtape-revival/requirements.md`
Design: `.kiro/specs/mixtape-revival/design.md`
Steering: `.kiro/steering/product.md`, `tech.md`, `structure.md`

Implement in order. Mark each task done with `[x]` when finished and
verified. Do not use any external CDN, font, or image. Everything must
work offline from local files. Run `node --check` on every JS file you
write or change, and run `bash scripts/smoke-check.sh` after task 7.

- [x] 1. Scaffold
  - Create `index.html` with the full page skeleton: header (title,
    tagline, action buttons: Share, Export, Import, Print cover, Clear
    tape), `<main>` with three sections (`#catalog`, `#tape`,
    `#cover`), footer note, and script tags for `songs.js` then `app.js`.
  - Create `styles.css` with CSS variables, the 4 themes, layout
    (3 columns desktop → 1 column mobile), and the `@media print` block
    that shows only `#jcard`.
  - Create `assets/favicon.svg` (simple cassette icon) and link it.
  - Create `scripts/smoke-check.sh` (node --check for songs.js/app.js;
    grep that index.html references styles.css, songs.js, app.js; fail
    if any external http(s) resource is referenced in index.html).
  - _Requirements: R7_

- [x] 2. Song catalog data (`songs.js`)
  - Define `SONGS` with 20 songs: id, title, artist, durationSec,
    genre (rock/pop/soul/punk/new-wave/hip-hop), mood
    (happy/sad/romantic/party/chill), bpm, `melody` (8–16
    `[midiNote, beats]` steps) and `bass` (root notes).
  - Titles/artists must be original or public-domain-style names — do
    NOT copy real chart songs. Keep durations between 2:15 and 4:15.
  - _Requirements: R1_

- [x] 3. Catalog UI + tape building (`app.js`, `index.html`)
  - Render the catalog list from `SONGS` with search input (live filter
    by title/artist) and genre + mood selects.
  - Each catalog row: title, artist, duration, genre tag, "Add to A"
    and "Add to B" buttons.
  - Render Side A and Side B lists with per-track remove/up/down
    buttons, used/remaining time and a fill meter per side (45:00 max).
  - Adding to a full side shows an inline notice and does not add.
  - _Requirements: R1, R2_

- [x] 4. Playback engine (`app.js`)
  - Lazy AudioContext (create/resume on user gesture). Scheduler with
    25ms lookahead: triangle lead voice from the track melody, sine
    bass, filtered-noise tape hiss while playing.
  - Transport: Play/Pause, Stop, Next, Prev, FF (+10s), RW (−10s).
  - Clicking a tape track selects it and starts playback. Track end
    advances to the next track on the same side, then stops.
  - Progress bar, current track display, tape counter (mm:ss), and
    spinning reel animation while playing. Empty-side Play shows an
    inline notice.
  - _Requirements: R4_

- [x] 5. Cover designer (`app.js`, `index.html`, `styles.css`)
  - Inputs: tape title, To, From, dedication message. Live-update the
    J-card preview on input.
  - 4 theme swatches (Sunset Cassette, Midnight Radio, Mint Tape,
    Bubblegum); picking one sets `data-theme` on `<body>` and restyles
    the J-card + accents immediately.
  - J-card preview shows title, To/From, message, and both sides'
    tracklists with durations.
  - _Requirements: R5_

- [x] 6. Share, export, import, print (`app.js`)
  - "Copy share link": encode tape to base64url JSON in `#t=...`,
    copy to clipboard (with fallback), show "Link copied".
  - On load: decode `#t=...` if present; invalid data → notice, fall
    back to saved/empty tape.
  - "Download tape (.json)": download the tape JSON file.
  - "Import": file picker for a tape JSON; invalid file → notice.
  - "Print cover": `window.print()` (print CSS shows only `#jcard`).
  - Autosave tape to localStorage on every change; restore on load.
  - "Clear tape": confirm() then empty both sides + reset cover.
  - _Requirements: R3, R6_

- [x] 7. Polish + verify
  - Responsive check (360px and 1280px, no page-level horizontal
    scroll), keyboard focus visible, icon buttons have aria-labels.
  - Run `node --check` on songs.js and app.js; run
    `bash scripts/smoke-check.sh`; fix everything it flags.
  - Load the page in a headless browser; confirm no console errors and
    that `#catalog`, `#tape`, `#jcard`, `#transport` exist.
  - _Requirements: R7_
