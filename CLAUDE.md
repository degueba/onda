# CLAUDE.md — Onda

> Operational contract for every agent and contributor building Onda. Read fully before generating anything. If a request conflicts with these rules, the rules win. When in doubt, choose restraint.

**See also:** [README.md](README.md) · [docs/](docs/) · [docs/techspecs/](docs/techspecs/)

Onda is a Remotion-based motion graphics library: component source is copied into the user's project via our own thin CLI (`npx ondajs add <name>`), never imported as a black-box dependency. The differentiator is a **signature motion identity**: a consistent set of motion fingerprints, applied across ordinary components, that makes an Onda animation recognizable by feel. Full context: [docs/vision.md](docs/vision.md), [docs/design-philosophy.md](docs/design-philosophy.md), [docs/motion-language.md](docs/motion-language.md).

-----

## 1. Hard technical rules (non-negotiable — violating these breaks renders)

Remotion renders deterministically: the same frame must always produce the same pixels.

- **NEVER use `Math.random()`, `Date.now()`, `new Date()`,** or any non-deterministic value in render. Need randomness? Derive it from a seed prop via a pure function keyed off `frame`/index.
- **NEVER use `useState`/`useEffect` to drive animation.** All motion is a pure function of `useCurrentFrame()`. State/effects are for nothing visual.
- **Read time via `useCurrentFrame()` and config via `useVideoConfig()`** — never assume fps or dimensions.
- A component must render **frame N correctly with zero knowledge of frames 0…N-1.**
- **SSR-safe:** no `window`/`document` access during render without a guard.
- Wrap timed sections in `<Sequence>`; use `<AbsoluteFill>` for full-canvas layers.
- Audio/video go through `@remotion/media`, used correctly.

-----

## 2. Design tokens (locked — use these exact values)

**In-code canonical source:** [lib/tokens.ts](lib/tokens.ts). The values below mirror it; divergence is a bug.

These power BOTH the docs site and the default look of components. Expose them as CSS variables / a theme object; never hardcode raw values when a token exists.

### Color

```
--onda-bg          #08080A   /* near-black canvas — motion reads best on dark */
--onda-surface     #0E0E12   /* cards, raised surfaces */
--onda-surface-2   #121217   /* secondary surface */
--onda-border      #1C1C22
--onda-border-lit  #26262E   /* hover / focus borders */
--onda-text        #F2F2F4   /* primary text */
--onda-dim         #8E8E98   /* secondary text */
--onda-faint       #56565F   /* labels, captions, code prompts */
--onda-accent      #D96B82   /* THE accent — muted dusty rose. Used sparingly. */
--onda-accent-soft #E89AAB   /* lighter step, subtle depth only */
```

**Color rule:** the accent is used *sparingly* — one headline word, a number, an underline, a CTA, a single glow. Everything else is neutral. Color is earned, never sprinkled.

### Type

```
Display / headings:  "Clash Display"  (characterful geometric; weights 500–600)
Body / UI / mono:    "Space Grotesk"  (clean, technical; weights 400–600)
```

- Headlines: tight letter-spacing (-0.02 to -0.04em), weight 600.
- Labels / code / captions: Space Grotesk, uppercase for eyebrows, letter-spacing ~0.06–0.16em.
- Components accept `fontFamily` as a prop; default to Clash Display. **Never** default to Inter/Roboto/Arial/system fonts (those read as generic AI defaults).

### Spacing

- 8px base scale (8/16/24/32/48/64/80/100).
- Scene-block safe margins: ~10% of canvas per edge. Negative space is part of the identity.

### Surface polish

- Cards: subtle top sheen (1px white-alpha gradient), soft deep shadow (`0 30px 60px -34px rgba(0,0,0,0.9)`), 1px border, ~20px radius.
- One restrained accent glow per major section max — depth, not decoration.
- Optional ~2% grain overlay for texture. Never busy.

-----

## 3. Motion essentials

Full motion philosophy and rationale: [docs/motion-language.md](docs/motion-language.md). The minimum every agent must apply on every component:

- **Prefer `spring()`** over linear `interpolate` for position/scale/rotation. House config (smooth, settled, **no overshoot**):

  ```ts
  spring({ frame, fps, config: { damping: 200, stiffness: 100, mass: 1 } })
  ```

  Never reduce damping for a "pop" unless the component explicitly documents why.
- **For opacity/color fades,** use `interpolate` with `Easing.bezier(0.16, 1, 0.3, 1)`. Never raw linear for anything the eye tracks.
- Always pass `extrapolateLeft: 'clamp'` and `extrapolateRight: 'clamp'` to `interpolate` unless intentionally extending the range.
- **Timing at 30fps:** entrances 18–28 frames, exits 12–18, stagger 3–5 frames between siblings. Travel 12–24px, not 80px.
- **One focal element per moment.** If two things compete, stagger them with `<Sequence>`. Never hardcode frame offsets inside a component to fake sequencing.
- **When in doubt, calmer and more minimal.** Bouncy, busy, or default-linear is wrong even if technically correct. Restraint IS the brand.

-----

## 4. Component contract

Full reference implementation: [docs/component-reference.md](docs/component-reference.md). The shape every component MUST match:

```
registry/components/<component-name>/
  <ComponentName>.tsx          # the component
  schema.ts                    # Zod schema for props
  <component-name>.meta.json   # registry metadata (name, description, category, deps, tags)
  README.md                    # one-paragraph description + prop table + usage snippet
```

**Every component MUST:**

1. Export a default React component, PascalCase name.
2. Export a **Zod schema** for its props (also our future training-data schema — treat it as first-class). Derive the TS type with `z.infer`.
3. Provide **premium defaults for every prop** using the tokens in §2, so it looks stunning with zero configuration.
4. Be **self-contained** — no imports from other Onda components except documented shared primitives/utilities.
5. Include a realistic usage snippet in its README, shown inside a `<Composition>` or `<Sequence>`.
6. Obey §1 (hard rules) and §3 (motion essentials) without exception.
7. Register itself in the root `registry.json`.

-----

## 5. Workflow rules for parallel agents

- **One component per task/branch.** Never edit two components in one pass.
- **Pattern-match the reference component** ([docs/component-reference.md](docs/component-reference.md)) exactly — same file structure, same export shape, Zod-first.
- **Obey §1 and §3 without exception.** Unsure about a timing/easing value? Default to the house values rather than inventing new ones — coherence beats novelty.
- **Use the tokens (§2)** for all default colors, fonts, spacing.
- **Add a `registry.json` entry** for every new component.
- **Per-initiative work lives under [docs/techspecs/](docs/techspecs/).** Don't create one-off design docs at the repo root.

### Self-check before finishing

1. Deterministic? (no random/date/state)
2. Looks great with default props alone?
3. Carries the Onda signature — calm, restrained, one clear move, no overshoot?
4. Zod schema complete, premium token-based defaults?
5. Self-contained, registered, README with usage snippet?

**When in doubt, make it calmer and more minimal, not flashier.** A component that feels busy or bouncy is wrong even if technically correct. Onda's restraint IS the brand.
