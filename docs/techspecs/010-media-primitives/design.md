# Techspec 010 — Media primitives (image + video)

## Problem

The Onda catalog ships 40 components. **Two** consume external media: `KenBurns` (image with subtle zoom-pan) and `Parallax` (image with linear translate). Both are full-canvas effects with specialized motion; neither covers the most common case of "show this image with Onda's signature motion fingerprint" or "play this video clip with Onda's timing vocabulary."

An AI agent or brief renderer composing a scene that includes user-uploaded media has two options today:

1. Use `KenBurns` / `Parallax` — only works if the agent wants Ken Burns or parallax specifically.
2. Drop down to Remotion's `<Img>` / `<OffthreadVideo>` directly — works but loses every Onda motion fingerprint. The image just appears; the video just plays. Identity moat eroded.

This is the largest gap blocking Onda from being a complete substrate for agent-driven scene composition. Every product video that's not pure typography needs photos and clips; without media primitives carrying the Onda fingerprint, those scenes look like a different library bolted on top.

The scope of this spec is **image and video only**. Audio (visualizers, waveforms, audio-reactive visuals) is a separate spec — the visual story is well-understood for image/video and merits its own focused shipping pass; audio visualization design has open questions (variant catalog, amplitude sampling cadence) that belong with the rest of the audio surface.

## Decision

**Ship two media-consuming primitives that wrap Remotion's media components and apply the Onda motion vocabulary.** Both fully participate in the 008 canvas vocabulary (`placement`, canvas-aware sizing). Both use the timing helpers from `lib/timing.ts` for agent-friendly trim / fade specs.

### 1. `ImageReveal`

The single most-used media primitive: image enters with Onda's signature motion, holds, optionally exits.

```ts
export const imageRevealSchema = z.object({
  /** URL or path to the image. */
  src: z.string(),
  /** Accessible alt text. */
  alt: z.string().default(''),
  /** Frames before the reveal starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames to fully reveal. */
  duration: z.number().int().min(1).default(DURATION.base),
  /** Which Onda motion fingerprint the entrance uses. */
  motion: z.enum(['blur', 'fade', 'scale']).default('blur'),
  /** How the image fits its container. */
  fit: z.enum(['cover', 'contain']).default('cover'),
  /** Canvas placement. Default centers full-canvas. */
  placement: placementSchema.optional(),
  /** Optional explicit dimensions (px). When omitted, the image fills the available area while respecting `fit`. */
  width: z.number().optional(),
  height: z.number().optional(),
  /** Border radius in px. Defaults to 0; cards / framed images set higher. */
  borderRadius: z.number().default(0),
});
```

Wraps Remotion's `<Img>`. Motion variants resolve to:
- `'blur'` — opacity 0→1 + blur 10→0 (mirrors `BlurReveal` but for images).
- `'fade'` — opacity 0→1 only.
- `'scale'` — opacity 0→1 + scale 0.95→1 (subtle, no overshoot per CLAUDE.md §3).

All three use `SPRING_SMOOTH` from `lib/motion.ts` for the underlying progress. Composes `entryFade` / `entryScale` from `lib/choreography.ts` where the existing helpers fit; falls back to `BlurReveal`-style inline math for the blur variant (mirroring the reference primitive).

### 2. `VideoClip`

A video clip with Onda's entrance / exit fingerprint and agent-friendly trim props.

```ts
export const videoClipSchema = z.object({
  /** URL or path to the video. */
  src: z.string(),
  /** Frames before the clip starts. */
  delay: z.number().int().min(0).default(0),
  /** Where to start in the source video. Time spec — `"0:04"`, `"30s"`, `"500ms"`, or seconds-number. */
  startAt: z.union([z.string(), z.number()]).default(0),
  /** Where to stop in the source video. Time spec, same as `startAt`. When omitted, plays to source end. */
  endAt: z.union([z.string(), z.number()]).optional(),
  /** Whether the clip fades in / out for the Onda motion fingerprint. */
  fade: z.boolean().default(true),
  /** Frames the fade-in / fade-out takes when `fade` is true. */
  fadeDuration: z.number().int().min(0).default(DURATION.base),
  /** Mute audio track. */
  muted: z.boolean().default(false),
  /** Volume 0..1. */
  volume: z.number().min(0).max(1).default(1),
  /** Loop the clip while the composition window is still active. */
  loop: z.boolean().default(false),
  /** How the video fits its container. */
  fit: z.enum(['cover', 'contain']).default('cover'),
  /** Canvas placement. Default centers full-canvas. */
  placement: placementSchema.optional(),
  /** Optional explicit dimensions (px). */
  width: z.number().optional(),
  height: z.number().optional(),
  /** Border radius in px. */
  borderRadius: z.number().default(0),
});
```

Wraps Remotion's `<OffthreadVideo>` (preferred over `<Video>` per Remotion docs for non-realtime rendering — better frame accuracy, no audio drift). Maps:

