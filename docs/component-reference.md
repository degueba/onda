# Component reference

## File structure (every component outputs this exact shape)

```
registry/components/<component-name>/
  <ComponentName>.tsx          # the component
  schema.ts                    # Zod schema for props
  <component-name>.meta.json   # registry metadata (name, description, category, deps, tags)
  README.md                    # one-paragraph description + prop table + usage snippet
```

## Every component MUST

1. Export a default React component, PascalCase name.
2. Export a **Zod schema** for its props (this is also our future training-data schema — treat it as first-class). Derive the TS type with `z.infer`.
3. Provide **premium defaults for every prop** so it looks stunning with zero configuration, using the design tokens from [../CLAUDE.md](../CLAUDE.md).
4. Be **self-contained** — no imports from other Onda components except documented shared primitives/utilities.
5. Include a realistic usage snippet in its README, shown inside a `<Composition>` or `<Sequence>`.
6. Obey the [motion language](motion-language.md) and the hard technical rules in [../CLAUDE.md](../CLAUDE.md) without exception.
7. Register itself in the root `registry.json`.

## Reference implementation — pattern-match this exactly

```tsx
// registry/components/blur-reveal/BlurReveal.tsx
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { z } from 'zod';

export const blurRevealSchema = z.object({
  text: z.string().default('Onda'),
  delay: z.number().int().min(0).default(0),       // frames before start
  duration: z.number().int().min(1).default(20),   // frames to fully reveal
  color: z.string().default('#F2F2F4'),            // --onda-text
  fontSize: z.number().default(96),
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

export type BlurRevealProps = z.infer<typeof blurRevealSchema>;

export const BlurReveal: React.FC<BlurRevealProps> = ({
  text, delay, duration, color, fontSize, fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - delay);

  // spring-driven rise + opacity + blur falloff = the restrained Onda feel.
  // No overshoot; small travel; calm settle.
  const progress = spring({
    frame: local,
    fps,
    config: { damping: 200, stiffness: 100, mass: 1 },
    durationInFrames: duration,
  });

  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const blur = interpolate(progress, [0, 1], [10, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const translateY = interpolate(progress, [0, 1], [16, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <div style={{
      opacity,
      filter: `blur(${blur}px)`,
      transform: `translateY(${translateY}px)`,
      color, fontSize, fontFamily, fontWeight: 600,
    }}>
      {text}
    </div>
  );
};
```

This is the bar: deterministic, spring-driven, no overshoot, Zod-typed, premium token-based defaults, themeable, self-contained.
