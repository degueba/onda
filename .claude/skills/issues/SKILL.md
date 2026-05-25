---
name: issues
description: List, drill into, and act on GitHub issues for the current repo via gh CLI. Read-primary; write actions (close, comment, label) require explicit user approval.
---

# /issues — GitHub issue workflow

You help the user work with GitHub issues for the repository in the current working directory.

## Repo detection

Always derive the target repo from the current directory:

```bash
gh repo view --json nameWithOwner --jq .nameWithOwner
```

If that fails, the cwd isn't a GitHub repo — tell the user and stop.
Never hardcode a repo name; the same skill is reused across all the user's projects.

## Permission detection (do this once per invocation)

Before suggesting any write action, check what the user can actually do
on this repo:

```bash
gh api "repos/$REPO" --jq '.permissions // {pull: true}'
```

The result is one of:
- `{admin: true, push: true, pull: true, ...}` — maintainer / admin → all actions available
- `{push: true, pull: true, ...}` — collaborator with write access → close / comment / label / reopen all work
- `{pull: true}` or missing object — read-only access → only `comment` works on public repos; `close` / `reopen` / `label` / `edit` will fail with 403

**Adapt the suggested next-action menu based on this:**

- If `push` is true (collaborator+): offer the full menu (fix, close, comment, label, reopen).
- If only `pull` is true (read-only):
  - Still offer `fix` (it just creates a local branch — works for anyone).
  - Still offer `comment` (public repos accept comments from any authenticated user).
  - **Do NOT offer `close`, `reopen`, `label`, `edit`** — they'd 403.
  - Add a one-line note: *"You have read-only access to this repo. To open a PR, fork first; to close issues, you'd need to be added as a collaborator."*

**Special case — own issues:** any authenticated user CAN close issues they authored, even without write access. If you detect the user is the issue author (`gh issue view N --json author` matches `gh api user --jq .login`), allow the close action with a clear "(as author)" annotation.

Cache the permission result for the session — don't re-query for every command.

## Modes

The user invokes `/issues` with optional arguments. Pick the mode from the args:

### `/issues` (no args) — **List open issues**

Show all OPEN issues for the current repo, ranked by most recent activity.
Format each as a single line for fast scanning:

```
#42  [bug, audio]      Audio visualizer wave looks weird at low amplitudes      3 comments · opened 4d ago
#41  [feat, docs]      Add transitions catalog                                  1 comment · opened 1w ago
```

Use:
```bash
gh issue list --state open --limit 30 --json number,title,labels,comments,createdAt,updatedAt
```

Then format. Sort by `updatedAt` desc. Show `comments.totalCount`, age in human form ("4d ago"), labels in `[bracket, list]`.

End the list with a short prompt: *"Run `/issues N` to drill into one, or `/issues fix N` to start fixing."*

### `/issues <number>` — **Drill into one issue**

Fetch full detail and present it cleanly:

```bash
gh issue view <number> --comments
```

Format the output as:
- **Title** (bold) + state + labels
- Author + timestamp
- Body (preserve markdown)
- Comments (collapsed if > 5, show "+N more comments" with a hint to expand)
- Linked PRs (`gh issue view N --json closedByPullRequestsReferences`)

After the issue body, **always suggest 2–3 next actions** the user can take. Example:
```
Next:
  • `/issues fix 42` — create a fix branch and start work
  • Add a comment: I can compose one and ask you to approve
  • Close (if already fixed elsewhere): I'll show the command
```

### `/issues filter:<label>` — **Filter by label**

```bash
gh issue list --state open --label "<label>" --limit 30 ...
```

Same format as the no-args list, but filtered.

### `/issues search:"<text>"` — **Full-text search**

```bash
gh issue list --state open --search "<text>" --limit 30 ...
```

### `/issues triage` — **Issues without labels**

```bash
gh issue list --state open --search "no:label" --limit 30 ...
```

Useful for finding issues that need categorization.

### `/issues my` — **Assigned to me**

```bash
gh issue list --state open --assignee @me --limit 30 ...
```

### `/issues fix <number>` — **Start fixing an issue**

This is the workflow entry point.

1. Fetch issue details via `gh issue view <number> --json title,body,labels,number`.
2. **Decide if the work is a feature** by inspecting labels:
   - **Feature**: any label matches `feat`, `feature`, or `enhancement` (case-insensitive).
   - **Not a feature**: anything else (bug, docs, chore, no labels at all — none of these get a techspec).

   Don't ask the user. The label is the source of truth — if a feature wasn't tagged that way, the user can either re-label and re-run, or accept that no spec is created.
3. Generate the branch name:
   - **Feature**: `feat/issue-<number>-<slugified-title>`
   - **Otherwise**: `fix/issue-<number>-<slugified-title>`
   - Slug rules: lowercase, kebab-case, max 50 chars, strip articles (a/the/an), keep keywords.
   - Example: issue 42 "Audio visualizer wave looks weird" → `fix/issue-42-audio-visualizer-wave-looks-weird`.
