# RotateIn

A calm, spring-driven text rotation. The text settles from a slight starting angle (default `-8°`) to `0°` while opacity fades from 0 to 1 — landing without overshoot. A small-angle entrance that adds character without theatrics.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | `string` | `"Onda"` | What to reveal. |
| `delay` | `integer ≥ 0` | `0` | Frames before the animation starts. |
| `duration` | `integer ≥ 1` | `DURATION.base` (18) | Target frames to fully settle. With `SPRING_SMOOTH` the visible motion lands in roughly this range. |
| `fromAngle` | `number` | `-8` | Starting angle in degrees. Safe zone is `[-12, +12]`; beyond that the move reads as theatrical / off-brand. |
| `color` | `string` | `"#F2F2F4"` | Text color — defaults to `--onda-text`. |
| `fontSize` | `number` | `96` | Pixels. |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | The Onda display font. Never default to Inter / Arial / system. |

## Usage

```tsx
import { Composition } from 'remotion';
import { RotateIn, rotateInSchema } from './components/onda/rotate-in/RotateIn';

export const Root: React.FC = () => (
  <Composition
    id="MyRotate"
    component={RotateIn}
    durationInFrames={60}
    fps={30}
    width={1080}
    height={1920}
    schema={rotateInSchema}
    defaultProps={{
      text: 'Hello',
      delay: 0,
      duration: 18,
      fromAngle: -8,
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
- **`fromAngle` safe zone is `[-12, +12]` degrees.** The default `-8°` is enough to feel — the eye registers the settle — without reading as a deliberate tilt. Anything outside that range crosses into theatrical / gimmicky territory and breaks the Onda restraint. The schema does not hard-clamp the value (callers may need a touch more for a specific layout), but treat the safe zone as the design guidance.
- `transformOrigin: 'center'` is set explicitly. It is the default for `<div>`, but stating it inline makes the pivot point unambiguous — the rotation reads as a settle around the text's center, not around a corner.
- All `interpolate` calls clamp at both ends — the component is correct on frame 0 and on any frame past `delay + duration`.
- Inline motion for now; this primitive is the candidate for extracting an `entryRotate` helper into `lib/choreography.ts` once a second component needs the same pattern.
