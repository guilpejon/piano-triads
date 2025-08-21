<script lang="ts">
  import Piano from '$lib/components/Piano.svelte';
  import { onMount } from 'svelte';
  import { playChord } from '$lib/utils/audioUtils';
  import {
    loadProgress,
    saveProgress,
    checkAchievements,
    type UserProgress
  } from '$lib/utils/progressUtils';
  import { getChord, getNoteNameOnly, areNotesEquivalent } from '$lib/utils/chordUtils';

  // Reference to Piano component for auto-scroll
  let pianoComponent: Piano;

  // Progress tracking
  let userProgress: UserProgress;

  // Common chord progressions with descriptions
  const chordProgressions = [
    {
      id: 'vi-IV-I-V',
      name: 'vi-IV-I-V',
      description: 'The most popular progression in pop music',
      example: 'Used in countless hits like "Don\'t Stop Believin\'" and "Let It Be"',
      chords: ['Am', 'FM', 'CM', 'GM'], // In key of C major
      key: 'C Major',
      romanNumerals: ['vi', 'IV', 'I', 'V']
    },
    {
      id: 'I-V-vi-IV',
      name: 'I-V-vi-IV',
      description: 'Classic pop progression, variation of vi-IV-I-V',
      example: 'Found in "Someone Like You" by Adele and many others',
      chords: ['CM', 'GM', 'Am', 'FM'],
      key: 'C Major',
      romanNumerals: ['I', 'V', 'vi', 'IV']
    },
    {
      id: 'ii-V-I',
      name: 'ii-V-I',
      description: 'The foundation of jazz harmony',
      example: 'Essential in jazz standards and sophisticated pop songs',
      chords: ['Dm', 'GM', 'CM'],
      key: 'C Major',
      romanNumerals: ['ii', 'V', 'I']
    },
    {
      id: 'I-vi-ii-V',
      name: 'I-vi-ii-V',
      description: 'Classic doo-wop and early rock progression',
      example: 'Used in "Stand By Me" and "Blue Moon"',
      chords: ['CM', 'Am', 'Dm', 'GM'],
      key: 'C Major',
      romanNumerals: ['I', 'vi', 'ii', 'V']
    },
    {
      id: 'I-IV-V-I',
      name: 'I-IV-V-I',
      description: 'The most fundamental progression in Western music',
      example: 'Found in folk, blues, and classical music',
      chords: ['CM', 'FM', 'GM', 'CM'],
      key: 'C Major',
      romanNumerals: ['I', 'IV', 'V', 'I']
    },
    {
      id: 'vi-ii-V-I',
      name: 'vi-ii-V-I',
      description: 'Extended jazz progression with smooth voice leading',
      example: 'Common in jazz ballads and sophisticated pop',
      chords: ['Am', 'Dm', 'GM', 'CM'],
      key: 'C Major',
      romanNumerals: ['vi', 'ii', 'V', 'I']
    }
  ];

  // Current progression state
  let currentProgression = chordProgressions[0];
  let currentChordIndex = 0;
  let currentKey = 'C'; // Default key
  let isPlaying = false;
  let currentChordNotes: string[] = [];
  let progressionsLearned: Set<string> = new Set();

  // Available keys for transposition
  const availableKeys = [
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

  // Chromatic notes for transposition
  const chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Function to transpose a chord to a new key
  function transposeChord(originalChord: string, fromKey: string, toKey: string): string {
    // Extract the root note and chord type (e.g., "Am" -> "A" and "m")
    const match = originalChord.match(/^([A-G][#b]?)(.*)$/);
    if (!match) return originalChord;

    const [, rootNote, chordType] = match;

    // Calculate semitone difference between keys
    const fromIndex = chromaticNotes.indexOf(fromKey);
    const toIndex = chromaticNotes.indexOf(toKey);
    if (fromIndex === -1 || toIndex === -1) return originalChord;

    let semitoneShift = toIndex - fromIndex;
    if (semitoneShift < 0) semitoneShift += 12;

    // Find the original root note index
    const rootIndex = chromaticNotes.indexOf(rootNote);
    if (rootIndex === -1) return originalChord;

    // Calculate new root note
    const newRootIndex = (rootIndex + semitoneShift) % 12;
    const newRootNote = chromaticNotes[newRootIndex];

    return newRootNote + chordType;
  }

  // Function to get transposed progressions
  function getTransposedProgressions(key: string) {
    return chordProgressions.map((progression) => ({
      ...progression,
      chords: progression.chords.map((chord) => transposeChord(chord, 'C', key)),
      key: `${key} Major`
    }));
  }

  // Reactive transposed progressions for display
  $: transposedProgressions = getTransposedProgressions(currentKey);

  // Reactive chord display with transposition
  $: transposedChord = transposeChord(
    currentProgression.chords[currentChordIndex],
    'C',
    currentKey
  );
  $: currentChord = transposedChord;
  $: currentRomanNumeral = currentProgression.romanNumerals[currentChordIndex];
  $: currentKeyDisplay = currentKey === 'C' ? 'C Major' : `${currentKey} Major`;

  // Reactive chord notes update
  $: {
    const chordData = getChord(currentChord);
    currentChordNotes = chordData ? chordData.root_position : [];
    // Trigger piano display update
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        updatePianoDisplay();
        // Manually trigger scroll to active key on mobile
        if (pianoComponent) {
          pianoComponent.scrollToActiveKey();
        }
      }, 50);
    }
  }

  // Function to select a progression
  function selectProgression(progression: (typeof chordProgressions)[0]) {
    currentProgression = progression;
    currentChordIndex = 0;
    // Reactive statements will handle chord updates

    // Track progression learned
    if (!progressionsLearned.has(progression.id)) {
      progressionsLearned.add(progression.id);
      // Update progress tracking if we had a chord progressions module
      if (userProgress) {
        userProgress = checkAchievements(userProgress);
        saveProgress(userProgress);
      }
    }
  }

  // Function to change key
  function changeKey(newKey: string) {
    currentKey = newKey;
    // Reactive statements will handle chord updates
  }

  // Function to update current chord display
  function updateCurrentChord() {
    const chordData = getChord(currentChord);
    currentChordNotes = chordData ? chordData.root_position : [];
    updatePianoDisplay();
  }

  // Function to update piano display
  function updatePianoDisplay() {
    // Reset all keys
    const allKeys = document.querySelectorAll('.key');
    const allNotes = document.querySelectorAll('.note');

    allKeys.forEach((key) => {
      key.classList.remove('chord-active');
    });

    allNotes.forEach((note) => {
      (note as HTMLElement).style.display = 'none';
    });

    // Highlight current chord notes
    currentChordNotes.forEach((noteName) => {
      highlightKey(noteName, 'chord-active');
    });
  }

  // Helper function to highlight a specific key
  function highlightKey(noteName: string, cssClass: string) {
    const allPianoKeys = document.querySelectorAll('.key[data-note]');

    allPianoKeys.forEach((key) => {
      const dataNote = key.getAttribute('data-note');
      if (dataNote) {
        const keyNotes = dataNote.split('/');
        const hasExactMatch = keyNotes.some((keyNote) => keyNote === noteName);

        if (hasExactMatch) {
          key.classList.add(cssClass);

          const noteElements = key.querySelectorAll('.note');
          const chordNoteWithoutOctave = getNoteNameOnly(noteName);

          noteElements.forEach((noteEl) => {
            const noteText = noteEl.textContent?.trim();
            if (noteText) {
              if (areNotesEquivalent(noteText + '3', chordNoteWithoutOctave + '3')) {
                (noteEl as HTMLElement).style.display = 'block';
              }
            }
          });
        }
      }
    });
  }

  // Function to play current chord
  function playCurrentChord() {
    if (currentChordNotes.length > 0) {
      playChord(currentChordNotes);
    }
  }

  // Function to play entire progression
  async function playProgression() {
    if (isPlaying) return;

    isPlaying = true;

    for (let i = 0; i < currentProgression.chords.length; i++) {
      currentChordIndex = i;

      // Get transposed chord for current key
      const transposedChordName = transposeChord(currentProgression.chords[i], 'C', currentKey);
      const chordData = getChord(transposedChordName);
      if (chordData) {
        playChord(chordData.root_position);
      }

      // Wait before next chord (except for last chord)
      if (i < currentProgression.chords.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }

    isPlaying = false;
  }

  // Function to go to next chord
  function nextChord() {
    if (currentChordIndex < currentProgression.chords.length - 1) {
      currentChordIndex++;
      updateCurrentChord();
      // Play the new chord
      setTimeout(() => playCurrentChord(), 100);
    }
  }

  // Function to go to previous chord
  function previousChord() {
    if (currentChordIndex > 0) {
      currentChordIndex--;
      updateCurrentChord();
      // Play the new chord
      setTimeout(() => playCurrentChord(), 100);
    }
  }

  // Initialize on mount
  onMount(() => {
    // Load user progress
    userProgress = loadProgress();

    // Initialize first chord
    setTimeout(() => {
      updateCurrentChord();
    }, 100);
  });
</script>

<svelte:head>
  <title>Chord Progressions - Learn Popular Piano Chord Progressions | Piano Triads</title>
  <meta name="description" content="Master common chord progressions used in popular music. Learn I-V-vi-IV, ii-V-I, and other essential progressions with interactive examples and practice exercises." />
  <meta name="keywords" content="chord progressions, piano progressions, I-V-vi-IV, ii-V-I, popular music chords, song progressions, music theory, chord sequences" />
  <link rel="canonical" href="https://piano-triads.com/chord-progressions" />

  <!-- Open Graph -->
  <meta property="og:title" content="Chord Progressions - Learn Popular Piano Chord Progressions | Piano Triads" />
  <meta property="og:description" content="Master common chord progressions used in popular music. Learn I-V-vi-IV, ii-V-I, and other essential progressions with interactive examples and practice exercises." />
  <meta property="og:url" content="https://piano-triads.com/chord-progressions" />
  <meta property="og:type" content="website" />

  <!-- Twitter Card -->
  <meta name="twitter:title" content="Chord Progressions - Learn Popular Piano Chord Progressions | Piano Triads" />
  <meta name="twitter:description" content="Master common chord progressions used in popular music with interactive examples and practice exercises." />

  <!-- Structured Data -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Chord Progressions - Learn Popular Piano Chord Progressions",
      "url": "https://piano-triads.com/chord-progressions",
      "description": "Master common chord progressions used in popular music. Learn I-V-vi-IV, ii-V-I, and other essential progressions with interactive examples and practice exercises.",
      "mainEntity": {
        "@type": "LearningResource",
        "name": "Piano Chord Progressions Guide",
        "description": "Interactive guide to learning popular chord progressions including I-V-vi-IV, ii-V-I, and other essential sequences used in contemporary music.",
        "educationalLevel": "Beginner to Intermediate",
        "learningResourceType": "Interactive Guide",
        "teaches": [
          "Chord Progressions",
          "Roman Numeral Analysis",
          "Popular Music Theory",
          "Song Structure",
          "Harmonic Analysis"
        ],
        "interactivityType": "Active"
      }
    }
  </script>
</svelte:head>

<div class="chord-progressions-wrapper">
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
        <h1 class="main-title">Chord Progressions</h1>
        <p class="page-description">
          Learn the most common chord progressions used in popular music
        </p>
      </div>
    </header>

    <!-- Progression Selection -->
    <section class="progressions-section">
      <div class="progressions-container">
        <div class="progressions-grid">
          {#each transposedProgressions as progression, progressionIndex}
            <button
              class="progression-card"
              class:active={currentProgression.id === progression.id}
              on:click={() => selectProgression(chordProgressions[progressionIndex])}
            >
              <div class="progression-header">
                <h3 class="progression-name">{progression.name}</h3>
                <div class="progression-key">{progression.key}</div>
              </div>
              <div class="progression-chords">
                {#each progression.chords as chord, index}
                  <span class="chord-badge">
                    {chord}
                    <span class="roman-numeral">{progression.romanNumerals[index]}</span>
                  </span>
                {/each}
              </div>
              <p class="progression-description">{progression.description}</p>
              <!-- <p class="progression-example">{progression.example}</p> -->
            </button>
          {/each}
        </div>
      </div>
    </section>

    <!-- Current Progression Display -->
    <section class="current-progression-section">
      <div class="current-progression-container">
        <div class="progression-info">
          <h2 class="current-progression-title">{currentProgression.name}</h2>
          <div class="key-selector-container">
            <label for="key-select" class="key-label">Key:</label>
            <select id="key-select" class="key-select" bind:value={currentKey}>
              {#each availableKeys as key}
                <option value={key}>{key} Major</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="chord-display">
          <div class="chord-navigation">
            <button
              class="nav-button"
              on:click={previousChord}
              disabled={currentChordIndex === 0}
              aria-label="Previous chord"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div class="current-chord">
              <div class="chord-name">{currentChord}</div>
              <div class="chord-roman">{currentRomanNumeral}</div>
              <div class="chord-position">
                {currentChordIndex + 1} of {currentProgression.chords.length}
              </div>
            </div>

            <button
              class="nav-button"
              on:click={nextChord}
              disabled={currentChordIndex === currentProgression.chords.length - 1}
              aria-label="Next chord"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="playback-controls">
          <button class="control-button primary" on:click={playCurrentChord}> Play Chord </button>
          <button class="control-button secondary" on:click={playProgression} disabled={isPlaying}>
            {isPlaying ? 'Playing...' : 'Play Progression'}
          </button>
        </div>
      </div>
    </section>

    <!-- Piano Section -->
    <section class="piano-section">
      <div class="piano-container">
        <Piano bind:this={pianoComponent} chordNotes={currentChordNotes} stickyOnMobile={true} />
      </div>
    </section>
  </div>
</div>

<style>
  /* Chord progressions wrapper */
  .chord-progressions-wrapper {
    min-height: calc(90vh - 4rem);
    padding: 2rem 0;
  }

  /* Progressions selection */
  .progressions-section {
    padding-bottom: 3rem;
  }

  .progressions-container {
    max-width: 72rem;
    margin: 0 auto;
  }

  .progressions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .progression-card {
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid var(--color-border-light);
    border-radius: 1rem;
    padding: 1.5rem;
    cursor: pointer;
    transition: var(--transition-smooth);
    text-align: left;
    backdrop-filter: blur(20px);
  }

  .progression-card:hover {
    border-color: var(--color-accent);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .progression-card.active {
    border-color: var(--color-accent);
    background: rgba(0, 122, 255, 0.05);
    box-shadow: var(--shadow-md);
  }

  .progression-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .progression-name {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
  }

  .progression-key {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    background: rgba(0, 0, 0, 0.05);
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
  }

  .progression-chords {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .chord-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--gradient-blue);
    color: white;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    min-width: 3rem;
  }

  .roman-numeral {
    font-size: 0.75rem;
    opacity: 0.8;
    margin-top: 0.125rem;
  }

  .progression-description {
    font-size: 0.95rem;
    color: var(--color-text-primary);
    margin-bottom: 0.5rem;
    font-weight: 500;
  }



  /* Current progression display */
  .current-progression-section {
    padding-bottom: 2rem;
  }

  .current-progression-container {
    max-width: 48rem;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid var(--color-border-light);
    border-radius: 1.5rem;
    padding: 2rem;
    backdrop-filter: blur(20px);
  }

  .progression-info {
    text-align: center;
    margin-bottom: 2rem;
  }

  .current-progression-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: 0.5rem;
  }

  .key-selector-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .key-label {
    font-size: 1rem;
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  .key-select {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px);
    border: 1px solid var(--color-border-medium);
    border-radius: 0.5rem;
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    outline: none;
    color: var(--color-text-primary);
    transition: var(--transition-smooth);
    box-shadow: var(--shadow-sm);
    background-image: url('data:image/svg+xml;utf8,<svg fill="%23424245" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
    background-repeat: no-repeat;
    background-position: right 8px center;
    background-size: 16px;
    min-width: 120px;
  }

  .key-select:hover {
    border-color: var(--color-border-strong);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  .key-select:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.15);
    transform: translateY(-1px);
  }

  .key-select option {
    font-weight: 400;
    padding: 0.5rem 0.75rem;
    color: var(--color-text-primary);
    background: var(--color-background);
  }

  .chord-display {
    margin-bottom: 2rem;
  }

  .chord-navigation {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
  }

  .nav-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid var(--color-border-medium);
    border-radius: 50%;
    cursor: pointer;
    transition: var(--transition-smooth);
    color: var(--color-text-primary);
  }

  .nav-button:hover:not(:disabled) {
    background: var(--color-accent);
    color: white;
    transform: scale(1.05);
  }

  .nav-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .current-chord {
    text-align: center;
    min-width: 8rem;
  }

  .chord-name {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--color-accent);
    margin-bottom: 0.25rem;
  }

  .chord-roman {
    font-size: 1.25rem;
    color: var(--color-text-secondary);
    margin-bottom: 0.5rem;
  }

  .chord-position {
    font-size: 0.875rem;
    color: var(--color-text-tertiary);
  }

  .playback-controls {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .control-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    border: none;
    border-radius: 1rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition-smooth);
    min-width: 140px;
    justify-content: center;
  }

  .control-button.primary {
    background: var(--gradient-blue);
    color: white;
  }

  .control-button.secondary {
    background: var(--gradient-green);
    color: white;
  }

  .control-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .control-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

  /* Piano highlighting for progressions */
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
    display: block !important;
    color: white !important;
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .chord-progressions-wrapper {
      padding: 1rem 0;
    }

    .progressions-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .progression-card {
      padding: 1.25rem;
    }

    .current-progression-container {
      margin: 0 1rem;
      padding: 1.5rem;
    }

    .key-selector-container {
      flex-direction: column;
      gap: 0.5rem;
    }

    .key-select {
      min-width: 140px;
    }

    .chord-navigation {
      gap: 1rem;
    }

    .current-chord {
      min-width: 6rem;
    }

    .chord-name {
      font-size: 2rem;
    }

    .playback-controls {
      flex-direction: column;
      align-items: center;
    }

    .control-button {
      width: 100%;
      max-width: 280px;
    }

    .piano-container {
      padding: 1rem;
    }
  }

  @media (max-width: 480px) {
    .progressions-section {
      padding-bottom: 0;
    }
    .current-progression-title {
      font-size: 1.5rem;
    }

    .chord-name {
      font-size: 1.75rem;
    }

    .chord-roman {
      font-size: 1rem;
    }

    .progression-chords {
      justify-content: center;
    }

    .chord-badge {
      min-width: 2.5rem;
      padding: 0.375rem 0.5rem;
    }

    .nav-button {
      width: 2.5rem;
      height: 2.5rem;
    }
    .piano-section {
      padding-bottom: 0;
    }
    .piano-container {
      padding: 0;
    }
  }
</style>