- `startAt` → `<OffthreadVideo startFrom={toFrames(startAt, fps)}>`.
- `endAt` → `<OffthreadVideo endAt={toFrames(endAt, fps)}>`.
- `loop` → wraps in `<Loop>` from Remotion when true.
- `fade` → opacity envelope: fade in over `fadeDuration` at clip start, fade out over `fadeDuration` at clip end (computed against the visible clip length).

Audio handling delegated to `<OffthreadVideo>`'s `muted` / `volume` props — same semantics, no reinvention.

## Goals

1. An agent can render any user-uploaded **image** with one Onda payload and get visible Onda motion identity (not bare `<Img>`).
2. An agent can render any user-uploaded **video clip** with trim (`startAt` / `endAt`), fade in/out, and Onda timing — without computing frames.
3. Both primitives participate fully in the 008 vocabulary: `placement` works, `size` doesn't apply (these are media dimensions, not typography), but `width` / `height` exist for explicit sizing.
4. Both use Remotion's recommended media components (`<Img>`, `<OffthreadVideo>`) — no reinvention of media rendering.
5. No new motion math in either component — they compose `lib/motion.ts` and `lib/choreography.ts` helpers where they fit; minimal inline interpolation otherwise.

## Non-goals

- **Audio primitives.** `AudioVisualizer`, audio-reactive visuals, audio-only scenes — separate spec (011 candidate) where the visual variants can be designed without contaminating image/video scope.
- **Composite media cards.** A `MediaCard` (image/video + caption + attribution in an Onda card layout) is appealing but composable from `ImageReveal` / `VideoClip` + existing typography primitives. Defer until a real demand emerges that the composition can't cover.
- **`PhotoStack` / `BeforeAfter` / multi-image specialty composites.** Scope creep; ship the atomic primitives first.
- **Generative media.** This spec is about rendering *uploaded* media. AI-generated images / video (txt2img, txt2vid) is product surface, not a lib primitive.
- **Image / video uploads, storage, or signed URLs.** All `src` values are passed through verbatim. The hosting layer is the caller's concern (Studio handles its own Supabase Storage; lib doesn't need to know).
- **Built-in transitions between media beats.** Use `<TransitionSeries>` from `@remotion/transitions` for crossfades — Onda doesn't reinvent transitions per [[remotion-built-ins-first]].

## Reasonable calls (challenge any)

- **`ImageReveal.motion` is an enum, not a full motion config.** Three named variants (`'blur'`, `'fade'`, `'scale'`) cover the common cases an agent picks between. A free-form `motion: MotionConfig` prop would let any caller invent a new fingerprint and dilute the brand. Enum keeps the surface small and the catalog coherent.
- **`VideoClip` defaults `fade: true`.** Every other Onda component fades in on entrance — a bare-cut video would feel inconsistent with the catalog. `fade: false` is available when the agent explicitly wants a hard cut (e.g., between two `VideoClip`s in a `<TransitionSeries>`).
- **`startAt` / `endAt` accept time strings via `toFrames`.** Agent emits `startAt: "0:04"`; lib resolves to frames at render time using `useVideoConfig().fps`. Matches the timeline-payload pattern in `composing-with-onda.md`.
- **`<OffthreadVideo>` over `<Video>` as the default.** Per Remotion docs, `<OffthreadVideo>` is the recommended choice for `<Player>` previews and server-side renders — better seek behavior, no audio drift. We pay no cost using it as the default.
- **No `crossOrigin` / loading-strategy / image-format props.** Pure passthrough on `src`. The caller knows what host serves the asset; lib doesn't enforce.
- **`size` role (from 008/M4) does NOT apply** to these components. `SizeRole` is semantic *typography* sizing. Media dimensions are physical (width × height in px) or relative to canvas via `fit: 'cover'`. Conflating the two would muddle the vocabulary.

## Open questions deferred

- **Should `ImageReveal.motion` include a `'slide'` variant?** Composable from a parent `SlideIn` already. Add later if agents reach for it often.
- **Should `VideoClip` support a `playbackRate` prop?** Remotion's `<OffthreadVideo>` exposes it. Useful for slow-mo / fast-forward agent payloads. Defer until concrete demand — adds a prop, doesn't break the API.
- **Should we offer a `MediaPlaceholder` for the (likely) interval between asset upload and asset availability?** Studio's renderer can handle this themselves; lib doesn't need a primitive yet.
- **Should `ImageReveal` get a `'pan'` variant** (slow horizontal pan over a wide image, distinct from KenBurns's zoom)? Real use case but feels like a separate primitive (`ImagePan`?). Defer.
- **Built-in caption support.** A `caption?: string` prop on `ImageReveal` would auto-compose with `FadeIn`/`WordStagger` below. Appealing for one-shot agent payloads. Trade-off: composes opinions the caller may not want. Defer until the `MediaCard` decision settles.
