# PieReveal

A single-arc SVG ring that fills from 0 to `value` percent on `SPRING_SMOOTH`. The arc starts at 12 o'clock and sweeps clockwise, drawn in a single muted accent stroke against a quiet track. The center holds the `value%` label, counting in alongside the arc. No overshoot, one focal move — the Onda data primitive.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `number, 0–100` | `64` | Target percent the arc fills to. |
| `delay` | `integer ≥ 0` | `0` | Frames before the animation starts. |
| `duration` | `integer ≥ 1` | `DURATION.slow` (24) | Frames to reach the target value. |
| `radius` | `number` | `120` | Ring radius in pixels. |
| `strokeWidth` | `number` | `12` | Stroke width of track and arc, in pixels. |
| `accentColor` | `string` | `"#D96B82"` | Arc color — defaults to `--onda-accent`. |
| `trackColor` | `string` | `"#26262E"` | Track color — defaults to `--onda-border-lit`. |
| `showValue` | `boolean` | `true` | Renders the `value%` label in the center. |
| `color` | `string` | `"#F2F2F4"` | Center label color — defaults to `--onda-text`. |
| `fontSize` | `number` | `56` | Center label font size in pixels. |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | The Onda display font. Never default to Inter / Arial / system. |

## Usage

```tsx
import { Composition } from 'remotion';
import { PieReveal, pieRevealSchema } from './components/onda/pie-reveal/PieReveal';

export const Root: React.FC = () => (
  <Composition
    id="MyPie"
    component={PieReveal}
    durationInFrames={60}
    fps={30}
    width={1080}
    height={1920}
    schema={pieRevealSchema}
    defaultProps={{
      value: 72,
      delay: 0,
      duration: 24,
      radius: 120,
      strokeWidth: 12,
      accentColor: '#D96B82',
      trackColor: '#26262E',
      showValue: true,
      color: '#F2F2F4',
      fontSize: 56,
      fontFamily: '"Clash Display", sans-serif',
    }}
  />
);
```

## Motion notes

- Spring is `SPRING_SMOOTH` from `lib/motion.ts` — the Onda house default. **No overshoot.** The arc lands at its target length and stays.
- Duration defaults to `DURATION.slow` (24 frames ≈ 0.8s at 30fps); data reveals benefit from a slightly longer settle so the eye can read the value as it counts in.
- The arc is a single accent stroke. Multi-segment, multi-color pies are out of scope — the brand keeps color earned, never sprinkled.
- All `interpolate` calls clamp at both ends — frame 0 shows an empty ring, frames past `delay + duration` show the full target arc.
- SVG arc math: `circumference = 2π·radius`, `stroke-dasharray = circumference`, `stroke-dashoffset = circumference · (1 − arcPercent / 100)`. The SVG is rotated `-90deg` so the sweep begins at 12 o'clock.
