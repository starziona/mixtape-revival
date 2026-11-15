/* ==========================================================================
   Mixtape Revival — app.js
   State, catalog UI, tape building, WebAudio playback, cover designer,
   share / export / import / print, and persistence. No dependencies.
   See .kiro/specs/mixtape-revival/ for requirements and design.
   ========================================================================== */
'use strict';

/* ---------------- Constants ---------------- */
var SIDE_CAPACITY_SEC = 45 * 60; // C-90: 45 minutes per side
var STORAGE_KEY = 'mixtape-revival-v1';
var DEFAULT_TITLE = 'My Best Tape';
var THEMES = ['sunset', 'midnight', 'mint', 'bubblegum'];

/* ---------------- State ---------------- */
var state = {
  title: DEFAULT_TITLE,
  to: '',
  from: '',
  message: '',
  theme: 'sunset',
  sideA: [], // array of song ids
  sideB: [], // array of song ids
  currentSide: 'A',
  currentIndex: 0,
  positionSec: 0,
  playing: false
};

/* ---------------- Small helpers ---------------- */
function $(id) { return document.getElementById(id); }

function formatTime(totalSec) {
  totalSec = Math.max(0, Math.round(totalSec));
  var m = Math.floor(totalSec / 60);
  var s = totalSec % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function showToast(message, isError) {
  var area = $('toast-area');
  if (!area) return;
  var el = document.createElement('div');
  el.className = 'toast' + (isError ? ' toast--error' : '');
  el.textContent = message;
  area.appendChild(el);
  window.setTimeout(function () {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 3200);
}

function debounce(fn, ms) {
  var timer = null;
  return function () {
    var args = arguments;
    window.clearTimeout(timer);
    timer = window.setTimeout(function () { fn.apply(null, args); }, ms);
  };
}

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/* ---------------- Persistence ---------------- */
function tapeData() {
  return {
    title: state.title,
    to: state.to,
    from: state.from,
    message: state.message,
    theme: state.theme,
    sideA: state.sideA.slice(),
    sideB: state.sideB.slice()
  };
}

function saveTape() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tapeData()));
  } catch (e) { /* storage unavailable (private mode) — app still works */ }
}
var saveTapeSoon = debounce(saveTape, 300);

function sanitizeTape(data) {
  if (!data || typeof data !== 'object') return null;
  var clean = {
    title: typeof data.title === 'string' && data.title ? data.title : DEFAULT_TITLE,
    to: typeof data.to === 'string' ? data.to : '',
    from: typeof data.from === 'string' ? data.from : '',
    message: typeof data.message === 'string' ? data.message : '',
    theme: THEMES.indexOf(data.theme) !== -1 ? data.theme : 'sunset',
    sideA: [],
    sideB: []
  };
  ['sideA', 'sideB'].forEach(function (key) {
    if (Array.isArray(data[key])) {
      clean[key] = data[key].filter(function (id) { return getSong(id) !== null; });
    }
  });
  return clean;
}

function applyTape(data) {
  state.title = data.title;
  state.to = data.to;
  state.from = data.from;
  state.message = data.message;
  state.theme = data.theme;
  state.sideA = data.sideA;
  state.sideB = data.sideB;
  state.currentIndex = 0;
  state.positionSec = 0;
  state.playing = false;
  syncCoverInputs();
  setTheme(state.theme, true);
}

function loadSavedTape() {
  try {
    var raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return sanitizeTape(JSON.parse(raw));
  } catch (e) {
    return null;
  }
}

