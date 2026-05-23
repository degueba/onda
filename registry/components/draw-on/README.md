# DrawOn

A calm, spring-driven SVG stroke reveal. A path draws itself in from its start point to its end, with `SPRING_SMOOTH` controlling the progress so the line lands settled and stays — no overshoot, no whip. The substrate for logos, icons, signature flourishes, and any shape that benefits from being *drawn* rather than faded.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `d` | `string` | `"M 10 50 Q 100 10 190 50"` | The SVG path `d` attribute. The default is a gentle quadratic wave sized to the default `viewBox`. |
| `delay` | `integer ≥ 0` | `0` | Frames before the stroke starts. |
| `duration` | `integer ≥ 1` | `DURATION.slow` (24) | Target frames to fully stroke in. Strokes feel best with a touch more time than text. |
| `stroke` | `string` | `"#F2F2F4"` | Stroke color — defaults to `--onda-text`. |
| `strokeWidth` | `number` | `3` | Pixels (in `viewBox` units). |
| `viewBox` | `string` | `"0 0 200 100"` | SVG viewBox — must match the coordinate space of `d`. |
| `width` | `number` | `800` | Rendered width in CSS pixels. |
| `height` | `number` | `400` | Rendered height in CSS pixels. |

## Usage

```tsx
import { Composition } from 'remotion';
import { DrawOn, drawOnSchema } from './components/onda/draw-on/DrawOn';

export const Root: React.FC = () => (
  <Composition
    id="MyDrawOn"
    component={DrawOn}
    durationInFrames={60}
    fps={30}
    width={1080}
    height={1920}
    schema={drawOnSchema}
    defaultProps={{
      d: 'M 10 50 Q 100 10 190 50',
      delay: 0,
      duration: 24,
      stroke: '#F2F2F4',
      strokeWidth: 3,
      viewBox: '0 0 200 100',
      width: 800,
      height: 400,
    }}
  />
);
```

## Motion notes

- Powered by [`evolvePath`](https://www.remotion.dev/docs/paths/evolve-path) from `@remotion/paths`. Given a `progress` value between `0` and `1` and the path's `d` string, it returns the `{ strokeDasharray, strokeDashoffset }` pair that, applied to a `<path>`, reveals the stroke from its start point to its end. Progress `> 1` erases from the start; progress `< 0` draws from the end — we clamp to `[0, 1]` here by way of `SPRING_SMOOTH`.
- Progress is driven by `SPRING_SMOOTH` from `lib/motion.ts` — the Onda house default. **No overshoot.** Don't reduce damping for a "pop": the line should land confident, not snappy.
- Duration defaults to `DURATION.slow` (24 frames ≈ 0.8s at 30fps). Strokes need a little more breathing room than text fades — the eye tracks the leading edge of the line, and rushing it reads as nervous.
- The component is deterministic: it renders correctly on frame 0 and on any frame past `delay + duration`. No state, no effects.

### Passing a custom `d`

The `d` prop accepts any valid SVG path string. Three sources, in increasing order of effort:

1. **Pre-built shape paths** — use `@remotion/shapes`' `make*` helpers (`makeRect`, `makeCircle`, `makeStar`, `makeTriangle`, `makePolygon`, `makeHeart`, `makePie`, `makeEllipse`). Each returns `{ path }`, which is a `d` string you can hand straight to `DrawOn`. This is the recommended path for standard shape reveals.

   ```tsx
   import { makeStar } from '@remotion/shapes';

   const { path } = makeStar({ innerRadius: 30, outerRadius: 60, points: 5 });

   <DrawOn d={path} viewBox="0 0 120 120" />
   ```

2. **An icon or logo** — copy the `d` attribute out of any SVG (your design tool, an icon set, a Figma export). Adjust `viewBox` to match the icon's coordinate space so `strokeWidth` reads as intended.

3. **Hand-authored paths** — write your own `d` string. `M` moves, `L` lines, `Q` and `C` curve, `Z` closes. The default wave is a single `Q` (quadratic Bézier) and a good starting point to riff on.

The leading edge of the stroke always follows the path's natural direction (`M` → end). If you want it to draw in the opposite direction, use `reversePath` from `@remotion/paths` on the `d` string before passing it in.
