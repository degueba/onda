# FadeOut

The inverse of `FadeIn`: a pure opacity exit. Opacity goes from 1 to 0 starting at `delay`, eased on `HOUSE_EASE`. No transform, no blur, no scale — just the cleanest possible way to remove an element from the frame. Slightly faster than entrances (`DURATION.fast`) so the moment ends without lingering. Restraint applied to exits as well.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | `string` | `"Onda"` | What to fade out. |
| `delay` | `integer ≥ 0` | `0` | Frames before the fade begins. |
| `duration` | `integer ≥ 1` | `DURATION.fast` (10) | Frames to reach opacity 0. Exits are quicker than entrances by design. |
| `color` | `string` | `"#F2F2F4"` | Text color — defaults to `--onda-text`. |
| `fontSize` | `number` | `96` | Pixels. |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | The Onda display font. Never default to Inter / Arial / system. |

## Usage

```tsx
import { Composition } from 'remotion';
import { FadeOut, fadeOutSchema } from './components/onda/fade-out/FadeOut';

export const Root: React.FC = () => (
  <Composition
    id="MyFadeOut"
    component={FadeOut}
    durationInFrames={60}
    fps={30}
    width={1080}
    height={1920}
    schema={fadeOutSchema}
    defaultProps={{
      text: 'Onda',
      delay: 30,
      duration: 10,
      color: '#F2F2F4',
      fontSize: 96,
      fontFamily: '"Clash Display", sans-serif',
    }}
  />
);
```

## Motion notes

- Pure opacity exit — no transform, no blur, no scale. Per `CLAUDE.md §4`, `HOUSE_EASE` on `interpolate` is the canonical curve for fades; physical motion would use a spring.
- Duration defaults to `DURATION.fast` (10 frames ≈ 0.33s at 30fps), shorter than the `DURATION.base` (18) used by entrances. Exits should clear the frame quickly so the next beat lands.
- Opacity clamps at both ends — frame 0 renders fully opaque, any frame past `delay + duration` renders fully transparent.
- Pair with `FadeIn` (and matching `delay`s via `<Sequence>`) for a complete enter-hold-exit cycle on a single element.
