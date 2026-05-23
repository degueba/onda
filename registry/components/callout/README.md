# Callout

A label-and-arrow annotation that points at a specific spot on the canvas. The bubble appears first with a calm scale-and-fade; after a small beat the arrow draws on from the bubble toward the anchor. Use it to highlight UI elements in tutorials, name parts in explainers, or draw attention without obscuring the underlying content.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `string` | `"Look here"` | Text shown inside the bubble. |
| `x` | `number 0–1` | `0.5` | Anchor X as a fraction of the canvas width. |
| `y` | `number 0–1` | `0.5` | Anchor Y as a fraction of the canvas height. |
| `position` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'top-right'` | Which quadrant the bubble sits relative to the anchor. |
| `offset` | `integer ≥ 0` | `160` | Pixel offset (both axes) from anchor to bubble center. |
| `delay` | `integer ≥ 0` | `0` | Frames before the bubble starts revealing. |
| `duration` | `integer ≥ 1` | `DURATION.base` (18) | Frames for the bubble's scale-and-fade reveal. |
| `lineDelay` | `integer ≥ 0` | `6` | Frames *after* the bubble starts revealing before the arrow begins drawing. |
| `lineDuration` | `integer ≥ 1` | `DURATION.base` (18) | Frames for the arrow to draw fully from bubble to anchor. |
| `color` | `string` | `"#F2F2F4"` | Label text color (`--onda-text`). |
| `bgColor` | `string` | `"#0E0E12"` | Bubble background (`--onda-surface`). |
| `borderColor` | `string` | `"#26262E"` | Bubble border (`--onda-border-lit`). |
| `arrowColor` | `string` | `"#F2F2F4"` | Arrow stroke color. |
| `arrowWidth` | `number` | `2` | Arrow stroke width in px. |
| `fontSize` | `number` | `20` | Label font size in px. |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | The Onda display font. Never default to Inter / Arial / system. |
| `canvasWidth` | `integer ≥ 1` | `1920` | Canvas width — required to convert the 0–1 `x` into pixels. |
| `canvasHeight` | `integer ≥ 1` | `1080` | Canvas height — required to convert the 0–1 `y` into pixels. |

## Usage

```tsx
import { Composition } from 'remotion';
import { Callout, calloutSchema } from './components/onda/callout/Callout';

export const Root: React.FC = () => (
  <Composition
    id="Callout"
    component={Callout}
    durationInFrames={90}
    fps={30}
    width={1920}
    height={1080}
    schema={calloutSchema}
    defaultProps={{
      label: 'Tap here',
      x: 0.42,
      y: 0.58,
      position: 'top-right',
      offset: 160,
      delay: 0,
      duration: 18,
      lineDelay: 6,
      lineDuration: 18,
      color: '#F2F2F4',
      bgColor: '#0E0E12',
      borderColor: '#26262E',
      arrowColor: '#F2F2F4',
      arrowWidth: 2,
      fontSize: 20,
      fontFamily: '"Clash Display", sans-serif',
      canvasWidth: 1920,
      canvasHeight: 1080,
    }}
  />
);
```

## Motion notes

- **Two-phase reveal.** The bubble lands first (scale 0.9 → 1 + fade in via `entryScale` + `entryFade` from `lib/choreography.ts`, both running on `SPRING_SMOOTH`). After a `lineDelay` beat (default 6 frames ≈ 0.2s at 30fps), the arrow strokes on from the bubble toward the anchor using `evolvePath` from `@remotion/paths`. Sequencing one move at a time — bubble, beat, arrow — is the Onda restraint signature; the eye is never asked to track two things at once.
- **0–1 coord system.** `x` and `y` are normalized fractions of the canvas (0 = left/top, 1 = right/bottom). This keeps callouts resolution-independent and trivially repositionable.
- **`canvasWidth` / `canvasHeight` are required.** The component renders inside an `<AbsoluteFill>` and has no other way to know the composition size at render time. Pass the same numbers you use in `<Composition width=... height=... />`; defaulting them keeps the zero-config case crisp at 1920×1080.
- **Bubble centering is transform-based.** The bubble is positioned at its target center and then `translate(-50%, -50%)` centers it on that point — no measurement required.
- **Spring is `SPRING_SMOOTH`** for both phases. No overshoot, no bounce. All `interpolate` calls inside the helpers and `evolvePath` outputs clamp at both ends.
- **No arrowhead.** A clean line is more on-brand than a decorative arrow tip.
