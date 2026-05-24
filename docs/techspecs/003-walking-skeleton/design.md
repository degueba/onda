# Techspec 003 — Walking skeleton

## Problem

After [001](../001-project-foundation/design.md) (docs convention) and [002](../002-distribution-model/design.md) (distribution decision), we have a sharp paper foundation but zero shipping product. To validate that the rules in [CLAUDE.md](../../../CLAUDE.md) and the contract in [docs/component-reference.md](../../component-reference.md) actually produce a great component on screen, we need to **stand up the repo end-to-end with one real component, viewable locally**. Without that, motion-language research (techspec 004), CLI work (techspec 005+), and catalog buildout (techspec 006) are all theoretical.

This techspec is the thinnest possible end-to-end slice: a runnable Remotion project, the supporting `/lib` primitives, the registry shape, and a single component (`BlurReveal`) installable via a hand-written registry JSON.

## Decision

**One techspec, not four.** Repo scaffolding, `/lib` helpers, registry shape, and the first component are tightly coupled — changes in one drive changes in the others. A "walking skeleton" approach gets us to a tangible, viewable artifact in one pass. The decomposed alternative (`003-scaffolding → 004-lib → 005-registry → 006-component`) is cleaner per-techspec but adds paperwork before anything renders, and the decisions are so coupled that splitting them is artificial.

Tradeoff accepted: 003 is larger than 001 or 002.

## Goals

1. `pnpm install && pnpm dev` opens a Remotion preview that renders `BlurReveal` correctly.
2. Repo structure matches the target layout in [docs/tech-stack.md](../../tech-stack.md): `/registry`, `/lib`, `/docs`, top-level configs, plus `/src` for the local preview entry only.
3. `/lib/tokens.ts` is the **in-code canonical token source**; `CLAUDE.md` §2 becomes its human-readable mirror.
4. `/lib/easing.ts` exports `HOUSE_EASE` and `HOUSE_SPRING` as named constants; `/lib/random.ts` exports a seeded PRNG. Components can import these as documented shared utilities — they exist now even though `BlurReveal` doesn't import them.
5. `BlurReveal` follows the contract in [docs/component-reference.md](../../component-reference.md) exactly: four files, Zod schema, premium defaults, self-contained, deterministic, on-brand motion.
6. `/registry/registry.json` and `/registry/r/blur-reveal.json` describe the catalog and the install manifest in the shadcn registry JSON shape — hand-written, since there's no build script yet.

## Non-goals

- **The `npx onda` CLI.** Tracked for techspec 005+. For 003, "install" is the existence and correctness of the registry JSON; no automation yet.
- **A registry build script** that generates `/r/<name>.json` from source. Defer until duplication actually hurts.
- **A formal Zod schema for `registry.json` itself.** Belongs in the CLI techspec — the CLI is the validator.
- **The docs site** (`/www`). Separate techspec.
- **More than one component.** One is enough to validate the contract.
- **CI, npm publishing, lint / format / Prettier opinions.** Belongs in a later infrastructure-quality techspec once we're shipping changes regularly.
- **Motion principles deep research.** That's techspec 004 by design — we build the skeleton on current opinions first, then research lands with a real artifact to evaluate against.

## Reasonable calls (challenge any of these)

- **Package manager:** **pnpm.** Fast, modern, ready for workspaces when `/cli`, `/www`, etc. arrive.
- **Build / dev tool:** **Remotion's own CLI and config.** No Vite, no custom wrapper. v1 doesn't need them.
- **First component:** **`BlurReveal`** — already the reference in [docs/component-reference.md](../../component-reference.md). No reason to pick something else for the skeleton.
- **Self-containment vs. `/lib` imports.** `BlurReveal` **stays self-contained with inlined values** (matching the reference verbatim). `/lib/tokens.ts`, `/lib/easing.ts`, `/lib/random.ts` exist as documented shared utilities for future components that need them, but the skeleton's reference component does not depend on them. This keeps `npx ondajs add blur-reveal` (when it ships) a true one-file copy. If we later decide DRY in the source repo beats single-file install ergonomics, we add shared deps then via the registry's `registryDependencies` field.
- **Token canonicalization.** `/lib/tokens.ts` is **the in-code canonical source.** `CLAUDE.md` §2 becomes its human-readable mirror and links to it. Values must stay in sync; divergence is a bug; a future test (techspec TBD) can enforce equality.
- **TypeScript config:** strict mode on, no `any`, ES2022 target.
- **Composition dimensions and fps for the preview:** **1080×1920 @ 30fps** (vertical, common social format). The CLAUDE.md timing rules are stated at 30fps, so 30fps is the natural default. Easy to add 16:9 and other variants later.
- **Top-level layout:** `/registry`, `/lib`, `/src` (preview entry only), `/docs`, plus root configs. Matches `docs/tech-stack.md` exactly.

## Open questions deferred

- **Where does the formal Zod schema for `registry.json` live?** Probably `/cli/src/schema.ts` once the CLI exists. Defer.
- **Should `/lib` be published to npm eventually** (e.g., as `@onda/lib`)? Two paths: (a) `/lib` is repo-internal, components inline values; (b) `/lib` is a published runtime that installed components import. (a) preserves the copy-paste philosophy; (b) gives us a place to ship updates to shared helpers. **For 003 we pick (a).** Revisit when `/lib` has helpers we'd want to update centrally for installed users.
- **Where do registry build artifacts live** when we eventually have a build script? Probably `/registry/r/` is the output dir, not source — but for 003 we hand-write the JSON in that exact location, so it'll feel natural either way.
