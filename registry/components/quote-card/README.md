# Quote Card

A centered pull-quote scene block with attribution. The quote reveals word-by-word with a slower-than-canonical stagger so the line reads rather than cascades; after a settled beat a small accent-rose rule draws in beneath it, then the author and role fade in together. Built for testimonials, documentary citations, and editorial-feeling section breaks.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `quote` | `string` | `"Motion is the difference between art and craft."` | The pull-quote text. Wraps within the 40%-wide content column. |
| `author` | `string` | `"Saul Bass"` | Attributed name, rendered in `--onda-text`. |
| `role` | `string` | `"Graphic Designer"` | Attributed role, rendered dim beneath the author. |
| `delay` | `integer ≥ 0` | `0` | Frames before the quote starts revealing. The divider and attribution beats chain off this. |
| `accent` | `boolean` | `true` | When `true`, the accent-rose divider draws between quote and attribution. When `false`, the divider is skipped and the parent gap keeps the layout breathing. |
| `quoteFontSize` | `number` | `56` | Quote font size in px. |
| `authorFontSize` | `number` | `22` | Attribution font size in px. Author and role share the same size; the role earns its hierarchy via dim color, not size. |
| `color` | `string` | `"#F2F2F4"` | Quote + author text color (`--onda-text`). |
| `authorColor` | `string` | `"#8E8E98"` | Role text color (`--onda-dim`). |
| `accentColor` | `string` | `"#D96B82"` | Divider rule color (`--onda-accent` — this scene's one earned accent moment). |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | The Onda display font. Never default to Inter / Arial / system. |

## Usage

```tsx
import { Composition } from 'remotion';
import { QuoteCard, quoteCardSchema } from './components/onda/quote-card/QuoteCard';

export const Root: React.FC = () => (
  <Composition
    id="QuoteCard"
    component={QuoteCard}
    durationInFrames={180}
    fps={30}
    width={1920}
    height={1080}
    schema={quoteCardSchema}
    defaultProps={{
      quote: 'Motion is the difference between art and craft.',
      author: 'Saul Bass',
      role: 'Graphic Designer',
      delay: 0,
      accent: true,
      quoteFontSize: 56,
      authorFontSize: 22,
      color: '#F2F2F4',
      authorColor: '#8E8E98',
      accentColor: '#D96B82',
      fontFamily: '"Clash Display", sans-serif',
    }}
  />
);
```

## Motion notes

- **Three-beat sequence.** Quote reveals word-by-word → small breathing pause → accent rule draws in → author + role fade in together. Each beat lands before the next begins; the eye is never asked to track two moves at once. This serial pacing is the Onda restraint signature applied to an editorial layout.
- **Slower stagger between words.** The quote uses a `STAGGER + 2` (6 frames @ 30fps ≈ 0.20s) gap between words rather than the canonical 4. A quote needs to read, not cascade; the longer beat is precisely why this scene-block exists rather than a bare `WordStagger`.
- **Auto-timed beats.** The divider's delay is computed from the quote's word count, so longer quotes automatically push the divider (and attribution) later. No manual frame-counting at the call site.
- **Composes primitives, never reinvents motion.** `WordStagger` carries the quote, `MaskReveal` draws the divider (a unicode block glyph styled to the rule's pixel dimensions reuses the primitive's clip-path retreat verbatim — same fingerprint as every other mask reveal in the lib), and `FadeIn` carries the attribution. All motion fingerprints come from the underlying primitives.
- **The accent is earned.** When `accent === true`, the small rose rule between quote and attribution is the only colored element in the composition. When `false`, the scene goes entirely neutral and the parent gap (`32px`) preserves the rhythm.
- **40% max content width.** A pull-quote feel — wide enough to read at scale, narrow enough that the eye doesn't tire crossing the canvas. Generous outer padding (10%) keeps it inside Onda's scene-block safe margins.
- **No overshoot, no decoration.** Springs come from `SPRING_SMOOTH` via the underlying primitives; the divider is a thin rule, not a full underline; the attribution is two stacked fades, not a sliding marquee. Calm by design.
