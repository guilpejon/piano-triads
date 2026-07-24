<script lang="ts">
  import Piano from '$lib/components/Piano.svelte';
  import RoundStatus from '$lib/components/RoundStatus.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { playNote, playChord, isAudioReady } from '$lib/utils/audioUtils';
  import {
    loadProgress,
    saveProgress,
    completePracticeSession,
    checkAchievements,
    type UserProgress
  } from '$lib/utils/progressUtils';

  // Reference to Piano component for auto-scroll
  let pianoComponent: Piano;
  import {
    getPracticeChords,
    getChord,
    getNoteNameOnly,
    areNotesEquivalent
  } from '$lib/utils/chordUtils';

  // Training modes
  type TrainingMode = 'note' | 'chord';
  let currentMode: TrainingMode = 'note';

  // Game state
  let gameState: 'waiting' | 'playing' | 'completed' | 'failed' = 'waiting';
  let currentTarget: string = ''; // Current note or chord to identify
  let currentTargetNotes: string[] = []; // Notes for chord mode
  let correctNotesClicked: Set<string> = new Set(); // For chord mode - track found notes
  let incorrectAttempts = 0; // For note mode - track wrong guesses
  let chordMistakes = 0; // For chord mode - track wrong notes
  let timeLeft = 15; // 15 seconds per round
  let timer: number | null = null;

  // Statistics
  let totalRounds = 0;
  let successfulRounds = 0;
  let failedRounds = 0;
  let currentStreak = 0;

  // Progress tracking
  let userProgress: UserProgress;
  let roundStartTime: number;

  // Available notes for note mode (single octave)
  const availableNotes = [
    'C4',
    'C#4',
    'D4',
    'D#4',
    'E4',
    'F4',
    'F#4',
    'G4',
    'G#4',
    'A4',
    'A#4',
    'B4'
  ];

  // Available chords for chord mode - major, minor, maj7, and 7 chords
  let availableChords: string[] = getPracticeChords().filter((chord) => {
    // Include: basic major, basic minor, maj7, and 7 chords
    // Exclude: dim, sus4, 9, 11, etc.
    const isBasicMajor =
      chord.endsWith('M') &&
      !chord.includes('maj') &&
      !chord.includes('9') &&
      !chord.includes('11') &&
      !chord.includes('dim');
    const isBasicMinor =
      chord.endsWith('m') &&
      !chord.includes('7') &&
      !chord.includes('9') &&
      !chord.includes('11') &&
      !chord.includes('dim');
    const ism7 = chord.endsWith('m7');
    const isMaj7 = chord.endsWith('maj7');
    const is7th = chord.endsWith('7') && !chord.includes('maj') && !chord.includes('m7');
    const isValid = isBasicMajor || isBasicMinor || isMaj7 || is7th || ism7;
    return isValid;
  });

  // Reactive accuracy calculation
  $: accuracy = totalRounds > 0 ? Math.round((successfulRounds / totalRounds) * 100) : 0;

  function startNewRound() {
    // Set game state and reset counters
    gameState = 'playing';
    totalRounds++;
    timeLeft = 15;
    incorrectAttempts = 0;
    chordMistakes = 0;
    correctNotesClicked.clear();

    // Track round start time
    roundStartTime = Date.now();

    // Reset piano visual state
    updatePianoDisplay();

    if (currentMode === 'note') {
      // Pick a random note
      currentTarget = availableNotes[Math.floor(Math.random() * availableNotes.length)];
      currentTargetNotes = [currentTarget];
      // Play the note
      setTimeout(() => {
        playNote(currentTarget);
      }, 500);
    } else {
      // Pick a random chord
      currentTarget = availableChords[Math.floor(Math.random() * availableChords.length)];
      const chordData = getChord(currentTarget);
      currentTargetNotes = chordData ? chordData.root_position : [];
      // Play the chord
      setTimeout(() => {
        playChord(currentTargetNotes);
      }, 500);
    }

    startTimer();
  }

  function startTimer() {
    if (timer) clearInterval(timer);

    timer = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        endRound(false);
      }
    }, 1000);
  }

  function endRound(success: boolean) {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }

    if (success) {
      gameState = 'completed';
      successfulRounds++;
      currentStreak++;
    } else {
      gameState = 'failed';
      failedRounds++;
      currentStreak = 0;
    }

    // Update progress tracking for the specific mode
    const roundTime = (Date.now() - roundStartTime) / 1000; // Convert to seconds
    const subModule = currentMode === 'note' ? 'notes' : 'chords';
    userProgress = completePracticeSession(
      userProgress,
      'pitchTraining',
      subModule,
      success,
      roundTime
    );

    // Check for achievements
    userProgress = checkAchievements(userProgress);

    // Save progress
    saveProgress(userProgress);

    if (!success) {
      // Show correct notes in green when failing
      if (currentMode === 'chord') {
        // Only highlight notes that the user didn't find
        currentTargetNotes.forEach((note) => {
          const noteName = getNoteNameOnly(note);
          const wasFound = Array.from(correctNotesClicked).some((clickedNoteName) =>
            areNotesEquivalent(clickedNoteName + '3', noteName + '3')
          );

          if (!wasFound) {
            highlightKey(note, 'practice-success');
          }
        });
      } else if (currentMode === 'note') {
        // Show correct note in green when failing note mode
        highlightKey(currentTarget, 'practice-success');
      }

      // Scroll to show the correct answer on mobile
      setTimeout(() => {
        pianoComponent?.scrollToActiveKey();
      }, 100);
    }

    // Play the target again so user can hear the correct answer
    // Note mode: only play on failure (user already heard their correct click)
    // Chord mode: play on both success and failure for confirmation
    const shouldPlay = !success || currentMode === 'chord';

    if (shouldPlay) {
      // Add delay to avoid overlap with user's key click
      setTimeout(() => {
        if (currentMode === 'note') {
          playNote(currentTarget);
        } else {
          playChord(currentTargetNotes);
        }
      }, 500);
    }
  }

  function handlePianoClick(clickedNote: string) {
    if (gameState !== 'playing') return;

    if (currentMode === 'note') {
      // Check if clicked note matches target exactly (including octave)
      // Handle enharmonic equivalents but require same octave (e.g., C#3 === Db3, but C#3 !== C#4)
      const isCorrect =
        clickedNote === currentTarget ||
        (clickedNote.slice(-1) === currentTarget.slice(-1) && // Same octave
          areNotesEquivalent(clickedNote, currentTarget)); // Same note name (handles enharmonics)

      if (isCorrect) {
        // Correct note - show green feedback
        highlightKey(clickedNote, 'practice-success');
        endRound(true);
      } else {
        // Wrong note - show red feedback and increment attempts
        incorrectAttempts++;
        highlightKey(clickedNote, 'practice-failed');
        playNote(clickedNote); // Play the clicked note for feedback

        // Fail immediately on first incorrect attempt
        if (incorrectAttempts >= 1) {
          endRound(false);
        }
      }
    } else {
      // Chord mode - check if clicked note is part of the target chord
      const clickedNoteName = getNoteNameOnly(clickedNote);
      const isPartOfChord = currentTargetNotes.some((note) =>
        areNotesEquivalent(clickedNote, note)
      );

      if (isPartOfChord) {
        // Correct chord note - add to found notes and show green feedback
        correctNotesClicked.add(clickedNoteName);
        highlightKey(clickedNote, 'practice-success');
        playNote(clickedNote);

        // Check if all chord notes have been found
        const allNotesFound = currentTargetNotes.every((chordNote) => {
          const chordNoteName = getNoteNameOnly(chordNote);
          return Array.from(correctNotesClicked).some((clickedNoteName) =>
            areNotesEquivalent(clickedNoteName + '3', chordNoteName + '3')
          );
        });

        if (allNotesFound) {
          endRound(true);
        }
      } else {
        // Wrong note - show red feedback and increment mistakes
        chordMistakes++;
        highlightKey(clickedNote, 'practice-failed');
        playNote(clickedNote);

        // Remove red highlighting after 800ms
        setTimeout(() => {
          removeKeyHighlight(clickedNote);
        }, 500);

        // Fail after 3 wrong notes
        if (chordMistakes >= 3) {
          endRound(false);
        }
      }
    }
  }

  function replayTarget() {
    if (gameState !== 'playing') return;

    if (currentMode === 'note') {
      playNote(currentTarget);
    } else {
      playChord(currentTargetNotes);
    }
  }

  // Helper function to highlight a specific key and show the note name
  function highlightKey(noteName: string, cssClass: string) {
    const allPianoKeys = document.querySelectorAll('.key[data-note]');

    allPianoKeys.forEach((key) => {
      const dataNote = key.getAttribute('data-note');
      if (dataNote) {
        // Check all possible note names for this key (handles black keys with multiple names)
        const keyNotes = dataNote.split('/');

        // Check if any of the key's notes match our note exactly (same octave)
        const hasExactMatch = keyNotes.some((keyNote) => keyNote === noteName);

        if (hasExactMatch) {
          // Add the specified CSS class
          key.classList.add(cssClass);

          // Show only the specific note name that matches our note
          const noteElements = key.querySelectorAll('.note');
          const noteWithoutOctave = getNoteNameOnly(noteName);

          noteElements.forEach((noteEl) => {
            const noteText = noteEl.textContent?.trim();
            if (noteText) {
              // Show this note label if it's enharmonically equivalent to our note
              if (areNotesEquivalent(noteText + '3', noteWithoutOctave + '3')) {
                (noteEl as HTMLElement).style.display = 'block';
              }
            }
          });
        }
      }
    });
  }

  function removeKeyHighlight(noteName: string) {
    const allPianoKeys = document.querySelectorAll('.key[data-note]');

    allPianoKeys.forEach((key) => {
      const dataNote = key.getAttribute('data-note');
      if (dataNote) {
        // Check all possible note names for this key (handles black keys with multiple names)
        const keyNotes = dataNote.split('/');

        // Check if any of the key's notes match our note exactly (same octave)
        const hasExactMatch = keyNotes.some((keyNote) => keyNote === noteName);

        if (hasExactMatch) {
          // Remove practice-failed class but keep practice-success if it exists
          key.classList.remove('practice-failed');

          // Hide the note name only if this key is not currently highlighted as correct
          if (!key.classList.contains('practice-success')) {
            const noteElements = key.querySelectorAll('.note');
            noteElements.forEach((noteEl) => {
              (noteEl as HTMLElement).style.display = 'none';
            });
          }
        }
      }
    });
  }

  // Function to reset piano display
  function updatePianoDisplay() {
    // Reset all keys
    const allKeys = document.querySelectorAll('.key');
    const allNotes = document.querySelectorAll('.note');

    allKeys.forEach((key) => {
      key.classList.remove('practice-failed', 'practice-success');
    });

    // Hide all notes
    allNotes.forEach((note) => {
      (note as HTMLElement).style.display = 'none';
    });
  }

  // Function to show note names for the current chord
  function showChordNotes() {
    currentTargetNotes.forEach((noteName) => {
      const noteNameWithoutOctave = getNoteNameOnly(noteName);

      const allKeys = document.querySelectorAll('.key[data-note]');
      allKeys.forEach((key) => {
        const dataNote = key.getAttribute('data-note');
        if (dataNote && dataNote.includes(noteName)) {
          // Show the specific note name that matches our chord
          const noteElements = key.querySelectorAll('.note');
          noteElements.forEach((noteEl) => {
            if (noteEl.textContent && noteEl.textContent.trim() === noteNameWithoutOctave) {
              (noteEl as HTMLElement).style.display = 'block';
            }
          });
        }
      });
    });
  }

  function switchMode(mode: TrainingMode) {
    currentMode = mode;
    gameState = 'waiting';
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    correctNotesClicked.clear();

    // Load stats for the new mode from progress
    if (userProgress) {
      const pitchStats =
        currentMode === 'note'
          ? userProgress.modules.pitchTraining.notes
          : userProgress.modules.pitchTraining.chords;
      totalRounds = pitchStats.totalRounds;
      successfulRounds = pitchStats.successfulRounds;
      failedRounds = pitchStats.failedRounds;
      currentStreak = pitchStats.currentStreak;
    } else {
      // Fallback if progress not loaded yet
      totalRounds = 0;
      successfulRounds = 0;
      failedRounds = 0;
      currentStreak = 0;
    }

    // Clear piano visual feedback when switching modes
    updatePianoDisplay();
  }

  onMount(() => {
    // Load user progress
    userProgress = loadProgress();

    // Load existing stats from progress based on current mode
    const pitchStats =
      currentMode === 'note'
        ? userProgress.modules.pitchTraining.notes
        : userProgress.modules.pitchTraining.chords;
    totalRounds = pitchStats.totalRounds;
    successfulRounds = pitchStats.successfulRounds;
    failedRounds = pitchStats.failedRounds;
    currentStreak = pitchStats.currentStreak;
    // Add event listeners to piano keys for click detection
    const handleKeyClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const key = target.closest('.key') as HTMLElement;
      if (!key) return;

      const noteData = key.getAttribute('data-note');
      if (!noteData) return;

      // Handle enharmonic notes (e.g., "C#3/Db3")
      const allNotes = noteData.split('/');

      // Use the first note name for simplicity
      handlePianoClick(allNotes[0]);
    };

    // Add click listeners to all piano keys
    setTimeout(() => {
      const pianoKeys = document.querySelectorAll('.key');
      pianoKeys.forEach((key) => {
        key.addEventListener('click', handleKeyClick);
      });
    }, 100);

    return () => {
      const pianoKeys = document.querySelectorAll('.key');
      pianoKeys.forEach((key) => {
        key.removeEventListener('click', handleKeyClick);
      });
    };
  });

  onDestroy(() => {
    if (timer) {
      clearInterval(timer);
    }
  });
