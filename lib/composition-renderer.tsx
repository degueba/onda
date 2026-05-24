// The canonical Onda composition renderer — translates the timeline-shape
// payload (`Composition` from `./composition.ts`) into Remotion JSX.
//
// Consumers (Studio, brief renderers, any agent runtime) pass:
//   - `composition`: the validated payload
//   - `registry`: a lookup table mapping component-name strings to the
//     React component + its Zod props schema. Consumers bundle only what
//     they've installed.
//
// What the renderer does:
//   1. Validates the composition shape via `compositionSchema.safeParse()`.
//   2. For each track, renders an `<AbsoluteFill>` (parallel layering —
//      first track behind, last on top).
//   3. For each entry inside a track, wraps in `<Sequence from={...}>`
//      using `toFrames()` for time-string parsing.
//   4. Looks up `entry.component` in `registry`. Unknown name → visible
//      error placeholder, NOT a crash.
//   5. Validates `entry.props` against the looked-up component's schema.
//      Invalid → visible error placeholder, NOT a crash.
//
// Per [[remotion-built-ins-first]]: composes `<AbsoluteFill>`, `<Sequence>`,
// and `useVideoConfig` directly. No reinvention of rendering machinery —
// the value-add is the consistent, validated, agent-debuggable translation
// from payload to JSX.

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { compositionSchema, type Composition, type Entry } from './composition';
import { toFrames } from './timing';

/**
 * Component registry — maps `Entry.component` strings to the React
 * component and its Zod props schema. Consumers bundle only what they've
 * installed.
 *
 * @example
 * import { BlurReveal, blurRevealSchema } from './components/onda/blur-reveal/BlurReveal';
 * import { TitleCard, titleCardSchema } from './components/onda/title-card/TitleCard';
 *
 * const registry: ComponentRegistry = {
 *   BlurReveal: { component: BlurReveal, schema: blurRevealSchema },
 *   TitleCard:  { component: TitleCard,  schema: titleCardSchema  },
 * };
 */
export type ComponentRegistry = Record<
  string,
  {
    component: React.ComponentType<any>;
    schema: z.ZodTypeAny;
  }
>;

export type CompositionRendererProps = {
  /** The composition payload to render. Validated at runtime. */
  composition: Composition;
  /** Map of component-name → React component + props schema. Consumer-supplied. */
  registry: ComponentRegistry;
};

/**
 * Renders an Onda timeline composition. Drop in as the root component of a
 * Remotion `<Composition>`, or as a child anywhere — the renderer respects
 * its enclosing `useVideoConfig()` for `fps`.
 *
 * @example
 * <Composition
 *   id="GeneratedScene"
 *   component={CompositionRenderer}
 *   durationInFrames={300}
 *   fps={30}
 *   width={1080}
 *   height={1920}
 *   defaultProps={{ composition: agentPayload, registry: ondaRegistry }}
 * />
 */
export const CompositionRenderer: React.FC<CompositionRendererProps> = ({
  composition,
  registry,
}) => {
  // Top-level validation. A malformed composition is a renderer-level
  // error — show a single placeholder filling the canvas rather than
  // attempting to recover.
  const result = compositionSchema.safeParse(composition);
  if (!result.success) {
    return (
      <ErrorPlaceholder
        kind="composition"
        message={result.error.message}
      />
    );
  }
  const validated = result.data;

  return (
    <AbsoluteFill>
      {validated.tracks.map((track, trackIndex) => (
        <AbsoluteFill key={track.id ?? trackIndex}>
          {track.entries.map((entry, entryIndex) => (
            <EntrySlot
              key={entry.id ?? `${trackIndex}-${entryIndex}`}
              entry={entry}
              registry={registry}
            />
          ))}
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

// Wraps a single entry in `<Sequence>` shifted to its `at` time and clipped
// to its `for` duration. Resolves time specs against the enclosing
// `useVideoConfig().fps` via `toFrames()`.
const EntrySlot: React.FC<{
  entry: Entry;
  registry: ComponentRegistry;
}> = ({ entry, registry }) => {
  const { fps } = useVideoConfig();
  const fromFrames = toFrames(entry.at, fps);
  const durationFrames = toFrames(entry.for, fps);

  return (
    <Sequence from={fromFrames} durationInFrames={durationFrames}>
      <EntryComponent entry={entry} registry={registry} />
    </Sequence>
  );
};

// Looks up the entry's component in the registry and validates its props.
// Either failure mode renders a visible, agent-debuggable placeholder.
const EntryComponent: React.FC<{
  entry: Entry;
  registry: ComponentRegistry;
}> = ({ entry, registry }) => {
  const registered = registry[entry.component];

  if (!registered) {
    return (
      <ErrorPlaceholder
        kind="missing"
        message={`Unknown component: '${entry.component}'. Make sure it's in the registry passed to <CompositionRenderer registry={...}>.`}
      />
    );
  }

  const propsResult = registered.schema.safeParse(entry.props);
  if (!propsResult.success) {
    return (
      <ErrorPlaceholder
        kind="props"
        message={`Invalid props for '${entry.component}': ${propsResult.error.message}`}
      />
    );
  }

  const Component = registered.component;
  return <Component {...propsResult.data} />;
};

// Visible debuggable error panel. Renders inside whatever wrapper called
// it — fills the canvas at composition level; fills the Sequence slot at
// entry level. Uses Onda's color tokens (border-lit + accent-soft) so it
// reads as intentional, not a CSS reset bug.
const ErrorPlaceholder: React.FC<{
  kind: 'composition' | 'missing' | 'props';
  message: string;
}> = ({ kind, message }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#26262E', // --onda-border-lit
        color: '#E89AAB',           // --onda-accent-soft
        padding: 24,
        fontFamily: '"Space Grotesk", monospace',
        fontSize: 14,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 8,
      }}
    >
      <div
        style={{
          opacity: 0.6,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontSize: 11,
        }}
      >
        ⚠ Onda render error · {kind}
      </div>
      <div style={{ maxWidth: '80%', wordBreak: 'break-word' }}>{message}</div>
    </AbsoluteFill>
  );
};
