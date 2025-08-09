<div class="home-page">
  <div class="container">
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
        <a href="/chord-dictionary" class="feature-card">
          <div class="card-icon chord-icon">
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div class="card-content">
            <h2 class="card-title">Chord Dictionary</h2>
            <p class="card-description">Explore and learn piano chord fingerings and progressions</p>
          </div>
          <div class="card-arrow">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </a>

        <a href="/chord-practice" class="feature-card">
          <div class="card-icon practice-icon">
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <div class="card-content">
            <h2 class="card-title">Chord Practice</h2>
            <p class="card-description">Practice chord progressions and improve your playing skills</p>
          </div>
          <div class="card-arrow">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </a>

        <a href="/learn-scales" class="feature-card">
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

        <a href="/pitch-training" class="feature-card">
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

    <!-- Footer -->
    <footer class="footer-section">
      <p class="footer-text">Start your musical journey today</p>
    </footer>
  </div>
</div>

<style>
  .home-page {
    background: #ffffff;
    min-height: 100vh;
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    width: 100%;
  }

  /* Header Section */
  .header-section {
    padding: 80px 0 64px 0;
    text-align: center;
  }

  .header-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .main-title {
    font-size: clamp(56px, 8vw, 96px);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.05;
    color: #1d1d1f;
    margin: 0 0 32px;
    background: linear-gradient(135deg, #1d1d1f 0%, #424245 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .main-subtitle {
    font-size: 24px;
    font-weight: 400;
    line-height: 1.48;
    color: #86868b;
    margin: 0;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  /* Features Section */
  .features-section {
    padding: 0 0 80px 0;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
    max-width: 1000px;
    margin: 0 auto;
  }

  .feature-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 20px;
    padding: 32px;
    text-decoration: none;
    color: inherit;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    backdrop-filter: blur(20px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    display: flex;
    align-items: center;
    gap: 20px;
    position: relative;
    overflow: hidden;
  }

  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);
    border-color: rgba(0, 0, 0, 0.12);
  }

  .feature-card:hover .card-arrow {
    transform: translateX(4px);
    opacity: 1;
  }

  .card-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }

  .chord-icon {
    background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
    color: white;
  }

  .practice-icon {
    background: linear-gradient(135deg, #34C759 0%, #248A3D 100%);
    color: white;
  }

  .scales-icon {
    background: linear-gradient(135deg, #AF52DE 0%, #8E44AD 100%);
    color: white;
  }

  .pitch-icon {
    background: linear-gradient(135deg, #FF9500 0%, #FF6B35 100%);
    color: white;
  }

  .card-content {
    flex: 1;
  }

  .card-title {
    font-size: 22px;
    font-weight: 600;
    color: #1d1d1f;
    margin: 0 0 8px 0;
    line-height: 1.3;
  }

  .card-description {
    font-size: 17px;
    font-weight: 400;
    color: #86868b;
    margin: 0;
    line-height: 1.4;
  }

  .card-arrow {
    color: #86868b;
    transition: all 0.3s ease;
    opacity: 0.7;
    transform: translateX(0);
  }

  /* Footer Section */
  .footer-section {
    padding: 40px 0 80px 0;
    text-align: center;
  }

  .footer-text {
    font-size: 17px;
    color: #86868b;
    margin: 0;
    font-weight: 400;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .container {
      padding: 0 20px;
    }

    .header-section {
      padding: 60px 0 48px 0;
    }

    .main-subtitle {
      font-size: 20px;
    }

    .features-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .feature-card {
      padding: 24px;
      flex-direction: column;
      text-align: center;
      gap: 16px;
    }

    .card-content {
      text-align: center;
    }

    .card-arrow {
      display: none;
    }

    .features-section {
      padding: 0 0 60px 0;
    }

    .footer-section {
      padding: 32px 0 60px 0;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 0 16px;
    }

    .header-section {
      padding: 48px 0 40px 0;
    }

    .main-subtitle {
      font-size: 18px;
    }

    .feature-card {
      padding: 20px;
    }

    .card-icon {
      width: 48px;
      height: 48px;
    }

    .card-title {
      font-size: 20px;
    }

    .card-description {
      font-size: 16px;
    }
  }
</style>
