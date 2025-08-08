<script>
  import Piano from '$lib/components/Piano.svelte';
</script>

<div class="chord-dictionary-page">
  <div class="container">
    <!-- Navigation -->
    <nav class="navigation">
      <a href="/" class="back-button">
        <svg class="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Home</span>
      </a>
    </nav>

    <!-- Header Section -->
    <header class="header-section">
      <div class="header-content">
        <h1 class="main-title">Chord Dictionary</h1>
        <p class="main-subtitle">Explore and learn piano chord fingerings and progressions with our interactive piano interface.</p>
      </div>
    </header>

    <!-- Piano Section -->
    <section class="piano-section">
      <div class="piano-container">
        <Piano />
      </div>
    </section>
  </div>
</div>

<style>
  .chord-dictionary-page {
    background: #ffffff;
    position: relative;
    width: 100%;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    width: 100%;
  }

  /* Navigation */
  .navigation {
    padding: 32px 0 24px;
  }

  .back-button {
    display: inline-flex;
    align-items: center;
    font-size: 16px;
    font-weight: 400;
    color: #1d1d1f;
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    padding: 8px 12px;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.02);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 0, 0, 0.04);
  }

  .back-button:hover {
    background: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  .back-icon {
    width: 18px;
    height: 18px;
    margin-right: 8px;
    stroke-width: 1.5;
  }

  /* Header Section */
  .header-section {
    padding: 48px 0 80px;
    text-align: center;
  }

  .header-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .main-title {
    font-size: clamp(48px, 8vw, 80px);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.05;
    color: #1d1d1f;
    margin: 0 0 24px;
    background: linear-gradient(135deg, #1d1d1f 0%, #424245 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .main-subtitle {
    font-size: 21px;
    font-weight: 400;
    line-height: 1.48;
    color: #6e6e73;
    margin: 0;
    max-width: 600px;
    margin: 0 auto;
  }

  /* Piano Section */
  .piano-section {
    padding: 0 0 120px;
  }

  .piano-container {
    background: transparent;
    padding: 48px 32px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .container {
      padding: 0 20px;
    }

    .navigation {
      padding: 24px 0 20px;
    }

    .header-section {
      padding: 32px 0 48px;
    }

    .main-subtitle {
      font-size: 19px;
    }

    .piano-container {
      padding: 32px 20px;
    }

    .piano-section {
      padding: 0 0 80px;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 0 16px;
    }

    .piano-container {
      padding: 24px 16px;
    }
  }
</style>