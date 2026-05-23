# Techspec 005 — Motion vocabulary v2

## Problem

After [003](../003-walking-skeleton/) we have `lib/motion.ts` (durations, springs, stagger constants) and `lib/choreography.ts` (named patterns: `entryFadeRise`, `exitFadeFall`, `heroReveal`, `stateSwap`). The intent was for new primitives to *compose* these helpers rather than re-derive motion math.

Then we shipped five new primitives in parallel (`FadeIn`, `SlideIn`, `ScaleIn`, `WordStagger`, `DrawOn`). The verdict on the helpers:

| Primitive | Helper used | Why |
| --- | --- | --- |
| `FadeIn` | none — inlined | `entryFadeRise` includes a translate; no helper for pure opacity. |
| `SlideIn` | none — inlined | `entryFadeRise` hardcodes the Y direction; can't be parameterized for left/right slides. |
| `ScaleIn` | none — inlined | `heroReveal` adds an overshoot scale bump (forbidden here); no helper for plain scale + fade. |
| `WordStagger` | `entryFadeRise` ✓ | The one primitive whose motion happened to match the existing helper verbatim. |
| `DrawOn` | none — inlined | SVG path stroke via `evolvePath` — no analogous helper, and arguably too trivial to extract yet. |

So 4 of 5 agents reinvented essentially the same restraint (clamped `interpolate` on opacity, `SPRING_SMOOTH`-driven progress, deterministic `localFrame = max(0, frame - delay)`) because the vocabulary's helpers are too specific to compose.

There's also a smaller hygiene issue: `lib/easing.ts` exports `HOUSE_SPRING` with the same values as `lib/motion.ts`'s `SPRING_SMOOTH`. Two names for one config dilutes the canonical reference.

## Decision

**Atomicize the vocabulary.** Add parameterized helpers for the patterns the five primitives kept reaching for, so the next primitive composes vocabulary instead of inlining motion math. Reconcile the duplicated spring constant.

**New helpers (additive — existing helpers stay):**

- **`entryFade({ frame, fps, delay?, durationInFrames? }) → { opacity }`** — pure opacity 0 → 1, driven by `SPRING_SMOOTH`. No translate, no scale. The simplest reveal.
- **`entrySlide({ frame, fps, delay?, durationInFrames?, direction, distance? }) → { opacity, transform }`** — opacity 0 → 1 plus a direction-parameterized translate (`'up' | 'down' | 'left' | 'right'`), `SPRING_SMOOTH`. The 4-direction generalization of `entryFadeRise`.
- **`entryScale({ frame, fps, delay?, durationInFrames?, from? }) → { opacity, transform }`** — opacity 0 → 1 plus scale `from` → 1, `SPRING_SMOOTH`. Default `from = 0.9`.

**Existing helpers stay:**

- `entryFadeRise` — kept verbatim. Same behavior, same callers (`WordStagger`). It's now formally equivalent to `entrySlide({ direction: 'up', distance: 12 })`, but we keep it as the most common entrance under its named identity.
- `exitFadeFall`, `heroReveal`, `stateSwap` — unchanged.

**Spring constant reconciliation:**

- `lib/motion.ts`'s `SPRING_SMOOTH` is the **canonical** name.
- `lib/easing.ts`'s `HOUSE_SPRING` is removed (verified unused via grep). `HOUSE_EASE` stays — it's the canonical opacity easing curve.

**Refactor existing primitives:**

- `FadeIn`, `SlideIn`, `ScaleIn` are updated to call the new helpers instead of inlining.
- `BlurReveal` is **NOT** refactored — its blur falloff has no clean helper equivalent (blur is an opacity-of-focus distinct from opacity-of-presence), and it's the reference component agents pattern-match. Stays inline as documented.
- `WordStagger` already uses `entryFadeRise` — unchanged.
- `DrawOn` stays inline — `evolvePath` IS the helper, wrapping it adds no value yet.

## Goals

1. Every new primitive can build its motion by composing vocabulary helpers — no inline `spring()` + `interpolate()` for the common cases.
2. `lib/choreography.ts` and `lib/motion.ts` are the single source of truth for motion vocabulary; no duplicated names.
3. No visible motion change to any existing component (refactor is functionally equivalent).

## Non-goals

- Adding any new primitives or scene blocks.
- Refactoring `BlurReveal`, `WordStagger`, or `DrawOn`.
- Touching anything under `/www`.
- Extending `lib/text-timing.ts` or `lib/random.ts`.
- Replacing `entryFadeRise` with `entrySlide` calls — the named identity is the brand fingerprint for the most common entrance, keep it.
- Building helpers for motion we don't yet ship (e.g., rotate-in, mask-reveal).

## Reasonable calls (challenge any)

- **`entryStroke` is deferred.** Only one SVG primitive exists (`DrawOn`), and its motion IS `evolvePath(progress, d)` from `@remotion/paths`. Wrapping that in a vocabulary helper adds no clarity yet. Revisit when we have 2+ SVG primitives.
- **Helpers return styles, not React elements.** Callers apply the returned `{ opacity, transform }` to their own `<div>` / `<span>`. Keeps the helpers framework-agnostic and matches the existing `entryFadeRise` signature.
- **`distance` and `from` are optional with sensible defaults** (`distance: 12` per the motion language; `from: 0.9` per the recent ScaleIn calibration).
- **No exit helpers added this round.** `exitFadeFall` already exists; we don't have catalog pressure for `exitSlide` / `exitScale` yet.

## Open questions deferred

- **Should `entryFadeRise` become `entrySlide({ direction: 'up' })` and disappear?** Keeping it as a named alias for the most common entrance preserves the fingerprint vocabulary. Revisit if it starts feeling redundant.
- **A unified `MotionStyle` return type?** Helpers currently return shape-specific objects (`{ opacity }`, `{ opacity, transform }`). A unified type with optional fields would be more uniform but loses type-narrowing at call sites. Defer until we have an exit-helper round or scene-block composition pressure.
