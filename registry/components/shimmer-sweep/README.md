# ShimmerSweep

A single band of light sweeps across the text — restrained emphasis, not a disco. The base text sits in `--onda-dim` while a brighter band (`--onda-text` by default) travels through once, or loops on an interval. The layout never moves; only the highlight does, so it reads as polish rather than effect.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | `string` | `"Onda"` | The text to sweep. |
| `delay` | `number` | `0` | Frames before the sweep starts. |
| `duration` | `number` | `30` | Frames for one sweep pass. |
| `loop` | `boolean` | `false` | Loop instead of a single pass. |
| `interval` | `number` | `60` | Frames between sweeps when looping. |
| `color` | `string` | `#8E8E98` | Base (dim) text color. |
| `shimmerColor` | `string` | `#F2F2F4` | The sweeping highlight color. |
| `angle` | `number` | `110` | Sweep angle in degrees. |
| `fontSize` / `size` | `number` / role | `96` | Explicit px or canvas-aware role. |
| `fontFamily`, `fontWeight`, `letterSpacing`, `lineHeight`, `align` | — | display defaults | Standard typography vocabulary. |
| `placement` | region or `{x,y,anchor}` | — | Canvas placement. |

## Usage

```tsx
import { Composition } from 'remotion';
import { ShimmerSweep } from './components/onda/shimmer-sweep/ShimmerSweep';

export const ShimmerComp = () => (
  <ShimmerSweep text="Shipping today" align="center" placement="center" />
);
```
