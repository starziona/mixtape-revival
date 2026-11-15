# Mixtape Revival — Devpost submission draft (Kiroween 2026)

> Draft for the Devpost submission form. Category: **Resurrection**.
> Target submit: 3 Dec 2026. Deadline: 4 Dec 2026 14:00 PT.

## Project description (for the Devpost form)

**Mixtape Revival brings the dead art of the cassette mixtape back to
life.**

Before playlists were links, a mixtape was a message: the songs you
chose, in the order you chose them, on a physical object with a limited
length — plus a hand-written cover. Mixtape Revival resurrects that
ritual as a working web app.

Pick songs from a catalog of 20 original tracks, arrange them on the two
sides of a virtual C-90 cassette (a real 45-minutes-per-side limit, with a
fill meter that shows the tape running out), and listen to the tape with
live WebAudio-generated playback — original chiptune-style melodies plus
tape hiss, spinning reels, and a tape counter. Design the J-card cover
with a dedication and one of four themes, then share the whole tape as a
link, export it as JSON, or print the cover on paper.

No account, no backend, no streaming service, no copyrighted audio. The
app is a dependency-free static site that works fully offline, hosted on
GitHub Pages.

### Features
- 20-song catalog with live search, genre, and mood filters
- Side A / Side B with add, remove, reorder, and a 45:00 capacity meter
- WebAudio playback: play, pause, stop, next/previous, fast-forward,
  rewind, progress bar, spinning reels, tape counter
- Cover designer: title, To/From, dedication, 4 themes, live J-card
  preview
- Shareable link (tape encoded in the URL hash), JSON export/import,
  printable J-card, localStorage autosave

## How Kiro was used

This project was built with **Kiro CLI 3.3.0** using spec-driven
development, and the evidence is in the repo's `.kiro/` directory:

- **Specs** (`.kiro/specs/mixtape-revival/`): `requirements.md` (EARS-style
  requirements R1–R7), `design.md` (architecture, WebAudio scheduler,
  sharing/persistence design), and `tasks.md` (the 7-task implementation
  plan the build followed, all checked off).
- **Steering** (`.kiro/steering/`): `product.md` (vision, audience,
  non-goals), `tech.md` (static-site constraints, zero external
  dependencies, offline-first), and `structure.md` (repo layout and
  conventions). Steering kept every implementation decision aligned with
  the product.
- **Hooks** (`.kiro/hooks/`): a `PostFileSave` hook that runs
  `node --check` on any JavaScript file the agent saves, and a
  `PostTaskExec` hook that runs `scripts/smoke-check.sh` after each spec
  task (syntax checks, file-reference checks, no-external-resources
  check, catalog sanity check).
- **Agent implementation**: the Kiro CLI agent implemented the app shell
  (`index.html`, 281 lines) and the full styling (`styles.css`, 1093
  lines, including the print stylesheet) from the spec, and later ran a
  dedicated review session against the requirements that found two real
  bugs (an off-by-one in the side-full notice and `clearTape` not removing
  the saved state) which were then fixed.
- The catalog data and application logic (`songs.js`, `app.js`) were
  completed following the same spec after two Kiro CLI sessions were
  interrupted by transient connection resets (`ServerConnectionResetError`)
  while writing large files; the work was finished directly from the spec
  and then verified by the Kiro review session above.

## Submission checklist

- [ ] Public GitHub repo: https://github.com/starziona/mixtape-revival
      (MIT license, `/.kiro` at root, NOT in `.gitignore`)
- [ ] GitHub Pages enabled → working app URL
- [ ] Demo video < 3 min, public on YouTube (screen recording of the
      real app)
- [ ] English description + this Kiro write-up in the Devpost form
- [ ] Category: Resurrection
