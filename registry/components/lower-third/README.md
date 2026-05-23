# LowerThird

A broadcast-style identifier bar — name on top, role beneath, optional accent underline. The name slides in from the chosen corner, the role fades in 4 frames later, and the accent rule draws 8 frames after that. No banner, no glow, no chrome — just three composed primitives obeying the Onda motion language.

This is a **scene block**: it composes `SlideIn`, `FadeIn`, and `Underline` and does not reimplement any motion itself.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `name` | `string` | `"Rodrigo"` | The headline identifier. |
| `role` | `string` | `"CEO, Onda"` | The secondary line beneath the name. |
| `position` | `'bottom-left' \| 'bottom-right'` | `'bottom-left'` | Which corner the bar anchors to. Slide direction follows. |
| `delay` | `integer ≥ 0` | `0` | Frames before the block starts revealing. |
| `accent` | `boolean` | `true` | Show the accent underline. Set to `false` for a quieter variant. |
| `color` | `string` | `"#F2F2F4"` | Name color — `--onda-text`. |
| `roleColor` | `string` | `"#8E8E98"` | Role color — `--onda-dim`. |
| `accentColor` | `string` | `"#D96B82"` | Underline color — `--onda-accent`. The one earned accent on the block. |
| `fontSize` | `number` | `48` | Name size in pixels. |
| `roleFontSize` | `number` | `22` | Role size in pixels. |
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
      position: 'bottom-left',
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

- **`SlideIn`** drives the name: direction `'left'` when anchored bottom-left, `'right'` when anchored bottom-right. Travel is the primitive's house default (16px) — small on purpose.
- **`FadeIn`** drives the role, with a delay of `delay + 4` frames — the canonical Onda stagger between siblings.
- **`Underline`** draws the accent rule with a delay of `delay + 8` frames. Rendered without text (the name above owns the typography); the primitive contributes only the line. Hidden entirely when `accent === false`.
- Positioning: absolutely placed 32px from the bottom and 32px from the chosen horizontal edge. The inner column aligns flex-start / flex-end to match the anchor.
- The block does not introduce any new easing, spring, or color — every motion fingerprint comes from the primitives.
