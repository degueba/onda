// Sidebar navigation for `/docs/*`. One source of truth — `DocsSidebar`
// renders this, and the dynamic page route uses the slug list to validate
// `/docs/<slug>` against published markdown.
//
// Task-based groups: Start (orient + install), Foundations (the why/identity),
// Composing (the assembly + agent contract, split across focused subpages),
// and Reference (the live catalog, showcase, and component contract).

export type DocsLink = {
  href: string;
  label: string;
  /** Optional one-line description, currently unused but reserved for a future hover tooltip. */
  description?: string;
};

export type DocsGroup = {
  label: string;
  items: DocsLink[];
};

export const DOCS_NAV: DocsGroup[] = [
  {
    label: 'Start',
    items: [
      { href: '/docs', label: 'Getting started' },
      { href: '/docs/catalog', label: "What's in Onda" },
    ],
  },
  {
    label: 'Foundations',
    items: [
      { href: '/docs/motion-language', label: 'Motion language' },
      { href: '/docs/design-philosophy', label: 'Design philosophy' },
    ],
  },
  {
    label: 'Composing',
    items: [
      { href: '/docs/composing-with-onda', label: 'Composing with Onda' },
      { href: '/docs/composing-placement', label: 'Placement & size' },
      { href: '/docs/composing-timeline', label: 'Timeline & transitions' },
      { href: '/docs/composing-media', label: 'Media & audio' },
      { href: '/docs/composing-agent-helpers', label: 'Agent helpers' },
    ],
  },
  {
    label: 'Reference',
    items: [
      { href: '/components', label: 'Components catalog' },
      { href: '/showcase', label: 'Showcase' },
      { href: '/docs/component-reference', label: 'Component contract' },
    ],
  },
];

/**
 * Slugs served by `/docs/[slug]` — the dynamic route validates against this
 * set so an unknown slug 404s instead of trying to read a missing markdown
 * file. Mirror entries from {@link DOCS_NAV} that point at `/docs/<slug>`.
 */
export const DOCS_PAGE_SLUGS = [
  'catalog',
  'motion-language',
  'design-philosophy',
  'composing-with-onda',
  'composing-placement',
  'composing-timeline',
  'composing-media',
  'composing-agent-helpers',
  'component-reference',
] as const;
export type DocsPageSlug = (typeof DOCS_PAGE_SLUGS)[number];
