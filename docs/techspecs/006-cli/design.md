# Techspec 006 — `npx onda` CLI

## Problem

[Techspec 002](../002-distribution-model/design.md) committed Onda to its own CLI as the primary install path — `npx onda add <name>`. Every surface since has been written *as if* it exists: the home page's install snippet, every component README's "Install" section, the `/compare` page's "1 import" framing. None of it is real. A copy-the-source-from-the-website fallback works but undersells the product and reads as half-built.

We now have 38 components across 6 categories, a shadcn-format registry (`registry.json` + per-slug `registry/r/<slug>.json` manifests), and a public docs surface. The CLI is the unfulfilled load-bearing piece.

A second pressure: components in this repo import from a shared `/lib` (`SPRING_SMOOTH`, `DURATION`, `staggerFrames`, choreography helpers, `HOUSE_EASE`, seeded `random`). That's the *correct* shape for the library — DRY, one motion identity — but it means a "copy this file into your project" install is no longer one file. The CLI has to decide what shared code travels with each component and where it lands.

## Decision

**Ship `onda` as a small published npm package with one binary, `bin/onda`. `npx onda add <slug>` fetches the registry manifest, walks transitive dependencies, copies files to the user's project, and rewrites import paths so the installed code is self-consistent.**

Concretely:

1. **One published package, named `onda`** (npm). Single binary `bin/onda`. Source under `packages/cli/` in this repo. Built with `tsup` (or `tsc` — small enough to not need a bundler; pick in the implementation pass). Node 18+. ESM.

2. **Three commands for v1:**
   - `onda add <slug…>` — install one or more components. Multi-slug support is the v1 convenience that turns "add ten" from ten invocations into one.
   - `onda list` — print the catalog grouped by category; an integrated discovery surface so users don't have to leave the terminal.
   - `onda --help` / `onda --version` — table-stakes.

3. **Registry source.** Default `--registry https://onda.video/r` (already shipping under `/www/public/r/` once we wire it; today `registry/r/*.json` are file-only). The CLI fetches `<registry>/<slug>.json` per the shadcn registry-item schema and validates with Zod before touching disk.

4. **Shared `/lib` helpers ship as their own registry items.** New manifests under `registry/r/`: `lib-motion.json`, `lib-choreography.json`, `lib-easing.json`, `lib-text-timing.json`, `lib-random.json`, `lib-tokens.json`. Each component's manifest declares `registryDependencies: ["lib-motion", …]` for whichever helpers its source uses. The CLI walks the dep graph and installs every node exactly once.

5. **Path layout in the user's project.**
   - Components → `./src/components/onda/<slug>/` if a `src/` directory exists at the call site, else `./components/onda/<slug>/`.
   - Lib helpers → `./src/lib/onda/<name>.ts` (or `./lib/onda/<name>.ts`).
   - Both override-able with `--components-out <path>` and `--lib-out <path>`.

6. **Import-path rewriting on install.** Every `.tsx`/`.ts` file written by the CLI has its imports rewritten:
   - `from '../../../lib/<name>'` → `from '@/lib/onda/<name>'` when a `src/` layout is detected and an `@/*` tsconfig path exists; else `from '../../lib/onda/<name>'` (relative, calculated from the actual install paths).
   - Sibling-component imports (scene blocks that import other primitives) → the same `@/components/onda/<slug>/<Component>` or relative form.
   - Detection: read the user's `tsconfig.json` for `compilerOptions.paths["@/*"]`. If present and points at `./src/*`, prefer the alias; otherwise relative.

