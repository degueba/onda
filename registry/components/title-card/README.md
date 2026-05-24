# TitleCard

The hero title-card scene block: a large headline reveals with a calm blur-and-rise, a subtitle cascades word-by-word beneath it, and an optional accent underline lands last as quiet punctuation. A pure composition of three Onda primitives — `BlurReveal` (or `Underline`, when accent is on) for the title, `WordStagger` for the subtitle, and `Underline` for the rule. TitleCard introduces no motion of its own; the primitives carry the Onda signature.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | `string` | `"Onda"` | The hero headline. |
| `subtitle` | `string` | `"premium motion graphics for Remotion"` | Reads beneath the title; cascades word-by-word. |
| `delay` | `integer ≥ 0` | `0` | Frames before the title starts. The subtitle and underline derive their delays from this. |
| `accent` | `boolean` | `true` | When true, the title carries an underline in `--onda-accent` that draws in after the subtitle. |
| `titleFontSize` | `number` | `160` | Pixels. Wins over `titleSize` if both are passed. |
| `titleSize` | `SizeRole?` | – | Semantic role for the title — `'hero'` \| `'heading'` \| `'subheading'` \| `'body'` \| `'caption'`. Resolves to canvas-aware pixels. `titleFontSize` wins when both are passed. |
| `subtitleFontSize` | `number` | `32` | Pixels. Wins over `subtitleSize` if both are passed. |
| `subtitleSize` | `SizeRole?` | – | Semantic role for the subtitle. `subtitleFontSize` wins when both are passed. |
| `color` | `string` | `"#F2F2F4"` | Title text — defaults to `--onda-text`. |
| `subtitleColor` | `string` | `"#8E8E98"` | Subtitle text — defaults to `--onda-dim`. |
| `accentColor` | `string` | `"#D96B82"` | Underline color — `--onda-accent`. The one earned-color moment per CLAUDE.md §3. |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | The Onda display font. |
| `placement` | `Placement` | `'center'` | Where on the canvas the card sits. Pass a region (`'center'`, `'upper-third'`, `'top-right'`, …) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. |

## Usage

```tsx
import { Composition } from 'remotion';
import { TitleCard, titleCardSchema } from './components/onda/title-card/TitleCard';

export const Root: React.FC = () => (
  <Composition
    id="OndaTitleCard"
    component={TitleCard}
    durationInFrames={150}
    fps={30}
    width={1920}
    height={1080}
    schema={titleCardSchema}
    defaultProps={{
      title: 'Onda',
      subtitle: 'premium motion graphics for Remotion',
      delay: 0,
      accent: true,
      titleFontSize: 160,
      subtitleFontSize: 32,
      color: '#F2F2F4',
      subtitleColor: '#8E8E98',
      accentColor: '#D96B82',
      fontFamily: '"Clash Display", sans-serif',
    }}
  />
);
```

## Motion notes

- Pure composition. All motion is inherited from `BlurReveal`, `WordStagger`, and `Underline` — `SPRING_SMOOTH`, no overshoot, 16px travel, canonical 4-frame stagger.
- Sequencing: title at `delay`, subtitle at `delay + 24` frames (title has landed), underline at `delay + 40` frames (subtitle is reading). The eye gets one clear move per moment.
- No glow, no particles, no extra flourish. The restraint of the composed primitives is the brand — TitleCard adds layout, not motion.
- `accent: false` swaps the underlined title for a plain `BlurReveal` so the card still reads as Onda without the earned-color moment.