/* ---------------- Share encoding (base64url JSON in #t=...) ---------------- */
function b64urlEncode(str) {
  return window.btoa(window.unescape(window.encodeURIComponent(str)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return window.decodeURIComponent(window.escape(window.atob(str)));
}

function encodeShareLink() {
  var payload = b64urlEncode(JSON.stringify(tapeData()));
  return window.location.origin + window.location.pathname + '#t=' + payload;
}

function decodeShareHash() {
  var hash = window.location.hash || '';
  var m = hash.match(/#t=([A-Za-z0-9\-_]+)/);
  if (!m) return null;
  try {
    return sanitizeTape(JSON.parse(b64urlDecode(m[1])));
  } catch (e) {
    return 'invalid';
  }
}

/* ---------------- Catalog ---------------- */
function catalogFilter() {
  var q = ($('catalog-search').value || '').trim().toLowerCase();
  var genre = $('filter-genre').value || 'all';
  var mood = $('filter-mood').value || 'all';
  return SONGS.filter(function (song) {
    if (genre !== 'all' && song.genre !== genre) return false;
    if (mood !== 'all' && song.mood !== mood) return false;
    if (q && song.title.toLowerCase().indexOf(q) === -1 &&
        song.artist.toLowerCase().indexOf(q) === -1) return false;
    return true;
  });
}

function renderCatalog() {
  var list = $('catalog-list');
  var songs = catalogFilter();
  list.innerHTML = '';
  $('catalog-empty').hidden = songs.length !== 0;
  songs.forEach(function (song) {
    var li = document.createElement('li');
    li.className = 'song-row';

    var info = document.createElement('div');
    info.className = 'song-row-info';
    var title = document.createElement('div');
    title.className = 'song-row-title';
    title.textContent = song.title;
    var meta = document.createElement('div');
    meta.className = 'song-row-meta';
    meta.textContent = song.artist + ' · ' + formatTime(song.durationSec) +
      ' · ' + song.genre + ' · ' + song.mood;
    info.appendChild(title);
    info.appendChild(meta);

    var actions = document.createElement('div');
    actions.className = 'song-row-actions';
    [['A', 'Add to A'], ['B', 'Add to B']].forEach(function (pair) {
      var side = pair[0];
      var btn = document.createElement('button');
      btn.className = 'btn btn-secondary';
      btn.type = 'button';
      btn.textContent = pair[1];
      btn.setAttribute('aria-label', 'Add ' + song.title + ' to Side ' + side);
      btn.addEventListener('click', function () { addToSide(song.id, side); });
      actions.appendChild(btn);
    });

    li.appendChild(info);
    li.appendChild(actions);
    list.appendChild(li);
  });
}

/* ---------------- Tape sides ---------------- */
function sideTracks(side) {
  return side === 'A' ? state.sideA : state.sideB;
}

function sideDurationSec(side) {
  return sideTracks(side).reduce(function (sum, id) {
    var song = getSong(id);
    return sum + (song ? song.durationSec : 0);
  }, 0);
}

function addToSide(songId, side) {
  var song = getSong(songId);
  if (!song) return;
  var used = sideDurationSec(side);
  if (used + song.durationSec > SIDE_CAPACITY_SEC) {
    var notice = side === 'A' ? $('notice-a') : $('notice-b');
    notice.textContent = 'Side ' + side + ' is full — 45:00 max. ' +
      'Only ' + formatTime(SIDE_CAPACITY_SEC - used) + ' left.';
    notice.hidden = false;
    showToast('Side ' + side + ' is full (45:00 max).', true);
    return;
  }
  sideTracks(side).push(songId);
  saveTapeSoon();
  renderSides();
  renderJcard();
  showToast('Added "' + song.title + '" to Side ' + side + '.');
}

function removeTrack(side, index) {
  var tracks = sideTracks(side);
  var removed = tracks.splice(index, 1)[0];
  if (state.currentSide === side && state.currentIndex >= tracks.length) {
    state.currentIndex = Math.max(0, tracks.length - 1);
  }
  if (state.currentSide === side && state.playing && index === state.currentIndex) {
    stopPlayback();
  }
  saveTapeSoon();
  renderSides();
  renderJcard();
  var song = getSong(removed);
  if (song) showToast('Removed "' + song.title + '" from Side ' + side + '.');
}

function moveTrack(side, index, dir) {
  var tracks = sideTracks(side);
  var target = index + dir;
  if (target < 0 || target >= tracks.length) return;
  var tmp = tracks[index];
  tracks[index] = tracks[target];
  tracks[target] = tmp;
  if (state.currentSide === side) {
    if (state.currentIndex === index) state.currentIndex = target;
    else if (state.currentIndex === target) state.currentIndex = index;
  }
  saveTapeSoon();
  renderSides();
  renderJcard();
}

function renderSide(side) {
  var suffix = side === 'A' ? 'a' : 'b';
  var list = $('tracklist-' + suffix);
  var tracks = sideTracks(side);
  list.innerHTML = '';

  tracks.forEach(function (id, idx) {
    var song = getSong(id);
    if (!song) return;
    var li = document.createElement('li');
    li.className = 'track-row' +
      (state.currentSide === side && state.currentIndex === idx ? ' track-current' : '');

    var num = document.createElement('span');
    num.className = 'track-num';
    num.textContent = (idx + 1) + '.';

    var info = document.createElement('div');
    info.className = 'track-info';
    var title = document.createElement('div');
    title.className = 'track-title';
    title.textContent = song.title;
    var artist = document.createElement('div');
    artist.className = 'track-artist';
    artist.textContent = song.artist;
    info.appendChild(title);
    info.appendChild(artist);

    var dur = document.createElement('span');
    dur.className = 'track-dur';
    dur.textContent = formatTime(song.durationSec);

    var controls = document.createElement('div');
    controls.className = 'track-controls';
    [
      ['↑', 'Move up', function () { moveTrack(side, idx, -1); }],
      ['↓', 'Move down', function () { moveTrack(side, idx, 1); }],
      ['✕', 'Remove from Side ' + side, function () { removeTrack(side, idx); }]
    ].forEach(function (cfg) {
      var btn = document.createElement('button');
      btn.className = 'track-ctrl-btn';
      btn.type = 'button';
      btn.textContent = cfg[0];
      btn.setAttribute('aria-label', cfg[1] + ': ' + song.title);
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        cfg[2]();
      });
      controls.appendChild(btn);
    });

    li.appendChild(num);
    li.appendChild(info);
    li.appendChild(dur);
    li.appendChild(controls);
    li.addEventListener('click', function () { playTrack(side, idx); });
    list.appendChild(li);
  });

  $('empty-' + suffix).hidden = tracks.length !== 0;

  var used = sideDurationSec(side);
  var meter = $('meter-' + suffix);
  meter.style.width = Math.min(100, (used / SIDE_CAPACITY_SEC) * 100) + '%';
  meter.parentNode.setAttribute('aria-valuenow', String(used));
  $('time-' + suffix).textContent =
    formatTime(used) + ' / 45:00';
  var notice = $('notice-' + suffix);
  notice.hidden = used < SIDE_CAPACITY_SEC;
}

function renderSides() {
  renderSide('A');
  renderSide('B');
}

function switchSide(side) {
  switchSidePanel(side);
  // Only move the "current side" (transport + badge) when nothing is
  // playing; while a tape plays, the badge stays with the playing side.
  if (!state.playing) {
    state.currentSide = side;
    updateTransportUI();
  }
  renderSides();
}

/* ---------------- Cover designer / J-card ---------------- */
function syncCoverInputs() {
  $('cover-title').value = state.title;
  $('cover-to').value = state.to;
  $('cover-from').value = state.from;
  $('cover-message').value = state.message;
  var radios = document.querySelectorAll('input[name="theme"]');
  radios.forEach(function (r) { r.checked = (r.value === state.theme); });
}

function renderJcard() {
  $('jcard-title').textContent = state.title || DEFAULT_TITLE;
  $('jcard-spine-title').textContent = state.title || DEFAULT_TITLE;
  $('jcard-to').textContent = state.to || '—';
  $('jcard-from').textContent = state.from || '—';
  $('jcard-message').textContent = state.message || '';

  [['A', 'jcard-side-a'], ['B', 'jcard-side-b']].forEach(function (pair) {
    var ol = $(pair[1]);
    ol.innerHTML = '';
    sideTracks(pair[0]).forEach(function (id) {
      var song = getSong(id);
      if (!song) return;
      var li = document.createElement('li');
      li.textContent = song.title + ' — ' + song.artist +
        ' (' + formatTime(song.durationSec) + ')';
      ol.appendChild(li);
    });
  });
}

function setTheme(theme, silent) {
  if (THEMES.indexOf(theme) === -1) theme = 'sunset';
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  var radios = document.querySelectorAll('input[name="theme"]');
  radios.forEach(function (r) { r.checked = (r.value === theme); });
  if (!silent) saveTapeSoon();
}

function bindCoverInputs() {
  $('cover-title').addEventListener('input', function (e) {
    state.title = e.target.value.trim() || DEFAULT_TITLE;
    renderJcard();
    saveTapeSoon();
  });
  $('cover-to').addEventListener('input', function (e) {
    state.to = e.target.value;
    renderJcard();
    saveTapeSoon();
  });
  $('cover-from').addEventListener('input', function (e) {
    state.from = e.target.value;
    renderJcard();
    saveTapeSoon();
  });
  $('cover-message').addEventListener('input', function (e) {
    state.message = e.target.value;
    renderJcard();
    saveTapeSoon();
  });
  document.querySelectorAll('input[name="theme"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      if (radio.checked) setTheme(radio.value);
    });
  });
}

