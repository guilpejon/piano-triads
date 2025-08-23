<script lang="ts">
  import { playNote } from '$lib/utils/audioUtils';
  import { onMount, afterUpdate, onDestroy } from 'svelte';

  // Props to control which enharmonic notation to show
  export let chordNotes: string[] = []; // Notes in the current chord to determine correct notation
  export let autoScrollToActiveKey: boolean = true; // Enable/disable auto-scroll feature
  export let stickyOnMobile: boolean = false; // Enable sticky positioning on mobile devices
  export let showOctaveMarkers: boolean = false; // Show C3 and C4 octave reference markers

  // Keyboard mapping for piano keys
  const keyboardMapping: { [key: string]: string } = {
    // White keys (C3-B4) mapped to bottom row: A S D F G H J K L ; Z X C V
    'a': 'C3', 's': 'D3', 'd': 'E3', 'f': 'F3', 'g': 'G3', 'h': 'A3', 'j': 'B3',
    'k': 'C4', 'l': 'D4', ';': 'E4', 'z': 'F4', 'x': 'G4', 'c': 'A4', 'v': 'B4',
    
    // Black keys (C#3-A#4) mapped to top row: Q W E R T Y U I O P
    'q': 'C#3/Db3', 'w': 'D#3/Eb3', 'e': 'F#3/Gb3', 'r': 'G#3/Ab3', 't': 'A#3/Bb3',
    'y': 'C#4/Db4', 'u': 'D#4/Eb4', 'i': 'F#4/Gb4', 'o': 'G#4/Ab4', 'p': 'A#4/Bb4'
  };

  let activeKeys = new Set<string>(); // Track currently pressed keys for visual feedback
  let showKeyboardHelp = false; // Toggle for keyboard mapping help

  // Handle key press (click or keyboard)
  function handleKeyPress(event: Event): void {
    const target = event.target as HTMLElement;
    const noteData = target.closest('.key')?.getAttribute('data-note');

    if (noteData) {
      playNote(noteData);
    }
  }

  // Handle keyboard events for accessibility
  function handleKeyDown(event: KeyboardEvent): void {
    // Play on Enter or Space key
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleKeyPress(event);
    }
  }

  // Global keyboard event handlers for piano control
  function handleGlobalKeyDown(event: KeyboardEvent): void {
    // Ignore if user is typing in an input field
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement || 
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === 'true') {
      return;
    }

    const key = event.key.toLowerCase();
    const noteData = keyboardMapping[key];
    
    if (noteData && !activeKeys.has(key)) {
      event.preventDefault();
      activeKeys.add(key);
      activeKeys = activeKeys; // Trigger reactivity
      playNote(noteData);
      
      // Add visual feedback to the corresponding piano key
      const pianoKey = document.querySelector(`[data-note="${noteData}"]`) as HTMLElement;
      if (pianoKey) {
        pianoKey.classList.add('keyboard-active');
      }
    }
  }

  function handleGlobalKeyUp(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    const noteData = keyboardMapping[key];
    
    if (noteData && activeKeys.has(key)) {
      activeKeys.delete(key);
      activeKeys = activeKeys; // Trigger reactivity
      
      // Remove visual feedback from the corresponding piano key
      const pianoKey = document.querySelector(`[data-note="${noteData}"]`) as HTMLElement;
      if (pianoKey) {
        pianoKey.classList.remove('keyboard-active');
      }
    }
  }

  // Reactive function to determine which notation to show for black keys
  $: getPreferredNotation = (sharpNote: string, flatNote: string): string => {
    if (chordNotes.length === 0) {
      // Default to sharp notation if no chord context
      return sharpNote;
    }

    // Extract note names without octave numbers
    const sharpNoteName = sharpNote.replace(/[0-9]/g, '');
    const flatNoteName = flatNote.replace(/[0-9]/g, '');

    // Check if any chord note matches the sharp or flat version (more precise matching)
    const hasSharp = chordNotes.some((note) => {
      const noteName = note.replace(/[0-9]/g, '');
      return noteName === sharpNoteName;
    });

    const hasFlat = chordNotes.some((note) => {
      const noteName = note.replace(/[0-9]/g, '');
      return noteName === flatNoteName;
    });

    // Prefer the notation that matches the chord
    if (hasFlat && !hasSharp) return flatNote;
    if (hasSharp && !hasFlat) return sharpNote;

    // If both or neither match, use music theory rules for common chord contexts
    // Check the root note of the chord to determine key signature preference
    if (chordNotes.length > 0) {
      const rootNote = chordNotes[0].replace(/[0-9]/g, '');

      // Flat keys prefer flat notation: F, Bb, Eb, Ab, Db, Gb, Cb
      const flatKeys = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];
      if (flatKeys.includes(rootNote)) {
        return flatNote;
      }

      // Sharp keys prefer sharp notation: G, D, A, E, B, F#, C#
      const sharpKeys = ['G', 'D', 'A', 'E', 'B', 'F#', 'C#'];
      if (sharpKeys.includes(rootNote)) {
        return sharpNote;
      }
    }

    // Default to sharp if no clear preference
    return sharpNote;
  };

  // Function to scroll to the first active key
  function scrollToFirstActiveKey() {
    if (!autoScrollToActiveKey || typeof window === 'undefined') return;

    // Only scroll on mobile/tablet devices
    if (window.innerWidth > 1100) return;

    const pianoContainer = document.querySelector('.piano') as HTMLElement;
    if (!pianoContainer) return;

    // Find the first active key (with chord-active, scale-active, or practice-correct class)
    const firstActiveKey = pianoContainer.querySelector(
      '.key.chord-active, .key.scale-active, .key.practice-correct, .key.practice-failed'
    ) as HTMLElement;

    if (firstActiveKey) {
      // Calculate the scroll position to center the first active key
      const containerWidth = pianoContainer.clientWidth;
      const keyPosition = firstActiveKey.offsetLeft;
      const keyWidth = firstActiveKey.offsetWidth;

      // Center the key in the viewport, but don't scroll past the beginning
      const scrollPosition = Math.max(0, keyPosition - containerWidth / 2 + keyWidth / 2);

      pianoContainer.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }

  // Scroll to active key when component mounts or updates
  onMount(() => {
    // Small delay to ensure DOM is fully rendered and CSS classes are applied
    setTimeout(scrollToFirstActiveKey, 100);
    
    // Add global keyboard event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleGlobalKeyDown);
      window.addEventListener('keyup', handleGlobalKeyUp);
    }
  });

  // Scroll when chordNotes change (when new chord/scale is selected)
  afterUpdate(() => {
    // Small delay to ensure CSS classes are updated
    setTimeout(scrollToFirstActiveKey, 50);
  });

  // Expose function to parent components for manual triggering
  export function scrollToActiveKey() {
    scrollToFirstActiveKey();
  }

  // Handle body padding for sticky piano (client-side only)
  onMount(() => {
    if (stickyOnMobile && window.innerWidth <= 600) {
      document.body.style.paddingBottom = '13rem';
    }
  });

  // Cleanup on component destroy
  onDestroy(() => {
    // Remove keyboard event listeners
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('keyup', handleGlobalKeyUp);
    }
    
    // Reset body padding if it was set
    if (typeof document !== 'undefined' && document.body.style.paddingBottom === '13rem') {
      document.body.style.paddingBottom = '';
    }
    
    // Clear any active keyboard visual feedback
    if (typeof document !== 'undefined') {
      const activeKeyElements = document.querySelectorAll('.key.keyboard-active');
      activeKeyElements.forEach(el => el.classList.remove('keyboard-active'));
    }
  });
