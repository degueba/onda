# ChapterCard

A chapter-title scene block for explainer and documentary videos. A small numbered eyebrow ("01") fades in first, the chapter title rises beneath it with the canonical Onda blur-reveal, and when `accent` is on, a quiet rose underline punctuates the title — tying the number and the rule into a single earned-color moment. Composed entirely from `FadeIn`, `BlurReveal`, and `Underline` so the motion fingerprint matches the rest of the catalog; no new motion is invented here.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `chapter` | `string` | `"The setup"` | The chapter heading — the focal text on the card. |
| `number` | `string` | `"01"` | Numbered index. Kept as a string so leading zeros (`"01"`, `"02"`) render as written. |
| `delay` | `integer >= 0` | `0` | Frames before the number starts fading in. The whole card is sequenced relative to this. |
| `accent` | `boolean` | `true` | When `true`, the number takes `numberColor` (the rose) and a quiet underline draws beneath the title. When `false`, the number falls back to `subtitleColor` and no underline is drawn. |
| `numberColor` | `string` | `"#D96B82"` | Number color when `accent` is `true`. Defaults to `--onda-accent` — the one earned-color moment on the card. |
| `color` | `string` | `"#F2F2F4"` | Chapter title color. Defaults to `--onda-text`. |
| `subtitleColor` | `string` | `"#8E8E98"` | Number color when `accent` is `false`. Defaults to `--onda-dim`, so the number reads as quiet metadata. |
| `numberFontSize` | `number` | `32` | Pixels. The number sits above the title and is intentionally smaller — it's the eyebrow, not the headline. Wins over `numberSize` if both are passed. |
| `numberSize` | `SizeRole?` | – | Semantic role for the number — `'hero'` \| `'heading'` \| `'subheading'` \| `'body'` \| `'caption'`. Resolves to canvas-aware pixels. `numberFontSize` wins when both are passed. |
| `titleFontSize` | `number` | `96` | Pixels. The title is the focal element on the card. Wins over `titleSize` if both are passed. |
| `titleSize` | `SizeRole?` | – | Semantic role for the title. `titleFontSize` wins when both are passed. |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | The Onda display font, applied to both number and title for tonal consistency. |
| `placement` | `Placement` | `'center'` | Where on the canvas the chapter card sits. Pass a region (`'center'`, `'upper-third'`, `'top-right'`, …) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. |

## Usage

```tsx
import { Composition } from 'remotion';
import { ChapterCard, chapterCardSchema } from './components/onda/chapter-card/ChapterCard';

export const Root: React.FC = () => (
  <Composition
    id="ChapterCard"
    component={ChapterCard}
    durationInFrames={120}
    fps={30}
    width={1920}
    height={1080}
    schema={chapterCardSchema}
    defaultProps={{
      chapter: 'The setup',
      number: '01',
      delay: 0,
      accent: true,
      numberColor: '#D96B82',
      color: '#F2F2F4',
      subtitleColor: '#8E8E98',
      numberFontSize: 32,
      titleFontSize: 96,
      fontFamily: '"Clash Display", sans-serif',
    }}
  />
);
```

## Motion notes

- **Pure composition.** `ChapterCard` doesn't run any of its own springs or interpolations — every beat is delegated to a primitive that already encodes the Onda fingerprint. The scene block's job is sequencing, not motion.
- **Sequence.** Number `FadeIn` starts at `delay`. The chapter title's `BlurReveal` starts at `delay + 10` so the eye reads the eyebrow first and then the title rises into its resting position. When `accent` is on, the rose `Underline` draws at `delay + 34` — punctuating the title as it settles. All beats use `DURATION.base` (18f) for the entrances and `DURATION.fast` (10f) for the line draw, keeping the timing vocabulary consistent with the rest of the catalog.
- **One accent moment.** The dusty rose is used in exactly two places — the number above and the rule below — both gated by the same `accent` flag, so the color reads as one earned moment rather than a sprinkle. Toggle `accent` off when the card is composed alongside another accent moment in the same shot.
- **Restraint by composition.** No glow, no chrome, no overshoot. The negative space and the calm cadence are the design.
- **Deterministic by construction.** Every child is a pure function of `useCurrentFrame()`; no state, no random, no date. Frame N is correct with zero knowledge of frame N-1.
