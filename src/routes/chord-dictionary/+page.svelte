<script lang="ts">
  import Piano from '$lib/components/Piano.svelte';
  import MusicScore from '$lib/components/MusicScore.svelte';
  import { playChord } from '$lib/utils/audioUtils';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { getChordDictionary, type ChordDefinition, getChordToneRule } from '$lib/utils/chordUtils';

  const chordDictionary = getChordDictionary();
  
  let currentNote = 'C';
  let currentChordType = 'M';
  let currentInversion = 'root_position';
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

  // Reactive chord tone rule that explains how to build the chord with semitone steps
  // Use centralized chord tone rule function
  $: chordToneRule = getChordToneRule(currentChordType);

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
    const chord = chordDictionary.get(chordKey) as ChordDefinition | undefined;
    
    // Update inversion options based on available inversions
    updateInversionOptions(chord);
    
    // Check if current inversion exists, fallback to root position if not
    if (chord && chord[currentInversion as keyof ChordDefinition]) {
      activeNotes = chord[currentInversion as keyof ChordDefinition] as string[];
    } else if (chord && chord.root_position) {
      // Fallback to root position if current inversion doesn't exist
      currentInversion = 'root_position';
      activeNotes = chord.root_position;
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

<svelte:head>
	<title>Chord Dictionary - Piano Triads</title>
	<meta name="description" content="Learn chords" />
</svelte:head>

<style>
  /* Chord dictionary wrapper */
  .chord-dictionary-wrapper {
    min-height: calc(90vh - 4rem); /* Account for navbar */
    padding: 2rem 0;
    .main-title {
      font-size: clamp(48px, 8vw, 70px);
    }
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
    /* Note: display is controlled by JavaScript for selective showing */
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
    .score-section {
      padding-bottom: 1.5rem;
    }
    .piano-container {
      padding: 1.5rem 1rem;
    }

    nav.navigation {
      padding: 0;
    }

    .header-section {
      padding: 2rem 0;
      .main-title {
        margin: 0;
      }
    }

    .controls-section {
      padding-bottom: 1rem;
    }

    .piano-section {
      padding-bottom: 1rem;
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
      <MusicScore {activeNotes} chordName={fullChordName} {chordToneRule} />
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
