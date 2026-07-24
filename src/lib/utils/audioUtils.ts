// Audio utility functions for piano playback.
//
// This module uses the Web Audio API rather than HTMLAudioElement, and that choice is
// load-bearing for iOS. Safari on iOS:
//   - unlocks HTMLAudioElement *per element*, so a cloned <audio> is never unlocked and its
//     play() rejects with NotAllowedError (this made notes silently fail at random),
//   - ignores preload='auto' and load() until a user gesture, so preloading never completed,
//   - queues blocked play() calls and flushes them together once a gesture arrives, which is
//     why several notes used to fire at once.
// Decoding into AudioBuffers is not gesture-gated, one AudioContext unlock covers every note,
// and AudioBufferSourceNodes give unlimited polyphony. Do not "simplify" this back to
// new Audio() — it works on Android and breaks on iOS.

// Decoded samples, keyed by MP3 basename (see getNoteFileName for the naming rules).
const bufferCache = new Map<string, AudioBuffer>();
// In-flight decodes, so concurrent callers share one fetch per file.
const pendingLoads = new Map<string, Promise<void>>();
// Currently sounding notes, so retriggering a key can fade the previous voice out.
const activeVoices = new Map<string, { source: AudioBufferSourceNode; gain: GainNode }>();

let audioContext: AudioContext | null = null;
let isUnlocked = false;
let unlockListenersAttached = false;

// Fade applied when the same note is retriggered while still ringing, in seconds.
const RETRIGGER_FADE = 0.03;
// Attack ramp, in seconds. Avoids a click on note start.
const ATTACK = 0.002;

// Audio file lists for different key ranges (matching actual MP3 file names).
// Kept grouped one octave per line — prettier would otherwise put each note on its own line
// and make the naming pattern impossible to read at a glance.
// prettier-ignore
const standardAudioFiles = [
  // Standard range: Octave 3-4 (C3 to B4)
  // Octave 3: lowercase naturals, uppercase flats
  'c3', 'Db3', 'd3', 'Eb3', 'e3', 'f3', 'Gb3', 'g3', 'Ab3', 'a3', 'Bb3', 'b3',
  // Octave 4: lowercase naturals, uppercase flats
  'c4', 'Db4', 'd4', 'Eb4', 'e4', 'f4', 'Gb4', 'g4', 'Ab4', 'a4', 'Bb4', 'b4'
];

// prettier-ignore
const extendedAudioFiles = [
  // Extended range: Octave 2-6 (matching actual file case)
  // Octave 2: uppercase naturals, uppercase flats
  'C2', 'Db2', 'D2', 'Eb2', 'E2', 'F2', 'Gb2', 'G2', 'Ab2', 'A2', 'Bb2', 'B2',
  // Octave 3: lowercase naturals, uppercase flats
  'c3', 'Db3', 'd3', 'Eb3', 'e3', 'f3', 'Gb3', 'g3', 'Ab3', 'a3', 'Bb3', 'b3',
  // Octave 4: lowercase naturals, uppercase flats
  'c4', 'Db4', 'd4', 'Eb4', 'e4', 'f4', 'Gb4', 'g4', 'Ab4', 'a4', 'Bb4', 'b4',
  // Octave 5: uppercase naturals, uppercase flats
  'C5', 'Db5', 'D5', 'Eb5', 'E5', 'F5', 'Gb5', 'G5', 'Ab5', 'A5', 'Bb5', 'B5',
  // Octave 6: uppercase naturals, uppercase flats
  'C6', 'Db6', 'D6', 'Eb6', 'E6', 'F6', 'Gb6', 'G6', 'Ab6', 'A6', 'Bb6', 'B6'
];

// Current audio files (defaults to standard for backward compatibility)
let currentAudioFiles = standardAudioFiles;
let currentKeyRange: 'standard' | 'extended' = 'standard';

// Lazily create the single AudioContext. Safe to call before any user gesture: the context
// starts suspended and is resumed by unlockAudio(). Returns null during SSR.
function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (audioContext) return audioContext;

  const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
  if (!Ctor) {
    console.error('Web Audio API is not available in this browser.');
    return null;
  }

  audioContext = new Ctor();

  // iOS 16.4+: opt into the "playback" audio session so the physical ringer/silent switch
  // does not mute us. Without this, an iPhone with the mute switch on stays silent.
  const audioSession = (navigator as any).audioSession;
  if (audioSession) {
    try {
      audioSession.type = 'playback';
    } catch {
      // Non-fatal: older iOS exposes the property but rejects the assignment.
    }
  }

  attachUnlockListeners();
  return audioContext;
}

