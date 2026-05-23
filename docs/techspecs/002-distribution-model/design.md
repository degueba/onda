# Techspec 002 — Distribution model

## Problem

The initial framing in `CLAUDE.md` (set up in [techspec 001](../001-project-foundation/design.md)) described distribution as "shadcn-style" with an install path of `npx shadcn add @onda/<name>`. Two distinct things were conflated under the word "shadcn":

- **The philosophy** — component source is copied into the user's project; they own and edit it.
- **The vehicle** — shadcn's CLI, which requires users to have run `shadcn init` and to maintain a `components.json` in their project.

The philosophy is correct for motion components: motion is taste-dependent, and users *will* want to tweak timing, easing, and colors. A black-box `import` fights that.

The vehicle is wrong for our audience. Remotion users are not predominantly shadcn users. Forcing `shadcn init` to install a single motion component is friction pointed in the wrong direction, and the "shadcn for video" positioning rents brand equity from another project rather than building our own.

## Decision

**Adopt the format. Ship our own CLI. Treat the docs site as a first-class registry surface.**

1. **Adopt the shadcn registry JSON format** as our on-disk serialization (`registry.json` + per-component JSON under `/r/<name>.json`). It's a well-designed spec; reinventing it adds no value.
2. **Build a thin `npx onda` CLI** as the primary install path: `npx onda add <name>`. No project init. No `components.json`. Defaults to copying into `./components/onda/<name>/` (auto-detects `src/` and prefers `src/components/onda/<name>/` if present).
3. **Make the docs site a first-class registry surface.** Every component page has a copy-to-clipboard button on its source, and a stable `https://onda.dev/r/<name>.json` URL for scripted / curl access.
4. **Shadcn-CLI compatibility is a bonus, not a requirement.** Because we follow their JSON format, users who *already* have shadcn set up can pull from us. We don't advertise it as the primary path or build for it.
5. **Drop the "shadcn for video" tagline.** Reposition as "code-first motion graphics for Remotion — installed as source, owned by you."

## Why not just use the shadcn CLI?

| Concern | Cost |
| --- | --- |
| Requires `shadcn init` + `components.json` in user project | One-time but real friction for Remotion users who don't already have it |
| Couples our brand to shadcn's | Free marketing now; rentable later if their direction diverges from ours |
| Ties our release/distribution lifecycle to a tool we don't control | Schema changes, deprecations, breakages outside our hands |

## Why not invent our own format too?

| Concern | Cost |
| --- | --- |
| Reinventing JSON-describing-files | Zero new value; pure work |
| Loses bonus compatibility with the shadcn CLI | Real, free user base lost for no gain |

Hence: adopt format, replace CLI, keep compatibility as a side benefit.

## Goals

1. Users can install any component with a single `npx onda add <name>`, no prior setup.
2. Users can copy any component's source from the docs site with one click.
3. The registry JSON is machine-readable by the shadcn CLI as a compatibility bonus.
4. Onda's brand and positioning don't reference shadcn.

## Non-goals

- Building the CLI itself in this techspec. (Tracked under the registry-scaffolding techspec.)
- Building the docs site. (Tracked under the `/www` bootstrap techspec.)
- Auth, license-gating, or any kind of access control in the CLI. The library is MIT and the CLI installs the same source for everyone.
- Supporting non-Remotion installs.
- Auto-update / upgrade flows. Once a component is copied into the user's project, it's theirs — we can't reliably auto-update modified files. This will be documented in the CLI's README when it ships.

## Shape of the CLI (forward reference for the implementation techspec)

`npx onda add <name> [--out <path>] [--registry <url>]`

- Defaults:
  - `--out` → `./src/components/onda/<name>/` if a `src/` directory exists at the call site, else `./components/onda/<name>/`.
  - `--registry` → `https://onda.dev/r`.
- Behavior:
  1. Fetch `<registry>/<name>.json`.
  2. Validate the shape (Zod schema mirroring the shadcn registry item schema).
  3. Write each `files[]` entry to disk at the configured path.
  4. Report any peer deps the user must install separately (Remotion, Zod) — print, don't install.
- Non-behavior:
  - No `components.json` written, no project state, no implicit configuration.
  - No `npm install` side effects.

## Open questions deferred to the implementation techspec

- **Shared utilities.** When primitives + scene blocks share a `/lib` helper, the registry needs a dep mechanism. The shadcn format's `registryDependencies` handles this; confirm it survives our adoption.
- **Multi-file components.** A single component is one folder with `<Component>.tsx`, `schema.ts`, `<component>.meta.json`, `README.md`. The CLI must write all of them. The registry JSON's `files[]` array already supports this — verify when we implement.
- **Versioning.** Whether `/r/<name>.json` carries a version field, and what happens when a user re-runs `add` on a component they've already installed. Probably: print a warning, refuse to overwrite without `--force`. Decide in implementation.
