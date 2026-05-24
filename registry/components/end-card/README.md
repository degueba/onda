# EndCard

The closing scene block. A hero call-to-action reveals with the canonical Onda blur-rise, an accent-rose underline draws beneath it as the headline settles, and a faint, staggered row of social handles or URLs fades in last — so the eye finishes on the contact strip. Composed from `BlurReveal`, `Underline`, and `StaggerGroup` so the motion fingerprint matches every other Onda surface; no new motion is invented here.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `cta` | `string` | `"Made with Onda"` | The headline / call-to-action. |
| `handles` | `string[]` | `['@onda.video', 'onda.video/components']` | Social handles, URLs, or any short contact strings. Rendered as a horizontal staggered row. |
| `delay` | `integer >= 0` | `0` | Frames before the CTA starts. The whole card is sequenced relative to this. |
| `accent` | `boolean` | `true` | When `true`, the CTA renders through `Underline` so the accent-rose line draws beneath it. When `false`, the CTA renders through `BlurReveal` alone. |
| `ctaFontSize` | `number` | `96` | Pixels — the CTA is the focal element. |
| `handlesFontSize` | `number` | `24` | Pixels — the handles row is supporting metadata, not headline. |
| `color` | `string` | `"#F2F2F4"` | CTA color — defaults to `--onda-text`. |
| `handlesColor` | `string` | `"#56565F"` | Handles color — defaults to `--onda-faint` so the row reads as a quiet caption. |
| `accentColor` | `string` | `"#D96B82"` | Underline color — defaults to `--onda-accent`. The one earned color moment on the card. |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | The Onda display font, applied to both CTA and handles for tonal consistency. |

## Usage

```tsx
import { Composition } from 'remotion';
import { EndCard, endCardSchema } from './components/onda/end-card/EndCard';

export const Root: React.FC = () => (
  <Composition
    id="EndCard"
    component={EndCard}
    durationInFrames={120}
    fps={30}
    width={1920}
    height={1080}
    schema={endCardSchema}
    defaultProps={{
      cta: 'Made with Onda',
      handles: ['@onda.video', 'onda.video/components'],
      delay: 0,
      accent: true,
      ctaFontSize: 96,
      handlesFontSize: 24,
      color: '#F2F2F4',
      handlesColor: '#56565F',
      accentColor: '#D96B82',
      fontFamily: '"Clash Display", sans-serif',
    }}
  />
);
```

## Motion notes

- **Pure composition.** `EndCard` doesn't run any of its own springs or interpolations — every beat is delegated to a primitive that already encodes the Onda fingerprint. The scene block's job is sequencing, not motion.
- **Sequence.** CTA enters at `delay`. The accent underline starts drawing at `delay + DURATION.base - 4` (just as the CTA settles, so the line and headline land together). The handles row begins its stagger at `delay + DURATION.base + 6` — a small beat of breathing room before the closing metadata strip.
- **Accent toggle.** Setting `accent={false}` swaps the `Underline` for a bare `BlurReveal` so the CTA reveals without the accent line — useful when the card is composed alongside another accent moment in the same shot and you want the dusty rose to stay earned (one per moment).
- **Handles as a row.** The handles use `StaggerGroup` with `direction='row'`, the canonical 4-frame stagger, and `--onda-faint` so the row reads as a quiet caption. Each handle gets one beat — no animated separators, no scrolling marquee — so the eye finishes on a settled strip rather than continuous motion.
- **Deterministic by construction.** Every child is a pure function of `useCurrentFrame()`; no state, no random, no date. Frame N is correct with zero knowledge of frame N-1.
