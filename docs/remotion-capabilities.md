# Remotion capabilities — landscape for Onda

> Compiled 2026-05-23 against Remotion 4.0.465 docs. This is a reference so Onda doesn't reinvent what Remotion ships. Each item gets a one-line **take**: **USE** (adopt directly), **WRAP** (use under an Onda-named thin layer that adds restraint or default-injection), or **SKIP** (deliberate non-goal).

---

## Highest-leverage adoption opportunities

In priority order — these change real decisions on the existing codebase or upcoming techspecs.

1. **Replace `lib/random.ts` with Remotion's `random(seed)`.** Same algorithm, cross-thread deterministic, already audited. Our `seededRandom` adds zero value.
2. **Fonts strategy: `@remotion/google-fonts` for Space Grotesk + `@remotion/fonts` for Clash Display.** Both integrate with `delayRender()` so Player / Studio / SSR never flash unstyled text. Drop the Fontshare CDN `<link>` and `next/font/google` from inside compositions (keep them for the docs-site shell only).
3. **Refactor `<ComponentPreview>` so controls are a *sibling* of `<Player>`, not nested.** Remotion's docs are explicit: putting state next to Player causes the Player to re-render every frame. Use the official `useCurrentPlayerFrame(ref)` hook in the sibling.
4. **Use `lazyComponent` on Player + `<Thumbnail>` for the `/components` grid.** Code-split each component into its own chunk; render stills (not running Players) on the index page. Critical scaling unlock for a 30+ component catalog.
5. **`@remotion/paths` `evolvePath()` is the entire implementation of our `DrawOn` primitive.** Don't write our own.
6. **`@remotion/captions` + `createTikTokStyleCaptions()` is the substrate for kinetic typography.** Word-by-word, karaoke-style reveals with timing data already normalized from SRT / Whisper / ElevenLabs. High leverage for the AI-agent-generating-video use case.
7. **Wrap `@remotion/transitions` `TransitionSeries` as `<SectionTransition>` with custom Onda presentations.** Don't surface raw `cube` / `flip` — they violate the no-overshoot, no-showy rule. Ship `blurFade` + `softWipe` built with the custom-presentation API so transitions themselves carry the Onda fingerprint.

---

## 1. Core API

### Layout & sequencing

| API | What it does | Take |
| --- | --- | --- |
| `<AbsoluteFill>` | Full-bleed absolute `<div>`, flex-column, last child on top. | **USE** — base layer for every scene block. |
| `<Sequence from durationInFrames name layout="absolute-fill" \| "none" premountFor showInTimeline>` | Mounts children for a frame range; `useCurrentFrame()` inside is time-shifted by `from`. | **USE** — the only correct way to compose timed segments. Use `layout="none"` for inline text spans. |
| `<Series>` / `<Series.Sequence>` | Auto-chains Sequences end-to-end. `offset` shifts subsequent siblings (negative = overlap, positive = gap). Only the **last** child may have `Infinity` duration. | **USE** — perfect for scene-block storyboards (title → stat → list → end card). |
| `<Loop durationInFrames times>` | Repeats children. `Loop.useLoop()` exposes `{durationInFrames, iteration}`. | **WRAP** opportunistically inside primitives that need perpetual cycle (e.g., grain shimmer); thin pass-throughs add no value. |
| `<Freeze frame active>` | Locks descendants to fixed frame; `active` accepts `boolean` or `(frame) => boolean`. | **WRAP** for hold-on-final-frame end cards or "freeze on stat" reveals. |
| `<IFrame>` | `<iframe>` with `delayRender` on load. Content can't animate via `useCurrentFrame`. | **SKIP** — irrelevant to motion graphics. |
| `<Still>` | `Composition` without `fps`/`durationInFrames`; single-frame outputs. | **SKIP** for v1 (Onda ships motion, not stills). |
| `<Folder>` | Studio-sidebar grouping only, no runtime effect. | **USE** in the docs Studio to group `Primitives/`, `Scenes/`. |

### Time / config

