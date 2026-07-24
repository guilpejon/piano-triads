<script lang="ts">
  import Piano from '$lib/components/Piano.svelte';
  import RoundStatus from '$lib/components/RoundStatus.svelte';
  import { onMount, onDestroy } from 'svelte';

  // Reference to Piano component for auto-scroll
  let pianoComponent: Piano;
  import {
    getChord,
    getPracticeChords,
    getNoteNameOnly,
    areNotesEquivalent,
    normalizeNoteName,
    areAllChordNotesClicked,
    getChordToneRule
  } from '$lib/utils/chordUtils';
  import { playChord } from '$lib/utils/audioUtils';
  import {
    loadProgress,
    saveProgress,
    completePracticeSession,
    pickWeightedItem,
    recordItemResult,
    checkAchievements,
    getNewAchievements,
    DIFFICULTY_SETTINGS,
    type Difficulty,
    type UserProgress
  } from '$lib/utils/progressUtils';
  import DifficultyPicker from '$lib/components/DifficultyPicker.svelte';
  import {
    celebrateAchievement,
    celebrateStreak,
    celebrateRecord,
    isStreakMilestone
  } from '$lib/stores/celebrationStore';
  import { fireConfetti } from '$lib/utils/confetti';

  // Game state
  let gameState: 'waiting' | 'playing' | 'completed' | 'failed' = 'waiting';
  let currentChord: string = '';
  let currentChordNotes: string[] = [];
  let correctNotesClicked: Set<string> = new Set();
  let mistakes = 0;
  let timeLeft = 30; // 30 seconds per round
  let timer: number | null = null;

  // Statistics
  let totalRounds = 0;
  let successfulRounds = 0;
  let failedRounds = 0;
  let currentStreak = 0;

  // Progress tracking
  let userProgress: UserProgress;
  let roundStartTime: number;

  // Get all available chords for practice
  let availableChords: string[] = getPracticeChords();

  // Difficulty (shared across practice modes via progress preferences)
  let difficulty: Difficulty = 'standard';
  $: difficultySettings = DIFFICULTY_SETTINGS[difficulty].chordPractice;

  // Practice mode: 'timed' is the classic per-round game; 'survival' shares 3 lives across
  // rounds — every wrong key or timeout costs one — and counts chords built until they run out.
  type PracticeMode = 'timed' | 'survival';
  let practiceMode: PracticeMode = 'timed';
  const SURVIVAL_LIVES = 3;
  let lives = SURVIVAL_LIVES;
  let survivalScore = 0;
  let survivalOver = false;
  let beatBestThisRun = false;

  $: survivalBest = userProgress?.bestSurvival?.chordPractice || 0;

  function setPracticeMode(next: PracticeMode) {
    if (gameState === 'playing' || practiceMode === next) return;
    practiceMode = next;
    resetSurvivalRun();
  }

  function resetSurvivalRun() {
    lives = SURVIVAL_LIVES;
    survivalScore = 0;
    survivalOver = false;
    beatBestThisRun = false;
  }

  function setDifficulty(next: Difficulty) {
    difficulty = next;
    if (userProgress) {
      userProgress = {
        ...userProgress,
        preferences: { ...userProgress.preferences, difficulty: next }
      };
      saveProgress(userProgress);
    }
  }

  // Reactive chord name display - just show the chord as it is from chordUtils
  $: chordDisplayName = currentChord || '';

  // Extract chord type from current chord for tone rule calculation
  $: currentChordType = (() => {
    if (!currentChord) return '';
    // Extract everything after the root note (e.g., "C#m7" -> "m7", "FM" -> "M")
    const match = currentChord.match(/^[A-G][#b]?(.*)$/);
    return match ? match[1] : '';
  })();

  // Reactive calculation of chord tone rule using centralized function
  $: chordToneRule = getChordToneRule(currentChordType);

  // Reactive calculation of found notes count for progress display
  $: foundNotesCount = (() => {
    if (!currentChordNotes.length || !correctNotesClicked.size) return 0;
    const clickedNoteNames = Array.from(correctNotesClicked).map((note) => getNoteNameOnly(note));
    const chordNoteNames = currentChordNotes.map((note) => getNoteNameOnly(note));
    return chordNoteNames.filter((chordNoteName) =>
      clickedNoteNames.some((clickedNoteName) =>
        areNotesEquivalent(clickedNoteName + '3', chordNoteName + '3')
      )
    ).length;
  })();

  // Function to start a new round
  function startNewRound() {
    // A finished survival run starts over from full lives
    if (practiceMode === 'survival' && survivalOver) {
      resetSurvivalRun();
    }

    // Reset game state
    gameState = 'playing';
    mistakes = 0;
    timeLeft = difficultySettings.seconds;
    correctNotesClicked.clear();

    // Track round start time
    roundStartTime = Date.now();

    // Select random chord
    // Weighted toward the chords being missed, rather than uniform.
    currentChord = pickWeightedItem(userProgress, 'chordPractice', availableChords, currentChord);
    const chord = getChord(currentChord);
    currentChordNotes = chord ? chord.root_position : [];

    // Clear piano display
    updatePianoDisplay();

    // Start timer
    startTimer();

    totalRounds++;
  }

  // Timer function
  function startTimer() {
    if (timer) clearInterval(timer);

    timer = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        // In survival, running out of time costs a life; the run ends when they're gone
        if (practiceMode === 'survival') {
          lives--;
          if (lives <= 0) survivalOver = true;
        }
        endRound(false); // Time ran out
      }
    }, 1000);
  }

  // Function to end the current round
  function endRound(success: boolean) {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }

    if (success) {
      gameState = 'completed';
      successfulRounds++;
      currentStreak++;
      // Play the complete chord so user can hear what it sounds like
      playChord(currentChordNotes);

      if (practiceMode === 'survival') {
        survivalScore++;
        // Persist a new best as soon as it happens, so leaving mid-run can't lose it
        if (userProgress && survivalScore > (userProgress.bestSurvival?.chordPractice || 0)) {
          const previousBest = userProgress.bestSurvival?.chordPractice || 0;
          userProgress = {
            ...userProgress,
            bestSurvival: { ...userProgress.bestSurvival, chordPractice: survivalScore }
          };
          if (!beatBestThisRun && previousBest > 0) {
            beatBestThisRun = true;
            celebrateRecord(`${survivalScore} chords in one survival run`);
            fireConfetti();
          }
        }
      }
    } else {
      gameState = 'failed';
      failedRounds++;
      currentStreak = 0; // Reset streak on failure
      // Show correctly clicked notes in blue and missed notes in red
      updatePianoDisplay(false, false, true);
      // Play the complete chord so user can hear what the correct answer sounds like
      playChord(currentChordNotes);
    }

    // Update progress tracking
    const roundTime = (Date.now() - roundStartTime) / 1000; // Convert to seconds
    userProgress = recordItemResult(userProgress, 'chordPractice', currentChord, success);
    userProgress = completePracticeSession(userProgress, 'chordPractice', null, success, roundTime);

    // Check for achievements
    const progressBeforeCheck = userProgress;
    userProgress = checkAchievements(userProgress);

    // Save progress
    saveProgress(userProgress);

    // Celebrate new unlocks and in-session streak milestones
    for (const achievement of getNewAchievements(progressBeforeCheck, userProgress)) {
      celebrateAchievement(achievement);
      fireConfetti();
    }
    if (success && isStreakMilestone(currentStreak)) {
      celebrateStreak(currentStreak);
      fireConfetti();
    }

    // Scroll to show the correct answer on mobile (only on failure)
    if (!success) {
      setTimeout(() => {
        pianoComponent?.scrollToActiveKey();
      }, 100);
    }
  }

  // Function to find matching chord note for clicked note
  function findMatchingChordNote(clickedNote: string): string | null {
    for (const chordNote of currentChordNotes) {
      // Allow any octave of the chord note to count as correct
      if (areNotesEquivalent(clickedNote, chordNote)) {
        return chordNote;
      }
    }
    return null;
  }

  // Function to handle piano key clicks
  function handlePianoClick(event: CustomEvent<string>) {
    if (gameState !== 'playing') return;

    const clickedNote = event.detail;

    // Find if this clicked note matches any chord note (accounting for octaves and enharmonics)
    const matchingChordNote = findMatchingChordNote(clickedNote);

    if (matchingChordNote) {
      // Correct note clicked - add the clicked note (not the chord note) so the right key turns green
      correctNotesClicked.add(clickedNote);
      updatePianoDisplay();

      // Check if all chord notes have been clicked
      if (areAllChordNotesClicked(correctNotesClicked, currentChordNotes)) {
        endRound(true); // Success!
      }
    } else {
      // Incorrect note clicked - show red feedback
      highlightKey(clickedNote, 'practice-failed');

      // Remove red highlighting after 500ms
      setTimeout(() => {
        removeKeyHighlight(clickedNote);
      }, 500);

      if (practiceMode === 'survival') {
        // Survival has no per-round mistake cap; every wrong key costs a shared life
        lives--;
        if (lives <= 0) {
          survivalOver = true;
          endRound(false);
        }
      } else {
        mistakes++;
        if (mistakes >= difficultySettings.mistakes) {
          endRound(false); // Too many mistakes
        }
      }
    }
  }

  // Function to update piano display
  function updatePianoDisplay(
    showAllCorrect = false,
    showAsFailed = false,
    showMixedFeedback = false
  ) {
    // Reset all keys
    const allKeys = document.querySelectorAll('.key');
    const allNotes = document.querySelectorAll('.note');

    allKeys.forEach((key) => {
      key.classList.remove(
        'chord-active',
        'practice-correct',
        'practice-failed',
        'practice-success'
      );
    });

    allNotes.forEach((note) => {
      (note as HTMLElement).style.display = 'none';
    });

    if (showMixedFeedback) {
      // Special case: show correctly clicked notes in blue, missed notes in red
      const clickedNotes = Array.from(correctNotesClicked);
      const missedNotes = currentChordNotes.filter((chordNote) => {
        // Check if this chord note was clicked by comparing note names (ignoring octave)
        const chordNoteName = getNoteNameOnly(chordNote);
        return !clickedNotes.some((clickedNote) => {
          const clickedNoteName = getNoteNameOnly(clickedNote);
          return areNotesEquivalent(clickedNoteName + '3', chordNoteName + '3');
        });
      });

      // Show correctly clicked notes in green
      clickedNotes.forEach((chordNoteName) => {
        highlightKey(chordNoteName, 'practice-success');
      });

      // Show missed notes in red
      missedNotes.forEach((chordNoteName) => {
        highlightKey(chordNoteName, 'practice-failed');
      });
    } else {
      // Original logic for other cases
      const notesToHighlight = showAllCorrect ? currentChordNotes : Array.from(correctNotesClicked);

      // Highlight correct notes that have been clicked (or all if showing solution)
      notesToHighlight.forEach((chordNoteName) => {
        highlightKey(chordNoteName, showAsFailed ? 'practice-failed' : 'practice-success');
      });
    }
  }

  // Helper function to highlight a specific key and show the correct note name
  function highlightKey(chordNoteName: string, cssClass: string) {
    const allPianoKeys = document.querySelectorAll('.key[data-note]');

    allPianoKeys.forEach((key) => {
      const dataNote = key.getAttribute('data-note');
      if (dataNote) {
        // Check all possible note names for this key (handles black keys with multiple names)
        const keyNotes = dataNote.split('/');

        // Check if any of the key's notes match our chord note exactly (same octave)
        const hasExactMatch = keyNotes.some((keyNote) => keyNote === chordNoteName);

        if (hasExactMatch) {
          // Add the specified CSS class
          key.classList.add(cssClass);

          // Show only the specific note name that matches our chord note
          const noteElements = key.querySelectorAll('.note');
          const chordNoteWithoutOctave = getNoteNameOnly(chordNoteName);

          noteElements.forEach((noteEl) => {
            const noteText = noteEl.textContent?.trim();
            if (noteText) {
              // Show this note label if it's enharmonically equivalent to our chord note
              if (areNotesEquivalent(noteText + '3', chordNoteWithoutOctave + '3')) {
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

  // Setup piano click listener
  onMount(() => {
    // Load user progress
    userProgress = loadProgress();
    difficulty = userProgress.preferences?.difficulty ?? 'standard';

    // Load existing stats from progress
    const chordStats = userProgress.modules.chordPractice;
    totalRounds = chordStats.totalRounds;
    successfulRounds = chordStats.successfulRounds;
    failedRounds = chordStats.failedRounds;
    currentStreak = chordStats.currentStreak;
    // Add custom event listener for piano clicks
    const handleKeyClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const key = target.closest('.key');
      const noteData = key?.getAttribute('data-note');

      if (noteData && gameState === 'playing') {
        // For black keys, we need to check both note names (e.g., C#3/Db3)
        const allNotes = noteData.split('/');

        // Try each possible note name until we find a match
        for (const note of allNotes) {
          const matchingChordNote = findMatchingChordNote(note);
          if (matchingChordNote) {
            handlePianoClick(new CustomEvent('piano-click', { detail: note }));
            return; // Found a match, no need to check other names
          }
        }

        // If no match found, still register the click (for mistake counting)
        handlePianoClick(new CustomEvent('piano-click', { detail: allNotes[0] }));
      }
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

  // Cleanup timer on destroy
  onDestroy(() => {
    if (timer) {
      clearInterval(timer);
    }
  });
</script>

<div class="chord-practice-wrapper">
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
        <h1 class="main-title">Chord Practice</h1>
        <p class="page-description">Select all the notes that belong to the chord</p>
      </div>
    </header>

    <!-- Game Section -->
    <section class="game-section">
      <div class="game-container">
        <!-- Game Header -->
        {#if gameState !== 'waiting'}
          <div class="game-header">
            <div class="chord-display">
              {chordDisplayName}
              {#if gameState === 'completed' || gameState === 'failed'}
                <div class="chord-tone-rule">({chordToneRule})</div>
              {/if}
            </div>
            {#if gameState === 'playing'}
              <div class="game-info">
                <div class="info-item">
                  <div class="info-label">Time Left</div>
                  <div class="info-value timer">{timeLeft}s</div>
                </div>
                {#if practiceMode === 'survival'}
                  <div class="info-item">
                    <div class="info-label">Lives</div>
                    <div class="info-value lives" aria-label="{lives} of {SURVIVAL_LIVES} lives left">
                      {#each Array(SURVIVAL_LIVES) as _, index}
                        <span class="life" class:lost={index >= lives} aria-hidden="true">♥</span>
                      {/each}
                    </div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Run</div>
                    <div class="info-value">{survivalScore}</div>
                  </div>
                {:else}
                  <div class="info-item">
                    <div class="info-label">Mistakes</div>
                    <div class="info-value mistakes">{mistakes}/{difficultySettings.mistakes}</div>
                  </div>
                {/if}
                <div class="info-item">
                  <div class="info-label">Found Notes</div>
                  <div class="info-value">{foundNotesCount}/{currentChordNotes.length}</div>
                </div>
              </div>
            {/if}
          </div>
        {/if}

        <RoundStatus
          state={gameState}
          successText="Correct — you built {chordDisplayName}"
          failText="Incorrect — {chordDisplayName} is {currentChordNotes
            .map(getNoteNameOnly)
            .join(', ')}"
        />

        {#if practiceMode === 'survival' && survivalOver && gameState === 'failed'}
          <div class="survival-summary" role="status">
            <p class="survival-headline">
              Run over — you built {survivalScore}
              {survivalScore === 1 ? 'chord' : 'chords'}
            </p>
            <p class="survival-best">Best run: {survivalBest}</p>
          </div>
        {/if}
      </div>
    </section>

    <!-- Controls Section -->
    {#if gameState === 'waiting' || gameState === 'completed' || gameState === 'failed'}
      <section class="controls-section">
        <div class="controls-container">
          <div class="mode-picker" role="group" aria-label="Practice mode">
            <button
              type="button"
              class="mode-option"
              class:selected={practiceMode === 'timed'}
              aria-pressed={practiceMode === 'timed'}
              on:click={() => setPracticeMode('timed')}
            >
              Timed
            </button>
            <button
              type="button"
              class="mode-option"
              class:selected={practiceMode === 'survival'}
              aria-pressed={practiceMode === 'survival'}
              on:click={() => setPracticeMode('survival')}
            >
              Survival
            </button>
          </div>
          <DifficultyPicker
            value={difficulty}
            mode="chordPractice"
            mistakesText={practiceMode === 'survival'
              ? 'wrong keys cost a life'
              : `${difficultySettings.mistakes} mistakes allowed`}
            on:change={(event) => setDifficulty(event.detail)}
          />
          {#if practiceMode === 'survival' && !survivalOver && gameState === 'waiting'}
            <p class="survival-intro">
              {SURVIVAL_LIVES} lives — wrong keys and timeouts each cost one. How many chords can
              you build?{#if survivalBest > 0}{' '}Best so far: {survivalBest}.{/if}
            </p>
          {/if}
          <button on:click={startNewRound} class="game-button primary">
            {#if practiceMode === 'survival'}
              {gameState === 'waiting' || survivalOver ? 'Start Survival Run' : 'Next Chord'}
            {:else}
              Start New Round
            {/if}
          </button>
        </div>
      </section>
    {/if}

    <!-- Piano Section -->
    <section class="piano-section">
      <div class="piano-container">
        <Piano bind:this={pianoComponent} chordNotes={currentChordNotes} stickyOnMobile={true} showOctaveMarkers={true} />
      </div>
    </section>

    <!-- Score Section -->
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
  /* Chord practice wrapper */
  .chord-practice-wrapper {
    min-height: calc(90vh - 4rem);
    padding: 2rem 0;
  }

  /* Navigation */

  /* Game section */
  .game-container {
    max-width: 56rem;
    margin: 0 auto;
  }

  .game-header {
    text-align: center;
  }

  .chord-display {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: 0.5rem;
    padding-bottom: 3rem;
    background: var(--gradient-text);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .chord-tone-rule {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--color-text-secondary) !important;
    text-align: center;
    letter-spacing: 0.02em;
  }

  /* Practice mode picker (Timed | Survival) */
  .mode-picker {
    display: inline-flex;
    padding: 0.25rem;
    gap: 0.25rem;
    background: var(--color-surface-subtle);
    border: 1px solid var(--color-border-light);
    border-radius: 999px;
    flex-basis: 100%;
    justify-content: center;
    align-self: center;
    max-width: fit-content;
    margin: 0 auto;
  }

  .mode-option {
    padding: 0.375rem 1.25rem;
    border: none;
    border-radius: 999px;
    background: transparent;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-smooth);
  }

  .mode-option:hover {
    color: var(--color-text-primary);
  }

  .mode-option.selected {
    background: var(--color-surface-solid);
    color: var(--color-text-primary);
    box-shadow: var(--shadow-sm);
  }

  .survival-intro {
    flex-basis: 100%;
    text-align: center;
    margin: 0;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  /* Survival lives + run summary */
  .info-value.lives {
    letter-spacing: 0.15em;
  }

  .life {
    color: #ff2d55;
  }

  .life.lost {
    color: var(--color-border-strong);
  }

  .survival-summary {
    text-align: center;
    padding: 0.5rem 0 0;
  }

  .survival-headline {
    margin: 0 0 0.25rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .survival-best {
    margin: 0;
    font-size: 0.9375rem;
    color: var(--color-text-secondary);
  }

  .game-info {
    display: flex;
    justify-content: center;
    gap: 2rem;
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

  /* Piano section */
  .piano-section {
    padding-bottom: 2rem;
  }

  .piano-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
  }

  /* Controls section */
  .controls-section {
    padding-bottom: 2rem;
  }

  .controls-container {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .game-button {
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

  .stat-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }


  /* Responsive Design */
  @media (max-width: 768px) {
    .chord-practice-wrapper {
      padding: 1rem 0;
    }

    .game-section {
      padding-bottom: 0;
    }

    .chord-display {
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      margin-bottom: 0.25rem;
    }

    .chord-tone-rule {
      font-size: 1rem;
      margin-top: -1.5rem;
    }

    .game-info {
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .info-item {
      padding: 0.5rem 1rem;
      min-width: 120px;
    }

    .controls-container {
      flex-direction: column;
      align-items: center;
    }

    .game-button {
      width: 100%;
      max-width: 280px;
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
  }

  @media (max-width: 480px) {
    .chord-practice-wrapper {
      padding: 1.5rem 0;
    }

    .game-section {
      padding-bottom: 1rem;
    }

    .chord-display {
      font-size: clamp(3rem, 3.5vw, 2rem);
      padding-bottom: 2rem;
    }

    .chord-tone-rule {
      font-size: 1rem;
      margin-top: -0.5rem;
    }

    .game-info {
      flex-direction: row;
      justify-content: space-around;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .info-item {
      padding: 0.5rem 0.75rem;
      min-width: 100px;
      flex: 1;
    }

    .info-label {
      font-size: 0.75rem;
    }

    .info-value {
      font-size: 1.25rem;
    }

    .piano-container {
      padding: 0.75rem;
    }

    .piano-section {
      padding-bottom: 1rem;
    }

    .stats-container {
      padding: 1rem;
    }

    .stat-item {
      padding: 0.75rem;
    }

    .stat-value {
      font-size: 1.5rem;
    }

    .chord-practice-wrapper .header-section {
      padding: 2rem 0;
    }

    .chord-practice-wrapper .game-section {
      padding-bottom: 0;
    }
  }

  /* Extra small screens */
  @media (max-width: 360px) {
    .game-info {
      flex-direction: column;
      gap: 0.5rem;
    }

    .info-item {
      padding: 0.4rem 0.5rem;
    }

    .stats-grid {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }
  }
</style>
