<svelte:head>
	<title>Piano Triads - Master Piano Chords, Scales & Ear Training</title>
	<meta name="description" content="Master piano chords and scales" />
</svelte:head>

<div class="home-wrapper">
  <div class="page-container">
    <!-- Header Section -->
    <header class="header-section">
      <div class="header-content">
        <h1 class="main-title">Piano Triads</h1>
        <p class="main-subtitle">Master piano chords, scales, and ear training with interactive lessons</p>
      </div>
    </header>

    <!-- Features Grid -->
    <section class="features-section">
      <div class="features-grid">
        <a href="/chord-dictionary" class="glass-card feature-card">
          <div class="card-icon chord-icon">
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div class="card-content">
            <h2 class="card-title">Chord Dictionary</h2>
            <p class="card-description">Explore and learn the main piano chords</p>
          </div>
          <div class="card-arrow">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </a>

        <a href="/chord-practice" class="glass-card feature-card">
          <div class="card-icon practice-icon">
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <div class="card-content">
            <h2 class="card-title">Chord Practice</h2>
            <p class="card-description">Practice building chords note by note</p>
          </div>
          <div class="card-arrow">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </a>

        <a href="/learn-scales" class="glass-card feature-card">
          <div class="card-icon scales-icon">
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div class="card-content">
            <h2 class="card-title">Learn Scales</h2>
            <p class="card-description">Master major, minor, and exotic scales with interactive lessons</p>
          </div>
          <div class="card-arrow">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </a>

        <a href="/pitch-training" class="glass-card feature-card">
          <div class="card-icon pitch-icon">
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </div>
          <div class="card-content">
            <h2 class="card-title">Pitch Training</h2>
            <p class="card-description">Develop perfect pitch and interval recognition skills</p>
          </div>
          <div class="card-arrow">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
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
		.header-section {
			margin-bottom: 1rem;
			h1 {
				margin-bottom: 2rem;
			}
		}
  }

  /* Features section */
  .features-section {
    padding-bottom: 5rem;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    max-width: 64rem;
    margin: 0 auto;
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

  /* Responsive Design */
  @media (max-width: 768px) {
    .features-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .feature-card {
      padding: 1.5rem;
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }

    .card-content {
      text-align: center;
    }

    .card-arrow {
      display: none;
    }
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
  }
</style>
