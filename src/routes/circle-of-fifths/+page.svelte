<script lang="ts">
  import { playNote } from '$lib/utils/audioUtils';

  // Circle of Fifths data with proper angles (starting from C at top)
  const circleData = [
    { major: 'C', minor: 'Am', sharps: 0, flats: 0, angle: 0, keySignature: '' },
    { major: 'G', minor: 'Em', sharps: 1, flats: 0, angle: 30, keySignature: '♯' },
    { major: 'D', minor: 'Bm', sharps: 2, flats: 0, angle: 60, keySignature: '♯♯' },
    { major: 'A', minor: 'F♯m', sharps: 3, flats: 0, angle: 90, keySignature: '♯♯♯' },
    { major: 'E', minor: 'C♯m', sharps: 4, flats: 0, angle: 120, keySignature: '♯♯♯♯' },
    { major: 'B/C♭', minor: 'G♯m/A♭m', sharps: 5, flats: 0, angle: 150, keySignature: '♯♯♯♯♯' },
    {
      major: 'F♯/G♭',
      minor: 'D♯m/E♭m',
      sharps: 6,
      flats: 6,
      angle: 180,
      keySignature: '♯♯♯♯♯♯/♭♭♭♭♭♭'
    },
    { major: 'C♯/D♭', minor: 'A♯m/B♭m', sharps: 0, flats: 5, angle: 210, keySignature: '♭♭♭♭♭' },
    { major: 'A♭', minor: 'Fm', sharps: 0, flats: 4, angle: 240, keySignature: '♭♭♭♭' },
    { major: 'E♭', minor: 'Cm', sharps: 0, flats: 3, angle: 270, keySignature: '♭♭♭' },
    { major: 'B♭', minor: 'Gm', sharps: 0, flats: 2, angle: 300, keySignature: '♭♭' },
    { major: 'F', minor: 'Dm', sharps: 0, flats: 1, angle: 330, keySignature: '♭' }
  ];

  let selectedKey: string | null = null;
  let selectedMode: 'major' | 'minor' = 'major';

  // SVG dimensions
  const centerX = 250;
  const centerY = 250;
  const outerRadius = 200;
  const majorRadius = 160;
  const minorRadius = 120;
  const innerRadius = 80;

  // Colors for the segments - matching the reference image
  const segmentColors = [
    '#e53e3e', // C - red (12 o'clock)
    '#f56500', // G - orange-red (1 o'clock)
    '#fbb040', // D - orange (2 o'clock)
    '#ffd700', // A - yellow (3 o'clock)
    '#9acd32', // E - yellow-green (4 o'clock)
    '#20b2aa', // B/Cb - teal (5 o'clock)
    '#1e90ff', // F#/Gb - blue (6 o'clock)
    '#4169e1', // C#/Db - royal blue (7 o'clock)
    '#8a2be2', // G#/Abm - blue-violet (8 o'clock)
    '#9932cc', // Eb - dark orchid (9 o'clock)
    '#da70d6', // Bb - orchid (10 o'clock)
    '#ff69b4' // F - hot pink (11 o'clock)
  ];

  function handleKeyClick(key: string, mode: 'major' | 'minor') {
    selectedKey = key;
    selectedMode = mode;

    // Play the root note of the selected key
    const rootNote =
      mode === 'major'
        ? key.split('/')[0].replace('♯', '#').replace('♭', 'b')
        : key.replace('m', '').split('/')[0].replace('♯', '#').replace('♭', 'b');
    playNote(`${rootNote}4`);
  }

  function handleKeyKeydown(event: KeyboardEvent, key: string, mode: 'major' | 'minor') {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleKeyClick(key, mode);
    }
  }

  function getKeySignature(key: string, mode: 'major' | 'minor'): string {
    const keyData = circleData.find(
      (data) => (mode === 'major' && data.major === key) || (mode === 'minor' && data.minor === key)
    );

    if (!keyData) return '';

    // List of specific enharmonic keys that should show both signatures on separate lines
    const specificEnharmonicKeys = ['A♯m/B♭m', 'D♯m/E♭m', 'G♯m/A♭m', 'C♯/D♭', 'F♯/G♭', 'B/C♭'];

    // Check if this is one of the specific enharmonic keys
    const isSpecificEnharmonic = specificEnharmonicKeys.includes(key);

    if (isSpecificEnharmonic) {
      // For specific enharmonic keys, show both sharp and flat signatures on separate lines
      const sharpOrder = ['F♯', 'C♯', 'G♯', 'D♯', 'A♯', 'E♯', 'B♯'];
      const flatOrder = ['B♭', 'E♭', 'A♭', 'D♭', 'G♭', 'C♭', 'F♭'];

      let result = '';

      // Always show both sharp and flat signatures for enharmonic keys
      if (keyData.sharps > 0) {
        result += sharpOrder.slice(0, keyData.sharps).join(' ');
      }
      if (keyData.flats > 0) {
        if (result) result += '<br>';
        result += flatOrder.slice(0, keyData.flats).join(' ');
      }

      // For keys that have equivalent sharp/flat counts, show both
      if (keyData.sharps === keyData.flats && keyData.sharps > 0) {
        // Already handled above
        return result;
      }

      // For keys like B/C♭ (5 sharps = 7 flats equivalent), C♯/D♭ (7 sharps = 5 flats), etc.
      if (key === 'B/C♭') {
        result = sharpOrder.slice(0, 5).join(' ') + '<br>' + flatOrder.slice(0, 7).join(' ');
      } else if (key === 'G♯m/A♭m') {
        result = sharpOrder.slice(0, 5).join(' ') + '<br>' + flatOrder.slice(0, 7).join(' ');
      } else if (key === 'C♯/D♭') {
        result = sharpOrder.slice(0, 7).join(' ') + '<br>' + flatOrder.slice(0, 5).join(' ');
      } else if (key === 'A♯m/B♭m') {
        result = sharpOrder.slice(0, 7).join(' ') + '<br>' + flatOrder.slice(0, 5).join(' ');
      }

      return result;
    } else {
      // For all other keys, show the appropriate signature
      if (keyData.sharps > 0) {
        const sharpOrder = ['F♯', 'C♯', 'G♯', 'D♯', 'A♯', 'E♯', 'B♯'];
        return sharpOrder.slice(0, keyData.sharps).join(' ');
      } else if (keyData.flats > 0) {
        const flatOrder = ['B♭', 'E♭', 'A♭', 'D♭', 'G♭', 'C♭', 'F♭'];
        return flatOrder.slice(0, keyData.flats).join(' ');
      }

      return 'No sharps or flats';
    }
  }

  function getScale(key: string, mode: 'major' | 'minor'): string {
    // Define chromatic scale with both sharp and flat versions
    const chromaticSharp = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
    const chromaticFlat = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

    // Major scale intervals: W-W-H-W-W-W-H (whole-whole-half-whole-whole-whole-half)
    const majorIntervals = [0, 2, 4, 5, 7, 9, 11];
    // Natural minor scale intervals: W-H-W-W-H-W-W
    const minorIntervals = [0, 2, 3, 5, 7, 8, 10];

    // Get the root note (handle enharmonic keys)
    let rootNote = key;
    if (key.includes('/')) {
      // For enharmonic keys, choose the appropriate version based on key signature
      const keyData = circleData.find(
        (data) =>
          (mode === 'major' && data.major === key) || (mode === 'minor' && data.minor === key)
      );

      if (keyData) {
        if (keyData.sharps > 0) {
          rootNote = key.split('/')[0]; // Use sharp version
        } else if (keyData.flats > 0) {
          rootNote = key.split('/')[1]; // Use flat version
        }
      }
    }

    // Remove 'm' from minor keys
    if (rootNote.endsWith('m')) {
      rootNote = rootNote.slice(0, -1);
    }

    // Determine which chromatic scale to use based on the root note
    let chromatic = chromaticSharp;
    if (rootNote.includes('♭') || ['F', 'B♭', 'E♭', 'A♭', 'D♭'].includes(rootNote)) {
      chromatic = chromaticFlat;
    }

    // Find root note index
    let rootIndex = chromatic.indexOf(rootNote);
    if (rootIndex === -1) {
      // Try the other chromatic scale
      chromatic = chromatic === chromaticSharp ? chromaticFlat : chromaticSharp;
      rootIndex = chromatic.indexOf(rootNote);
    }

    if (rootIndex === -1) return 'Scale not found';

    // Generate scale
    const intervals = mode === 'major' ? majorIntervals : minorIntervals;
    const scale = intervals.map((interval) => {
      const noteIndex = (rootIndex + interval) % 12;
      return chromatic[noteIndex];
    });

    return scale.join(' - ');
  }

  // Calculate position for elements
  function getPosition(angle: number, radius: number) {
    const radian = (angle - 90) * (Math.PI / 180);
    return {
      x: centerX + radius * Math.cos(radian),
      y: centerY + radius * Math.sin(radian)
    };
  }

  // Create SVG path for pie segment
  function createSegmentPath(startAngle: number, endAngle: number, innerR: number, outerR: number) {
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = centerX + innerR * Math.cos(startAngleRad);
    const y1 = centerY + innerR * Math.sin(startAngleRad);
    const x2 = centerX + outerR * Math.cos(startAngleRad);
    const y2 = centerY + outerR * Math.sin(startAngleRad);

    const x3 = centerX + outerR * Math.cos(endAngleRad);
    const y3 = centerY + outerR * Math.sin(endAngleRad);
    const x4 = centerX + innerR * Math.cos(endAngleRad);
    const y4 = centerY + innerR * Math.sin(endAngleRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x1} ${y1} Z`;
  }
</script>



<div class="circle-of-fifths-wrapper">
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
        <h1 class="main-title">Circle of Fifths</h1>
        <p class="page-description">
          Master key signatures, chord relationships, and scales with this interactive Circle of
          Fifths
        </p>
      </div>
    </header>

    <!-- Main Content -->
    <div class="circle-content">
      <!-- Interactive Circle -->
      <div class="circle-container">
        <div class="circle-card">
          <svg viewBox="0 0 500 500" class="circle-svg">
            <!-- SVG Gradients -->
            <defs>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.1)" />
              </filter>
              {#each segmentColors as color, i}
                <linearGradient id="gradient{i}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:{color};stop-opacity:1" />
                  <stop offset="100%" style="stop-color:{color};stop-opacity:0.8" />
                </linearGradient>
              {/each}
            </defs>

            <!-- Major Key Segments -->
            {#each circleData as keyData, index}
              {@const startAngle = keyData.angle - 15}
              {@const endAngle = keyData.angle + 15}
              {@const segmentPath = createSegmentPath(
                startAngle,
                endAngle,
                minorRadius + 10,
                outerRadius
              )}
              {@const majorPos = getPosition(keyData.angle, majorRadius)}

              <!-- Major key segment -->
              <path
                d={segmentPath}
                fill="url(#gradient{index})"
                stroke="white"
                stroke-width="2"
                class="key-segment major-segment"
                class:selected={selectedKey === keyData.major && selectedMode === 'major'}
                role="button"
                tabindex="0"
                aria-label={`${keyData.major} major key`}
                on:click={() => handleKeyClick(keyData.major, 'major')}
                on:keydown={(e) => handleKeyKeydown(e, keyData.major, 'major')}
              />

              <!-- Major key label -->
              <text
                x={majorPos.x}
                y={majorPos.y + 2}
                class="key-text major-text"
                text-anchor="middle"
                dominant-baseline="middle"
                role="button"
                tabindex="0"
                aria-label={`${keyData.major} major key`}
                on:click={() => handleKeyClick(keyData.major, 'major')}
                on:keydown={(e) => handleKeyKeydown(e, keyData.major, 'major')}
              >
                {#if keyData.major === 'C♯/D♭' || keyData.major === 'F♯/G♭' || keyData.major === 'B/C♭'}
                  <tspan x={majorPos.x} dy="-0.3em">{keyData.major.split('/')[0]}</tspan>
                  <tspan x={majorPos.x} dy="1em">{keyData.major.split('/')[1]}</tspan>
                {:else}
                  {keyData.major}
                {/if}
              </text>
            {/each}

            <!-- Minor Key Segments -->
            {#each circleData as keyData, index}
              {@const startAngle = keyData.angle - 15}
              {@const endAngle = keyData.angle + 15}
              {@const segmentPath = createSegmentPath(
                startAngle,
                endAngle,
                innerRadius,
                minorRadius + 10
              )}
              {@const minorPos = getPosition(keyData.angle, minorRadius - 15)}

              <!-- Minor key segment -->
              <path
                d={segmentPath}
                fill="url(#gradient{index})"
                stroke="white"
                stroke-width="2"
                class="key-segment minor-segment"
                class:selected={selectedKey === keyData.minor && selectedMode === 'minor'}
                role="button"
                tabindex="0"
                aria-label={`${keyData.minor} minor key`}
                on:click={() => handleKeyClick(keyData.minor, 'minor')}
                on:keydown={(e) => handleKeyKeydown(e, keyData.minor, 'minor')}
                opacity="0.8"
              />

              <!-- Minor key label -->
              <text
                x={minorPos.x}
                y={minorPos.y + 2}
                class="key-text minor-text"
                text-anchor="middle"
                dominant-baseline="middle"
                role="button"
                tabindex="0"
                aria-label={`${keyData.minor} minor key`}
                on:click={() => handleKeyClick(keyData.minor, 'minor')}
                on:keydown={(e) => handleKeyKeydown(e, keyData.minor, 'minor')}
              >
                {#if keyData.minor === 'A♯m/B♭m' || keyData.minor === 'D♯m/E♭m' || keyData.minor === 'G♯m/A♭m'}
                  <tspan x={minorPos.x} dy="-0.6em">{keyData.minor.split('/')[0]}</tspan>
                  <tspan x={minorPos.x} dy="1em">{keyData.minor.split('/')[1]}</tspan>
                {:else}
                  {keyData.minor}
                {/if}
              </text>
            {/each}

            <!-- Center Circle -->
            <circle
              cx={centerX}
              cy={centerY}
              r={innerRadius}
              fill="white"
              stroke="#ddd"
              stroke-width="2"
              filter="url(#shadow)"
            />

            <!-- Directional arrows in center -->
            <g class="direction-arrows">
              <!-- Up by 4th (counterclockwise, left side) -->
              <path
                d="M 230 200 A 40 40 0 0 0 200 230"
                stroke="#666"
                stroke-width="3"
                fill="none"
                marker-end="url(#arrowhead)"
              />
              <text x="180" y="270" class="direction-text">Up by 4th</text>

              <!-- Up by 5th (clockwise, right side) -->
              <path
                d="M 270 200 A 40 40 0 0 1 300 230"
                stroke="#666"
                stroke-width="3"
                fill="none"
                marker-end="url(#arrowhead)"
              />
              <text x="263" y="270" class="direction-text">Up by 5th</text>
            </g>

            <!-- Arrow marker -->
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="0"
                refY="5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon points="0 2, 0 8, 8 5" fill="#666" />
              </marker>
            </defs>
          </svg>
        </div>
      </div>

      <!-- Key Information Panel -->
      {#if selectedKey}
        <div class="key-info-panel">
          <div class="glass-card info-card">
            <h3 class="info-title">
              {selectedKey}
              {selectedMode === 'major' ? 'Major' : 'Minor'}
            </h3>

            <div class="info-grid">
              <div class="info-item">
                <h4>Sharps & Flats</h4>
                <p class="key-signature">{@html getKeySignature(selectedKey, selectedMode)}</p>
              </div>

              <div class="info-item">
                <h4>Scale Notes</h4>
                <p class="scale-notes">{getScale(selectedKey, selectedMode)}</p>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .circle-of-fifths-wrapper {
    min-height: calc(90vh - 4rem);
    padding: 2rem 0;
  }

  .circle-of-fifths-wrapper .header-section {
    padding-bottom: 0;
  }

  .circle-content {
    display: flex;
    flex-direction: column;
    padding-bottom: 3rem;
  }

  .circle-container {
    display: flex;
    justify-content: center;
  }

  .circle-card {
    max-width: 850px;
    width: 100%;
    background: transparent;
    border: none;
    box-shadow: none;
  }

  .circle-svg {
    width: 100%;
    height: auto;
    max-width: 850px;
  }

  .circle-svg * {
    outline: none !important;
  }

  .circle-svg *:focus {
    outline: none !important;
  }

  .key-segment {
    cursor: pointer;
    transition: all 0.3s ease;
    outline: none;
  }

  .key-segment:hover {
    opacity: 1 !important;
    filter: brightness(1.1);
    transform: scale(1.005);
    transform-origin: center;
  }

  .key-segment:focus {
    outline: none;
  }

  .key-segment.selected {
    opacity: 1 !important;
    filter: brightness(1.2);
  }

  .major-segment {
    opacity: 0.9;
  }

  .minor-segment {
    opacity: 0.7;
  }

  .key-text {
    font-size: 25px;
    font-weight: 700;
    fill: white;
    pointer-events: none;
    user-select: none;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    outline: none;
  }

  .key-text:focus {
    outline: none;
  }

  .minor-text {
    font-size: 15px;
  }

  .direction-text {
    font-size: 12px;
    fill: #666;
    font-weight: 500;
  }

  .direction-arrows {
    opacity: 0.7;
  }

  .key-info-panel {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
  }

  .info-card {
    padding: 2rem;
    max-width: 600px;
    width: 100%;
  }

  .info-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1.5rem;
  }

  .info-item {
    text-align: center;
  }

  .info-item h4 {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-secondary);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .key-signature {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
  }

  .scale-notes {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-secondary);
    margin: 0;
    letter-spacing: 0.5px;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .minor-text {
      font-size: 17px !important;
    }

    .info-card {
      padding: 1.5rem;
    }

    .info-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .key-text {
      font-size: 28px;
    }

    .direction-arrows {
      display: none;
    }
  }

  @media (max-width: 480px) {
    .info-card {
      padding: 1.25rem;
    }

    .info-title {
      font-size: 1.25rem;
    }

    .circle-of-fifths-wrapper {
      padding: 1rem 0;
    }
  }

  @media (max-width: 480px) {
    .circle-of-fifths-wrapper {
      padding: 1.5rem 0;
    }
  }
</style>
