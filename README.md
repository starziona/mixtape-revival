# Mixtape Revival

**Bring the dead art of the cassette mixtape back to life.**

Mixtape Revival is a virtual cassette-mixtape maker. Pick songs, arrange
them on the two sides of a C-90 cassette, write a dedication, design the
J-card cover — then listen to the tape, share it as a link, or print the
cover on paper. No account, no backend, no streaming service. The tape is
the product.

Built for **Kiroween 2026** (Resurrection category) with **Kiro CLI**,
using spec-driven development. See
[`SUBMISSION.md`](SUBMISSION.md) for the Devpost description and the full
write-up of how Kiro was used, and [`.kiro/`](.kiro) for the specs,
steering documents, and hooks.

## Features

- **Song catalog** — 20 original songs with search, genre, and mood filters.
- **Two 45-minute sides** — a real C-90 constraint. Add, remove, and
  reorder tracks; a fill meter shows how much tape is left.
- **Real playback** — melodies are generated live with the WebAudio API
  (original chiptune-style renditions, plus tape hiss). Play, pause, stop,
  next/previous, fast-forward and rewind. The cassette reels spin while
  the tape plays.
- **Cover designer** — tape title, To/From, dedication message, and 4
  cover themes with a live J-card preview.
- **Share** — the whole tape is encoded into a link (URL hash). Open the
  link and the tape is restored.
- **Export / Import** — download the tape as JSON, or import one.
- **Print cover** — a print stylesheet renders only the J-card, ready for
  paper.
- **Autosave** — the tape is saved to localStorage on every change.
- **Fully offline** — no CDN, no external fonts or images, no network
  requests. Works from any static host.

## Run it locally

```bash
# any static server works, for example:
python3 -m http.server 8000
# then open http://localhost:8000/
```

Or just open `index.html` directly in a browser.

## Deploy

This is a static site. Enable GitHub Pages on the repository (Settings →
Pages → Deploy from branch → `main`, `/ (root)`) and the app is live at
`https://<user>.github.io/mixtape-revival/`.

## How it was built

Spec-driven development with Kiro CLI (see `.kiro/`):

- `.kiro/steering/` — product vision, tech constraints, repo structure.
- `.kiro/specs/mixtape-revival/` — requirements, design, and the task list
  the implementation followed.
- `.kiro/hooks/` — a `PostFileSave` hook that syntax-checks JavaScript on
  save, and a `PostTaskExec` hook that runs the smoke check after each
  spec task.

## Project structure

```
├── index.html            # App shell
├── styles.css            # All styling, including print styles for the J-card
├── songs.js              # Song catalog: metadata + melody note data
├── app.js                # State, UI, WebAudio playback, share/persist
├── assets/favicon.svg    # Cassette favicon
├── scripts/smoke-check.sh# node --check + sanity checks (also a Kiro hook)
├── .kiro/                # Steering, specs, hooks (required by Kiroween)
├── README.md
├── SUBMISSION.md         # Devpost description + "How Kiro was used"
└── LICENSE               # MIT
```

## License

MIT — see [LICENSE](LICENSE).
