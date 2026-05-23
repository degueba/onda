# `onda`

> Install Onda motion-graphics components into your Remotion project.

```bash
npx onda add blur-reveal
```

This is the official CLI for the [Onda](https://onda.dev) component library —
a thin tool that fetches Onda's [shadcn-format registry](https://onda.dev/r)
and writes component source into your project. You own the files; edit them
freely. No project init, no config files, no lock-in.

## Usage

```
onda <command> [options]
```

Run `onda --help` for the full command and flag reference.

### `onda add <slug...>`

Install one or more components by slug. Resolves shared `lib/` helpers
transitively and writes them too, so the installed code is self-consistent.

```bash
npx onda add blur-reveal
npx onda add title-card stat-card lower-third
```

### `onda list`

Print the catalog grouped by category.

```bash
npx onda list
npx onda list --category scenes
npx onda list --json    # machine-readable
```

## Status

CLI scaffold (M1) — `--help` and `--version` work; `add` and `list` stub out
and return a "coming soon" message. See
[techspec 006](https://github.com/degueba/onda/tree/main/docs/techspecs/006-cli)
for the full plan and milestone status.

## License

MIT.
