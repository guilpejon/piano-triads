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
    // Major key progressions
    {
      id: 'vi-IV-I-V',
      name: 'vi-IV-I-V',
      description: 'The most popular progression in pop music',
      example: 'Used in countless hits like "Don\'t Stop Believin\'" and "Let It Be"',
      chords: ['Am', 'FM', 'CM', 'GM'], // In key of C major
      key: 'C Major',
      keyType: 'major',
      romanNumerals: ['vi', 'IV', 'I', 'V']
    },
    {
      id: 'I-V-vi-IV',
      name: 'I-V-vi-IV',
      description: 'Classic pop progression, variation of vi-IV-I-V',
      example: 'Found in "Someone Like You" by Adele and many others',
      chords: ['CM', 'GM', 'Am', 'FM'],
      key: 'C Major',
      keyType: 'major',
      romanNumerals: ['I', 'V', 'vi', 'IV']
    },
    {
      id: 'ii-V-I',
      name: 'ii-V-I',
      description: 'The foundation of jazz harmony',
      example: 'Essential in jazz standards and sophisticated pop songs',
      chords: ['Dm', 'GM', 'CM'],
      key: 'C Major',
      keyType: 'major',
      romanNumerals: ['ii', 'V', 'I']
    },
    {
      id: 'I-vi-ii-V',
      name: 'I-vi-ii-V',
      description: 'Classic doo-wop and early rock progression',
      example: 'Used in "Stand By Me" and "Blue Moon"',
      chords: ['CM', 'Am', 'Dm', 'GM'],
      key: 'C Major',
      keyType: 'major',
      romanNumerals: ['I', 'vi', 'ii', 'V']
    },
    {
      id: 'I-IV-V-I',
      name: 'I-IV-V-I',
      description: 'The most fundamental progression in Western music',
      example: 'Found in folk, blues, and classical music',
      chords: ['CM', 'FM', 'GM', 'CM'],
      key: 'C Major',
      keyType: 'major',
      romanNumerals: ['I', 'IV', 'V', 'I']
    },
    {
      id: 'vi-ii-V-I',
      name: 'vi-ii-V-I',
      description: 'Extended jazz progression with smooth voice leading',
      example: 'Common in jazz ballads and sophisticated pop',
      chords: ['Am', 'Dm', 'GM', 'CM'],
      key: 'C Major',
      keyType: 'major',
      romanNumerals: ['vi', 'ii', 'V', 'I']
    },
    // Minor key progressions
    {
      id: 'i-VI-III-VII',
      name: 'i-VI-III-VII',
      description: 'Popular minor progression with emotional impact',
      example: 'Common in emotional ballads and rock songs',
      chords: ['Am', 'FM', 'CM', 'GM'], // In key of A minor
      key: 'A Minor',
      keyType: 'minor',
      romanNumerals: ['i', 'VI', 'III', 'VII']
    },
    {
      id: 'i-v-iv-VII',
      name: 'i-v-iv-VII',
      description: 'Dark and moody minor progression',
      example: 'Used in many alternative and indie songs',
      chords: ['Am', 'Em', 'Dm', 'GM'],
      key: 'A Minor',
      keyType: 'minor',
      romanNumerals: ['i', 'v', 'iv', 'VII']
    },
    {
      id: 'i-iv-V-i',
      name: 'i-iv-V-i',
      description: 'Classic minor cadence with major dominant',
      example: 'Foundation of classical minor harmony',
      chords: ['Am', 'Dm', 'EM', 'Am'],
      key: 'A Minor',
      keyType: 'minor',
      romanNumerals: ['i', 'iv', 'V', 'i']
    },
    {
      id: 'i-VII-VI-VII',
      name: 'i-VII-VI-VII',
      description: 'Dramatic minor progression with strong resolution',
      example: 'Popular in rock and metal music',
      chords: ['Am', 'GM', 'FM', 'GM'],
      key: 'A Minor',
      keyType: 'minor',
      romanNumerals: ['i', 'VII', 'VI', 'VII']
    },
    {
      id: 'i-VI-iv-V',
      name: 'i-VI-iv-V',
      description: 'Melancholic progression with plagal motion',
      example: 'Common in ballads and emotional songs',
      chords: ['Am', 'FM', 'Dm', 'EM'],
      key: 'A Minor',
      keyType: 'minor',
      romanNumerals: ['i', 'VI', 'iv', 'V']
    },
    {
      id: 'i-ii°-V-i',
      name: 'i-ii°-V-i',
      description: 'Minor jazz progression with diminished chord',
      example: 'Found in jazz standards and sophisticated harmonies',
      chords: ['Am', 'Bm♭5', 'EM', 'Am'],
      key: 'A Minor',
      keyType: 'minor',
      romanNumerals: ['i', 'ii°', 'V', 'i']
    }
  ];

  // Current progression state
  let currentProgression = chordProgressions[0];
  let currentChordIndex = 0;
  let currentKey = 'C'; // Default key
  let currentKeyType = 'major'; // Default key type
  let isPlaying = false;
  let currentChordNotes: string[] = [];
  let progressionsLearned: Set<string> = new Set();
  let transposedChord: string;

  // Available keys for transposition
  const availableKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const availableModes = [
    { value: 'major', label: 'Major' },
    { value: 'minor', label: 'Minor' }
  ];

  // Chromatic notes for transposition
  const chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Function to generate all scale chords for a key
  function getScaleChords(key: string, keyType: string) {
    const scalePatterns = {
      major: ['M', 'm', 'm', 'M', 'M', 'm', 'dim'],
      minor: ['m', 'dim', 'M', 'm', 'm', 'M', 'M']
    };
    
    const romanNumerals = {
      major: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
      minor: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']
    };

    const keyIndex = chromaticNotes.indexOf(key);
    const pattern = scalePatterns[keyType as keyof typeof scalePatterns];
    const numerals = romanNumerals[keyType as keyof typeof romanNumerals];
    
    // Scale intervals from the root
    const scaleIntervals = keyType === 'major' 
      ? [0, 2, 4, 5, 7, 9, 11] // Major scale intervals
      : [0, 2, 3, 5, 7, 8, 10]; // Natural minor scale intervals
    
    return scaleIntervals.map((interval, index) => {
      const chordRootIndex = (keyIndex + interval) % 12;
      const chordRoot = chromaticNotes[chordRootIndex];
      const chordType = pattern[index];
      
      return {
        roman: numerals[index],
        chord: chordRoot + (chordType === 'M' ? 'M' : chordType === 'm' ? 'm' : chordType === 'dim' ? 'dim' : ''),
        degree: index + 1
      };
    });
  }

  // Reactive scale chords
  $: scaleChords = getScaleChords(currentKey, currentKeyType);

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
  function getTransposedProgressions(key: string, keyType: string) {
    return chordProgressions
      .filter(progression => progression.keyType === keyType)
      .map((progression) => {
        const baseKey = progression.keyType === 'major' ? 'C' : 'A';
        return {
          ...progression,
          chords: progression.chords.map((chord) => transposeChord(chord, baseKey, key)),
          key: `${key} ${keyType.charAt(0).toUpperCase() + keyType.slice(1)}`
        };
      });
  }

  // Reactive transposed progressions for display
  $: transposedProgressions = getTransposedProgressions(currentKey, currentKeyType);

  // Reactive chord display with transposition
  $: {
    const baseKey = currentProgression.keyType === 'major' ? 'C' : 'A';
    transposedChord = transposeChord(
      currentProgression.chords[currentChordIndex],
      baseKey,
      currentKey
    );
  }
  $: currentChord = transposedChord;
  $: currentRomanNumeral = currentProgression.romanNumerals[currentChordIndex];
  $: currentKeyDisplay = `${currentKey} ${currentKeyType.charAt(0).toUpperCase() + currentKeyType.slice(1)}`;

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
  function changeKey(key: string) {
    currentKey = key;
    // Reactive statements will handle chord updates
  }

  // Function to change mode (major/minor)
  function changeMode(mode: string) {
    currentKeyType = mode;
    // Filter progressions to match the new key type
    const availableProgressions = chordProgressions.filter(p => p.keyType === currentKeyType);
    if (availableProgressions.length > 0 && currentProgression.keyType !== currentKeyType) {
      // Switch to the first progression of the new key type
      selectProgression(availableProgressions[0]);
    }
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
      const baseKey = currentProgression.keyType === 'major' ? 'C' : 'A';
      const transposedChordName = transposeChord(currentProgression.chords[i], baseKey, currentKey);
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
    
    // Initialize key type to match first progression
    currentKeyType = currentProgression.keyType;

    // Initialize first chord
    setTimeout(() => {
      updateCurrentChord();
    }, 100);
  });
