# Roadmap — Techspec 006

Execution plan for [design.md](design.md). Each milestone has explicit acceptance criteria. Update statuses as work lands.

## M1 — CLI package scaffold — Done

Stand up `packages/cli/` as a workspace child, declare `onda` as the published name, wire `bin/onda` to a TS entry, get `--help` and `--version` printing.

**Acceptance:**

- `pnpm-workspace.yaml` lists `packages/*`. ✅
- `packages/cli/package.json` declares `"name": "onda"`, `"bin": { "onda": "./dist/onda.js" }`, Node 20+ engines (bumped from 18 — see logs), ESM (`"type": "module"`), zero runtime `dependencies`. ✅
- `packages/cli/src/onda.ts` is the entry; build via plain `tsc` (no bundler dep — surface is small enough that `tsup` adds weight for no gain). ✅
- `pnpm --filter onda build` exits 0 and produces `dist/onda.js` plus its `commands/` subfolder; shebang preserved on line 1 of `dist/onda.js`. ✅ (`.js`, not `.mjs` — see logs.)
- From the repo root: `node packages/cli/dist/onda.js --version` prints `0.1.0`; `--help` prints the usage block enumerating the v1 commands and flags. ✅
- `pnpm --filter onda typecheck` passes with the workspace's strict TS settings. ✅
- Root `pnpm typecheck` and `pnpm --filter www typecheck` both still pass after the workspace surgery. ✅

## M2 — `onda add` happy path (no deps, default layout) — Done

End-to-end install of a single component that has no `registryDependencies`. Targets the simplest case first to lock the file-write + path-resolution logic before adding the dep walker.

**Acceptance:**

- Tested with `--registry file:///…/registry/r` against the in-repo manifests since `https://onda.dev/r/` doesn't serve yet (lands in M6). ✅
- `node …/onda.js add blur-reveal` in a fresh directory creates `./components/onda/blur-reveal/{BlurReveal.tsx, schema.ts, blur-reveal.meta.json, README.md}` with the manifest's `content` written verbatim. ✅
- In a project with a `src/` directory at cwd, the same invocation writes to `./src/components/onda/blur-reveal/…`. ✅
- Re-running with a hand-modified file in place exits 1 and prints exactly one conflict line citing the modified file. ✅
- `--force` overwrites the conflicting file; other files report "unchanged" (idempotent — same content on disk). ✅
- `--dry-run` prints "would write …" lines and writes zero files. ✅
- Multi-slug invocation (`add fade-in slide-in`) installs both, grouped by slug in the summary. ✅
- Unknown slug exits 1 with `onda add: failed to fetch one or more manifests:` followed by the path that was tried. ✅
- Peer-dep block prints at the end: detected pm (`pnpm-lock.yaml` → `pnpm add`, `yarn.lock` → `yarn add`, `bun.lockb`/`bun.lock` → `bun add`, otherwise `npm install`); deps gathered from all manifests in the install. ✅

## M3 — Lib helpers as registry items + transitive resolution — Done

Author manifests for each `/lib` file, declare `registryDependencies` on every component that imports from them, walk the graph in the CLI.

**Acceptance:**

- New files under `registry/r/`: `lib-motion.json`, `lib-choreography.json`, `lib-easing.json`. Each is a single-file `registry:lib` manifest carrying the current `lib/<name>.ts` content. ✅ (Three, not six — `text-timing`, `random`, `tokens` are unused by any component, so manifesting them now would ship dead code; add them when a component imports them.)
- Every `registry/r/<component>.json` declares both lib slugs AND sibling-component slugs under `registryDependencies` — detection script (python, in-repo) greps the source for both `from '\\.\\./\\.\\./\\.\\./lib/<name>'` and `from '\\.\\./<slug>/<Pascal>'` patterns and writes the union. ✅
- `onda add blur-reveal` installs the component AND `lib/onda/motion.ts` in one pass. ✅
- `onda add chapter-card` installs the scene block, both lib helpers it transitively needs (motion + choreography + easing), AND the three primitives it composes (fade-in, blur-reveal, underline) — deduped, in topological order (lib-motion → blur-reveal → lib-easing → lib-choreography → fade-in → underline → chapter-card). ✅
- Multi-slug install (`add title-card lower-third`) deduplicates overlapping deps — each lib file written once. ✅
- Dep walker detects + rejects cycles with `circular registryDependencies: a → b → a` error (defensive; no cycles in the current catalog). ✅