| API | What it does | Take |
| --- | --- | --- |
| `useCurrentFrame()` | Returns current frame **relative to nearest Sequence**. To pass absolute frame down, read at top level and prop-drill. | **USE** — the heartbeat of every Onda component. |
| `useVideoConfig()` | `{fps, width, height, durationInFrames, id, defaultProps, props}`. Inside a Sequence, dimensions reflect the Sequence, not root. | **USE** — required for every spring (needs `fps`) and canvas-adaptive layout. |
| `<Composition id component\|lazyComponent durationInFrames fps width height defaultProps schema calculateMetadata>` | Registers a renderable. When a Zod `schema` is given, Studio gets a typed prop editor for free. `calculateMetadata` is async, preferred over `delayRender` for data-driven config. | **USE** — every docs-site preview is a `<Composition>` with the component's Zod schema. |

---

## 2. Animation utilities

| API | What it does | Take |
| --- | --- | --- |
| `spring({frame, fps, from?, to?, config?, durationInFrames?, durationRestThreshold?, delay?, reverse?})` | Physical spring solver. Config: `mass`, `damping`, `stiffness`, `overshootClamping`. House config `{damping:200, stiffness:100, mass:1}` kills overshoot. | **USE everywhere** position/scale/rotation moves. Already the Onda default in `lib/motion.ts`. |
| `interpolate(input, [in], [out], options?)` | Maps numeric ranges, multi-keypoint. `extrapolateLeft/Right`: `'extend'` (default — **dangerous**), `'clamp'`, `'identity'`, `'wrap'`. `easing` accepts function or array (v4.0.462+, one per segment). | **USE** for opacity / blur / color scalars. **Always pass `clamp` on both sides** unless intentionally extending. |
| `interpolateColors(value, [in], [colors])` | Returns `rgba(...)` string. Supports named/hex/rgb/hsl + modern `oklch/oklab/lab/lch/hwb` (v4.0.439+). | **USE** for accent-glow transitions — cleaner than CSS keyframes. |
| `Easing` | Presets: `linear`, `ease`, `quad`, `cubic`, `poly(n)`, `sin`, `circle`, `exp`, `elastic(b)`, `back(s)`, `bounce`, `step0`, `step1`. Modifiers: `in()`, `out()`, `inOut()`. Bezier helper: `Easing.bezier(x1,y1,x2,y2)`. | **USE** the bezier helper for `HOUSE_EASE`. Never `linear` except for true throughput (scrolling marquees). |
| `random(seed: number \| string \| null)` | Deterministic `[0,1)`. Same seed → same value across worker threads. `null` opts into true randomness (don't use in render). | **USE** — replace our `lib/random.ts` (`seededRandom`). |

---

## 3. Asset / media

| API | What it does | Take |
| --- | --- | --- |
| `<Img>` | Like `<img>` but `delayRender`s until loaded; auto-retries; surfaces `onError`. Inherits Sequence props. | **USE** any time a component receives an image URL prop (logos, photo cards). Never raw `<img>`. |
| `<Video>` / `<OffthreadVideo>` | `Video` syncs `<video>` element to timeline; `OffthreadVideo` is the Rust-decoded variant Remotion recommends as default for renders. | **WRAP — sparingly.** A `VideoCard` scene block is plausible; prefer `OffthreadVideo`. |
| `<Audio>` | Same family as Video. `volume` can be a frame-fn for fades; `trimBefore`/`trimAfter`. | **SKIP for v1** — Onda v1 is silent motion. |
| `prefetch(src) → {waitUntilDone, free}` | Resolves a media URL to a blob/data URL; used to warm `<Player>` before play. | **WRAP** in the docs-site `<Player>` host, not in components themselves. |
| `delayRender(label?, {retries, timeoutInMilliseconds})` / `continueRender(handle)` | Pauses render until async work completes. Must be called inside a component, wrapped in `useState`. 30s default timeout. | Prefer `calculateMetadata`. **SKIP inside Onda primitives** — async data belongs in usage examples or `calculateMetadata`. |

---

## 4. Drawing helpers

### `@remotion/paths` — **USE**

The whole substrate for our draw-on / mask-reveal / icon-morph work.

| API | What it does | Take |
| --- | --- | --- |
| `evolvePath(progress, d) → {strokeDasharray, strokeDashoffset}` | Drop onto a `<path>` for draw-on. `progress` 0→1 reveals; >1 erases from start; <0 draws from end. | **USE** — this is the entire `DrawOn` primitive in one function. |
| `interpolatePath(t, pathA, pathB)` | Morphs between two `d` strings (d3-interpolate-path under the hood). | **USE** for logo-sting / icon-morph. |
| `getLength(d)`, `getPointAtLength(d, len)`, `getTangentAtLength(d, len)` | Measure / sample paths. | **USE** for "ride along a path" (dot tracing a curve, label following a stroke). |
| `reversePath`, `getSubpaths`, `translatePath`, `scalePath`, `warpPath`, `resetPath` | Geometry transforms. | **WRAP opportunistically** (e.g., reverse direction of a draw-on). |

### `@remotion/shapes` — **USE the `make*` helpers**

`<Rect>`, `<Triangle>`, `<Ellipse>`, `<Star>`, `<Pie>`, `<Circle>`, `<Polygon>`, `<Heart>` plus `make*` functions returning a path `d` string.

- **USE the `make*` functions** to feed into `evolvePath` (e.g., a draw-on star reveal).
- **SKIP the components as primitives** — they're already trivial; pass-throughs add nothing.

### `@remotion/noise` — **USE**

Deterministic seeded Perlin/Simplex: `noise2D(seed, x, y)`, `noise3D(...)`, `noise4D(...)`. Use for organic micro-motion (subtle camera-drift, grain shimmer, hand-drawn jitter on draw-on). Pair with `random()` for seeded variety.

---

## 5. `@remotion/player`

### Props worth knowing (and ones we should adopt)

| Prop | Default | Worth a look |
| --- | --- | --- |
| `lazyComponent` | – | **Adopt now** — code-splits per component. Critical at scale. |
| `errorFallback({error})` | – | Graceful failure on registry pages. |
| `renderLoading(dims)` | – | Render an Onda-styled skeleton instead of blank black during the load. |
| `renderPoster(dims)`, `showPosterWhenUnplayed`, `showPosterWhenPaused`, `posterFillMode` | `false` | Show a still preview pre-play instead of running a Player on every grid card. |
| `bufferStateDelayInMilliseconds` | `300` | Bump to ~500 to avoid flicker on fast prefetch. |
| `initialFrame` | `0` | Pick the most flattering frame of a loop as the resting state. |
| `numberOfSharedAudioTags` | `5` | Set to `0` while Onda is silent — frees DOM nodes. |
| `acknowledgeRemotionLicense` | – | **Already set.** Keep it. |
| `inFrame` / `outFrame` | `null` | Clamp the playable range for "highlight a moment" previews. |
| `playbackRate` | `1` | -10..10, ≠0. |
| `interactive` | `true` | If `false`, swallows all user interaction — useful for ambient hero pieces. |

Slot APIs (`renderPlayPauseButton`, `renderFullscreenButton`, `renderMuteButton`, `renderVolumeSlider`, `renderCustomControls`) keep the native control bar but restyle pieces — alternative to our full overlay approach when partial customization is enough.

### PlayerRef API

| Method | Signature |
| --- | --- |
| `play(syntheticEvent?)` / `pause()` / `toggle(syntheticEvent?)` | Pass the user event to `play()` on Safari to unlock audio. |
| `pauseAndReturnToPlayStart()` | Pause and snap to `initialFrame` / 0. |
| `seekTo(frame)` | – |
| `getCurrentFrame()` / `isPlaying()` | Polling state (prefer events). |
| `isFullscreen()` / `requestFullscreen()` / `exitFullscreen()` | – |
| `mute()` / `unmute()` / `isMuted()` / `setVolume(0..1)` / `getVolume()` | Note `isMuted`, not `getMuted`. |
| `getScale()` | Resize ratio for hover-thumbnail mapping. |
| `addEventListener(name, cb)` / `removeEventListener(name, cb)` | See events table. |

**Note:** there is **no** `setPlaybackRate` on the ref — change via the `playbackRate` prop. **No** `getCurrentTime` — derive `frame / fps`.

### Events

| Event | When | Payload |
| --- | --- | --- |
| `play`, `pause`, `ended` | – | – |
| `seeked` | After `seekTo` or scrub release | `{frame}` |
| `frameupdate` | Every frame change | `{frame}` — **prefer this over `timeupdate`** for UI bound to time. |
| `timeupdate` | Throttled (≤250 ms) | `{frame}` |
| `ratechange`, `volumechange`, `mutechange`, `fullscreenchange`, `scalechange` | – | typed payloads |
| `waiting` / `resume` | Enter/exit buffering | – |
| `error` | Render-time error | `{error: Error}` |

### Custom controls — **important architecture rule**

> "Don't put state next to `<Player>`; controls render as siblings receiving the same `ref`. Otherwise the Player re-renders every frame."

**Action item for Onda:** refactor `ComponentPreview` so the play/pause overlay is a sibling of `<Player>`, both receiving the same `playerRef`. Use the official `useCurrentPlayerFrame(ref): number` hook in the sibling (built on `useSyncExternalStore` subscribed to `frameupdate`). **`inputProps` must be `useMemo`'d** to avoid Player remount storms.

Scrubber recipe: pointer-down → `pause()` + bind move/up to `document.body`; on move, `seekTo(interpolate(x, [0, width], [inFrame ?? 0, outFrame ?? duration-1]))`; on up, resume if playing-before-drag.

### Display-resolution mismatch — **WRAP**

The default Player pattern renders the composition at its intrinsic dims (e.g. `compositionWidth={1920}`) and CSS-scales the result to whatever container it's in. When the container is small (catalog cards on mobile, in-app previews), the heavy transform-scale softens thin borders and sub-pixel anti-aliasing — the source of the "kinda low quality / pixelated" look on small viewports.

**Action item for Onda:** ship `<AdaptivePlayer>` (`lib/adaptive-player.tsx`, installable via `bunx ondajs add lib-adaptive-player`) — a drop-in `<Player>` replacement that measures its container with `ResizeObserver`, computes a target render resolution (CSS size × DPR, floored at `DEFAULT_MIN_RENDER_LONG_EDGE = 720`, capped at the intrinsic dims), and renders the Player at *that* size. Keeps the composition's coordinate space proportional to the source — `SizeRole`-driven typography stays correctly weighted; raw-pixel props read as "more legible thumbnail" on small cards. Companion hook `useAdaptiveCompositionSize(ref, intrinsicW, intrinsicH)` for callers managing their own Player ref/wrapper (e.g. `www/`'s `ComponentPreview`, which holds a `PlayerRef` for play/pause).

