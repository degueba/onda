import type { ThemeRegistrationRaw } from 'shiki';

// Onda's syntax-highlighting theme — TextMate scope colors mapped to a
// black canvas with a deliberately widened accent palette. Restraint
// rule: every color earns its slot. Rose for keywords and JSX tags, soft
// cyan for strings (the biggest legibility win), amber for numbers and
// booleans (they should pop), soft violet for type names and components
// (distinct from keywords). Everything else stays in the neutral ramp.
//
// Format note: Shiki accepts both the legacy TextMate `settings` field
// and the VSCode-style `tokenColors`. We use `settings` because that's
// the one Shiki applies directly; `tokenColors` is only mirrored *into*
// `settings` when `settings` doesn't already exist, which means an empty
// stub silently disables the whole theme.

const ONDA = {
  bg: '#000000',          // pure black — more contrast than onda-surface
  fg: '#F2F2F4',          // onda-text
  dim: '#8E8E98',         // onda-dim — punctuation, attributes
  faint: '#56565F',       // onda-faint — comments only
  accent: '#D96B82',      // rose — keywords, JSX tag names
  string: '#7BC8D4',      // soft cyan — strings (legibility win)
  number: '#E89855',      // amber — numbers, booleans, constants
  type: '#A89BF0',        // soft violet — type names, component identifiers
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
      settings: { foreground: ONDA.string },
    },
    {
      scope: ['constant.numeric', 'constant.language', 'constant.character'],
      settings: { foreground: ONDA.number },
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
      scope: ['entity.name.type', 'support.type', 'entity.name.type.interface', 'support.class'],
      settings: { foreground: ONDA.type },
    },
    {
      scope: ['keyword.operator', 'keyword.operator.assignment'],
      settings: { foreground: ONDA.dim },
    },
  ],
};