// iOS starts every AudioContext suspended and will only resume it from inside a user gesture
// handler. Resume synchronously on the first interaction and prime the graph with a silent
// buffer so the very first real note has no startup latency.
function attachUnlockListeners(): void {
  if (unlockListenersAttached || typeof window === 'undefined') return;
  unlockListenersAttached = true;

  const events = ['pointerdown', 'touchend', 'keydown'] as const;

  const unlock = () => {
    const ctx = audioContext;
    if (!ctx) return;

    // Must be called synchronously within the gesture handler, not from a .then().
    ctx.resume();

    const source = ctx.createBufferSource();
    source.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    source.connect(ctx.destination);
    source.start(0);

    isUnlocked = true;
    events.forEach((event) => window.removeEventListener(event, unlock, true));
  };

  events.forEach((event) => window.addEventListener(event, unlock, true));

  // iOS suspends the context when the tab is backgrounded and after audio interruptions such
  // as an incoming call. Without this, sound never comes back after switching apps.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && audioContext?.state === 'suspended' && isUnlocked) {
      audioContext.resume();
    }
  });
}

// decodeAudioData is promise-based in modern browsers but callback-only in older Safari.
function decode(ctx: AudioContext, data: ArrayBuffer): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    const result = ctx.decodeAudioData(data, resolve, reject);
    // Modern implementations also return a promise; adopt it when present.
    if (result && typeof result.then === 'function') {
      result.then(resolve, reject);
    }
  });
}

