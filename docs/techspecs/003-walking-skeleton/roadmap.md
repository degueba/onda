# Roadmap — Techspec 003

Execution plan for [design.md](design.md). Each milestone has explicit acceptance criteria. Update statuses as work lands.

## M1 — Repo scaffolding — Done

Stand up the runnable Remotion project: `package.json`, `tsconfig.json`, `.gitignore`, `remotion.config.ts`, a minimal `src/Root.tsx`.

**Acceptance:**

- `pnpm install` succeeds. ✅ (227 packages resolved, 4.3s, exit 0; Remotion 4.0.465 + React 18.3.1 + Zod 3.25.76 + TS 5.9.3)
- `pnpm dev` (or equivalent Remotion preview command) opens the Remotion studio with a hello-world Composition rendering. ⏳ (not run in this session — requires a browser; deferred to first interactive use)
- Strict TypeScript, ES2022 target, no `any`. ✅ (`pnpm typecheck` passes)
- `.gitignore` excludes `node_modules`, build artifacts, `.DS_Store`, common editor noise. ✅

## M2 — `/lib` foundation — Done

Create the three foundational `/lib` files. None are imported by `BlurReveal` (it stays self-contained per the design), but they exist as documented shared utilities for future components and prove the import structure.

**Acceptance:**

- `lib/tokens.ts` exports named constants for every value in `CLAUDE.md` §2 (color, type, spacing). TypeScript-typed. ✅
- `lib/easing.ts` exports `HOUSE_EASE` (built with `Easing.bezier(0.16, 1, 0.3, 1)` from Remotion) and `HOUSE_SPRING` (the `{ damping: 200, stiffness: 100, mass: 1 }` config object). ✅
- `lib/random.ts` exports `seededRandom(seed: number): () => number` — pure, deterministic (mulberry32). ✅
- All three TypeScript-compile under strict mode. ✅

## M3 — BlurReveal end-to-end — Done

The first real component, the registry metadata, and a viewable preview Composition.

**Acceptance:**

- `registry/components/blur-reveal/BlurReveal.tsx` exists and is functionally equivalent to the reference in [docs/component-reference.md](../../component-reference.md). ✅ (+ added `import React from 'react'` because `React.FC` references the namespace; reference doc updated to match.)
- `registry/components/blur-reveal/schema.ts` re-exports `blurRevealSchema` for tooling that imports the schema independently of the component. ✅
- `registry/components/blur-reveal/blur-reveal.meta.json` carries the registry metadata (name, description, category, deps, tags). ✅
- `registry/components/blur-reveal/README.md` has a one-paragraph description, a prop table, and a usage snippet inside a `<Composition>` or `<Sequence>`. ✅
- `registry/registry.json` lists `blur-reveal` in the catalog. ✅
- `registry/r/blur-reveal.json` is the install manifest in the shadcn registry-item shape: `name`, `type`, `files[]` (the four component files with paths and contents), `dependencies` (Remotion, Zod, React). ✅ (Assembled via a one-shot `jq` command from the source files — no committed build script, matching the "hand-written" intent. 5.3 KB.)
- `src/Preview.tsx` wraps `BlurReveal` on the Onda canvas; `src/Root.tsx` registers it as a `<Composition>` at 1080×1920 @ 30fps. ✅
- `pnpm dev` lets a developer scrub `BlurReveal` and visually verify the motion: opacity 0→1, blur 10→0, translateY 16→0, no overshoot, calm and deliberate over ~0.65s. ⏳ (deferred to first interactive use; static verification via `pnpm typecheck` passes)

## M4 — `CLAUDE.md` canonical update — Done

Update `CLAUDE.md` §2 so `/lib/tokens.ts` is recognized as the in-code canonical source (per the deferred question in [001/design.md](../001-project-foundation/design.md)).

**Acceptance:**

- `CLAUDE.md` §2 gains a single line at the top: "In-code canonical source: [lib/tokens.ts](lib/tokens.ts). The values below mirror it; divergence is a bug." ✅
- All other content of §2 stays — the values still appear in `CLAUDE.md` so agents see them every run. ✅

## Out of scope (later techspecs)

- **The `npx onda` CLI** — techspec 005+, after motion research (004).
- **Build script for `r/<name>.json`** — defer until duplication is real.
- **Formal Zod schema for `registry.json`** — belongs with the CLI techspec.
- **The docs site** (`/www`) — separate techspec.
- **More than one component** — primitive catalog buildout follows motion research.
- **CI, publish, lint config** — separate infrastructure techspec when we're ready to ship.
