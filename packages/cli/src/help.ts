// The help text printed by `ondajs --help` and on argv errors.
// Kept as a single tagged-template constant so the layout is obvious at a
// glance and easy to keep in sync with the implemented surface.
//
// When commands or flags change, update both this string AND the README in
// the same edit — the help text is the source of truth users see first; the
// README is the secondary surface.

export const HELP_TEXT = `ondajs — Onda motion-graphics components for Remotion. CLI installs source you own; the same package exports a runtime manifest for agent runtimes.

USAGE
  ondajs <command> [options]

COMMANDS
  add <slug...>     Install one or more components (or transitions) by slug.
  list              Print the catalog (grouped by category).

GLOBAL OPTIONS
  -h, --help        Print this help.
  -v, --version     Print the CLI version.

\`add\` OPTIONS
  --components-out <path>   Where component folders are written.
                            Default: ./src/components/onda/<slug>/ if src/ exists,
                            else ./components/onda/<slug>/.
  --lib-out <path>          Where shared lib helpers are written.
                            Default: ./src/lib/onda/ if src/ exists, else ./lib/onda/.
  --registry <url>          Registry base URL. Default: https://onda.video/r.
  --force                   Overwrite existing files. Without this, conflicts abort.
  --dry-run                 Print the plan; write nothing.
  --no-barrel               Skip generating the components/onda/index.ts barrel
                            (and the .ondajs-installed.json sidecar that tracks it).
                            By default, every \`add\` keeps a barrel up to date so
                            consumers can \`import { ondaRegistry } from './components/onda'\`
                            and pass it straight to <CompositionRenderer registry={...}>.

\`list\` OPTIONS
  --category <name>         Filter to one category. Valid values:
                            entrances, scenes, data, graphics, cinematic,
                            atmosphere, interface, media, transitions.
  --registry <url>          Registry base URL. Default: https://onda.video/r.
  --json                    Emit JSON instead of human-readable text.

EXAMPLES
  npx ondajs add blur-reveal
  npx ondajs add title-card stat-card lower-third
  npx ondajs add fade-in --components-out ./components/animations
  npx ondajs add cross-fade depth-push     # transitions install the same way
  npx ondajs list --category interface
  npx ondajs list --json

LIBRARY EXPORTS
  import { manifest } from 'ondajs'
                            Runtime catalog — every component and transition
                            with its Zod schema, for agent runtimes building
                            their own layer vocabularies. See techspec 018.

DOCS
  https://onda.video/docs
  https://github.com/degueba/onda
`;
