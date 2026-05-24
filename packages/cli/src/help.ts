// The help text printed by `onda --help` and on argv errors.
// Kept as a single tagged-template constant so the layout is obvious at a
// glance and easy to keep in sync with the implemented surface.
//
// When commands or flags change, update both this string AND the README in
// the same edit — the help text is the source of truth users see first; the
// README is the secondary surface.

export const HELP_TEXT = `onda — install Onda motion-graphics components into your Remotion project.

USAGE
  onda <command> [options]

COMMANDS
  add <slug...>     Install one or more components by slug.
  list              Print the catalog (grouped by category).

GLOBAL OPTIONS
  -h, --help        Print this help.
  -v, --version     Print the CLI version.
      --no-color    Disable ANSI color output.

\`add\` OPTIONS
  --components-out <path>   Where component folders are written.
                            Default: ./src/components/onda/<slug>/ if src/ exists,
                            else ./components/onda/<slug>/.
  --lib-out <path>          Where shared lib helpers are written.
                            Default: ./src/lib/onda/ if src/ exists, else ./lib/onda/.
  --registry <url>          Registry base URL. Default: https://onda.video/r.
  --force                   Overwrite existing files. Without this, conflicts abort.
  --dry-run                 Print the plan; write nothing.

\`list\` OPTIONS
  --category <name>         Filter to one category (entrances, data, graphics,
                            atmosphere, cinematic, scenes).
  --registry <url>          Registry base URL. Default: https://onda.video/r.
  --json                    Emit JSON instead of human-readable text.

EXAMPLES
  npx onda add blur-reveal
  npx onda add title-card stat-card lower-third
  npx onda add fade-in --components-out ./components/animations
  npx onda list --category scenes
  npx onda list --json

DOCS
  https://onda.video/docs
  https://github.com/degueba/onda
`;
