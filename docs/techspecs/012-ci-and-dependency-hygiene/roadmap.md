# Roadmap — Techspec 012

Execution plan for [design.md](design.md). Single PR, single merge.

## M1 — Cleanup branch + CI fix

Branch off `main`. Two surgical edits before any dep bumps:

**Acceptance:**

- New branch `fix/ci-and-deps` (or similar) cut from `main` at `60d0672` or later.
- `.github/workflows/ci.yml`: both `pnpm/action-setup@v4` invocations have `with: { version: 9 }` removed. The `version` field stays absent so the action defers to `packageManager` in root `package.json`.
- `.github/dependabot.yml`: both `production` and `development` groups gain `update-types: ['minor', 'patch']`.
- Commit message captures the *why* in one paragraph — this is the root-cause fix that future debuggers will grep for.

## M2 — Safe dep bumps

Three bumps with near-zero risk:

**Acceptance:**

- `pnpm/action-setup@v4` → `@v6` in `ci.yml`.
- `actions/setup-node@v4` → `@v6` in `ci.yml`.
- `postcss` in `www/package.json` bumped from `8.4.31` to `8.5.15` (or latest patch in the 8.5.x line).
- `pnpm install --filter @onda/www` updates the lockfile cleanly.

## M3 — Verify `next-mdx-remote 6`

Attempt the major bump; verify the docs-site build still passes; keep or revert based on result.

**Acceptance:**

- `next-mdx-remote` in `www/package.json` bumped from `5.0.0` to `6.0.0`.
- Lockfile regenerated.
- `pnpm --filter @onda/www build` succeeds with no MDX-rendering errors.
- A spot-check of one rendered component page (e.g., `/components/blur-reveal`) confirms the README's prop table still renders correctly.
- If the build fails or the page regresses, revert the `next-mdx-remote` change in the same commit pass and add a note to design.md §Open questions deferred explaining what broke.

## M4 — Push, open PR, merge

**Acceptance:**

- Branch pushed to `origin/fix/ci-and-deps` (or chosen name).
- PR opened against `main` titled `fix(ci): unblock typecheck + safe dep bumps`. PR body references this techspec and lists the bumps + the deferred ones (zod 4, typescript 6).
- CI on the PR turns **green** (typecheck + build). This is the gate — the whole point of this PR is unblocking that signal.
- PR merged via squash-merge to keep the changelog tidy.

## M5 — Sweep the 6 stale dependabot PRs

After M4 lands on main, the dependabot PRs are in three states:

1. **Made redundant** (the bump is now in main) — dependabot auto-closes within ~24h on the next dependency-update run.
2. **Conflicting lockfile** — needs manual close.
3. **Deferred majors** (PR #3's zod 4, PR #4's typescript 6) — close manually with a comment referencing this techspec.

**Acceptance:**

- After 24h: re-list open PRs. Confirm dependabot auto-closed the ones it owns.
- Manually close any stragglers with a short comment pointing at the merged cleanup PR + this techspec.

## M6 — Merge release PR #7

Unrelated to the dependency work — just the natural final step. Merging PR #7 triggers `publish.yml` and ships `ondajs@0.2.0` to npm.

**Acceptance:**

- PR #7 merged (squash-merge).
- `publish.yml` runs successfully on the resulting GitHub Release.
- `ondajs@0.2.0` visible on npm.

## Out of scope (later techspecs)

- **Zod 4 migration.** Its own techspec.
- **TypeScript 6 migration.** Its own techspec.
- **Test coverage.** No test suite yet; this PR doesn't add one.
- **Release-please / publish workflow changes.** They work as-is.
