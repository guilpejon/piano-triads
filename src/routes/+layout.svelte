<script lang="ts">
  import '../app.css';
  import Navbar from '$lib/components/Navbar.svelte';
  import InstallPrompt from '$lib/components/InstallPrompt.svelte';
  import SEOHead from '$lib/components/SEOHead.svelte';
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

<!-- SEO Meta Tags managed by SEOHead component -->
<SEOHead />

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
