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
  chordDictionary.set('CM', {
    root_position: ['C3', 'E3', 'G3'],
    first_inversion: ['E3', 'G3', 'C4'],
    second_inversion: ['G3', 'C4', 'E4']
  });
  chordDictionary.set('Cdim', {
    root_position: ['C3', 'Eb3', 'Gb3'],
    first_inversion: ['Eb3', 'Gb3', 'C4'],
    second_inversion: ['Gb3', 'C4', 'Eb4']
  });
  chordDictionary.set('Cm♭5', {
    root_position: ['C3', 'Eb3', 'Gb3'],
    first_inversion: ['Eb3', 'Gb3', 'C4'],
    second_inversion: ['Gb3', 'C4', 'Eb4']
  });
  chordDictionary.set('C9', { root_position: ['C3', 'E3', 'G3', 'Bb3', 'D4'] });
  chordDictionary.set('C11', { root_position: ['C3', 'E3', 'G3', 'Bb3', 'D4', 'F4'] });
  chordDictionary.set('Csus4', {
    root_position: ['C4', 'F4', 'G4'],
    first_inversion: ['F3', 'G3', 'C4'],
    second_inversion: ['G3', 'C4', 'F4']
  });
  chordDictionary.set('Cmaj7', {
    root_position: ['C3', 'E3', 'G3', 'B3'],
    first_inversion: ['E3', 'G3', 'B3', 'C4'],
    second_inversion: ['G3', 'B3', 'C4', 'E4'],
    third_inversion: ['B3', 'C4', 'E4', 'G4']
  });
  chordDictionary.set('C7', {
    root_position: ['C3', 'E3', 'G3', 'Bb3'],
    first_inversion: ['E3', 'G3', 'Bb3', 'C4'],
    second_inversion: ['G3', 'Bb3', 'C4', 'E4'],
    third_inversion: ['Bb3', 'C4', 'E4', 'G4']
  });
  chordDictionary.set('Cm', {
    root_position: ['C3', 'Eb3', 'G3'],
    first_inversion: ['Eb3', 'G3', 'C4'],
    second_inversion: ['G3', 'C4', 'Eb4']
  });
  chordDictionary.set('Cm7', {
    root_position: ['C3', 'Eb3', 'G3', 'Bb3'],
    first_inversion: ['Eb3', 'G3', 'Bb3', 'C4'],
    second_inversion: ['G3', 'Bb3', 'C4', 'Eb4'],
    third_inversion: ['Bb3', 'C4', 'Eb4', 'G4']
  });

  // C# chords
  chordDictionary.set('C#M', {
    root_position: ['C#3', 'F3', 'G#3'],
    first_inversion: ['F3', 'G#3', 'C#4'],
    second_inversion: ['G#3', 'C#4', 'F4']
  });
  chordDictionary.set('C#dim', {
    root_position: ['C#3', 'E3', 'G3'],
    first_inversion: ['E3', 'G3', 'C#4'],
    second_inversion: ['G3', 'C#4', 'E4']
  });
  chordDictionary.set('C#9', { root_position: ['C#3', 'F3', 'G#3', 'B3', 'D#4'] });
  chordDictionary.set('C#11', { root_position: ['C#3', 'F3', 'G#3', 'B3', 'D#4', 'F#4'] });
  chordDictionary.set('C#sus4', {
    root_position: ['C#3', 'F#3', 'G#3'],
    first_inversion: ['F#3', 'G#3', 'C#4'],
    second_inversion: ['G#3', 'C#4', 'F#4']
  });
  chordDictionary.set('C#maj7', {
    root_position: ['C#3', 'F3', 'G#3', 'C4'],
    first_inversion: ['F3', 'G#3', 'C4', 'C#4'],
    second_inversion: ['G#3', 'C4', 'C#4', 'F4'],
    third_inversion: ['C4', 'C#4', 'F4', 'G#4']
  });
  chordDictionary.set('C#7', {
    root_position: ['C#3', 'F3', 'G#3', 'B3'],
    first_inversion: ['F3', 'G#3', 'B3', 'C#4'],
    second_inversion: ['G#3', 'B3', 'C#4', 'F4'],
    third_inversion: ['B3', 'C#4', 'F4', 'B4']
  });
  chordDictionary.set('C#m', {
    root_position: ['C#3', 'E3', 'G#3'],
    first_inversion: ['E3', 'G#3', 'C#4'],
    second_inversion: ['G#3', 'C#4', 'E4']
  });
  chordDictionary.set('C#m7', {
    root_position: ['C#3', 'E3', 'G#3', 'B3'],
    first_inversion: ['E3', 'G#3', 'B3', 'C#4'],
    second_inversion: ['G#3', 'B3', 'C#4', 'E4'],
    third_inversion: ['B3', 'C#4', 'E4', 'G#4']
  });

  // Db chords (same as C#)
  chordDictionary.set('DbM', {
    root_position: ['Db3', 'F3', 'Ab3'],
    first_inversion: ['F3', 'Ab3', 'Db4'],
    second_inversion: ['Ab3', 'Db4', 'F4']
  });
  chordDictionary.set('Dbdim', {
    root_position: ['Db3', 'E3', 'G3'],
    first_inversion: ['E3', 'G3', 'Db4'],
    second_inversion: ['G3', 'Db4', 'E4']
  });
  chordDictionary.set('Db9', { root_position: ['Db3', 'F3', 'Ab3', 'B3', 'Eb4'] });
  chordDictionary.set('Db11', { root_position: ['Db3', 'F3', 'Ab3', 'B3', 'Eb4', 'Gb4'] });
  chordDictionary.set('Dbsus4', {
    root_position: ['Db3', 'Gb3', 'Ab3'],
    first_inversion: ['Gb3', 'Ab3', 'Db4'],
    second_inversion: ['Ab3', 'Db4', 'Gb4']
  });
  chordDictionary.set('Dbmaj7', {
    root_position: ['Db3', 'F3', 'Ab3', 'C4'],
    first_inversion: ['F3', 'Ab3', 'C4', 'Db4'],
    second_inversion: ['Ab3', 'C4', 'Db4', 'F4'],
    third_inversion: ['C4', 'Db4', 'F4', 'Ab4']
  });
  chordDictionary.set('Db7', {
    root_position: ['Db3', 'F3', 'Ab3', 'B3'],
    first_inversion: ['F3', 'Ab3', 'B3', 'Db4'],
    second_inversion: ['Ab3', 'B3', 'Db4', 'F4'],
    third_inversion: ['B3', 'Db4', 'F4', 'B4']
  });
  chordDictionary.set('Dbm', {
    root_position: ['Db3', 'E3', 'Ab3'],
    first_inversion: ['E3', 'Ab3', 'Db4'],
    second_inversion: ['Ab3', 'Db4', 'E4']
  });
  chordDictionary.set('Dbm7', {
    root_position: ['Db3', 'E3', 'Ab3', 'B3'],
    first_inversion: ['E3', 'Ab3', 'B3', 'Db4'],
    second_inversion: ['Ab3', 'B3', 'Db4', 'E4'],
    third_inversion: ['B3', 'Db4', 'E4', 'Ab4']
  });

  // D chords
  chordDictionary.set('DM', {
    root_position: ['D3', 'F#3', 'A3'],
    first_inversion: ['F#3', 'A3', 'D4'],
    second_inversion: ['A3', 'D4', 'F#4']
  });
  chordDictionary.set('Ddim', {
    root_position: ['D3', 'F3', 'Ab3'],
    first_inversion: ['F3', 'Ab3', 'D4'],
    second_inversion: ['Ab3', 'D4', 'F4']
  });
  chordDictionary.set('Dm♭5', {
    root_position: ['D3', 'F3', 'Ab3'],
    first_inversion: ['F3', 'Ab3', 'D4'],
    second_inversion: ['Ab3', 'D4', 'F4']
  });
  chordDictionary.set('D9', { root_position: ['D3', 'F#3', 'A3', 'C4', 'E4'] });
  chordDictionary.set('D11', { root_position: ['D3', 'F#3', 'A3', 'C4', 'E4', 'G4'] });
  chordDictionary.set('Dsus4', {
    root_position: ['D3', 'G3', 'A3'],
    first_inversion: ['G3', 'A3', 'D4'],
    second_inversion: ['A3', 'D4', 'G4']
  });
  chordDictionary.set('Dmaj7', {
    root_position: ['D3', 'F#3', 'A3', 'C#4'],
    first_inversion: ['F#3', 'A3', 'C#4', 'D4'],
    second_inversion: ['A3', 'C#4', 'D4', 'F#4'],
    third_inversion: ['C#4', 'D4', 'F#4', 'A4']
  });
  chordDictionary.set('D7', {
    root_position: ['D3', 'F#3', 'A3', 'C4'],
    first_inversion: ['F#3', 'A3', 'C4', 'D4'],
    second_inversion: ['A3', 'C4', 'D4', 'F#4'],
    third_inversion: ['C4', 'D4', 'F#4', 'A4']
  });
  chordDictionary.set('Dm', {
    root_position: ['D3', 'F3', 'A3'],
    first_inversion: ['F3', 'A3', 'D4'],
    second_inversion: ['A3', 'D4', 'F4']
  });
  chordDictionary.set('Dm7', {
    root_position: ['D3', 'F3', 'A3', 'C4'],
    first_inversion: ['F3', 'A3', 'C4', 'D4'],
    second_inversion: ['A3', 'C4', 'D4', 'F4'],
    third_inversion: ['C4', 'D4', 'F4', 'A4']
  });

  // D# chords
  chordDictionary.set('D#M', {
    root_position: ['D#3', 'G3', 'A#3'],
    first_inversion: ['G3', 'A#3', 'D#4'],
    second_inversion: ['A#3', 'D#4', 'G4']
  });
  chordDictionary.set('D#dim', {
    root_position: ['D#3', 'F#3', 'A3'],
    first_inversion: ['F#3', 'A3', 'D#4'],
    second_inversion: ['A3', 'D#4', 'F#4']
  });
  chordDictionary.set('D#9', { root_position: ['D#3', 'G3', 'A#3', 'C#4', 'F4'] });
  chordDictionary.set('D#11', { root_position: ['D#3', 'G3', 'A#3', 'C#4', 'F4', 'G#4'] });
  chordDictionary.set('D#sus4', {
    root_position: ['D#3', 'G#3', 'A#3'],
    first_inversion: ['G#3', 'A#3', 'D#4'],
    second_inversion: ['A#3', 'D#4', 'G#4']
  });
  chordDictionary.set('D#maj7', {
    root_position: ['D#3', 'G3', 'A#3', 'D4'],
    first_inversion: ['G3', 'A#3', 'D4', 'D#4'],
    second_inversion: ['A#3', 'D4', 'D#4', 'G4'],
    third_inversion: ['D4', 'D#4', 'G4', 'A#4']
  });
  chordDictionary.set('D#7', {
    root_position: ['D#3', 'G3', 'A#3', 'C#4'],
    first_inversion: ['G3', 'A#3', 'C#4', 'D#4'],
    second_inversion: ['A#3', 'C#4', 'D#4', 'G4'],
    third_inversion: ['C#4', 'D#4', 'G4', 'A#4']
  });
  chordDictionary.set('D#m', {
    root_position: ['D#3', 'F#3', 'A#3'],
    first_inversion: ['F#3', 'A#3', 'D#4'],
    second_inversion: ['A#3', 'D#4', 'F#4']
  });
  chordDictionary.set('D#m7', {
    root_position: ['D#3', 'F#3', 'A#3', 'C#4'],
    first_inversion: ['F#3', 'A#3', 'C#4', 'D#4'],
    second_inversion: ['A#3', 'C#4', 'D#4', 'F#4'],
    third_inversion: ['C#4', 'D#4', 'F#4', 'A#4']
  });

  // Eb chords (same as D#)
  chordDictionary.set('EbM', {
    root_position: ['Eb3', 'G3', 'Bb3'],
    first_inversion: ['G3', 'Bb3', 'Eb4'],
    second_inversion: ['Bb3', 'Eb4', 'G4']
  });
  chordDictionary.set('Ebdim', {
    root_position: ['Eb3', 'Gb3', 'A3'],
    first_inversion: ['Gb3', 'A3', 'Eb4'],
    second_inversion: ['A3', 'Eb4', 'Gb4']
  });
  chordDictionary.set('Eb9', { root_position: ['Eb3', 'G3', 'Bb3', 'Db4', 'F4'] });
  chordDictionary.set('Eb11', { root_position: ['Eb3', 'G3', 'Bb3', 'Db4', 'F4', 'Ab4'] });
  chordDictionary.set('Ebsus4', {
    root_position: ['Eb3', 'Ab3', 'Bb3'],
    first_inversion: ['Ab3', 'Bb3', 'Eb4'],
    second_inversion: ['Bb3', 'Eb4', 'Ab4']
  });
  chordDictionary.set('Ebmaj7', {
    root_position: ['Eb3', 'G3', 'Bb3', 'D4'],
    first_inversion: ['G3', 'Bb3', 'D4', 'Eb4'],
    second_inversion: ['Bb3', 'D4', 'Eb4', 'G4'],
    third_inversion: ['D4', 'Eb4', 'G4', 'Bb4']
  });
  chordDictionary.set('Eb7', {
    root_position: ['Eb3', 'G3', 'Bb3', 'Db4'],
    first_inversion: ['G3', 'Bb3', 'Db4', 'Eb4'],
    second_inversion: ['Bb3', 'Db4', 'Eb4', 'G4'],
    third_inversion: ['Db4', 'Eb4', 'G4', 'Bb4']
  });
  chordDictionary.set('Ebm', {
    root_position: ['Eb3', 'Gb3', 'Bb3'],
    first_inversion: ['Gb3', 'Bb3', 'Eb4'],
    second_inversion: ['Bb3', 'Eb4', 'Gb4']
  });
  chordDictionary.set('Ebm7', {
    root_position: ['Eb3', 'Gb3', 'Bb3', 'Db4'],
    first_inversion: ['Gb3', 'Bb3', 'Db4', 'Eb4'],
    second_inversion: ['Bb3', 'Db4', 'Eb4', 'Gb4'],
    third_inversion: ['Db4', 'Eb4', 'Gb4', 'Bb4']
  });

  // E chords
  chordDictionary.set('EM', {
    root_position: ['E3', 'G#3', 'B3'],
    first_inversion: ['G#3', 'B3', 'E4'],
    second_inversion: ['B3', 'E4', 'G#4']
  });
  chordDictionary.set('Edim', {
    root_position: ['E3', 'G3', 'Bb3'],
    first_inversion: ['G3', 'Bb3', 'E4'],
    second_inversion: ['Bb3', 'E4', 'G4']
  });
  chordDictionary.set('Em♭5', {
    root_position: ['E3', 'G3', 'Bb3'],
    first_inversion: ['G3', 'Bb3', 'E4'],
    second_inversion: ['Bb3', 'E4', 'G4']
  });
  chordDictionary.set('E9', { root_position: ['E3', 'G#3', 'B3', 'D4', 'F#4'] });
  chordDictionary.set('E11', { root_position: ['E3', 'G#3', 'B3', 'D4', 'F#4', 'A4'] });
  chordDictionary.set('Esus4', {
    root_position: ['E3', 'A3', 'B3'],
    first_inversion: ['A3', 'B3', 'E4'],
    second_inversion: ['B3', 'E4', 'A4']
  });
  chordDictionary.set('Emaj7', {
    root_position: ['E3', 'G#3', 'B3', 'D#4'],
    first_inversion: ['G#3', 'B3', 'D#4', 'E4'],
    second_inversion: ['B3', 'D#4', 'E4', 'G#4'],
    third_inversion: ['D#4', 'E4', 'G#4', 'B4']
  });
  chordDictionary.set('E7', {
    root_position: ['E3', 'G#3', 'B3', 'D4'],
    first_inversion: ['G#3', 'B3', 'D4', 'E4'],
    second_inversion: ['B3', 'D4', 'E4', 'G#4'],
    third_inversion: ['D4', 'E4', 'G#4', 'B4']
  });
  chordDictionary.set('Em', {
    root_position: ['E3', 'G3', 'B3'],
    first_inversion: ['G3', 'B3', 'E4'],
    second_inversion: ['B3', 'E4', 'G4']
  });
  chordDictionary.set('Em7', {
    root_position: ['E3', 'G3', 'B3', 'D4'],
    first_inversion: ['G3', 'B3', 'D4', 'E4'],
    second_inversion: ['B3', 'D4', 'E4', 'G4'],
    third_inversion: ['D4', 'E4', 'G4', 'B4']
  });

  // F chords
  chordDictionary.set('FM', {
    root_position: ['F3', 'A3', 'C4'],
    first_inversion: ['A3', 'C4', 'F4'],
    second_inversion: ['C4', 'F4', 'A4']
  });
  chordDictionary.set('Fdim', {
    root_position: ['F3', 'Ab3', 'B3'],
    first_inversion: ['Ab3', 'B3', 'F4'],
    second_inversion: ['B3', 'F4', 'Ab4']
  });
  chordDictionary.set('Fm♭5', {
    root_position: ['F3', 'Ab3', 'B3'],
    first_inversion: ['Ab3', 'B3', 'F4'],
    second_inversion: ['B3', 'F4', 'Ab4']
  });
  chordDictionary.set('F9', { root_position: ['F3', 'A3', 'C4', 'Eb4', 'G4'] });
  chordDictionary.set('F11', { root_position: ['F3', 'A3', 'C4', 'Eb4', 'G4', 'Bb4'] });
  chordDictionary.set('Fsus4', {
    root_position: ['F3', 'Bb3', 'C4'],
    first_inversion: ['Bb3', 'C4', 'F4'],
    second_inversion: ['C4', 'F4', 'Bb4']
  });
  chordDictionary.set('Fmaj7', {
    root_position: ['F3', 'A3', 'C4', 'E4'],
    first_inversion: ['A3', 'C4', 'E4', 'F4'],
    second_inversion: ['C4', 'E4', 'F4', 'A4'],
    third_inversion: ['E4', 'F4', 'A4', 'C5']
  });
  chordDictionary.set('F7', {
    root_position: ['F3', 'A3', 'C4', 'Eb4'],
    first_inversion: ['A3', 'C4', 'Eb4', 'F4'],
    second_inversion: ['C4', 'Eb4', 'F4', 'A4'],
    third_inversion: ['Eb4', 'F4', 'A4', 'C5']
  });
  chordDictionary.set('Fm', {
    root_position: ['F3', 'Ab3', 'C4'],
    first_inversion: ['Ab3', 'C4', 'F4'],
    second_inversion: ['C4', 'F4', 'Ab4']
  });
  chordDictionary.set('Fm7', {
    root_position: ['F3', 'Ab3', 'C4', 'Eb4'],
    first_inversion: ['Ab3', 'C4', 'Eb4', 'F4'],
    second_inversion: ['C4', 'Eb4', 'F4', 'Ab4'],
    third_inversion: ['Eb4', 'F4', 'Ab4', 'C5']
  });

  // F# chords
  chordDictionary.set('F#M', {
    root_position: ['F#3', 'A#3', 'C#4'],
    first_inversion: ['A#3', 'C#4', 'F#4'],
    second_inversion: ['C#4', 'F#4', 'A#4']
  });
  chordDictionary.set('F#dim', {
    root_position: ['F#3', 'A3', 'C4'],
    first_inversion: ['A3', 'C4', 'F#4'],
    second_inversion: ['C4', 'F#4', 'A4']
  });
  chordDictionary.set('F#9', { root_position: ['F#3', 'A#3', 'C#4', 'E4', 'G#4'] });
  chordDictionary.set('F#11', { root_position: ['F#3', 'A#3', 'C#4', 'E4', 'G#4', 'B4'] });
  chordDictionary.set('F#sus4', {
    root_position: ['F#3', 'B3', 'C#4'],
    first_inversion: ['B3', 'C#4', 'F#4'],
    second_inversion: ['C#4', 'F#4', 'B4']
  });
  chordDictionary.set('F#maj7', {
    root_position: ['F#3', 'A#3', 'C#4', 'F4'],
    first_inversion: ['A#3', 'C#4', 'F4', 'F#4'],
    second_inversion: ['C#4', 'F4', 'F#4', 'A#4'],
    third_inversion: ['F4', 'F#4', 'A#4', 'C#5']
  });
  chordDictionary.set('F#7', {
    root_position: ['F#3', 'A#3', 'C#4', 'E4'],
    first_inversion: ['A#3', 'C#4', 'E4', 'F#4'],
    second_inversion: ['C#4', 'E4', 'F#4', 'A#4'],
    third_inversion: ['E4', 'F#4', 'A#4', 'C#5']
  });
  chordDictionary.set('F#m', {
    root_position: ['F#3', 'A3', 'C#4'],
    first_inversion: ['A3', 'C#4', 'F#4'],
    second_inversion: ['C#4', 'F#4', 'A4']
  });
  chordDictionary.set('F#m7', {
    root_position: ['F#3', 'A3', 'C#4', 'E4'],
    first_inversion: ['A3', 'C#4', 'E4', 'F#4'],
    second_inversion: ['C#4', 'E4', 'F#4', 'A4'],
    third_inversion: ['E4', 'F#4', 'A4', 'C#5']
  });

  // Gb chords (same as F#)
  chordDictionary.set('GbM', {
    root_position: ['Gb3', 'Bb3', 'Db4'],
    first_inversion: ['Bb3', 'Db4', 'Gb4'],
    second_inversion: ['Db4', 'Gb4', 'Bb4']
  });
  chordDictionary.set('Gbdim', {
    root_position: ['Gb3', 'A3', 'C4'],
    first_inversion: ['A3', 'C4', 'Gb4'],
    second_inversion: ['C4', 'Gb4', 'A4']
  });
  chordDictionary.set('Gb9', { root_position: ['Gb3', 'Bb3', 'Db4', 'E4', 'Ab4'] });
  chordDictionary.set('Gb11', { root_position: ['Gb3', 'Bb3', 'Db4', 'E4', 'Ab4', 'B4'] });
  chordDictionary.set('Gbsus4', {
    root_position: ['Gb3', 'B3', 'Db4'],
    first_inversion: ['B3', 'Db4', 'Gb4'],
    second_inversion: ['Db4', 'Gb4', 'B4']
  });
  chordDictionary.set('Gbmaj7', {
    root_position: ['Gb3', 'Bb3', 'Db4', 'F4'],
    first_inversion: ['Bb3', 'Db4', 'F4', 'Gb4'],
    second_inversion: ['Db4', 'F4', 'Gb4', 'Bb4'],
    third_inversion: ['F4', 'Gb4', 'Bb4', 'Db5']
  });
  chordDictionary.set('Gb7', {
    root_position: ['Gb3', 'Bb3', 'Db4', 'E4'],
    first_inversion: ['Bb3', 'Db4', 'E4', 'Gb4'],
    second_inversion: ['Db4', 'E4', 'Gb4', 'Bb4'],
    third_inversion: ['E4', 'Gb4', 'Bb4', 'Db5']
  });
  chordDictionary.set('Gbm', {
    root_position: ['Gb3', 'A3', 'Db4'],
    first_inversion: ['A3', 'Db4', 'Gb4'],
    second_inversion: ['Db4', 'Gb4', 'A4']
  });
  chordDictionary.set('Gbm7', {
    root_position: ['Gb3', 'A3', 'Db4', 'E4'],
    first_inversion: ['A3', 'Db4', 'E4', 'Gb4'],
    second_inversion: ['Db4', 'E4', 'Gb4', 'A4'],
    third_inversion: ['E4', 'Gb4', 'A4', 'Db5']
  });

  // G chords
  chordDictionary.set('GM', {
    root_position: ['G3', 'B3', 'D4'],
    first_inversion: ['B3', 'D4', 'G4'],
    second_inversion: ['D4', 'G4', 'B4']
  });
  chordDictionary.set('Gdim', {
    root_position: ['G3', 'Bb3', 'Db4'],
    first_inversion: ['Bb3', 'Db4', 'G4'],
    second_inversion: ['Db4', 'G4', 'Bb4']
  });
  chordDictionary.set('Gm♭5', {
    root_position: ['G3', 'Bb3', 'Db4'],
    first_inversion: ['Bb3', 'Db4', 'G4'],
    second_inversion: ['Db4', 'G4', 'Bb4']
  });
  chordDictionary.set('G9', { root_position: ['G3', 'B3', 'D4', 'F4', 'A4'] });
  chordDictionary.set('G11', { root_position: ['G3', 'B3', 'D4', 'F4', 'A4', 'C5'] });
  chordDictionary.set('Gsus4', {
    root_position: ['G3', 'C4', 'D4'],
    first_inversion: ['C4', 'D4', 'G4'],
    second_inversion: ['D4', 'G4', 'C5']
  });
  chordDictionary.set('Gmaj7', {
    root_position: ['G3', 'B3', 'D4', 'F#4'],
    first_inversion: ['B3', 'D4', 'F#4', 'G4'],
    second_inversion: ['D4', 'F#4', 'G4', 'B4'],
    third_inversion: ['F#4', 'G4', 'B4', 'D5']
  });
  chordDictionary.set('G7', {
    root_position: ['G3', 'B3', 'D4', 'F4'],
    first_inversion: ['B3', 'D4', 'F4', 'G4'],
    second_inversion: ['D4', 'F4', 'G4', 'B4'],
    third_inversion: ['F4', 'G4', 'B4', 'D5']
  });
  chordDictionary.set('Gm', {
    root_position: ['G3', 'Bb3', 'D4'],
    first_inversion: ['Bb3', 'D4', 'G4'],
    second_inversion: ['D4', 'G4', 'Bb4']
  });
  chordDictionary.set('Gm7', {
    root_position: ['G3', 'Bb3', 'D4', 'F4'],
    first_inversion: ['Bb3', 'D4', 'F4', 'G4'],
    second_inversion: ['D4', 'F4', 'G4', 'Bb4'],
    third_inversion: ['F4', 'G4', 'Bb4', 'D5']
  });

  // G# chords
  chordDictionary.set('G#M', {
    root_position: ['G#3', 'C4', 'D#4'],
    first_inversion: ['C4', 'D#4', 'G#4'],
    second_inversion: ['D#4', 'G#4', 'C5']
  });
  chordDictionary.set('G#dim', {
    root_position: ['G#3', 'B3', 'D4'],
    first_inversion: ['B3', 'D4', 'G#4'],
    second_inversion: ['D4', 'G#4', 'B4']
  });
  chordDictionary.set('G#9', { root_position: ['G#3', 'C4', 'D#4', 'F#4', 'A#4'] });
  chordDictionary.set('G#11', { root_position: ['G#3', 'C4', 'D#4', 'F#4', 'A#4', 'C#5'] });
  chordDictionary.set('G#sus4', {
    root_position: ['G#3', 'C#4', 'D#4'],
    first_inversion: ['C#4', 'D#4', 'G#4'],
    second_inversion: ['D#4', 'G#4', 'C#5']
  });
  chordDictionary.set('G#maj7', {
    root_position: ['G#3', 'C4', 'D#4', 'G4'],
    first_inversion: ['C4', 'D#4', 'G4', 'G#4'],
    second_inversion: ['D#4', 'G4', 'G#4', 'C5'],
    third_inversion: ['G4', 'G#4', 'C5', 'D#5']
  });
  chordDictionary.set('G#7', {
    root_position: ['G#3', 'C4', 'D#4', 'F#4'],
    first_inversion: ['C4', 'D#4', 'F#4', 'G#4'],
    second_inversion: ['D#4', 'F#4', 'G#4', 'C5'],
    third_inversion: ['F#4', 'G#4', 'C5', 'D#5']
  });
  chordDictionary.set('G#m', {
    root_position: ['G#3', 'B3', 'D#4'],
    first_inversion: ['B3', 'D#4', 'G#4'],
    second_inversion: ['D#4', 'G#4', 'B4']
  });
  chordDictionary.set('G#m7', {
    root_position: ['G#3', 'B3', 'D#4', 'F#4'],
    first_inversion: ['B3', 'D#4', 'F#4', 'G#4'],
    second_inversion: ['D#4', 'F#4', 'G#4', 'B4'],
    third_inversion: ['F#4', 'G#4', 'B4', 'D#5']
  });

  // Ab chords (same as G#)
  chordDictionary.set('AbM', {
    root_position: ['Ab3', 'C4', 'Eb4'],
    first_inversion: ['C4', 'Eb4', 'Ab4'],
    second_inversion: ['Eb4', 'Ab4', 'C5']
  });
  chordDictionary.set('Abdim', {
    root_position: ['Ab3', 'B3', 'D4'],
    first_inversion: ['B3', 'D4', 'Ab4'],
    second_inversion: ['D4', 'Ab4', 'B4']
  });
  chordDictionary.set('Ab9', { root_position: ['Ab3', 'C4', 'Eb4', 'Gb4', 'Bb4'] });
  chordDictionary.set('Ab11', { root_position: ['Ab3', 'C4', 'Eb4', 'Gb4', 'Bb4', 'Db5'] });
  chordDictionary.set('Absus4', {
    root_position: ['Ab3', 'Db4', 'Eb4'],
    first_inversion: ['Db4', 'Eb4', 'Ab4'],
    second_inversion: ['Eb4', 'Ab4', 'Db5']
  });
  chordDictionary.set('Abmaj7', {
    root_position: ['Ab3', 'C4', 'Eb4', 'G4'],
    first_inversion: ['C4', 'Eb4', 'G4', 'Ab4'],
    second_inversion: ['Eb4', 'G4', 'Ab4', 'C5'],
    third_inversion: ['G4', 'Ab4', 'C5', 'Eb5']
  });
  chordDictionary.set('Ab7', {
    root_position: ['Ab3', 'C4', 'Eb4', 'Gb4'],
    first_inversion: ['C4', 'Eb4', 'Gb4', 'Ab4'],
    second_inversion: ['Eb4', 'Gb4', 'Ab4', 'C5'],
    third_inversion: ['Gb4', 'Ab4', 'C5', 'Eb5']
  });
  chordDictionary.set('Abm', {
    root_position: ['Ab3', 'B3', 'Eb4'],
    first_inversion: ['B3', 'Eb4', 'Ab4'],
    second_inversion: ['Eb4', 'Ab4', 'B4']
  });
  chordDictionary.set('Abm7', {
    root_position: ['Ab3', 'B3', 'Eb4', 'Gb4'],
    first_inversion: ['B3', 'Eb4', 'Gb4', 'Ab4'],
    second_inversion: ['Eb4', 'Gb4', 'Ab4', 'B4'],
    third_inversion: ['Gb4', 'Ab4', 'B4', 'Eb5']
  });

  // A chords
  chordDictionary.set('AM', {
    root_position: ['A3', 'C#4', 'E4'],
    first_inversion: ['C#4', 'E4', 'A4'],
    second_inversion: ['E4', 'A4', 'C#5']
  });
  chordDictionary.set('Adim', {
    root_position: ['A3', 'C4', 'Eb4'],
    first_inversion: ['C4', 'Eb4', 'A4'],
    second_inversion: ['Eb4', 'A4', 'C5']
  });
  chordDictionary.set('Am♭5', {
    root_position: ['A3', 'C4', 'Eb4'],
    first_inversion: ['C4', 'Eb4', 'A4'],
    second_inversion: ['Eb4', 'A4', 'C5']
  });
  chordDictionary.set('A9', { root_position: ['A3', 'C#4', 'E4', 'G4', 'B4'] });
  chordDictionary.set('A11', { root_position: ['A3', 'C#4', 'E4', 'G4', 'B4', 'D5'] });
  chordDictionary.set('Asus4', {
    root_position: ['A3', 'D4', 'E4'],
    first_inversion: ['D4', 'E4', 'A4'],
    second_inversion: ['E4', 'A4', 'D5']
  });
  chordDictionary.set('Amaj7', {
    root_position: ['A3', 'C#4', 'E4', 'G#4'],
    first_inversion: ['C#4', 'E4', 'G#4', 'A4'],
    second_inversion: ['E4', 'G#4', 'A4', 'C#5'],
    third_inversion: ['G#4', 'A4', 'C#5', 'E5']
  });
  chordDictionary.set('A7', {
    root_position: ['A3', 'C#4', 'E4', 'G4'],
    first_inversion: ['C#4', 'E4', 'G4', 'A4'],
    second_inversion: ['E4', 'G4', 'A4', 'C#5'],
    third_inversion: ['G4', 'A4', 'C#5', 'E5']
  });
  chordDictionary.set('Am', {
    root_position: ['A3', 'C4', 'E4'],
    first_inversion: ['C4', 'E4', 'A4'],
    second_inversion: ['E4', 'A4', 'C5']
  });
  chordDictionary.set('Am7', {
    root_position: ['A3', 'C4', 'E4', 'G4'],
    first_inversion: ['C4', 'E4', 'G4', 'A4'],
    second_inversion: ['E4', 'G4', 'A4', 'C5'],
    third_inversion: ['G4', 'A4', 'C5', 'E5']
  });

  // A# chords
  chordDictionary.set('A#M', {
    root_position: ['A#3', 'D4', 'F4'],
    first_inversion: ['D4', 'F4', 'A#4'],
    second_inversion: ['F4', 'A#4', 'D5']
  });
  chordDictionary.set('A#dim', {
    root_position: ['A#3', 'C#4', 'E4'],
    first_inversion: ['C#4', 'E4', 'A#4'],
    second_inversion: ['E4', 'A#4', 'C#5']
  });
  chordDictionary.set('A#9', { root_position: ['A#3', 'D4', 'F4', 'G#4', 'C5'] });
  chordDictionary.set('A#11', { root_position: ['A#3', 'D4', 'F4', 'G#4', 'C5', 'D#5'] });
  chordDictionary.set('A#sus4', {
    root_position: ['A#3', 'D#4', 'F4'],
    first_inversion: ['D#4', 'F4', 'A#4'],
    second_inversion: ['F4', 'A#4', 'D#5']
  });
  chordDictionary.set('A#maj7', {
    root_position: ['A#3', 'D4', 'F4', 'A4'],
    first_inversion: ['D4', 'F4', 'A4', 'A#4'],
    second_inversion: ['F4', 'A4', 'A#4', 'D5'],
    third_inversion: ['A4', 'A#4', 'D5', 'F5']
  });
  chordDictionary.set('A#7', {
    root_position: ['A#3', 'D4', 'F4', 'G#4'],
    first_inversion: ['D4', 'F4', 'G#4', 'A#4'],
    second_inversion: ['F4', 'G#4', 'A#4', 'D5'],
    third_inversion: ['G#4', 'A#4', 'D5', 'F5']
  });
  chordDictionary.set('A#m', {
    root_position: ['A#3', 'C#4', 'F4'],
    first_inversion: ['C#4', 'F4', 'A#4'],
    second_inversion: ['F4', 'A#4', 'C#5']
  });
  chordDictionary.set('A#m7', {
    root_position: ['A#3', 'C#4', 'F4', 'G#4'],
    first_inversion: ['C#4', 'F4', 'G#4', 'A#4'],
    second_inversion: ['F4', 'G#4', 'A#4', 'C#5'],
    third_inversion: ['G#4', 'A#4', 'C#5', 'F5']
  });

  // Bb chords (same as A#)
  chordDictionary.set('BbM', {
    root_position: ['Bb3', 'D4', 'F4'],
    first_inversion: ['D4', 'F4', 'Bb4'],
    second_inversion: ['F4', 'Bb4', 'D5']
  });
  chordDictionary.set('Bbdim', {
    root_position: ['Bb3', 'Db4', 'E4'],
    first_inversion: ['Db4', 'E4', 'Bb4'],
    second_inversion: ['E4', 'Bb4', 'Db5']
  });
  chordDictionary.set('Bb9', { root_position: ['Bb3', 'D4', 'F4', 'Ab4', 'C5'] });
  chordDictionary.set('Bb11', { root_position: ['Bb3', 'D4', 'F4', 'Ab4', 'C5', 'Eb5'] });
  chordDictionary.set('Bbsus4', {
    root_position: ['Bb3', 'Eb4', 'F4'],
    first_inversion: ['Eb4', 'F4', 'Bb4'],
    second_inversion: ['F4', 'Bb4', 'Eb5']
  });
  chordDictionary.set('Bbmaj7', {
    root_position: ['Bb3', 'D4', 'F4', 'A4'],
    first_inversion: ['D4', 'F4', 'A4', 'Bb4'],
    second_inversion: ['F4', 'A4', 'Bb4', 'D5'],
    third_inversion: ['A4', 'Bb4', 'D5', 'F5']
  });
  chordDictionary.set('Bb7', {
    root_position: ['Bb3', 'D4', 'F4', 'Ab4'],
    first_inversion: ['D4', 'F4', 'Ab4', 'Bb4'],
    second_inversion: ['F4', 'Ab4', 'Bb4', 'D5'],
    third_inversion: ['Ab4', 'Bb4', 'D5', 'F5']
  });
  chordDictionary.set('Bbm', {
    root_position: ['Bb3', 'Db4', 'F4'],
    first_inversion: ['Db4', 'F4', 'Bb4'],
    second_inversion: ['F4', 'Bb4', 'Db5']
  });
  chordDictionary.set('Bbm7', {
    root_position: ['Bb3', 'Db4', 'F4', 'Ab4'],
    first_inversion: ['Db4', 'F4', 'Ab4', 'Bb4'],
    second_inversion: ['F4', 'Ab4', 'Bb4', 'Db5'],
    third_inversion: ['Ab4', 'Bb4', 'Db5', 'F5']
  });

  // B chords
  chordDictionary.set('BM', {
    root_position: ['B3', 'D#4', 'F#4'],
    first_inversion: ['D#4', 'F#4', 'B4'],
    second_inversion: ['F#4', 'B4', 'D#5']
  });
  chordDictionary.set('Bdim', {
    root_position: ['B3', 'D4', 'F4'],
    first_inversion: ['D4', 'F4', 'B4'],
    second_inversion: ['F4', 'B4', 'D5']
  });
  chordDictionary.set('Bm♭5', {
    root_position: ['B3', 'D4', 'F4'],
    first_inversion: ['D4', 'F4', 'B4'],
    second_inversion: ['F4', 'B4', 'D5']
  });
  chordDictionary.set('B9', { root_position: ['B3', 'D#4', 'F#4', 'A4', 'C#5'] });
  chordDictionary.set('B11', { root_position: ['B3', 'D#4', 'F#4', 'A4', 'C#5', 'E5'] });
  chordDictionary.set('Bsus4', {
    root_position: ['B3', 'E4', 'F#4'],
    first_inversion: ['E4', 'F#4', 'B4'],
    second_inversion: ['F#4', 'B4', 'E5']
  });
  chordDictionary.set('Bmaj7', {
    root_position: ['B3', 'D#4', 'F#4', 'A#4'],
    first_inversion: ['D#4', 'F#4', 'A#4', 'B4'],
    second_inversion: ['F#4', 'A#4', 'B4', 'D#5'],
    third_inversion: ['A#4', 'B4', 'D#5', 'F#5']
  });
  chordDictionary.set('B7', {
    root_position: ['B3', 'D#4', 'F#4', 'A4'],
    first_inversion: ['D#4', 'F#4', 'A4', 'B4'],
    second_inversion: ['F#4', 'A4', 'B4', 'D#5'],
    third_inversion: ['A4', 'B4', 'D#5', 'F#5']
  });
  chordDictionary.set('Bm', {
    root_position: ['B3', 'D4', 'F#4'],
    first_inversion: ['D4', 'F#4', 'B4'],
    second_inversion: ['F#4', 'B4', 'D5']
  });
  chordDictionary.set('Bm7', {
    root_position: ['B3', 'D4', 'F#4', 'A4'],
    first_inversion: ['D4', 'F#4', 'A4', 'B4'],
    second_inversion: ['F#4', 'A4', 'B4', 'D5'],
    third_inversion: ['A4', 'B4', 'D5', 'F#5']
  });
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
  return allChords.filter(
    (chord) =>
      chord.endsWith('M') ||
      chord.endsWith('m') ||
      chord.endsWith('7') ||
      chord.endsWith('maj7') ||
      chord.endsWith('m7') //||
    // chord.endsWith('dim') ||
    // chord.endsWith('sus4') ||
    // chord.endsWith('9') ||
    // chord.endsWith('11')
  );
}

