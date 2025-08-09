<script lang="ts">
  import Piano from '$lib/components/Piano.svelte';
  import MusicScore from '$lib/components/MusicScore.svelte';
  import { playChord } from '$lib/utils/audioUtils';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  // Chord dictionary data structure
  const chordDictionary = new Map();
  
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

    // Eb chords
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
    chordDictionary.set('Fmaj7', {root_position: ["F3", "A3", "C4", "E4"], first_inversion: ["A3", "C4", "E4", "F4"], second_inversion: ["C4", "E4", "F4", "A4"], third_inversion: ["E3", "F3", "A3", "C4"]});
    chordDictionary.set('F7', {root_position: ["F3", "A3", "C4", "Eb4"], first_inversion: ["A3", "C4", "Eb4", "F4"], second_inversion: ["C4", "Eb4", "F4", "A4"], third_inversion: ["Eb3", "F3", "A3", "C4"]});
    chordDictionary.set('Fm', {root_position: ["F3", "Ab3", "C4"], first_inversion: ["Ab3", "C4", "F4"], second_inversion: ["C4", "F4", "Ab4"]});
    chordDictionary.set('Fm7', {root_position: ["F3", "Ab3", "C4", "Eb4"], first_inversion: ["Ab3", "C4", "Eb4", "F4"], second_inversion: ["C4", "Eb4", "F4", "Ab4"], third_inversion: ["Eb3", "F3", "Ab3", "C4"]});

    // F# chords
    chordDictionary.set('F#M', {root_position: ["F#3", "A#3", "C#4"], first_inversion: ["A#3", "C#4", "F#4"], second_inversion: ["C#4", "F#4", "A#4"]});
    chordDictionary.set('F#dim', {root_position: ["F#3", "A3", "C4"], first_inversion: ["A3", "C4", "F#4"], second_inversion: ["C4", "F#4", "A4"]});
    chordDictionary.set('F#9', {root_position: ["F#3", "A#3", "C#4", "E4", "G#4"]});
    chordDictionary.set('F#11', {root_position: ["F#3", "A#3", "C#4", "E4", "G#4", "B4"]});
    chordDictionary.set('F#sus4', {root_position: ["F#3", "B3", "C#4"], first_inversion: ["B3", "C#4", "F#4"], second_inversion: ["C#4", "F#4", "B4"]});
    chordDictionary.set('F#maj7', {root_position: ["F#3", "A#3", "C#4", "F4"], first_inversion: ["A#3", "C#4", "F4", "F#4"], second_inversion: ["C#4", "F4", "F#4", "A#4"], third_inversion: ["F3", "F#3", "A#3", "C#4"]});
    chordDictionary.set('F#7', {root_position: ["F#3", "A#3", "C#4", "E4"], first_inversion: ["A#3", "C#4", "E4", "F#4"], second_inversion: ["C#4", "E4", "F#4", "A#4"], third_inversion: ["E3", "F#3", "A#3", "C#4"]});
    chordDictionary.set('F#m', {root_position: ["F#3", "A3", "C#4"], first_inversion: ["A3", "C#4", "F#4"], second_inversion: ["C#4", "F#4", "A4"]});
    chordDictionary.set('F#m7', {root_position: ["F#3", "A3", "C#4", "E4"], first_inversion: ["A3", "C#4", "E4", "F#4"], second_inversion: ["C#4", "E4", "F#4", "A4"], third_inversion: ["E3", "F#3", "A3", "C#4"]});

    // Gb chords
    chordDictionary.set('GbM', {root_position: ["Gb3", "Bb3", "Db4"], first_inversion: ["Bb3", "Db4", "Gb4"], second_inversion: ["Db4", "Gb4", "Bb4"]});
    chordDictionary.set('Gbdim', {root_position: ["Gb3", "A3", "C4"], first_inversion: ["A3", "C4", "Gb4"], second_inversion: ["C4", "Gb4", "A4"]});
    chordDictionary.set('Gb9', {root_position: ["Gb3", "Bb3", "Db4", "E4", "Ab4"]});
    chordDictionary.set('Gb11', {root_position: ["Gb3", "Bb3", "Db4", "E4", "Ab4", "B4"]});
    chordDictionary.set('Gbsus4', {root_position: ["Gb3", "B3", "Db4"], first_inversion: ["B3", "Db4", "Gb4"], second_inversion: ["Db4", "Gb4", "B4"]});
    chordDictionary.set('Gbmaj7', {root_position: ["Gb3", "Bb3", "Db4", "F4"], first_inversion: ["Bb3", "Db4", "F4", "Gb4"], second_inversion: ["Db4", "F4", "Gb4", "Bb4"], third_inversion: ["F3", "Gb3", "Bb3", "Db4"]});
    chordDictionary.set('Gb7', {root_position: ["Gb3", "Bb3", "Db4", "E4"], first_inversion: ["Bb3", "Db4", "E4", "Gb4"], second_inversion: ["Db4", "E4", "Gb4", "Bb4"], third_inversion: ["E3", "Gb3", "Bb3", "Db4"]});
    chordDictionary.set('Gbm', {root_position: ["Gb3", "A3", "Db4"], first_inversion: ["A3", "Db4", "Gb4"], second_inversion: ["Db4", "Gb4", "A4"]});
    chordDictionary.set('Gbm7', {root_position: ["Gb3", "A3", "Db4", "E4"], first_inversion: ["A3", "Db4", "E4", "Gb4"], second_inversion: ["Db4", "E4", "Gb4", "A4"], third_inversion: ["E3", "Gb3", "A3", "Db4"]});

    // G chords
    chordDictionary.set('GM', {root_position: ["G3", "B3", "D4"], first_inversion: ["B3", "D4", "G4"], second_inversion: ["D4", "G4", "B4"]});
    chordDictionary.set('Gdim', {root_position: ["G3", "Bb3", "Db4"], first_inversion: ["Bb3", "Db4", "G4"], second_inversion: ["Db4", "G4", "Bb4"]});
    chordDictionary.set('G9', {root_position: ["G3", "B3", "D4", "F4", "A4"]});
    chordDictionary.set('G11', {root_position: ["G3", "B3", "D4", "F4", "A4", "C3"]});
    chordDictionary.set('Gsus4', {root_position: ["G3", "C4", "D4"], first_inversion: ["C4", "D4", "G4"], second_inversion: ["D3", "G3", "C4"]});
    chordDictionary.set('Gmaj7', {root_position: ["G3", "B3", "D4", "F#4"], first_inversion: ["B3", "D4", "F#4", "G4"], second_inversion: ["D4", "F#4", "G4", "B4"], third_inversion: ["F#3", "G3", "B3", "D4"]});
    chordDictionary.set('G7', {root_position: ["G3", "B3", "D4", "F4"], first_inversion: ["B3", "D4", "F4", "G4"], second_inversion: ["D4", "F4", "G4", "B4"], third_inversion: ["F3", "G3", "B3", "D4"]});
    chordDictionary.set('Gm', {root_position: ["G3", "Bb3", "D4"], first_inversion: ["Bb3", "D4", "G4"], second_inversion: ["D4", "G4", "Bb4"]});
    chordDictionary.set('Gm7', {root_position: ["G3", "Bb3", "D4", "F4"], first_inversion: ["Bb3", "D4", "F4", "G4"], second_inversion: ["D4", "F4", "G4", "Bb4"], third_inversion: ["F3", "G3", "Bb3", "D4"]});

    // G# chords
    chordDictionary.set('G#M', {root_position: ["G#3", "C4", "D#4"], first_inversion: ["C4", "D#4", "G#4"], second_inversion: ["D#3", "G#3", "C4"]});
    chordDictionary.set('G#dim', {root_position: ["G#3", "B3", "D4"], first_inversion: ["B3", "D4", "G#4"], second_inversion: ["D3", "G#3", "B3"]});
    chordDictionary.set('G#9', {root_position: ["G#3", "C4", "D#4", "F#4", "A#4"]});
    chordDictionary.set('G#11', {root_position: ["G#3", "C4", "D#4", "F#4", "A#4", "C#3"]});
    chordDictionary.set('G#sus4', {root_position: ["G#3", "C#4", "D#4"], first_inversion: ["C#4", "D#4", "G#4"], second_inversion: ["D#3", "G#3", "C#4"]});
    chordDictionary.set('G#maj7', {root_position: ["G#3", "C4", "D#4", "G4"], first_inversion: ["C4", "D#4", "G4", "G#4"], second_inversion: ["D#3", "G3", "G#3", "C4"], third_inversion: ["G3", "G#3", "C4", "D#4"]});
    chordDictionary.set('G#7', {root_position: ["G#3", "C4", "D#4", "F#4"], first_inversion: ["C4", "D#4", "F#4", "G#4"], second_inversion: ["D#3", "F#3", "G#3", "C4"], third_inversion: ["F#3", "G#3", "C4", "D#4"]});
    chordDictionary.set('G#m', {root_position: ["G#3", "B3", "D#4"], first_inversion: ["B3", "D#4", "G#4 "], second_inversion: ["D#3", "G#3", "B3"]});
    chordDictionary.set('G#m7', {root_position: ["G#3", "B3", "D#4", "F#4"], first_inversion: ["B3", "D#4", "F#4", "G#4"], second_inversion: ["D#3", "F#3", "G#3", "B3"], third_inversion: ["F#3", "G#3", "B3", "D#4"]});

    // Ab chords
    chordDictionary.set('AbM', {root_position: ["Ab3", "C4", "Eb4"], first_inversion: ["C4", "Eb4", "Ab4"], second_inversion: ["Eb3", "Ab3", "C4"]});
    chordDictionary.set('Abdim', {root_position: ["Ab3", "B3", "D4"], first_inversion: ["B3", "D4", "Ab4"], second_inversion: ["D3", "Ab3", "B3"]});
    chordDictionary.set('Ab9', {root_position: ["Ab3", "C4", "Eb4", "Gb4", "Bb4"]});
    chordDictionary.set('Ab11', {root_position: ["Ab3", "C4", "Eb4", "Gb4", "Bb4", "Db3"]});
    chordDictionary.set('Absus4', {root_position: ["Ab3", "Db4", "Eb4"], first_inversion: ["Db4", "Eb4", "Ab4"], second_inversion: ["Eb3", "Ab3", "Db4"]});
    chordDictionary.set('Abmaj7', {root_position: ["Ab3", "C4", "Eb4", "G4"], first_inversion: ["C4", "Eb4", "G4", "Ab4"], second_inversion: ["Eb3", "G3", "Ab3", "C4"], third_inversion: ["G3", "Ab3", "C4", "Eb4"]});
    chordDictionary.set('Ab7', {root_position: ["Ab3", "C4", "Eb4", "Gb4"], first_inversion: ["C4", "Eb4", "Gb4", "Ab4"], second_inversion: ["Eb3", "Gb3", "Ab3", "C4"], third_inversion: ["Gb3", "Ab3", "C4", "Eb4"]});
    chordDictionary.set('Abm', {root_position: ["Ab3", "B3", "Eb4"], first_inversion: ["B3", "Eb4", "Ab4 "], second_inversion: ["Eb3", "Ab3", "B3"]});
    chordDictionary.set('Abm7', {root_position: ["Ab3", "B3", "Eb4", "Gb4"], first_inversion: ["B3", "Eb4", "Gb4", "Ab4"], second_inversion: ["Eb3", "Gb3", "Ab3", "B3"], third_inversion: ["Gb3", "Ab3", "B3", "Eb4"]});

    // A chords
    chordDictionary.set('AM', {root_position: ["A3", "C#4", "E4"], first_inversion: ["C#4", "E4", "A4"], second_inversion: ["E3", "A3", "C#4"]});
    chordDictionary.set('Adim', {root_position: ["A3", "C4", "Eb4"], first_inversion: ["C4", "Eb4", "A4"], second_inversion: ["Eb3", "A3", "C4"]});
    chordDictionary.set('A9', {root_position: ["A3", "C#4", "E4", "G4", "B4"]});
    chordDictionary.set('A11', {root_position: ["A3", "C#4", "E4", "G4", "B4", "D3"]});
    chordDictionary.set('Asus4', {root_position: ["A3", "D4", "E4"], first_inversion: ["D4", "E4", "A4"], second_inversion: ["E3", "A3", "D4"]});
    chordDictionary.set('Amaj7', {root_position: ["A3", "C#4", "E4", "G#4"], first_inversion: ["C#4", "E4", "G#4", "A4"], second_inversion: ["E3", "G#3", "A3", "C#4"], third_inversion: ["G#3", "A3", "C#4", "E4"]});
    chordDictionary.set('A7', {root_position: ["A3", "C#4", "E4", "G4"], first_inversion: ["C#4", "E4", "G4", "A4"], second_inversion: ["E3", "G3", "A3", "C#4"], third_inversion: ["G3", "A3", "C#4", "E4"]});
    chordDictionary.set('Am', {root_position: ["A3", "C4", "E4"], first_inversion: ["C4", "E4", "A4"], second_inversion: ["E3", "A3", "C4"]});
    chordDictionary.set('Am7', {root_position: ["A3", "C4", "E4", "G4"], first_inversion: ["C4", "E4", "G4", "A4"], second_inversion: ["E3", "G3", "A3", "C4"], third_inversion: ["G3", "A3", "C4", "E4"]});

    // A# chords
    chordDictionary.set('A#M', {root_position: ["A#3", "D4", "F4"], first_inversion: ["D4", "F4", "A#4"], second_inversion: ["F3", "A#3", "D4"]});
    chordDictionary.set('A#dim', {root_position: ["A#3", "Db4", "E4"], first_inversion: ["Db4", "E4", "A#4"], second_inversion: ["E3", "A#3", "Db4"]});
    chordDictionary.set('A#9', {root_position: ["A#3", "D4", "F4", "G#4", "C3"]});
    chordDictionary.set('A#11', {root_position: ["A#3", "D4", "F4", "G#4", "C3", "D#3"]});
    chordDictionary.set('A#sus4', {root_position: ["A#3", "D#4", "F4"], first_inversion: ["D#4", "F4", "A#4"], second_inversion: ["F3", "A#3", "D#4"]});
    chordDictionary.set('A#maj7', {root_position: ["A#3", "D4", "F4", "A4"], first_inversion: ["D4", "F4", "A4", "A#4"], second_inversion: ["F3", "A3", "A#3", "D4"], third_inversion: ["A3", "A#3", "D4", "F4"]});
    chordDictionary.set('A#7', {root_position: ["A#3", "D4", "F4", "G#4"], first_inversion: ["D4", "F4", "G#4", "A#4"], second_inversion: ["F3", "G#3", "A#3", "D4"], third_inversion: ["G#3", "A#3", "D4", "F4"]});
    chordDictionary.set('A#m', {root_position: ["A#3", "C#4", "F4"], first_inversion: ["C#4", "F4", "A#4"], second_inversion: ["F3", "A#3", "C#4"]});
    chordDictionary.set('A#m7', {root_position: ["A#3", "C#4", "F4", "G#4"], first_inversion: ["C#4", "F4", "G#4", "A#4"], second_inversion: ["F3", "G#3", "A#3", "C#4"], third_inversion: ["G#3", "A#3", "C#4", "F4"]});

    // Bb chords
    chordDictionary.set('BbM', {root_position: ["Bb3", "D4", "F4"], first_inversion: ["D4", "F4", "Bb4"], second_inversion: ["F3", "Bb3", "D4"]});
    chordDictionary.set('Bbdim', {root_position: ["Bb3", "Db4", "E4"], first_inversion: ["Db4", "E4", "Bb4"], second_inversion: ["E3", "Bb3", "Db4"]});
    chordDictionary.set('Bb9', {root_position: ["Bb3", "D4", "F4", "Ab4", "C3"]});
    chordDictionary.set('Bb11', {root_position: ["Bb3", "D4", "F4", "Ab4", "C3", "Eb3"]});
    chordDictionary.set('Bbsus4', {root_position: ["Bb3", "Eb4", "F4"], first_inversion: ["Eb4", "F4", "Bb4"], second_inversion: ["F3", "Bb3", "Eb4"]});
    chordDictionary.set('Bbmaj7', {root_position: ["Bb3", "D4", "F4", "A4"], first_inversion: ["D4", "F4", "A4", "Bb4"], second_inversion: ["F3", "A3", "Bb3", "D4"], third_inversion: ["A3", "Bb3", "D4", "F4"]});
    chordDictionary.set('Bb7', {root_position: ["Bb3", "D4", "F4", "Ab4"], first_inversion: ["D4", "F4", "Ab4", "Bb4"], second_inversion: ["F3", "Ab3", "Bb3", "D4"], third_inversion: ["Ab3", "Bb3", "D4", "F4"]});
    chordDictionary.set('Bbm', {root_position: ["Bb3", "Db4", "F4"], first_inversion: ["Db4", "F4", "Bb4"], second_inversion: ["F3", "Bb3", "Db4"]});
    chordDictionary.set('Bbm7', {root_position: ["Bb3", "Db4", "F4", "Ab4"], first_inversion: ["Db4", "F4", "Ab4", "Bb4"], second_inversion: ["F3", "Ab3", "Bb3", "Db4"], third_inversion: ["Ab3", "Bb3", "Db4", "F4"]});

    // B chords
    chordDictionary.set('BM', {root_position: ["B3", "D#4", "F#4"], first_inversion: ["D#4", "F#4", "B4"], second_inversion: ["F#3", "B3", "D#4"]});
    chordDictionary.set('Bdim', {root_position: ["B3", "D4", "F4"], first_inversion: ["D4", "F4", "B4"], second_inversion: ["F3", "B3", "D4"]});
    chordDictionary.set('B9', {root_position: ["B3", "D#4", "F#4", "A4", "C#3"]});
    chordDictionary.set('B11', {root_position: ["B3", "D#4", "F#4", "A4", "C#3", "E3"]});
    chordDictionary.set('Bsus4', {root_position: ["B3", "E4", "F#4"], first_inversion: ["E4", "F#4", "B4"], second_inversion: ["F#3", "B3", "E4"]});
    chordDictionary.set('Bmaj7', {root_position: ["B3", "D#4", "F#4", "A#4"], first_inversion: ["D#4", "F#4", "A#4", "B4"], second_inversion: ["F#3", "A#3", "B3", "D#4"], third_inversion: ["A#3", "B3", "D#4", "F#4"]});
    chordDictionary.set('B7', {root_position: ["B3", "D#4", "F#4", "A4"], first_inversion: ["D#4", "F#4", "A4", "B4"], second_inversion: ["F#3", "A3", "B3", "D#4"], third_inversion: ["A3", "B3", "D#4", "F#4"]});
    chordDictionary.set('Bm', {root_position: ["B3", "D4", "F#4"], first_inversion: ["D4", "F#4", "B4"], second_inversion: ["F#3", "B3", "D4"]});
    chordDictionary.set('Bm7', {root_position: ["B3", "D4", "F#4", "A4"], first_inversion: ["D4", "F#4", "A4", "B4"], second_inversion: ["F#3", "A3", "B3", "D4"], third_inversion: ["A3", "B3", "D4", "F#4"]});
  }

  // Current chord state
  let currentNote = 'C';  // C
  let currentChordType = 'M';  // M
  let currentInversion = 'root_position';  // root_position
  let activeNotes: string[] = [];
  let isInitialLoad = true;

  // Reactive chord name that updates when any chord parameter changes
  $: fullChordName = (() => {
    const chordTypeNames: { [key: string]: string } = {
      'M': 'Major',
      'm': 'Minor',
      'dim': 'Diminished',
      'sus4': 'Suspended 4th',
      '7': 'Dominant 7th',
      'maj7': 'Major 7th',
      '9': '9th',
      'm7': 'Minor 7th',
      '11': '11th'
    };

    const chordTypeName = chordTypeNames[currentChordType] || currentChordType;

    return `${currentNote} ${chordTypeName}`;
  })();

  // Function to update URL based on current chord selection
  function updateURL() {
    if (isInitialLoad) return; // Don't update URL during initial load
    
    const chordPath = `${currentNote}${currentChordType}`;
    const searchParams = new URLSearchParams();
    searchParams.set('chord', chordPath);
    
    if (currentInversion !== 'root_position') {
      searchParams.set('inversion', currentInversion);
    }
    
    const newPath = `/chord-dictionary?${searchParams.toString()}`;
    goto(newPath, { replaceState: true });
  }

  // Function to parse URL and set initial chord state
  function parseURLAndSetChord() {
    // Parse chord from query parameters
    const chordParam = $page.url.searchParams.get('chord');
    if (chordParam) {
      const parsedChord = parseChordFromString(chordParam);
      if (parsedChord) {
        currentNote = parsedChord.note;
        currentChordType = parsedChord.type;
      }
    }
    
    // Parse inversion from query parameters
    const inversionParam = $page.url.searchParams.get('inversion');
    if (inversionParam) {
      currentInversion = inversionParam;
    }
  }

  // Helper function to parse chord string (e.g., "CM" -> {note: "C", type: "M"})
  function parseChordFromString(chordString: string): {note: string, type: string} | null {
    // Handle sharps and flats first
    const sharpFlatRegex = /^([A-G][#b]?)(.*)$/;
    const match = chordString.match(sharpFlatRegex);
    
    if (!match) return null;
    
    const note = match[1];
    const type = match[2] || 'M'; // Default to major if no type specified
    
    return { note, type };
  }

  function updateChord() {
    const chordKey = currentNote + currentChordType;
    const chord = chordDictionary.get(chordKey);
    
    // Update inversion options based on available inversions
    updateInversionOptions(chord);
    
    // Check if current inversion exists, fallback to root position if not
    if (chord && chord[currentInversion]) {
      activeNotes = chord[currentInversion];
    } else if (chord && chord['root_position']) {
      // Fallback to root position if current inversion doesn't exist
      currentInversion = 'root_position';
      activeNotes = chord['root_position'];
      // Update the select element to reflect the fallback
      const inversionSelect = document.getElementById('inversion-select') as HTMLSelectElement;
      if (inversionSelect) {
        inversionSelect.value = 'root_position';
      }
    } else {
      activeNotes = [];
    }
    
    updatePianoDisplay();
    
    // Play the chord audio when it's updated (skip on initial load)
    if (!isInitialLoad && activeNotes.length > 0) {
      playChord(activeNotes);
    }
    // Update URL to reflect current chord selection
    updateURL();
  }

  function updateInversionOptions(chord: any) {
    const inversionSelect = document.getElementById('inversion-select') as HTMLSelectElement;
    if (!inversionSelect) return;
    
    // Clear existing options
    inversionSelect.innerHTML = '';
    
    // Define all possible inversions with their labels
    const allInversions = [
      { value: 'root_position', label: 'Root Position' },
      { value: 'first_inversion', label: 'First Inversion' },
      { value: 'second_inversion', label: 'Second Inversion' },
      { value: 'third_inversion', label: 'Third Inversion' }
    ];
    
    // Add only available inversions
    if (chord) {
      allInversions.forEach(inversion => {
        if (chord[inversion.value]) {
          const option = document.createElement('option');
          option.value = inversion.value;
          option.textContent = inversion.label;
          option.label = inversion.label;
          
          // Select current inversion if it matches
          if (inversion.value === currentInversion) {
            option.selected = true;
          }
          
          inversionSelect.appendChild(option);
        }
      });
    }
    
    // If no options were added (shouldn't happen), add root position as fallback
    if (inversionSelect.children.length === 0) {
      const option = document.createElement('option');
      option.value = 'root_position';
      option.textContent = 'Root Position';
      option.label = 'Root Position';
      option.selected = true;
      inversionSelect.appendChild(option);
    }
  }

  function updatePianoDisplay() {
    // Reset all keys
    const allKeys = document.querySelectorAll('.key');
    const allNotes = document.querySelectorAll('.note');
    
    allKeys.forEach(key => {
      key.classList.remove('chord-active');
    });
    
    allNotes.forEach(note => {
      (note as HTMLElement).style.display = 'none';
    });
    
    // Highlight active chord notes
    activeNotes.forEach(noteName => {
      // Extract note name without octave (e.g., "C#3" -> "C#")
      const noteNameWithoutOctave = noteName.slice(0, -1);
      
      // Find the key that contains this note
      const allPianoKeys = document.querySelectorAll('.key[data-note]');
      
      allPianoKeys.forEach(key => {
        const dataNote = key.getAttribute('data-note');
        if (dataNote && dataNote.includes(noteName)) {
          // Highlight the key
          key.classList.add('chord-active');
          
          // Show the specific note name that matches our chord
          const noteElements = key.querySelectorAll('.note');
          noteElements.forEach(noteEl => {
            if (noteEl.textContent && noteEl.textContent.trim() === noteNameWithoutOctave) {
              (noteEl as HTMLElement).style.display = 'block';
            }
          });
        }
      });
    });
  }

  // Function to update select elements to match current state
  function updateSelectElements() {
    const noteSelect = document.getElementById('note-select') as HTMLSelectElement;
    const chordTypeSelect = document.getElementById('family-select') as HTMLSelectElement;
    const inversionSelect = document.getElementById('inversion-select') as HTMLSelectElement;
    
    if (noteSelect) noteSelect.value = currentNote;
    if (chordTypeSelect) chordTypeSelect.value = currentChordType;
    if (inversionSelect) inversionSelect.value = currentInversion;
  }

  function handleNoteChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    currentNote = target.value;
    updateChord();
  }

  function handleChordTypeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    currentChordType = target.value;
    updateChord();
  }

  function handleInversionChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    currentInversion = target.value;
    updateChord();
  }

  onMount(() => {
    initializeChordDictionary();
    
    // Parse URL and set initial chord state
    parseURLAndSetChord();
    
    // Set initial chord based on URL or defaults
    setTimeout(() => {
      updateSelectElements(); // Update select elements to match parsed state
      isInitialLoad = false; // Allow URL updates after initial load
      updateChord();
    }, 100); // Small delay to ensure piano and DOM are rendered
  });
