// Audio utility functions for piano playback

// Audio cache to store preloaded audio files
const audioCache = new Map<string, HTMLAudioElement>();
let isAudioPreloaded = false;
let preloadPromise: Promise<void> | null = null;

// Audio file lists for different key ranges (matching actual MP3 file names)
const standardAudioFiles = [
  // Standard range: Octave 3-4 (C3 to B4)
  // Octave 3: lowercase naturals, uppercase flats
  'c3', 'Db3', 'd3', 'Eb3', 'e3', 'f3', 'Gb3', 'g3', 'Ab3', 'a3', 'Bb3', 'b3',
  // Octave 4: lowercase naturals, uppercase flats
  'c4', 'Db4', 'd4', 'Eb4', 'e4', 'f4', 'Gb4', 'g4', 'Ab4', 'a4', 'Bb4', 'b4'
];

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

// Function to set the key range for audio files
export function setAudioKeyRange(keyRange: 'standard' | 'extended' = 'standard'): void {
  currentAudioFiles = keyRange === 'extended' ? extendedAudioFiles : standardAudioFiles;
  // Clear the cache when range changes to force reloading
  audioCache.clear();
  isAudioPreloaded = false;
  preloadPromise = null;
}

// Function to preload all audio files
export function preloadAudio(keyRange: 'standard' | 'extended' = 'standard'): Promise<void> {
  // Return existing promise if preloading is already in progress
  if (preloadPromise) {
    return preloadPromise;
  }

  // Return immediately if already preloaded
  if (isAudioPreloaded) {
    return Promise.resolve();
  }

  // Set the audio range first
  setAudioKeyRange(keyRange);
  
  preloadPromise = new Promise((resolve, reject) => {
    let loadedCount = 0;
    const totalFiles = currentAudioFiles.length;
    let hasError = false;

    // Handle completion (success or failure)
    const handleComplete = () => {
      if (loadedCount === totalFiles) {
        if (!hasError) {
          isAudioPreloaded = true;
          resolve();
        } else {
          // Still resolve since we have some audio files loaded
          isAudioPreloaded = true;
          resolve();
        }
      }
    };

    // Preload each audio file
    currentAudioFiles.forEach((fileName) => {
      const audio = new Audio(`/audio/piano/${fileName}.mp3`);

      // Set up event listeners
      const onLoad = () => {
        audioCache.set(fileName, audio);
        loadedCount++;
        handleComplete();
        // Clean up listeners
        audio.removeEventListener('canplaythrough', onLoad);
        audio.removeEventListener('error', onError);
      };

      const onError = (error: any) => {
        hasError = true;
        loadedCount++;
        handleComplete();
        // Clean up listeners
        audio.removeEventListener('canplaythrough', onLoad);
        audio.removeEventListener('error', onError);
      };

      audio.addEventListener('canplaythrough', onLoad);
      audio.addEventListener('error', onError);

      // Set preload attribute and start loading
      audio.preload = 'auto';
      audio.load();
    });

    // Timeout fallback (30 seconds)
    setTimeout(() => {
      if (!isAudioPreloaded) {
        isAudioPreloaded = true;
        resolve();
      }
    }, 30000);
  });

  return preloadPromise;
}

// Function to check if audio is preloaded
export function isAudioReady(): boolean {
  return isAudioPreloaded;
}

// Function to get preload progress (returns number between 0 and 1)
export function getPreloadProgress(): number {
  return audioCache.size / currentAudioFiles.length;
}

// Function to get preloaded audio or create new one as fallback
function getAudio(fileName: string): HTMLAudioElement {
  const cachedAudio = audioCache.get(fileName);
  if (cachedAudio) {
    return cachedAudio.cloneNode() as HTMLAudioElement;
  }

  // Fallback: create new audio if not preloaded
  return new Audio(`/audio/piano/${fileName}.mp3`);
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

// Function to play audio for a given note
export function playNote(noteData: string): void {
  try {
    const fileName = getNoteFileName(noteData);
    const audio = getAudio(fileName);

    // Reset audio to beginning if it's already playing
    audio.currentTime = 0;

    // Play the audio
    audio.play().catch((error) => {
      console.warn(`Could not play audio for ${fileName}:`, error);
    });
  } catch (error) {
    console.error(`Error playing note ${noteData}:`, error);
  }
}

// Function to play multiple notes as a chord
export function playChord(notes: string[]): void {
  // Play all notes simultaneously with slight delay to create chord effect
  notes.forEach((note, index) => {
    setTimeout(() => {
      playNote(note);
    }, index * 50); // 50ms delay between each note for better chord sound
  });
}
