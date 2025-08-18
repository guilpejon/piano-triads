<script lang="ts">
  import { onMount } from 'svelte';
  import {
    loadProgress,
    getOverallStats,
    getSuccessRate,
    formatDuration,
    formatDate,
    resetAllProgress,
    ACHIEVEMENTS,
    type UserProgress,
    type Achievement
  } from '$lib/utils/progressUtils';

  let progress: UserProgress | null = null;
  let overallStats: ReturnType<typeof getOverallStats> | null = null;
  let recentAchievements: Achievement[] = [];
  let allAchievements: (Achievement | { id: string; name: string; description: string; icon: string; category: string; locked: true })[] = [];
  let showResetConfirmation = false;

  onMount(() => {
    try {
      progress = loadProgress();
      overallStats = getOverallStats(progress);
      
      // Get recent achievements (last 5)
      recentAchievements = progress.achievements
        .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
        .slice(0, 5);
      
      // Create all achievements array with locked/unlocked status
      const unlockedIds = new Set(progress.achievements.map(a => a.id));
      allAchievements = ACHIEVEMENTS.map(achievement => {
        const unlocked = progress?.achievements.find(a => a.id === achievement.id);
        if (unlocked) {
          return unlocked;
        } else {
          return {
            ...achievement,
            locked: true as const
          };
        }
      });
    } catch (error) {
      console.error('Error loading progress:', error);
      // Initialize with default progress if loading fails
      progress = loadProgress();
      overallStats = getOverallStats(progress);
      recentAchievements = [];
      allAchievements = ACHIEVEMENTS.map(achievement => ({
        ...achievement,
        locked: true as const
      }));
    }
  });

  // Calculate module-specific stats
  $: chordPracticeRate = progress ? getSuccessRate(progress.modules.chordPractice) : 0;
  $: pitchTrainingNotesRate = progress ? getSuccessRate(progress.modules.pitchTraining.notes) : 0;
  $: pitchTrainingChordsRate = progress ? getSuccessRate(progress.modules.pitchTraining.chords) : 0;
  
  // Check if user has any progress data worth resetting
  $: hasProgressData = progress ? (
    progress.modules.chordPractice.totalRounds > 0 ||
    progress.modules.pitchTraining.notes.totalRounds > 0 ||
    progress.modules.pitchTraining.chords.totalRounds > 0 ||
    progress.achievements.length > 0 ||
    progress.totalPlayTime > 0
  ) : false;
  
  // Reset progress functions
  function handleResetClick() {
    showResetConfirmation = true;
  }
  
  function confirmReset() {
    progress = resetAllProgress();
    overallStats = getOverallStats(progress);
    recentAchievements = [];
    allAchievements = ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      locked: true as const
    }));
    showResetConfirmation = false;
  }
  
  function cancelReset() {
    showResetConfirmation = false;
  }
  
  function handleOverlayClick(event: MouseEvent) {
    // Only close modal if clicking on the overlay itself, not its children
    if (event.target === event.currentTarget) {
      cancelReset();
    }
  }
  

</script>

<svelte:head>
  <title>Progress Dashboard - Piano Triads</title>
  <meta name="description" content="Track your piano learning progress and achievements" />
</svelte:head>

