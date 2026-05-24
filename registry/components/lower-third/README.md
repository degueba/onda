# LowerThird

A broadcast-style identifier bar — name on top, role beneath, optional accent underline. The name slides in from the chosen corner, the role fades in 4 frames later, and the accent rule draws 8 frames after that. No banner, no glow, no chrome — just three composed primitives obeying the Onda motion language.

This is a **scene block**: it composes `SlideIn`, `FadeIn`, and `Underline` and does not reimplement any motion itself.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `name` | `string` | `"Rodrigo"` | The headline identifier. |
| `role` | `string` | `"CEO, Onda"` | The secondary line beneath the name. |
| `placement` | `Placement` | `'bottom-left'` | Where on the canvas the bar sits. Pass a region (`'bottom-left'`, `'bottom-right'`, `'top-left'`, …) or `{ x, y, anchor }` in 0..1 canvas fractions. Slide direction and inner alignment follow — bars on the right slide in from the right and align flush right. Coordinates may be negative or >1 for off-canvas. |
| `delay` | `integer ≥ 0` | `0` | Frames before the block starts revealing. |
| `accent` | `boolean` | `true` | Show the accent underline. Set to `false` for a quieter variant. |
| `color` | `string` | `"#F2F2F4"` | Name color — `--onda-text`. |
| `roleColor` | `string` | `"#8E8E98"` | Role color — `--onda-dim`. |
| `accentColor` | `string` | `"#D96B82"` | Underline color — `--onda-accent`. The one earned accent on the block. |
| `fontSize` | `number` | `48` | Name size in pixels. Wins over `nameSize` if both are passed. |
| `nameSize` | `SizeRole?` | – | Semantic role for the name — `'hero'` \| `'heading'` \| `'subheading'` \| `'body'` \| `'caption'`. Resolves to canvas-aware pixels. `fontSize` wins when both are passed. |
| `roleFontSize` | `number` | `22` | Role size in pixels. Wins over `roleSize` if both are passed. |
| `roleSize` | `SizeRole?` | – | Semantic role for the role line. `roleFontSize` wins when both are passed. |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | Onda display font. |

## Usage

```tsx
import { Composition } from 'remotion';
import { LowerThird, lowerThirdSchema } from './components/onda/lower-third/LowerThird';

export const Root: React.FC = () => (
  <Composition
    id="MyLowerThird"
    component={LowerThird}
    durationInFrames={90}
    fps={30}
    width={1920}
    height={1080}
    schema={lowerThirdSchema}
    defaultProps={{
      name: 'Rodrigo',
      role: 'CEO, Onda',
      placement: 'bottom-left',
      delay: 0,
      accent: true,
      color: '#F2F2F4',
      roleColor: '#8E8E98',
      accentColor: '#D96B82',
      fontSize: 48,
      roleFontSize: 22,
      fontFamily: '"Clash Display", sans-serif',
    }}
  />
);
```

## Composition notes

- **`SlideIn`** drives the name: direction `'left'` when placed on the left half of the canvas, `'right'` otherwise (derived from `placement`). Travel is the primitive's house default (16px) — small on purpose.
- **`FadeIn`** drives the role, with a delay of `delay + 4` frames — the canonical Onda stagger between siblings.
- **`Underline`** draws the accent rule with a delay of `delay + 8` frames. Rendered without text (the name above owns the typography); the primitive contributes only the line. Hidden entirely when `accent === false`.
- Positioning: handled by `PlacementBox`. The default `placement='bottom-left'` puts the bar near the bottom-left corner (10% safe margin); pass coordinates for anything else. The inner column aligns flex-start / flex-end to match which half of the canvas the bar sits on.
- The block does not introduce any new easing, spring, or color — every motion fingerprint comes from the primitives.

### Migration note

The previous `position: 'bottom-left' | 'bottom-right'` prop has been folded into `placement`. If you previously used `position="bottom-right"`, pass `placement="bottom-right"` instead. The default visual is preserved (`placement` defaults to `'bottom-left'`).
