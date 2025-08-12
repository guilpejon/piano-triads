// Chord dictionary data structure and utilities
export interface ChordDefinition {
  root_position: string[];
  first_inversion?: string[];
  second_inversion?: string[];
  third_inversion?: string[];
}

// Centralized chord dictionary
const chordDictionary = new Map<string, ChordDefinition>();

// Initialize chord dictionary with all chord definitions
function initializeChordDictionary() {
  // C chords
  chordDictionary.set('CM', {root_position: ["C3", "E3", "G3"], first_inversion: ["E3", "G3", "C4"], second_inversion: ["G3", "C4", "E4"]});
  chordDictionary.set('Cdim', {root_position: ["C3", "Eb3", "Gb3"], first_inversion: ["Eb3", "Gb3", "C4"], second_inversion: ["Gb3", "C4", "Eb4"]});
  chordDictionary.set('C9', {root_position: ["C3", "E3", "G3", "Bb3", "D4"]});
  chordDictionary.set('C11', {root_position: ["C3", "E3", "G3", "Bb3", "D4", "F4"]});
  chordDictionary.set('Csus4', {root_position: ["C4", "F4", "G4"], first_inversion: ["F3", "G3", "C4"], second_inversion: ["G3", "C4", "F4"]});
  chordDictionary.set('Cmaj7', {root_position: ["C3", "E3", "G3", "B3"], first_inversion: ["E3", "G3", "B3", "C4"], second_inversion: ["G3", "B3", "C4", "E4"], third_inversion: ["B3", "C4", "E4", "G4"]});
  chordDictionary.set('C7', {root_position: ["C3", "E3", "G3", "Bb3"], first_inversion: ["E3", "G3", "Bb3", "C4"], second_inversion: ["G3", "Bb3", "C4", "E4"], third_inversion: ["Bb3", "C4", "E4", "G4"]});
  chordDictionary.set('Cm', {root_position: ["C3", "Eb3", "G3"], first_inversion: ["Eb3", "G3", "C4"], second_inversion: ["G3", "C4", "Eb4"]});
  chordDictionary.set('Cm7', {root_position: ["C3", "Eb3", "G3", "Bb3"], first_inversion: ["Eb3", "G3", "Bb3", "C4"], second_inversion: ["G3", "Bb3", "C4", "Eb4"], third_inversion: ["Bb3", "C4", "Eb4", "G4"]});

  // C# chords
  chordDictionary.set('C#M', {root_position: ["C#3", "F3", "G#3"], first_inversion: ["F3", "G#3", "C#4"], second_inversion: ["G#3", "C#4", "F4"]});
  chordDictionary.set('C#dim', {root_position: ["C#3", "E3", "G3"], first_inversion: ["E3", "G3", "C#4"], second_inversion: ["G3", "C#4", "E4"]});
  chordDictionary.set('C#9', {root_position: ["C#3", "F3", "G#3", "B3", "D#4"]});
  chordDictionary.set('C#11', {root_position: ["C#3", "F3", "G#3", "B3", "D#4", "F#4"]});
  chordDictionary.set('C#sus4', {root_position: ["C#3", "F#3", "G#3"], first_inversion: ["F#3", "G#3", "C#4"], second_inversion: ["G#3", "C#4", "F#4"]});
  chordDictionary.set('C#maj7', {root_position: ["C#3", "F3", "G#3", "C4"], first_inversion: ["F3", "G#3", "C4", "C#4"], second_inversion: ["G#3", "C4", "C#4", "F4"], third_inversion: ["C4", "C#4", "F4", "G#4"]});
  chordDictionary.set('C#7', {root_position: ["C#3", "F3", "G#3", "B3"], first_inversion: ["F3", "G#3", "B3", "C#4"], second_inversion: ["G#3", "B3", "C#4", "F4"], third_inversion: ["B3", "C#4", "F4", "B4"]});
  chordDictionary.set('C#m', {root_position: ["C#3", "E3", "G#3"], first_inversion: ["E3", "G#3", "C#4"], second_inversion: ["G#3", "C#4", "E4"]});
  chordDictionary.set('C#m7', {root_position: ["C#3", "E3", "G#3", "B3"], first_inversion: ["E3", "G#3", "B3", "C#4"], second_inversion: ["G#3", "B3", "C#4", "E4"], third_inversion: ["B3", "C#4", "E4", "G#4"]});

  // Db chords (same as C#)
  chordDictionary.set('DbM', {root_position: ["Db3", "F3", "Ab3"], first_inversion: ["F3", "Ab3", "Db4"], second_inversion: ["Ab3", "Db4", "F4"]});
  chordDictionary.set('Dbdim', {root_position: ["Db3", "E3", "G3"], first_inversion: ["E3", "G3", "Db4"], second_inversion: ["G3", "Db4", "E4"]});
  chordDictionary.set('Db9', {root_position: ["Db3", "F3", "Ab3", "B3", "Eb4"]});
  chordDictionary.set('Db11', {root_position: ["Db3", "F3", "Ab3", "B3", "Eb4", "Gb4"]});
  chordDictionary.set('Dbsus4', {root_position: ["Db3", "Gb3", "Ab3"], first_inversion: ["Gb3", "Ab3", "Db4"], second_inversion: ["Ab3", "Db4", "Gb4"]});
  chordDictionary.set('Dbmaj7', {root_position: ["Db3", "F3", "Ab3", "C4"], first_inversion: ["F3", "Ab3", "C4", "Db4"], second_inversion: ["Ab3", "C4", "Db4", "F4"], third_inversion: ["C4", "Db4", "F4", "Ab4"]});
  chordDictionary.set('Db7', {root_position: ["Db3", "F3", "Ab3", "B3"], first_inversion: ["F3", "Ab3", "B3", "Db4"], second_inversion: ["Ab3", "B3", "Db4", "F4"], third_inversion: ["B3", "Db4", "F4", "B4"]});
  chordDictionary.set('Dbm', {root_position: ["Db3", "E3", "Ab3"], first_inversion: ["E3", "Ab3", "Db4"], second_inversion: ["Ab3", "Db4", "E4"]});
  chordDictionary.set('Dbm7', {root_position: ["Db3", "E3", "Ab3", "B3"], first_inversion: ["E3", "Ab3", "B3", "Db4"], second_inversion: ["Ab3", "B3", "Db4", "E4"], third_inversion: ["B3", "Db4", "E4", "Ab4"]});

  // D chords
  chordDictionary.set('DM', {root_position: ["D3", "F#3", "A3"], first_inversion: ["F#3", "A3", "D4"], second_inversion: ["A3", "D4", "F#4"]});
  chordDictionary.set('Ddim', {root_position: ["D3", "F3", "Ab3"], first_inversion: ["F3", "Ab3", "D4"], second_inversion: ["Ab3", "D4", "F4"]});
  chordDictionary.set('D9', {root_position: ["D3", "F#3", "A3", "C4", "E4"]});
  chordDictionary.set('D11', {root_position: ["D3", "F#3", "A3", "C4", "E4", "G4"]});
  chordDictionary.set('Dsus4', {root_position: ["D3", "G3", "A3"], first_inversion: ["G3", "A3", "D4"], second_inversion: ["A3", "D4", "G4"]});
  chordDictionary.set('Dmaj7', {root_position: ["D3", "F#3", "A3", "C#4"], first_inversion: ["F#3", "A3", "C#4", "D4"], second_inversion: ["A3", "C#4", "D4", "F#4"], third_inversion: ["C#4", "D4", "F#4", "A4"]});
  chordDictionary.set('D7', {root_position: ["D3", "F#3", "A3", "C4"], first_inversion: ["F#3", "A3", "C4", "D4"], second_inversion: ["A3", "C4", "D4", "F#4"], third_inversion: ["C4", "D4", "F#4", "A4"]});
  chordDictionary.set('Dm', {root_position: ["D3", "F3", "A3"], first_inversion: ["F3", "A3", "D4"], second_inversion: ["A3", "D4", "F4"]});
  chordDictionary.set('Dm7', {root_position: ["D3", "F3", "A3", "C4"], first_inversion: ["F3", "A3", "C4", "D4"], second_inversion: ["A3", "C4", "D4", "F4"], third_inversion: ["C4", "D4", "F4", "A4"]});

  // D# chords
  chordDictionary.set('D#M', {root_position: ["D#3", "G3", "A#3"], first_inversion: ["G3", "A#3", "D#4"], second_inversion: ["A#3", "D#4", "G4"]});
  chordDictionary.set('D#dim', {root_position: ["D#3", "F#3", "A3"], first_inversion: ["F#3", "A3", "D#4"], second_inversion: ["A3", "D#4", "F#4"]});
  chordDictionary.set('D#9', {root_position: ["D#3", "G3", "A#3", "C#4", "F4"]});
  chordDictionary.set('D#11', {root_position: ["D#3", "G3", "A#3", "C#4", "F4", "G#4"]});
  chordDictionary.set('D#sus4', {root_position: ["D#3", "G#3", "A#3"], first_inversion: ["G#3", "A#3", "D#4"], second_inversion: ["A#3", "D#4", "G#4"]});
  chordDictionary.set('D#maj7', {root_position: ["D#3", "G3", "A#3", "D4"], first_inversion: ["G3", "A#3", "D4", "D#4"], second_inversion: ["A#3", "D4", "D#4", "G4"], third_inversion: ["D4", "D#4", "G4", "A#4"]});
  chordDictionary.set('D#7', {root_position: ["D#3", "G3", "A#3", "C#4"], first_inversion: ["G3", "A#3", "C#4", "D#4"], second_inversion: ["A#3", "C#4", "D#4", "G4"], third_inversion: ["C#4", "D#4", "G4", "A#4"]});
  chordDictionary.set('D#m', {root_position: ["D#3", "F#3", "A#3"], first_inversion: ["F#3", "A#3", "D#4"], second_inversion: ["A#3", "D#4", "F#4"]});
  chordDictionary.set('D#m7', {root_position: ["D#3", "F#3", "A#3", "C#4"], first_inversion: ["F#3", "A#3", "C#4", "D#4"], second_inversion: ["A#3", "C#4", "D#4", "F#4"], third_inversion: ["C#4", "D#4", "F#4", "A#4"]});

  // Eb chords (same as D#)
  chordDictionary.set('EbM', {root_position: ["Eb3", "G3", "Bb3"], first_inversion: ["G3", "Bb3", "Eb4"], second_inversion: ["Bb3", "Eb4", "G4"]});
  chordDictionary.set('Ebdim', {root_position: ["Eb3", "Gb3", "A3"], first_inversion: ["Gb3", "A3", "Eb4"], second_inversion: ["A3", "Eb4", "Gb4"]});
  chordDictionary.set('Eb9', {root_position: ["Eb3", "G3", "Bb3", "Db4", "F4"]});
  chordDictionary.set('Eb11', {root_position: ["Eb3", "G3", "Bb3", "Db4", "F4", "Ab4"]});
  chordDictionary.set('Ebsus4', {root_position: ["Eb3", "Ab3", "Bb3"], first_inversion: ["Ab3", "Bb3", "Eb4"], second_inversion: ["Bb3", "Eb4", "Ab4"]});
  chordDictionary.set('Ebmaj7', {root_position: ["Eb3", "G3", "Bb3", "D4"], first_inversion: ["G3", "Bb3", "D4", "Eb4"], second_inversion: ["Bb3", "D4", "Eb4", "G4"], third_inversion: ["D4", "Eb4", "G4", "Bb4"]});
  chordDictionary.set('Eb7', {root_position: ["Eb3", "G3", "Bb3", "Db4"], first_inversion: ["G3", "Bb3", "Db4", "Eb4"], second_inversion: ["Bb3", "Db4", "Eb4", "G4"], third_inversion: ["Db4", "Eb4", "G4", "Bb4"]});
  chordDictionary.set('Ebm', {root_position: ["Eb3", "Gb3", "Bb3"], first_inversion: ["Gb3", "Bb3", "Eb4"], second_inversion: ["Bb3", "Eb4", "Gb4"]});
  chordDictionary.set('Ebm7', {root_position: ["Eb3", "Gb3", "Bb3", "Db4"], first_inversion: ["Gb3", "Bb3", "Db4", "Eb4"], second_inversion: ["Bb3", "Db4", "Eb4", "Gb4"], third_inversion: ["Db4", "Eb4", "Gb4", "Bb4"]});

  // E chords
  chordDictionary.set('EM', {root_position: ["E3", "G#3", "B3"], first_inversion: ["G#3", "B3", "E4"], second_inversion: ["B3", "E4", "G#4"]});
  chordDictionary.set('Edim', {root_position: ["E3", "G3", "Bb3"], first_inversion: ["G3", "Bb3", "E4"], second_inversion: ["Bb3", "E4", "G4"]});
  chordDictionary.set('E9', {root_position: ["E3", "G#3", "B3", "D4", "F#4"]});
  chordDictionary.set('E11', {root_position: ["E3", "G#3", "B3", "D4", "F#4", "A4"]});
  chordDictionary.set('Esus4', {root_position: ["E3", "A3", "B3"], first_inversion: ["A3", "B3", "E4"], second_inversion: ["B3", "E4", "A4"]});
  chordDictionary.set('Emaj7', {root_position: ["E3", "G#3", "B3", "D#4"], first_inversion: ["G#3", "B3", "D#4", "E4"], second_inversion: ["B3", "D#4", "E4", "G#4"], third_inversion: ["D#4", "E4", "G#4", "B4"]});
  chordDictionary.set('E7', {root_position: ["E3", "G#3", "B3", "D4"], first_inversion: ["G#3", "B3", "D4", "E4"], second_inversion: ["B3", "D4", "E4", "G#4"], third_inversion: ["D4", "E4", "G#4", "B4"]});
  chordDictionary.set('Em', {root_position: ["E3", "G3", "B3"], first_inversion: ["G3", "B3", "E4"], second_inversion: ["B3", "E4", "G4"]});
  chordDictionary.set('Em7', {root_position: ["E3", "G3", "B3", "D4"], first_inversion: ["G3", "B3", "D4", "E4"], second_inversion: ["B3", "D4", "E4", "G4"], third_inversion: ["D4", "E4", "G4", "B4"]});

  // F chords
  chordDictionary.set('FM', {root_position: ["F3", "A3", "C4"], first_inversion: ["A3", "C4", "F4"], second_inversion: ["C4", "F4", "A4"]});
  chordDictionary.set('Fdim', {root_position: ["F3", "Ab3", "B3"], first_inversion: ["Ab3", "B3", "F4"], second_inversion: ["B3", "F4", "Ab4"]});
  chordDictionary.set('F9', {root_position: ["F3", "A3", "C4", "Eb4", "G4"]});
  chordDictionary.set('F11', {root_position: ["F3", "A3", "C4", "Eb4", "G4", "Bb4"]});
  chordDictionary.set('Fsus4', {root_position: ["F3", "Bb3", "C4"], first_inversion: ["Bb3", "C4", "F4"], second_inversion: ["C4", "F4", "Bb4"]});
  chordDictionary.set('Fmaj7', {root_position: ["F3", "A3", "C4", "E4"], first_inversion: ["A3", "C4", "E4", "F4"], second_inversion: ["C4", "E4", "F4", "A4"], third_inversion: ["E4", "F4", "A4", "C5"]});
  chordDictionary.set('F7', {root_position: ["F3", "A3", "C4", "Eb4"], first_inversion: ["A3", "C4", "Eb4", "F4"], second_inversion: ["C4", "Eb4", "F4", "A4"], third_inversion: ["Eb4", "F4", "A4", "C5"]});
  chordDictionary.set('Fm', {root_position: ["F3", "Ab3", "C4"], first_inversion: ["Ab3", "C4", "F4"], second_inversion: ["C4", "F4", "Ab4"]});
  chordDictionary.set('Fm7', {root_position: ["F3", "Ab3", "C4", "Eb4"], first_inversion: ["Ab3", "C4", "Eb4", "F4"], second_inversion: ["C4", "Eb4", "F4", "Ab4"], third_inversion: ["Eb4", "F4", "Ab4", "C5"]});

  // F# chords
  chordDictionary.set('F#M', {root_position: ["F#3", "A#3", "C#4"], first_inversion: ["A#3", "C#4", "F#4"], second_inversion: ["C#4", "F#4", "A#4"]});
  chordDictionary.set('F#dim', {root_position: ["F#3", "A3", "C4"], first_inversion: ["A3", "C4", "F#4"], second_inversion: ["C4", "F#4", "A4"]});
  chordDictionary.set('F#9', {root_position: ["F#3", "A#3", "C#4", "E4", "G#4"]});
  chordDictionary.set('F#11', {root_position: ["F#3", "A#3", "C#4", "E4", "G#4", "B4"]});
  chordDictionary.set('F#sus4', {root_position: ["F#3", "B3", "C#4"], first_inversion: ["B3", "C#4", "F#4"], second_inversion: ["C#4", "F#4", "B4"]});
  chordDictionary.set('F#maj7', {root_position: ["F#3", "A#3", "C#4", "F4"], first_inversion: ["A#3", "C#4", "F4", "F#4"], second_inversion: ["C#4", "F4", "F#4", "A#4"], third_inversion: ["F4", "F#4", "A#4", "C#5"]});
  chordDictionary.set('F#7', {root_position: ["F#3", "A#3", "C#4", "E4"], first_inversion: ["A#3", "C#4", "E4", "F#4"], second_inversion: ["C#4", "E4", "F#4", "A#4"], third_inversion: ["E4", "F#4", "A#4", "C#5"]});
  chordDictionary.set('F#m', {root_position: ["F#3", "A3", "C#4"], first_inversion: ["A3", "C#4", "F#4"], second_inversion: ["C#4", "F#4", "A4"]});
  chordDictionary.set('F#m7', {root_position: ["F#3", "A3", "C#4", "E4"], first_inversion: ["A3", "C#4", "E4", "F#4"], second_inversion: ["C#4", "E4", "F#4", "A4"], third_inversion: ["E4", "F#4", "A4", "C#5"]});

  // Gb chords (same as F#)
  chordDictionary.set('GbM', {root_position: ["Gb3", "Bb3", "Db4"], first_inversion: ["Bb3", "Db4", "Gb4"], second_inversion: ["Db4", "Gb4", "Bb4"]});
  chordDictionary.set('Gbdim', {root_position: ["Gb3", "A3", "C4"], first_inversion: ["A3", "C4", "Gb4"], second_inversion: ["C4", "Gb4", "A4"]});
  chordDictionary.set('Gb9', {root_position: ["Gb3", "Bb3", "Db4", "E4", "Ab4"]});
  chordDictionary.set('Gb11', {root_position: ["Gb3", "Bb3", "Db4", "E4", "Ab4", "B4"]});
  chordDictionary.set('Gbsus4', {root_position: ["Gb3", "B3", "Db4"], first_inversion: ["B3", "Db4", "Gb4"], second_inversion: ["Db4", "Gb4", "B4"]});
  chordDictionary.set('Gbmaj7', {root_position: ["Gb3", "Bb3", "Db4", "F4"], first_inversion: ["Bb3", "Db4", "F4", "Gb4"], second_inversion: ["Db4", "F4", "Gb4", "Bb4"], third_inversion: ["F4", "Gb4", "Bb4", "Db5"]});
  chordDictionary.set('Gb7', {root_position: ["Gb3", "Bb3", "Db4", "E4"], first_inversion: ["Bb3", "Db4", "E4", "Gb4"], second_inversion: ["Db4", "E4", "Gb4", "Bb4"], third_inversion: ["E4", "Gb4", "Bb4", "Db5"]});
  chordDictionary.set('Gbm', {root_position: ["Gb3", "A3", "Db4"], first_inversion: ["A3", "Db4", "Gb4"], second_inversion: ["Db4", "Gb4", "A4"]});
  chordDictionary.set('Gbm7', {root_position: ["Gb3", "A3", "Db4", "E4"], first_inversion: ["A3", "Db4", "E4", "Gb4"], second_inversion: ["Db4", "E4", "Gb4", "A4"], third_inversion: ["E4", "Gb4", "A4", "Db5"]});

  // G chords
  chordDictionary.set('GM', {root_position: ["G3", "B3", "D4"], first_inversion: ["B3", "D4", "G4"], second_inversion: ["D4", "G4", "B4"]});
  chordDictionary.set('Gdim', {root_position: ["G3", "Bb3", "Db4"], first_inversion: ["Bb3", "Db4", "G4"], second_inversion: ["Db4", "G4", "Bb4"]});
  chordDictionary.set('G9', {root_position: ["G3", "B3", "D4", "F4", "A4"]});
  chordDictionary.set('G11', {root_position: ["G3", "B3", "D4", "F4", "A4", "C5"]});
  chordDictionary.set('Gsus4', {root_position: ["G3", "C4", "D4"], first_inversion: ["C4", "D4", "G4"], second_inversion: ["D4", "G4", "C5"]});
  chordDictionary.set('Gmaj7', {root_position: ["G3", "B3", "D4", "F#4"], first_inversion: ["B3", "D4", "F#4", "G4"], second_inversion: ["D4", "F#4", "G4", "B4"], third_inversion: ["F#4", "G4", "B4", "D5"]});
  chordDictionary.set('G7', {root_position: ["G3", "B3", "D4", "F4"], first_inversion: ["B3", "D4", "F4", "G4"], second_inversion: ["D4", "F4", "G4", "B4"], third_inversion: ["F4", "G4", "B4", "D5"]});
  chordDictionary.set('Gm', {root_position: ["G3", "Bb3", "D4"], first_inversion: ["Bb3", "D4", "G4"], second_inversion: ["D4", "G4", "Bb4"]});
  chordDictionary.set('Gm7', {root_position: ["G3", "Bb3", "D4", "F4"], first_inversion: ["Bb3", "D4", "F4", "G4"], second_inversion: ["D4", "F4", "G4", "Bb4"], third_inversion: ["F4", "G4", "Bb4", "D5"]});

  // G# chords
  chordDictionary.set('G#M', {root_position: ["G#3", "C4", "D#4"], first_inversion: ["C4", "D#4", "G#4"], second_inversion: ["D#4", "G#4", "C5"]});
  chordDictionary.set('G#dim', {root_position: ["G#3", "B3", "D4"], first_inversion: ["B3", "D4", "G#4"], second_inversion: ["D4", "G#4", "B4"]});
  chordDictionary.set('G#9', {root_position: ["G#3", "C4", "D#4", "F#4", "A#4"]});
  chordDictionary.set('G#11', {root_position: ["G#3", "C4", "D#4", "F#4", "A#4", "C#5"]});
  chordDictionary.set('G#sus4', {root_position: ["G#3", "C#4", "D#4"], first_inversion: ["C#4", "D#4", "G#4"], second_inversion: ["D#4", "G#4", "C#5"]});
  chordDictionary.set('G#maj7', {root_position: ["G#3", "C4", "D#4", "G4"], first_inversion: ["C4", "D#4", "G4", "G#4"], second_inversion: ["D#4", "G4", "G#4", "C5"], third_inversion: ["G4", "G#4", "C5", "D#5"]});
  chordDictionary.set('G#7', {root_position: ["G#3", "C4", "D#4", "F#4"], first_inversion: ["C4", "D#4", "F#4", "G#4"], second_inversion: ["D#4", "F#4", "G#4", "C5"], third_inversion: ["F#4", "G#4", "C5", "D#5"]});
  chordDictionary.set('G#m', {root_position: ["G#3", "B3", "D#4"], first_inversion: ["B3", "D#4", "G#4"], second_inversion: ["D#4", "G#4", "B4"]});
  chordDictionary.set('G#m7', {root_position: ["G#3", "B3", "D#4", "F#4"], first_inversion: ["B3", "D#4", "F#4", "G#4"], second_inversion: ["D#4", "F#4", "G#4", "B4"], third_inversion: ["F#4", "G#4", "B4", "D#5"]});

  // Ab chords (same as G#)
  chordDictionary.set('AbM', {root_position: ["Ab3", "C4", "Eb4"], first_inversion: ["C4", "Eb4", "Ab4"], second_inversion: ["Eb4", "Ab4", "C5"]});
  chordDictionary.set('Abdim', {root_position: ["Ab3", "B3", "D4"], first_inversion: ["B3", "D4", "Ab4"], second_inversion: ["D4", "Ab4", "B4"]});
  chordDictionary.set('Ab9', {root_position: ["Ab3", "C4", "Eb4", "Gb4", "Bb4"]});
  chordDictionary.set('Ab11', {root_position: ["Ab3", "C4", "Eb4", "Gb4", "Bb4", "Db5"]});
  chordDictionary.set('Absus4', {root_position: ["Ab3", "Db4", "Eb4"], first_inversion: ["Db4", "Eb4", "Ab4"], second_inversion: ["Eb4", "Ab4", "Db5"]});
  chordDictionary.set('Abmaj7', {root_position: ["Ab3", "C4", "Eb4", "G4"], first_inversion: ["C4", "Eb4", "G4", "Ab4"], second_inversion: ["Eb4", "G4", "Ab4", "C5"], third_inversion: ["G4", "Ab4", "C5", "Eb5"]});
  chordDictionary.set('Ab7', {root_position: ["Ab3", "C4", "Eb4", "Gb4"], first_inversion: ["C4", "Eb4", "Gb4", "Ab4"], second_inversion: ["Eb4", "Gb4", "Ab4", "C5"], third_inversion: ["Gb4", "Ab4", "C5", "Eb5"]});
  chordDictionary.set('Abm', {root_position: ["Ab3", "B3", "Eb4"], first_inversion: ["B3", "Eb4", "Ab4"], second_inversion: ["Eb4", "Ab4", "B4"]});
  chordDictionary.set('Abm7', {root_position: ["Ab3", "B3", "Eb4", "Gb4"], first_inversion: ["B3", "Eb4", "Gb4", "Ab4"], second_inversion: ["Eb4", "Gb4", "Ab4", "B4"], third_inversion: ["Gb4", "Ab4", "B4", "Eb5"]});

  // A chords
  chordDictionary.set('AM', {root_position: ["A3", "C#4", "E4"], first_inversion: ["C#4", "E4", "A4"], second_inversion: ["E4", "A4", "C#5"]});
  chordDictionary.set('Adim', {root_position: ["A3", "C4", "Eb4"], first_inversion: ["C4", "Eb4", "A4"], second_inversion: ["Eb4", "A4", "C5"]});
  chordDictionary.set('A9', {root_position: ["A3", "C#4", "E4", "G4", "B4"]});
  chordDictionary.set('A11', {root_position: ["A3", "C#4", "E4", "G4", "B4", "D5"]});
  chordDictionary.set('Asus4', {root_position: ["A3", "D4", "E4"], first_inversion: ["D4", "E4", "A4"], second_inversion: ["E4", "A4", "D5"]});
  chordDictionary.set('Amaj7', {root_position: ["A3", "C#4", "E4", "G#4"], first_inversion: ["C#4", "E4", "G#4", "A4"], second_inversion: ["E4", "G#4", "A4", "C#5"], third_inversion: ["G#4", "A4", "C#5", "E5"]});
  chordDictionary.set('A7', {root_position: ["A3", "C#4", "E4", "G4"], first_inversion: ["C#4", "E4", "G4", "A4"], second_inversion: ["E4", "G4", "A4", "C#5"], third_inversion: ["G4", "A4", "C#5", "E5"]});
  chordDictionary.set('Am', {root_position: ["A3", "C4", "E4"], first_inversion: ["C4", "E4", "A4"], second_inversion: ["E4", "A4", "C5"]});
  chordDictionary.set('Am7', {root_position: ["A3", "C4", "E4", "G4"], first_inversion: ["C4", "E4", "G4", "A4"], second_inversion: ["E4", "G4", "A4", "C5"], third_inversion: ["G4", "A4", "C5", "E5"]});

  // A# chords
  chordDictionary.set('A#M', {root_position: ["A#3", "D4", "F4"], first_inversion: ["D4", "F4", "A#4"], second_inversion: ["F4", "A#4", "D5"]});
  chordDictionary.set('A#dim', {root_position: ["A#3", "C#4", "E4"], first_inversion: ["C#4", "E4", "A#4"], second_inversion: ["E4", "A#4", "C#5"]});
  chordDictionary.set('A#9', {root_position: ["A#3", "D4", "F4", "G#4", "C5"]});
  chordDictionary.set('A#11', {root_position: ["A#3", "D4", "F4", "G#4", "C5", "D#5"]});
  chordDictionary.set('A#sus4', {root_position: ["A#3", "D#4", "F4"], first_inversion: ["D#4", "F4", "A#4"], second_inversion: ["F4", "A#4", "D#5"]});
  chordDictionary.set('A#maj7', {root_position: ["A#3", "D4", "F4", "A4"], first_inversion: ["D4", "F4", "A4", "A#4"], second_inversion: ["F4", "A4", "A#4", "D5"], third_inversion: ["A4", "A#4", "D5", "F5"]});
  chordDictionary.set('A#7', {root_position: ["A#3", "D4", "F4", "G#4"], first_inversion: ["D4", "F4", "G#4", "A#4"], second_inversion: ["F4", "G#4", "A#4", "D5"], third_inversion: ["G#4", "A#4", "D5", "F5"]});
  chordDictionary.set('A#m', {root_position: ["A#3", "C#4", "F4"], first_inversion: ["C#4", "F4", "A#4"], second_inversion: ["F4", "A#4", "C#5"]});
  chordDictionary.set('A#m7', {root_position: ["A#3", "C#4", "F4", "G#4"], first_inversion: ["C#4", "F4", "G#4", "A#4"], second_inversion: ["F4", "G#4", "A#4", "C#5"], third_inversion: ["G#4", "A#4", "C#5", "F5"]});

  // Bb chords (same as A#)
  chordDictionary.set('BbM', {root_position: ["Bb3", "D4", "F4"], first_inversion: ["D4", "F4", "Bb4"], second_inversion: ["F4", "Bb4", "D5"]});
  chordDictionary.set('Bbdim', {root_position: ["Bb3", "Db4", "E4"], first_inversion: ["Db4", "E4", "Bb4"], second_inversion: ["E4", "Bb4", "Db5"]});
  chordDictionary.set('Bb9', {root_position: ["Bb3", "D4", "F4", "Ab4", "C5"]});
  chordDictionary.set('Bb11', {root_position: ["Bb3", "D4", "F4", "Ab4", "C5", "Eb5"]});
  chordDictionary.set('Bbsus4', {root_position: ["Bb3", "Eb4", "F4"], first_inversion: ["Eb4", "F4", "Bb4"], second_inversion: ["F4", "Bb4", "Eb5"]});
  chordDictionary.set('Bbmaj7', {root_position: ["Bb3", "D4", "F4", "A4"], first_inversion: ["D4", "F4", "A4", "Bb4"], second_inversion: ["F4", "A4", "Bb4", "D5"], third_inversion: ["A4", "Bb4", "D5", "F5"]});
  chordDictionary.set('Bb7', {root_position: ["Bb3", "D4", "F4", "Ab4"], first_inversion: ["D4", "F4", "Ab4", "Bb4"], second_inversion: ["F4", "Ab4", "Bb4", "D5"], third_inversion: ["Ab4", "Bb4", "D5", "F5"]});
  chordDictionary.set('Bbm', {root_position: ["Bb3", "Db4", "F4"], first_inversion: ["Db4", "F4", "Bb4"], second_inversion: ["F4", "Bb4", "Db5"]});
  chordDictionary.set('Bbm7', {root_position: ["Bb3", "Db4", "F4", "Ab4"], first_inversion: ["Db4", "F4", "Ab4", "Bb4"], second_inversion: ["F4", "Ab4", "Bb4", "Db5"], third_inversion: ["Ab4", "Bb4", "Db5", "F5"]});

  // B chords
  chordDictionary.set('BM', {root_position: ["B3", "D#4", "F#4"], first_inversion: ["D#4", "F#4", "B4"], second_inversion: ["F#4", "B4", "D#5"]});
  chordDictionary.set('Bdim', {root_position: ["B3", "D4", "F4"], first_inversion: ["D4", "F4", "B4"], second_inversion: ["F4", "B4", "D5"]});
  chordDictionary.set('B9', {root_position: ["B3", "D#4", "F#4", "A4", "C#5"]});
  chordDictionary.set('B11', {root_position: ["B3", "D#4", "F#4", "A4", "C#5", "E5"]});
  chordDictionary.set('Bsus4', {root_position: ["B3", "E4", "F#4"], first_inversion: ["E4", "F#4", "B4"], second_inversion: ["F#4", "B4", "E5"]});
  chordDictionary.set('Bmaj7', {root_position: ["B3", "D#4", "F#4", "A#4"], first_inversion: ["D#4", "F#4", "A#4", "B4"], second_inversion: ["F#4", "A#4", "B4", "D#5"], third_inversion: ["A#4", "B4", "D#5", "F#5"]});
  chordDictionary.set('B7', {root_position: ["B3", "D#4", "F#4", "A4"], first_inversion: ["D#4", "F#4", "A4", "B4"], second_inversion: ["F#4", "A4", "B4", "D#5"], third_inversion: ["A4", "B4", "D#5", "F#5"]});
  chordDictionary.set('Bm', {root_position: ["B3", "D4", "F#4"], first_inversion: ["D4", "F#4", "B4"], second_inversion: ["F#4", "B4", "D5"]});
  chordDictionary.set('Bm7', {root_position: ["B3", "D4", "F#4", "A4"], first_inversion: ["D4", "F#4", "A4", "B4"], second_inversion: ["F#4", "A4", "B4", "D5"], third_inversion: ["A4", "B4", "D5", "F#5"]});
}

