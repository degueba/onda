# Techspec 018 — CLI polish

> Filed for later. The catalog is feature-complete; the CLI hasn't kept pace. None of these are urgent, but together they would lift the CLI from "shadcn-fork that works" to "a tool that earns trust." Pick up when there's appetite for CLI work — not before the bigger product moves (showcase compositions, theme aggregation, Studio integration).

## Problem

The CLI shipped at v0.3.0 a month ago and hasn't changed since, while the catalog has gone from "42 components" to "42 components + 12 transitions + 10+ lib helpers = 64 installable units" across 3 categories (components, transitions, lib).

A new user running `bunx ondajs list` today sees a flat list with no awareness of the transitions category. Help text still says "40+ components." `add` works fine but offers no upgrade path, no preview, no undo. Errors on typos are opaque (`fetch returned 404` instead of `unknown slug 'crossfade' — did you mean 'cross-fade'?`).

None of these are *broken* — every reported user story still completes. But they're the difference between "the CLI does its job" and "the CLI is delightful." Cumulatively they signal "this project is maintained and cares about UX," which matters for adoption.

## Decision

Ship a focused CLI v0.4.0 covering five improvements, in priority order:

### 1. Category-aware `list` (highest impact)

```
$ bunx ondajs list
COMPONENTS (42)
  blur-reveal       Canonical text reveal — opacity + blur + 16px rise…
  word-stagger      Multi-word phrase, each word fades and rises…
  …

TRANSITIONS (12)
  cross-fade        A calm opacity cross-fade between two scenes…
  morph             Cross-fade plus a subtle synchronized scale…
  …

LIB (10)
  lib-canvas        Canvas-aware placement and sizing primitives
  lib-motion        Spring configs, duration tokens, easing constants
  …

Run `bunx ondajs list --category transitions` to filter.
Run `bunx ondajs list --search audio` to search names + descriptions.
```

Groups by category derived from the registry's `categories` field. New flags:
- `--category <name>` — show only one category
- `--search <query>` — filter by name + description match

### 2. Better error messages (high impact, low effort)

When `bunx ondajs add <slug>` hits a 404 from the registry:

```
✗ Unknown component 'crossfade'

  Did you mean:
    cross-fade   A calm opacity cross-fade between two scenes
    crossFade    (no slug — that's the factory export name; install
                  via `bunx ondajs add cross-fade`)

  Browse the catalog: https://onda.video/components
```

Compute the suggestion via Levenshtein distance against the full slug list (top 3 matches within edit distance 3).

### 3. `ondajs upgrade <slug>` (medium impact)

Re-fetches the latest version of an already-installed component and overwrites the local files. Asks for confirmation if the local files have been modified (compare hashes; warn before overwriting user edits).

```
$ bunx ondajs upgrade blur-reveal
✓ blur-reveal updated (4 files changed)
```

Default to upgrading just the named slug. `--all` for batch.

### 4. `ondajs remove <slug>` (medium impact)

Clean uninstall:
- Removes `components/onda/<slug>/`
- Strips the import from the `ondaRegistry` barrel
- Warns if other installed components import this one (transitive dep)

```
$ bunx ondajs remove word-stagger

  Cannot remove — these installed components import word-stagger:
    quote-card → ../word-stagger/WordStagger
    stat-card  → ../word-stagger/WordStagger
    title-card → ../word-stagger/WordStagger

  Remove the dependents first, or pass --force to remove anyway
  (their imports will break).
```

### 5. `--dry-run` on `add` (small but loved)

```
$ bunx ondajs add cross-fade --dry-run

Would install:
  components/onda/transitions/cross-fade/crossFade.tsx       (~3 KB)
  components/onda/transitions/cross-fade/schema.ts           (<1 KB)
  components/onda/transitions/cross-fade/cross-fade.meta.json (<1 KB)
  components/onda/transitions/cross-fade/README.md           (~4 KB)

Plus npm deps: @remotion/transitions
Plus barrel update: components/onda/index.ts (add `export * from './transitions/cross-fade/crossFade'`)
```

Lets users see exactly what's about to land before committing.

### 6. Help text refresh

