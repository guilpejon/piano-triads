<script lang="ts">
  import Piano from '$lib/components/Piano.svelte';
  import { onMount } from 'svelte';
  import { playNote } from '$lib/utils/audioUtils';
  import {
    generateScale,
    getScaleDefinition,
    getPracticeScales,
    getScalePattern,
    getScaleDegreeNames,
    getNoteNameOnly,
    areNotesEquivalent
  } from '$lib/utils/chordUtils';

  // Current scale state
  let currentRootNote = 'C';
  let currentScaleType = 'major';
  let currentScaleNotes: string[] = [];
  let isInitialLoad = true;

  // Available root notes
  const availableRootNotes = [
    'C',
    'C#',
    'Db',
    'D',
    'D#',
    'Eb',
    'E',
    'F',
    'F#',
    'Gb',
    'G',
    'G#',
    'Ab',
    'A',
    'A#',
    'Bb',
    'B'
  ];

  // Available scale types for practice
  const availableScaleTypes = getPracticeScales();

  // Reactive scale information
  $: scaleDefinition = getScaleDefinition(currentScaleType);
  $: fullScaleName = scaleDefinition ? `${currentRootNote} ${scaleDefinition.name}` : '';
  $: scalePattern = getScalePattern(currentScaleType);
  $: scaleDegrees = getScaleDegreeNames(currentScaleType);
  $: scaleDescription = scaleDefinition?.description || '';

  // Function to update the current scale
  function updateScale() {
    // Use octave 3 for lower notes to avoid going into octave 5
    // This ensures all scale notes stay within the available audio range (3-4)
    const startingOctave = ['C', 'C#', 'Db', 'D', 'D#', 'Eb'].includes(currentRootNote) ? 3 : 3;
    currentScaleNotes = generateScale(currentRootNote, currentScaleType, startingOctave);
    updatePianoDisplay();

    // Play scale on update (skip on initial load)
    if (!isInitialLoad && currentScaleNotes.length > 0) {
      playScaleAscending();
    }
  }

  // Function to update piano display
  function updatePianoDisplay() {
    // Reset all keys
    const allKeys = document.querySelectorAll('.key');
    const allNotes = document.querySelectorAll('.note');

    allKeys.forEach((key) => {
      key.classList.remove('scale-active');
    });

    allNotes.forEach((note) => {
      (note as HTMLElement).style.display = 'none';
    });

    // Highlight scale notes
    currentScaleNotes.forEach((noteName) => {
      highlightScaleKey(noteName, 'scale-active');
    });
  }

  // Helper function to highlight a specific key and show the correct note name
  function highlightScaleKey(noteName: string, cssClass: string) {
    const allPianoKeys = document.querySelectorAll('.key[data-note]');

    allPianoKeys.forEach((key) => {
      const dataNote = key.getAttribute('data-note');
      if (dataNote) {
        // Check all possible note names for this key (handles black keys with multiple names)
        const keyNotes = dataNote.split('/');

        // Check if any of the key's notes match our scale note exactly (same octave)
        const hasExactMatch = keyNotes.some((keyNote) => keyNote === noteName);

        if (hasExactMatch) {
          // Add the specified CSS class
          key.classList.add(cssClass);

          // Show the note name - the Piano component has already determined the correct enharmonic spelling
          const noteElements = key.querySelectorAll('.note');
          const scaleNoteWithoutOctave = getNoteNameOnly(noteName);

          noteElements.forEach((noteEl) => {
            const noteText = noteEl.textContent?.trim();
            if (noteText) {
              // Use enharmonic equivalence to check if this note element should be shown
              // This handles cases where the Piano component shows "Eb" but our scale has "D#"
              if (areNotesEquivalent(noteText + '3', scaleNoteWithoutOctave + '3')) {
                (noteEl as HTMLElement).style.display = 'block';
              }
            }
          });
        }
      }
    });
  }

  // Function to play scale ascending
  function playScaleAscending() {
    currentScaleNotes.forEach((note, index) => {
      setTimeout(() => {
        playNote(note);
      }, index * 300); // 300ms delay between notes
    });
  }

  // Function to play scale descending
  function playScaleDescending() {
    const reversedNotes = [...currentScaleNotes].reverse();
    reversedNotes.forEach((note, index) => {
      setTimeout(() => {
        playNote(note);
      }, index * 300); // 300ms delay between notes
    });
  }

  // Event handlers
  function handleRootNoteChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    currentRootNote = target.value;
    updateScale();
  }

  function handleScaleTypeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    currentScaleType = target.value;
    updateScale();
  }

  // Initialize on mount
  onMount(() => {
    setTimeout(() => {
      isInitialLoad = false;
      updateScale();
    }, 100); // Small delay to ensure piano and DOM are rendered
  });
