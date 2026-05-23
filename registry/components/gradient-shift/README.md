# GradientShift

A quiet, drifting linear gradient for the canvas background. Two colors interpolated edge-to-edge, with the gradient angle rotating at a constant `speed` degrees per frame — atmospheric set dressing, never the focal element. Defaults to a near-identical `--onda-surface` → `--onda-border` pair so the shift reads as a subtle dark-on-dark breath rather than a colored wash. Self-contained, deterministic, no external assets.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `from` | `string` | `"#0E0E12"` | Gradient start color. Default is `--onda-surface` — the canvas tone. |
| `to` | `string` | `"#1C1C22"` | Gradient end color. Default is `--onda-border` — one step warmer/lighter than `from`, intentionally near-identical so the drift is a whisper. |
| `angle` | `number` | `135` | Starting gradient angle in degrees. CSS convention: `0deg` is bottom-to-top. |
| `speed` | `number` | `0.5` | Degrees per frame. At 30fps the default produces a 24-second full rotation — slow enough to never call attention to itself. |
| `delay` | `integer ≥ 0` | `0` | Frames before the angle starts drifting. While `frame < delay`, the gradient sits at `angle`. |

## Usage

Sits behind other components inside a `<Composition>` as the atmospheric base layer:

```tsx
import { AbsoluteFill, Composition } from 'remotion';
import { BlurReveal } from './components/onda/blur-reveal/BlurReveal';
import { GradientShift, gradientShiftSchema } from './components/onda/gradient-shift/GradientShift';

const Scene: React.FC = () => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
    <GradientShift from="#0E0E12" to="#1C1C22" angle={135} speed={0.5} delay={0} />
    <BlurReveal text="Onda" delay={0} duration={18} color="#F2F2F4" fontSize={96} fontFamily='"Clash Display", sans-serif' />
  </AbsoluteFill>
);

export const Root: React.FC = () => (
  <Composition
    id="DriftingBackground"
    component={Scene}
    durationInFrames={180}
    fps={30}
    width={1080}
    height={1920}
  />
);
```

## Motion notes

- **Linear-by-design.** `currentAngle = angle + speed * (frame - delay)` — a pure function of frame, no spring. GradientShift joins **Typewriter / Marquee / KenBurns / Parallax** as the documented linear-by-design members of the catalog. A spring driver would settle and stop, which kills the *constant drift* that is the entire point of this primitive. Restraint here is in the `speed`, not in the easing curve.
- **Low saturation is the brand.** Defaults are `#0E0E12` → `#1C1C22` — a single step on the Onda dark ramp, deliberately near-identical. Atmosphere, not focal. **No rainbow, no neon, no saturated stops**: if you can read the colors as "colors" rather than as canvas tone, the defaults have been broken. Color is earned elsewhere in the catalog — not here.
- **Deterministic without `interpolate`.** Because the only frame-dependent value is the angle (and it's a plain arithmetic expression of `frame - delay` with `Math.max(0, …)` as the only clamp), there is no `interpolate` call to clamp. The math is intentionally simple — every frame produces exactly the same pixels every render.
- **`pointerEvents: 'none'`.** Like `GrainOverlay`, the layer never intercepts clicks — it composes safely beneath or above interactive content in the Studio / Player.
