# BarChart

Horizontal bars that grow from 0 to their `value` on `SPRING_SMOOTH`, entering with the canonical 4-frame stagger between rows. The largest bar earns the dusty-rose accent; every other bar sits in `--onda-dim`. One color moment per chart — color is earned, not sprinkled.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `data` | `{ label: string; value: number }[]` | 3-row sample | Rows render in the order provided. |
| `max` | `number` | `100` | Value that maps to a fully-filled track. Values above `max` are clamped. |
| `delay` | `integer ≥ 0` | `0` | Frames before the first bar starts. |
| `duration` | `integer ≥ 1` | `DURATION.slow` (24) | Per-bar reveal duration. Bars want time. |
| `stagger` | `integer ≥ 0` | `STAGGER` (4) | Frames between successive bars. |
| `barHeight` | `number` | `32` | Track and fill height in px. |
| `gap` | `number` | `16` | Vertical gap between rows in px. |
| `accentColor` | `string` | `"#D96B82"` | `--onda-accent`. Applied to the **largest** bar only. |
| `barColor` | `string` | `"#8E8E98"` | `--onda-dim`. Applied to every non-largest bar. |
| `trackColor` | `string` | `"#1C1C22"` | `--onda-border`. The unfilled track underneath each bar. |
| `color` | `string` | `"#F2F2F4"` | Label text color (`--onda-text`). |
| `labelWidth` | `number` | `220` | px reserved for the label column. |
| `fontSize` | `number` | `24` | Label font size. |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | The Onda display font. |

## Usage

```tsx
import { Composition } from 'remotion';
import { BarChart, barChartSchema } from './components/onda/bar-chart/BarChart';

export const Root: React.FC = () => (
  <Composition
    id="MyBarChart"
    component={BarChart}
    durationInFrames={90}
    fps={30}
    width={1920}
    height={1080}
    schema={barChartSchema}
    defaultProps={{
      data: [
        { label: 'Remotion', value: 92 },
        { label: 'After Effects', value: 64 },
        { label: 'Lottie', value: 38 },
      ],
      max: 100,
      delay: 0,
      duration: 24,
      stagger: 4,
      barHeight: 32,
      gap: 16,
      accentColor: '#D96B82',
      barColor: '#8E8E98',
      trackColor: '#1C1C22',
      color: '#F2F2F4',
      labelWidth: 220,
      fontSize: 24,
      fontFamily: '"Clash Display", sans-serif',
    }}
  />
);
```

## Motion notes

- Spring is `SPRING_SMOOTH` from `lib/motion.ts` — the Onda house default. **No overshoot:** bars never overshoot their value and snap back. The width settles confidently.
- Each bar starts at `delay + i * stagger` (canonical 4-frame cadence from `STAGGER`).
- Both fill width and row opacity are driven by the same spring, so the fade and the growth land together as one motion per row.
- The largest bar is determined by `value` (ties resolved to the first occurrence). It is the chart's single accent moment — every other bar stays neutral. Don't extend the accent to a "top 3" or a gradient; the restraint is the point.
- All `interpolate` calls clamp at both ends — the chart is correct on frame 0 and on any frame past the last bar's `delay + duration`.
