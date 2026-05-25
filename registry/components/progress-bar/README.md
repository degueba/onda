# ProgressBar

A pill-shaped bar that fills from 0 to `value`% on `SPRING_SMOOTH`. The fill is a single solid stroke of dusty rose on a neutral track; an optional tabular `${value}%` label sits to the right. One focal moment, no overshoot, no gradient — just the bar settling into its number.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `number` (0–100) | `64` | Target fill percentage. Bar grows from 0 to this value. |
| `delay` | `integer ≥ 0` | `0` | Frames before the animation starts. |
| `duration` | `integer ≥ 1` | `DURATION.slow` (24) | Frames to reach the full target value. Bars want more time than text. |
| `height` | `number` | `12` | Bar thickness in px. |
| `radius` | `number` | `999` | Border-radius in px. Defaults to a full pill. |
| `trackColor` | `string` | `"#26262E"` | Track (unfilled) color — defaults to `--onda-border-lit`. |
| `accentColor` | `string` | `"#D96B82"` | Fill color — defaults to `--onda-accent`. |
| `showValue` | `boolean` | `true` | Render the `${value}%` label beside the bar. |
| `color` | `string` | `"#F2F2F4"` | Label color — defaults to `--onda-text`. |
| `fontSize` | `number` | `28` | Label font size in px. |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | The Onda display font. |
| `placement` | `Placement?` | – | Where on the canvas this sits. Region (`"center"`, `"upper-third"`, …) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. |

## Usage

```tsx
import { Composition } from 'remotion';
import { ProgressBar, progressBarSchema } from './components/onda/progress-bar/ProgressBar';

export const Root: React.FC = () => (
  <Composition
    id="MyProgress"
    component={ProgressBar}
    durationInFrames={60}
    fps={30}
    width={1080}
    height={1920}
    schema={progressBarSchema}
    defaultProps={{
      value: 72,
      delay: 0,
      duration: 24,
      height: 12,
      radius: 999,
      trackColor: '#26262E',
      accentColor: '#D96B82',
      showValue: true,
      color: '#F2F2F4',
      fontSize: 28,
      fontFamily: '"Clash Display", sans-serif',
    }}
  />
);
```

## Motion notes

- Spring is `SPRING_SMOOTH` from `lib/motion.ts` — the Onda house default. **No overshoot.** The bar does not bounce past its target value.
- Duration defaults to `DURATION.slow` (24 frames ≈ 0.8s at 30fps) — bars want more time than text.
- `interpolate` clamps at both ends, so the component is correct on frame 0 and on any frame past `delay + duration`.
- The fill is a solid color, never a gradient — restraint is the brand.
- The outer wrapper is `width: 80%` with `maxWidth: 800` so the `flex: 1` track has space to grow into. Wrap in a `<Sequence>` or a parent that centers it for typical scene layouts.
