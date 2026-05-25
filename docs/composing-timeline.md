# Timeline & transitions

How to sequence beats over time, cut between scenes, and turn a payload into rendered JSX. Part of the [Composing with Onda](/docs/composing-with-onda) reference.

## Use Remotion's primitives

Onda doesn't ship its own scene / track / beat primitives. Remotion's existing primitives cover every composition pattern an agent needs; Onda's value-add is the *components* on top, not the rendering substrate.

| Pattern | Remotion primitive |
| --- | --- |
| Composition root | `<Composition>` (set fps / width / height / durationInFrames) |
| Time-slice a child | `<Sequence from={frames} durationInFrames={frames}>` |
| Sequential children without manual frame math | `<Series>` + `<Series.Sequence durationInFrames={frames}>` |
| Sequential children **with crossfades** | `<TransitionSeries>` from `@remotion/transitions` |
| Parallel layers | Multiple children of `<AbsoluteFill>` |
| Repeat children | `<Loop>` |
| Freeze a child at a specific frame | `<Freeze frame={n}>` |

For agent-friendly time specs, use Onda's one timing helper: `toFrames(spec, fps)` from `lib/timing.ts`. Accepts `"M:SS"`, `"Ns"`, `"Nms"`, `"Nf"`, or a raw seconds number.

## Single-track sequential scene

A title lands, then a stat, then a lower-third — one after another on a single track:

```tsx
import { Series, AbsoluteFill } from 'remotion';
import { toFrames } from '@/lib/timing';

const { fps } = useVideoConfig();

<AbsoluteFill>
  <Series>
    <Series.Sequence durationInFrames={toFrames('0:02', fps)}>
      <TitleCard title="Setup" placement="center" />
    </Series.Sequence>
    <Series.Sequence durationInFrames={toFrames('0:03', fps)}>
      <StatCard value={1247} label="creators this week" placement="center" />
    </Series.Sequence>
    <Series.Sequence durationInFrames={toFrames('0:02', fps)}>
      <LowerThird name="Rodrigo" placement="bottom-right" />
    </Series.Sequence>
  </Series>
</AbsoluteFill>
```

## Multi-track overlapping scene

A persistent gradient background while typography beats pass over it — two parallel tracks:

```tsx
<AbsoluteFill>
  {/* Track 1: persistent background */}
  <GradientShift from="#0E0E12" to="#1C1C22" />

  {/* Track 2: sequential typography over it */}
  <Series>
    <Series.Sequence durationInFrames={toFrames('0:02', fps)}>
      <TitleCard title="Setup" placement="upper-third" />
    </Series.Sequence>
    <Series.Sequence durationInFrames={toFrames('0:03', fps)}>
      <StatCard value={1247} placement="center" />
    </Series.Sequence>
  </Series>
</AbsoluteFill>
```

## Sequential beats with crossfades

When the agent wants soft transitions between beats instead of hard cuts, use `<TransitionSeries>` from `@remotion/transitions` (separate Remotion package; install via `npm i @remotion/transitions`):

