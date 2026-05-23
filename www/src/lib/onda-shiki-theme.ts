import type { ThemeRegistrationRaw } from 'shiki';

// Onda's syntax-highlighting theme — TextMate scope colors mapped to the
// design tokens in /lib/tokens.ts. The accent (rose) is reserved for the
// few tokens that should "pop" — keywords, JSX tag names, and the very
// first thing the eye lands on in any line: the import / export / const.
// Everything else stays neutral so code reads as one calm block, with the
// rose acting as anchor points rather than decoration.
//
// Format note: Shiki accepts both the legacy TextMate `settings` field and
// the VSCode-style `tokenColors`. We use `settings` because that's the one
// Shiki applies directly; `tokenColors` is only mirrored *into* `settings`
// when `settings` doesn't already exist, which means an empty-array stub
// silently disables the whole theme. Use one or the other, never both.

const ONDA = {
  bg: '#0E0E12',          // onda-surface
  fg: '#F2F2F4',          // onda-text
  dim: '#8E8E98',         // onda-dim — for punctuation, attribute names
  faint: '#56565F',       // onda-faint — for comments only
  accent: '#D96B82',      // onda-accent — keywords, tag names
  accentSoft: '#E89AAB',  // onda-accent-soft — strings, numbers
} as const;

export const ondaShikiTheme: ThemeRegistrationRaw = {
  name: 'onda-dark',
  type: 'dark',
  colors: {
    'editor.background': ONDA.bg,
    'editor.foreground': ONDA.fg,
  },
  // First entry is the global default style; remaining entries are scope rules.
  settings: [
    {
      settings: { background: ONDA.bg, foreground: ONDA.fg },
    },
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: ONDA.faint, fontStyle: 'italic' },
    },
    {
      scope: [
        'keyword',
        'keyword.control',
        'keyword.control.import',
        'keyword.control.from',
        'keyword.control.export',
        'keyword.control.flow',
        'keyword.operator.new',
        'keyword.operator.expression',
        'storage.type',
        'storage.modifier',
      ],
      settings: { foreground: ONDA.accent },
    },
    {
      scope: ['string', 'string.quoted', 'string.template', 'punctuation.definition.string'],
      settings: { foreground: ONDA.accentSoft },
    },
    {
      scope: ['constant.numeric', 'constant.language', 'constant.character'],
      settings: { foreground: ONDA.accentSoft },
    },
    {
      scope: ['entity.name.function', 'support.function', 'meta.function-call.identifier'],
      settings: { foreground: ONDA.fg },
    },
    {
      scope: ['entity.name.tag', 'support.class.component'],
      settings: { foreground: ONDA.accent },
    },
    {
      scope: ['entity.other.attribute-name'],
      settings: { foreground: ONDA.dim },
    },
    {
      scope: [
        'punctuation',
        'punctuation.separator',
        'punctuation.terminator',
        'meta.brace',
        'meta.bracket',
        'meta.delimiter',
      ],
      settings: { foreground: ONDA.dim },
    },
    {
      scope: ['variable', 'variable.other.readwrite', 'variable.parameter'],
      settings: { foreground: ONDA.fg },
    },
    {
      scope: ['variable.other.property', 'meta.property.object'],
      settings: { foreground: ONDA.fg },
    },
    {
      scope: ['entity.name.type', 'support.type', 'entity.name.type.interface'],
      settings: { foreground: ONDA.fg },
    },
    {
      scope: ['keyword.operator', 'keyword.operator.assignment'],
      settings: { foreground: ONDA.dim },
    },
  ],
};
