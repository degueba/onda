# Typewriter

A character-by-character text reveal with an optional blinking cursor in the Onda accent. Characters appear at a constant rate over `duration` frames, then the cursor — drawn in dusty rose so it earns one of the rare accent usages in the catalog — disappears once the line is fully typed. Body-font default (Space Grotesk) reads more "typed" than the display face.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | `string` | `"motion graphics"` | What to type out. Multi-character so the reveal is visibly progressive. |
| `delay` | `integer ≥ 0` | `0` | Frames before typing starts. |
| `duration` | `integer ≥ 1` | `DURATION.slow` (24) | Target frames to fully type the string. Gives the eye time to follow. |
| `cursor` | `boolean` | `true` | Whether to render the blinking cursor while typing. |
| `cursorColor` | `string` | `"#D96B82"` | `--onda-accent`. The cursor is one of the few earned accent uses in the catalog. |
| `color` | `string` | `"#F2F2F4"` | Text color — defaults to `--onda-text`. |
| `fontSize` | `number` | `64` | Pixels. Wins over `size` if both are passed. |
| `size` | `SizeRole?` | – | Semantic typography role — `'hero'` \| `'heading'` \| `'subheading'` \| `'body'` \| `'caption'`. Resolves to canvas-aware pixels via the smaller canvas dimension. `fontSize` wins when both are passed. |
| `fontFamily` | `string` | `'"Space Grotesk", sans-serif'` | The Onda body font — reads more "typed" than Clash Display. Never default to monospace system fonts. |

## Usage

```tsx
import { Composition } from 'remotion';
import { Typewriter, typewriterSchema } from './components/onda/typewriter/Typewriter';

export const Root: React.FC = () => (
  <Composition
    id="MyTypewriter"
    component={Typewriter}
    durationInFrames={90}
    fps={30}
    width={1080}
    height={1920}
    schema={typewriterSchema}
    defaultProps={{
      text: 'motion graphics',
      delay: 0,
      duration: 24,
      cursor: true,
      cursorColor: '#D96B82',
      color: '#F2F2F4',
      fontSize: 64,
      fontFamily: '"Space Grotesk", sans-serif',
    }}
  />
);
```

## Motion notes

- **Linear by design — the one intentional exception in the Onda catalog.** Every other primitive uses `SPRING_SMOOTH` because springs feel premium. Typing is the opposite: a spring on `charsToShow` would land characters fast in the middle of the curve and slowly at the ends, breaking the constant-rate feel that makes typing read as typing. So `progress` here is a plain clamped `interpolate` from `[0, duration]` to `[0, 1]`, and `charsToShow = Math.floor(progress * text.length)`.
- **Accent cursor color.** The cursor renders in `--onda-accent` (#D96B82). Color is earned in Onda, never sprinkled — a single dusty-rose bar moving across a neutral line is exactly the kind of restrained accent moment the brand calls for.
- **Deterministic blink.** `cursorVisible = Math.floor(frame / 15) % 2 === 0` toggles every 15 frames (0.5s at 30fps). It is a pure function of `frame` — no `setInterval`, no state — so any frame renders correctly in isolation, which is the Remotion contract.
- **Cursor lifecycle.** The cursor `<span>` is always rendered (so the trailing layout is stable and the element can be styled by tooling), but its opacity drops to `0` once `progress >= 1` or when `cursor` is false. While typing, opacity toggles between `1` and `0` on the blink cadence.
- All `interpolate` calls clamp at both ends — the component is correct on frame 0 and on any frame past `delay + duration`.