</script>

<svelte:head>
  <title>Learn Scales - Piano Triads</title>
  <meta name="description" content="Learn and practice piano scales with interactive lessons" />
</svelte:head>

<div class="learn-scales-wrapper">
  <div class="page-container">
    <!-- Navigation -->
    <nav class="navigation">
      <a href="/" class="btn-glass">
        <svg class="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span>Back to Home</span>
      </a>
    </nav>

    <!-- Header Section -->
    <header class="header-section">
      <div class="header-content">
        <h1 class="main-title">Learn Scales</h1>
        <p class="main-subtitle">Learn the most common scales and practice them on the piano</p>
      </div>
    </header>

    <!-- Scale Controls -->
    <section class="controls-section">
      <div class="controls-container">
        <div class="select-group">
          <label for="root-note-select" class="select-label">Root Note</label>
          <select
            id="root-note-select"
            class="scale-select"
            on:change={handleRootNoteChange}
            bind:value={currentRootNote}
          >
            {#each availableRootNotes as rootNote}
              <option value={rootNote}>{rootNote}</option>
            {/each}
          </select>
        </div>

        <div class="select-group">
          <label for="scale-type-select" class="select-label">Scale Type</label>
          <select
            id="scale-type-select"
            class="scale-select"
            on:change={handleScaleTypeChange}
            bind:value={currentScaleType}
          >
            <optgroup label="Basic Scales">
              <option value="major">Major Scale</option>
              <option value="natural_minor">Natural Minor Scale</option>
            </optgroup>
            <optgroup label="Minor Scale Variations">
              <option value="harmonic_minor">Harmonic Minor Scale</option>
              <option value="melodic_minor">Melodic Minor Scale</option>
            </optgroup>
            <optgroup label="Modal Scales">
              <option value="dorian">Dorian Mode</option>
              <option value="mixolydian">Mixolydian Mode</option>
            </optgroup>
            <optgroup label="Pentatonic Scales">
              <option value="pentatonic_major">Major Pentatonic Scale</option>
              <option value="pentatonic_minor">Minor Pentatonic Scale</option>
            </optgroup>
            <optgroup label="Specialty Scales">
              <option value="blues">Blues Scale</option>
              <option value="whole_tone">Whole Tone Scale</option>
              <option value="chromatic">Chromatic Scale</option>
            </optgroup>
          </select>
        </div>
      </div>
    </section>

    <!-- Scale Notes Display -->
    {#if currentScaleNotes.length > 0}
      <section class="scale-notes-section">
        <div class="scale-notes-container">
          <div class="notes-grid">
            {#each currentScaleNotes as note, index}
              <div class="note-item">
                <div class="note-name">{getNoteNameOnly(note)}</div>
                <div class="note-degree">{scaleDegrees[index]}</div>
              </div>
            {/each}
          </div>
          <div class="scale-pattern">{scalePattern}</div>
        </div>
      </section>
    {/if}

    <!-- Action Buttons -->
    <section class="actions-section">
      <div class="actions-container">
        <button on:click={playScaleAscending} class="action-button primary">
          Play Ascending
        </button>
        <button on:click={playScaleDescending} class="action-button secondary">
          Play Descending
        </button>
      </div>
    </section>

    <!-- Piano Section -->
    <section class="piano-section">
      <div class="piano-container">
        <Piano chordNotes={currentScaleNotes} stickyOnMobile={true} />
      </div>
    </section>
  </div>
</div>

<style>
  /* Learn scales wrapper */
  .learn-scales-wrapper {
    min-height: calc(90vh - 4rem);
    padding: 2rem 0;
  }

  .learn-scales-wrapper .main-title {
    font-size: clamp(38px, 8vw, 70px);
  }

  /* Navigation */
  .navigation {
    padding-bottom: 1.5rem;
  }

  .back-icon {
    width: 1rem;
    height: 1rem;
    margin-right: 0.5rem;
    stroke-width: 1.5;
  }

  .scale-pattern {
    font-size: 1rem;
    color: var(--color-text-tertiary);
    font-family: 'Monaco', 'Menlo', monospace;
    padding-top: 1rem;
    justify-content: center;
    display: flex;
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

  .scale-select {
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

  .scale-select:hover {
    border-color: var(--color-border-strong);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  .scale-select:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.15);
    transform: translateY(-1px);
  }

  .scale-select optgroup {
    font-weight: 600;
    color: var(--color-text-primary);
    background: var(--color-background);
    padding: 0.5rem 0;
  }

  .scale-select option {
    font-weight: 400;
    padding: 0.5rem 0.75rem;
    color: var(--color-text-primary);
    background: var(--color-background);
  }

  /* Scale notes display */
  .scale-notes-section {
    padding-bottom: 2rem;
  }

  .scale-notes-container {
    max-width: 46rem;
    margin: 0 auto;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid var(--color-border-light);
    border-radius: 1rem;
    backdrop-filter: blur(20px);
  }

  .notes-grid {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .note-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid var(--color-border-light);
    border-radius: 0.5rem;
    min-width: 3rem;
  }

  .note-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .note-degree {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
  }

  /* Action buttons */
  .actions-container {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .action-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    border: none;
    border-radius: 1rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    transition: var(--transition-smooth);
    min-width: 140px;
    justify-content: center;
  }

  .action-button.primary {
    background: var(--gradient-blue);
    color: white;
  }

  .action-button.secondary {
    background: var(--gradient-green);
    color: white;
  }

  .action-button.tertiary {
    background: var(--gradient-purple);
    color: white;
  }

  .action-button:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  /* Piano section */
  .piano-section {
    padding-bottom: 3rem;
  }

  .piano-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
  }

  /* Scale highlighting styles */
  :global(.key.scale-active) {
    box-shadow:
      0 0 20px rgba(0, 122, 255, 0.4),
      0 4px 12px rgba(0, 122, 255, 0.3) !important;
    border-color: var(--color-accent-hover) !important;
  }

  :global(.key.white.scale-active) {
    background: var(--gradient-blue) !important;
    transform: scaleY(0.99);
    color: white;
  }

  :global(.key.black.scale-active) {
    background: var(--gradient-blue) !important;
    transform: translateY(-1px);
  }

  :global(.key.scale-active .note) {
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
      padding-bottom: 2rem;
    }

    .scale-notes-container {
      margin: 0 1rem;
    }

    .actions-container {
      flex-direction: column;
      align-items: center;
    }

    .action-button {
      width: 100%;
      max-width: 280px;
    }
  }

  @media (max-width: 480px) {
    .piano-container {
      padding: 1.5rem 1rem;
    }

    .navigation {
      padding-bottom: 1rem;
    }

    .header-section {
      padding: 2rem 0;
    }

    .controls-section {
      padding-bottom: 1.5rem;
    }

    .piano-section {
      padding-bottom: 1.5rem;
    }

    .notes-grid {
      gap: 0.25rem;
    }

    .note-item {
      padding: 0.5rem;
      min-width: 2.5rem;
    }

    .note-name {
      font-size: 1rem;
    }

    .note-degree {
      font-size: 0.7rem;
    }
  }
</style>
