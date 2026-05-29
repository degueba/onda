# Techspec 028 — Motion blur primitive

## Problem

Motion blur is the single most-cited "feels like After Effects vs. feels like a slideshow" tell in motion graphics: fast moves rendered without it strobe and read as cheap/web-CSS. Onda has the full motion-quality foundation (house springs, easing, choreography, `Camera`) but **no motion blur** — `@remotion/motion-blur` isn't even a dependency, and the only "blur" in the catalog is `blur-reveal` (a per-character focus reveal, not directional/shutter motion blur). Fast camera moves, whip pans, and quick transforms currently render clinically sharp. This is a foundational gap that benefits every animation, so it belongs in the shared lib as a primitive (like `Camera`/`Glow`), not a single leaf component.

## Decision

Add `@remotion/motion-blur` (the maintained, official Remotion package — don't reinvent) and wrap it in two house primitives under `lib/primitives/`, consistent with `Camera`/`Glow`/`Surface` (wrappers that catalog components and hand-authored compositions may use; not flat-payload leaf components, so they are NOT registry/manifest entries):

- **`MotionBlur`** — true sample-accumulation motion blur via `@remotion/motion-blur`'s `<CameraMotionBlur>`. Blurs everything inside based on its per-frame movement. House defaults from a new `SHUTTER` token (`shutterAngle: 180` filmic, `samples: 10`).
- **`MotionTrail`** — a cheaper echo/onion-skin trail via `<Trail>` (decaying copies of a moving layer). House defaults (`layers: 5`, `lagInFrames: 1`, `trailOpacity: 0.5`).

Plus a `SHUTTER` token in `lib/motion.ts` so blur is tokenized and consistent, never per-call magic numbers (mirrors how `DURATION`/`SPRING_SMOOTH` centralize motion constants).

Both are pure functions of `useCurrentFrame()` (CLAUDE.md §1) — `@remotion/motion-blur` re-renders children at sampled/offset frames, which is deterministic given Onda's frame-pure children contract. No `Math.random`/state. Most valuable wrapped around `Camera`/whip moves and fast transforms; opt-in, never global.

Files:
- `package.json` — add `@remotion/motion-blur` (matching `remotion` `^4.0.466`).
- `lib/motion.ts` — add `SHUTTER` token + `ShutterToken` type.
- `lib/primitives/MotionBlur.tsx` — `MotionBlur` + `MotionTrail`.
- `lib/primitives/index.ts` + `lib/index.ts` — export both + prop types.

## Goals

- True motion blur available as a one-import house primitive, tokenized defaults.
- Deterministic + frame-pure; no new render-correctness rules broken.
- Reuse the maintained `@remotion/motion-blur` package, not a hand-rolled blur.
- Foundational: usable by any catalog component or composition (esp. `Camera`/whip moves).

## Non-goals

- **Not a registry/manifest component.** Motion blur wraps `children`; the flat composition payload (`{component, props}`) doesn't nest children, so — like `Camera` — it lives in `lib/primitives`, used in hand-authored compositions, not emitted by name. (A future per-component "blurOnMove" capability could surface it in the payload; out of scope here.)
- **Not auto-applied.** Blur is opt-in; global motion blur would tax every render and mush calm scenes.
- **Not a new easing/timing system.** `SHUTTER` is just shutter constants alongside the existing motion tokens.
