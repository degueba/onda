# Techspec 012 — CI fix + dependency hygiene

## Problem

Two intertwined issues surfaced at once:

1. **Main's CI has been red for 6+ consecutive commits.** `pnpm/action-setup@v4` started rejecting the configuration where `version: 9` is declared in `.github/workflows/ci.yml` AND `packageManager: pnpm@9.0.0` is declared in `package.json` — the action wants a single source of truth and throws `ERR_PNPM_BAD_PM_VERSION` when both are present. Every CI run on every branch (including dependabot PRs) inherits the failure, making typecheck/build signal worthless.

2. **Six open dependabot PRs, none mergeable as-is.** Two are safe Action bumps (`actions/setup-node 4 → 6`, `pnpm/action-setup 4 → 6`), one is a patch (`postcss 8.4.31 → 8.5.15`), one is a careful-but-probably-fine major (`next-mdx-remote 5 → 6`), and **two are dangerous group bumps** that bundle real majors with patches:
   - The "production group" includes `zod 3.25 → 4.4.3` — a major rewrite of the schema library Onda lib uses for *every* component contract.
   - The "development group" includes `typescript 5.9 → 6.0` — a major release with breaking changes that could ripple through every file.

   Grouping means an agent or maintainer reviewing the PR has to evaluate four unrelated upgrades at once, with no granularity to take the safe ones and defer the risky ones. Worse, the current dependabot config invited this grouping — it bundles by `dependency-type`, not by update severity.

The combination is paralysing: CI is red so the PRs can't be merged on signal, the PRs are grouped so they can't be partially adopted, and the next round of dependabot updates will produce the same shape unless the config changes.

## Decision

**Ship one focused cleanup PR that fixes the CI breakage, tightens the dependabot config to never group majors, applies the genuinely-safe bumps, and explicitly defers the dangerous ones to their own future migration PRs.** Close the existing 6 dependabot PRs as superseded by this work — dependabot will re-open them per the new grouping rules if the cleanup doesn't include the bump.

### 1. Fix `ci.yml` — remove the `version: 9` conflict

Drop the `with: { version: 9 }` from both `pnpm/action-setup@v4` invocations in the workflow. The `packageManager: pnpm@9.0.0` field in root `package.json` is the canonical declaration; the action defers to it when `version` is omitted. Single source of truth, no conflict.

This is the *actual* root-cause fix. Bumping the action to v6 doesn't help by itself if `version: 9` stays — v6 still respects the explicit value when given, then fights with packageManager.

### 2. Tighten `dependabot.yml` — never group majors

Add `update-types: ['minor', 'patch']` to both group definitions. Major bumps fall out of the groups and get their own PRs, one per package — reviewable in isolation. Existing group definitions stay (we still want minor/patch noise reduction), just scoped narrowly.

```yaml
groups:
  production:
    dependency-type: production
    update-types: ['minor', 'patch']
  development:
    dependency-type: development
    update-types: ['minor', 'patch']
```

### 3. Apply the safe bumps now

In the cleanup PR:

- **`actions/setup-node@v4 → v6`** — major Action bump. Breaking change is "automatic caching now requires `packageManager` field in package.json," which we already have. Zero risk for our usage.
- **`pnpm/action-setup@v4 → v6`** — major Action bump. v6 adds pnpm v11 support, no breaking changes for our setup.
- **`postcss 8.4.31 → 8.5.15`** — patch bump, bugfixes only.

### 4. Attempt `next-mdx-remote 5 → 6`, verify, keep or revert

v6 adds `blockJS` and `blockDangerousJS` defaults (both `true`) for security. The docs site uses MDX to render component READMEs — pure markdown content, no JS expressions in the README files we render. Should be safe, but **the cleanup PR verifies via `pnpm --filter @onda/www build`** before keeping the bump. If the build breaks, the change reverts and `next-mdx-remote 5` stays.

### 5. Explicitly defer the dangerous majors

`zod 3 → 4` and `typescript 5 → 6` are NOT in the cleanup PR. Reasons:

- **Zod 4** is a substantial rewrite. Onda lib uses Zod for every component schema (40+ schemas), `lib/composition.ts`, `lib/canvas.tsx`, the CLI's manifest validation. A blind bump invites silent runtime regressions in agent payloads — the exact class of bug that's hardest to debug. Worth its own dedicated migration PR with a checklist and acceptance criteria.
- **TypeScript 6** is a major language version. Onda compiles against TS 5; bumping affects every typecheck across lib, registry, www, and CLI. Same logic: focused migration with explicit verification, not bundled into a dep-cleanup PR.

Both get their own techspecs when the team's ready.

## Goals

1. Main's CI is green on the cleanup PR and stays green after merge.
2. Dependabot will never again open a PR that bundles a major bump with patches.
3. The 4 safe bumps (`setup-node`, `action-setup`, `postcss`, `next-mdx-remote@6` if verified) land in one reviewable PR.
4. Zod 4 and TypeScript 6 are explicitly tracked as future-spec work — not lost, not silently merged.
5. The 6 existing dependabot PRs close cleanly (manually closed with reference to this work).

## Non-goals

- **Zod 4 migration in this PR.** Separate techspec, separate PR.
- **TypeScript 6 migration in this PR.** Separate techspec, separate PR.
- **Updating tests / adding test coverage.** Out of scope — CI runs typecheck + build, no test suite yet.
- **Touching the release-please / publish workflows.** They work; not the source of the breakage.

## Reasonable calls (challenge any)

- **Removing `version: 9` from the workflow** is the right fix vs leaving it in and pinning to an older Action — the explicit-version pattern is what triggered the v4 action to start refusing. Removing it future-proofs the workflow for any subsequent Action behavior change.
- **Tightening dependabot grouping** vs disabling groups entirely — groups are still useful for patch/minor noise (one PR of "16 sub-deps got patch bumps" beats 16 separate PRs). Just excluding majors threads the needle.
- **Closing existing dependabot PRs** vs rebasing each — rebasing 6 PRs sequentially is slow, creates noisy CHANGELOG entries, and still leaves the grouped-majors problem unsolved. One cleanup PR is cleaner.
- **Verifying `next-mdx-remote@6`** vs taking on trust — the v6 changelog warns about `blockJS` defaults; the docs site is the only consumer of MDX in this repo. A build check is ~30 seconds and worth the certainty.
- **Not bumping `zod` and `typescript` in this PR** — these are the kind of upgrades where bundling a migration into "dependency cleanup" creates a PR that's neither cleanly reviewable nor cleanly revertable. Both deserve focused work.

## Open questions deferred

- **When to schedule Zod 4 migration?** Probably after 011 (audio) lands, since 011 adds new schemas that would otherwise be written twice.
- **TypeScript 6 timing?** Lower priority — TS 5 works fine; bump when there's a TS 6 feature we actually want.
- **Should dependabot also exclude pre-1.0 deps from groups** (a pre-1.0 minor is effectively a major)? Not common in this repo's dep set; defer until it bites.
