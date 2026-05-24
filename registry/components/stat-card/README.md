# StatCard

The flagship Onda data scene — a big counted-up number, a word-staggered qualifier label beneath it, and an earned-accent rule below that. `StatCard` is a scene block: it **composes** the existing primitives (`CountUp`, `WordStagger`, `Underline`) rather than reimplementing their motion, so a stat card carries the same fingerprint as every other Onda animation. The number lands first on `SPRING_SMOOTH`; the label cascades in a beat before the count fully settles so the eye flows from number to label without a dead pause; the accent rule draws last as final punctuation. One focal element per moment, in sequence — the signature "Onda data look" for hero stats, KPIs, milestones, and announcement frames.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `number` | `1247` | The final value the counter counts up to (from `0`). |
| `label` | `string` | `"creators this week"` | The qualifier beneath the number. Rendered with `WordStagger`. |
| `prefix` | `string` | `""` | Rendered before the number, e.g. `"$"`. |
| `suffix` | `string` | `""` | Rendered after the number, e.g. `"%"` or `"k"`. |
| `delay` | `integer ≥ 0` | `0` | Frames before the scene begins. |
| `accent` | `boolean` | `true` | Whether the dusty-rose accent rule renders beneath the label. |
| `numberFontSize` | `number` | `200` | Pixels. The number is the hero — large by default. Wins over `numberSize` if both are passed. |
| `numberSize` | `SizeRole?` | – | Semantic role for the number — `'hero'` \| `'heading'` \| `'subheading'` \| `'body'` \| `'caption'`. Resolves to canvas-aware pixels. `numberFontSize` wins when both are passed. |
| `labelFontSize` | `number` | `28` | Pixels. The label sits quietly under the number. Wins over `labelSize` if both are passed. |
| `labelSize` | `SizeRole?` | – | Semantic role for the label. `labelFontSize` wins when both are passed. |
| `color` | `string` | `"#F2F2F4"` | Number color — defaults to `--onda-text`. |
| `labelColor` | `string` | `"#8E8E98"` | Label color — defaults to `--onda-dim`. |
| `accentColor` | `string` | `"#D96B82"` | Accent rule color — defaults to `--onda-accent`. |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | The Onda display font. Never default to Inter / Arial / system. |
| `placement` | `Placement` | `'center'` | Where on the canvas the stat sits. Pass a region (`'center'`, `'upper-third'`, `'top-right'`, …) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. |

## Usage

```tsx
import { Composition } from 'remotion';
import { StatCard, statCardSchema } from './components/onda/stat-card/StatCard';

export const Root: React.FC = () => (
  <Composition
    id="MyStat"
    component={StatCard}
    durationInFrames={90}
    fps={30}
    width={1920}
    height={1080}
    schema={statCardSchema}
    defaultProps={{
      value: 1247,
      label: 'creators this week',
      prefix: '',
      suffix: '',
      delay: 0,
      accent: true,
      numberFontSize: 200,
      labelFontSize: 28,
      color: '#F2F2F4',
      labelColor: '#8E8E98',
      accentColor: '#D96B82',
      fontFamily: '"Clash Display", sans-serif',
    }}
  />
);
```

## Motion notes

- **Scene block — composes primitives, doesn't reimplement.** All three children (`CountUp`, `WordStagger`, `Underline`) keep their canonical `SPRING_SMOOTH` motion. The scene's only job is to choreograph *when* each child starts.
- **Cascade timing, derived from canonical tokens** in `lib/motion.ts` — no hardcoded frame counts:
  - Number: starts at `delay`, counts on `DURATION.slow` (24f ≈ 0.8s).
  - Label: starts at `delay + DURATION.slow - 2 * STAGGER` (~16f after the number begins) so words begin streaming in a beat *before* the count fully settles, eliminating the dead pause between number and label.
  - Rule: starts at `labelDelay + DURATION.base + 2 * STAGGER` (after the label has finished its cascade) — the rule is the closing punctuation, not part of the reveal itself.
- **The accent rule is text-aware.** Onda's `Underline` is intrinsically sized to its `text` prop's width; to draw a rule that's proportional to the label without re-rendering the label, the scene passes the same `label` text but with `color: "transparent"` so the glyphs are invisible and only the accent line reads. This means the rule width naturally matches the label above it — a small consistency win that hand-tuning a fixed width would never achieve.
- **One earned accent.** The dusty rose appears once: the rule. The number and label both stay in neutral text colors. Per the Onda accent rule (`CLAUDE.md` §2), color is earned, never sprinkled.
- **Deterministic.** Pure function of `useCurrentFrame()` via the children. No state, no random, no date.
