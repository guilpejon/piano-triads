<script lang="ts">
  import Piano from '$lib/components/Piano.svelte';
  import RoundStatus from '$lib/components/RoundStatus.svelte';
  import DifficultyPicker from '$lib/components/DifficultyPicker.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { getChord, getPracticeChords } from '$lib/utils/chordUtils';
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
  import {
    celebrateAchievement,
    celebrateStreak,
    isStreakMilestone
  } from '$lib/stores/celebrationStore';
  import { fireConfetti } from '$lib/utils/confetti';

  // Reference to Piano component for auto-scroll
  let pianoComponent: Piano;

  // Game state — the reverse of chord practice: the keys are shown, the name is the answer
  let gameState: 'waiting' | 'playing' | 'completed' | 'failed' = 'waiting';
  let currentChord: string = '';
  let currentChordNotes: string[] = [];
  let options: string[] = [];
  let eliminated: Set<string> = new Set();
  let mistakes = 0;
  let timeLeft = 15;
  let timer: number | null = null;

  // Statistics
  let totalRounds = 0;
  let successfulRounds = 0;
  let failedRounds = 0;
  let currentStreak = 0;

  // Progress tracking
  let userProgress: UserProgress;
  let roundStartTime: number;

  const availableChords: string[] = getPracticeChords();

  // Difficulty (shared across practice modes via progress preferences)
  let difficulty: Difficulty = 'standard';
  $: difficultySettings = DIFFICULTY_SETTINGS[difficulty].chordQuiz;

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

  function splitChord(name: string): { root: string; quality: string } {
    const match = name.match(/^([A-G][#b]?)(.*)$/);
    return match ? { root: match[1], quality: match[2] } : { root: name, quality: '' };
  }

  function shuffle<T>(items: T[]): T[] {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  // The answer plus three plausible distractors: same root with a different quality (forces
  // reading the third/seventh) and same quality with a different root (forces reading the root).
  function buildOptions(answer: string): string[] {
    const { root, quality } = splitChord(answer);
    const sameRoot = shuffle(
      availableChords.filter((c) => c !== answer && splitChord(c).root === root)
    );
    const sameQuality = shuffle(
      availableChords.filter((c) => c !== answer && splitChord(c).quality === quality)
    );

    const distractors = new Set<string>();
    for (const chord of sameRoot) {
      if (distractors.size >= 2) break;
      distractors.add(chord);
    }
    for (const chord of sameQuality) {
      if (distractors.size >= 3) break;
      distractors.add(chord);
    }
    while (distractors.size < 3) {
      const chord = availableChords[Math.floor(Math.random() * availableChords.length)];
      if (chord !== answer) distractors.add(chord);
    }

    return shuffle([answer, ...distractors]);
  }

  function startNewRound() {
    gameState = 'playing';
    mistakes = 0;
    eliminated = new Set();
    timeLeft = difficultySettings.seconds;
    roundStartTime = Date.now();

    currentChord = pickWeightedItem(userProgress, 'chordQuiz', availableChords, currentChord);
    const chord = getChord(currentChord);
    currentChordNotes = chord ? chord.root_position : [];
    options = buildOptions(currentChord);

    highlightChord();
    setTimeout(() => {
      pianoComponent?.scrollToActiveKey();
    }, 100);
    // Also play it — hearing the quality is half the skill
    setTimeout(() => {
      playChord(currentChordNotes);
    }, 400);

    startTimer();
    totalRounds++;
  }

  function startTimer() {
    if (timer) clearInterval(timer);

    timer = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        endRound(false); // Time ran out
      }
    }, 1000);
  }

  function chooseAnswer(option: string) {
    if (gameState !== 'playing' || eliminated.has(option)) return;

    if (option === currentChord) {
      endRound(true);
      return;
    }

    // Reassign so Svelte notices the change
    eliminated = new Set([...eliminated, option]);
    mistakes++;
    if (mistakes >= difficultySettings.mistakes || eliminated.size >= options.length - 1) {
      endRound(false);
    }
  }

  function replayChord() {
    if (gameState !== 'playing') return;
    playChord(currentChordNotes);
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

    // Reveal the note names on the highlighted keys and play the chord once more
    revealNoteLabels();
    playChord(currentChordNotes);

    // Update progress tracking
    const roundTime = (Date.now() - roundStartTime) / 1000;
    userProgress = recordItemResult(userProgress, 'chordQuiz', currentChord, success);
    userProgress = completePracticeSession(userProgress, 'chordQuiz', null, success, roundTime);

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
  }

  // Highlight the chord's keys without note labels — reading the keys is the puzzle
  function highlightChord() {
    const allKeys = document.querySelectorAll('.key');
    allKeys.forEach((key) => {
      key.classList.remove(
        'chord-active',
        'practice-correct',
        'practice-failed',
        'practice-success'
      );
    });
    document.querySelectorAll('.note').forEach((note) => {
      (note as HTMLElement).style.display = 'none';
    });

    currentChordNotes.forEach((noteName) => {
      document.querySelectorAll('.key[data-note]').forEach((key) => {
        const dataNote = key.getAttribute('data-note');
        if (dataNote && dataNote.split('/').some((keyNote) => keyNote === noteName)) {
          key.classList.add('chord-active');
        }
      });
    });
  }

  function revealNoteLabels() {
    document.querySelectorAll('.key.chord-active .note').forEach((note) => {
      (note as HTMLElement).style.display = 'block';
    });
  }

  onMount(() => {
    userProgress = loadProgress();
    difficulty = userProgress.preferences?.difficulty ?? 'standard';

    const quizStats = userProgress.modules.chordQuiz;
    totalRounds = quizStats.totalRounds;
    successfulRounds = quizStats.successfulRounds;
    failedRounds = quizStats.failedRounds;
    currentStreak = quizStats.currentStreak;
  });

  onDestroy(() => {
    if (timer) {
      clearInterval(timer);
    }
  });
</script>

<div class="chord-quiz-wrapper">
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
        <h1 class="main-title">Chord Quiz</h1>
        <p class="page-description">Name the chord highlighted on the keyboard</p>
      </div>
    </header>

    <!-- Game Section -->
    <section class="game-section">
      <div class="game-container">
        {#if gameState !== 'waiting'}
          <div class="game-header">
            <div class="chord-display">
              {#if gameState === 'playing'}
                <span class="chord-mystery">?</span>
              {:else}
                {currentChord}
              {/if}
            </div>
            {#if gameState === 'playing'}
              <div class="game-info">
                <div class="info-item">
                  <div class="info-label">Time Left</div>
                  <div class="info-value timer">{timeLeft}s</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Mistakes</div>
                  <div class="info-value mistakes">{mistakes}/{difficultySettings.mistakes}</div>
                </div>
                <div class="info-item replay-item">
                  <button
                    on:click={replayChord}
                    class="replay-button"
                    aria-label="Play the chord again"
                  >
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
          successText="Correct — that was {currentChord}"
          failText="Incorrect — that was {currentChord}"
        />

        <!-- Answer options -->
        {#if gameState !== 'waiting'}
          <div class="options-grid" role="group" aria-label="Answer options">
            {#each options as option (option)}
              <button
                type="button"
                class="option-button"
                class:wrong={eliminated.has(option)}
                class:correct={gameState !== 'playing' && option === currentChord}
                disabled={gameState !== 'playing' || eliminated.has(option)}
                on:click={() => chooseAnswer(option)}
              >
                {option}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </section>

    <!-- Controls Section -->
    {#if gameState === 'waiting' || gameState === 'completed' || gameState === 'failed'}
      <section class="controls-section">
        <div class="controls-container">
          <DifficultyPicker
            value={difficulty}
            mode="chordQuiz"
            mistakesText="{difficultySettings.mistakes} wrong guesses allowed"
            on:change={(event) => setDifficulty(event.detail)}
          />
          <button on:click={startNewRound} class="game-button primary">
            {gameState === 'waiting' ? 'Start Quiz' : 'Next Chord'}
          </button>
        </div>
      </section>
    {/if}

    <!-- Piano Section -->
    <section class="piano-section">
      <div class="piano-container">
        <Piano
          bind:this={pianoComponent}
          chordNotes={currentChordNotes}
          stickyOnMobile={true}
          showOctaveMarkers={true}
        />
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
  .chord-quiz-wrapper {
    min-height: calc(90vh - 4rem);
    padding: 2rem 0;
  }

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
    padding-bottom: 1.5rem;
    background: var(--gradient-text);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .chord-mystery {
    opacity: 0.5;
  }

  .game-info {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .info-item {
    text-align: center;
  }

  .info-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-secondary);
    margin-bottom: 0.25rem;
  }

  .info-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .info-value.timer {
    color: var(--color-accent);
  }

  .info-value.mistakes {
    color: var(--color-danger);
  }

  .replay-item {
    display: flex;
    align-items: center;
  }

  .replay-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border: 1px solid var(--color-border-medium);
    border-radius: 50%;
    background: var(--color-surface);
    color: var(--color-accent);
    cursor: pointer;
    transition: var(--transition-smooth);
  }

  .replay-button:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-md);
  }

  .replay-icon {
    width: 1.125rem;
    height: 1.125rem;
  }

  /* Answer options */
  .options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
    gap: 0.75rem;
    max-width: 36rem;
    margin: 1rem auto 0;
  }

  .option-button {
    padding: 0.875rem 1rem;
    border: 1px solid var(--color-border-medium);
    border-radius: 0.875rem;
    background: var(--color-surface);
    color: var(--color-text-primary);
    font-size: 1.125rem;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-smooth);
  }

  .option-button:hover:not(:disabled) {
    border-color: var(--color-accent);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .option-button:disabled {
    cursor: default;
  }

  .option-button.wrong {
    opacity: 0.45;
    text-decoration: line-through;
    border-color: var(--color-danger);
  }

  .option-button.correct {
    border-color: var(--color-success);
    background: color-mix(in srgb, var(--color-success) 14%, var(--color-surface));
  }

  /* Controls */
  .controls-section {
    margin: 1.5rem 0;
  }

  .controls-container {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .game-button {
    padding: 0.875rem 2rem;
    border: none;
    border-radius: 999px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-smooth);
  }

  .game-button.primary {
    background: var(--gradient-blue);
    color: white;
    box-shadow: 0 4px 20px rgba(52, 128, 241, 0.3);
  }

  .game-button.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(52, 128, 241, 0.4);
  }

  /* Piano */
  .piano-section {
    margin: 2rem 0;
  }

  .piano-container {
    display: flex;
    justify-content: center;
  }

  /* Stats */
  .stats-section {
    margin-top: 2rem;
  }

  .stats-container {
    max-width: 32rem;
    margin: 0 auto;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    text-align: center;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .stat-value.correct {
    color: var(--color-success);
  }

  .stat-value.incorrect {
    color: var(--color-danger);
  }

  .stat-value.streak {
    color: var(--color-accent);
  }

  .stat-label {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  /* Navigation */
  .navigation {
    margin-bottom: 1.5rem;
  }

  @media (max-width: 480px) {
    .options-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
