# ScaleIn

A subtle scale-from-slightly-smaller-and-fade entrance. Opacity rises from 0 to 1 while scale settles from `0.90` to `1.0` on the house spring — no overshoot, no scale jumps. Restrained on purpose: the move is felt, never seen as a "pop."

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | `string` | `"Onda"` | What to reveal. |
| `delay` | `integer ≥ 0` | `0` | Frames before the animation starts. |
| `duration` | `integer ≥ 1` | `DURATION.base` (18) | Target frames to settle. With `SPRING_SMOOTH` the visible motion lands in roughly this range. |
| `fromScale` | `number` | `0.9` | Starting scale. Restrained by design — see Motion notes. |
| `color` | `string` | `"#F2F2F4"` | Text color — defaults to `--onda-text`. |
| `fontSize` | `number` | `96` | Pixels. |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | The Onda display font. Never default to Inter / Arial / system. |
| `fontWeight` | `number` | `600` | Font weight. |
| `letterSpacing` | `string` | `"normal"` | CSS letter-spacing (e.g. `"-0.02em"`, `"0.06em"`). |
| `lineHeight` | `number` | `1.1` | Unitless line height. |
| `align` | `"left" \| "center" \| "right"` | `"left"` | Text alignment. |
| `placement` | `Placement?` | – | Where on the canvas this sits. Region (`"center"`, `"upper-third"`, …) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. |

## Usage

```tsx
import { Composition } from 'remotion';
import { ScaleIn, scaleInSchema } from './components/onda/scale-in/ScaleIn';

export const Root: React.FC = () => (
  <Composition
    id="MyScaleIn"
    component={ScaleIn}
    durationInFrames={60}
    fps={30}
    width={1080}
    height={1920}
    schema={scaleInSchema}
    defaultProps={{
      text: 'Hello',
      delay: 0,
      duration: 18,
      fromScale: 0.9,
      color: '#F2F2F4',
      fontSize: 96,
      fontFamily: '"Clash Display", sans-serif',
    }}
  />
);
```

## Motion notes

- Uses `entryScale` from `lib/choreography.ts` — opacity + scale on `SPRING_SMOOTH`. **No overshoot.** Don't reduce damping for a "pop."
- Duration defaults to `DURATION.base` (18 frames ≈ 0.6s at 30fps).
- `fromScale` defaults to `0.9` — restrained, but enough magnitude to read as a real scale entrance (not just a fade) at typical preview sizes. The safe zone is `[0.88, 0.96]`: above `0.96` the scale is invisible against the opacity fade and the component reads identically to `FadeIn`; below `0.85` it crosses into a dramatic zoom and breaks the calm rule. If you need a more dramatic landing, prefer a dedicated hero pattern (the `heroReveal` pattern in `lib/choreography.ts`).
- All `interpolate` calls clamp at both ends — the component is correct on frame 0 and on any frame past `delay + duration`.
