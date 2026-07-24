<script lang="ts">
  import Piano from '$lib/components/Piano.svelte';
  import MusicScore from '$lib/components/MusicScore.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { playNote, preloadAudio } from '$lib/utils/audioUtils';
  import {
    loadProgress,
    saveProgress,
    completePracticeSession,
    checkAchievements,
    type UserProgress
  } from '$lib/utils/progressUtils';
  import { getNoteNameOnly, areNotesEquivalent } from '$lib/utils/chordUtils';

  // Reference to Piano component for auto-scroll
  let pianoComponent: Piano;

  // Always use both clefs (entire piano range)
  const currentClefMode = 'both';

  // Game state
  let gameState: 'waiting' | 'playing' | 'completed' | 'failed' = 'waiting';
  let currentTarget: string = ''; // Current note to identify
  let currentScoreNotes: string[] = []; // Notes to display on score
  let incorrectAttempts = 0;
  let timeLeft = 20; // 20 seconds per round
  let timer: number | null = null;
  let showCorrectAnswer = false;

  // Statistics
  let totalRounds = 0;
  let successfulRounds = 0;
  let failedRounds = 0;
  let currentStreak = 0;

  // Progress tracking
  let userProgress: UserProgress;
  let roundStartTime: number;

  // Available notes for extended piano range (C2-C6 including accidentals)
  const allNotes = [
    // Octave 2
    'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2',
    // Octave 3
    'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
    // Octave 4
    'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
    // Octave 5
    'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5',
    // Octave 6
    'C6'
  ];

  // Reactive accuracy calculation
  $: accuracy = totalRounds > 0 ? Math.round((successfulRounds / totalRounds) * 100) : 0;

  function getAvailableNotes(): string[] {
    return allNotes;
  }

  function startNewRound() {
    gameState = 'playing';
    totalRounds++;
    timeLeft = 20;
    incorrectAttempts = 0;
    showCorrectAnswer = false;
    roundStartTime = Date.now();

    // Reset piano visual state
    updatePianoDisplay();

    // Pick a random note based on current clef mode
    const availableNotes = getAvailableNotes();
    currentTarget = availableNotes[Math.floor(Math.random() * availableNotes.length)];
    currentScoreNotes = [currentTarget];

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
      showCorrectAnswer = true;

      // Show correct answer on piano
      highlightKey(currentTarget, 'practice-success');

      // Scroll to show the correct answer on mobile
      setTimeout(() => {
        pianoComponent?.scrollToActiveKey();
      }, 100);
    }

    // Update progress tracking
    const roundTime = (Date.now() - roundStartTime) / 1000;
    const subModule = `${currentClefMode}Clef` as 'trebleClef' | 'bassClef' | 'bothClef';
    userProgress = completePracticeSession(
      userProgress,
      'musicReading',
      subModule,
      success,
      roundTime
    );

    // Check for achievements
    userProgress = checkAchievements(userProgress);

    // Save progress
    saveProgress(userProgress);
  }

  function handlePianoClick(clickedNote: string) {
    if (gameState !== 'playing') return;

    // Check if clicked note matches target (handle enharmonic equivalents)
    const isCorrect =
      clickedNote === currentTarget ||
      (clickedNote.slice(-1) === currentTarget.slice(-1) && // Same octave
        areNotesEquivalent(clickedNote, currentTarget)); // Same note name

    if (isCorrect) {
      // Correct note - show green feedback and play the key sound
      highlightKey(clickedNote, 'practice-success');
      playNote(clickedNote);
      endRound(true);
    } else {
      // Wrong note - show red feedback and increment attempts
      incorrectAttempts++;
      highlightKey(clickedNote, 'practice-failed');
      playNote(clickedNote);

      // Remove red highlighting after a short delay
      setTimeout(() => {
        removeKeyHighlight(clickedNote);
      }, 800);

      // Fail after 3 incorrect attempts
      if (incorrectAttempts >= 3) {
        endRound(false);
      }
    }
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

          // Show the note name
          const noteElements = key.querySelectorAll('.note');
          const noteWithoutOctave = getNoteNameOnly(noteName);

          noteElements.forEach((noteEl) => {
            const noteText = noteEl.textContent?.trim();
            if (noteText && areNotesEquivalent(noteText + '3', noteWithoutOctave + '3')) {
              (noteEl as HTMLElement).style.display = 'block';
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
        const keyNotes = dataNote.split('/');
        const hasExactMatch = keyNotes.some((keyNote) => keyNote === noteName);

        if (hasExactMatch) {
          key.classList.remove('practice-failed');

          // Hide note name if not highlighted as correct
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

  function updatePianoDisplay() {
    // Reset all keys
    const allKeys = document.querySelectorAll('.key');
    const allNotes = document.querySelectorAll('.note');

    allKeys.forEach((key) => {
      key.classList.remove('practice-failed', 'practice-success');
    });

    // Hide all note names
    allNotes.forEach((note) => {
      (note as HTMLElement).style.display = 'none';
    });
  }

  onMount(() => {
    // Load user progress
    userProgress = loadProgress();

    // Preload audio for extended piano range
    preloadAudio('extended');

    // Initialize progress structure if needed
    if (!userProgress.modules.musicReading) {
      userProgress.modules.musicReading = {
        trebleClef: {
          totalRounds: 0,
          successfulRounds: 0,
          failedRounds: 0,
          currentStreak: 0,
          bestStreak: 0,
          averageTime: 0,
          lastPlayed: new Date().toISOString()
        },
        bassClef: {
          totalRounds: 0,
          successfulRounds: 0,
          failedRounds: 0,
          currentStreak: 0,
          bestStreak: 0,
          averageTime: 0,
          lastPlayed: new Date().toISOString()
        },
        bothClef: {
          totalRounds: 0,
          successfulRounds: 0,
          failedRounds: 0,
          currentStreak: 0,
          bestStreak: 0,
          averageTime: 0,
          lastPlayed: new Date().toISOString()
        },
        lastMode: 'both' as const,
        lastPlayed: new Date().toISOString()
      };
      saveProgress(userProgress);
    }

    // Load existing stats from progress
    const currentModeStats = userProgress.modules.musicReading[`${currentClefMode}Clef`];
    totalRounds = currentModeStats.totalRounds;
    successfulRounds = currentModeStats.successfulRounds;
    failedRounds = currentModeStats.failedRounds;
    currentStreak = currentModeStats.currentStreak;

    // Add event listeners to piano keys
    const handleKeyClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const key = target.closest('.key') as HTMLElement;
      if (!key) return;

      const noteData = key.getAttribute('data-note');
      if (!noteData) return;

      const allNotes = noteData.split('/');
      handlePianoClick(allNotes[0]);
    };

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

<div class="music-reading-wrapper">
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
        <h1 class="main-title">Music Score Practice</h1>
        <p class="page-description">
          Read music notation and identify the corresponding piano keys quickly and accurately
        </p>
      </div>
    </header>

    <!-- Game Section -->
    <section class="game-section">
      <div class="game-container">
        {#if gameState !== 'waiting'}
          <!-- Music Score Display -->
          <div class="score-display">
            <MusicScore 
              activeNotes={currentScoreNotes} 
              chordName="" 
              chordToneRule="" 
            />
          </div>

          <!-- Game Info -->
          <div class="game-header">
            {#if gameState === 'playing'}
              <div class="game-info">
                <div class="info-item">
                  <div class="info-label">Time Left</div>
                  <div class="info-value timer">{timeLeft}s</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Mistakes</div>
                  <div class="info-value mistakes">{incorrectAttempts}/3</div>
                </div>

              </div>
            {:else if gameState === 'completed'}
              <div class="result-display success">
                <div class="result-icon">✓</div>
                <div class="result-text">Correct!</div>
                <div class="result-note">{currentTarget}</div>
              </div>
            {:else if gameState === 'failed'}
              <div class="result-display failed">
                <div class="result-icon">✗</div>
                <div class="result-text">Correct answer:</div>
                <div class="result-note">{currentTarget}</div>
              </div>
            {/if}
          </div>
        {/if}

        <!-- The result above is already glyph-plus-text, but it mounts and unmounts with the
             round, so it is not reliably announced. This region is always present. -->
        <div class="sr-only" role="status" aria-live="polite">
          {#if gameState === 'completed'}
            Correct. The note was {currentTarget}.
          {:else if gameState === 'failed'}
            Incorrect. The note was {currentTarget}.
          {/if}
        </div>
      </div>
    </section>

    <!-- Controls Section -->
    {#if gameState === 'waiting' || gameState === 'completed' || gameState === 'failed'}
      <section class="controls-section">
        <div class="controls-container">
          <button on:click={startNewRound} class="game-button primary">
            {gameState === 'waiting' ? 'Start Practice' : 'Next Round'}
          </button>
        </div>
      </section>
    {/if}

    <!-- Piano Section -->
    <section class="piano-section">
      <div class="piano-container">
        <Piano bind:this={pianoComponent} keyRange="extended" chordNotes={showCorrectAnswer ? currentScoreNotes : []} stickyOnMobile={true} showOctaveMarkers={true} />
      </div>
    </section>

    <!-- Statistics Section -->
    {#if totalRounds > 0}
      <section class="stats-section">
        <div class="stats-container">
          <h2 class="stats-title">Practice Stats</h2>
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
              <div class="stat-value">{accuracy}%</div>
              <div class="stat-label">Accuracy</div>
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
  .controls-section {
    padding-bottom: 2.5rem;
  }

  .music-reading-wrapper {
    min-height: calc(90vh - 4rem);
    padding: 2rem 0;
  }

  /* Game Section */
  .game-container {
    max-width: 48rem;
    margin: 0 auto;
  }

  .score-display {
    margin-bottom: 2rem;
    display: flex;
    justify-content: center;
  }

  .game-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .game-info {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;
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
    min-width: 100px;
  }

  .info-item {
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

  /* Result Display */
  .result-display {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    border-radius: 1rem;
    background: var(--color-surface);
    backdrop-filter: blur(20px);
    border: 1px solid var(--color-border-light);
    justify-content: center;
  }

  .result-icon {
    font-size: 2rem;
    font-weight: bold;
  }

  .result-display.success .result-icon {
    color: #22c55e;
  }

  .result-display.failed .result-icon {
    color: #ef4444;
  }

  .result-text {
    font-size: 1rem;
    font-weight: 500;
    color: var(--color-text-secondary);
  }

  .result-note {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .controls-container {
    display: flex;
    justify-content: center;
  }

  .game-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 2rem;
    border: none;
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
  }

  .game-button.primary:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  /* Piano styles handled in app.css */

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

  .stats-title {
    text-align: center;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 1.5rem;
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

    /* Piano responsive styles handled in app.css */

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
    }

    .info-item {
      padding: 0.75rem 1rem;
      min-width: 80px;
    }
  }

  @media (max-width: 480px) {
    .music-reading-wrapper {
      padding: 1.5rem 0;
    }

    .stats-grid {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .stat-value {
      font-size: 1.5rem;
    }
  }
</style>