/* ---------------- Playback engine (WebAudio) ---------------- */
var audio = {
  ctx: null,
  master: null,
  hissBuffer: null,
  hissSource: null,
  unavailable: false
};

var sched = {
  timer: null,
  song: null,
  nextNoteIdx: 0,
  nextNoteTime: 0,
  bassIdx: 0,
  nextBassTime: 0
};

var anchorCtxTime = 0;   // ctx time when basePositionSec was set
var basePositionSec = 0; // position at anchorCtxTime

function currentSong() {
  var tracks = sideTracks(state.currentSide);
  var song = getSong(tracks[state.currentIndex]);
  return song || null;
}

function currentPosition() {
  var song = currentSong();
  if (!song) return 0;
  if (state.playing && audio.ctx) {
    return Math.min(
      song.durationSec,
      basePositionSec + (audio.ctx.currentTime - anchorCtxTime)
    );
  }
  return Math.min(song.durationSec, state.positionSec);
}

function ensureAudio() {
  if (audio.unavailable) return false;
  if (!audio.ctx) {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      audio.ctx = new AC();
      audio.master = audio.ctx.createGain();
      audio.master.gain.value = 0.9;
      audio.master.connect(audio.ctx.destination);
      var len = audio.ctx.sampleRate * 2;
      var buf = audio.ctx.createBuffer(1, len, audio.ctx.sampleRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.4;
      audio.hissBuffer = buf;
    } catch (e) {
      audio.unavailable = true;
      return false;
    }
  }
  if (audio.ctx.state === 'suspended') audio.ctx.resume();
  return true;
}