Time format: `mm:ss.ff` (frames, not ms) — Remotion's own convention.

Slot overrides (`renderPlayPauseButton` etc.) keep the native control bar and restyle individual pieces — an alternative path for partial customization.

### Autoplay

- `autoPlay` is unreliable when audio is present — Mobile Safari is the gatekeeper.
- Imperative `play()`/`toggle()` must receive the **user event** (`play(e)`) to unlock audio on Safari; use `onClickCapture`, not `onClick`.
- `onAutoPlayError` callback receives autoplay failures for custom recovery.
- **Pattern for Onda's silent loops:** `autoPlay` + `loop` + `initiallyMuted` + no audio in compositions = fully reliable across browsers.

### Performance & loading

- Use **`lazyComponent: () => import('./MyComp')`** instead of `component` for code-splitting.
- `@remotion/preload` injects `<link rel="preload">` — fire-and-forget hint, no completion signal.
- `prefetch(url) → { waitUntilDone, free }` downloads to a Blob URL with a completion Promise — use for hero previews where you want a guaranteed-ready first frame.
- SSR: feature-detect (fullscreen, audio context) only after mount to avoid hydration mismatch. We already wrap with `next/dynamic({ ssr: false })`.
- `noSuspense` is for tests only.

### `@remotion/player/Thumbnail` — **USE for the `/components` grid**

