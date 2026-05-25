# Timeline

A horizontal timeline data primitive. A thin line strokes itself on, then a dot lands at each anchor point with the canonical Onda stagger, then a label fades in beneath each dot. The final dot earns the dusty-rose accent — every other dot stays neutral, so the eye walks the line and lands on the present.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `points` | `{ label: string }[]` | `[{label:'Concept'},{label:'Build'},{label:'Ship'},{label:'Iterate'}]` | Anchor points along the line, left to right. |
| `delay` | `integer ≥ 0` | `0` | Frames before the line begins to draw. |
| `lineDuration` | `integer ≥ 1` | `DURATION.slow` (24) | Frames over which the line strokes on. |
| `dotDelay` | `integer ≥ 0` | `8` | Frames between the line completing and the first dot appearing. |
| `dotStagger` | `integer ≥ 0` | `STAGGER` (4) | Frames between consecutive dots. |
| `dotDuration` | `integer ≥ 1` | `DURATION.base` (18) | Per-dot entrance duration. |
| `dotSize` | `number` | `14` | Dot diameter in px. |
| `lineColor` | `string` | `"#26262E"` | Defaults to `--onda-border-lit`. |
| `dotColor` | `string` | `"#F2F2F4"` | Defaults to `--onda-text`. |
| `accentColor` | `string` | `"#D96B82"` | Defaults to `--onda-accent`. Applied only to the **last** dot. |
| `labelColor` | `string` | `"#8E8E98"` | Defaults to `--onda-dim`. |
| `fontSize` | `number` | `22` | Label size in px. |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | The Onda display font. Never default to Inter / Arial / system. |
| `placement` | `Placement?` | – | Where on the canvas this sits. Region (`"center"`, `"upper-third"`, …) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. |

## Usage

```tsx
import { Composition } from 'remotion';
import { Timeline, timelineSchema } from './components/onda/timeline/Timeline';

export const Root: React.FC = () => (
  <Composition
    id="MyTimeline"
    component={Timeline}
    durationInFrames={120}
    fps={30}
    width={1920}
    height={1080}
    schema={timelineSchema}
    defaultProps={{
      points: [
        { label: 'Concept' },
        { label: 'Build' },
        { label: 'Ship' },
        { label: 'Iterate' },
      ],
      delay: 0,
      lineDuration: 24,
      dotDelay: 8,
      dotStagger: 4,
      dotDuration: 18,
      dotSize: 14,
      lineColor: '#26262E',
      dotColor: '#F2F2F4',
      accentColor: '#D96B82',
      labelColor: '#8E8E98',
      fontSize: 22,
      fontFamily: '"Clash Display", sans-serif',
    }}
  />
);
```

## Motion notes

- **Line** uses `@remotion/paths`'s `evolvePath` driven by `SPRING_SMOOTH` (via Remotion's `spring`) — the same pattern as `DrawOn`. Lands at full length and stays. No overshoot.
- **Dots** compose `entryScale` from `lib/choreography.ts` with `delay = delay + lineDuration + dotDelay + i * dotStagger`. Spring-driven 0.9 → 1 scale, no bounce.
- **Labels** compose `entryFade`, trailing each dot by 2 frames so the dot reads as the lead and the label as its consequence.
- **One accent moment**: only the final dot uses `accentColor`. Every other dot is `dotColor`. The line is `lineColor`. The colour palette stays neutral so the rose lands.
- Container is `width: 80%; maxWidth: 1200` — without an explicit width the flex column collapses to its label content and the line vanishes.
- Deterministic: the entire scene is a pure function of `frame`. Safe to scrub, safe to render in parallel.
