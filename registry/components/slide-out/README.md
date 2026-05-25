# SlideOut

A direction-parameterized translate-and-fade exit — the mirror of `SlideIn`. Text drifts toward `'up'`, `'down'`, `'left'`, or `'right'` on `SPRING_SMOOTH` while opacity fades from 1 to 0 — all without overshoot. Travel is a calm 16px by default: the eye feels the motion, it isn't dragged by it.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | `string` | `"Onda"` | What to slide out. |
| `delay` | `integer ≥ 0` | `0` | Frames before the animation starts. |
| `duration` | `integer ≥ 1` | `DURATION.fast` (10) | Target frames to fully leave. Exits are deliberately quicker than entrances. |
| `direction` | `"up" \| "down" \| "left" \| "right"` | `"up"` | Direction the text moves *toward* as it leaves. `"up"` rises out of frame. |
| `distance` | `number` | `16` | Pixels of travel. Keep within 12–24 — Onda travel is deliberately small. |
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
import { SlideOut, slideOutSchema } from './components/onda/slide-out/SlideOut';

export const Root: React.FC = () => (
  <Composition
    id="MyExit"
    component={SlideOut}
    durationInFrames={30}
    fps={30}
    width={1080}
    height={1920}
    schema={slideOutSchema}
    defaultProps={{
      text: 'Hello',
      delay: 0,
      duration: 10,
      direction: 'up',
      distance: 16,
      color: '#F2F2F4',
      fontSize: 96,
      fontFamily: '"Clash Display", sans-serif',
    }}
  />
);
```

## Motion notes

- Spring is `SPRING_SMOOTH` from `lib/motion.ts` — the Onda house default. **No overshoot.** Don't reduce damping for a "pop."
- Duration defaults to `DURATION.fast` (10 frames ≈ 0.33s at 30fps). Exits are quicker than entrances by design.
- Travel defaults to 16px — keep `distance` within the 12–24 band. Larger jumps break the signature.
- `direction` names the *exit* direction: `'up'` rises out, `'down'` drops out, `'left'` drifts off-left, `'right'` drifts off-right. This is the inverse of `SlideIn`, whose `direction` names the settling direction.
- All `interpolate` calls clamp at both ends — the component is correct on frame 0 (fully visible, at rest) and on any frame past `delay + duration` (fully gone).
