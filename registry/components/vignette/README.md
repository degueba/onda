# Vignette

A static cinematic vignette — a radial darkening at the canvas edges that pulls the eye toward the center. Pure CSS `radial-gradient` rendered through an `AbsoluteFill`, no motion, no JavaScript per-frame work. The cinematic counterpart to `GrainOverlay`: another atmospheric Onda primitive whose job is to sit quietly behind the action and make the frame feel composed.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `intensity` | `number` in `[0, 1]` | `0.5` | Layer opacity. `0` removes the vignette entirely; `1` lets the edge color reach its full strength. The Onda house range is `0.3`–`0.6`. Anything above `~0.75` reads as a heavy filter rather than a frame. |
| `innerRadius` | `number` in `[0, 100]` | `40` | Percent from canvas center where the darkening begins. Larger values give a bigger clean middle and a tighter dark ring at the edges. |
| `color` | `string` | `"#000000"` | Edge color. Pure black is the cinematic default; deep neutrals from the Onda palette (e.g. `--onda-bg` `#08080A`) also work without breaking the dark theme. |

## Usage

Overlaid on top of another component inside a `<Composition>` — the vignette sits above all content but ignores pointer events:

```tsx
import { AbsoluteFill, Composition } from 'remotion';
import { BlurReveal } from './components/onda/blur-reveal/BlurReveal';
import { Vignette, vignetteSchema } from './components/onda/vignette/Vignette';

const Scene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#08080A', alignItems: 'center', justifyContent: 'center' }}>
    <BlurReveal text="Onda" delay={0} duration={18} color="#F2F2F4" fontSize={96} fontFamily='"Clash Display", sans-serif' />
    <Vignette intensity={0.5} innerRadius={40} color="#000000" />
  </AbsoluteFill>
);

export const Root: React.FC = () => (
  <Composition
    id="FramedReveal"
    component={Scene}
    durationInFrames={90}
    fps={30}
    width={1080}
    height={1920}
  />
);
```

## Motion notes

- **Deliberate no-motion.** Vignette is a static atmospheric overlay. A pulsing or breathing vignette draws attention to itself and undoes the work of framing the content — Onda's vignette is set dressing, not a performer. The component never reads `useCurrentFrame`, so every frame produces identical pixels: deterministic by construction.
- **Restraint at 0.3–0.6 intensity.** Defaults to `intensity={0.5}`. Beyond ~0.75 it stops reading as a frame and starts reading as a filter; treat that as a smell. If you can clearly *see* the vignette as a ring rather than feel it as a frame, dial it back.
- **`innerRadius` controls the clean middle.** At `40` (default) roughly the middle 40% of the canvas is untouched and the darkening ramps out to the corners. Lower it for a tighter spotlight feel; raise it for a barely-there cinematic edge.
- **`pointerEvents: 'none'`.** The overlay never intercepts clicks — it composes safely above interactive content in the Studio / Player.
- **Self-contained.** Pure CSS `radial-gradient` — no SVG, no assets, no other Onda components.