function scheduleLead(midi, when, durSec) {
  var osc = audio.ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = midiToFreq(midi);
  var gain = audio.ctx.createGain();
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.linearRampToValueAtTime(0.16, when + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, when + Math.max(0.05, durSec * 0.9));
  osc.connect(gain);
  gain.connect(audio.master);
  osc.start(when);
  osc.stop(when + durSec + 0.05);
}

function scheduleBass(midi, when, durSec) {
  var osc = audio.ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = midiToFreq(midi);
  var gain = audio.ctx.createGain();
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.linearRampToValueAtTime(0.1, when + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, when + Math.max(0.05, durSec * 0.9));
  osc.connect(gain);
  gain.connect(audio.master);
  osc.start(when);
  osc.stop(when + durSec + 0.05);
}

function schedulerTick() {
  if (!audio.ctx || !sched.song || !state.playing) return;
  var song = sched.song;
  var spb = 60 / song.bpm;
  var ahead = audio.ctx.currentTime + 0.15;
  var guard = 0;
  while (sched.nextNoteTime < ahead && guard < 64) {
    guard++;
    var note = song.melody[sched.nextNoteIdx];
    scheduleLead(note[0], sched.nextNoteTime, note[1] * spb);
    sched.nextNoteTime += note[1] * spb;
    sched.nextNoteIdx++;
    if (sched.nextNoteIdx >= song.melody.length) sched.nextNoteIdx = 0;
  }
  guard = 0;
  while (sched.nextBassTime < ahead && guard < 16) {
    guard++;
    scheduleBass(song.bass[sched.bassIdx], sched.nextBassTime, 4 * spb);
    sched.bassIdx = (sched.bassIdx + 1) % song.bass.length;
    sched.nextBassTime += 4 * spb;
  }
}

