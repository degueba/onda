# StaggerGroup

A composition primitive that reveals a list of items in sequence using the canonical Onda stagger — 4 frames between siblings. Each item rises 12px and fades in on `SPRING_SMOOTH` with no overshoot, offset by `staggerFrames(i, stagger)` so the eye reads the cascade as one continuous beat. The foundation pattern for animated lists, bullet build-ons, feature reveals, and any sequenced text reveal — the signature Onda stagger fingerprint in its purest form.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | `string[]` | `['Less is more', 'Calm is power', 'Motion has a feel', 'Made to be edited']` | The list of strings to reveal in order. |
| `delay` | `integer >= 0` | `0` | Frames before the FIRST item starts. |
| `stagger` | `integer >= 0` | `STAGGER` (4) | Frames between siblings. The canonical Onda stagger — don't change unless you have a reason. |
| `duration` | `integer >= 1` | `DURATION.base` (18) | Per-item reveal duration. |
| `direction` | `'column' \| 'row'` | `'column'` | Flex direction. Use `'row'` for inline tag lists; `'column'` for stacked bullets. |
| `gap` | `integer >= 0` | `16` | Pixels between items. |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Cross-axis alignment + text alignment. |
| `color` | `string` | `'#F2F2F4'` | Text color — defaults to `--onda-text`. |
| `fontSize` | `number` | `48` | Pixels. Smaller than `BlurReveal` because lists already feel large. |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | The Onda display font. Never default to Inter / Arial / system. |

## Usage

```tsx
import { Composition } from 'remotion';
import { StaggerGroup, staggerGroupSchema } from './components/onda/stagger-group/StaggerGroup';

export const Root: React.FC = () => (
  <Composition
    id="MyList"
    component={StaggerGroup}
    durationInFrames={90}
    fps={30}
    width={1080}
    height={1920}
    schema={staggerGroupSchema}
    defaultProps={{
      items: ['Less is more', 'Calm is power', 'Motion has a feel', 'Made to be edited'],
      delay: 0,
      stagger: 4,
      duration: 18,
      direction: 'column',
      gap: 16,
      align: 'center',
      color: '#F2F2F4',
      fontSize: 48,
      fontFamily: '"Clash Display", sans-serif',
    }}
  />
);
```

## Motion notes

- Each item composes `entryFadeRise` from `lib/choreography.ts` — the workhorse Onda entrance (opacity + 12px translateY on `SPRING_SMOOTH`, no overshoot). The primitive does not reinvent translate-fade locally; it stays a thin composition over the canonical pattern.
- Per-item timing comes from `staggerFrames(i, stagger)` in `lib/motion.ts`, with `stagger` defaulting to the canonical `STAGGER = 4` frames. This is the same stagger used in `WordStagger` — keeping one cascade rhythm across the library is what makes the fingerprint readable.
- This is **not** a `<Sequence>`-based component. Every item renders on every frame; per-item visibility is driven by the staggered local frame passed into `entryFadeRise`. That keeps the component a pure function of `useCurrentFrame()` — frame N is correct with zero knowledge of frame N-1.
- Items render as `inline-block` `<span>`s so the `translateY` from `entryFadeRise` actually applies (inline elements ignore `transform`).
- `align='center'` sets both `alignItems` (flex cross-axis) and `textAlign`, so multi-line items in `direction='row'` mode still read centered.
- All `interpolate` calls inside `entryFadeRise` clamp at both ends — items are correct before they start and after they've fully settled.
