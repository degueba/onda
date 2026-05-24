# Captions

Sequential word-by-word captions driven by a timed array. Each caption has a `startMs` and `endMs`; the currently-active word sits in `--onda-text` with a subtle `SPRING_SMOOTH` scale pulse on activation, while surrounding words sit dim in `--onda-dim`. The data primitive for kinetic transcripts, AI-generated voiceover, and short-form captions — designed to consume the same `{ text, startMs, endMs }` shape every speech-to-text tool already speaks.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `captions` | `{ text: string; startMs: number; endMs: number }[]` | three-word "Onda kinetic captions" sample | Word timing in milliseconds. Authored in ms so transcripts from STT pipelines drop in directly. |
| `delay` | `integer ≥ 0` | `0` | Frames before the timeline starts (lets a parent `<Sequence>` align the audio bed). |
| `color` | `string` | `"#8E8E98"` | Inactive word color — `--onda-dim`. |
| `accentColor` | `string` | `"#F2F2F4"` | Active word color — `--onda-text`. Note: the contrast moment is brightness, not the rose accent — captions appear in batches and a rose pulse on every word would burn the eye. |
| `fontSize` | `number` | `96` | Pixels. |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | The Onda display font. Never default to Inter / Arial / system. |
| `fontWeight` | `number` | `600` | Display weight. |
| `letterSpacing` | `string` | `"normal"` | CSS letter-spacing. |
| `lineHeight` | `number` | `1.15` | Unitless line height. |
| `align` | `"left" \| "center" \| "right"` | `"center"` | Caption block alignment. |
| `placement` | `Placement?` | – | Where on the canvas this sits. Region (`"center"`, `"upper-third"`, …) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. |

## Usage

```tsx
import { Composition } from 'remotion';
import { Captions, captionsSchema } from './components/onda/captions/Captions';

export const Root: React.FC = () => (
  <Composition
    id="MyCaptions"
    component={Captions}
    durationInFrames={150}
    fps={30}
    width={1080}
    height={1920}
    schema={captionsSchema}
    defaultProps={{
      captions: [
        { text: 'Onda', startMs: 0, endMs: 1500 },
        { text: 'kinetic', startMs: 1500, endMs: 3000 },
        { text: 'captions', startMs: 3000, endMs: 4500 },
      ],
      delay: 0,
      color: '#8E8E98',
      accentColor: '#F2F2F4',
      fontSize: 96,
      fontFamily: '"Clash Display", sans-serif',
      fontWeight: 600,
    }}
  />
);
```

## Motion notes

- Activation pulse is `SPRING_SMOOTH` from `lib/motion.ts` — the Onda house spring. **No overshoot.** The active word lifts by 4% (1.0 → 1.04) over the first 4 frames of activation, then holds.
- Timing is authored in **milliseconds** and converted via `useVideoConfig().fps` — the component is correct at any framerate.
- Inactive words sit at `opacity: 0.7` to make the active word read as the focal point without making surrounding context disappear (so the eye still knows the sentence shape).
- All `interpolate` calls clamp at both ends; the active-word lookup is a pure function of the current ms, so any frame renders correctly without knowing prior frames.
- Active state is a brightness contrast (`--onda-dim` → `--onda-text`), not a rose-accent flash. Captions arrive constantly; reserving rose here would burn the brand's earned-accent rule.