function startScheduler(song, fromSec) {
  stopScheduler();
  var spb = 60 / song.bpm;
  var starts = [0];
  for (var i = 1; i < song.melody.length; i++) {
    starts.push(starts[i - 1] + song.melody[i - 1][1]);
  }
  var loopBeats = starts[starts.length - 1] +
    song.melody[song.melody.length - 1][1];
  var beatPos = (fromSec * song.bpm) / 60;
  var posInLoop = beatPos % loopBeats;
  var idx = 0;
  while (idx < starts.length && starts[idx] < posInLoop) idx++;
  var delayBeats;
  if (idx >= starts.length) {
    idx = 0;
    delayBeats = loopBeats - posInLoop;
  } else {
    delayBeats = starts[idx] - posInLoop;
  }
  var now = audio.ctx.currentTime;
  sched.song = song;
  sched.nextNoteIdx = idx;
  sched.nextNoteTime = now + Math.max(0.02, delayBeats * spb);
  var bar = Math.ceil(beatPos / 4);
  sched.bassIdx = bar % song.bass.length;
  sched.nextBassTime = now + Math.max(0.02, (bar * 4 - beatPos) * spb);
  sched.timer = window.setInterval(schedulerTick, 25);
  schedulerTick();
}

function stopScheduler() {
  if (sched.timer) {
    window.clearInterval(sched.timer);
    sched.timer = null;
  }
  sched.song = null;
}

function startHiss() {
  if (!audio.ctx || audio.hissSource || !audio.hissBuffer) return;
  var src = audio.ctx.createBufferSource();
  src.buffer = audio.hissBuffer;
  src.loop = true;
  var filt = audio.ctx.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.value = 900;
  var gain = audio.ctx.createGain();
  gain.gain.value = 0.02;
  src.connect(filt);
  filt.connect(gain);
  gain.connect(audio.master);
  src.start();
  audio.hissSource = src;
}

function stopHiss() {
  if (audio.hissSource) {
    try { audio.hissSource.stop(); } catch (e) { /* already stopped */ }
    try { audio.hissSource.disconnect(); } catch (e) { /* already gone */ }
    audio.hissSource = null;
  }
}

/* ---------------- Transport ---------------- */
function startPlayback() {
  var song = currentSong();
  if (!song) {
    showToast('Add songs to this side first.');
    return;
  }
  if (!ensureAudio()) {
    showToast('Audio is unavailable in this browser.', true);
    return;
  }
  anchorCtxTime = audio.ctx.currentTime;
  basePositionSec = state.positionSec;
  startScheduler(song, state.positionSec);
  startHiss();
  state.playing = true;
  updateTransportUI();
  updateProgress();
  renderSides();
}

function pausePlayback() {
  state.positionSec = currentPosition();
  basePositionSec = state.positionSec;
  stopScheduler();
  stopHiss();
  state.playing = false;
  updateTransportUI();
  updateProgress();
}

function stopPlayback() {
  stopScheduler();
  stopHiss();
  state.playing = false;
  state.positionSec = 0;
  basePositionSec = 0;
  updateTransportUI();
  updateProgress();
  renderSides();
}

function togglePlay() {
  if (state.playing) {
    pausePlayback();
    return;
  }
  var song = currentSong();
  if (!song) {
    showToast('Add songs to this side first.');
    return;
  }
  if (state.positionSec >= song.durationSec) state.positionSec = 0;
  startPlayback();
}

