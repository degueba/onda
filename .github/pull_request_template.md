<!-- Thanks for opening a PR! A few prompts to help us review. Delete sections that don't apply. -->

## What this changes

<!-- 1–3 sentences. What's different after this lands? -->

## Why

<!-- The problem or intent behind the change. Link an issue if there is one (`Closes #N`). -->

## Type of change

- [ ] Bug fix
- [ ] New component (proposed in issue #__)
- [ ] Improvement to an existing component
- [ ] Documentation
- [ ] Tooling / infrastructure

## Checklist

- [ ] I've read [CONTRIBUTING.md](../CONTRIBUTING.md) and [CLAUDE.md](../CLAUDE.md).
- [ ] `pnpm typecheck` passes locally for both packages.
- [ ] If I touched `registry/components/*/meta.json`, I ran `pnpm sync-registry`.
- [ ] If this is a new component, it follows the four-file contract in [docs/component-reference.md](../docs/component-reference.md) and the motion rules in CLAUDE.md §1–3.
- [ ] No bouncy springs, no overshoot outside `heroReveal`, no hardcoded values where tokens exist.
- [ ] One component (or one fix) per PR — not bundled with unrelated changes.