## M4 — Import-path rewriting — Done

Make installed files self-consistent. Without this, M3's installs typecheck-fail in the user's project because `from '../../../lib/motion'` doesn't resolve.

**Acceptance:**

- After install, every `.tsx`/`.ts` file's imports are rewritten:
  - `from '../../../lib/<name>'` → `from '@/lib/onda/<name>'` when the alias mode applies, else a calculated relative path. ✅
  - Sibling-component imports (scene blocks composing primitives): analogous rewrite to `@/components/onda/<slug>/<Component>` or relative. ✅
- Tested in three configurations against a real install (`pnpm install` of react/remotion/zod/etc. into each sandbox), then `tsc --noEmit`:
  - **Shape 1** — `src/` + `@/*` alias (Next.js / Vite scaffold) → alias form. ✅ tsc PASS
  - **Shape 2** — `src/`, no alias (bare Vite shape) → relative form. ✅ tsc PASS
  - **Shape 3** — flat layout, no `src/`, no alias (plain Node Remotion) → relative form. ✅ tsc PASS
- The rewrite is regex-based per design.md; assumptions documented in `src/lib/rewrite-imports.ts`. ✅
- Subtle non-obvious fix: the project-shape detector's JSONC stripper was a regex that ate `**/` inside the very common `"include": ["src/**/*"]` glob, hiding `paths["@/*"]` from detection. Replaced with a character-by-character tokenizer that respects string contexts. ✅

## M5 — `onda list` — Not started

Discovery without leaving the terminal. Important for the AI-agent use case.

**Acceptance:**

- `npx onda list` fetches the catalog (via `<registry>.json` or a `<registry>/index.json` — pick in implementation), groups by category, and prints with a header line per category and one component per line (`<slug>  —  <title>  —  <description>`).
- `--category <name>` filters; unknown categories error helpfully (list valid ones).
- `--json` emits a JSON array, one entry per component, schema-stable across versions. Documented in the README.

## M6 — Site changes to host the registry + flip the install snippet — Not started

Wire the site so `https://onda.dev/r/<slug>.json` actually serves the manifests; flip the install snippet on every README and on the home/compare page from "this is what it'll look like" to "this works."

**Acceptance:**

- `/www/src/app/r/[slug]/route.ts` (or static export under `/www/public/r/`) serves each manifest as `application/json`. Local: `curl http://localhost:3000/r/blur-reveal.json` returns the manifest body. Prod parity is required.
- `/www/src/app/r/index.json/route.ts` (or static) serves the catalog summary if M5 needs it.
- Home-page install snippet and per-component `npx onda add <slug>` lines are unchanged in text but now real. (The text was always correct; this milestone is "the text is no longer aspirational.")
- `/compare` page's "1 import" framing is reinforced with an "install in one command" line that links to the CLI docs page.

## M7 — Publish + smoke test — Not started

Make `npx onda` resolve from the public npm registry.

**Acceptance:**

- `npm publish` from `packages/cli/` succeeds. Version `0.1.0`.
- From a clean machine (or `nvm use && rm -rf ~/.npm/_npx`), `npx onda add blur-reveal` works end-to-end against `https://onda.dev/r`, in a fresh directory, no prior `npm install` of anything.
- A short CLI section is added to the docs site (probably `/docs/cli` since the user introduced a `/docs` page) documenting flags and the install-path layout.
- Release note appears in [CHANGELOG.md](../../../CHANGELOG.md) (created if absent — first entry: "0.1.0 — `npx onda` ships").

## Out of scope (later techspecs)

- **Component composition reel for the home page** — techspec 007.
- **`onda doctor`** to detect drift between installed files and the registry — later.
- **`onda upgrade`** as a higher-level convenience — depends on a yet-unbuilt drift detector.
- **Component / scene-block scaffolding** for contributors — separate, contributor-facing tool.
- **Telemetry, analytics, anonymous usage stats** — not for v1.
- **A second binary (e.g., `onda-dev`)** — out of scope.
