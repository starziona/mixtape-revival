/* ==========================================================================
   Mixtape Revival — songs.js
   Song catalog: 20 original songs with metadata and melody note data.
   All titles, artists, and melodies are original works — not real chart
   songs. Melodies are short loopable phrases for the WebAudio engine.

   MIDI note reference (middle octave):
     C4=60, D4=62, E4=64, F4=65, G4=67, A4=69, B4=71
     C5=72, D5=74, E5=76, F5=77, G5=79, A5=81

   melody: array of [midiNote, beats] — triangle lead, looped for duration
   bass:   array of midiNote — root notes cycling through the phrase
   bpm:    tempo used by the scheduler to convert beats to seconds
   ========================================================================== */

const SONGS = [
  {
    id: "s01",
    title: "Golden Hour Drive",
    artist: "The Dusk Collective",
    durationSec: 214,
    genre: "rock",
    mood: "chill",
    bpm: 96,
    melody: [
      [67, 1], [69, 1], [71, 2], [67, 1], [65, 1], [64, 2],
      [65, 1], [67, 1], [69, 2], [71, 1], [72, 1], [71, 4]
    ],
    bass: [48, 48, 45, 43]
  },
  {
    id: "s02",
    title: "Neon Carousel",
    artist: "Violet Static",
    durationSec: 198,
    genre: "new-wave",
    mood: "party",
    bpm: 128,
    melody: [
      [72, 1], [74, 1], [76, 1], [74, 1], [72, 2],
      [71, 1], [72, 1], [74, 2], [76, 1], [77, 3]
    ],
    bass: [48, 50, 52, 50]
  },
  {
    id: "s03",
    title: "Borrowed Umbrella",
    artist: "June Rainfall",
    durationSec: 232,
    genre: "pop",
    mood: "romantic",
    bpm: 84,
    melody: [
      [64, 2], [65, 1], [67, 1], [69, 2], [67, 1], [65, 1],
      [64, 3], [62, 1], [60, 2], [62, 2], [64, 4]
    ],
    bass: [40, 43, 45, 43]
  },
  {
    id: "s04",
    title: "Static Bloom",
    artist: "The Paper Satellites",
    durationSec: 176,
    genre: "pop",
    mood: "happy",
    bpm: 116,
    melody: [
      [72, 1], [76, 1], [79, 1], [76, 1], [74, 1], [72, 2],
      [74, 1], [76, 1], [77, 2], [76, 1], [74, 1], [72, 4]
    ],
    bass: [48, 45, 41, 43]
  },
  {
    id: "s05",
    title: "Midnight Diner",
    artist: "Cole Rivers",
    durationSec: 238,
    genre: "soul",
    mood: "chill",
    bpm: 76,
    melody: [
      [69, 2], [71, 1], [72, 2], [71, 1], [69, 2], [67, 2],
      [65, 1], [67, 1], [69, 4]
    ],
    bass: [45, 41, 43, 43]
  },
  {
    id: "s06",
    title: "Dial Tone Love",
    artist: "The Busy Signals",
    durationSec: 185,
    genre: "new-wave",
    mood: "romantic",
    bpm: 122,
    melody: [
      [76, 1], [79, 1], [81, 1], [79, 1], [76, 2], [74, 1],
      [76, 1], [77, 2], [79, 1], [76, 1], [74, 4]
    ],
    bass: [50, 48, 45, 43]
  },
  {
    id: "s07",
    title: "Backseat Serenade",
    artist: "The Night Owls",
    durationSec: 213,
    genre: "rock",
    mood: "romantic",
    bpm: 96,
    melody: [
      [67, 2], [69, 1], [71, 1], [72, 2], [71, 1], [69, 1],
      [67, 2], [65, 2], [64, 1], [65, 1], [67, 4]
    ],
    bass: [48, 45, 41, 43]
  },
  {
    id: "s08",
    title: "Funky Payphone",
    artist: "Groove Merchant",
    durationSec: 201,
    genre: "soul",
    mood: "party",
    bpm: 112,
    melody: [
      [72, 0.5], [72, 0.5], [74, 0.5], [76, 1], [74, 0.5], [72, 0.5],
      [71, 1], [72, 2], [74, 1], [76, 1], [79, 2], [76, 1], [74, 1], [72, 2]
    ],
    bass: [41, 41, 43, 45]
  },
  {
    id: "s09",
    title: "Skateboard Summer",
    artist: "The Curbsiders",
    durationSec: 144,
    genre: "punk",
    mood: "happy",
    bpm: 175,
    melody: [
      [76, 0.5], [76, 0.5], [79, 0.5], [79, 0.5], [81, 1], [79, 0.5],
      [76, 0.5], [74, 1], [76, 1], [77, 1], [79, 2], [81, 1], [79, 1], [76, 2]
    ],
    bass: [48, 48, 43, 43]
  },
  {
    id: "s10",
    title: "Answering Machine Blues",
    artist: "Delia Vox",
    durationSec: 242,
    genre: "soul",
    mood: "sad",
    bpm: 70,
    melody: [
      [65, 2], [67, 1], [69, 2], [67, 1], [65, 2], [64, 2],
      [62, 1], [64, 1], [65, 4], [64, 2], [62, 2], [60, 4]
    ],
    bass: [41, 36, 43, 43]
  },
  {
    id: "s11",
    title: "Laser Disco",
    artist: "Chrome Palms",
    durationSec: 194,
    genre: "new-wave",
    mood: "party",
    bpm: 126,
    melody: [
      [72, 1], [72, 1], [76, 1], [76, 1], [79, 1], [79, 1],
      [81, 1], [79, 1], [76, 1], [74, 1], [72, 2], [76, 1], [79, 1], [81, 2]
    ],
    bass: [48, 46, 41, 43]
  },
  {
    id: "s12",
    title: "Paper Hearts",
    artist: "Lila Fern",
    durationSec: 221,
    genre: "pop",
    mood: "sad",
    bpm: 88,
    melody: [
      [69, 2], [72, 1], [71, 2], [69, 1], [67, 2], [69, 1],
      [71, 1], [72, 4], [71, 2], [69, 1], [67, 2], [65, 4]
    ],
    bass: [45, 43, 41, 43]
  },
  {
    id: "s13",
    title: "Block Party Anthem",
    artist: "MC Cassette",
    durationSec: 188,
    genre: "hip-hop",
    mood: "party",
    bpm: 98,
    melody: [
      [67, 1], [67, 1], [69, 1], [67, 1], [65, 1], [64, 1],
      [62, 1], [64, 1], [65, 2], [67, 2], [69, 1], [67, 1], [65, 4]
    ],
    bass: [45, 45, 43, 41]
  },
  {
    id: "s14",
    title: "Golden Hour",
    artist: "The Sundowners",
    durationSec: 232,
    genre: "rock",
    mood: "chill",
    bpm: 92,
    melody: [
      [64, 2], [67, 1], [69, 1], [71, 2], [69, 1], [67, 1],
      [65, 2], [64, 2], [62, 1], [64, 1], [65, 4], [67, 2], [69, 1], [71, 4]
    ],
    bass: [48, 43, 45, 43]
  },
  {
    id: "s15",
    title: "Late Night Radio",
    artist: "The Frequencies",
    durationSec: 207,
    genre: "new-wave",
    mood: "chill",
    bpm: 108,
    melody: [
      [74, 1], [76, 1], [77, 2], [76, 1], [74, 1], [72, 2],
      [74, 1], [76, 1], [79, 2], [77, 1], [76, 1], [74, 4]
    ],
    bass: [50, 45, 48, 43]
  },
  {
    id: "s16",
    title: "Denim Jacket",
    artist: "The Stitch-Ups",
    durationSec: 151,
    genre: "punk",
    mood: "happy",
    bpm: 172,
    melody: [
      [74, 0.5], [76, 0.5], [76, 0.5], [79, 1], [79, 0.5], [76, 0.5],
      [74, 1], [72, 1], [74, 1], [76, 1], [79, 1], [81, 1], [79, 1], [76, 2]
    ],
    bass: [43, 43, 48, 45]
  },
  {
    id: "s17",
    title: "First Slow Dance",
    artist: "Rosie Marlowe",
    durationSec: 199,
    genre: "pop",
    mood: "romantic",
    bpm: 84,
    melody: [
      [67, 2], [69, 1], [71, 2], [72, 1], [71, 1], [69, 2],
      [67, 2], [65, 1], [67, 1], [69, 4], [71, 2], [72, 1], [71, 4]
    ],
    bass: [48, 45, 43, 43]
  },
  {
    id: "s18",
    title: "Boombox Boogie",
    artist: "DJ Rewind",
    durationSec: 178,
    genre: "hip-hop",
    mood: "party",
    bpm: 102,
    melody: [
      [69, 0.5], [69, 0.5], [72, 0.5], [69, 0.5], [67, 1], [69, 1],
      [71, 1], [72, 2], [71, 0.5], [69, 0.5], [67, 1], [65, 1], [67, 2], [69, 2]
    ],
    bass: [43, 43, 45, 41]
  },
  {
    id: "s19",
    title: "Last Train Home",
    artist: "The Night Buses",
    durationSec: 251,
    genre: "rock",
    mood: "sad",
    bpm: 78,
    melody: [
      [64, 2], [65, 1], [67, 2], [69, 1], [67, 1], [65, 2],
      [64, 2], [62, 1], [64, 1], [65, 4], [62, 2], [64, 1], [62, 4]
    ],
    bass: [41, 43, 45, 43]
  },
  {
    id: "s20",
    title: "Polaroid Sky",
    artist: "June Bug",
    durationSec: 176,
    genre: "pop",
    mood: "happy",
    bpm: 116,
    melody: [
      [72, 1], [74, 1], [76, 1], [79, 1], [76, 1], [74, 1],
      [72, 2], [71, 1], [72, 1], [74, 1], [76, 2], [77, 1], [76, 1], [74, 4]
    ],
    bass: [48, 45, 41, 43]
  }
];

/* Small lookup helper used by app.js. */
function getSong(id) {
  return SONGS.find(function (s) { return s.id === id; }) || null;
}
