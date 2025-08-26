<script lang="ts">
  import Piano from '$lib/components/Piano.svelte';
  import MusicScore from '$lib/components/MusicScore.svelte';
  import { onMount } from 'svelte';
  import { playNote } from '$lib/utils/audioUtils';

  // State for selected notes and display
  let selectedNotes: string[] = [];
  let showMnemonics = true;

  // Common mnemonic phrases for note memorization
  const trebleMnemonics = {
    lines: {
      phrase: "Every Good Boy Does Fine",
      notes: "E - G - B - D - F",
      description: "Lines from bottom to top",
      noteArray: ["E4", "G4", "B4", "D5", "F5"]
    },
    spaces: {
      phrase: "FACE",
      notes: "F - A - C - E", 
      description: "Spaces from bottom to top",
      noteArray: ["F4", "A4", "C5", "E5"]
    }
  };

  const bassMnemonics = {
    lines: {
      phrase: "Good Boys Do Fine Always",
      notes: "G - B - D - F - A",
      description: "Lines from bottom to top",
      noteArray: ["G2", "B2", "D3", "F3", "A3"]
    },
    spaces: {
      phrase: "All Cows Eat Grass",
      notes: "A - C - E - G",
      description: "Spaces from bottom to top",
      noteArray: ["A2", "C3", "E3", "G3"]
    }
  };

  // Helper function to find conflicting notes (natural vs accidental on same base note)
  function findConflictingNote(clickedNote: string): string | null {
    // Extract note name and octave
    const match = clickedNote.match(/^([A-G])([#b]?)(\d+)$/);
    if (!match) return null;
    
    const [, noteName, accidental, octave] = match;
    
    // Find conflicting notes in selectedNotes
    for (const selectedNote of selectedNotes) {
      const selectedMatch = selectedNote.match(/^([A-G])([#b]?)(\d+)$/);
      if (!selectedMatch) continue;
      
      const [, selectedNoteName, selectedAccidental, selectedOctave] = selectedMatch;
      
      // Same base note and octave, but different accidental status
      if (noteName === selectedNoteName && octave === selectedOctave && accidental !== selectedAccidental) {
        return selectedNote;
      }
    }
    
    return null;
  }

  // Handle piano key clicks
  function handlePianoClick(clickedNote: string) {
    // Check if we're toggling off the same note
    if (selectedNotes.includes(clickedNote)) {
      selectedNotes = selectedNotes.filter(note => note !== clickedNote);
    } else {
      // Remove conflicting note if present (e.g., C4 when clicking C#4)
      const conflictingNote = findConflictingNote(clickedNote);
      if (conflictingNote) {
        selectedNotes = selectedNotes.filter(note => note !== conflictingNote);
      }
      
      // Add the new note
      selectedNotes = [...selectedNotes, clickedNote];
    }
    
    // Play the note
    playNote(clickedNote);
  }

  // Clear all selected notes
  function clearNotes() {
    selectedNotes = [];
    updatePianoDisplay();
  }

  // Update piano visual display
  function updatePianoDisplay() {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Reset all keys
    const allKeys = document.querySelectorAll('.key');
    const allNotes = document.querySelectorAll('.note');

    allKeys.forEach((key) => {
      key.classList.remove('practice-correct');
    });

    // Hide all note names initially
    allNotes.forEach((note) => {
      (note as HTMLElement).style.display = 'none';
    });

    // Highlight selected notes
    selectedNotes.forEach(noteName => {
      highlightKey(noteName, 'practice-correct');
    });
  }

  // Helper function to highlight a specific key
  function highlightKey(noteName: string, cssClass: string) {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const allPianoKeys = document.querySelectorAll('.key[data-note]');

    allPianoKeys.forEach((key) => {
      const dataNote = key.getAttribute('data-note');
      if (dataNote) {
        const keyNotes = dataNote.split('/');
        const hasExactMatch = keyNotes.some((keyNote) => keyNote === noteName);

        if (hasExactMatch) {
          key.classList.add(cssClass);

          // Show the note name
          const noteElements = key.querySelectorAll('.note');
          noteElements.forEach((noteEl) => {
            (noteEl as HTMLElement).style.display = 'block';
          });
        }
      }
    });
  }

  // Handle mnemonic click - play notes and highlight piano
  function handleMnemonicClick(noteArray: string[]) {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Clear previous selection
    selectedNotes = [];
    updatePianoDisplay();
    
    // Add new notes with a small delay between each
    noteArray.forEach((note, index) => {
      setTimeout(() => {
        selectedNotes = [...selectedNotes, note];
        playNote(note);
        updatePianoDisplay();
      }, index * 200); // 200ms delay between notes
    });
  }

  onMount(() => {
    // Add event listeners to piano keys
    const handleKeyClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const key = target.closest('.key') as HTMLElement;
      if (!key) return;

      const noteData = key.getAttribute('data-note');
      if (!noteData) return;

      const allNotes = noteData.split('/');
      handlePianoClick(allNotes[0]);
    };

    setTimeout(() => {
      const pianoKeys = document.querySelectorAll('.key');
      pianoKeys.forEach((key) => {
        key.addEventListener('click', handleKeyClick);
      });
    }, 100);

    return () => {
      const pianoKeys = document.querySelectorAll('.key');
      pianoKeys.forEach((key) => {
        key.removeEventListener('click', handleKeyClick);
      });
    };
  });

  // Update piano display when selected notes change (client-side only)
  $: if (selectedNotes && typeof window !== 'undefined') {
    setTimeout(() => updatePianoDisplay(), 50);
  }
</script>

<div class="learn-music-reading-wrapper">
  <div class="page-container">
    <!-- Navigation -->
    <nav class="navigation">
      <a href="/" class="btn-glass">
        <svg class="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span>Back to Home</span>
      </a>
    </nav>

    <!-- Header Section -->
    <header class="header-section">
      <div class="header-content">
        <h1 class="main-title">Learn Music Reading</h1>
        <p class="page-description">
          Click piano keys to see how notes appear on the music staff
        </p>
      </div>
    </header>

    <!-- Music Score Section -->
    <section class="score-section">
      <div class="score-container">
        <div class="score-display">
          <MusicScore 
            activeNotes={selectedNotes} 
            chordName="" 
            chordToneRule="" 
          />
        </div>
      </div>
    </section>

    <!-- Clear Button -->
    <section class="clear-section">
      <div class="clear-container">
        <button on:click={clearNotes} class="clear-button">
          Clear All Notes
        </button>
      </div>
    </section>

    <!-- Piano Section -->
    <section class="piano-section">
      <div class="piano-container">
        <Piano chordNotes={selectedNotes} showOctaveMarkers={true} stickyOnMobile={true} autoScrollToActiveKey={false} keyRange="extended" />
      </div>
    </section>

    <section class="mnemonics-section">
      <div class="mnemonics-container">
        <h2 class="mnemonics-title">Memory Aids for Note Reading</h2>
        <p class="mnemonics-subtitle">Click any phrase to hear and see the notes on the piano</p>
        
        <div class="mnemonics-grid">
          <div class="mnemonic-card">
            <div class="clef-header">
              <div class="clef-symbol">𝄞</div>
              <h3>Treble Clef</h3>
            </div>
            
            <button 
              class="mnemonic-group clickable" 
              on:click={() => handleMnemonicClick(trebleMnemonics.lines.noteArray)}
            >
              <div class="mnemonic-type">Lines</div>
              <div class="mnemonic-phrase">"{trebleMnemonics.lines.phrase}"</div>
              <div class="mnemonic-notes">{trebleMnemonics.lines.notes}</div>
              <div class="mnemonic-desc">{trebleMnemonics.lines.description}</div>
            </button>
            
            <button 
              class="mnemonic-group clickable" 
              on:click={() => handleMnemonicClick(trebleMnemonics.spaces.noteArray)}
            >
              <div class="mnemonic-type">Spaces</div>
              <div class="mnemonic-phrase">"{trebleMnemonics.spaces.phrase}"</div>
              <div class="mnemonic-notes">{trebleMnemonics.spaces.notes}</div>
              <div class="mnemonic-desc">{trebleMnemonics.spaces.description}</div>
            </button>
          </div>

          <div class="mnemonic-card">
            <div class="clef-header">
              <div class="clef-symbol bass">𝄢</div>
              <h3>Bass Clef</h3>
            </div>
            
            <button 
              class="mnemonic-group clickable" 
              on:click={() => handleMnemonicClick(bassMnemonics.lines.noteArray)}
            >
              <div class="mnemonic-type">Lines</div>
              <div class="mnemonic-phrase">"{bassMnemonics.lines.phrase}"</div>
              <div class="mnemonic-notes">{bassMnemonics.lines.notes}</div>
              <div class="mnemonic-desc">{bassMnemonics.lines.description}</div>
            </button>
            
            <button 
              class="mnemonic-group clickable" 
              on:click={() => handleMnemonicClick(bassMnemonics.spaces.noteArray)}
            >
              <div class="mnemonic-type">Spaces</div>
              <div class="mnemonic-phrase">"{bassMnemonics.spaces.phrase}"</div>
              <div class="mnemonic-notes">{bassMnemonics.spaces.notes}</div>
              <div class="mnemonic-desc">{bassMnemonics.spaces.description}</div>
            </button>
          </div>
        </div>
      </div>
    </section>

  </div>
</div>

<style>
  /* Main wrapper */
  .learn-music-reading-wrapper {
    min-height: calc(90vh - 4rem);
    padding: 2rem 0;
  }

  .clear-container {
    display: flex;
    justify-content: center;
  }

  .clear-button {
    padding: 0.75rem 1.5rem;
    border: 1px solid var(--color-border-light);
    background: rgba(255, 255, 255, 0.9);
    color: var(--color-text-primary);
    font-weight: 500;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
  }

  .clear-button:hover {
    border-color: var(--color-accent);
    transform: translateY(-1px);
    background: var(--color-accent);
    color: white;
  }

  /* Score Section */
  .score-section {
    padding: 1rem 0 0.5rem 0;
  }

  .score-container {
    max-width: 64rem;
    margin: 0 auto;
  }

  .score-header {
    text-align: center;
    margin-bottom: 1rem;
  }

  .score-header h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 0.5rem;
  }

  .score-header p {
    color: var(--color-text-secondary);
  }

  .score-display {
    display: flex;
    justify-content: center;
    margin: 2rem 0;
  }



  /* Memory Aids Section */
  .mnemonics-section {
    padding: 2rem 0;
    background: rgba(0, 0, 0, 0.02);
  }

  .mnemonics-container {
    max-width: 64rem;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .mnemonics-title {
    text-align: center;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 0.5rem;
  }

  .mnemonics-subtitle {
    text-align: center;
    color: var(--color-text-secondary);
    margin-bottom: 2rem;
    font-style: italic;
  }

  .mnemonics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .mnemonic-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid var(--color-border-light);
    border-radius: 1rem;
    padding: 2rem;
    backdrop-filter: blur(10px);
  }

  .clef-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border-light);
  }

  .clef-symbol {
    font-size: 2.5rem;
    color: var(--color-accent);
    font-family: 'Times New Roman', serif;
  }

  .clef-symbol.bass {
    font-size: 2rem;
  }

  .clef-header h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
  }

  .mnemonic-group {
    margin-bottom: 1.5rem;
    text-align: left;
  }

  .mnemonic-group.clickable {
    border: 1px solid transparent;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 0.75rem;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
    margin-bottom: 1rem;
  }

  .mnemonic-group.clickable:hover {
    border-color: var(--color-accent);
    background: rgba(52, 128, 241, 0.05);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(52, 128, 241, 0.1);
  }

  .mnemonic-group.clickable:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(52, 128, 241, 0.1);
  }

  .mnemonic-type {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-accent);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }

  .mnemonic-phrase {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 0.25rem;
  }

  .clear-section {
    padding-bottom: 2rem;
  }

  .mnemonic-notes {
    font-size: 1rem;
    color: var(--color-text-secondary);
    font-family: monospace;
    letter-spacing: 0.1em;
    margin-bottom: 0.25rem;
  }

  .mnemonic-desc {
    font-size: 0.875rem;
    color: var(--color-text-light);
    font-style: italic;
  }

  /* Piano styles handled in app.css */



  /* Responsive Design */
  @media (max-width: 768px) {
    .mnemonics-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .mnemonic-card {
      padding: 1.5rem;
    }
  }

  @media (max-width: 480px) {
    .learn-music-reading-wrapper {
      padding: 1rem 0;
    }

    /* Piano responsive styles handled in app.css */

    .mnemonic-group.clickable {
      padding: 0.75rem;
    }

    .header-section {
      padding-bottom: 0;
    }
  }
</style>
