# MaskReveal

Reveals text from behind a retreating mask. The text renders fully from frame 0; a spring-driven `clip-path` inset shrinks from 100% to 0%, uncovering the text edge-by-edge with a crisp hard line. No opacity fade — the hard mask edge is the fingerprint of this primitive.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | `string` | `"Onda"` | What to reveal. |
| `delay` | `integer ≥ 0` | `0` | Frames before the animation starts. |
| `duration` | `integer ≥ 1` | `DURATION.base` (18) | Target frames to fully uncover. With `SPRING_SMOOTH` the visible motion settles in roughly this range. |
| `direction` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'left'` | The side the text comes IN from. Mirrors `SlideIn`'s convention — the mask sits on the OPPOSITE side and retreats toward this one. |
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
import { MaskReveal, maskRevealSchema } from './components/onda/mask-reveal/MaskReveal';

export const Root: React.FC = () => (
  <Composition
    id="MyMaskReveal"
    component={MaskReveal}
    durationInFrames={60}
    fps={30}
    width={1080}
    height={1920}
    schema={maskRevealSchema}
    defaultProps={{
      text: 'Hello',
      delay: 0,
      duration: 18,
      direction: 'left',
      color: '#F2F2F4',
      fontSize: 96,
      fontFamily: '"Clash Display", sans-serif',
    }}
  />
);
```

## Motion notes

- **Direction names the side the text comes IN from** — same convention as `SlideIn`. With `direction: 'left'` the text appears from the left edge first, so the mask covers the **right** side and retreats rightward (`inset(0 cover% 0 0)`). `'right'` mirrors it (`inset(0 0 0 cover%)`); `'top'` and `'bottom'` do the vertical equivalents.
- **Opacity is intentionally unanimated.** The brand of this primitive is the hard reveal edge — fading would blur that signature. The text is rendered at full opacity from frame 0; only the clip path moves.
- Spring is `SPRING_SMOOTH` from `lib/motion.ts` — the Onda house default. No overshoot; the mask edge slides to rest, it doesn't snap or bounce past.
- Duration defaults to `DURATION.base` (18 frames ≈ 0.6s at 30fps).
- Both `clipPath` and `WebkitClipPath` are set for cross-browser support — Safari (including current iOS WebKit and Chromium renderers used by Remotion/Headless Chrome) honors the unprefixed form, but the `-webkit-` alias is kept as a safety net for any older WebKit-based environment in the toolchain.
- All `interpolate` calls clamp at both ends — the component is correct on frame 0 (fully masked) and on any frame past `delay + duration` (fully revealed).