// Enharmonic equivalents mapping
const enharmonicMap: { [key: string]: string } = {
  'C#': 'Db',
  Db: 'C#',
  'D#': 'Eb',
  Eb: 'D#',
  'F#': 'Gb',
  Gb: 'F#',
  'G#': 'Ab',
  Ab: 'G#',
  'A#': 'Bb',
  Bb: 'A#'
};

// Utility functions for note manipulation
export function getNoteNameOnly(noteWithOctave: string): string {
  return noteWithOctave.slice(0, -1); // Remove the last character (octave number)
}

export function areNotesEquivalent(note1: string, note2: string): boolean {
  const note1Name = getNoteNameOnly(note1);
  const note2Name = getNoteNameOnly(note2);

  return (
    note1Name === note2Name ||
    note1Name === enharmonicMap[note2Name] ||
    note2Name === enharmonicMap[note1Name]
  );
}

export function normalizeNoteName(noteName: string): string {
  return enharmonicMap[noteName] || noteName;
}

// Check if all chord notes have been clicked by the user
export function areAllChordNotesClicked(clickedNotes: Set<string>, chordNotes: string[]): boolean {
  if (!chordNotes.length || !clickedNotes.size) return false;

  const clickedNoteNames = Array.from(clickedNotes).map((note) => getNoteNameOnly(note));
  const chordNoteNames = chordNotes.map((note) => getNoteNameOnly(note));

  return chordNoteNames.every((chordNoteName) => {
    return clickedNoteNames.some((clickedNoteName) =>
      areNotesEquivalent(clickedNoteName + '3', chordNoteName + '3')
    );
  });
}