```tsx
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={toFrames('0:02', fps)}>
    <TitleCard title="Setup" placement="center" />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: toFrames('0:00.5', fps) })} />
  <TransitionSeries.Sequence durationInFrames={toFrames('0:03', fps)}>
    <StatCard value={1247} placement="center" />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

## Onda transitions (the house catalog)

The example above uses Remotion's stock `fade()`. Onda ships **15 transitions** that bake the house easing and timing into the cut, so scene-to-scene movement carries the same feel as the scenes themselves. Import a named transition from the installed `components/onda/transitions/<name>` and drop it into `<TransitionSeries.Transition presentation={…}>`:

- **Calm:** `crossFade` · `morph` · `dipToColor` · `blur`
- **Geometric:** `wipe` · `clockWipe` · `iris` · `flip`
- **Spatial:** `slide` · `push` · `depthPush`
- **Accent / high-energy:** `zoom` · `chromaticAberration` · `gridPixelate` · `glassWipe`

```tsx
import { Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { glassWipe } from './components/onda/transitions/glass-wipe/glassWipe';

<TransitionSeries.Transition
  presentation={glassWipe({ direction: 'left' })}
  timing={linearTiming({ durationInFrames: 18, easing: Easing.bezier(0.16, 1, 0.3, 1) })}
/>
```

Default to the calm register; reach for the high-energy accents (`chromaticAberration`, `gridPixelate`, `glassWipe`) as punctuation, not as the default cut. See them in motion in the [`dev-demo` showcase](/showcase/dev-demo).

## Mapping a timeline payload to JSX — use the shipped `<CompositionRenderer>`

The lib ships the canonical translator: import `<CompositionRenderer>` and pass your composition payload + a component registry. No need to hand-write the renderer.

```tsx
import { CompositionRenderer, compositionSchema, type Composition, type ComponentRegistry } from '@ondajs/lib';

// Per-consumer registry: bundle only what you've installed via `bunx ondajs add`.
import { BlurReveal, blurRevealSchema } from './components/onda/blur-reveal/BlurReveal';
import { TitleCard,  titleCardSchema  } from './components/onda/title-card/TitleCard';
import { StatCard,   statCardSchema   } from './components/onda/stat-card/StatCard';

const ondaRegistry: ComponentRegistry = {
  BlurReveal: { component: BlurReveal, schema: blurRevealSchema },
  TitleCard:  { component: TitleCard,  schema: titleCardSchema  },
  StatCard:   { component: StatCard,   schema: statCardSchema   },
};

const payload: Composition = {
  fps: 30, width: 1080, height: 1920,
  tracks: [
    { entries: [
      { at: '0:00', for: '0:02', component: 'TitleCard', props: { title: 'Hello' } },
      { at: '0:02', for: '0:03', component: 'StatCard',  props: { value: 1247 } },
    ]},
  ],
};

<Composition
  id="GeneratedScene"
  component={CompositionRenderer}
  durationInFrames={150}
  fps={payload.fps}
  width={payload.width}
  height={payload.height}
  defaultProps={{ composition: payload, registry: ondaRegistry }}
/>
```

What `<CompositionRenderer>` does for you:

1. Validates the composition via `compositionSchema.safeParse()`. A malformed payload renders a visible error placeholder at the canvas level — not a silent crash.
2. For each track, renders an `<AbsoluteFill>` (parallel layering — first track behind, last on top).
3. For each entry, wraps in `<Sequence from={toFrames(at, fps)} durationInFrames={toFrames(for, fps)}>` so time strings (`"0:04"`, `"30s"`) resolve to frames automatically.
4. Looks up `entry.component` in `registry`. Unknown name → entry-level error placeholder ("⚠ Unknown component: 'Foo'").
5. Validates `entry.props` against the looked-up component's Zod schema. Invalid → entry-level error placeholder with the validation message.

Per-entry errors don't crash the whole composition — only that entry's slot shows the placeholder.

**If you're using `bunx ondajs add`**, the CLI maintains a `components/onda/index.ts` barrel for you:

```tsx
// Auto-generated by the CLI — just import and pass:
import { ondaRegistry } from './components/onda';

<Composition component={CompositionRenderer} defaultProps={{ composition: payload, registry: ondaRegistry }} ... />
```

Pass `--no-barrel` to opt out (e.g., if you maintain a hand-curated registry).

## Want to write your own renderer?

If you need behavior the shipped `<CompositionRenderer>` doesn't cover (custom transitions between beats, conditional rendering, etc.), the underlying pattern is:

```tsx
function renderEntry(entry: Entry, fps: number, registry: ComponentRegistry) {
  const Component = registry[entry.component].component;
  return (
    <Sequence
      key={entry.id ?? entry.at}
      from={toFrames(entry.at, fps)}
      durationInFrames={toFrames(entry.for, fps)}
    >
      <Component {...entry.props} />
    </Sequence>
  );
}
```

Each track is its own `<AbsoluteFill>` (parallel layering); each entry within a track becomes a `<Sequence>` shifted to its `at` time. Same vocabulary `<CompositionRenderer>` uses internally — Remotion's primitives plus `toFrames`.
