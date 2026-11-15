# Requirements — Mixtape Revival

## Introduction
Mixtape Revival is a static web app that lets a user build a virtual
C-90 cassette mixtape (two 45-minute sides), listen to it with live
WebAudio-generated playback, design a printable J-card cover with a
dedication, and share the tape as a link. No backend, no accounts, no
copyrighted audio.

## Glossary
- **Catalog song:** a song entry (title, artist, duration, genre, mood,
  melody note data). The catalog is original metadata; melodies are short
  original chiptune-style renditions generated in code.
- **Side:** one half of the cassette (A or B). Capacity 45:00.
- **Tape:** the mixtape: Side A tracks + Side B tracks + cover data.
- **J-card:** the paper insert cover: title, To/From, message, tracklist.

## Requirements

### R1 — Song catalog
- WHEN the app loads, THE SYSTEM SHALL display a catalog of at least 18
  songs, each with title, artist, duration (mm:ss), genre, and mood.
- WHEN the user types in the search box, THE SYSTEM SHALL filter the
  catalog by title or artist (case-insensitive, live as they type).
- WHEN the user picks a genre or mood filter, THE SYSTEM SHALL show only
  matching songs; choosing "All" SHALL clear that filter.
- Each catalog song SHALL have melody note data usable by the playback
  engine (R4).

### R2 — Building the tape (sides A and B)
- WHEN the user clicks "Add to A" or "Add to B" on a catalog song, THE
  SYSTEM SHALL append that song to the chosen side, unless the side would
  exceed 45:00, in which case THE SYSTEM SHALL refuse with a visible
  message ("Side A is full — 45:00 max") and SHALL NOT add the song.
- WHEN the user clicks the remove button on a tape track, THE SYSTEM SHALL
  remove it from that side.
- WHEN the user clicks the up/down buttons on a tape track, THE SYSTEM
  SHALL move it one position within its side (no-op at the ends).
- THE SYSTEM SHALL display each side's used time (mm:ss) and remaining time
  against the 45:00 capacity, plus a fill meter.

### R3 — Tape state and persistence
- THE SYSTEM SHALL autosave the tape (both sides + cover data) to
  localStorage on every change.
- WHEN the app loads, THE SYSTEM SHALL restore the saved tape if one
  exists; otherwise it SHALL start with an empty tape and a default title.
- WHEN the user clicks "Clear tape", THE SYSTEM SHALL empty both sides and
  reset the cover message after a confirm() dialog, and SHALL clear the
  saved state.

### R4 — Playback engine (WebAudio)
- WHEN the user clicks Play, THE SYSTEM SHALL play the current side from
  the current track, generating audio live with the WebAudio API from the
  track's melody note data, and SHALL animate the cassette reels and tape
  counter while playing.
- WHEN the user clicks Pause, THE SYSTEM SHALL pause playback and stop the
  reel animation; clicking Play again SHALL resume.
- WHEN the user clicks Stop, THE SYSTEM SHALL stop playback and reset the
  position to the start of the current track.
- WHEN a track ends, THE SYSTEM SHALL advance to the next track on the
  same side; after the last track THE SYSTEM SHALL stop and show the side
  as finished.
- WHEN the user clicks Next/Prev, THE SYSTEM SHALL jump to the next/
  previous track on the current side.
- WHEN the user clicks FF/RW, THE SYSTEM SHALL move the playhead forward/
  back by 10 seconds within the current track (clamped to track bounds).
- WHEN the user clicks a track in the tape list, THE SYSTEM SHALL make it
  the current track and start playing it.
- THE SYSTEM SHALL show the current track title, side, position and a
  progress bar that updates while playing.
- IF the tape side is empty, Play SHALL do nothing except show "Add songs
  to this side first".
- Audio SHALL start only after a user gesture (AudioContext resume on
  click), per browser autoplay policy.

### R5 — Cover designer (J-card)
- THE SYSTEM SHALL provide editable fields: tape title, "To", "From", and
  a dedication message.
- THE SYSTEM SHALL provide at least 4 cover themes (color schemes); picking
  one SHALL immediately restyle the live J-card preview.
- THE SYSTEM SHALL render a live J-card preview showing the title, To/From,
  message, and both sides' tracklists with durations.

### R6 — Share, export, print
- WHEN the user clicks "Copy share link", THE SYSTEM SHALL encode the whole
  tape as base64url JSON in the URL hash and copy the link to the clipboard,
  showing "Link copied".
- WHEN the app loads with a `#t=...` hash, THE SYSTEM SHALL decode it and
  restore that tape (invalid data SHALL be ignored with a visible notice).
- WHEN the user clicks "Download tape (.json)", THE SYSTEM SHALL download
  the tape as a JSON file.
- WHEN the user picks a previously exported JSON file via "Import", THE
  SYSTEM SHALL load it as the current tape (invalid files SHALL be rejected
  with a visible message).
- WHEN the user clicks "Print cover", THE SYSTEM SHALL open the print dialog
  with a print stylesheet that shows only the J-card.

### R7 — Quality
- THE SYSTEM SHALL load and run with zero `console.error` output during
  load, add, play, share and print-preview flows.
- THE SYSTEM SHALL work offline from local files with no network requests
  (no CDN, no external fonts/images).
- THE SYSTEM SHALL be usable at 360px width (mobile) and 1280px (desktop)
  without horizontal scrolling of the page.
- All JavaScript files SHALL pass `node --check`.

## Non-goals
- No real audio recordings, no streaming, no upload of user files except
  tape JSON import, no accounts, no server-side anything.