</script>



<div class="pitch-training-wrapper">
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
        <h1 class="main-title">Pitch Practice</h1>
        <p class="page-description">
          {#if currentMode === 'note'}
            Identify the note by clicking its corresponding key
          {:else}
            Identify the chord by clicking all its notes
          {/if}
        </p>
      </div>
    </header>

    <!-- Mode Selection -->
    <section class="mode-section">
      <div class="mode-container">
        <button
          class="mode-button note-mode"
          class:active={currentMode === 'note'}
          on:click={() => switchMode('note')}
        >
          Notes
        </button>
        <button
          class="mode-button chord-mode"
          class:active={currentMode === 'chord'}
          on:click={() => switchMode('chord')}
        >
          Chords
        </button>
      </div>
    </section>

    <!-- Game Section -->
    <section class="game-section">
      <div class="game-container">
        <!-- Game Header -->
        {#if gameState !== 'waiting'}
          <div class="game-header">
            {#if gameState === 'completed' || gameState === 'failed'}
              <div class="note-reveal">
                <div
                  class="note-display"
                  class:success={gameState === 'completed'}
                  class:failed={gameState === 'failed'}
                >
                  {currentTarget}
                </div>
              </div>
            {/if}
            {#if gameState === 'playing'}
              <div class="game-info">
                <div class="info-item">
                  <div class="info-label">Time Left</div>
                  <div class="info-value timer">{timeLeft}s</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Mistakes</div>
                  <div class="info-value mistakes">
                    {#if currentMode === 'note'}
                      {incorrectAttempts}/1
                    {:else}
                      {chordMistakes}/3
                    {/if}
                  </div>
                </div>
                <div class="info-item replay-item">
                  <button on:click={replayTarget} class="replay-button" aria-label="Play audio">
                    <svg class="replay-icon" fill="currentColor" stroke="none" viewBox="0 0 24 24">
                      <polygon points="8,5 19,12 8,19" />
                    </svg>
                  </button>
                </div>
              </div>
            {/if}
          </div>
        {/if}

        <RoundStatus
          state={gameState}
          successText="Correct — that was {currentTarget}"
          failText="Incorrect — that was {currentTarget}"
        />
      </div>
    </section>

    <!-- Controls Section -->
    {#if gameState === 'waiting' || gameState === 'completed' || gameState === 'failed'}
      <section class="controls-section">
        <div class="controls-container">
          <button on:click={startNewRound} class="game-button primary"> Start New Round </button>
        </div>
      </section>
    {/if}
    <!-- Piano Section -->
    <section class="piano-section">
      <div class="piano-container">
        <Piano bind:this={pianoComponent} chordNotes={currentTargetNotes} stickyOnMobile={true} showOctaveMarkers={true} />
      </div>
    </section>

    <!-- Statistics Section -->
    {#if totalRounds > 0}
      <section class="stats-section">
        <div class="stats-container">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{totalRounds}</div>
              <div class="stat-label">Rounds</div>
            </div>
            <div class="stat-item">
              <div class="stat-value correct">{successfulRounds}</div>
              <div class="stat-label">Correct</div>
            </div>
            <div class="stat-item">
              <div class="stat-value incorrect">{failedRounds}</div>
              <div class="stat-label">Wrong</div>
            </div>
            <div class="stat-item">
              <div class="stat-value streak">{currentStreak}</div>
              <div class="stat-label">Streak</div>
            </div>
          </div>
        </div>
      </section>
    {/if}
  </div>
</div>

<style>
  /* Base styles consistent with chord practice */
  .pitch-training-wrapper {
    min-height: 90vh;
    background: var(--gradient-bg);
    padding: 2rem 0;
  }

  /* Navigation */

  /* Header */
  .header-section {
    text-align: center;
    padding-bottom: 2rem;
  }

  /* Mode Selection */
  .mode-section {
    padding-bottom: 2rem;
  }
  .mode-container {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .mode-button {
    padding: 0.75rem 2rem;
    border: 2px solid var(--color-border-medium);
    border-radius: 0.75rem;
    background: var(--color-surface);
    color: var(--color-text-primary);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-smooth);
    backdrop-filter: blur(10px);
  }

  .mode-button.active {
    background: var(--gradient-blue);
    border-color: transparent;
    color: white;
    box-shadow: var(--shadow-md);
  }

  .mode-button:hover:not(.active) {
    background: var(--color-surface-solid);
    transform: translateY(-1px);
  }

  /* Note Mode - subtle green tint */
  .mode-button.note-mode:not(.active) {
    background: color-mix(in srgb, #22c55e 10%, var(--color-surface));
    border-color: rgba(34, 197, 94, 0.2);
  }

  .mode-button.note-mode:hover:not(.active) {
    background: color-mix(in srgb, #22c55e 16%, var(--color-surface-solid));
    border-color: rgba(34, 197, 94, 0.3);
  }

  .mode-button.note-mode.active {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    border-color: transparent;
    color: white;
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
  }

  /* Chord Mode - orange/red tint for difficulty */
  .mode-button.chord-mode:not(.active) {
    background: color-mix(in srgb, #f97316 10%, var(--color-surface));
    border-color: rgba(249, 115, 22, 0.2);
  }

  .mode-button.chord-mode:hover:not(.active) {
    background: color-mix(in srgb, #f97316 16%, var(--color-surface-solid));
    border-color: rgba(249, 115, 22, 0.3);
  }

  .mode-button.chord-mode.active {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    border-color: transparent;
    color: white;
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  }

  /* Game Section */
  .game-container {
    max-width: 48rem;
    margin: 0 auto;
  }

  .game-header {
    text-align: center;
    margin-bottom: 0;
  }

  .game-info {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;
    margin-top: 2rem;
    flex-wrap: wrap;
  }

  .info-item {
    text-align: center;
    padding: 1rem 1.5rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border-light);
    border-radius: 1rem;
    backdrop-filter: blur(20px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .info-item:not(.replay-item) {
    min-width: 100px;
    max-width: 120px;
  }

  .info-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin-bottom: 0.25rem;
  }

  .info-value {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .info-value.timer {
    color: var(--color-accent);
  }

  .info-value.mistakes {
    color: #ef4444;
  }

  .replay-item {
    background: transparent;
    border: none;
    padding: 0;
    backdrop-filter: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .replay-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 4rem;
    height: 4rem;
    background: var(--gradient-blue);
    color: white;
    border: 1px solid var(--color-accent);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(20px);
    box-shadow: 0 2px 8px rgba(0, 122, 255, 0.2);
  }

  .replay-button:hover {
    background: var(--color-accent-hover);
    border-color: var(--color-accent-hover);
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
  }

  .replay-button:active {
    background: var(--color-accent);
    transform: scale(0.98);
    box-shadow: 0 2px 6px rgba(0, 122, 255, 0.4);
  }

  .replay-icon {
    width: 2.5rem;
    height: 2.5rem;
    stroke-width: 2;
    opacity: 0.8;
  }

  /* Piano Section */
  .piano-section {
    padding-bottom: 2rem;
    padding-top: 2rem;
  }

  .piano-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
  }

  /* Controls */
  .controls-section {
    padding-top: 3rem;
  }

  .controls-container {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .game-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 2rem;
    border: 2px solid transparent;
    border-radius: 0.75rem;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    text-decoration: none;
    transition: var(--transition-smooth);
    min-width: 140px;
    justify-content: center;
  }

  .game-button.primary {
    background: var(--gradient-blue);
    color: white;
    border: 1px solid transparent;
  }

  .game-button.primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .game-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Statistics section */
  .stats-section {
    padding-bottom: 2rem;
  }

  .stats-container {
    max-width: 32rem;
    margin: 0 auto;
    padding: 2rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border-light);
    border-radius: 1.5rem;
    backdrop-filter: blur(20px);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    text-align: center;
  }

  .stat-item {
    padding: 1rem;
    border-radius: 0.75rem;
    background: rgba(0, 0, 0, 0.02);
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }

  .stat-value.correct {
    color: #10b981;
  }

  .stat-value.incorrect {
    color: #ef4444;
  }

  .stat-value.streak {
    color: #8b5cf6;
  }

  .stat-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .mode-container {
      flex-direction: row;
      justify-content: center;
      gap: 0.75rem;
    }

    .mode-button {
      flex: 1;
      max-width: 140px;
    }

    .piano-container {
      padding: 1rem;
    }

    .piano-section {
      padding-bottom: 1.5rem;
    }

    .stats-section {
      padding-bottom: 1rem;
    }

    .stats-container {
      padding: 1.5rem;
      margin: 0 1rem;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .game-info {
      gap: 1rem;
      margin-top: 1.5rem;
      justify-content: center;
      align-items: center;
    }

    .info-item {
      padding: 0.5rem 1rem;
      min-width: 120px;
    }

    .info-item:not(.replay-item) {
      min-width: 80px;
      max-width: 100px;
    }

    .replay-button {
      width: 2.5rem;
      height: 2.5rem;
    }

    .replay-icon {
      width: 1.25rem;
      height: 1.25rem;
    }
  }

  @media (max-width: 480px) {
    .pitch-training-wrapper {
      padding: 1.5rem 0;
    }

    .controls-section {
      padding: 0;
    }

    .note-display {
      padding: 0.6rem 1rem;
      min-width: 80px;
      padding-bottom: 2.5rem !important;
    }

    .piano-section {
      padding: 0;
    }

    .piano-container {
      padding-bottom: 2rem;
    }

    .mode-section {
      padding-bottom: 0.5rem;
    }

    .controls-container {
      flex-direction: column;
      align-items: center;
    }

    .game-button {
      width: 100%;
      max-width: 280px;
    }

    .stat-value {
      font-size: 1.5rem;
    }

    .game-info {
      flex-direction: row;
      justify-content: center;
      gap: 1rem;
      margin-top: 1rem;
    }

    .info-item {
      padding: 0.5rem 0.75rem;
      min-width: 100px;
      flex: 0 0 auto;
    }

    .info-item:not(.replay-item) {
      min-width: 80px;
      max-width: 100px;
    }

    .info-label {
      font-size: 0.75rem;
    }

    .info-value {
      font-size: 1rem;
    }

    .replay-button {
      width: 3.25rem;
      height: 3.25rem;
    }

    .replay-icon {
      width: 1.75rem;
      height: 1.75rem;
    }
  }

  /* Extra small screens */
  @media (max-width: 360px) {
    .stats-grid {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }
  }


  /* Blurred note display */
  .note-reveal {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0;
    position: relative;
  }

  .note-display {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 800;
    color: var(--color-accent);
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 1rem 2rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.2);
    min-width: 120px;
    text-align: center;
  }

  .note-display.success {
    color: #4caf50;
  }

  .note-display.failed {
    color: #f44336;
  }

  @media (max-width: 768px) {
    .note-display {
      font-size: 2.5rem;
      padding: 0.8rem 1.5rem;
      min-width: 100px;
    }
  }
</style>