```
ondajs — Install Onda motion-graphics primitives into your Remotion project

Usage:
  ondajs add <slug>          install a component, transition, or lib helper
  ondajs upgrade <slug>      re-fetch the latest version of an installed item
  ondajs remove <slug>       uninstall and prune the barrel
  ondajs list                browse the catalog (64 items across components, transitions, lib)
  ondajs help                this message

Common flags:
  --registry <url>           override the registry URL (default: https://onda.video/r)
  --dry-run                  preview without writing files
  --category <name>          filter list output (components | transitions | lib)
  --search <query>           filter by name or description

Examples:
  bunx ondajs add cross-fade
  bunx ondajs add blur-reveal --dry-run
  bunx ondajs list --category transitions
  bunx ondajs upgrade word-stagger

Docs:    https://onda.video/docs
GitHub:  https://github.com/degueba/onda
```

## Beyond these five — possibly later

- **Spinners / progress** for slow network fetches (use `ora` or hand-rolled). Currently the CLI is silent during fetches.
- **Respect `NO_COLOR`** env var — strip ANSI when set (some terminals + CI envs need this).
- **Proper exit codes** — `0` success, `1` recoverable error, `2` usage error. Today the CLI mostly returns 0 or 1 with no nuance.
- **Auto-discover transitions in barrel.** The current barrel writer (`lib/barrel.ts`) was written before transitions existed; check it surfaces them correctly under the new `components/onda/transitions/` path.
- **Telemetry opt-in** (much later, only if Onda gets real adoption). Anonymous install counts per component would let the maintainer prioritize. Strict opt-in only, never default-on.

## Goals

1. New user running `bunx ondajs list` discovers transitions as a distinct category, not buried in a flat alphabetical dump.
2. Typo on `add` gets a suggestion, not a 404.
3. Existing installed components can be upgraded without manual delete + re-add.
4. Existing installed components can be uninstalled cleanly (with barrel cleanup).
5. Help text and `list` reflect the current catalog size + category structure.

## Non-goals

- **Component-side changes.** This is CLI-only. No component / transition / lib edits in scope.
- **Plugin system.** Onda doesn't have user-extension points and shouldn't grow one yet.
- **Multi-registry support.** `--registry <url>` already exists for the single-override case; full multi-registry (combining sources) is over-engineering for current scale.
- **Build / bundling commands.** Onda is install-source-into-your-project; the CLI doesn't bundle, build, or render.
- **Auth / private registries.** Public-only for now.

## Reasonable calls (challenge any)

- **Ship as 0.4.0 (minor), not 0.3.1 (patch).** Five user-visible additions plus a help refresh — that's a minor by Conventional Commits / semver. The improvements are additive (no breaking changes), so a major isn't warranted.
- **`upgrade` and `remove` are core commands, not flags on `add`.** Could be `add --force-overwrite` (upgrade) and `add --remove` (cringe). Named commands win — they show up in `--help` discoverably and read better in scripts.
- **Suggestion algorithm: Levenshtein vs trigram vs embedding.** Levenshtein at edit distance ≤ 3 is the right default — fast, no deps, catches the actual class of mistake (typos, casing). Trigram or embedding-based "fuzzy" would be overkill for a 64-slug namespace.
- **`--dry-run` on `add`, not on `remove` / `upgrade`.** `remove` is destructive enough to warrant always-confirm anyway; `upgrade` should always show the diff inline before writing. Only `add` benefits from a separate dry-run mode because users don't always know what an unfamiliar slug pulls in.

## Open questions

1. **Should `list` show install status?** I.e., a `✓` next to components already installed in the current project. Useful for browsing but requires scanning `components/onda/` on every invocation. Probably yes — fast enough, and the signal is high-value.
2. **`upgrade` semantics if the registry's slug got renamed or removed.** Current behavior would 404. Should the CLI also surface a redirect or removed-with-replacement message? Probably defer until the catalog actually renames something.
3. **Should `add` auto-install transitive `registryDependencies` without asking?** Today it does (and prints what landed). Some users would want a confirmation prompt; others would find it annoying. Leaning keep current behavior; revisit if anyone complains.

## When to pick this up

- After **showcase compositions** or **theme aggregation** ship — those move the needle more on adoption.
- When a real user reports CLI friction. The above improvements are educated guesses; concrete complaints would refine priorities.
- Or as a deliberate "let's polish what we have" sprint between bigger pieces.
