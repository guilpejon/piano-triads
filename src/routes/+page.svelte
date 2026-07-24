<script lang="ts">
  import { onMount } from 'svelte';
  import {
    loadProgress,
    getDailyStreak,
    toDayKey,
    type UserProgress
  } from '$lib/utils/progressUtils';
  import { getSluggedChords } from '$lib/utils/chordUtils';

  const DAILY_GOAL_ROUNDS = 10;

  // Progress lives in localStorage, so the Today section renders its zero state on the
  // server and fills in after mount.
  let progress: UserProgress | null = null;

  onMount(() => {
    progress = loadProgress();
  });

  $: dailyStreak = progress ? getDailyStreak(progress) : 0;
  $: todayRounds = progress ? (progress.dailyStats[toDayKey(new Date())]?.rounds ?? 0) : 0;
  $: goalFraction = Math.min(todayRounds / DAILY_GOAL_ROUNDS, 1);

  // r=18 ring; circumference drives the stroke-dash goal indicator.
  const RING_CIRCUMFERENCE = 2 * Math.PI * 18;

  // The practice mode played most recently, so returning users can jump straight back in.
  function getContinueTarget(p: UserProgress): { href: string; label: string } | null {
    const pitch = p.modules.pitchTraining;
    const reading = p.modules.musicReading;
    const candidates = [
      {
        href: '/chord-practice',
        label: 'Chord Practice',
        rounds: p.modules.chordPractice.totalRounds,
        lastPlayed: p.modules.chordPractice.lastPlayed
      },
      {
        href: '/chord-quiz',
        label: 'Chord Quiz',
        rounds: p.modules.chordQuiz?.totalRounds || 0,
        lastPlayed: p.modules.chordQuiz?.lastPlayed || ''
      },
      {
        href: '/pitch-training',
        label: 'Pitch Practice',
        rounds: pitch.notes.totalRounds + pitch.chords.totalRounds,
        lastPlayed: pitch.lastPlayed
      },
      {
        href: '/music-score-practice',
        label: 'Music Score Practice',
        rounds:
          (reading?.trebleClef?.totalRounds || 0) +
          (reading?.bassClef?.totalRounds || 0) +
          (reading?.bothClef?.totalRounds || 0),
        lastPlayed: reading?.lastPlayed || ''
      }
    ].filter((candidate) => candidate.rounds > 0 && candidate.lastPlayed);

    if (candidates.length === 0) return null;
    candidates.sort((a, b) => Date.parse(b.lastPlayed) - Date.parse(a.lastPlayed));
    return candidates[0];
  }

  $: continueTarget = progress ? getContinueTarget(progress) : null;

  // Same chord for everyone on a given day: hash the local day key into the slugged list.
  function getChordOfTheDay(): { name: string; slug: string } {
    const chords = getSluggedChords();
    const key = toDayKey(new Date());
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    }
    return chords[hash % chords.length];
  }

  let chordOfTheDay = getChordOfTheDay();
</script>

