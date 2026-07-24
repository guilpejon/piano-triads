<script lang="ts">
  import { onMount } from 'svelte';

  let deferredPrompt: any = null;
  let showInstallPrompt = false;
  let isInstalled = false;
  let isMobileDevice = false;

  // Service worker update state. vite-plugin-pwa is configured with registerType: 'prompt',
  // so a new build waits for the user to accept it rather than swapping under them.
  let needsRefresh = false;
  let applyUpdate: (reloadPage?: boolean) => Promise<void> = async () => {};

  // Register the service worker. Imported dynamically so the virtual module never runs during
  // SSR. This is the app's only registration — nothing else may call navigator.serviceWorker.
  onMount(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    try {
      const { registerSW } = await import('virtual:pwa-register');
      applyUpdate = registerSW({
        onNeedRefresh() {
          needsRefresh = true;
        },
        onRegisterError(error) {
          console.error('Service Worker registration failed:', error);
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });

  function reloadForUpdate() {
    needsRefresh = false;
    void applyUpdate(true);
  }

  function dismissUpdate() {
    needsRefresh = false;
  }

  onMount(() => {
    // Ensure we're running in the browser
    if (typeof window === 'undefined') return;

    // Check if this is a mobile device
    const checkMobileDevice = () => {
      // Check for mobile user agents
      const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent);
      
      // Check for touch capability and screen size
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 1024; // Tablet and below
      
      return isMobileUserAgent || (isTouchDevice && isSmallScreen);
    };

    isMobileDevice = checkMobileDevice();

    // Only proceed if this is a mobile device
    if (!isMobileDevice) {
      return;
    }

    // Check if app is already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      isInstalled = true;
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e;
      // Show the install prompt
      showInstallPrompt = true;
    };

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      showInstallPrompt = false;
      isInstalled = true;
      deferredPrompt = null;
    };

    // Handle window resize to re-check mobile status
    const handleResize = () => {
      const wasMobile = isMobileDevice;
      isMobileDevice = checkMobileDevice();
      
      // If device changed from mobile to desktop, hide the prompt
      if (wasMobile && !isMobileDevice) {
        showInstallPrompt = false;
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('resize', handleResize);

    // Cleanup event listeners
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
        window.removeEventListener('resize', handleResize);
      }
    };
  });

  async function handleInstallClick() {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Clear the deferredPrompt
    deferredPrompt = null;
    showInstallPrompt = false;
  }

  function dismissPrompt() {
    showInstallPrompt = false;
    // Hide for this session (browser only)
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem('installPromptDismissed', 'true');
    }
  }

  // Check if prompt was dismissed in this session (additional onMount for session check)
  onMount(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      if (sessionStorage.getItem('installPromptDismissed')) {
        showInstallPrompt = false;
      }
    }
  });
</script>

{#if needsRefresh}
  <div class="install-prompt" role="banner" aria-label="Update available">
    <div class="install-content">
      <div class="install-icon">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 4v6h6M20 20v-6h-6M20 9a8 8 0 0 0-14.1-3.4L4 10m16 4-1.9 4.4A8 8 0 0 1 4 15"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div class="install-text">
        <h3>Update available</h3>
        <p>Reload to get the latest version.</p>
      </div>
      <div class="install-actions">
        <button on:click={reloadForUpdate} class="install-button primary"> Reload </button>
        <button
          on:click={dismissUpdate}
          class="install-button secondary"
          aria-label="Dismiss update prompt"
        >
          ×
        </button>
      </div>
    </div>
  </div>
{/if}

{#if showInstallPrompt && !isInstalled && isMobileDevice}
  <div class="install-prompt" role="banner" aria-label="Install app prompt">
    <div class="install-content">
      <div class="install-icon">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div class="install-text">
        <h3>Install Piano Triads</h3>
        <p>Get quick access and learn offline!</p>
      </div>
      <div class="install-actions">
        <button on:click={handleInstallClick} class="install-button primary"> Install </button>
        <button
          on:click={dismissPrompt}
          class="install-button secondary"
          aria-label="Dismiss install prompt"
        >
          ×
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .install-prompt {
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    background: var(--color-surface);
    backdrop-filter: blur(20px);
    border: 1px solid var(--color-border-light);
    border-radius: 16px;
    box-shadow: var(--shadow-lg);
    z-index: 1001;
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .install-content {
    display: flex;
    align-items: center;
    padding: 16px;
    gap: 12px;
  }

  .install-icon {
    color: var(--color-accent);
    flex-shrink: 0;
  }

  .install-text {
    flex: 1;
    min-width: 0;
  }

  .install-text h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
    line-height: 1.2;
  }

  .install-text p {
    margin: 2px 0 0;
    font-size: 14px;
    color: var(--color-text-secondary);
    line-height: 1.3;
  }

  .install-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .install-button {
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition-smooth);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .install-button.primary {
    background: var(--color-accent);
    color: white;
    padding: 8px 16px;
  }

  .install-button.primary:hover {
    background: var(--color-accent-hover);
    transform: translateY(-1px);
  }

  .install-button.secondary {
    background: rgba(0, 0, 0, 0.05);
    color: var(--color-text-secondary);
    padding: 8px;
    width: 32px;
    height: 32px;
    font-size: 18px;
    line-height: 1;
  }

  .install-button.secondary:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  /* Mobile adjustments */
  @media (max-width: 480px) {
    .install-prompt {
      left: 16px;
      right: 16px;
      bottom: 16px;
    }

    .install-content {
      padding: 14px;
    }

    .install-text h3 {
      font-size: 15px;
    }

    .install-text p {
      font-size: 13px;
    }
  }

  /* Hide on very small screens or when keyboard is open */
  @media (max-height: 500px) {
    .install-prompt {
      display: none;
    }
  }
</style>
