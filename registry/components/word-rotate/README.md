# WordRotate

Cycles through a list of phrases in place. Each phrase rises 12px and fades in on `SPRING_SMOOTH`, holds at full opacity, then fades out as the next arrives. Phrases are stacked at the same center point so only one is visible at a time — one focal element per moment, the Onda way.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `phrases` | `string[]` | `['fast', 'beautiful', 'restrained']` | Phrases shown in order, one at a time. |
| `delay` | `integer ≥ 0` | `0` | Frames before the first phrase begins to enter. |
| `holdDuration` | `integer ≥ 1` | `30` | Frames each phrase holds at full opacity. |
| `transitionDuration` | `integer ≥ 1` | `12` | Frames to fade a phrase in (and, separately, out). |
| `color` | `string` | `"#F2F2F4"` | Text color — defaults to `--onda-text`. |
| `fontSize` | `number` | `96` | Pixels. Wins over `size` if both are passed. |
| `size` | `SizeRole?` | – | Semantic typography role — `'hero'` \| `'heading'` \| `'subheading'` \| `'body'` \| `'caption'`. Resolves to canvas-aware pixels via the smaller canvas dimension. `fontSize` wins when both are passed. |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | The Onda display font. Never default to Inter / Arial / system. |
| `fontWeight` | `number` | `600` | Font weight. |
| `letterSpacing` | `string` | `"-0.02em"` | CSS letter-spacing — tight tracking by default. |
| `lineHeight` | `number` | `1.1` | Unitless line height. |
| `align` | `"left" \| "center" \| "right"` | `"left"` | Text alignment. |

## Usage

```tsx
import { Composition } from 'remotion';
import { WordRotate, wordRotateSchema } from './components/onda/word-rotate/WordRotate';

export const Root: React.FC = () => (
  <Composition
    id="WordRotate"
    component={WordRotate}
    durationInFrames={150}
    fps={30}
    width={1080}
    height={1920}
    schema={wordRotateSchema}
    defaultProps={{
      phrases: ['fast', 'beautiful', 'restrained'],
      delay: 0,
      holdDuration: 30,
      transitionDuration: 12,
      color: '#F2F2F4',
      fontSize: 96,
      fontFamily: '"Clash Display", sans-serif',
    }}
  />
);
```

## Motion notes

- Each phrase occupies a slot of `transitionDuration + holdDuration` frames. Inside the slot it fades in over `transitionDuration`, holds at 1 for `holdDuration`, then fades out over the next `transitionDuration` — overlapping the incoming phrase's fade-in so the swap reads as one motion.
- Rise is driven by `SPRING_SMOOTH` from `lib/motion.ts` (the Onda house default, no overshoot). 12px travel — small on purpose.
- Opacity uses `HOUSE_EASE` from `lib/easing.ts` per CLAUDE.md §3.
- All phrases after the first are absolutely positioned at the same center point so they stack visually — only one is visible at a time.
- All `interpolate` calls clamp at both ends — the component is correct on frame 0 and on any frame past the last phrase's window.