function playTrack(side, idx) {
  var tracks = sideTracks(side);
  if (!tracks.length) {
    showToast('Add songs to this side first.');
    return;
  }
  if (idx < 0) idx = 0;
  if (idx >= tracks.length) idx = tracks.length - 1;
  stopScheduler();
  stopHiss();
  state.playing = false;
  state.currentSide = side;
  state.currentIndex = idx;
  state.positionSec = 0;
  basePositionSec = 0;
  switchSidePanel(side);
  startPlayback();
}

function nextTrack() {
  var tracks = sideTracks(state.currentSide);
  if (state.currentIndex + 1 < tracks.length) {
    playTrack(state.currentSide, state.currentIndex + 1);
  } else {
    stopPlayback();
    showToast('End of Side ' + state.currentSide + '.');
  }
}

function prevTrack() {
  if (currentPosition() > 3) {
    state.positionSec = 0;
    basePositionSec = 0;
    if (state.playing && audio.ctx) {
      stopScheduler();
      var song = currentSong();
      if (song) {
        anchorCtxTime = audio.ctx.currentTime;
        startScheduler(song, 0);
      }
    }
    updateProgress();
    return;
  }
  if (state.currentIndex > 0) {
    playTrack(state.currentSide, state.currentIndex - 1);
  } else {
    state.positionSec = 0;
    basePositionSec = 0;
    updateProgress();
  }
}

function seekBy(deltaSec) {
  var song = currentSong();
  if (!song) return;
  var pos = Math.min(
    song.durationSec,
    Math.max(0, currentPosition() + deltaSec)
  );
  state.positionSec = pos;
  basePositionSec = pos;
  if (state.playing) {
    anchorCtxTime = audio.ctx.currentTime;
    startScheduler(song, pos);
  }
  updateProgress();
}

function handleTrackEnd() {
  var tracks = sideTracks(state.currentSide);
  if (state.currentIndex + 1 < tracks.length) {
    playTrack(state.currentSide, state.currentIndex + 1);
  } else {
    stopPlayback();
    showToast('End of Side ' + state.currentSide + '.');
  }
}

/* ---------------- Transport UI ---------------- */
function switchSidePanel(side) {
  $('tab-side-a').classList.toggle('active', side === 'A');
  $('tab-side-a').setAttribute('aria-selected', String(side === 'A'));
  $('tab-side-b').classList.toggle('active', side === 'B');
  $('tab-side-b').setAttribute('aria-selected', String(side === 'B'));
  $('panel-side-a').hidden = side !== 'A';
  $('panel-side-b').hidden = side !== 'B';
}

function updateTransportUI() {
  $('icon-play').hidden = state.playing;
  $('icon-pause').hidden = !state.playing;
  $('btn-play').setAttribute('aria-label', state.playing ? 'Pause' : 'Play');
  $('reel-left').classList.toggle('spinning', state.playing);
  $('reel-right').classList.toggle('spinning', state.playing);
  $('cassette-side-badge').textContent = state.currentSide;
  var song = currentSong();
  $('cassette-track-name').textContent = song ? song.title : '—';
  $('cassette-counter').textContent = formatTime(currentPosition());
}

function updateProgress() {
  var song = currentSong();
  var pos = currentPosition();
  if (song) {
    $('progress-pos').textContent = formatTime(pos);
    $('progress-dur').textContent = formatTime(song.durationSec);
    $('progress-bar-inner').style.width =
      Math.min(100, (pos / song.durationSec) * 100) + '%';
    $('now-playing-label').textContent =
      'Side ' + state.currentSide + ' · ' + song.title + ' — ' + song.artist;
    $('cassette-track-name').textContent = song.title;
    $('cassette-counter').textContent = formatTime(pos);
  } else {
    $('progress-pos').textContent = '0:00';
    $('progress-dur').textContent = '0:00';
    $('progress-bar-inner').style.width = '0%';
    $('now-playing-label').textContent = '—';
    $('cassette-track-name').textContent = '—';
    $('cassette-counter').textContent = '0:00';
  }
  if (state.playing && song && pos >= song.durationSec) {
    handleTrackEnd();
  }
}

