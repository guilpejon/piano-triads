<script lang="ts">
  export let activeNotes: string[] = [];
  export let chordName: string = '';
  export let chordToneRule: string = '';

  // Note positions on the staff (middle C = 0)
  const notePositions: { [key: string]: number } = {
    C: 0,
    D: 1,
    E: 2,
    F: 3,
    G: 4,
    A: 5,
    B: 6
  };

  // Convert note name to staff position
  function getStaffPosition(noteName: string): {
    treble: number;
    bass: number;
    octave: number;
    note: string;
    accidental: string;
  } {
    const match = noteName.match(/^([A-G])([#b]?)(\d+)$/);
    if (!match) return { treble: 0, bass: 0, octave: 4, note: 'C', accidental: '' };

    const [, note, accidental, octaveStr] = match;
    const octave = parseInt(octaveStr);

    // For treble clef: E4 is on the bottom line (position 0)
    // Staff lines: E4=0, G4=2, B4=4, D5=6, F5=8
    // Staff spaces: F4=1, A4=3, C5=5, E5=7
    let treblePosition = 0;
    if (octave === 4) {
      switch (note) {
        case 'C':
          treblePosition = -1;
          break; // Below staff
        case 'D':
          treblePosition = 0;
          break; // Below staff
        case 'E':
          treblePosition = 1;
          break; // Bottom line
        case 'F':
          treblePosition = 2;
          break; // First space
        case 'G':
          treblePosition = 3;
          break; // Second line
        case 'A':
          treblePosition = 4;
          break; // Second space
        case 'B':
          treblePosition = 5;
          break; // Third line
      }
    } else if (octave === 5) {
      switch (note) {
        case 'C':
          treblePosition = 6;
          break; // Third space
        case 'D':
          treblePosition = 7;
          break; // Fourth line
        case 'E':
          treblePosition = 8;
          break; // Fourth space
        case 'F':
          treblePosition = 9;
          break; // Top line
        case 'G':
          treblePosition = 10;
          break; // Above staff
        case 'A':
          treblePosition = 11;
          break; // Above staff
        case 'B':
          treblePosition = 12;
          break; // Above staff
      }
    } else if (octave === 3) {
      switch (note) {
        case 'C':
          treblePosition = -8;
          break;
        case 'D':
          treblePosition = -7;
          break;
        case 'E':
          treblePosition = -6;
          break;
        case 'F':
          treblePosition = -5;
          break;
        case 'G':
          treblePosition = -4;
          break;
        case 'A':
          treblePosition = -3;
          break;
        case 'B':
          treblePosition = -2;
          break;
      }
    } else {
      // General calculation for other octaves
      const basePosition = notePositions[note];
      const octaveOffset = (octave - 4) * 7;
      treblePosition = basePosition - 2 + octaveOffset;
    }

    // For bass clef: G2 is on the bottom line (position 0)
    // Staff positions: G2=0, A2=1, B2=2, C3=3, D3=4, E3=5, F3=6, G3=7, A3=8
    let bassPosition = 0;
    if (octave === 2) {
      switch (note) {
        case 'G':
          bassPosition = 0;
          break;
        case 'A':
          bassPosition = 1;
          break;
        case 'B':
          bassPosition = 2;
          break;
      }
    } else if (octave === 3) {
      switch (note) {
        case 'C':
          bassPosition = 3;
          break;
        case 'D':
          bassPosition = 4;
          break;
        case 'E':
          bassPosition = 5;
          break;
        case 'F':
          bassPosition = 6;
          break;
        case 'G':
          bassPosition = 7;
          break;
        case 'A':
          bassPosition = 8;
          break;
        case 'B':
          bassPosition = 9;
          break;
      }
    } else if (octave === 4) {
      switch (note) {
        case 'C':
          bassPosition = 10;
          break;
        case 'D':
          bassPosition = 11;
          break;
        case 'E':
          bassPosition = 12;
          break;
        case 'F':
          bassPosition = 13;
          break;
      }
    } else {
      // General calculation for other octaves
      const basePosition = notePositions[note];
      const octaveOffset = (octave - 2) * 7;
      bassPosition = basePosition + 4 + octaveOffset;
    }

    return {
      treble: treblePosition,
      bass: bassPosition,
      octave,
      note,
      accidental
    };
  }

  // Process active notes for display
  $: processedNotes = activeNotes
    .map((noteName) => {
      const position = getStaffPosition(noteName);
      return {
        ...position,
        originalName: noteName
      };
    })
    .sort((a, b) => {
      // Sort by octave first, then by note position
      if (a.octave !== b.octave) return a.octave - b.octave;
      return notePositions[a.note] - notePositions[b.note];
    });

  // Determine which clef to use for each note
  // C4 and above → treble clef
  // B3 and below → bass clef
  $: trebleNotes = processedNotes.filter((note) => {
    // Use treble clef for C4 and above
    return note.octave >= 4;
  });

  $: bassNotes = processedNotes.filter((note) => {
    // Use bass clef for B3 and below (octave 3 and below)
    return note.octave <= 3;
  });
</script>

<div class="music-score">
  {#if chordName}
    <div class="chord-name-display">
      <h2 class="chord-name">{chordName}</h2>
      {#if chordToneRule}
        <p class="chord-tone-rule">{chordToneRule}</p>
      {/if}
    </div>
  {/if}
  <div class="score-container">
    <!-- Treble Clef Staff -->
    <div class="staff treble-staff">
      <div class="clef-symbol treble-clef">𝄞</div>

      <!-- Staff Lines -->
      <div class="staff-lines">
        {#each Array(5) as _, i}
          <div class="staff-line" style="bottom: {i * 12}px;"></div>
        {/each}
      </div>

      <!-- Ledger Lines -->
      <div class="ledger-lines">
        {#each trebleNotes as note, noteIndex}
          {#if note.treble <= 0}
            <!-- Below staff ledger lines -->
            {#each Array(Math.ceil((1 - note.treble) / 2)) as _, i}
              {#if 1 - note.treble >= (i + 1) * 2}
                <div
                  class="ledger-line"
                  style="bottom: {-13 - i * 12}px; left: {155 + noteIndex * 40}px; width: 30px;"
                ></div>
              {/if}
            {/each}
          {/if}
          {#if note.treble >= 10}
            <!-- Above staff ledger lines -->
            {#each Array(Math.ceil((note.treble - 8) / 2)) as _, i}
              {#if note.treble >= 10 + i * 2}
                <div
                  class="ledger-line"
                  style="bottom: {60 + i * 12}px; left: {155 + noteIndex * 40}px; width: 30px;"
                ></div>
              {/if}
            {/each}
          {/if}
        {/each}
      </div>

      <!-- Notes -->
      <div class="notes">
        {#each trebleNotes as note, noteIndex}
          <div class="note-group" style="left: 150px;">
            <!-- Accidental -->
            {#if note.accidental}
              <div
                class="accidental"
                style="bottom: {note.treble * 6 - 10}px; left: {noteIndex * 20 - 60}px;"
              >
                {note.accidental === '#' ? '♯' : '♭'}
              </div>
            {/if}
            <!-- Note head -->
            <svg
              class="note-head quarter-note"
              style="bottom: {note.treble * 6 - 3}px; left: 20px;"
              width="16"
              height="12"
              viewBox="0 0 16 12"
            >
              <ellipse
                cx="8"
                cy="6"
                rx="7"
                ry="4.5"
                fill="#1d1d1f"
                stroke="white"
                stroke-width="0.5"
                transform="rotate(-20 8 6)"
              />
            </svg>
          </div>
        {/each}
      </div>
    </div>

    <!-- Bass Clef Staff -->
    <div class="staff bass-staff">
      <div class="clef-symbol bass-clef">𝄢</div>

      <!-- Staff Lines -->
      <div class="staff-lines">
        {#each Array(5) as _, i}
          <div class="staff-line" style="bottom: {i * 12}px;"></div>
        {/each}
      </div>

      <!-- Ledger Lines -->
      <div class="ledger-lines">
        {#each bassNotes as note}
          {#if note.bass <= 0}
            <!-- Below staff ledger lines -->
            {#each Array(Math.ceil((1 - note.bass) / 2)) as _, i}
              {#if 1 - note.bass >= (i + 1) * 2}
                <div class="ledger-line" style="bottom: {-6 - i * 6}px;"></div>
              {/if}
            {/each}
          {/if}
          {#if note.bass >= 10}
            <!-- Above staff ledger lines -->
            {#each Array(Math.ceil((note.bass - 8) / 2)) as _, i}
              {#if note.bass >= 10 + i * 2}
                <div class="ledger-line" style="bottom: {60 + i * 6}px;"></div>
              {/if}
            {/each}
          {/if}
        {/each}
      </div>

      <!-- Notes -->
      <div class="notes">
        {#each bassNotes as note, noteIndex}
          <div class="note-group" style="left: 100px;">
            <!-- Accidental -->
            {#if note.accidental}
              <div
                class="accidental"
                style="bottom: {note.bass * 6 - 4}px; left: {noteIndex * 15}px;"
              >
                {note.accidental === '#' ? '♯' : '♭'}
              </div>
            {/if}
            <!-- Note head -->
            <svg
              class="note-head quarter-note"
              style="bottom: {note.bass * 6 + 4.5}px; left: 70px;"
              width="16"
              height="12"
              viewBox="0 0 16 12"
            >
              <ellipse
                cx="8"
                cy="6"
                rx="7"
                ry="4.5"
                fill="#1d1d1f"
                stroke="white"
                stroke-width="0.5"
                transform="rotate(-20 8 6)"
              />
            </svg>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .music-score {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 16px;
    padding: 1.5rem;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    max-width: 500px;
    margin: 0 auto;
    width: fit-content;
  }

  .chord-name-display {
    text-align: center;
    margin-bottom: 1rem;
  }

  .chord-name {
    font-size: 24px;
    font-weight: 600;
    color: #1d1d1f;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .chord-tone-rule {
    font-size: 14px;
    font-weight: 400;
    color: var(--color-text-secondary);
    margin: 0;
    text-align: center;
    opacity: 0.8;
    font-style: italic;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .score-container {
    display: flex;
    flex-direction: column;
    gap: 40px;
    align-items: center;
  }

  .staff {
    position: relative;
    width: 220px;
    height: 80px;
    margin-top: -20px;
  }

  .clef-symbol {
    position: absolute;
    left: 5px;
    bottom: 15px;
    font-family: 'Times New Roman', serif;
    color: #1d1d1f;
    z-index: 2;
  }

  .treble-clef {
    top: -22px;
    font-size: 6rem;
  }

  .bass-clef {
    bottom: -18px;
    font-size: 4rem;
  }

  .staff-lines {
    position: absolute;
    left: 0;
    right: 0;
    height: 100%;
  }

  .staff-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #1d1d1f;
    opacity: 0.8;
  }

  .ledger-lines {
    position: absolute;
    left: 0;
    right: 0;
    height: 100%;
  }

  .ledger-line {
    position: absolute;
    height: 1.6px;
    background-color: #1d1d1f;
    z-index: 1;
  }

  .notes {
    position: absolute;
    left: 0;
    right: 0;
    height: 100%;
    top: 9px;
  }

  .note-group {
    position: absolute;
    display: flex;
    align-items: center;
    bottom: 0;
  }

  .note-head {
    position: absolute;
    transform: translateX(-50%);
    z-index: 3;
  }

  .quarter-note {
    transition: all 0.2s ease;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  }

  .quarter-note:hover {
    transform: translateX(-50%) scale(1.3);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }

  .quarter-note ellipse {
    transition: fill 0.2s ease;
  }

  .quarter-note:hover ellipse {
    fill: #000000;
  }

  .accidental {
    position: absolute;
    font-size: 30px;
    left: -5px;
    color: #1d1d1f;
    transform: translateX(-20px);
    z-index: 2;
    /* Ensure consistent bold rendering across platforms */
    font-weight: 700 !important;
    font-family: 'Times New Roman', serif;
    line-height: 1;
    /* Android-specific font weight fixes */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-variation-settings: 'wght' 700;
    font-synthesis: weight;
    /* Ensure proper vertical alignment */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media (max-width: 480px) {
    .music-score {
      padding: 1rem;
    }
  }

  @supports not (-webkit-overflow-scrolling: touch) {
    .treble-clef {
      top: 26px;
      font-size: 2.7rem;
    }
    .bass-clef {
      bottom: -14px;
      font-size: 3rem;
    }
  }
</style>
