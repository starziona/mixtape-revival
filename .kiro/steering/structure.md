# Structure steering — Mixtape Revival

## Repository layout
```
mixtape-revival/
├── index.html            # App shell: catalog, tape, cover designer
├── styles.css            # All styling, including @media print for the J-card
├── songs.js              # Song catalog: metadata + melody note data
├── app.js                # State, UI wiring, playback engine, share/persist
├── assets/
│   └── favicon.svg       # Cassette favicon
├── scripts/
│   └── smoke-check.sh    # node --check + basic sanity checks (used by hooks)
├── .kiro/
│   ├── steering/         # product.md, tech.md, structure.md
│   ├── specs/mixtape-revival/  # requirements.md, design.md, tasks.md
│   └── hooks/            # validate-js-on-save.json, smoke-check-after-task
├── README.md
├── SUBMISSION.md         # Devpost description + "How Kiro was used" write-up
├── LICENSE               # MIT
└── .gitignore            # MUST NOT list .kiro (the hackathon requires it in the repo)
```

## Conventions
- Keep the app to the four core files above. New features go into
  `app.js`/`songs.js`, not new files, unless the change is large enough to
  justify a split (then update this file and the spec).
- The `.kiro/` directory is part of the deliverable: specs, steering and
  hooks are shipped in the public repo and must stay out of `.gitignore`.
- Every user-facing string lives in the HTML/JS (no i18n files). English only.
- The J-card (cover) is a DOM element (`#jcard`) rendered twice: once on
  screen as a live preview, once alone via the print stylesheet.
