# Underline

Text that fades in calmly, then has an accent-rose underline draw beneath it after a small beat. The two-phase rhythm — text first, color second — turns an ordinary word into an emphasized one. The underline uses Onda's signature dusty rose by default; this is one of the catalog's few earned-color moments and is intentionally reserved for emphasis.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | `string` | `"underline this"` | What to emphasize. |
| `delay` | `integer ≥ 0` | `0` | Frames before the text reveal starts. |
| `duration` | `integer ≥ 1` | `DURATION.base` (18) | Frames for the text fade. |
| `lineDelay` | `integer ≥ 0` | `8` | Frames after `delay` before the underline starts drawing. The beat between text landing and line attacking. |
| `lineDuration` | `integer ≥ 1` | `DURATION.fast` (10) | Frames for the underline to draw to full width. Fast on purpose — emphatic. |
| `color` | `string` | `"#F2F2F4"` | Text color — defaults to `--onda-text`. |
| `accentColor` | `string` | `"#D96B82"` | Underline color — defaults to `--onda-accent` (the catalog's signature rose). |
| `lineThickness` | `number` | `3` | Underline stroke in px. |
| `lineOffset` | `number` | `6` | Gap in px between the text baseline and the line. |
| `fontSize` | `number` | `64` | Pixels. Wins over `size` if both are passed. |
| `size` | `SizeRole?` | – | Semantic typography role — `'hero'` \| `'heading'` \| `'subheading'` \| `'body'` \| `'caption'`. Resolves to canvas-aware pixels via the smaller canvas dimension. `fontSize` wins when both are passed. |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | The Onda display font. Never default to Inter / Arial / system. |

## Usage

```tsx
import { Composition } from 'remotion';
import { Underline, underlineSchema } from './components/onda/underline/Underline';

export const Root: React.FC = () => (
  <Composition
    id="MyUnderline"
    component={Underline}
    durationInFrames={60}
    fps={30}
    width={1080}
    height={1920}
    schema={underlineSchema}
    defaultProps={{
      text: 'underline this',
      delay: 0,
      duration: 18,
      lineDelay: 8,
      lineDuration: 10,
      color: '#F2F2F4',
      accentColor: '#D96B82',
      lineThickness: 3,
      lineOffset: 6,
      fontSize: 64,
      fontFamily: '"Clash Display", sans-serif',
    }}
  />
);
```

## Motion notes

- **Two-phase reveal.** The text fades first via `entryFade` (opacity-only on `SPRING_SMOOTH`); after `lineDelay` frames have passed since the text started, the underline draws from 0% to 100% width on `SPRING_SMOOTH` over `lineDuration` (fast — `DURATION.fast`, 10 frames). The eye reads "word… *line*" rather than "word and line." That beat is the whole point.
- **The accent rose default is intentional.** `Underline` is one of the catalog's rare earned-color moments. Per CLAUDE.md §3, the accent is used sparingly — for an emphasized headline word, a CTA, a single underline. Don't reach for `Underline` to decorate; reach for it when one phrase deserves to be the focal element.
- **Width follows the text exactly.** The outer wrapper is `display: inline-block` so it shrinks to the text's natural width, and the underline is absolutely positioned with `width: <progress>%` against that wrapper. This means the line is always anchored to the text — no measuring, no DOM reads, no layout shift as it draws. Change `text` and the underline length follows automatically.
- **Both layers render from frame 0.** Text starts at opacity 0; underline starts at width 0%. Both elements exist throughout so nothing pops into the layout when the animation kicks in.
- All `interpolate` calls clamp at both ends — the component is correct on frame 0 and on any frame past the full reveal.