</script>

<style>
  /* Chord dictionary wrapper */
  .chord-dictionary-wrapper {
    min-height: calc(100vh - 4rem); /* Account for navbar */
    padding: 2rem 0;
  }

  /* Navigation */
  .navigation {
    padding-bottom: 1.5rem;
  }

  /* Back button icon */
  .back-icon {
    width: 1rem;
    height: 1rem;
    margin-right: 0.5rem;
    stroke-width: 1.5;
  }

  /* Controls section */
  .controls-section {
    padding-bottom: 2.5rem;
  }

  .controls-container {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    flex-wrap: wrap;
    max-width: 48rem;
    margin: 0 auto;
  }

  /* Piano section */
  .piano-section {
    padding-bottom: 5rem;
  }

  .piano-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3rem 2rem;
  }

  /* Score section spacing */
  .score-section {
    padding-bottom: 2.5rem;
  }

  /* Select controls */
  .select-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 10rem;
  }

  .select-label {
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
    color: var(--color-text-tertiary);
    letter-spacing: -0.01em;
  }

  .chord-select {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px);
    border: 1px solid var(--color-border-medium);
    border-radius: 0.75rem;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    outline: none;
    color: var(--color-text-primary);
    transition: var(--transition-smooth);
    box-shadow: var(--shadow-sm);
    background-image: url('data:image/svg+xml;utf8,<svg fill="%23424245" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 16px;
  }

  .chord-select:hover {
    border-color: var(--color-border-strong);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  .chord-select:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.15);
    transform: translateY(-1px);
  }

  .chord-select option {
    font-weight: 400;
    padding: 0.5rem 0.75rem;
    color: var(--color-text-primary);
    background: var(--color-background);
  }

  /* Chord highlighting styles */
  :global(.key.chord-active) {
    box-shadow: 
      0 0 20px rgba(0, 122, 255, 0.4),
      0 4px 12px rgba(0, 122, 255, 0.3) !important;
    border-color: var(--color-accent-hover) !important;
  }

  :global(.key.white.chord-active) {
    background: var(--gradient-blue) !important;
    transform: scaleY(0.99);
    color: white;
  }

  :global(.key.black.chord-active) {
    background: var(--gradient-blue) !important;
    transform: translateY(-1px);
  }

  :global(.key.chord-active .note) {
    color: white !important;
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .controls-container {
      gap: 1rem;
      flex-direction: column;
      align-items: center;
    }
    
    .select-group {
      min-width: 12rem;
      max-width: 18rem;
      width: 100%;
    }

    .piano-container {
      padding: 2rem 1.25rem;
    }

    .piano-section {
      padding-bottom: 3rem;
    }
  }

  @media (max-width: 480px) {
    .piano-container {
      padding: 1.5rem 1rem;
    }
  }
