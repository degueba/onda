# Spotlight

A radial light reveal: a soft circle of light grows from 0 to its target `radius`, centred at (`x`, `y`). Driven by `SPRING_SMOOTH` — calm, settled, no overshoot. The gradient is alpha-aware (transparent outside the lit disc), so anything rendered beneath the Spotlight stays visible. Apple-stage restraint: one focal moment, no flourish.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `x` | `number` (0–1) | `0.5` | Horizontal centre as a fraction of canvas width. |
| `y` | `number` (0–1) | `0.5` | Vertical centre as a fraction of canvas height. |
| `radius` | `number ≥ 0` | `40` | Final radius as a percentage of the canvas's smaller dimension. |
| `delay` | `integer ≥ 0` | `0` | Frames before the reveal starts. |
| `duration` | `integer ≥ 1` | `DURATION.slow` (24) | Frames until the spotlight reaches full radius. |
| `color` | `string` | `"#F2F2F4"` | Light colour — defaults to `--onda-text`. |
| `softness` | `number` (0–100) | `60` | % of the radius given to the fade-to-transparent tail. 0 = hard disc, 100 = pure centre-to-edge fade. |

## Usage

```tsx
import { AbsoluteFill, Composition } from 'remotion';
import { Spotlight, spotlightSchema } from './components/onda/spotlight/Spotlight';

const Scene: React.FC<React.ComponentProps<typeof Spotlight>> = (props) => (
  <AbsoluteFill style={{ background: '#08080A' }}>
    {/* Content sits beneath the spotlight — the alpha-aware gradient reveals it. */}
    <AbsoluteFill style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#08080A', fontFamily: '"Clash Display", sans-serif',
      fontSize: 120, fontWeight: 600, letterSpacing: '-0.03em',
    }}>
      Onda
    </AbsoluteFill>
    <Spotlight {...props} />
  </AbsoluteFill>
);

export const Root: React.FC = () => (
  <Composition
    id="StageSpotlight"
    component={Scene}
    durationInFrames={60}
    fps={30}
    width={1920}
    height={1080}
    schema={spotlightSchema}
    defaultProps={{
      x: 0.5,
      y: 0.5,
      radius: 40,
      delay: 0,
      duration: 24,
      color: '#F2F2F4',
      softness: 60,
    }}
  />
);
```

## Motion notes

- Spring is `SPRING_SMOOTH` from `lib/motion.ts` — the Onda house default. **No overshoot.** The disc grows once and settles.
- Duration defaults to `DURATION.slow` (24 frames ≈ 0.8s at 30fps) — a hero-paced reveal, but still calm.
- The `radius` and `softness` are expressed as percentages so the spotlight reads the same on a 1080p frame as on a 4K master. Canvas dimensions come from `useVideoConfig()` — no need to pass them as props.
- `interpolate` clamps at both ends — the component is correct on frame 0 (fully dark) and on any frame past `delay + duration` (settled at `radius`).
- Restraint rule: this is a **static reveal**, not a roaming light. If you need movement, drive `x` / `y` from a parent `<Sequence>` deliberately — don't add a sweep here.