Static single-frame renderer (since v3.2.41). Props: `component`/`lazyComponent`, `compositionWidth/Height`, `durationInFrames`, `fps`, **`frameToDisplay`** (required), `inputProps`, `style`, `className`, `renderLoading`, `errorFallback`.

`ThumbnailRef`: `getContainerNode()`, `getScale()`, `addEventListener` for `error` / `waiting` / `resume`.

**Pairing strategy:** `Thumbnail` for the grid cards on `/components`, `Player` with `lazyComponent` + `renderPoster` on the detail page. The grid stops paying the cost of a running playback loop per card.

---

## 6. Helper packages

### `@remotion/google-fonts` — **USE for Space Grotesk**

Typesafe wrapper that ships every Google Font as a dedicated subpath import (e.g. `from '@remotion/google-fonts/SpaceGrotesk'`). `loadFont(style?, { weights, subsets })` returns `{ fontFamily, fonts, unicodeRanges, waitUntilDone }`. Uses `delayRender()` internally so the renderer blocks until the font is ready — solves FOUT/FOIT in `<Player />` and Studio without extra plumbing.

Differs from `next/font/google` in being **pure runtime** (no Next build pipeline, no self-hosted serving) — exactly what you want for components shipped as portable source.

**Supported (confirmed):** Space Grotesk, Manrope, DM Sans, Sora, Outfit, Unbounded, Bricolage Grotesque, Inter, Geist. **NOT supported:** Clash Display, General Sans, Satoshi, Cabinet Grotesk (Fontshare-only).

