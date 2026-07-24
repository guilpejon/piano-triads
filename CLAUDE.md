# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm run dev          # Vite dev server
npm run dev -- --host  # expose on the LAN — required for testing on a real iPhone/Android
npm run build        # → build/ via adapter-node
npm run preview      # serve the production build (service worker only works here, not in dev)
npm run check        # svelte-kit sync && svelte-check — the only correctness gate that exists
npm run lint         # Prettier --check
npm run format       # Prettier --write
docker compose up --build   # prod-like container on :3000
```

Node 24.5.0 (`.tool-versions`). No ESLint. **No test framework is installed** — there is no
way to run a single test; verification is manual or via `npm run check`.

Two things to know before you trust the tooling:

- **`npm ci` fails**: `package-lock.json` is out of sync with `package.json` (missing
  platform-specific `@tailwindcss/oxide-*` and `lightningcss-*` optional deps). Use
  `npm install`. This also means the `npm ci` branch in the `Dockerfile` is fragile.
- **`npm run lint` already fails on `main`** — 23 files have never been Prettier-formatted.
  Don't "fix" this with a repo-wide `npm run format`: it produces an enormous unrelated diff
  and reflows deliberately grouped data (e.g. the per-octave note arrays in `audioUtils.ts`).
  Format only what you touch, and only if that file was already clean.

## Architecture

SvelteKit 2 + Svelte 5 PWA. No backend, no database — all user state is `localStorage`.
Nine routes, each a self-contained page; five shared components; four utility modules that
carry all the domain logic.

**Written entirely in Svelte 4 legacy syntax** — `export let`, `$:`, `on:click`, `<slot>`,
`createEventDispatcher`. There are zero runes (`$state`/`$props`/`$derived`) in `src/`.
Match the surrounding style rather than mixing idioms in.

### `src/lib/utils/` — the domain layer

- **`chordUtils.ts`** — the `chordDictionary` Map (chord name → `root_position` plus
  inversions), scale definitions, and the enharmonic helpers every page relies on:
  `areNotesEquivalent`, `normalizeNoteName`, `getNoteNameOnly`, `areAllChordNotesClicked`.
  Chords and scales are **hand-enumerated per root**, not generated from intervals, so the
  file is ~1,100 lines and contains some inconsistent spellings (e.g. `C#maj7` is
  `['C#3','F3','G#3','C4']`). Adding a chord means adding every root × inversion by hand.

- **`audioUtils.ts`** — sample playback over the **Web Audio API**.

  Two traps live here:

  1. **The MP3 filename convention is irregular.** Octaves 3–4 use lowercase naturals
     (`c3.mp3`), octaves 2/5/6 use uppercase (`C2.mp3`), and accidentals are *always* flats
     and *always* uppercase (`Db3.mp3` — there is no `cs3.mp3`). `getNoteFileName()` converts
     sharps→flats and fixes the case before lookup. Anything that references audio paths
     directly must follow the same rules.
  2. **It must stay on Web Audio.** iOS Safari unlocks `HTMLAudioElement` *per element*, so a
     cloned `<audio>` is never unlocked and its `play()` rejects with `NotAllowedError`; it
     also ignores `preload` before a user gesture, and flushes blocked `play()` calls
     together once a gesture arrives. That combination produced the old symptoms — notes
     lagging, silently not playing, or all firing at once on iOS while Android was fine.
     The current implementation therefore uses one `AudioContext`, decodes samples with
     `fetch` + `decodeAudioData` (not gesture-gated), unlocks on the first
     `pointerdown`/`touchend`/`keydown`, sets `navigator.audioSession.type = 'playback'` so
     the iPhone ringer switch doesn't mute it, and resumes on `visibilitychange`.
     **Do not "simplify" this back to `new Audio()`** — it will work on your desktop and on
     Android, and break on iOS.

  `playChord(notes)` starts every voice at the same `currentTime`; pass a second
  `arpeggiateMs` argument to deliberately roll. `setAudioKeyRange()` is idempotent and never
  discards decoded buffers.