// Fetch and decode one sample. Deduplicated across concurrent callers.
function loadSample(fileName: string): Promise<void> {
  if (bufferCache.has(fileName)) return Promise.resolve();

  const pending = pendingLoads.get(fileName);
  if (pending) return pending;

  const ctx = getContext();
  if (!ctx) return Promise.resolve();

  const load = fetch(`/audio/piano/${fileName}.mp3`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${fileName}.mp3`);
      }
      return response.arrayBuffer();
    })
    .then((data) => decode(ctx, data))
    .then((buffer) => {
      bufferCache.set(fileName, buffer);
    })
    .catch((error) => {
      console.error(`Failed to load audio sample ${fileName}.mp3:`, error);
    })
    .finally(() => {
      pendingLoads.delete(fileName);
    });

  pendingLoads.set(fileName, load);
  return load;
}

// Function to set the key range for audio files.
// Unlike the previous HTMLAudioElement implementation this never discards what is already
// decoded — buffers are range-independent and cheap to keep. It only widens the set to load.
export function setAudioKeyRange(keyRange: 'standard' | 'extended' = 'standard'): void {
  if (keyRange === currentKeyRange) return;

  currentKeyRange = keyRange;
  currentAudioFiles = keyRange === 'extended' ? extendedAudioFiles : standardAudioFiles;

  // Pull in any samples the new range adds, in the background.
  void preloadAudio(keyRange);
}

// Function to preload all audio files for a key range
export function preloadAudio(keyRange: 'standard' | 'extended' = 'standard'): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  if (keyRange !== currentKeyRange) {
    currentKeyRange = keyRange;
    currentAudioFiles = keyRange === 'extended' ? extendedAudioFiles : standardAudioFiles;
  }

  return Promise.all(currentAudioFiles.map(loadSample)).then(() => undefined);
}

// Function to check if every sample in the current range is decoded and ready
export function isAudioReady(): boolean {
  return currentAudioFiles.every((fileName) => bufferCache.has(fileName));
}

// Function to get preload progress (returns number between 0 and 1)
export function getPreloadProgress(): number {
  const loaded = currentAudioFiles.filter((fileName) => bufferCache.has(fileName)).length;
  return loaded / currentAudioFiles.length;
}

// Function to convert note data to MP3 filename
function getNoteFileName(noteData: string): string {
  // Extract the first note from compound notes like "C#3/Db3"
  let primaryNote = noteData.split('/')[0];

  // Convert sharp notes to their flat equivalents to match MP3 filenames
  // Examples: C#3 → Db3, D#4 → Eb4, F#3 → Gb3, G#4 → Ab4, A#3 → Bb3
  const sharpToFlatMap: { [key: string]: string } = {
    'C#': 'Db',
    'D#': 'Eb',
    'F#': 'Gb',
    'G#': 'Ab',
    'A#': 'Bb'
  };

  // Check if the note contains a sharp and convert it
  for (const [sharp, flat] of Object.entries(sharpToFlatMap)) {
    if (primaryNote.includes(sharp)) {
      primaryNote = primaryNote.replace(sharp, flat);
      break;
    }
  }

  // Handle inconsistent MP3 file naming:
  // - Octaves 3-4: lowercase natural notes (c3.mp3, d3.mp3, a3.mp3, etc.)
  // - Octaves 2, 5-6: uppercase natural notes (C2.mp3, A5.mp3, B6.mp3, etc.)
  // - All flats: always uppercase (Db3.mp3, Eb4.mp3, Ab3.mp3, etc.)

  const octaveMatch = primaryNote.match(/(\d+)$/);
  if (!octaveMatch) return primaryNote; // Fallback if no octave found

  const octave = parseInt(octaveMatch[1]);
  const noteWithoutOctave = primaryNote.replace(/\d+$/, '');

  // If it's a flat note, always use uppercase
  if (noteWithoutOctave.includes('b')) {
    return primaryNote; // Already in correct format (uppercase)
  }

  // For natural notes, use case based on octave
  if (octave >= 3 && octave <= 4) {
    // Octaves 3-4: use lowercase
    return noteWithoutOctave.toLowerCase() + octave;
  } else {
    // Octaves 2, 5-6: use uppercase
    return noteWithoutOctave.toUpperCase() + octave;
  }
}

// Start one sample at a specific context time. Every call gets a fresh source node — they are
// single-use by design, which is what makes chords and rapid repeats work.
function startVoice(ctx: AudioContext, fileName: string, when: number): void {
  const buffer = bufferCache.get(fileName);
  if (!buffer) return;

  // Fade out any voice still ringing for this note so retriggers don't phase against
  // themselves.
  const previous = activeVoices.get(fileName);
  if (previous) {
    previous.gain.gain.cancelScheduledValues(when);
    previous.gain.gain.setValueAtTime(previous.gain.gain.value, when);
    previous.gain.gain.linearRampToValueAtTime(0, when + RETRIGGER_FADE);
    previous.source.stop(when + RETRIGGER_FADE);
  }

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(1, when + ATTACK);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(gain);
  gain.connect(ctx.destination);

  source.onended = () => {
    if (activeVoices.get(fileName)?.source === source) {
      activeVoices.delete(fileName);
    }
    gain.disconnect();
  };

  source.start(when);
  activeVoices.set(fileName, { source, gain });
}

// Resolve the context, resuming it if a previous interruption left it suspended.
function getRunningContext(): AudioContext | null {
  const ctx = getContext();
  if (!ctx) return null;
  if (ctx.state === 'suspended') {
    // playNote is normally called from within a gesture handler, so this resumes immediately.
    ctx.resume();
  }
  return ctx;
}

// Function to play audio for a given note
export function playNote(noteData: string): void {
  const ctx = getRunningContext();
  if (!ctx) return;

  const fileName = getNoteFileName(noteData);

  if (bufferCache.has(fileName)) {
    startVoice(ctx, fileName, ctx.currentTime);
    return;
  }

  // Not decoded yet (first visit, or a sample outside the preloaded range). Fetch it and play
  // as soon as it lands.
  void loadSample(fileName).then(() => {
    if (bufferCache.has(fileName)) {
      startVoice(ctx, fileName, ctx.currentTime);
    }
  });
}

// Function to play multiple notes as a chord.
// All voices are scheduled at the same context time so the chord sounds as one event. Pass
// arpeggiateMs to deliberately roll the notes instead.
export function playChord(notes: string[], arpeggiateMs = 0): void {
  const ctx = getRunningContext();
  if (!ctx) return;

  const fileNames = notes.map(getNoteFileName);
  const missing = fileNames.filter((fileName) => !bufferCache.has(fileName));

  const schedule = () => {
    // Re-read the clock after any loading, and give the scheduler a small lead so every voice
    // starts on the same tick rather than drifting across callbacks.
    const start = ctx.currentTime + 0.02;
    fileNames.forEach((fileName, index) => {
      startVoice(ctx, fileName, start + (index * arpeggiateMs) / 1000);
    });
  };

  if (missing.length === 0) {
    schedule();
  } else {
    void Promise.all(missing.map(loadSample)).then(schedule);
  }
}
