# LogoSting

A silent, restrained branded reveal. An SVG logo stroke draws itself in, a title settles beneath it, and a single accent underline lands last. That is the entire show — no particles, no light streaks, no glitch, no spinning. The Onda logo-sting wins by what it doesn't do: it is the calmest sting in the catalog, and that restraint is the brand.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `d` | `string` | `"M 50 60 Q 100 20 150 60 T 250 60"` | The SVG path `d` attribute for the logo mark. The default is a gentle wave — Onda the wave. Pass a custom `d` (and matching `viewBox`) to swap in any logo path. |
| `title` | `string` | `"Onda"` | The wordmark rendered beneath the stroke. |
| `delay` | `integer ≥ 0` | `0` | Frames before the sting starts. |
| `accent` | `boolean` | `true` | Whether the accent rose underline draws after the title. The single earned color moment in the block; turn off for monochrome stings. |
| `viewBox` | `string` | `"0 0 300 120"` | SVG viewBox — must match the coordinate space of `d`. |
| `pathWidth` | `number` | `400` | Rendered width of the logo SVG in CSS pixels. |
| `pathHeight` | `number` | `160` | Rendered height of the logo SVG in CSS pixels. |
| `strokeWidth` | `number` | `3` | Logo stroke thickness, in `viewBox` units. |
| `stroke` | `string` | `"#F2F2F4"` | Logo stroke color — defaults to `--onda-text`. |
| `accentColor` | `string` | `"#D96B82"` | Underline color — defaults to `--onda-accent`, the signature dusty rose. |
| `titleFontSize` | `number` | `96` | Title size in px. |
| `color` | `string` | `"#F2F2F4"` | Title color — defaults to `--onda-text`. |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | The Onda display font. Never default to Inter / Arial / system. |

## Usage

```tsx
import { Composition } from 'remotion';
import { LogoSting, logoStingSchema } from './components/onda/logo-sting/LogoSting';

export const Root: React.FC = () => (
  <Composition
    id="MyLogoSting"
    component={LogoSting}
    durationInFrames={90}
    fps={30}
    width={1920}
    height={1080}
    schema={logoStingSchema}
    defaultProps={{
      d: 'M 50 60 Q 100 20 150 60 T 250 60',
      title: 'Onda',
      delay: 0,
      accent: true,
      viewBox: '0 0 300 120',
      pathWidth: 400,
      pathHeight: 160,
      strokeWidth: 3,
      stroke: '#F2F2F4',
      accentColor: '#D96B82',
      titleFontSize: 96,
      color: '#F2F2F4',
      fontFamily: '"Clash Display", sans-serif',
    }}
  />
);
```

## Motion notes

- **Three composed primitives — nothing else.** This block imports `DrawOn`, `ScaleIn`, and `Underline`. All motion lives inside those primitives; the block only chooses offsets and lays them out vertically inside an `<AbsoluteFill>`. If you find yourself reaching for a sparkle, a light streak, a particle field, a glitch, or any "wow flourish" — delete it. The restraint is the point.
- **Choreography.** The stroke begins at `delay`. The title begins at `delay + 18`, so it starts to materialize while the stroke is on its final approach — the two reveals feel linked rather than sequential. The accent underline lands last at `delay + 34`, so the eye reads *mark → word → accent* in that exact order. One earned beat per element, no overlap-noise.
- **The accent is earned, once.** Per CLAUDE.md §3 the dusty rose is used sparingly. The underline is the single accent moment in this block, and the `accent` prop turns it off entirely for a monochrome variant.
- **No overshoot. No bounce.** All motion runs on `SPRING_SMOOTH` via the composed primitives. The stroke lands and stays. The title settles. The underline draws in. Nothing whips, nothing wobbles, nothing re-enters.
- **Deterministic.** Pure function of `useCurrentFrame()`. No state, no effects, no randomness — every frame renders correctly in isolation.