<div class="home-wrapper">
  <div class="page-container">
    <!-- Header Section -->
    <header class="header-section">
      <div class="header-content">
        <h1 class="main-title">Piano Triads</h1>
        <p class="main-subtitle">
          Master piano chords, scales, and ear training with interactive lessons
        </p>
      </div>
    </header>

    <!-- Today Section -->
    <section class="today-section" aria-label="Today's practice">
      <div class="today-grid">
        <div class="glass-card today-card">
          <svg class="goal-ring" viewBox="0 0 44 44" aria-hidden="true">
            <circle class="goal-ring-track" cx="22" cy="22" r="18" />
            <circle
              class="goal-ring-fill"
              cx="22"
              cy="22"
              r="18"
              stroke-dasharray={RING_CIRCUMFERENCE}
              stroke-dashoffset={RING_CIRCUMFERENCE * (1 - goalFraction)}
            />
          </svg>
          <div class="today-card-content">
            <span class="today-card-title">Daily goal</span>
            <span class="today-card-value">{todayRounds}/{DAILY_GOAL_ROUNDS} rounds</span>
            <span class="today-card-hint">
              {#if todayRounds >= DAILY_GOAL_ROUNDS}
                Goal reached — nice work!
              {:else if todayRounds > 0}
                {DAILY_GOAL_ROUNDS - todayRounds} more to hit today's goal
              {:else}
                Play any practice mode to get started
              {/if}
            </span>
          </div>
        </div>

        <div class="glass-card today-card">
          <span class="today-emoji" aria-hidden="true">🔥</span>
          <div class="today-card-content">
            <span class="today-card-title">Daily streak</span>
            <span class="today-card-value">
              {dailyStreak}
              {dailyStreak === 1 ? 'day' : 'days'}
            </span>
            <span class="today-card-hint">
              {#if dailyStreak > 0}
                Practice today to keep it alive
              {:else}
                Practice once a day to build a streak
              {/if}
            </span>
          </div>
        </div>

        <a href="/chord-dictionary/{chordOfTheDay.slug}" class="glass-card today-card">
          <span class="today-emoji" aria-hidden="true">🎹</span>
          <div class="today-card-content">
            <span class="today-card-title">Chord of the day</span>
            <span class="today-card-value">{chordOfTheDay.name}</span>
            <span class="today-card-hint">See how it's built and hear it</span>
          </div>
        </a>

        {#if continueTarget}
          <a href={continueTarget.href} class="glass-card today-card">
            <span class="today-emoji" aria-hidden="true">▶️</span>
            <div class="today-card-content">
              <span class="today-card-title">Pick up where you left off</span>
              <span class="today-card-value">{continueTarget.label}</span>
              <span class="today-card-hint">Jump back into your last practice mode</span>
            </div>
          </a>
        {/if}
      </div>
    </section>

    <!-- Theory Section -->
    <section class="features-section theory-section">
      <div class="section-header">
        <h2 class="section-title">Music Theory</h2>
        <p class="section-description">Learn chords, scales, and music fundamentals</p>
      </div>
      <div class="features-grid theory-grid">
        <a href="/chord-dictionary" class="glass-card feature-card">
          <div class="card-icon chord-icon">
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div class="card-content">
            <h2 class="card-title">Chord Dictionary</h2>
            <p class="card-description">Explore and learn the main piano chords</p>
          </div>
          <div class="card-arrow">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </a>

        <a href="/chord-practice" class="glass-card feature-card">
          <div class="card-icon practice-icon">
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <div class="card-content">
            <h2 class="card-title">Chord Practice</h2>
            <p class="card-description">Practice building chords note by note</p>
          </div>
          <div class="card-arrow">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </a>

        <a href="/learn-scales" class="glass-card feature-card">
          <div class="card-icon scales-icon">
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <div class="card-content">
            <h2 class="card-title">Learn Scales</h2>
            <p class="card-description">
              Master major, minor, and exotic scales with interactive lessons
            </p>
          </div>
          <div class="card-arrow">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </a>

        <a href="/chord-progressions" class="glass-card feature-card">
          <div class="card-icon progressions-icon">
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
              />
            </svg>
          </div>
          <div class="card-content">
            <h2 class="card-title">Chord Progressions</h2>
            <p class="card-description">Learn common chord progressions used in popular music</p>
          </div>
          <div class="card-arrow">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </a>

        <a href="/learn-music-reading" class="glass-card feature-card">
          <div class="card-icon music-reading-icon">
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M9 12h6m-6 4h6"
              />
            </svg>
          </div>
          <div class="card-content">
            <h2 class="card-title">Learn Music Reading</h2>
            <p class="card-description">Interactive lesson to master reading notes on the staff</p>
          </div>
          <div class="card-arrow">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </a>

        <a href="/circle-of-fifths" class="glass-card feature-card">
          <div class="card-icon circle-icon">
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M12 2v20M2 12h20"
              />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div class="card-content">
            <h2 class="card-title">Circle of Fifths</h2>
            <p class="card-description">Master key signatures and chord relationships</p>
          </div>
          <div class="card-arrow">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </a>
      </div>
    </section>

    <!-- Practice Section -->
    <section class="features-section practice-section">
      <div class="section-header">
        <h2 class="section-title">Practice & Training</h2>
        <p class="section-description">Improve your skills with interactive exercises</p>
      </div>
      <div class="features-grid practice-grid">
        <a href="/chord-practice" class="glass-card feature-card">
          <div class="card-icon practice-icon">
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <div class="card-content">
            <h2 class="card-title">Chord Practice</h2>
            <p class="card-description">Practice building chords note by note</p>
          </div>
          <div class="card-arrow">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </a>

        <a href="/chord-quiz" class="glass-card feature-card">
          <div class="card-icon quiz-icon">
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div class="card-content">
            <h2 class="card-title">Chord Quiz</h2>
            <p class="card-description">See the keys, hear the sound, name the chord</p>
          </div>
          <div class="card-arrow">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </a>

        <a href="/pitch-training" class="glass-card feature-card">
          <div class="card-icon pitch-icon">
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
          </div>
          <div class="card-content">
            <h2 class="card-title">Pitch Practice</h2>
            <p class="card-description">Develop perfect pitch and interval recognition skills</p>
          </div>
          <div class="card-arrow">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </a>

        <a href="/music-score-practice" class="glass-card feature-card">
          <div class="card-icon reading-icon">
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div class="card-content">
            <h2 class="card-title">Music Score Practice</h2>
            <p class="card-description">Read sheet music and identify piano keys quickly</p>
          </div>
          <div class="card-arrow">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </a>
      </div>
    </section>

    <!-- Progress Section -->
    <section class="progress-section">
      <div class="progress-container">
        <div class="progress-content">
          <h2 class="progress-title">Track Your Progress</h2>
          <p class="progress-description">
            Monitor your learning journey, view achievements, and see how much you've improved
          </p>
        </div>
        <a href="/progress" class="glass-card progress-card">
          <div class="progress-card-header">
            <div class="card-icon progress-icon">
              <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 class="card-title">Progress Dashboard</h3>
          </div>
          <div class="card-content">
            <p class="card-description">View your stats, achievements, and learning milestones</p>
          </div>
        </a>
      </div>
    </section>
  </div>
</div>

<style>
  /* Home page wrapper */
  .home-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 4rem); /* Account for navbar */
    padding: 1rem 0;
  }

  .home-wrapper .header-section {
    margin-bottom: 1rem;
  }

  .home-wrapper .header-section h1 {
    margin-bottom: 2rem;
  }

  /* Today section */
  .today-section {
    padding-bottom: 3rem;
  }

  .today-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
    gap: 1rem;
    max-width: 72rem;
    margin: 0 auto;
  }

  .today-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    color: inherit;
    text-decoration: none;
  }

  .today-emoji {
    font-size: 1.75rem;
    line-height: 1.3;
    flex-shrink: 0;
  }

  .today-card-content {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  .today-card-title {
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-text-secondary);
  }

  .today-card-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text-primary);
    line-height: 1.3;
  }

  .today-card-hint {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    line-height: 1.4;
  }

  .goal-ring {
    width: 3.25rem;
    height: 3.25rem;
    flex-shrink: 0;
    transform: rotate(-90deg);
  }

  .goal-ring-track,
  .goal-ring-fill {
    fill: none;
    stroke-width: 5;
  }

  .goal-ring-track {
    stroke: var(--color-border-medium);
  }

  .goal-ring-fill {
    stroke: var(--color-accent);
    stroke-linecap: round;
    transition: stroke-dashoffset 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  /* Section Headers */
  .section-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .section-title {
    font-size: clamp(1.75rem, 4vw, 2.25rem);
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: 0.75rem;
    letter-spacing: -0.01em;
  }

  .section-description {
    font-size: clamp(1rem, 2vw, 1.125rem);
    color: var(--color-text-secondary);
    margin: 0;
    max-width: 32rem;
    margin: 0 auto;
  }

  /* Features sections */
  .features-section {
    padding-bottom: 4rem;
  }

  .theory-section {
    padding-bottom: 3rem;
  }

  .practice-section {
    padding-bottom: 4rem;
  }

  .features-grid {
    display: grid;
    gap: 1.5rem;
    max-width: 72rem;
    margin: 0 auto;
  }

  .theory-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .practice-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  /* Feature Card Specific Styles */
  .feature-card {
    padding: 2rem;
    display: flex;
    align-items: center;
    gap: 1.25rem;
    color: inherit;
    text-decoration: none;
    position: relative;
    overflow: hidden;
  }

  .feature-card:hover .card-arrow {
    transform: translateX(4px);
    opacity: 1;
  }

  .card-icon {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: var(--transition-smooth);
  }

  .chord-icon {
    background: var(--gradient-blue);
    color: white;
  }

  .practice-icon {
    background: var(--gradient-green);
    color: white;
  }

  .scales-icon {
    background: var(--gradient-purple);
    color: white;
  }

  .pitch-icon {
    background: var(--gradient-orange);
    color: white;
  }

  .quiz-icon {
    background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
    color: white;
  }

  .reading-icon {
    background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
    color: white;
  }

  .progressions-icon {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;
  }

  .circle-icon {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
  }

  .music-reading-icon {
    background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
    color: white;
  }

  .progress-icon {
    background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
    color: white;
  }

  .card-content {
    flex: 1;
  }

  .card-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--color-text-primary);
    line-height: 1.3;
  }

  .card-description {
    font-size: 1rem;
    font-weight: 400;
    margin: 0;
    color: var(--color-text-secondary);
    line-height: 1.4;
  }

  .card-arrow {
    color: var(--color-text-secondary);
    transition: var(--transition-smooth);
    opacity: 0.7;
    transform: translateX(0);
  }

  .progress-container {
    padding: 0 2rem;
  }
  /* Responsive Design */
  @media (max-width: 1024px) {
    .theory-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }

    .practice-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }
  }

  @media (max-width: 768px) {
    .theory-grid,
    .practice-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .section-header {
      margin-bottom: 2rem;
    }

    .feature-card {
      padding: 1.5rem;
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }

    .progress-container {
      flex-direction: column;
      gap: 2rem;
      text-align: center;
    }

    .card-content {
      text-align: center;
    }

    .card-arrow {
      display: none;
    }
  }

  .progress-section {
    margin-top: 1rem;
    padding: 3rem 0;
    background: linear-gradient(135deg, rgba(52, 128, 241, 0.03) 0%, rgba(175, 82, 222, 0.03) 100%);
    border-radius: 24px;
    border: 1px solid var(--color-border-light);
  }

  .progress-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    max-width: 1000px;
    margin: 0 auto;
  }

  .progress-content {
    flex: 1;
  }

  .progress-title {
    font-size: clamp(1.75rem, 5vw, 2.25rem);
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: 1rem;
    line-height: 1.2;
  }

  .progress-description {
    font-size: clamp(1rem, 2.5vw, 1.125rem);
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin: 0;
  }

  .progress-card {
    flex-shrink: 0;
    max-width: 400px;
    padding: 2rem;
    background: var(--color-surface);
    border: 2px solid transparent;
    background-clip: padding-box;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .progress-card-header {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .progress-card .card-title {
    margin-bottom: 0;
    font-size: 1.5rem;
  }

  .progress-card .card-content {
    flex: none;
  }

  .progress-card::before {
    content: '';
    position: absolute;
    inset: 0;
    padding: 2px;
    background: linear-gradient(135deg, var(--color-accent) 0%, #af52de 100%);
    border-radius: inherit;
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: xor;
    -webkit-mask-composite: xor;
  }

  .progress-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 60px rgba(52, 128, 241, 0.15);
  }

  .progress-card .progress-icon {
    background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
    box-shadow: 0 8px 32px rgba(6, 182, 212, 0.3);
  }

  @media (max-width: 480px) {
    .feature-card {
      padding: 1.25rem;
    }

    .card-icon {
      width: 3rem;
      height: 3rem;
    }

    .card-title {
      font-size: 1.125rem;
    }

    .card-description {
      font-size: 0.875rem;
    }

    .progress-section {
      padding: 1.5rem 0.5rem;
    }

    .progress-card {
      max-width: none;
      padding: 1.5rem;
    }

    .progress-card .card-title {
      font-size: 1.25rem;
    }

    .progress-card {
      padding: 1.25rem;
    }

    .progress-card-header {
      gap: 0.75rem;
    }

    .progress-card .card-icon {
      width: 2.5rem;
      height: 2.5rem;
    }

    .progress-card .card-title {
      font-size: 1.125rem;
    }

    .features-section {
      padding-bottom: 2rem;
    }
  }
</style>