### `@remotion/fonts` — **USE for Clash Display**

Thin wrapper around the browser's `FontFace` API for **local font files** (`.woff2`, `.ttf`). Signature: `loadFont({ family, url, weight?, style?, unicodeRange?, display? })`. `url` is typically `staticFile('Clash-Display-Semibold.woff2')`. Registers in `document.fonts` and resolves when ready; pair with `delayRender()` to block.

Right home for non-Google fonts. Ship the `.woff2` files in `registry/lib/fonts/`.

### `@remotion/preload` — **SKIP for v1**

`preloadVideo`, `preloadAudio`, `preloadImage`, `preloadFont` — inject `<link rel="preload">`. Playback smoothness only — no effect on headless renders. Reach for it only when a media-heavy scene block ships.

### `@remotion/transitions` — **WRAP**

`<TransitionSeries>` (a `<Series>` variant interleaving `.Sequence` and `.Transition` children) + timing primitives `springTiming({config, durationInFrames, durationRestThreshold, reverse})` and `linearTiming({durationInFrames, easing})`.

**Shipped presentations:**
- `fade` — incoming opacity over outgoing
- `slide` — incoming pushes outgoing off, 4 directions
- `wipe` — incoming slides *over* outgoing, 4 dirs + diagonals
- `flip` — 180° 3D card flip with configurable perspective
- `clockWipe` — circular sweep reveal
- `iris` — circular mask expanding from center (v4.0.316+)
- `cube` — 3D cube rotation
- `none` — no visual change, purely timed cuts

Plus a fully documented **custom presentation API** that hands you `{ presentationProgress, presentationDirection, presentationDurationInFrames, passedProps }`.

**Onda integration:** ship `<SectionTransition>` scene block as a thin wrapper that defaults to `springTiming({ config: SPRING_SMOOTH })` and exposes custom presentations (`blurFade`, `softWipe`) built via the custom API. Don't surface raw `cube` / `flip` — they violate the no-overshoot, no-showy rule.

### `@remotion/captions` — **USE**

Normalization layer (v4.0.216+, MIT) around a single `Caption` type — `{ text, startMs, endMs, timestampMs, confidence }` — with `parseSrt()` and converters for whisper-cpp, whisper-web, OpenAI Whisper, ElevenLabs.

Killer helper: **`createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds })`** returns `pages[]` with per-token timing — exactly the substrate for karaoke / word-by-word kinetic typography.

Doesn't ship rendering components — gives timing data, you render.

**Onda integration:** `<KineticCaptions>` scene block built on top, applying the Onda spring + 3–5 frame stagger per token.

### `@remotion/media-utils` — **USE selectively**

`getAudioData(src)` (Node + browser), `useAudioData(src)` (hook). `visualizeAudio({ audioData, frame, fps, numberOfSamples, smoothing, optimizeFor })` returns a `number[]` of amplitudes (low→high frequency) for spectrum bars. Also `getVideoMetadata`, `getWaveformPortion`, thumbnail extraction helpers.

