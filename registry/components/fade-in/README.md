# FadeIn

A pure opacity fade for text. No translate, no scale, no blur — just opacity easing from 0 to 1 with the Onda house curve. The simplest possible reveal in the catalog, for moments where any other motion would say too much.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | `string` | `"Onda"` | What to reveal. |
| `delay` | `integer ≥ 0` | `0` | Frames before the animation starts. |
| `duration` | `integer ≥ 1` | `DURATION.base` (18) | Frames to fully reach opacity 1. |
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
import { FadeIn, fadeInSchema } from './components/onda/fade-in/FadeIn';

export const Root: React.FC = () => (
  <Composition
    id="MyFade"
    component={FadeIn}
    durationInFrames={60}
    fps={30}
    width={1080}
    height={1920}
    schema={fadeInSchema}
    defaultProps={{
      text: 'Hello',
      delay: 0,
      duration: 18,
      color: '#F2F2F4',
      fontSize: 96,
      fontFamily: '"Clash Display", sans-serif',
    }}
  />
);
```

## Motion notes

- Opacity is driven by `entryFade` from `lib/choreography.ts`, which uses `SPRING_SMOOTH` to drive opacity 0→1. Never raw linear for tracked motion.
- Duration defaults to `DURATION.base` (18 frames ≈ 0.6s at 30fps).
- No translate, no scale, no blur — intentionally. When the surrounding scene already carries motion, a pure fade is the right restraint.
- `entryFade` clamps at both ends — the component is correct on frame 0 and on any frame past `delay + duration`.