</script>

<div class="piano" class:sticky-mobile={stickyOnMobile}>
  <!-- Octave 3 -->
  <button
    class="key white c"
    data-note="C3"
    aria-label="Piano key C"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-label="Note C">C</p>
    {#if showOctaveMarkers}
      <span class="octave-marker">C3</span>
    {/if}
  </button>
  <button
    class="key black cs"
    data-note="C#3/Db3"
    aria-label="Piano key C#"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-label="Note {getPreferredNotation('C#', 'Db')}">
      {getPreferredNotation('C#', 'Db')}
    </p>
  </button>
  <button
    class="key white d"
    data-note="D3"
    aria-label="Piano key D"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-label="Note D">D</p>
  </button>
  <button
    class="key black ds"
    data-note="D#3/Eb3"
    aria-label="Piano key D#"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-label="Note {getPreferredNotation('D#', 'Eb')}">
      {getPreferredNotation('D#', 'Eb')}
    </p>
  </button>
  <button
    class="key white e"
    data-note="E3"
    aria-label="Piano key E"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-label="Note E">E</p>
  </button>
  <button
    class="key white f"
    data-note="F3"
    aria-label="Piano key F"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-label="Note F">F</p>
  </button>
  <button
    class="key black fs"
    data-note="F#3/Gb3"
    aria-label="Piano key F#"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-label="Note {getPreferredNotation('F#', 'Gb')}">
      {getPreferredNotation('F#', 'Gb')}
    </p>
  </button>
  <button
    class="key white g"
    data-note="G3"
    aria-label="Piano key G"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-label="Note G">G</p>
  </button>
  <button
    class="key black gs"
    data-note="G#3/Ab3"
    aria-label="Piano key G#"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-label="Note {getPreferredNotation('G#', 'Ab')}">
      {getPreferredNotation('G#', 'Ab')}
    </p>
  </button>
  <button
    class="key white a"
    data-note="A3"
    aria-label="Piano key A"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-label="Note A">A</p>
  </button>
  <button
    class="key black as"
    data-note="A#3/Bb3"
    aria-label="Piano key A#"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-label="Note {getPreferredNotation('A#', 'Bb')}">
      {getPreferredNotation('A#', 'Bb')}
    </p>
  </button>
  <button
    class="key white b"
    data-note="B3"
    aria-label="Piano key B"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-label="Note B">B</p>
  </button>

  <!-- Octave 4 -->
  <button
    class="key white c"
    data-note="C4"
    aria-label="Piano key C"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-label="Note C">C</p>
    {#if showOctaveMarkers}
      <span class="octave-marker">C4</span>
    {/if}
  </button>
  <button
    class="key black cs"
    data-note="C#4/Db4"
    aria-label="Piano key C#"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-label="Note {getPreferredNotation('C#', 'Db')}">
      {getPreferredNotation('C#', 'Db')}
    </p>
  </button>
  <button
    class="key white d"
    data-note="D4"
    aria-label="Piano key D"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-label="Note D">D</p>
  </button>
  <button
    class="key black ds"
    data-note="D#4/Eb4"
    aria-label="Piano key D#"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-label="Note {getPreferredNotation('D#', 'Eb')}">
      {getPreferredNotation('D#', 'Eb')}
    </p>
  </button>
  <button
    class="key white e"
    data-note="E4"
    aria-label="Piano key E"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-label="Note E">E</p>
  </button>
  <button
    class="key white f"
    data-note="F4"
    aria-label="Piano key F"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-label="Note F">F</p>
  </button>
  <button
    class="key black fs"
    data-note="F#4/Gb4"
    aria-label="Piano key F#"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-label="Note {getPreferredNotation('F#', 'Gb')}">
      {getPreferredNotation('F#', 'Gb')}
    </p>
  </button>
  <button
    class="key white g"
    data-note="G4"
    aria-label="Piano key G"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-label="Note G">G</p>
  </button>
  <button
    class="key black gs"
    data-note="G#4/Ab4"
    aria-label="Piano key G#"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-label="Note {getPreferredNotation('G#', 'Ab')}">
      {getPreferredNotation('G#', 'Ab')}
    </p>
  </button>
  <button
    class="key white a"
    data-note="A4"
    aria-label="Piano key A"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-label="Note A">A</p>
  </button>
  <button
    class="key black as"
    data-note="A#4/Bb4"
    aria-label="Piano key A#"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-label="Note {getPreferredNotation('A#', 'Bb')}">
      {getPreferredNotation('A#', 'Bb')}
    </p>
  </button>
  <button
    class="key white b"
    data-note="B4"
    aria-label="Piano key B"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-label="Note B">B</p>
  </button>
</div>

<style>
  :root {
    --text-primary: #333;
    --text-light: #fff;
    --bg-primary: #fff;
    --bg-secondary: #eee;
    --bg-dark: #222;
    --border-light: #bbb;
    --border-dark: #000;
    --shadow-light: rgba(0, 0, 0, 0.1);
    --shadow-medium: rgba(0, 0, 0, 0.2);
    --shadow-dark: rgba(0, 0, 0, 0.5);
  }

  .piano {
    height: 18.875em;
    width: 62.2em;
    margin: auto;
    padding: 3em 0 0 3em;
    position: relative;
    border: 1px solid var(--border-dark);
    border-radius: 1em;
    background: var(--bg-dark);
    box-shadow:
      0 0 50px var(--shadow-dark) inset,
      0 1px rgba(212, 152, 125, 0.2) inset,
      0 5px 15px var(--shadow-dark);
    display: flex;
  }

  .key {
    margin: 0;
    padding: 0;
    border: none;
    background: none;
    position: relative;
    cursor: pointer;
    transition: all 0.1s ease;
    outline: none;
  }
  .key.white {
    height: 16em;
    width: 4em;
    z-index: 1;
    border-left: 1px solid var(--border-light);
    border-bottom: 1px solid var(--border-light);
    border-radius: 0 0 5px 5px;
    box-shadow:
      -1px 0 0 rgba(255, 255, 255, 0.8) inset,
      0 0 5px #ccc inset,
      0 0 3px var(--shadow-medium);
    background: linear-gradient(to bottom, var(--bg-secondary) 0%, var(--bg-primary) 100%);
  }

  .key.white:active,
  .key.white:focus {
    border-top: 1px solid #777;
    border-left: 1px solid #999;
    border-bottom: 1px solid #999;
    box-shadow:
      2px 0 3px var(--shadow-light) inset,
      -5px 5px 20px var(--shadow-medium) inset,
      0 0 3px var(--shadow-medium);
    background: linear-gradient(to bottom, var(--bg-primary) 0%, #e9e9e9 100%);
  }
  .key.white:hover {
    border-left: 1px solid #999;
    border-bottom: 1px solid #999;
    background: linear-gradient(to bottom, var(--bg-primary) 0%, #e9e9e9 100%);
  }

  /* Keyboard control visual feedback */
  :global(.key.keyboard-active) {
    transform: translateY(2px);
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  :global(.key.white.keyboard-active) {
    background: linear-gradient(to bottom, #d0d0d0 0%, #c0c0c0 100%);
    border-color: #777;
  }

  :global(.key.black.keyboard-active) {
    background: linear-gradient(to bottom, #111 0%, #333 100%);
  }

  /* Practice highlighting styles - used across practice pages */
  :global(.key.practice-correct) {
    box-shadow:
      0 0 20px rgba(52, 128, 241, 0.4),
      0 4px 12px rgba(52, 128, 241, 0.3) !important;
    border-color: var(--color-accent-hover) !important;
  }

  :global(.key.white.practice-correct) {
    background: var(--gradient-blue) !important;
    transform: scaleY(0.99);
    color: white;
  }

  :global(.key.black.practice-correct) {
    background: var(--gradient-blue) !important;
    transform: translateY(-1px);
  }

  :global(.key.practice-correct .note) {
    color: white !important;
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  :global(.key.practice-failed) {
    box-shadow:
      0 0 20px rgba(239, 68, 68, 0.4),
      0 4px 12px rgba(239, 68, 68, 0.3) !important;
    border-color: #dc2626 !important;
  }

  :global(.key.white.practice-failed) {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
    transform: scaleY(0.99);
    color: white;
  }

  :global(.key.black.practice-failed) {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
    transform: translateY(-1px);
  }

  :global(.key.practice-failed .note) {
    color: white !important;
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  :global(.key.practice-success) {
    box-shadow:
      0 0 20px rgba(34, 197, 94, 0.4),
      0 4px 12px rgba(34, 197, 94, 0.3) !important;
    border-color: #16a34a !important;
  }

  :global(.key.white.practice-success) {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%) !important;
    transform: scaleY(0.99);
    color: white;
  }

  :global(.key.black.practice-success) {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%) !important;
    transform: translateY(-1px);
  }

  :global(.key.practice-success .note) {
    color: white !important;
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  /* Theory highlighting styles - used across theory pages */
  :global(.key.chord-active) {
    box-shadow:
      0 0 20px rgba(0, 122, 255, 0.4),
      0 4px 12px rgba(0, 122, 255, 0.3) !important;
    border-color: var(--color-accent-hover) !important;
  }

  :global(.key.white.chord-active) {
    background: var(--gradient-blue) !important;
    transform: scaleY(0.99);
    color: white;
  }

  :global(.key.black.chord-active) {
    background: var(--gradient-blue) !important;
    transform: translateY(-1px);
  }

  :global(.key.chord-active .note) {
    color: white !important;
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  :global(.key.scale-active) {
    box-shadow:
      0 0 20px rgba(0, 122, 255, 0.4),
      0 4px 12px rgba(0, 122, 255, 0.3) !important;
    border-color: var(--color-accent-hover) !important;
  }

  :global(.key.white.scale-active) {
    background: var(--gradient-blue) !important;
    transform: scaleY(0.99);
    color: white;
  }

  :global(.key.black.scale-active) {
    background: var(--gradient-blue) !important;
    transform: translateY(-1px);
  }

  :global(.key.scale-active .note) {
    color: white !important;
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
  .g,
  .a,
  .b,
  .d,
  .e {
    margin: 0 0 0 -1em;
  }
  .key.black {
    height: 9em;
    width: 2em;
    margin: 0 0 0 -1em;
    z-index: 2;
    border: 1px solid var(--border-dark);
    border-radius: 0 0 3px 3px;
    box-shadow:
      -1px -1px 2px rgba(255, 255, 255, 0.2) inset,
      0 -5px 2px 3px rgba(0, 0, 0, 0.6) inset,
      0 2px 4px var(--shadow-dark);
    background: linear-gradient(45deg, var(--bg-dark) 0%, #555 100%);
    display: flex;
    flex-flow: column;
    justify-content: flex-end;
  }

  .key.black p {
    font-size: 20px;
    position: relative;
    padding: 0;
    margin-bottom: 3px;
    width: auto !important;
    height: auto !important;
  }

  .key.black:active,
  .key.black:focus {
    box-shadow:
      -1px -1px 2px rgba(255, 255, 255, 0.2) inset,
      0 -2px 2px 3px rgba(0, 0, 0, 0.6) inset,
      0 1px 2px var(--shadow-dark);
    background: linear-gradient(to right, #323232 0%, var(--bg-dark) 100%);
  }

  .key.black:hover {
    box-shadow:
      -1px -1px 2px rgba(255, 255, 255, 0.2) inset,
      0 -2px 2px 3px rgba(0, 0, 0, 0.6) inset,
      0 1px 2px var(--shadow-dark);
  }

  .key .note {
    display: none; /* Hidden by default, shown only when needed */
    color: var(--text-light);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-weight: 600;
    position: absolute;
    bottom: 0px;
    text-align: center;
  }

  .key.white .note {
    margin-left: 11px !important;
    font-size: 25px;
    color: var(--text-primary);
  }

  .octave-marker {
    position: absolute;
    top: 8px;
    transform: translateX(-75%);
    color: var(--color-text-light, #a3a5a6);
    pointer-events: none;
    user-select: none;
  }

  .piano .key:first-child {
    border-radius: 5px 0 5px 5px;
  }

  .piano .key:last-child {
    border-radius: 0 5px 5px 5px;
  }

  @media (max-width: 1100px) {
    .piano {
      width: 100%;
      overflow-x: auto;
      display: flex;
      flex-wrap: wrap;
      flex-direction: column;
      padding: 3em 0 0 0em;
      overflow-y: hidden;
    }

    .key.white {
      width: 4.6rem;
    }

    .key.white p.note {
      margin-left: 16px !important;
    }
  }

  @media (min-width: 950px) and (max-width: 1100px) {
    .key.white {
      width: 4.6rem;
    }
  }
  @media (max-width: 600px) {
    .piano {
      box-shadow: none;
      margin: 0;
      padding: 0;
      border: none;
      height: 16rem;

      .key.white {
        height: 14rem;
        width: 3.6rem;
        p.note {
          margin-left: 12px !important;
          font-size: 22px;
          bottom: 10px;
        }
      }
    }

    /* Mobile octave markers */
    .octave-marker {
      font-size: 0.75rem;
    }
    .key.black {
      width: 1.9rem;
      height: 8rem;

      p.note {
        font-size: 19px;
        margin-bottom: 0;
      }
    }

    .key .note {
      width: 30px;
      height: 30px;
      font-size: 18px;
    }

    .key.white .note {
      font-size: 20px;
    }

    /* Sticky mobile piano positioning */
    .piano.sticky-mobile {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: var(--bg-dark);
      border-top: 2px solid var(--border-dark);
      border-radius: 0;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
      height: 13rem;
    }

    .piano.sticky-mobile .key.white {
      height: 13rem;
    }

    .piano.sticky-mobile .key.black {
      height: 7.5rem;
    }

    /* Add body padding when sticky piano is present */
    /* Note: :has() selector has limited browser support, fallback handled via JS */
    :global(body:has(.piano.sticky-mobile)) {
      padding-bottom: 13rem;
    }
  }
</style>