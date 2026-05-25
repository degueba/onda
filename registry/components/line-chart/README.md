# LineChart

A line chart whose path draws on left-to-right on the house easing (`useSceneProgress`), with an optional soft gradient area fill and per-point dots that pop as the line reaches them. The draw is deterministic — it uses SVG `pathLength` normalization keyed off the frame, so there's no DOM measurement and frame N is reproducible. The line carries the earned accent.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `data` | `number[]` | sample series | Values, left to right. |
| `delay` | `number` | `0` | Frames before drawing. |
| `duration` | `number` | `40` | Frames to fully draw. |
| `color` | `string` | `#D96B82` | Line + dot color. |
| `strokeWidth` | `number` | `4` | Line thickness. |
| `width` / `height` | `number` | `900` / `440` | Chart size. |
| `fill` | `boolean` | `true` | Soft area under the line. |
| `showDots` | `boolean` | `true` | Dot per data point. |
| `placement` | region or `{x,y,anchor}` | — | Canvas placement. |

## Usage

```tsx
import { LineChart } from './components/onda/line-chart/LineChart';

export const TrendScene = () => (
  <LineChart data={[12, 18, 15, 24, 22, 31, 38]} placement="center" />
);
```