Substrate for a future `<AudioVisualizer>` / `<WaveformBars>` scene block. Not v1.

---

## 7. Deliberate non-goals

| Package | Why skip |
| --- | --- |
| `@remotion/lottie` | Black-box JSON breaks "copy the source, own it" + Bodymovin's motion language ≠ Onda's. Surface as utility much later, not core. |
| `@remotion/rive` | Same reasoning — black-box state-machine runtime. |
| `@remotion/animated-emoji` | Reads playful/gimmicky — fights "Apple discipline." |
| `@remotion/skia` | RN-Skia bridge for GPU 2D; heavy dependency. Onda's restrained motion can be delivered with CSS `filter` / SVG. Revisit only if a Pro block needs shader-grade effects. |
| `@remotion/three` | 3D fights "calm, minimal." Out of scope until a clear, signature-aligned use. |
| `@remotion/gif` | GIF aesthetic mismatch for premium dark surfaces; muddier determinism story. |

---

## 8. Recommendations specific to Onda

### What to deprecate from existing `/lib`

- **`lib/random.ts`** → replace usages with Remotion's `random(seed)`. Delete the file.
- **`lib/easing.ts` `HOUSE_SPRING`** → already shadowed by `lib/motion.ts` `SPRING_SMOOTH`. Pick one (`SPRING_SMOOTH` is the newer, more comprehensive name) and deprecate the other in the motion-vocabulary techspec.
- **`lib/easing.ts` `HOUSE_EASE`** → kept (it's still a named alias to `Easing.bezier(0.16, 1, 0.3, 1)`), but document that the value is the canonical Onda ease-out and `lib/motion.ts` should re-export it for consistency.

### Fonts strategy

Build `registry/lib/fonts.ts` as a single source of truth:

```ts
// registry/lib/fonts.ts — copied into the user's project by `npx ondajs add`
import { loadFont as loadSpaceGrotesk } from '@remotion/google-fonts/SpaceGrotesk';
import { loadFont as loadLocalFont } from '@remotion/fonts';
import { staticFile } from 'remotion';

export const { fontFamily: bodyFontFamily } = loadSpaceGrotesk('normal', {
  weights: ['400', '500', '600'],
  subsets: ['latin'],
});

export const displayFontFamily = '"Clash Display", sans-serif';

loadLocalFont({
  family: 'Clash Display',
  url: staticFile('fonts/ClashDisplay-Semibold.woff2'),
  weight: '600',
});
```

Every component imports `{ displayFontFamily, bodyFontFamily }` as the *default* for its `fontFamily` prop. The `.woff2` files ship via `registry.json`'s `type: "file"` entries so they copy on install.

**Why this:** one source of truth, works identically in Studio + Player + user's project after `shadcn add`, kills the Fontshare CDN dependency for headless renders. Keep Fontshare `<link>` only in the **docs-site shell** (Next.js header/marketing copy), not in compositions.

### Player controls architecture refactor

Current state: `<ComponentPreview>` owns the Player ref AND the play/pause state AND the overlay button. Per Remotion's own docs, this re-renders the Player every frame.

Target: split into two siblings sharing a ref.

```tsx
export function ComponentPreview(...) {
  const playerRef = useRef<PlayerRef>(null);
  return (
    <div className="relative w-full h-full">
      <Player ref={playerRef} ... />
      <PlayPauseOverlay playerRef={playerRef} />
    </div>
  );
}

function PlayPauseOverlay({ playerRef }: { playerRef: RefObject<PlayerRef> }) {
  const isPlaying = useIsPlaying(playerRef); // bound to 'play'/'pause' events
  // ...
}
```

Memoize `inputProps` at every callsite (`Hero`, `LivePreview`) to prevent Player remounts.

### Site grid / preview architecture

- **`/components` index** — replace card placeholders with `<Thumbnail frameToDisplay={N}>` per component. Static, fast, no playback loop running.
- **`/components/[slug]` detail** — keep `<Player>` but switch from `component={X}` to `lazyComponent={() => import('...')}` to code-split per component.
- Add an `errorFallback` and `renderLoading` matching the Onda dark surface to both surfaces.
