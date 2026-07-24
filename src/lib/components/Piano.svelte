<script lang="ts">
  import { playNote, setAudioKeyRange } from '$lib/utils/audioUtils';
  import { onMount, afterUpdate, onDestroy } from 'svelte';

  // Props to control which enharmonic notation to show
  export let chordNotes: string[] = []; // Notes in the current chord to determine correct notation
  export let autoScrollToActiveKey: boolean = true; // Enable/disable auto-scroll feature
  export let scrollToRootNote: string = ''; // If provided, scroll to this specific root note instead of the first active key
  export let stickyOnMobile: boolean = false; // Enable sticky positioning on mobile devices
  export let showOctaveMarkers: boolean = false; // Show octave reference markers
  export let keyRange: 'standard' | 'extended' = 'standard'; // Control piano key range: standard (C3-B4) or extended (C2-C6)

  // Keyboard mapping for piano keys (conditional based on keyRange)
  $: keyboardMapping = (keyRange === 'extended' ? {
    // Extended range (C2-C6) keyboard mapping
    // White keys (C2-B2) mapped to number row: 1 2 3 4 5 6 7
    '1': 'C2', '2': 'D2', '3': 'E2', '4': 'F2', '5': 'G2', '6': 'A2', '7': 'B2',
    
    // White keys (C3-B4) mapped to bottom row: A S D F G H J K L ; Z X C V
    'a': 'C3', 's': 'D3', 'd': 'E3', 'f': 'F3', 'g': 'G3', 'h': 'A3', 'j': 'B3',
    'k': 'C4', 'l': 'D4', ';': 'E4', 'z': 'F4', 'x': 'G4', 'c': 'A4', 'v': 'B4',
    
    // White keys (C5-C6) mapped to additional keys: N M , . / [ ]
    'n': 'C5', 'm': 'D5', ',': 'E5', '.': 'F5', '/': 'G5', '[': 'A5', ']': 'B5', '\\': 'C6',
    
    // Black keys (C#2-A#2) mapped to function keys and symbols: ! @ # $ %
    '!': 'C#2/Db2', '@': 'D#2/Eb2', '$': 'F#2/Gb2', '%': 'G#2/Ab2', '^': 'A#2/Bb2',
    
    // Black keys (C#3-A#4) mapped to top row: Q W E R T Y U I O P
    'q': 'C#3/Db3', 'w': 'D#3/Eb3', 'e': 'F#3/Gb3', 'r': 'G#3/Ab3', 't': 'A#3/Bb3',
    'y': 'C#4/Db4', 'u': 'D#4/Eb4', 'i': 'F#4/Gb4', 'o': 'G#4/Ab4', 'p': 'A#4/Bb4',
    
    // Black keys (C#5-A#5) mapped to remaining keys: - = ; ' (shift+chars)
    '-': 'C#5/Db5', '=': 'D#5/Eb5', "'": 'F#5/Gb5', '8': 'G#5/Ab5', '9': 'A#5/Bb5'
  } : {
    // Standard range (C3-B4) keyboard mapping - original mapping
    // White keys (C3-B4) mapped to bottom row: A S D F G H J K L ; Z X C V
    'a': 'C3', 's': 'D3', 'd': 'E3', 'f': 'F3', 'g': 'G3', 'h': 'A3', 'j': 'B3',
    'k': 'C4', 'l': 'D4', ';': 'E4', 'z': 'F4', 'x': 'G4', 'c': 'A4', 'v': 'B4',
    
    // Black keys (C#3-A#4) mapped to top row: Q W E R T Y U I O P
    'q': 'C#3/Db3', 'w': 'D#3/Eb3', 'e': 'F#3/Gb3', 'r': 'G#3/Ab3', 't': 'A#3/Bb3',
    'y': 'C#4/Db4', 'u': 'D#4/Eb4', 'i': 'F#4/Gb4', 'o': 'G#4/Ab4', 'p': 'A#4/Bb4'
  }) as { [key: string]: string };

  let activeKeys = new Set<string>(); // Track currently pressed keys for visual feedback
  let showKeyboardHelp = false; // Toggle for keyboard mapping help

  // Update audio system when keyRange changes
  $: {
    setAudioKeyRange(keyRange);
  }

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
    const noteData = keyboardMapping[key] as string | undefined;
    
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
    const noteData = keyboardMapping[key] as string | undefined;
    
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

  // Function to scroll to the target key (root note if specified, otherwise first active key)
  function scrollToTargetKey() {
    if (!autoScrollToActiveKey || typeof window === 'undefined') return;

    const pianoContainer = document.querySelector('.piano') as HTMLElement;
    if (!pianoContainer) return;

    let targetKey: HTMLElement | null = null;

    // If scrollToRootNote is provided, look for that specific note first
    if (scrollToRootNote) {
      const rootNoteName = scrollToRootNote.replace(/[0-9]/g, ''); // Remove octave numbers
      const allActiveKeys = pianoContainer.querySelectorAll(
        '.key.chord-active, .key.scale-active, .key.practice-correct, .key.practice-failed'
      );
      
      for (const key of allActiveKeys) {
        const keyNote = key.getAttribute('data-note');
        if (keyNote && keyNote.replace(/[0-9]/g, '') === rootNoteName) {
          targetKey = key as HTMLElement;
          break;
        }
      }
    }

    // If no root note specified or found, fall back to the first active key
    if (!targetKey) {
      targetKey = pianoContainer.querySelector(
        '.key.chord-active, .key.scale-active, .key.practice-correct, .key.practice-failed'
      ) as HTMLElement;
    }
    
    if (targetKey) {
      const containerWidth = pianoContainer.clientWidth;
      const keyPosition = targetKey.offsetLeft;
      const keyWidth = targetKey.offsetWidth;
      const currentScroll = pianoContainer.scrollLeft;

      // Calculate scroll position based on screen size and piano type
      let scrollPosition;
      
      if (keyRange === 'extended') {
        if (window.innerWidth > 1100) {
          // Large screens: position the key at 20% from left edge
          scrollPosition = Math.max(0, keyPosition - (containerWidth * 0.2));
          
          if (scrollPosition === 0 && keyPosition > containerWidth * 0.8) {
            scrollPosition = Math.max(0, keyPosition - 200);
          }
        } else {
          // Medium/small screens: center the key
          scrollPosition = Math.max(0, keyPosition - containerWidth / 2 + keyWidth / 2);
        }
      } else {
        // Standard piano: center the key
        scrollPosition = Math.max(0, keyPosition - containerWidth / 2 + keyWidth / 2);
      }
      
      // Ensure we don't scroll past the maximum scroll position
      const maxScroll = pianoContainer.scrollWidth - containerWidth;
      
      if (maxScroll <= 0 && keyRange === 'extended' && window.innerWidth > 1100) {
        // Don't clamp scrollPosition for parent scrolling on large screens
      } else {
        scrollPosition = Math.min(scrollPosition, Math.max(0, maxScroll));
      }

      const keyVisible = keyPosition >= currentScroll && (keyPosition + keyWidth) <= (currentScroll + containerWidth);
      
      let shouldScroll;
      
      if (window.innerWidth > 1100) {
        const keyInLeftQuarter = keyPosition < (containerWidth * 0.25);
        const forceScrollForExtended = keyRange === 'extended' && keyInLeftQuarter && currentScroll === 0;
        shouldScroll = Math.abs(currentScroll - scrollPosition) > 10 || !keyVisible || forceScrollForExtended;
      } else {
        shouldScroll = Math.abs(currentScroll - scrollPosition) > 10 || !keyVisible;
      }
      
      if (shouldScroll) {
        try {
          if (window.innerWidth > 1100) {
            // Large screens: try parent containers if piano isn't scrollable
            if (pianoContainer.scrollWidth <= pianoContainer.clientWidth) {
              let scrollTarget = pianoContainer.parentElement;
              while (scrollTarget && scrollTarget !== document.body) {
                if (scrollTarget.scrollWidth > scrollTarget.clientWidth) {
                  scrollTarget.scrollTo({
                    left: scrollPosition,
                    behavior: 'smooth'
                  });
                  break;
                }
                scrollTarget = scrollTarget.parentElement;
              }
            } else {
              pianoContainer.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
              });
            }
          } else {
            pianoContainer.scrollTo({
              left: scrollPosition,
              behavior: 'smooth'
            });
          }
        } catch (e) {
          pianoContainer.style.scrollBehavior = 'smooth';
          pianoContainer.scrollLeft = scrollPosition;
        }
      }
    }
  }

  // Scroll to active key when component mounts or updates
  onMount(() => {
    // Small delay to ensure DOM is fully rendered and CSS classes are applied
    setTimeout(() => {
      scrollToTargetKey();
    }, 200);
    
    // Add global keyboard event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleGlobalKeyDown);
      window.addEventListener('keyup', handleGlobalKeyUp);
    }
  });

  // Scroll when chordNotes change (when new chord/scale is selected)
  afterUpdate(() => {
    // Small delay to ensure CSS classes are updated
    setTimeout(() => {
      scrollToTargetKey();
    }, 100);
  });

  // Expose function to parent components for manual triggering
  export function scrollToActiveKey() {
    scrollToTargetKey();
  }

  // Reactive statement to trigger scroll when key props change
  $: if (scrollToRootNote || chordNotes) {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        scrollToTargetKey();
      }, 150);
    }
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