- **`progressUtils.ts`** — `UserProgress` persisted to `localStorage` under
  `piano-triads-progress`. Every practice page ends a round with the same sequence:
  `completePracticeSession()` → `checkAchievements()` → `saveProgress()`.
  `loadProgress()` has **no migration path**, so any new field must be defaulted there or
  existing users hit `undefined`.

- **`seoUtils.ts`** — `pageSEOConfigs` keyed by route id. `SEOHead.svelte` is rendered once
  in `+layout.svelte` and looks up `$page.route.id`. **Adding a route means adding an entry
  here**, or the page inherits homepage metadata. Each entry repeats title/description across
  primary, OG, Twitter, and structuredData blocks.

### The Piano contract is DOM classes, not props

`Piano.svelte` renders 61 hand-written `<button class="key" data-note="...">` elements
(`data-note` holds slash-separated enharmonics, e.g. `"C#3/Db3"`). It exposes only
`scrollToActiveKey()`.

Practice pages drive it by reaching in with `document.querySelectorAll('.key[data-note]')`
and toggling `chord-active`, `practice-correct`, `practice-failed`, `practice-success`,
re-deriving matches by string-parsing `data-note`. There are ~40 such call sites across six
pages.

This is the existing pattern, and it is fragile — highlight state lives in the DOM rather
than in any component, so nothing here is unit-testable. Follow it if you're making a small
change; if you're doing anything substantial, converting `Piano` to a
`highlights` prop + `on:notepress` event is the right move and deletes most of that code.

### Page structure

Every practice page (`chord-practice`, `pitch-training`, `music-score-practice`) is the same
state machine: `gameState: 'waiting' | 'playing' | 'completed' | 'failed'`, a `setInterval`
countdown (30 s / 15 s / 20 s respectively), a mistake cap of 3, then the progress-save
sequence. Round items are chosen with uniform `Math.random()` — there is no adaptive
selection or spaced repetition.

`/chord-dictionary/[chord]/+page.js` is not a page: it 302-redirects to
`/chord-dictionary?chord=X`, so there are no per-chord indexable URLs and no `sitemap.xml`.

### Styling

Design tokens are CSS custom properties in `src/app.css` (`--color-*`, `--gradient-*`,
`--shadow-*`, `--transition-*`) plus shared classes (`.page-container`, `.glass-card`,
`.header-section`). Tailwind v4 is wired up via `@tailwindcss/vite`, but pages are almost
entirely hand-written scoped CSS — prefer the tokens over Tailwind utilities for consistency.
There is currently **no dark mode** and no `prefers-reduced-motion` handling; the token set is
light-only, and a few colors are hard-coded outside it (e.g. the footer in `+layout.svelte`).

### PWA

`vite-plugin-pwa` (configured in `vite.config.ts`) owns **both** the service worker and the
manifest, and `InstallPrompt.svelte` performs the single `registerSW()` call. A hand-written
`static/sw.js` and `static/manifest.json` used to exist alongside it and were removed —
do not reintroduce them, and do not add a second `navigator.serviceWorker.register()`.

`registerType` is `'prompt'`, so a new build surfaces the update banner in
`InstallPrompt.svelte` instead of swapping under the user. `devOptions.enabled` is `false`,
so the service worker only exists in `npm run preview` / production builds.

If you ever add a custom fetch handler: Safari requests media with HTTP **Range** requests,
and answering those with a full cached `200` breaks audio playback on iOS specifically.

### Deploy

Push to `main` → GitHub Actions (`.github/workflows/deploy.yml`) builds a `linux/arm64` image
→ pushes to GHCR → SSHes to a Raspberry Pi over a Cloudflare tunnel →
`docker compose -f docker-compose.prod.yml up -d`.

**The workflow runs no checks** — not `npm run check`, not `npm run lint`, no tests. A type
error reaches production as long as Vite can build it. Run `npm run check` yourself before
pushing.

## Testing changes on iOS

Audio bugs in this app are overwhelmingly iOS-specific and **do not reproduce in desktop
Safari**. To verify anything touching `audioUtils.ts`, serve with `npm run dev -- --host` and
open the LAN URL on a real iPhone. Check: first tap sounds immediately; every key in an
octave sounds (the old bug was intermittent); chords sound as one event; audio still works
after backgrounding the app for 30 seconds; and it plays with the ringer/silent switch in
both positions.
