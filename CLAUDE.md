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

One thing to know before you trust the tooling: **`npm run lint` already fails on `main`** —
most files have never been Prettier-formatted. Don't "fix" this with a repo-wide
`npm run format`; it produces an enormous unrelated diff. Format only the files you touch,
and only if they were already clean. Where deliberately grouped data would be reflowed (the
per-octave note arrays in `audioUtils.ts`), a `// prettier-ignore` keeps both.

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
     (`c3.mp3`), octaves 2/5/6 use uppercase (`C2.mp3`), and accidentals are _always_ flats
     and _always_ uppercase (`Db3.mp3` — there is no `cs3.mp3`). `getNoteFileName()` converts
     sharps→flats and fixes the case before lookup. Anything that references audio paths
     directly must follow the same rules.
  2. **It must stay on Web Audio.** iOS Safari unlocks `HTMLAudioElement` _per element_, so a
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
  `recordItemResult()` → `completePracticeSession()` → `checkAchievements()` →
  `saveProgress()`.

  `loadProgress()` does a **shallow merge**, so any new field must be top-level _and_
  defaulted there explicitly, or existing users get `undefined`. Nested additions under
  `modules` will not be defaulted.

  Beyond the lifetime counters it holds two maps:
  - `dailyStats`, keyed by local calendar day, backing the activity chart and the daily
    streak, pruned to a year.
  - `itemStats`, keyed `'<practiceKey>:<itemId>'`, holding per-item accuracy. This drives
    `pickWeightedItem()`, which is how the practice modes choose the next item — weighted
    toward what you keep missing (weight 1 when mastered, up to 4 when always missed, 3 when
    never seen) rather than uniform random. Change those constants and you change how hard
    practice feels.

  `exportProgress()` / `importProgress()` are the only way progress survives a cleared
  browser or a device change.

- **`themeUtils.ts`** — light/dark/system. Only an explicit choice is stored, so 'system'
  keeps following the OS. The `data-theme` attribute is applied by an inline script in
  `app.html` before first paint; `THEME_KEY` must stay in sync with it. `app.css` defines
  dark **twice** — under `prefers-color-scheme` and under `[data-theme='dark']` — because an
  explicit light choice has to win on a machine set to dark. Change both together.

- **`seoUtils.ts`** — `pageSEOConfigs` keyed by route id. `SEOHead.svelte` is rendered once
  in `+layout.svelte` and looks up `$page.route.id`. **Adding a route means adding an entry
  here**, or the page inherits homepage metadata. Each entry repeats title/description across
  primary, OG, Twitter, and structuredData blocks.

  A route with per-instance metadata (the chord pages) returns `seo` from its `load` instead,
  which `SEOHead` prefers. Don't emit a `<title>` from the page itself — layout head content
  renders first and wins.

  The JSON-LD block is emitted as a whole `<script>` tag through `{@html}`. That looks odd but
  is required: Svelte does not interpolate expressions inside a literal `<script>` element, so
  writing `{@html ...}` between script tags shipped the template source to crawlers instead of
  the data.

- **`chordUtils.ts` slugs** — chord names contain `#` and `♭`, which can't sit in a URL path,
  so `chordSlug()`/`chordFromSlug()` map `C#maj7` ↔ `c-sharp-major-7th`. These are **public
  URLs** for the 160 prerendered pages under `/chord-dictionary/`; changing the mapping
  changes live URLs. `getSluggedChords()` feeds both the prerender `entries()` and
  `sitemap.xml`, so a new chord in the dictionary gets a page and a sitemap entry for free.

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
sequence. Round items come from `pickWeightedItem()`, not `Math.random()`. The timers and
mistake caps are still hard-coded per page with no difficulty setting.

`/chord-dictionary/[chord]` is a prerendered page per chord (160 of them), driven by the slug
helpers above. Requests using the old raw chord name 301 to the canonical slug.

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

A `check` job runs `npm ci && npm run check` and the deploy job `needs` it, so a type error
blocks the deploy. `npm run lint` is deliberately not in CI — it fails on `main` (see above),
so adding it would block every deploy until the repo is formatted.

Note the deploy also runs `npm run build`, which **prerenders**, and prerendering fails the
build on a dangling internal link. That is a feature — it has already caught one — but it
means a broken `href` breaks the deploy, not just a page.

## Testing changes on iOS

Audio bugs in this app are overwhelmingly iOS-specific and **do not reproduce in desktop
Safari**. To verify anything touching `audioUtils.ts`, serve with `npm run dev -- --host` and
open the LAN URL on a real iPhone. Check: first tap sounds immediately; every key in an
octave sounds (the old bug was intermittent); chords sound as one event; audio still works
after backgrounding the app for 30 seconds; and it plays with the ringer/silent switch in
both positions.