7. **Peer-dep reporting, not installation.** After write, the CLI prints a single block of `npm install …` / `pnpm add …` lines for any peer deps the manifest declares (Remotion, Zod, `@remotion/paths` for components that need it). The CLI never spawns a package manager itself. (Auto-install adds a class of failure modes — lockfile races, wrong package manager, monorepo confusion — that aren't worth the convenience for a tool people run a handful of times.)

8. **Re-install safety.** If a destination file already exists and content differs, refuse and print a one-line diff summary. `--force` overwrites. `--dry-run` writes nothing and prints the plan. No interactive prompts in v1 — every behavior is flag-driven so this is scriptable from day one (the AI-agent use case).

9. **No `onda init`.** Per 002. No `components.json`, no project state. The CLI is stateless across runs.

## Why a single published npm package (not just `npx github:degueba/onda`)

| Concern | Cost of GitHub-only | Cost of npm publish |
| --- | --- | --- |
| `npx onda add blur-reveal` | Doesn't work; `npx` resolves bare names against the npm registry | One-time publish |
| Install speed | Clones the whole repo on every `npx` | Fetches just the CLI package |
| Versioning | Whatever main is | Real semver; can `@latest` |
| The home page's snippet matches reality | No (or it lies) | Yes |

`npm publish onda` once is the price; the snippet on every Onda surface assumes it.

## Why ship lib helpers as registry items (option A from 004's open question)

004's logs flagged the decision: when a component imports `SPRING_SMOOTH` from `lib/motion.ts`, the CLI can either (a) install `lib/motion.ts` as a separate file via `registryDependencies`, or (b) inline the imported values back into the component at install time so each component is one self-contained file.

**Option A wins** for three reasons:

- The motion identity is the product. Inlining values into each component divorces every install from a shared truth — change the spring later and you'd have to re-install every component to propagate it. With shared lib files, a user can edit `lib/onda/motion.ts` once and every installed component picks up the change. That's the "you own the source" promise applied correctly.
- The shadcn registry format already supports this via `registryDependencies` — no format invention.
- Composition (scene blocks importing primitives) needs the same mechanism. Solving it for lib helpers solves it for sibling components in the same pass.

The cost is that import-path rewriting becomes mandatory. That's not free, but it's a finite, testable transform on a known set of patterns from this codebase.

## Why import-path rewriting (not relative-path manifests, not @-alias-only)

| Approach | Cost |
| --- | --- |
| Author manifests with the final user-side relative paths baked in | Couples the registry to one assumed project shape; breaks for `src/`-vs-flat layouts |
| Force every user to set up `@/*` path aliases first | Adds a "you must configure tsconfig" prerequisite — exactly the friction 002 rejected |
| **Rewrite on install based on detected layout** | One regex pass over written files; works for both common shapes |

The CLI does the work so users don't have to.

## Goals

1. `npx onda add blur-reveal` works in a fresh Next.js / Vite / plain-Node Remotion project and produces a buildable component tree with all transitive lib helpers, without the user editing tsconfig or running any other command first.
2. `npx onda add title-card stat-card lower-third` installs three scene blocks plus every primitive they compose, deduped, in one pass.
3. The installed files typecheck under the user's `tsconfig.json`.
4. The CLI is small (< 100 KB published), boots fast (< 500 ms for a no-network help), and has no runtime deps beyond what's necessary for arg parsing, HTTP, and Zod.
5. Every Onda surface that today says "npx onda add …" tells the truth.

## Non-goals

- **Auto-installing npm packages.** Print the install line; let the user run it. (Removes failure modes; respects monorepos.)
- **Interactive TUIs.** Flag-driven so AI agents can drive it.
- **Updating already-installed components.** Once copied, it's yours. `add --force` overwrites but doesn't diff/merge. A later `onda doctor` could detect drift; out of scope for v1.
- **Authentication or access control.** The library is MIT; the CLI installs the same source for everyone.
- **`onda init`** — explicitly avoided per 002.
- **Plugins / config files / `onda.config.ts`.** Stateless by design.
- **Component generation, scaffolding, or a "new component" template.** That's a contributor workflow, not a user one.
- **Non-Remotion targets.** Out of scope.

## Shape of the CLI

```
npx onda add <slug…>     [--components-out <path>] [--lib-out <path>]
                         [--registry <url>] [--force] [--dry-run]
                         [--no-color]
npx onda list            [--registry <url>] [--category <name>]
                         [--json] [--no-color]
npx onda --version
npx onda --help
```

### `add` flow

1. Parse argv. Validate each slug matches `^[a-z][a-z0-9-]*$`.
2. Detect project shape:
   - `src/` exists? → src-layout.
   - `tsconfig.json` declares `compilerOptions.paths["@/*"]`? → alias-mode for rewrites; else relative.
3. Resolve transitive deps:
   - Fetch `<registry>/<slug>.json` for each input slug.
   - For each, recursively fetch any `registryDependencies` not yet resolved. Detect cycles (shouldn't exist in our catalog; fail loud if they do).
   - Build a flat dedup'd set of (slug, manifest) pairs.
4. Resolve output paths:
   - For component manifests: `<components-out>/<slug>/<file>`.
   - For lib manifests: `<lib-out>/<name>.ts`.
5. Pre-flight: if any destination exists with non-matching content and `--force` is not set, abort with a one-line summary per conflict. Print the `--force` and `--dry-run` hints.
6. Write each file. For `.tsx`/`.ts`, run the import-rewrite pass before write.
7. Collect peer deps from each manifest (`dependencies` field). Print the install line at the end.
8. Print a one-line summary per component installed.

### `list` flow

1. Fetch `<registry>/index.json` (a new endpoint we'll add — a slim catalog summary, one entry per slug with `name`, `title`, `description`, `category`). Or fetch the canonical `<registry>.json` if simpler — decide in implementation.
2. Group by category. Print with category headers and a one-line description per slug.
3. `--category <name>` filters. `--json` emits machine-readable output (AI agents).

## Open questions to resolve in implementation

- **Hosting `/r/*.json`.** Today the files live under `registry/r/` in this repo and aren't served. The site needs a `/r/<slug>.json` route (probably an App Router catch-all reading from the filesystem at build time, or a static export of the same). Pick the simpler option that survives the Next.js static-export model.
- **`index.json` for `list`.** Generate at build time from the registry, or have the CLI fetch `registry.json` and project from that. The second is simpler; the first is faster. Probably fetch `registry.json` for v1.
- **TS-import parser vs regex for the rewrite step.** A real parser (`@babel/parser`, `oxc`) is bulletproof but ships a bundle. A targeted regex over `from '<path>'` works for our actual import shapes (single-quote, double-quote, no template literals in the source we own). Start with regex; document the assumption; switch to a parser if it ever bites.
- **What happens when a user's project has its own `lib/onda/motion.ts` from a prior install with different content?** The default refuse-and-flag rule handles it cleanly — they edited the file, and we're not going to clobber it. `--force` is the escape hatch.
- **Telemetry.** None for v1. (Trivial to add later; trust is built first.)
- **Compatibility with the shadcn CLI.** Per 002, our format is theirs — confirm a `pnpm dlx shadcn add https://onda.video/r/blur-reveal.json` invocation succeeds end-to-end as a side-channel test. Don't advertise; verify.

## Renumbering / sequence note

This unblocks the "install snippet is real" line item across the site and the next two natural techspecs:

- **007 — first-party landing scenes / composition reel.** A real "what you can build with Onda" video composed from primitives, surfaced on the home page. Currently the home page hero reuses BlurReveal; a composition reel is the visual proof that the catalog adds up to something.
- **008 — open-source readiness.** LICENSE, CONTRIBUTING, CHANGELOG, automated component tests for the determinism + schema contracts, GitHub Actions for typecheck + build on PR.

Both 007 and 008 assume 006 has shipped — 007 because the reel is a composition that points at the same install paths the CLI produces, and 008 because publishing the CLI is part of the open-source surface area.
