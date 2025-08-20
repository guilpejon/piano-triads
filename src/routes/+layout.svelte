<script lang="ts">
  import '../app.css';
  import Navbar from '$lib/components/Navbar.svelte';
  import InstallPrompt from '$lib/components/InstallPrompt.svelte';
  import { preloadAudio } from '$lib/utils/audioUtils';
  import { onMount } from 'svelte';

  // Preload audio files and register service worker when the app loads
  onMount(() => {
    // Start preloading audio files in the background
    preloadAudio().catch((error) => {
      console.warn('Failed to preload some audio files:', error);
    });

    // Register service worker for PWA functionality (client-side only)
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, prompt user to refresh
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  });
</script>

<svelte:head>
  <title>Piano Triads - Master Piano Chords, Scales & Ear Training</title>
  <meta
    name="description"
    content="Master piano chords and scales with interactive lessons, practice modes, and ear training exercises"
  />

  <!-- PWA Meta Tags -->
  <meta name="theme-color" content="#3480f1" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Piano Triads" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="msapplication-TileColor" content="#3480f1" />
  <meta name="msapplication-tap-highlight" content="no" />

  <!-- Web App Manifest -->
  <link rel="manifest" href="/manifest.json" />

  <!-- Apple Touch Icons -->
  <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-96x96.png" />

  <!-- Microsoft Tiles -->
  <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />

  <!-- Viewport for mobile optimization -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
</svelte:head>

<div class="app-layout">
  <Navbar />

  <main class="main-content">
    <slot />
  </main>

  <footer class="app-footer">
    <div class="footer-container">
      <p class="footer-text">
        Made with <span class="heart">♥</span> by
        <a
          href="https://www.github.com/guilpejon"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-link"
        >
          guilpejon
        </a>
      </p>
    </div>
  </footer>
</div>

<!-- PWA Install Prompt -->
<InstallPrompt />

<style>
  .app-layout {
    min-height: 100vh;
    background: var(--color-background);
    display: flex;
    flex-direction: column;
  }

  .main-content {
    flex: 1;
  }

  .app-footer {
    background: #1f2937;
    color: white;
    padding: 1.5rem 0;
    margin-top: auto;
  }

  .footer-container {
    max-width: 72rem;
    margin: 0 auto;
    padding: 0 1.5rem;
    text-align: center;
  }

  .footer-text {
    font-size: 0.875rem;
    margin: 0;
  }

  .heart {
    color: #ef4444;
  }

  .footer-link {
    color: var(--color-accent);
    text-decoration: underline;
    transition: var(--transition-smooth);
  }

  .footer-link:hover {
    color: var(--color-accent-hover);
  }

  @media (max-width: 768px) {
    .footer-container {
      padding: 0 1.25rem;
    }
  }

  @media (max-width: 480px) {
    .footer-container {
      padding: 0 1rem;
    }
  }
</style>