</script>



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

    <!-- Scale Chords Display -->
    <section class="scale-chords-section">
      <div class="scale-chords-container">
        <h3 class="scale-chords-title">All Chords in {currentKeyDisplay}</h3>

                      <div class="key-mode-selectors">
            <div class="key-selector-container">
              <label for="key-select" class="key-label">Key:</label>
              <select 
                id="key-select" 
                class="key-select" 
                bind:value={currentKey}
                on:change={(e) => changeKey((e.target as HTMLSelectElement).value)}
              >
                {#each availableKeys as key}
                  <option value={key}>{key}</option>
                {/each}
              </select>
            </div>
            <div class="mode-selector-container">
              <label for="mode-select" class="mode-label">Mode:</label>
              <select 
                id="mode-select" 
                class="mode-select" 
                bind:value={currentKeyType}
                on:change={(e) => changeMode((e.target as HTMLSelectElement).value)}
              >
                {#each availableModes as mode}
                  <option value={mode.value}>{mode.label}</option>
                {/each}
              </select>
            </div>
          </div>
        <div class="scale-chords-grid">
          {#each scaleChords as scaleChord}
            <button 
              class="scale-chord-card"
              on:click={() => {
                const chordData = getChord(scaleChord.chord);
                if (chordData) {
                  currentChordNotes = chordData.root_position;
                  updatePianoDisplay();
                  playChord(chordData.root_position);
                }
              }}
            >
              <div class="scale-chord-roman">{scaleChord.roman}</div>
              <div class="scale-chord-name">{scaleChord.chord}</div>
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
          <p class="progression-description">{currentProgression.description}</p>
          <div class="progression-selector-container">
            <label for="progression-select" class="progression-label">Progression:</label>
            <select 
              id="progression-select" 
              class="progression-select"
              bind:value={currentProgression}
            >
              {#each transposedProgressions as progression, progressionIndex}
                <option value={chordProgressions.filter(p => p.keyType === currentKeyType)[progressionIndex]}>
                  {progression.name}
                </option>
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



  /* Current progression display */
  .current-progression-section {
    padding-bottom: 2rem;
  }

  .current-progression-container {
    max-width: 48rem;
    margin: 0 auto;
    background: var(--color-surface);
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

  .progression-description {
    font-size: 1.125rem;
    color: var(--color-text-secondary);
    margin-bottom: 1.5rem;
    font-style: italic;
  }

  .key-mode-selectors {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    justify-content: center;
    margin-bottom: 2rem;
  }

  .key-selector-container,
  .mode-selector-container,
  .progression-selector-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .key-label,
  .mode-label,
  .progression-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .key-select,
  .mode-select,
  .progression-select {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background: var(--color-surface);
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
  }

  .key-select {
    width: 70px;
  }
  
  .mode-select {
    width: 90px;
  }
  
  .progression-select {
    width: 130px;
  }
  
  .key-select:hover,
  .mode-select:hover,
  .progression-select:hover {
    border-color: var(--color-border-strong);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  .key-select:focus,
  .mode-select:focus,
  .progression-select:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.15);
    transform: translateY(-1px);
  }

  .key-select option,
  .mode-select option,
  .progression-select option {
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
    background: var(--color-surface);
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

  /* Scale chords section */
  .scale-chords-section {
    padding-bottom: 3rem;
  }

  .scale-chords-container {
    max-width: 48rem;
    margin: 0 auto;
    background: var(--color-surface);
    border: 1px solid var(--color-border-light);
    border-radius: 1.5rem;
    padding: 2rem;
    backdrop-filter: blur(20px);
  }

  .scale-chords-title {
    text-align: center;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 1.5rem;
  }

  .scale-chords-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 1rem;
  }

  .scale-chord-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--color-surface);
    border: 2px solid var(--color-border-light);
    border-radius: 1rem;
    padding: 1rem 0.5rem;
    cursor: pointer;
    transition: var(--transition-smooth);
    backdrop-filter: blur(10px);
  }

  .scale-chord-card:hover {
    border-color: var(--color-accent);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    background: rgba(0, 122, 255, 0.05);
  }

  .scale-chord-roman {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--color-accent);
    margin-bottom: 0.25rem;
  }

  .scale-chord-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary);
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


  /* Responsive Design */
  @media (max-width: 768px) {
    .chord-progressions-wrapper {
      padding: 1rem 0;
    }

    .current-progression-container {
      margin: 0 1rem;
      padding: 1.5rem;
    }

    .key-mode-selectors {
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
      align-items: center;
    }

    .key-select {
      width: 100px;
    }
    
    .mode-select {
      width: 100px;
    }
    
    .progression-select {
      min-width: 130px;
    }

    .key-selector-container,
    .mode-selector-container,
    .progression-selector-container {
      align-items: center;
    }

    .scale-chords-container {
      margin: 0 1rem;
      padding: 1.5rem;
    }

    .scale-chords-grid {
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
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
    .current-progression-title {
      font-size: 1.5rem;
    }

    .progression-description {
      font-size: 1rem;
    }

    .chord-name {
      font-size: 1.75rem;
    }

    .chord-roman {
      font-size: 1rem;
    }

    .nav-button {
      width: 2.5rem;
      height: 2.5rem;
    }
    
    .scale-chords-grid {
      grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    }
    
    .scale-chord-card {
      padding: 0.75rem 0.25rem;
    }
    
    .scale-chord-roman {
      font-size: 1rem;
    }
    
    .scale-chord-name {
      font-size: 0.875rem;
    }
    
    .piano-section {
      padding-bottom: 0;
    }
    .piano-container {
      padding: 0;
    }
  }
</style>
