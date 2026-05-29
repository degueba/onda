# Motion language — the moat

> Personality: **clean, minimal, calm — Apple-like restraint. Confident, fluid, unmistakable. Never janky, never default-linear, never abrupt, never showy. One clear move per moment.**

This is the heart of Onda. The motion fingerprints below — applied consistently across every component — are what make an Onda animation recognizable before any logo appears.

## Easing & motion

- **Prefer `spring()` over linear `interpolate`** for anything that moves position, scale, or rotation. Springs feel premium.
- House spring config (default unless documented otherwise):

  ```ts
  spring({ frame, fps, config: { damping: 200, stiffness: 100, mass: 1 } })
  ```

  Smooth, settled, **no overshoot.** Restraint is the brand — **avoid bouncy/overshooting springs.** Never reduce damping for a "pop" unless a component explicitly documents why.

- For opacity/color fades, `interpolate` with an easing curve — never raw linear for anything the eye tracks. House curve: `Easing.bezier(0.16, 1, 0.3, 1)` (a restrained ease-out).
- Always pass `extrapolateLeft: 'clamp'` and `extrapolateRight: 'clamp'` to `interpolate` unless intentionally continuing past the range.

## Timing (at 30fps, the house default)

- **Entrances:** 18–28 frames (0.6–0.95s). Calm and deliberate, never rushed.
- **Holds:** let content breathe generously. Never cut a reveal the instant it lands.
- **Staggered groups** (words, lists, items): 3–5 frames between siblings. This restrained stagger is a core Onda fingerprint — present but never frantic.
- **Exits:** slightly faster than entrances (12–18 frames).
- **Travel is small.** Translate 12–24px, not 80px. The eye should feel the motion, not be dragged by it.

## Composition

- One focal element per moment. If two things compete, stagger them.
- Compose timing with `<Sequence>`; never hardcode frame offsets inside a component to fake sequencing.

## Use the library, don't re-derive it

These fingerprints aren't just guidelines — they ship as a small, importable motion library so you never reimplement translate-fade for the tenth time. Every Onda component composes these helpers, and you can import the same ones to animate your *own* elements:

```ts
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { entryFadeRise, DURATION } from 'ondajs/motion';

const frame = useCurrentFrame();
const { fps } = useVideoConfig();
const { opacity, transform } = entryFadeRise({ frame, fps, durationInFrames: DURATION.base });
// spread { opacity, transform } onto the element's style
```

The choreography vocabulary — `entryFade`, `entryFadeRise` (the workhorse), `entrySlide`, `entryScale`, `heroReveal` (one hero per scene), `exitFadeFall`, `stateSwap` — are pure functions of `frame` / `fps` returning `{ opacity, transform }`, all tuned to the house spring, easing, and timing above. The tokens (`DURATION`, `SPRING_SMOOTH` / `SPRING_SNAPPY`, `STAGGER`, `staggerFrames`, `HOUSE_EASE`) are exported too — reach for them rather than inventing new values.

> `ondajs/motion` is a direct package import (no `ondajs add`), with `react` + `remotion` as optional peer dependencies. See the [package README](https://www.npmjs.com/package/ondajs) for the full export table.

## When in doubt

Make it **calmer and more minimal, not flashier.** A component that feels busy or bouncy is wrong even if technically correct. Onda's restraint IS the brand.

Unsure about a specific timing/easing value? Default to the house values above rather than inventing new ones — coherence beats novelty.
