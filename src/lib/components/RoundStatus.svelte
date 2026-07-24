<script lang="ts">
  // Practice results used to be conveyed only by the colour of the piano keys, which reaches
  // neither screen reader users nor anyone who cannot separate the red from the green.
  // This pairs every result with a glyph and a sentence, inside a live region.
  //
  // The wrapper always renders, even when empty: a live region has to be in the DOM before
  // its contents change, or the change is never announced.

  export let state: 'waiting' | 'playing' | 'completed' | 'failed' = 'waiting';
  export let successText: string = 'Correct';
  export let failText: string = 'Incorrect';

  $: settled = state === 'completed' || state === 'failed';
</script>

<div class="round-status" role="status" aria-live="polite">
  {#if settled}
    <span class="badge" class:success={state === 'completed'} class:fail={state === 'failed'}>
      <span class="glyph" aria-hidden="true">{state === 'completed' ? '✓' : '✗'}</span>
      <span>{state === 'completed' ? successText : failText}</span>
    </span>
  {/if}
</div>

<style>
  .round-status {
    display: flex;
    justify-content: center;
    min-height: 2.5rem;
    padding: 0.25rem 0;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 999px;
    font-size: 1rem;
    font-weight: 600;
    border: 1px solid transparent;
  }

  .glyph {
    font-size: 1.125rem;
    line-height: 1;
  }

  .badge.success {
    color: #15803d;
    background: color-mix(in srgb, var(--color-success) 14%, var(--color-surface));
    border-color: color-mix(in srgb, var(--color-success) 35%, transparent);
  }

  .badge.fail {
    color: #b91c1c;
    background: color-mix(in srgb, var(--color-danger) 14%, var(--color-surface));
    border-color: color-mix(in srgb, var(--color-danger) 35%, transparent);
  }

  /* Dark needs a lighter ink than the light-mode greens/reds to stay readable on the tint. */
  @media (prefers-color-scheme: dark) {
    :global(:root:not([data-theme='light'])) .badge.success {
      color: #6ee7a0;
    }

    :global(:root:not([data-theme='light'])) .badge.fail {
      color: #fca5a5;
    }
  }

  :global(:root[data-theme='dark']) .badge.success {
    color: #6ee7a0;
  }

  :global(:root[data-theme='dark']) .badge.fail {
    color: #fca5a5;
  }
</style>