// Lazy initialization
let isInitialized = false;

// Export functions
export function getChordDictionary(): Map<string, ChordDefinition> {
  if (!isInitialized) {
    initializeChordDictionary();
    isInitialized = true;
  }
  return chordDictionary;
}

export function getChord(chordName: string): ChordDefinition | undefined {
  const dictionary = getChordDictionary();
  return dictionary.get(chordName);
}

export function getAllChordNames(): string[] {
  const dictionary = getChordDictionary();
  return Array.from(dictionary.keys());
}

// Get a subset of chords suitable for practice (basic triads and 7th chords)
export function getPracticeChords(): string[] {
  const allChords = getAllChordNames();
  // Filter to basic chords for practice: major, minor, 7th, maj7
  return allChords.filter(chord => 
    chord.endsWith('M') || 
    chord.endsWith('m') || 
    chord.endsWith('7') || 
    chord.endsWith('maj7') ||
    chord.endsWith('m7') ||
    chord.endsWith('dim') ||
    chord.endsWith('sus4') ||
    chord.endsWith('9') ||
    chord.endsWith('11')
  );
}

// Enharmonic equivalents mapping
const enharmonicMap: { [key: string]: string } = {
  'C#': 'Db', 'Db': 'C#',
  'D#': 'Eb', 'Eb': 'D#',
  'F#': 'Gb', 'Gb': 'F#',
  'G#': 'Ab', 'Ab': 'G#',
  'A#': 'Bb', 'Bb': 'A#'
};

