# BlurReveal

A calm, spring-driven text reveal. Opacity fades from 0 to 1, blur drops from 10px to 0, and the text rises 16px into its resting position — all settling without overshoot. The reference Onda primitive: every motion fingerprint in one component.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | `string` | `"Onda"` | What to reveal. |
| `delay` | `integer ≥ 0` | `0` | Frames before the animation starts. |
| `duration` | `integer ≥ 1` | `DURATION.base` (18) | Target frames to fully reveal. With `SPRING_SMOOTH` the visible motion settles in roughly this range. |
| `color` | `string` | `"#F2F2F4"` | Text color — defaults to `--onda-text`. |
| `fontSize` | `number` | `96` | Pixels. |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | The Onda display font. Never default to Inter / Arial / system. |

## Usage

```tsx
import { Composition } from 'remotion';
import { BlurReveal, blurRevealSchema } from './components/onda/blur-reveal/BlurReveal';

export const Root: React.FC = () => (
  <Composition
    id="MyReveal"
    component={BlurReveal}
    durationInFrames={60}
    fps={30}
    width={1080}
    height={1920}
    schema={blurRevealSchema}
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

- Spring is `SPRING_SMOOTH` from `lib/motion.ts` — the Onda house default. **No overshoot.** Don't reduce damping for a "pop."
- Duration defaults to `DURATION.base` (18 frames ≈ 0.6s at 30fps).
- Travel is 16px (`SPACING[1]`) — small on purpose. The eye should feel the motion, not be dragged by it.
- All `interpolate` calls clamp at both ends — the component is correct on frame 0 and on any frame past `delay + duration`.
