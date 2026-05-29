# Composing with Onda

The reference for assembling Onda components into scenes — and the contract an AI agent or brief-driven runtime follows when emitting Onda payloads. The interactive, human-facing component pages live under [/components](/components); this section is the assembly guide.

This page covers the **payload shape** and the **determinism rules**. The rest of the reference is split across:

- **[Placement & size](/docs/composing-placement)** — where components sit and how they scale.
- **[Timeline & transitions](/docs/composing-timeline)** — sequencing beats, cutting between scenes, and turning a payload into JSX with `<CompositionRenderer>`.
- **[Media & audio](/docs/composing-media)** — rendering user photos, video, and audio with the Onda contract.
- **[Agent helpers](/docs/composing-agent-helpers)** — JSON Schema, canvas presets, and registry summarization for agent runtimes.
- **[Theming](/docs/theming)** — re-skin components with your own brand (colors + fonts) via the CSS-variable contract.

For the full catalog of what's available, see [What's in Onda](/docs/catalog) and the live [components catalog](/components).

---

## Payload shape

Two recommended shapes — pick based on whether the scene has one component or many.

### Single-component payload

```ts
type Payload = {
  component: string;              // PascalCase Onda component name
  props: Record<string, unknown>; // validated against the component's Zod schema
};
```

### Timeline-shape payload (recommended for multi-component scenes)

```ts
type Composition = {
  fps: number;                    // typically 30
  width: number;                  // px, e.g. 1920 (horizontal), 1080 (vertical)
  height: number;                 // px
  tracks: Track[];                // parallel layers, rendered in order
};

type Track = {
  id?: string;
  entries: Entry[];               // sequential beats within this track
};

type Entry = {
  at: string | number;            // when this beat starts — "0:04" | "30s" | 4 (seconds) | 90 (raw seconds when number)
  for: string | number;           // duration — same time spec as `at`
  component: string;              // PascalCase Onda component name
  props: Record<string, unknown>;
};
```

The canvas envelope sits at the composition root (`fps` / `width` / `height`); each track is a parallel layer (think After Effects layers), and each entry is a beat on that track with explicit start time and duration. Beats within a track are sequential; tracks overlap in time.

Every Onda component is a pure function of `useCurrentFrame()` and `useVideoConfig()` — frame N is deterministic given the props and the canvas. The agent's job is to pick the right components, fill the props, and let Remotion render. Resolve which component to reach for from [What's in Onda](/docs/catalog).

---

## Determinism rules (always)

- All Onda components are pure functions of `useCurrentFrame()` and `useVideoConfig()`. Same payload + same frame = same pixels.
- Never pass `Date.now()`, `Math.random()`, or other non-deterministic values in props. Use seed-based variation if you need randomness (some components accept a `seed` prop).
- Wrap timed sections in `<Sequence from={...} durationInFrames={...}>`. Components respect parent `<Sequence>` remapping — their internal `useCurrentFrame()` reads relative to the sequence start.

See [Timeline & transitions](/docs/composing-timeline) for the full sequencing and rendering patterns.