// Chord tone rules mapping for music theory display
const chordToneRules: { [key: string]: string } = {
  M: '1, 3, 5',
  m: '1, b3, 5',
  dim: '1, b3, b5',
  sus4: '1, 4, 5',
  '7': '1, 3, 5, b7',
  maj7: '1, 3, 5, 7',
  '9': '1, 3, 5, b7, 9',
  m7: '1, b3, 5, b7',
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

// Scale definitions and utilities
export interface ScaleDefinition {
  name: string;
  intervals: number[]; // Semitone intervals from root
  description: string;
}

// Scale dictionary with various scale types
const scaleDefinitions: { [key: string]: ScaleDefinition } = {
  major: {
    name: 'Major Scale',
    intervals: [0, 2, 4, 5, 7, 9, 11, 12],
    description: 'The foundation of Western music - bright and happy'
  },
  natural_minor: {
    name: 'Natural Minor Scale',
    intervals: [0, 2, 3, 5, 7, 8, 10, 12],
    description: 'The natural minor scale - melancholic and emotional'
  },
  harmonic_minor: {
    name: 'Harmonic Minor Scale',
    intervals: [0, 2, 3, 5, 7, 8, 11, 12],
    description: 'Minor scale with raised 7th - exotic and dramatic'
  },
  melodic_minor: {
    name: 'Melodic Minor Scale',
    intervals: [0, 2, 3, 5, 7, 9, 11, 12],
    description: 'Minor scale with raised 6th and 7th - smooth and flowing'
  },
  // Modal Scales (Modes of the Major Scale)
  ionian: {
    name: 'Ionian Mode',
    intervals: [0, 2, 4, 5, 7, 9, 11, 12],
    description: 'The major scale - bright and stable (1st mode)'
  },
  dorian: {
    name: 'Dorian Mode',
    intervals: [0, 2, 3, 5, 7, 9, 10, 12],
    description: 'Minor mode with raised 6th - jazzy and sophisticated (2nd mode)'
  },
  phrygian: {
    name: 'Phrygian Mode',
    intervals: [0, 1, 3, 5, 7, 8, 10, 12],
    description: 'Minor mode with lowered 2nd - dark and Spanish-influenced (3rd mode)'
  },
  lydian: {
    name: 'Lydian Mode',
    intervals: [0, 2, 4, 6, 7, 9, 11, 12],
    description: 'Major mode with raised 4th - dreamy and ethereal (4th mode)'
  },
  mixolydian: {
    name: 'Mixolydian Mode',
    intervals: [0, 2, 4, 5, 7, 9, 10, 12],
    description: 'Major mode with lowered 7th - bluesy and rock-oriented (5th mode)'
  },
  aeolian: {
    name: 'Aeolian Mode',
    intervals: [0, 2, 3, 5, 7, 8, 10, 12],
    description: 'The natural minor scale - melancholic and emotional (6th mode)'
  },
  locrian: {
    name: 'Locrian Mode',
    intervals: [0, 1, 3, 5, 6, 8, 10, 12],
    description: 'Diminished mode with lowered 2nd and 5th - unstable and tense (7th mode)'
  },
  pentatonic_major: {
    name: 'Major Pentatonic Scale',
    intervals: [0, 2, 4, 7, 9, 12],
    description: 'Five-note scale with octave - simple and universally pleasing'
  },
  pentatonic_minor: {
    name: 'Minor Pentatonic Scale',
    intervals: [0, 3, 5, 7, 10, 12],
    description: 'Five-note minor scale with octave - perfect for blues and rock'
  },
  blues: {
    name: 'Blues Scale',
    intervals: [0, 3, 5, 6, 7, 10, 12],
    description: 'Minor pentatonic with added blue note and octave - soulful and expressive'
  },
  whole_tone: {
    name: 'Whole Tone Scale',
    intervals: [0, 2, 4, 6, 8, 10, 12],
    description: 'All whole steps with octave - dreamy and impressionistic'
  },
  chromatic: {
    name: 'Chromatic Scale',
    intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    description: 'All twelve notes with octave - complete tonal palette'
  }
};

// Note names in chromatic order
const chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const chromaticNotesFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

/**
 * Get the scale definition for a given scale type
 */
export function getScaleDefinition(scaleType: string): ScaleDefinition | undefined {
  return scaleDefinitions[scaleType];
}

/**
 * Get all available scale types
 */
export function getAllScaleTypes(): string[] {
  return Object.keys(scaleDefinitions);
}

/**
 * Generate scale notes for a given root note and scale type
 */
export function generateScale(rootNote: string, scaleType: string, octave: number = 4): string[] {
  const scaleDefinition = scaleDefinitions[scaleType];
  if (!scaleDefinition) return [];

  // Determine if we should use sharps or flats based on the root note
  const useFlats = rootNote.includes('b') || ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(rootNote);
  const noteArray = useFlats ? chromaticNotesFlat : chromaticNotes;

  // Find the root note index
  const rootIndex = noteArray.findIndex((note) => note === rootNote);
  if (rootIndex === -1) return [];

  // Generate scale notes
  const scaleNotes: string[] = [];

  scaleDefinition.intervals.forEach((interval) => {
    const noteIndex = (rootIndex + interval) % 12;
    const noteName = noteArray[noteIndex];

    // Calculate octave (handle octave changes when going past B)
    let noteOctave = octave;
    if (rootIndex + interval >= 12) {
      noteOctave = octave + Math.floor((rootIndex + interval) / 12);
    }

    // Ensure we don't go beyond octave 4 (since audio files only go up to octave 4)
    // If we would go to octave 5, use octave 4 instead
    if (noteOctave > 4) {
      noteOctave = 4;
    }

    scaleNotes.push(`${noteName}${noteOctave}`);
  });

  return scaleNotes;
}

/**
 * Get scale degree names for display
 */
export function getScaleDegreeNames(scaleType: string): string[] {
  const scaleDefinition = scaleDefinitions[scaleType];
  if (!scaleDefinition) return [];

  const degreeNames = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];
  return scaleDefinition.intervals.map((_, index) => degreeNames[index]);
}

/**
 * Get a formatted scale pattern description
 */
export function getScalePattern(scaleType: string): string {
  const scaleDefinition = scaleDefinitions[scaleType];
  if (!scaleDefinition) return '';

  // Convert intervals to steps (W = whole step, H = half step)
  const steps: string[] = [];
  for (let i = 1; i < scaleDefinition.intervals.length; i++) {
    const interval = scaleDefinition.intervals[i] - scaleDefinition.intervals[i - 1];
    steps.push(interval === 2 ? 'W' : 'H');
  }

  return steps.join(' - ');
}

/**
 * Get practice scales for the learn scales page
 */
export function getPracticeScales(): string[] {
  return [
    'major',
    'natural_minor',
    'harmonic_minor',
    'melodic_minor',
    'ionian',
    'dorian',
    'phrygian',
    'lydian',
    'mixolydian',
    'aeolian',
    'locrian',
    'pentatonic_major',
    'pentatonic_minor',
    'blues',
    'whole_tone',
    'chromatic'
  ];
}