</style>

<div class="chord-dictionary-wrapper">
  <div class="page-container">
    <!-- Navigation -->
    <nav class="navigation">
      <a href="/" class="btn-glass">
        <svg class="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Home</span>
      </a>
    </nav>

    <!-- Header Section -->
    <header class="header-section">
      <div class="header-content">
        <h1 class="main-title">Chord Dictionary</h1>
      </div>
    </header>

    <!-- Music Score Section -->
    <section class="score-section">
      <MusicScore {activeNotes} chordName={fullChordName} />
    </section>

    <!-- Chord Controls -->
    <section class="controls-section">
      <div class="controls-container">
        <div class="select-group">
          <label for="note-select" class="select-label">Root Note</label>
          <select id="note-select" aria-label="Select root note" class="chord-select" on:change={handleNoteChange}>
            <option value="C" selected label="C">C</option>
            <option value="C#" label="C#">C#</option>
            <option value="Db" label="Db">Db</option>
            <option value="D" label="D">D</option>
            <option value="D#" label="D#">D#</option>
            <option value="Eb" label="Eb">Eb</option>
            <option value="E" label="E">E</option>
            <option value="F" label="F">F</option>
            <option value="F#" label="F#">F#</option>
            <option value="Gb" label="Gb">Gb</option>
            <option value="G" label="G">G</option>
            <option value="G#" label="G#">G#</option>
            <option value="Ab" label="Ab">Ab</option>
            <option value="A" label="A">A</option>
            <option value="A#" label="A#">A#</option>
            <option value="Bb" label="Bb">Bb</option>
            <option value="B" label="B">B</option>
          </select>
        </div>

        <div class="select-group">
          <label for="family-select" class="select-label">Chord Type</label>
          <select id="family-select" aria-label="Select chord type" class="chord-select" on:change={handleChordTypeChange}>
            <option value="M" selected label="M">M</option>
            <option value="m" label="m">m</option>
            <option value="dim" label="dim">dim</option>
            <option value="sus4" label="sus4">sus4</option>
            <option value="7" label="7">7</option>
            <option value="maj7" label="maj7">maj7</option>
            <option value="9" label="9">9</option>
            <option value="m7" label="m7">m7</option>
            <option value="11" label="11">11</option>
          </select>
        </div>

        <div class="select-group">
          <label for="inversion-select" class="select-label">Inversion</label>
          <select id="inversion-select" aria-label="Select chord inversion" class="chord-select" on:change={handleInversionChange}>
            <option value="root_position" selected label="Root Position">Root Position</option>
            <option value="first_inversion" label="1st Inversion">First Inversion</option>
            <option value="second_inversion" label="2nd Inversion">Second Inversion</option>
            <option value="third_inversion" label="3rd Inversion">Third Inversion</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Piano Section -->
    <section class="piano-section">
      <div class="piano-container">
        <Piano />
      </div>
    </section>
  </div>
</div>
