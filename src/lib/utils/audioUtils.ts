// Audio utility functions for piano playback

// Audio cache to store preloaded audio files
const audioCache = new Map<string, HTMLAudioElement>();
let isAudioPreloaded = false;
let preloadPromise: Promise<void> | null = null;

// List of all available audio files
const audioFiles = [
  'a3',
  'a4',
  'as3',
  'as4',
  'b3',
  'b4',
  'c3',
  'c4',
  'cs3',
  'cs4',
  'd3',
  'd4',
  'ds3',
  'ds4',
  'e3',
  'e4',
  'f3',
  'f4',
  'fs3',
  'fs4',
  'g3',
  'g4',
  'gs3',
  'gs4'
];

// Function to preload all audio files
export function preloadAudio(): Promise<void> {
  // Return existing promise if preloading is already in progress
  if (preloadPromise) {
    return preloadPromise;
  }

  // Return immediately if already preloaded
  if (isAudioPreloaded) {
    return Promise.resolve();
  }

  preloadPromise = new Promise((resolve, reject) => {
    let loadedCount = 0;
    const totalFiles = audioFiles.length;
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
    audioFiles.forEach((fileName) => {
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
  return audioCache.size / audioFiles.length;
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

  // Convert flat notes to their sharp equivalents to match MP3 filenames
  const flatToSharpMap: { [key: string]: string } = {
    Db: 'C#',
    Eb: 'D#',
    Gb: 'F#',
    Ab: 'G#',
    Bb: 'A#'
  };

  // Check if the note contains a flat and convert it
  for (const [flat, sharp] of Object.entries(flatToSharpMap)) {
    if (primaryNote.includes(flat)) {
      primaryNote = primaryNote.replace(flat, sharp);
      break;
    }
  }

  // Convert sharp (#) to 's' for filename (C#3 -> Cs3) and make lowercase
  return primaryNote.replace('#', 's').toLowerCase();
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
