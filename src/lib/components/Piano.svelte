<script>
  import { onMount } from 'svelte';

  /** @type {{ dataNote: string, src: string }[]} */
  export let audioNotes = [];
  export let showLabels = true;
  export let preferFlat = false; // if true, show flats for black keys

  // Fixed full-size keyboard dimensions; keep constant on all screens
  export let whiteKeyWidth = 70;
  export let whiteKeyHeight = 280;
  export let blackKeyWidth = 40;
  export let blackKeyHeight = 180;
  const whiteKeyGap = 2;

  const keys = [
    { type: 'white', label: 'C', noteIds: ['C3'] },
    { type: 'black', labels: ['C#', 'Db'], boundaryIndex: 1, noteIds: ['C#3', 'Db3'] },
    { type: 'white', label: 'D', noteIds: ['D3'] },
    { type: 'black', labels: ['D#', 'Eb'], boundaryIndex: 2, noteIds: ['D#3', 'Eb3'] },
    { type: 'white', label: 'E', noteIds: ['E3'] },
    { type: 'white', label: 'F', noteIds: ['F3'] },
    { type: 'black', labels: ['F#', 'Gb'], boundaryIndex: 4, noteIds: ['F#3', 'Gb3'] },
    { type: 'white', label: 'G', noteIds: ['G3'] },
    { type: 'black', labels: ['G#', 'Ab'], boundaryIndex: 5, noteIds: ['G#3', 'Ab3'] },
    { type: 'white', label: 'A', noteIds: ['A3'] },
    { type: 'black', labels: ['A#', 'Bb'], boundaryIndex: 6, noteIds: ['A#3', 'Bb3'] },
    { type: 'white', label: 'B', noteIds: ['B3'] },
    { type: 'white', label: 'C', noteIds: ['C4'] },
    { type: 'black', labels: ['C#', 'Db'], boundaryIndex: 8, noteIds: ['C#4', 'Db4'] },
    { type: 'white', label: 'D', noteIds: ['D4'] },
    { type: 'black', labels: ['D#', 'Eb'], boundaryIndex: 9, noteIds: ['D#4', 'Eb4'] },
    { type: 'white', label: 'E', noteIds: ['E4'] },
    { type: 'white', label: 'F', noteIds: ['F4'] },
    { type: 'black', labels: ['F#', 'Gb'], boundaryIndex: 11, noteIds: ['F#4', 'Gb4'] },
    { type: 'white', label: 'G', noteIds: ['G4'] },
    { type: 'black', labels: ['G#', 'Ab'], boundaryIndex: 12, noteIds: ['G#4', 'Ab4'] },
    { type: 'white', label: 'A', noteIds: ['A4'] },
    { type: 'black', labels: ['A#', 'Bb'], boundaryIndex: 13, noteIds: ['A#4', 'Bb4'] },
    { type: 'white', label: 'B', noteIds: ['B4'] }
  ];

  let noteToAudio = new Map();

  onMount(() => {
    // Build the lookup for fast playback
    for (const an of audioNotes) {
      const el = document.querySelector(`audio[data-note="${an.dataNote}"]`);
      if (el) noteToAudio.set(an.dataNote, el);
    }
  });

  /** @param {string[]} noteIds */
  function play(noteIds) {
    for (const id of noteIds) {
      const audio = noteToAudio.get(id);
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
    }
    console.log('Played note:', noteIds[0]);
  }

  /** @param {[string,string]} labels */
  function blackLabel(labels) {
    return preferFlat ? labels[1] : labels[0];
  }
</script>

{#if audioNotes.length}
  {#each audioNotes as a}
    <audio data-note={a.dataNote} src={a.src} preload="none" />
  {/each}
{/if}

<div class="piano-container">
  <div
    class="piano"
    style={`--whiteW:${whiteKeyWidth}px; --whiteH:${whiteKeyHeight}px; --blackW:${blackKeyWidth}px; --blackH:${blackKeyHeight}px; --gap:${whiteKeyGap}px;`}
  >
    <div class="relative flex">
      {#each keys as key}
        {#if key.type === 'white'}
          <button
            type="button"
            class="white-key"
            aria-label={`Piano key ${key.label}`}
            on:click={() => play(key.noteIds)}
          >
            {#if showLabels}
              <span class="key-label white">{key.label}</span>
            {/if}
          </button>
        {/if}
      {/each}

      <div class="absolute top-0 left-0">
        {#each keys as key}
          {#if key.type === 'black' && key.boundaryIndex !== undefined}
            <button
              type="button"
              class="black-key"
              style={`--b:${key.boundaryIndex}`}
              aria-label={`Piano key ${blackLabel(/** @type {[string,string]} */(key.labels || ['#','b']))}`}
              on:click={() => play(key.noteIds)}
            >
              {#if showLabels}
                <span class="key-label black">{blackLabel(/** @type {[string,string]} */(key.labels || ['#','b']))}</span>
              {/if}
            </button>
          {/if}
        {/each}
      </div>
    </div>
  </div>
  
</div>

<style>
  .piano-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    overflow-x: auto;
    padding: 0 0.5rem;
  }

  .piano {
    background: linear-gradient(135deg, #2c3e50, #34495e);
    border: 3px solid #1a252f;
    border-radius: 1.5rem;
    padding: 24px;
    flex-shrink: 0;
    width: calc(var(--whiteW) * 14 + var(--gap) * 13);
  }

  .white-key {
    width: var(--whiteW);
    height: var(--whiteH);
    margin-right: var(--gap);
    position: relative;
    z-index: 1;
    background: linear-gradient(to bottom, #ffffff, #f8f9fa);
    border: 2px solid #dee2e6;
    border-bottom-left-radius: 0.75rem;
    border-bottom-right-radius: 0.75rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), inset 0 1px 3px rgba(255, 255, 255, 0.3);
  }
  .white-key:last-child { margin-right: 0; }
  .white-key:hover { transform: translateY(1px); }
  .white-key:active { transform: translateY(2px); }

  .black-key {
    position: absolute;
    z-index: 2;
    width: var(--blackW);
    height: var(--blackH);
    background: linear-gradient(to bottom, #343a40, #212529);
    border: 1px solid #000000;
    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.1);
    left: calc(var(--whiteW) * var(--b) + var(--gap) * var(--b) - var(--blackW) / 2);
  }
  .black-key:hover { transform: translateY(1px); }
  .black-key:active { transform: translateY(2px); }

  .key-label {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    font-weight: 600;
    user-select: none;
    pointer-events: none;
  }
  .key-label.white { color: #444; }
  .key-label.black { color: #eee; bottom: 6px; }

  @media (min-width: 1200px) {
    .piano-container { padding: 0; }
  }
</style>