// Utility functions for note manipulation
export function getNoteNameOnly(noteWithOctave: string): string {
  return noteWithOctave.slice(0, -1); // Remove the last character (octave number)
}

export function areNotesEquivalent(note1: string, note2: string): boolean {
  const note1Name = getNoteNameOnly(note1);
  const note2Name = getNoteNameOnly(note2);
  
  return note1Name === note2Name || 
         note1Name === enharmonicMap[note2Name] || 
         note2Name === enharmonicMap[note1Name];
}

export function normalizeNoteName(noteName: string): string {
  return enharmonicMap[noteName] || noteName;
}

// Check if all chord notes have been clicked by the user
export function areAllChordNotesClicked(clickedNotes: Set<string>, chordNotes: string[]): boolean {
  if (!chordNotes.length || !clickedNotes.size) return false;
  
  const clickedNoteNames = Array.from(clickedNotes).map(note => getNoteNameOnly(note));
  const chordNoteNames = chordNotes.map(note => getNoteNameOnly(note));
  
  return chordNoteNames.every(chordNoteName => {
    return clickedNoteNames.some(clickedNoteName => areNotesEquivalent(clickedNoteName + '3', chordNoteName + '3'));
  });
}

// Chord tone rules mapping for music theory display
const chordToneRules: { [key: string]: string } = {
  'M': '1, 3, 5',
  'm': '1, b3, 5',
  'dim': '1, b3, b5',
  'sus4': '1, 4, 5',
  '7': '1, 3, 5, b7',
  'maj7': '1, 3, 5, 7',
  '9': '1, 3, 5, b7, 9',
  'm7': '1, b3, 5, b7',
  '11': '1, 3, 5, b7, 9, 11'
};

/**
 * Get the chord tone rule for a given chord type
 * @param chordType - The chord type (e.g., 'M', 'm', '7', 'maj7', etc.)
 * @returns The chord tone rule string (e.g., '1, 3, 5')
 */
export function getChordToneRule(chordType: string): string {
  return chordToneRules[chordType] || 'Custom chord structure';
}
