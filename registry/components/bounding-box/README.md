# BoundingBox

A UI annotation bounding box. A rectangle outline strokes itself on like a selection marquee around a region; once it lands, optional L-shaped corner ticks fade in and an optional label tag scales in from the top-left corner. Use it to highlight a UI element in docs and tutorial videos — point the viewer at the button, panel, or field you're describing without obscuring it. The accent (`--onda-accent`, `#D96B82`) is the default here because the highlight is the whole point.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `x` | `number 0–1` | `0.3` | Box left edge as a fraction of canvas width. |
| `y` | `number 0–1` | `0.3` | Box top edge as a fraction of canvas height. |
| `width` | `number 0–1` | `0.4` | Box width as a fraction of canvas width. |
| `height` | `number 0–1` | `0.4` | Box height as a fraction of canvas height. |
| `label` | `string` | `""` | Tag text pinned to the top-left corner. Empty string hides the tag. |
| `color` | `string` | `"#D96B82"` | Outline / tick / tag color (`--onda-accent`). |
| `delay` | `integer ≥ 0` | `0` | Frames before the outline starts drawing. |
| `drawDuration` | `integer ≥ 1` | `DURATION.slow` (24) | Frames to draw the full rectangle outline. |
| `strokeWidth` | `number ≥ 0` | `3` | Outline stroke width in px (corner ticks are 1px heavier). |
| `corners` | `boolean` | `true` | Draw L-shaped tick marks at each corner after the outline lands. |
| `labelColor` | `string` | `"#08080A"` | Tag text color (`--onda-bg`) — dark for contrast on the accent tag. |
| `fontSize` | `number` | `16` | Label font size in px. |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | The Onda display font. Never default to Inter / Arial / system. |

## Usage

```tsx
import { Composition } from 'remotion';
import { BoundingBox, boundingBoxSchema } from './components/onda/bounding-box/BoundingBox';

export const Root: React.FC = () => (
  <Composition
    id="BoundingBox"
    component={BoundingBox}
    durationInFrames={90}
    fps={30}
    width={1920}
    height={1080}
    schema={boundingBoxSchema}
    defaultProps={{
      x: 0.2,
      y: 0.28,
      width: 0.45,
      height: 0.32,
      label: 'Settings panel',
      color: '#D96B82',
      delay: 0,
      drawDuration: 24,
      strokeWidth: 3,
      corners: true,
      labelColor: '#08080A',
      fontSize: 16,
      fontFamily: '"Clash Display", sans-serif',
    }}
  />
);
```

## Motion notes

- **Two-phase reveal.** The outline strokes on first as a single marquee tracing the perimeter clockwise from the top-left corner, using `evolvePath` from `@remotion/paths` driven by `SPRING_SMOOTH` — calm, settled, no overshoot, exactly like `draw-on`. Once the line lands, the corner ticks and label tag fade/scale in together. One thing at a time is the Onda restraint signature.
- **0–1 coordinate system.** `x`, `y`, `width`, and `height` are normalized fractions of the canvas (0 = left/top, 1 = right/bottom). This keeps the box resolution-independent and trivially repositionable, matching `callout`'s `x`/`y` convention.
- **Canvas dimensions come from `useVideoConfig()`.** No need to pass them — the component reads `width` / `height` from the composition automatically.
- **Accent earned.** The outline, ticks, and tag all default to `--onda-accent`. A single restrained accent glow (`drop-shadow`) rides the outline, and the line eases up from 0.4 → 1 opacity as it draws so it gains presence rather than popping.
- **Deterministic.** Frame N renders correctly with zero knowledge of prior frames — all motion is a pure function of `useCurrentFrame()`. No random, no date, no state.
- **Spring is `SPRING_SMOOTH`** for the draw; fades use the house easing (`Easing.bezier(0.16, 1, 0.3, 1)`) via `lib/choreography` helpers, all clamped at both ends.
