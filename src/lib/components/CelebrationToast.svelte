<script lang="ts">
  // Toast stack for celebration events, mounted once in +layout.svelte. Like RoundStatus,
  // the live region wrapper always renders so screen readers announce content changes.
  import { onDestroy } from 'svelte';
  import { fly } from 'svelte/transition';
  import {
    celebrations,
    dismissCelebration,
    type CelebrationEvent
  } from '$lib/stores/celebrationStore';

  const AUTO_DISMISS_MS = 4500;

  // Skip the entrance animation when the OS asks for reduced motion; the toast itself stays.
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const timers = new Map<number, ReturnType<typeof setTimeout>>();

  $: scheduleDismissals($celebrations);

  function scheduleDismissals(events: CelebrationEvent[]) {
    for (const event of events) {
      if (timers.has(event.id)) continue;
      timers.set(
        event.id,
        setTimeout(() => {
          timers.delete(event.id);
          dismissCelebration(event.id);
        }, AUTO_DISMISS_MS)
      );
    }
  }

  function close(id: number) {
    const timer = timers.get(id);
    if (timer) clearTimeout(timer);
    timers.delete(id);
    dismissCelebration(id);
  }

  function icon(event: CelebrationEvent): string {
    if (event.type === 'achievement') return event.achievement.icon;
    if (event.type === 'streak') return '🔥';
    return '🏆';
  }

  function title(event: CelebrationEvent): string {
    if (event.type === 'achievement') return `Achievement unlocked: ${event.achievement.name}`;
    if (event.type === 'streak') return `${event.count} in a row!`;
    return 'New record!';
  }

  function detail(event: CelebrationEvent): string {
    if (event.type === 'achievement') return event.achievement.description;
    if (event.type === 'streak') return 'Keep the streak going';
    return event.label;
  }

  onDestroy(() => {
    for (const timer of timers.values()) clearTimeout(timer);
    timers.clear();
  });
</script>

<div class="toast-stack" role="status" aria-live="polite">
  {#each $celebrations as event (event.id)}
    <div class="toast" transition:fly={{ y: -16, duration: reduceMotion ? 0 : 250 }}>
      <span class="toast-icon" aria-hidden="true">{icon(event)}</span>
      <div class="toast-body">
        <span class="toast-title">{title(event)}</span>
        <span class="toast-detail">{detail(event)}</span>
      </div>
      <button class="toast-close" on:click={() => close(event.id)} aria-label="Dismiss">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  {/each}
</div>

<style>
  .toast-stack {
    position: fixed;
    top: 4.5rem; /* below the navbar */
    right: 1rem;
    z-index: 1100;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: min(22rem, calc(100vw - 2rem));
    pointer-events: none;
  }

  .toast {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border-medium);
    border-radius: 1rem;
    box-shadow: var(--shadow-lg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    pointer-events: auto;
  }

  .toast-icon {
    font-size: 1.5rem;
    line-height: 1.3;
  }

  .toast-body {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  .toast-title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-text-primary);
    line-height: 1.3;
  }

  .toast-detail {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    line-height: 1.4;
  }

  .toast-close {
    margin-left: auto;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border: none;
    border-radius: 0.5rem;
    background: transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: var(--transition-smooth);
  }

  .toast-close:hover {
    background: var(--color-surface-subtle-hover);
    color: var(--color-text-primary);
  }

  @media (max-width: 480px) {
    .toast-stack {
      right: 0.75rem;
      left: 0.75rem;
      max-width: none;
    }
  }
</style>
