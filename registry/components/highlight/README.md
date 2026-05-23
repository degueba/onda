# Highlight

Text that fades in calmly, then a marker-style accent-rose bar slides in behind it at full text-height. Like `Underline`, but the color sweeps *behind* the word rather than under it — the same two-phase rhythm (text first, color second) with more visual weight. The bar uses Onda's signature dusty rose by default; this is one of the catalog's few earned-color moments and is intentionally reserved for emphasis.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | `string` | `"highlight this"` | What to emphasize. |
| `delay` | `integer ≥ 0` | `0` | Frames before the text reveal starts. |
| `duration` | `integer ≥ 1` | `DURATION.base` (18) | Frames for the text fade. |
| `lineDelay` | `integer ≥ 0` | `8` | Frames after `delay` before the highlight starts sliding in. The beat between text landing and bar attacking. |
| `lineDuration` | `integer ≥ 1` | `DURATION.fast` (10) | Frames for the highlight bar to reach full width. Fast on purpose — emphatic. |
| `color` | `string` | `"#F2F2F4"` | Text color — defaults to `--onda-text`. |
| `accentColor` | `string` | `"#D96B82"` | Highlight bar color — defaults to `--onda-accent` (the catalog's signature rose). |
| `fontSize` | `number` | `64` | Pixels. |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | The Onda display font. Never default to Inter / Arial / system. |
| `paddingX` | `number` | `8` | Pixels the highlight bar extends past each text edge. |

## Usage

```tsx
import { Composition } from 'remotion';
import { Highlight, highlightSchema } from './components/onda/highlight/Highlight';

export const Root: React.FC = () => (
  <Composition
    id="MyHighlight"
    component={Highlight}
    durationInFrames={60}
    fps={30}
    width={1080}
    height={1920}
    schema={highlightSchema}
    defaultProps={{
      text: 'highlight this',
      delay: 0,
      duration: 18,
      lineDelay: 8,
      lineDuration: 10,
      color: '#F2F2F4',
      accentColor: '#D96B82',
      fontSize: 64,
      fontFamily: '"Clash Display", sans-serif',
      paddingX: 8,
    }}
  />
);
```

## Motion notes

- **Two-phase reveal.** The text fades first via `entryFade` (opacity-only on `SPRING_SMOOTH`); after `lineDelay` frames have passed since the text started, the highlight bar slides in from 0% to 100% width on `SPRING_SMOOTH` over `lineDuration` (fast — `DURATION.fast`, 10 frames). The eye reads "word… *highlight*" rather than "word and highlight." That beat is the whole point.
- **The accent rose default is intentional.** `Highlight` is one of the catalog's rare earned-color moments. Per CLAUDE.md §3, the accent is used sparingly — for an emphasized headline word, a CTA, a single underline or highlight. Don't reach for `Highlight` to decorate; reach for it when one phrase deserves to be the focal element.
- **Width follows the text exactly.** The outer wrapper is `display: inline-block` so it shrinks to the text's natural width, and the highlight bar is absolutely positioned with `width: calc(<progress>% + <paddingX*2>px)` against that wrapper. The bar is anchored to the text — no measuring, no DOM reads, no layout shift. Change `text` and the highlight length follows automatically.
- **z-stack.** The bar sits at `zIndex: 0` (behind); the text span sits at `zIndex: 1` (on top, `position: relative`) so the highlight reads as a marker swept *behind* the word.
- **Both layers render from frame 0.** Text starts at opacity 0; bar starts at width 0%. Both elements exist throughout so nothing pops into the layout when the animation kicks in.
- All `interpolate` calls clamp at both ends — the component is correct on frame 0 and on any frame past the full reveal.