/* ---------------- Share / export / import / print / clear ---------------- */
function shareTape() {
  var link = encodeShareLink();
  function fallback() {
    var ta = document.createElement('textarea');
    ta.value = link;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('Link copied. Share your tape!');
    } catch (e) {
      window.prompt('Copy your share link:', link);
    }
    document.body.removeChild(ta);
  }
  if (window.navigator.clipboard && window.navigator.clipboard.writeText) {
    window.navigator.clipboard.writeText(link).then(function () {
      showToast('Link copied. Share your tape!');
    }, fallback);
  } else {
    fallback();
  }
}

function exportTape() {
  var blob = new window.Blob(
    [JSON.stringify(tapeData(), null, 2)],
    { type: 'application/json' }
  );
  var url = window.URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = (state.title || 'mixtape')
    .replace(/[^a-z0-9\-]+/gi, '-').toLowerCase() + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(function () { window.URL.revokeObjectURL(url); }, 1000);
  showToast('Tape downloaded as JSON.');
}

function importTapeFile(file) {
  var reader = new window.FileReader();
  reader.onload = function () {
    try {
      var data = sanitizeTape(JSON.parse(reader.result));
      if (!data) throw new Error('invalid tape file');
      stopPlayback();
      applyTape(data);
      saveTape();
      renderAll();
      showToast('Tape imported.');
    } catch (e) {
      showToast('That file is not a valid tape.', true);
    }
  };
  reader.onerror = function () {
    showToast('Could not read that file.', true);
  };
  reader.readAsText(file);
}

function clearTape() {
  if (!window.confirm(
    'Clear the whole tape? Both sides and the cover will be reset.')) return;
  stopPlayback();
  applyTape({
    title: DEFAULT_TITLE, to: '', from: '', message: '',
    theme: 'sunset', sideA: [], sideB: []
  });
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (e) { /* storage unavailable — nothing to clear */ }
  renderAll();
  showToast('Tape cleared.');
}

/* ---------------- Wiring + init ---------------- */
function renderAll() {
  renderCatalog();
  renderSides();
  renderJcard();
  updateTransportUI();
  updateProgress();
}

function bindEvents() {
  $('catalog-search').addEventListener('input', renderCatalog);
  $('filter-genre').addEventListener('change', renderCatalog);
  $('filter-mood').addEventListener('change', renderCatalog);
  $('tab-side-a').addEventListener('click', function () { switchSide('A'); });
  $('tab-side-b').addEventListener('click', function () { switchSide('B'); });
  $('btn-play').addEventListener('click', togglePlay);
  $('btn-stop').addEventListener('click', stopPlayback);
  $('btn-next').addEventListener('click', nextTrack);
  $('btn-prev').addEventListener('click', prevTrack);
  $('btn-ff').addEventListener('click', function () { seekBy(10); });
  $('btn-rw').addEventListener('click', function () { seekBy(-10); });
  $('btn-share').addEventListener('click', shareTape);
  $('btn-export').addEventListener('click', exportTape);
  $('btn-import-file').addEventListener('change', function (e) {
    if (e.target.files && e.target.files[0]) {
      importTapeFile(e.target.files[0]);
    }
    e.target.value = '';
  });
  $('btn-print').addEventListener('click', function () { window.print(); });
  $('btn-clear').addEventListener('click', clearTape);
  bindCoverInputs();
}

function init() {
  var shared = decodeShareHash();
  if (shared === 'invalid') {
    showToast('That share link could not be read. Starting fresh.', true);
    var saved = loadSavedTape();
    if (saved) applyTape(saved);
  } else if (shared) {
    applyTape(shared);
    saveTape();
    showToast('Loaded a shared tape.');
  } else {
    var saved2 = loadSavedTape();
    if (saved2) applyTape(saved2);
  }
  syncCoverInputs();
  setTheme(state.theme, true);
  bindEvents();
  renderAll();
  switchSidePanel(state.currentSide);
  window.setInterval(updateProgress, 200);
}

init();