<div class="piano" class:sticky-mobile={stickyOnMobile} class:extended={keyRange === 'extended'}>
  {#if keyRange === 'extended'}
  <!-- Octave 2 -->
  <button
    class="key white c"
    data-note="C2"
    aria-label="Piano key C2"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">C</p>
    {#if showOctaveMarkers}
      <span class="octave-marker">C2</span>
    {/if}
  </button>
  <button
    class="key black cs"
    data-note="C#2/Db2"
    aria-label="Piano key C sharp 2 or D flat 2"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">
      {getPreferredNotation('C#', 'Db')}
    </p>
  </button>
  <button
    class="key white d"
    data-note="D2"
    aria-label="Piano key D2"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">D</p>
  </button>
  <button
    class="key black ds"
    data-note="D#2/Eb2"
    aria-label="Piano key D sharp 2 or E flat 2"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">
      {getPreferredNotation('D#', 'Eb')}
    </p>
  </button>
  <button
    class="key white e"
    data-note="E2"
    aria-label="Piano key E2"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">E</p>
  </button>
  <button
    class="key white f"
    data-note="F2"
    aria-label="Piano key F2"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">F</p>
  </button>
  <button
    class="key black fs"
    data-note="F#2/Gb2"
    aria-label="Piano key F sharp 2 or G flat 2"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">
      {getPreferredNotation('F#', 'Gb')}
    </p>
  </button>
  <button
    class="key white g"
    data-note="G2"
    aria-label="Piano key G2"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">G</p>
  </button>
  <button
    class="key black gs"
    data-note="G#2/Ab2"
    aria-label="Piano key G sharp 2 or A flat 2"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">
      {getPreferredNotation('G#', 'Ab')}
    </p>
  </button>
  <button
    class="key white a"
    data-note="A2"
    aria-label="Piano key A2"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">A</p>
  </button>
  <button
    class="key black as"
    data-note="A#2/Bb2"
    aria-label="Piano key A sharp 2 or B flat 2"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">
      {getPreferredNotation('A#', 'Bb')}
    </p>
  </button>
  <button
    class="key white b"
    data-note="B2"
    aria-label="Piano key B2"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">B</p>
  </button>
  {/if}

  <!-- Octave 3 -->
  <button
    class="key white c"
    data-note="C3"
    aria-label="Piano key C3"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">C</p>
    {#if showOctaveMarkers}
      <span class="octave-marker">C3</span>
    {/if}
  </button>
  <button
    class="key black cs"
    data-note="C#3/Db3"
    aria-label="Piano key C sharp 3 or D flat 3"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">
      {getPreferredNotation('C#', 'Db')}
    </p>
  </button>
  <button
    class="key white d"
    data-note="D3"
    aria-label="Piano key D3"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">D</p>
  </button>
  <button
    class="key black ds"
    data-note="D#3/Eb3"
    aria-label="Piano key D sharp 3 or E flat 3"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">
      {getPreferredNotation('D#', 'Eb')}
    </p>
  </button>
  <button
    class="key white e"
    data-note="E3"
    aria-label="Piano key E3"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">E</p>
  </button>
  <button
    class="key white f"
    data-note="F3"
    aria-label="Piano key F3"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">F</p>
  </button>
  <button
    class="key black fs"
    data-note="F#3/Gb3"
    aria-label="Piano key F sharp 3 or G flat 3"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">
      {getPreferredNotation('F#', 'Gb')}
    </p>
  </button>
  <button
    class="key white g"
    data-note="G3"
    aria-label="Piano key G3"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">G</p>
  </button>
  <button
    class="key black gs"
    data-note="G#3/Ab3"
    aria-label="Piano key G sharp 3 or A flat 3"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">
      {getPreferredNotation('G#', 'Ab')}
    </p>
  </button>
  <button
    class="key white a"
    data-note="A3"
    aria-label="Piano key A3"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">A</p>
  </button>
  <button
    class="key black as"
    data-note="A#3/Bb3"
    aria-label="Piano key A sharp 3 or B flat 3"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">
      {getPreferredNotation('A#', 'Bb')}
    </p>
  </button>
  <button
    class="key white b"
    data-note="B3"
    aria-label="Piano key B3"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">B</p>
  </button>

  <!-- Octave 4 -->
  <button
    class="key white c"
    data-note="C4"
    aria-label="Piano key C4"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">C</p>
    {#if showOctaveMarkers}
      <span class="octave-marker">C4</span>
    {/if}
  </button>
  <button
    class="key black cs"
    data-note="C#4/Db4"
    aria-label="Piano key C sharp 4 or D flat 4"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">
      {getPreferredNotation('C#', 'Db')}
    </p>
  </button>
  <button
    class="key white d"
    data-note="D4"
    aria-label="Piano key D4"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">D</p>
  </button>
  <button
    class="key black ds"
    data-note="D#4/Eb4"
    aria-label="Piano key D sharp 4 or E flat 4"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">
      {getPreferredNotation('D#', 'Eb')}
    </p>
  </button>
  <button
    class="key white e"
    data-note="E4"
    aria-label="Piano key E4"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">E</p>
  </button>
  <button
    class="key white f"
    data-note="F4"
    aria-label="Piano key F4"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">F</p>
  </button>
  <button
    class="key black fs"
    data-note="F#4/Gb4"
    aria-label="Piano key F sharp 4 or G flat 4"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">
      {getPreferredNotation('F#', 'Gb')}
    </p>
  </button>
  <button
    class="key white g"
    data-note="G4"
    aria-label="Piano key G4"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">G</p>
  </button>
  <button
    class="key black gs"
    data-note="G#4/Ab4"
    aria-label="Piano key G sharp 4 or A flat 4"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">
      {getPreferredNotation('G#', 'Ab')}
    </p>
  </button>
  <button
    class="key white a"
    data-note="A4"
    aria-label="Piano key A4"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">A</p>
  </button>
  <button
    class="key black as"
    data-note="A#4/Bb4"
    aria-label="Piano key A sharp 4 or B flat 4"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">
      {getPreferredNotation('A#', 'Bb')}
    </p>
  </button>
  <button
    class="key white b"
    data-note="B4"
    aria-label="Piano key B4"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">B</p>
  </button>

  {#if keyRange === 'extended'}
  <!-- Octave 5 -->
  <button
    class="key white c"
    data-note="C5"
    aria-label="Piano key C5"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">C</p>
    {#if showOctaveMarkers}
      <span class="octave-marker">C5</span>
    {/if}
  </button>
  <button
    class="key black cs"
    data-note="C#5/Db5"
    aria-label="Piano key C sharp 5 or D flat 5"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">
      {getPreferredNotation('C#', 'Db')}
    </p>
  </button>
  <button
    class="key white d"
    data-note="D5"
    aria-label="Piano key D5"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">D</p>
  </button>
  <button
    class="key black ds"
    data-note="D#5/Eb5"
    aria-label="Piano key D sharp 5 or E flat 5"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">
      {getPreferredNotation('D#', 'Eb')}
    </p>
  </button>
  <button
    class="key white e"
    data-note="E5"
    aria-label="Piano key E5"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">E</p>
  </button>
  <button
    class="key white f"
    data-note="F5"
    aria-label="Piano key F5"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">F</p>
  </button>
  <button
    class="key black fs"
    data-note="F#5/Gb5"
    aria-label="Piano key F sharp 5 or G flat 5"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">
      {getPreferredNotation('F#', 'Gb')}
    </p>
  </button>
  <button
    class="key white g"
    data-note="G5"
    aria-label="Piano key G5"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">G</p>
  </button>
  <button
    class="key black gs"
    data-note="G#5/Ab5"
    aria-label="Piano key G sharp 5 or A flat 5"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">
      {getPreferredNotation('G#', 'Ab')}
    </p>
  </button>
  <button
    class="key white a"
    data-note="A5"
    aria-label="Piano key A5"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">A</p>
  </button>
  <button
    class="key black as"
    data-note="A#5/Bb5"
    aria-label="Piano key A sharp 5 or B flat 5"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">
      {getPreferredNotation('A#', 'Bb')}
    </p>
  </button>
  <button
    class="key white b"
    data-note="B5"
    aria-label="Piano key B5"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">B</p>
  </button>

  <!-- C6 -->
  <button
    class="key white c"
    data-note="C6"
    aria-label="Piano key C6"
    on:click={handleKeyPress}
    on:keydown={handleKeyDown}
  >
    <p class="note" aria-hidden="true">C</p>
    {#if showOctaveMarkers}
      <span class="octave-marker">C6</span>
    {/if}
  </button>
  {/if}
</div>

<style>
  /* The keyboard has its own local palette. Dark mode retunes these rather than touching the
     ~70 places that reference them: the keys stay recognisably a piano (white keys still
     read as white) but dimmed so they don't glare against a dark page, with deeper shadows
     and a lighter key border to keep the black/white edge visible. */
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

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) {
      --text-primary: #2a2a2e;
      --text-light: #f5f5f7;
      --bg-primary: #dcdce0;
      --bg-secondary: #c4c4c9;
      --bg-dark: #131317;
      --border-light: #85858c;
      --border-dark: #000;
      --shadow-light: rgba(0, 0, 0, 0.35);
      --shadow-medium: rgba(0, 0, 0, 0.5);
      --shadow-dark: rgba(0, 0, 0, 0.8);
    }
  }

  /* Keep in sync with the block above. */
  :root[data-theme='dark'] {
    --text-primary: #2a2a2e;
    --text-light: #f5f5f7;
    --bg-primary: #dcdce0;
    --bg-secondary: #c4c4c9;
    --bg-dark: #131317;
    --border-light: #85858c;
    --border-dark: #000;
    --shadow-light: rgba(0, 0, 0, 0.35);
    --shadow-medium: rgba(0, 0, 0, 0.5);
    --shadow-dark: rgba(0, 0, 0, 0.8);
  }

  .piano {
    height: 18.875em;
    width: 62.2em; /* Standard width for C3-B4 range (24 keys) */
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

  .piano.extended {
    width: 122.5em; /* Extended width for C2-C6 range (49 keys) */
    overflow-x: auto; /* Always show horizontal scrollbar when needed */
    overflow-y: hidden;
    /* Ensure scrollbar is always visible on mobile */
    scrollbar-width: thin;
    -webkit-overflow-scrolling: touch;
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
      0 0 5px var(--shadow-light) inset,
      0 0 3px var(--shadow-medium);
    background: linear-gradient(to bottom, var(--bg-secondary) 0%, var(--bg-primary) 100%);
  }

  .key.white:active,
  .key.white:focus {
    border-top: 1px solid var(--border-light);
    border-left: 1px solid var(--border-light);
    border-bottom: 1px solid var(--border-light);
    box-shadow:
      2px 0 3px var(--shadow-light) inset,
      -5px 5px 20px var(--shadow-medium) inset,
      0 0 3px var(--shadow-medium);
    background: linear-gradient(to bottom, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  }
  .key.white:hover {
    border-left: 1px solid var(--border-light);
    border-bottom: 1px solid var(--border-light);
    background: linear-gradient(to bottom, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  }

  /* Keyboard control visual feedback */
  :global(.key.keyboard-active) {
    transform: translateY(2px);
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  :global(.key.white.keyboard-active) {
    background: linear-gradient(to bottom, var(--bg-secondary) 0%, var(--border-light) 100%);
    border-color: var(--border-light);
  }

  :global(.key.black.keyboard-active) {
    background: linear-gradient(to bottom, #111 0%, #333 100%) !important;
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

  :global(.key.practice-failed) .octave-marker, 
  :global(.key.practice-success) .octave-marker, 
  :global(.key.chord-active) .octave-marker, 
  :global(.key.practice-correct) .octave-marker {
    color: white;
  }
  .piano .key:first-child {
    border-radius: 5px 0 5px 5px;
  }

  .piano .key:last-child {
    border-radius: 0 5px 5px 5px;
  }

  @media (max-width: 1100px) {
    .piano {
      height: 19.9em;
      width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      display: flex;
      padding: 3em 0 0 3em;
      /* Ensure smooth scrolling */
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
    }

    .piano.extended {
      width: auto;
      padding-right: 3em;
    }
    .key.white {
      width: 4.6rem;
      flex-shrink: 0; /* Prevent keys from shrinking */
    }

    .key.black {
      flex-shrink: 0; /* Prevent keys from shrinking */
    }

    .key.white p.note {
      margin-left: 16px !important;
    }
  }

  @media (min-width: 950px) and (max-width: 1100px) {
    .key.white {
      width: 4.6rem;
      flex-shrink: 0; /* Prevent keys from shrinking */
    }
    .key.black {
      flex-shrink: 0; /* Prevent keys from shrinking */
    }
  }
  @media (max-width: 600px) {
    .piano {
      box-shadow: none;
      margin: 0;
      padding: 0;
      border: none;
      height: 16rem;
      display: flex; /* Ensure flexbox layout is maintained */
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
    }

    .piano.extended {
      padding-right: 0;
    }

    .key.white {
      height: 14rem;
      width: 3.6rem;
      flex-shrink: 0; /* Prevent keys from shrinking */
      
      p.note {
        margin-left: 12px !important;
        font-size: 22px;
        bottom: 10px;
      }
    }

    /* Mobile octave markers */
    .octave-marker {
      font-size: 0.75rem;
    }
    .key.black {
      width: 1.9rem;
      height: 8rem;
      flex-shrink: 0; /* Prevent keys from shrinking */

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
      height: 13.9rem;
      display: flex; /* Maintain flexbox */
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
    }

    .piano.sticky-mobile .key.white {
      height: 13rem;
      flex-shrink: 0; /* Prevent keys from shrinking */
    }

    .piano.sticky-mobile .key.black {
      height: 7.5rem;
      flex-shrink: 0; /* Prevent keys from shrinking */
    }

    /* Add body padding when sticky piano is present */
    /* Note: :has() selector has limited browser support, fallback handled via JS */
    :global(body:has(.piano.sticky-mobile)) {
      padding-bottom: 13rem;
    }
  }
</style>