4. **Confirm with the user**: *"About to run `git checkout -b <branch>`. Approve? [y/N]"*
5. If approved: create the branch.
6. **If this is a feature, also create a techspec skeleton.** Project convention — every new feature gets a paper trail at `docs/techspecs/<NNN>-<slug>/design.md` before code lands. **If it's not a feature, skip this step entirely.**
   - Only attempt this if the repo has a `docs/techspecs/` directory (signals the project uses this convention). If it doesn't, skip.
   - Find next spec number: scan `docs/techspecs/` for directories matching `^[0-9]{3}-`, take the highest, increment, zero-pad to 3 digits. Example: existing 001..017 → next is 018.
   - Same slug as the branch (without `feat/issue-N-` prefix).
   - Create directory: `docs/techspecs/<NNN>-<slug>/`.
   - Write `design.md` from the skeleton below.
   - Tell the user: *"Created `docs/techspecs/<NNN>-<slug>/design.md`. Fill in the **Decision**, **Goals**, and **Non-goals** sections as you investigate."*
7. Print the issue body inline so the user can start investigating immediately.
8. Remind: *"Reference `closes #<number>` in your eventual commit / PR body to auto-close on merge."*

#### Techspec skeleton

Use exactly this format when creating the skeleton — it matches the existing 007-017 specs in the repo, so contributors can pattern-match:

```markdown
# Techspec <NNN> — <Title from issue>

> Tracks [#<N>](<issue url>).

## Problem

<Issue body, lightly summarized into 1-2 paragraphs. Keep the original wording where it's already clear; rephrase only if needed for flow. Quote any code snippets verbatim from the issue.>

## Decision

> TBD — fill in once you've investigated and chosen an approach.

## Goals

> TBD — what success looks like, 3-6 bullets.

## Non-goals

> TBD — what we're explicitly NOT doing, 2-4 bullets.

## Reasonable calls (challenge any)

> TBD — design choices that aren't obvious, with the reasoning so a reviewer can challenge.

## Open questions

> TBD — things you don't know yet, deferred to discussion / later.
```

Don't fabricate content for the TBD sections — leave them as TBD markers. The whole point is to give the user a structured scratchpad they fill in as the work clarifies, not a fake spec.

### `/issues close <number> [reason]` — **Close an issue**

1. Show the exact command: `gh issue close <number> --comment "<reason or auto-generated message>"`.
2. **Confirm with the user**: "About to close issue #N. Approve? [y/N]"
3. On `y`: execute. On `N`: print the command for manual run.

If no `[reason]` provided, compose one from context (e.g. "Fixed in PR #99 — <one-line summary>") and show it for approval.

### `/issues comment <number> "<text>"` — **Add a comment**

1. Show the exact command: `gh issue comment <number> --body "<text>"`.
2. Confirm with user.
3. Execute on approval.

### `/issues label <number> [+add] [-remove]` — **Adjust labels**

Show the command:
```bash
gh issue edit <number> --add-label "<labels>" --remove-label "<labels>"
```

Confirm before executing.

### `/issues reopen <number>` — **Reopen a closed issue**

Symmetric to close. Confirm + execute via `gh issue reopen <number>`.

## Safety rules

- **Never write without explicit user approval.** Even if the user says `/issues close 42`, ALWAYS confirm the action and the exact command before running.
- **Never bulk write.** If the user asks to close 5 issues, ask once per issue, not as a batch.
- **Never invent issue numbers.** If a number doesn't exist or isn't open, say so — don't guess.
- **Preserve issue links.** When suggesting commit / PR messages, include `closes #N` so the issue auto-closes on merge.
- **Never add AI attribution** to comments, close reasons, or any text posted to the repo. Per the user's standing rules.

## Output style

- Terse, scannable. Single-line per issue in lists.
- Use the user's existing terminal-color conventions (the `gh` CLI does this by default — don't strip ANSI codes).
- When showing an issue body, **don't re-format the markdown** — present it as `gh issue view` shows it. The user is used to that format.
- After every command, end with a clear "next move" hint.

## Examples

**`/issues`** → list of open issues, one per line.

**`/issues 42`** → full issue 42 view + suggested next actions.

**`/issues fix 42`** → "About to create branch `fix/issue-42-...`. Approve?" → on y, branch created + issue body printed.

**`/issues close 42`** → "About to close #42 with comment 'Fixed in PR #99'. Approve?" → on y, executed.

**`/issues filter:bug`** → all open issues labeled "bug".

**`/issues search:"audio"`** → all open issues mentioning "audio".

**`/issues triage`** → all open issues with NO labels.

## What this skill does NOT do

- Doesn't manage Pull Requests (use `gh pr` directly for that).
- Doesn't replace `ultrareview` for PR review.
- Doesn't sync to other issue trackers (Linear, Jira) — those have their own MCP tools.
