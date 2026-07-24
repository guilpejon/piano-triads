<script lang="ts">
  // Segmented difficulty control shared by the practice pages. The pages own the state
  // (persisted in progress preferences); this only renders and dispatches.
  import { createEventDispatcher } from 'svelte';
  import {
    DIFFICULTY_LABELS,
    DIFFICULTY_SETTINGS,
    type Difficulty
  } from '$lib/utils/progressUtils';

  export let value: Difficulty = 'standard';
  export let mode: 'chordPractice' | 'pitchTraining' | 'musicReading' | 'chordQuiz';
  // Override for pages where the mistake cap doesn't tell the whole story
  // (pitch training's note mode is always a single guess).
  export let mistakesText: string | undefined = undefined;

  const dispatch = createEventDispatcher<{ change: Difficulty }>();
  const levels: Difficulty[] = ['relaxed', 'standard', 'challenge'];

  $: settings = DIFFICULTY_SETTINGS[value][mode];
</script>

<div class="difficulty">
  <div class="difficulty-picker" role="group" aria-label="Difficulty">
    {#each levels as level}
      <button
        type="button"
        class="difficulty-option"
        class:selected={value === level}
        aria-pressed={value === level}
        on:click={() => dispatch('change', level)}
      >
        {DIFFICULTY_LABELS[level]}
      </button>
    {/each}
  </div>
  <p class="difficulty-hint">
    {settings.seconds}s per round · {mistakesText ?? `${settings.mistakes} mistakes allowed`}
  </p>
</div>

<style>
  .difficulty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
    /* Take a full row inside the pages' wrapping flex controls container. */
    flex-basis: 100%;
  }

  .difficulty-picker {
    display: inline-flex;
    padding: 0.25rem;
    gap: 0.25rem;
    background: var(--color-surface-subtle);
    border: 1px solid var(--color-border-light);
    border-radius: 999px;
  }

  .difficulty-option {
    padding: 0.375rem 1rem;
    border: none;
    border-radius: 999px;
    background: transparent;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-smooth);
  }

  .difficulty-option:hover {
    color: var(--color-text-primary);
  }

  .difficulty-option.selected {
    background: var(--color-surface-solid);
    color: var(--color-text-primary);
    box-shadow: var(--shadow-sm);
  }

  .difficulty-hint {
    margin: 0;
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }
</style>
