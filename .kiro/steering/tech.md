# Tech steering — Mixtape Revival

## Stack
- **Static site only:** plain HTML, CSS, vanilla JavaScript. No framework,
  no build step, no bundler, no package manager.
- **Zero external dependencies at runtime.** No CDN links, no Google Fonts,
  no external images. Everything must work from `file://` or any static
  host, including fully offline. (System font stack only; all icons are
  inline SVG or CSS.)
- **Hosting:** GitHub Pages (static). The app URL is the repo's Pages URL.

## Browser APIs used
- **WebAudio API** for playback: melodies are generated live from note data
  (oscillator + gain envelope). A short filtered-noise loop provides tape
  hiss. All audio is created in code; no audio files are shipped.
- **localStorage** for autosave of the current mixtape (key
  `mixtape-revival-v1`).
- **URL hash** for sharing: the mixtape is encoded as base64url JSON in
  `location.hash` (`#t=...`). Loading a shared link restores the tape.
- **window.print()** with an `@media print` stylesheet for the J-card.

## Constraints
- JavaScript must pass `node --check` with zero errors.
- No `console.error` output during normal use (load, add song, play, share,
  print preview). Warnings are acceptable only if unavoidable.
- Must work in a current Chromium/Firefox/Safari. Audio requires a user
  gesture (click) before the AudioContext resumes — handle that.
- All user-visible text in the app is English (the hackathon requires
  English submission materials; the UI is part of the demo).

## File conventions
- One responsibility per file: `index.html` (structure), `styles.css`
  (all styling incl. print), `songs.js` (catalog data + melodies),
  `app.js` (state, UI, playback, share, persistence).
- No minification. Code must be readable by judges.
- IDs and class names in English, semantic HTML (`<main>`, `<section>`,
  buttons with `aria-label` where the label is an icon).
