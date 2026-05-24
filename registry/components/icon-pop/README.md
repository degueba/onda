# IconPop

A small state icon — `check`, `cross`, `dot`, or `star` — that pops into place on `SPRING_SMOOTH` via `entryScale` (scale 0 → 1 plus opacity fade). The universal state primitive: success, error, presence, emphasis. The icon itself is the single accent moment — color is earned, not sprinkled.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `icon` | `'check' \| 'cross' \| 'dot' \| 'star'` | `'check'` | Which glyph to render. `check`/`cross` are stroked; `dot`/`star` are filled. |
| `delay` | `integer ≥ 0` | `0` | Frames before the animation starts. |
| `duration` | `integer ≥ 1` | `DURATION.base` (18) | Target frames to settle. With `SPRING_SMOOTH` the visible motion settles in roughly this range. |
| `size` | `number` | `96` | Width and height in pixels (square). |
| `color` | `string` | `"#D96B82"` | Icon color — defaults to `--onda-accent`. |
| `strokeWidth` | `number` | `3` | Stroke width for outline icons. Ignored by `dot` and `star`. |
| `placement` | `Placement?` | – | Where on the canvas this sits. Region (`"center"`, `"upper-third"`, …) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. |

## Usage

```tsx
import { Composition } from 'remotion';
import { IconPop, iconPopSchema } from './components/onda/icon-pop/IconPop';

export const Root: React.FC = () => (
  <Composition
    id="MyIconPop"
    component={IconPop}
    durationInFrames={45}
    fps={30}
    width={1080}
    height={1920}
    schema={iconPopSchema}
    defaultProps={{
      icon: 'check',
      delay: 0,
      duration: 18,
      size: 96,
      color: '#D96B82',
      strokeWidth: 3,
    }}
  />
);
```

## Motion notes

- Powered by `entryScale({ ..., from: 0 })` from `lib/choreography.ts` — scale 0 → 1 plus opacity, driven by `SPRING_SMOOTH`. **No overshoot.** Despite the "pop" name, the icon settles confidently to 1.0 without bouncing past.
- Duration defaults to `DURATION.base` (18 frames ≈ 0.6s at 30fps).
- The whole motion is one move: scale and opacity, nothing else. No rotation, no flourish, no particle burst — restraint is the point.
- All `interpolate` calls (inside `entryScale`) clamp at both ends — correct on frame 0 and on any frame past `delay + duration`.
- The default color is `--onda-accent` because the icon *is* the accent moment in its scene. Use neutrals only if you've already spent the accent elsewhere.