<div class="progress-wrapper">
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
        <h1 class="main-title">Your Progress</h1>
        <p class="page-description">
          Track your piano learning journey and celebrate your achievements
        </p>
      </div>
    </header>

    {#if progress && overallStats}
      <!-- Overall Stats Section -->
      <section class="stats-section">
        <div class="stats-grid">
          <div class="glass-card stat-card">
            <div class="stat-icon overall-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-number">{overallStats.totalRounds}</div>
              <div class="stat-label">Total Practice Rounds</div>
            </div>
          </div>

          <div class="glass-card stat-card">
            <div class="stat-icon success-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-number">{overallStats.overallSuccessRate}%</div>
              <div class="stat-label">Overall Success Rate</div>
            </div>
          </div>

          <div class="glass-card stat-card">
            <div class="stat-icon streak-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-number">{overallStats.bestStreak}</div>
              <div class="stat-label">Best Streak</div>
            </div>
          </div>

          <div class="glass-card stat-card">
            <div class="stat-icon time-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-number">{formatDuration(overallStats.totalPlayTime)}</div>
              <div class="stat-label">Total Practice Time</div>
            </div>
          </div>
        </div>
      </section>



      <!-- Module Progress Section -->
      <section class="modules-section">
        <h2 class="section-title">Module Progress</h2>
        <div class="modules-grid">
          <!-- Chord Practice -->
          <div class="glass-card module-card">
            <div class="module-header">
              <div class="module-icon chord-practice-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                </svg>
              </div>
              <div class="module-info">
                <h3 class="module-title">Chord Practice</h3>
                <p class="module-subtitle">Build chords under pressure</p>
              </div>
            </div>
            <div class="module-stats">
              <div class="module-stat">
                <span class="module-stat-number">{progress.modules.chordPractice.totalRounds}</span>
                <span class="module-stat-label">Rounds</span>
              </div>
              <div class="module-stat">
                <span class="module-stat-number">{chordPracticeRate}%</span>
                <span class="module-stat-label">Success</span>
              </div>
              <div class="module-stat">
                <span class="module-stat-number">{progress.modules.chordPractice.bestStreak}</span>
                <span class="module-stat-label">Best Streak</span>
              </div>
            </div>
            <div class="module-last-played">
              Last played: {formatDate(progress.modules.chordPractice.lastPlayed)}
            </div>
          </div>

          <!-- Pitch Training - Note Training -->
          <div class="glass-card module-card">
            <div class="module-header">
              <div class="module-icon pitch-training-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                </svg>
              </div>
              <div class="module-info">
                <h3 class="module-title">Note Training</h3>
                <p class="module-subtitle">Identify individual notes</p>
              </div>
            </div>
            <div class="module-stats">
              <div class="module-stat">
                <span class="module-stat-number">{progress.modules.pitchTraining.notes.totalRounds}</span>
                <span class="module-stat-label">Rounds</span>
              </div>
              <div class="module-stat">
                <span class="module-stat-number">{pitchTrainingNotesRate}%</span>
                <span class="module-stat-label">Success</span>
              </div>
              <div class="module-stat">
                <span class="module-stat-number">{progress.modules.pitchTraining.notes.bestStreak}</span>
                <span class="module-stat-label">Best Streak</span>
              </div>
            </div>
            <div class="module-last-played">
              Last played: {formatDate(progress.modules.pitchTraining.lastPlayed)} {progress.modules.pitchTraining.lastMode === 'note' ? '(last mode)' : ''}
            </div>
          </div>

          <!-- Pitch Training - Chord Training -->
          <div class="glass-card module-card">
            <div class="module-header">
              <div class="module-icon pitch-training-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                </svg>
              </div>
              <div class="module-info">
                <h3 class="module-title">Chord Training</h3>
                <p class="module-subtitle">Identify chord progressions</p>
              </div>
            </div>
            <div class="module-stats">
              <div class="module-stat">
                <span class="module-stat-number">{progress.modules.pitchTraining.chords.totalRounds}</span>
                <span class="module-stat-label">Rounds</span>
              </div>
              <div class="module-stat">
                <span class="module-stat-number">{pitchTrainingChordsRate}%</span>
                <span class="module-stat-label">Success</span>
              </div>
              <div class="module-stat">
                <span class="module-stat-number">{progress.modules.pitchTraining.chords.bestStreak}</span>
                <span class="module-stat-label">Best Streak</span>
              </div>
            </div>
            <div class="module-last-played">
              Last played: {formatDate(progress.modules.pitchTraining.lastPlayed)} {progress.modules.pitchTraining.lastMode === 'chord' ? '(last mode)' : ''}
            </div>
          </div>
        </div>
      </section>

      <!-- Achievements Section -->
      <section class="achievements-section">
        <h2 class="section-title">
          Achievements
          <span class="achievements-count">({progress.achievements.length}/{ACHIEVEMENTS.length})</span>
        </h2>
        
        <div class="achievements-grid">
          {#each allAchievements as achievement}
            <div class="glass-card achievement-card" class:locked={'locked' in achievement}>
              <div class="achievement-icon" class:locked={'locked' in achievement}>{achievement.icon}</div>
              <div class="achievement-content">
                <h3 class="achievement-name" class:locked={'locked' in achievement}>{achievement.name}</h3>
                <p class="achievement-description" class:locked={'locked' in achievement}>{achievement.description}</p>
                {#if 'locked' in achievement}
                  <div class="achievement-status locked">🔒 Locked</div>
                {:else}
                  <div class="achievement-date">
                    Unlocked {formatDate(achievement.unlockedAt)}
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </section>

      <!-- Reset Progress Button -->
      <div class="reset-button-container">
        <button class="btn-reset" on:click={handleResetClick} disabled={!hasProgressData}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          Reset Progress
        </button>
      </div>
    {:else}
      <!-- Loading state -->
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading your progress...</p>
      </div>
    {/if}
  </div>
</div>

<!-- Reset Confirmation Modal -->
{#if showResetConfirmation}
  <div class="modal-overlay" on:click={handleOverlayClick} on:keydown={(e) => e.key === 'Escape' && cancelReset()} role="dialog" aria-modal="true" tabindex="-1">
    <div class="modal-content" role="document">
      <div class="modal-header">
        <svg class="modal-icon" width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <h3 class="modal-title">Reset All Progress?</h3>
        <p class="modal-subtitle">This will permanently delete all your progress data.</p>
      </div>
      <div class="modal-actions">
        <button class="btn-cancel" on:click={cancelReset}>Cancel</button>
        <button class="btn-confirm-reset" on:click={confirmReset}>Yes, Reset</button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Progress wrapper */
  .progress-wrapper {
    min-height: calc(90vh - 4rem);
    padding: 2rem 0;
  }



  /* Navigation */
  .navigation {
    margin-bottom: 2rem;
  }

  .btn-glass {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: var(--color-card-background);
    border: 1px solid var(--color-border-light);
    border-radius: 12px;
    color: var(--color-text-primary);
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    backdrop-filter: blur(20px);
  }

  .btn-glass:hover {
    background: var(--color-card-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .back-icon {
    width: 20px;
    height: 20px;
  }

  /* Header */
  .header-section {
    text-align: center;
    margin-bottom: 1rem;
  }

  /* Card base */
  .glass-card {
    background: var(--color-card-background);
    border: 1px solid var(--color-border-light);
    border-radius: 16px;
    padding: 2rem;
    transition: all 0.3s ease;
    backdrop-filter: blur(20px);
  }

  .glass-card:hover {
    background: var(--color-card-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  /* Stats Section */
  .stats-section {
    margin-bottom: 4rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 2rem;
  }

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: var(--gradient-blue);
  }

  .overall-icon { background: var(--gradient-blue); }
  .success-icon { background: var(--gradient-green); }
  .streak-icon { background: var(--gradient-orange); }
  .time-icon { background: var(--gradient-purple); }

  .stat-icon svg {
    color: white;
    width: 24px;
    height: 24px;
  }

  .stat-content {
    flex: 1;
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--color-text-primary);
    display: block;
    line-height: 1.1;
  }

  .stat-label {
    font-size: 1rem;
    color: var(--color-text-secondary);
    margin-top: 0.25rem;
  }



  /* Modules Section */
  .modules-section {
    margin-bottom: 3rem;
  }

  .section-title {
    font-size: 2rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .modules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .module-card {
    padding: 2rem;
  }

  .module-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .module-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .chord-practice-icon { background: var(--gradient-green); }
  .pitch-training-icon { background: var(--gradient-orange); }

  .module-icon svg {
    color: white;
  }

  .module-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 0.25rem;
  }

  .module-subtitle {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
  }

  .module-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .module-stat {
    text-align: center;
  }

  .module-stat-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text-primary);
    display: block;
  }

  .module-stat-label {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
  }

  .module-last-played {
    font-size: 0.9rem;
    color: var(--color-text-tertiary);
    text-align: center;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border-light);
  }



  /* Achievements Section */
  .achievements-section {
    margin-bottom: 3rem;
  }

  .achievements-count {
    font-size: 1rem;
    font-weight: 400;
    color: var(--color-text-secondary);
  }

  .achievements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .achievement-card {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .achievement-icon {
    font-size: 2.5rem;
    flex-shrink: 0;
  }

  .achievement-name {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 0.5rem;
  }

  .achievement-description {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    margin-bottom: 0.5rem;
  }

  .achievement-date {
    font-size: 0.8rem;
    color: var(--color-text-tertiary);
  }

  .achievement-status.locked {
    font-size: 0.8rem;
    color: var(--color-text-tertiary);
    font-style: italic;
  }

  /* Locked achievement styles */
  .achievement-card.locked {
    opacity: 0.5;
    filter: grayscale(0.7);
  }

  .achievement-icon.locked {
    opacity: 0.6;
    filter: grayscale(1);
  }

  .achievement-name.locked,
  .achievement-description.locked {
    opacity: 0.7;
  }





  /* Loading State */
  .loading-state {
    text-align: center;
    padding: 4rem;
    color: var(--color-text-primary);
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--color-border-light);
    border-top: 4px solid var(--color-accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Mobile Responsiveness */
  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .stat-card {
      padding: 1.25rem;
      gap: 1rem;
    }

    .stat-icon {
      width: 40px;
      height: 40px;
    }

    .stat-icon svg {
      width: 20px;
      height: 20px;
    }

    .stat-number {
      font-size: 1.75rem;
    }

    .stat-label {
      font-size: 0.875rem;
    }

    .modules-grid {
      grid-template-columns: 1fr;
    }

    .achievements-grid {
      grid-template-columns: 1fr;
    }

    .progress-wrapper .header-section {
      margin-bottom: 1rem;
    }
    
    .progress-wrapper .stats-section {
      margin-bottom: 2rem;
    }

    .module-stats {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 480px) {
    .stat-card {
      flex-direction: column;
      text-align: center;
      padding: 1rem;
      gap: 0.75rem;
    }

    .stat-icon {
      width: 36px;
      height: 36px;
    }

    .stat-icon svg {
      width: 18px;
      height: 18px;
    }

    .stat-number {
      font-size: 1.5rem;
    }

    .stat-label {
      font-size: 0.8rem;
      line-height: 1.2;
    }

    .stats-grid {
      gap: 0.75rem;
    }

    .achievement-card {
      flex-direction: column;
      text-align: center;
    }
  }

  /* Reset Progress Button */
  .reset-button-container {
    text-align: center;
    margin: 3rem 0;
  }

  .btn-reset {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-reset:hover:not(:disabled) {
    background: rgba(185, 28, 28, 0.9);
    color: white;
    border-color: #b91c1c;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(185, 28, 28, 0.4);
  }

  .btn-reset:disabled {
    background: rgba(156, 163, 175, 0.1);
    color: #9ca3af;
    border-color: rgba(156, 163, 175, 0.3);
    cursor: not-allowed;
    opacity: 0.6;
  }

  .btn-reset svg {
    width: 16px;
    height: 16px;
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(8px);
  }

  .modal-content {
    background: rgba(255, 255, 255, 0.98);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    max-width: 20rem;
    width: 90%;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(20px);
  }

  .modal-header {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .modal-icon {
    color: #f59e0b;
    margin: 0 auto 0.75rem;
    display: block;
  }

  .modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }

  .modal-subtitle {
    font-size: 0.875rem;
    color: #4b5563;
    line-height: 1.4;
  }

  .modal-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
  }

  .btn-cancel {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid #d1d5db;
    border-radius: 8px;
    color: #374151;
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
  }

  .btn-cancel:hover {
    background: rgba(255, 255, 255, 1);
    border-color: #9ca3af;
  }

  .btn-confirm-reset {
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
  }

  .btn-confirm-reset:hover {
    background: linear-gradient(135deg, #b91c1c, #991b1b);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(185, 28, 28, 0.4);
  }

  @media (max-width: 480px) {
    .modal-content {
      padding: 1.25rem;
      margin: 1rem;
      max-width: 18rem;
    }

    .modal-actions {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>
