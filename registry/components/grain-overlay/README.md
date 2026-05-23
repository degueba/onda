# GrainOverlay

A subtle film-grain overlay for the canvas. Pure SVG `feTurbulence` rendered through an `AbsoluteFill`, flattened to monochrome alpha and capped at a restrained opacity — the first **atmospheric** Onda primitive. No text, no motion: just texture that warms up an otherwise flat dark surface. Deterministic by `seed`, self-contained, no external assets.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `opacity` | `number` in `[0, 0.15]` | `0.04` | Layer opacity. CLAUDE.md caps grain at ~2%; 0.02–0.04 is the Onda house range. Anything above ~0.08 reads as busy. |
| `baseFrequency` | `number ≥ 0` | `0.9` | Noise frequency. Higher values produce a finer, tighter grain; lower values give coarser, photo-grain texture. |
| `numOctaves` | `integer 1–4` | `1` | Noise complexity. `1` is clean film grain; higher values layer detail and start to feel noisy. |
| `seed` | `integer ≥ 0` | `0` | Deterministic noise variation. Also used to namespace the internal SVG `<filter>` id so multiple instances don't collide. |

## Usage

Overlaid on top of another component inside a `<Composition>` — the grain sits above all content but ignores pointer events:

```tsx
import { AbsoluteFill, Composition } from 'remotion';
import { BlurReveal } from './components/onda/blur-reveal/BlurReveal';
import { GrainOverlay, grainOverlaySchema } from './components/onda/grain-overlay/GrainOverlay';

const Scene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#08080A', alignItems: 'center', justifyContent: 'center' }}>
    <BlurReveal text="Onda" delay={0} duration={18} color="#F2F2F4" fontSize={96} fontFamily='"Clash Display", sans-serif' />
    <GrainOverlay opacity={0.04} baseFrequency={0.9} numOctaves={1} seed={0} />
  </AbsoluteFill>
);

export const Root: React.FC = () => (
  <Composition
    id="GrainedReveal"
    component={Scene}
    durationInFrames={90}
    fps={30}
    width={1080}
    height={1920}
  />
);
```

## Motion notes

- **Deliberate no-motion.** GrainOverlay is the first atmospheric primitive — it has zero animation by design. Grain that shimmers, breathes, or re-seeds per frame feels cheap and draws attention to itself; Onda's grain is set dressing, not a performer. It is still a pure function of `useCurrentFrame()` by construction (it doesn't read the frame at all, so every frame produces identical pixels).
- **Restraint at 2–4%.** Defaults to `opacity={0.04}`; the schema clamps to `0.15`. CLAUDE.md's design tokens explicitly cap grain at "~2% for texture. Never busy." Treat anything above ~0.08 as a smell — if you can *see* the grain, it's too much.
- **Filter id collision.** The internal SVG `<filter>` is namespaced as `onda-grain-${seed}`, so multiple `GrainOverlay`s on the same canvas (e.g., one per scene-block) coexist as long as they use distinct seeds. Two instances with the same `seed` will share one filter definition, which is harmless because the noise is identical anyway.
- **`pointerEvents: 'none'`.** The overlay never intercepts clicks — it composes safely above interactive content in the Studio / Player.
