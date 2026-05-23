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

## M2 — `onda add` happy path (no deps, default layout) — Not started

End-to-end install of a single component that has no `registryDependencies`. Targets the simplest case first to lock the file-write + path-resolution logic before adding the dep walker.

**Acceptance:**

- Pick a component that doesn't import from `/lib` (or temporarily build one for the test); ship one manifest at `https://onda.dev/r/<slug>.json` (or a `--registry file://…` path for local testing).
- `npx onda add <slug>` in a fresh directory creates `./components/onda/<slug>/{<Component>.tsx, schema.ts, <slug>.meta.json, README.md}` with the manifest's `content` written verbatim.
- In a project with a `src/` directory at the cwd, the same invocation writes to `./src/components/onda/<slug>/…`.
- Re-running the same command without `--force` exits non-zero and prints the conflict summary; `--force` overwrites.
- `--dry-run` writes nothing and prints the planned file list.
- Peer-dep block prints at the end: a single `# Install peer dependencies:` header followed by one install line for the user's detected package manager (default `npm`, infer from a lockfile if present — `pnpm-lock.yaml` → `pnpm add …`, `yarn.lock` → `yarn add …`).

## M3 — Lib helpers as registry items + transitive resolution — Not started

Author manifests for each `/lib` file, declare `registryDependencies` on every component that imports from them, walk the graph in the CLI.

**Acceptance:**

- New files under `registry/r/`: `lib-motion.json`, `lib-choreography.json`, `lib-easing.json`, `lib-text-timing.json`, `lib-random.json`, `lib-tokens.json`. Each is a single-file manifest (`type: "registry:lib"`) carrying the current `lib/<name>.ts` content.
- Every existing `registry/r/<component>.json` declares the lib slugs its source actually imports under `registryDependencies`. Verified by a small script that greps each component's source for `from '\\.\\./\\.\\./\\.\\./lib/(\\w+)'` and asserts each match appears in the manifest. Script runs in CI later.
- `onda add blur-reveal` (which imports `SPRING_SMOOTH` and `DURATION`) installs the component AND `./src/lib/onda/motion.ts` in one pass. Deduplication holds: `onda add blur-reveal fade-in` writes `motion.ts` once.
- The dep walker detects and rejects cycles with a clear error message, even though the current catalog has none (defensive — easy to regress).

## M4 — Import-path rewriting — Not started

Make installed files self-consistent. Without this, M3's installs typecheck-fail in the user's project because `from '../../../lib/motion'` doesn't resolve.

**Acceptance:**

- After install, every `.tsx`/`.ts` file's imports are rewritten:
  - `from '../../../lib/<name>'` → `from '@/lib/onda/<name>'` when the user's `tsconfig.json` has `compilerOptions.paths["@/*"]` pointing at a source directory containing the install target; else a calculated relative path from the component file to the lib file.
  - Sibling-component imports (when present in scene blocks): the analogous rewrite to `@/components/onda/<slug>/<Component>` or relative.
- Tested in three configurations:
  - Fresh Next.js project (has `src/` + `@/*` alias) → alias form.
  - Fresh Vite project with `src/` and no `@/*` → relative form, computed correctly.
  - Plain Node Remotion project, no `src/` → relative form, computed correctly.
- In all three, `tsc --noEmit` on the installed tree exits 0 with the user's `tsconfig.json` untouched.
- The rewrite is regex-based for v1 (per [design.md](design.md) open question); a comment in the source explains the assumption and what would force a parser switch.

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
