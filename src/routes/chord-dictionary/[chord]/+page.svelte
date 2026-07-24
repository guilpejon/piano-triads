<script lang="ts">
  import MusicScore from '$lib/components/MusicScore.svelte';
  import { playChord } from '$lib/utils/audioUtils';
  import { chordSlug, getNoteNameOnly } from '$lib/utils/chordUtils';
  import type { PageData } from './$types';

  export let data: PageData;

  // Inversions are optional per chord — extended chords only carry a root position.
  $: voicings = [
    { label: 'Root position', notes: data.chord.root_position },
    { label: 'First inversion', notes: data.chord.first_inversion },
    { label: 'Second inversion', notes: data.chord.second_inversion },
    { label: 'Third inversion', notes: data.chord.third_inversion }
  ].filter((voicing): voicing is { label: string; notes: string[] } => Boolean(voicing.notes));

  $: noteNames = data.chord.root_position.map(getNoteNameOnly);
</script>

<div class="chord-page-wrapper">
  <div class="page-container">
    <nav class="navigation">
      <a href="/chord-dictionary" class="btn-glass">
        <svg class="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span>Chord Dictionary</span>
      </a>
    </nav>

    <header class="header-section">
      <div class="header-content">
        <h1 class="main-title">{data.display}</h1>
        <p class="page-description">
          The {data.display} chord is built from {noteNames.join(', ')}.
          {#if data.toneRule}
            Scale degrees {data.toneRule}.
          {/if}
        </p>
      </div>
    </header>

    <section class="chord-detail">
      <div class="glass-card score-card">
        <MusicScore activeNotes={data.chord.root_position} chordName={data.display} />
      </div>

      <div class="glass-card notes-card">
        <h2 class="card-heading">Notes</h2>
        <ul class="note-list">
          {#each noteNames as note}
            <li class="note-chip">{note}</li>
          {/each}
        </ul>

        <button class="play-button" on:click={() => playChord(data.chord.root_position)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="8,5 19,12 8,19" />
          </svg>
          Hear it
        </button>
      </div>
    </section>

    <section class="voicings">
      <h2 class="section-title">Inversions</h2>
      <div class="voicing-grid">
        {#each voicings as voicing}
          <div class="glass-card voicing-card">
            <h3 class="voicing-label">{voicing.label}</h3>
            <p class="voicing-notes">{voicing.notes.map(getNoteNameOnly).join(' – ')}</p>
            <button class="voicing-play" on:click={() => playChord(voicing.notes)}>
              Play {voicing.label.toLowerCase()}
            </button>
          </div>
        {/each}
      </div>
      {#if voicings.length === 1}
        <p class="voicing-note">
          Extended chords are shown in root position; the inversions are rarely used in practice.
        </p>
      {/if}
    </section>

    <section class="explore">
      <a href="/chord-dictionary?chord={data.name}" class="explore-link">
        Open {data.display} in the interactive dictionary
      </a>
      <a href="/chord-practice" class="explore-link secondary">Practice building chords</a>
    </section>
  </div>
</div>

<style>
  .chord-page-wrapper {
    padding: 2rem 0 4rem;
  }

  .chord-detail {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .score-card,
  .notes-card {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .card-heading {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
  }

  .note-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .note-chip {
    padding: 0.5rem 0.875rem;
    border-radius: 0.625rem;
    background: var(--color-surface-subtle);
    border: 1px solid var(--color-border-light);
    color: var(--color-text-primary);
    font-weight: 600;
  }

  .play-button,
  .voicing-play {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0.75rem;
    border: 1px solid var(--color-border-light);
    background: var(--color-surface-subtle);
    color: var(--color-text-primary);
    font-size: 0.9375rem;
    cursor: pointer;
    transition: var(--transition-smooth);
  }

  .play-button:hover,
  .voicing-play:hover {
    background: var(--color-surface-subtle-hover);
    border-color: var(--color-border-medium);
  }

  .section-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--color-text-primary);
    text-align: center;
    margin: 0 0 1.5rem;
  }

  .voicing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
  }

  .voicing-card {
    padding: 1.25rem;
    text-align: center;
  }

  .voicing-label {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 0.5rem;
  }

  .voicing-notes {
    font-size: 1.125rem;
    color: var(--color-text-secondary);
    margin: 0 0 1rem;
  }

  .voicing-note {
    text-align: center;
    color: var(--color-text-tertiary);
    font-size: 0.875rem;
    margin-top: 1rem;
  }

  .explore {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
    margin-top: 3rem;
  }

  .explore-link {
    padding: 0.75rem 1.25rem;
    border-radius: 0.875rem;
    background: var(--gradient-blue);
    color: #ffffff;
    text-decoration: none;
    font-weight: 600;
    transition: var(--transition-smooth);
  }

  .explore-link.secondary {
    background: var(--color-surface-subtle);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border-light);
  }

  .explore-link:hover {
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    .chord-detail {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
