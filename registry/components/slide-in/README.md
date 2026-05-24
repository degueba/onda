# SlideIn

A direction-parameterized translate-and-fade entrance. Text slides into place from `'up'`, `'down'`, `'left'`, or `'right'` on `SPRING_SMOOTH` while opacity fades from 0 to 1 — all settling without overshoot. Travel is a calm 16px by default: the eye feels the motion, it isn't dragged by it.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | `string` | `"Onda"` | What to slide in. |
| `delay` | `integer ≥ 0` | `0` | Frames before the animation starts. |
| `duration` | `integer ≥ 1` | `DURATION.base` (18) | Target frames to fully settle. |
| `direction` | `"up" \| "down" \| "left" \| "right"` | `"up"` | Direction the text moves *toward* as it settles. `"up"` starts below and rises. |
| `distance` | `number` | `16` | Pixels of travel. Keep within 12–24 — Onda travel is deliberately small. |
| `color` | `string` | `"#F2F2F4"` | Text color — defaults to `--onda-text`. |
| `fontSize` | `number` | `96` | Pixels. |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | The Onda display font. Never default to Inter / Arial / system. |
| `fontWeight` | `number` | `600` | Font weight. |
| `letterSpacing` | `string` | `"normal"` | CSS letter-spacing (e.g. `"-0.02em"`, `"0.06em"`). |
| `lineHeight` | `number` | `1.1` | Unitless line height. |
| `align` | `"left" \| "center" \| "right"` | `"left"` | Text alignment. |

## Usage

```tsx
import { Composition } from 'remotion';
import { SlideIn, slideInSchema } from './components/onda/slide-in/SlideIn';

export const Root: React.FC = () => (
  <Composition
    id="MySlide"
    component={SlideIn}
    durationInFrames={60}
    fps={30}
    width={1080}
    height={1920}
    schema={slideInSchema}
    defaultProps={{
      text: 'Hello',
      delay: 0,
      duration: 18,
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

- Uses `entrySlide` from `lib/choreography.ts` — direction-parameterized translate + fade on `SPRING_SMOOTH`. **No overshoot.** Don't reduce damping for a "pop."
- Duration defaults to `DURATION.base` (18 frames ≈ 0.6s at 30fps).
- Travel defaults to 16px (`SPACING[1]`) — keep `distance` within the 12–24 band. Larger jumps break the signature.
- `direction` names the *settling* direction: `'up'` rises into place from below, `'down'` falls in from above, `'left'` slides leftward from the right, `'right'` slides rightward from the left.
- All `interpolate` calls clamp at both ends — the component is correct on frame 0 and on any frame past `delay + duration`.
