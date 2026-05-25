// Sidebar navigation for `/docs/*`. One source of truth — `DocsSidebar`
// renders this, and the dynamic page route uses the slug list to validate
// `/docs/<slug>` against published markdown.
//
// Audience-split groups: every doc here is either for a developer building
// with the library, or for an agent runtime emitting Onda payloads. The
// split matches the homepage's "for developers and AI agents" eyebrow.

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
    label: 'Overview',
    items: [
      { href: '/docs', label: 'Getting started' },
    ],
  },
  {
    label: 'For developers',
    items: [
      { href: '/docs/motion-language', label: 'Motion language' },
      { href: '/docs/design-philosophy', label: 'Design philosophy' },
    ],
  },
  {
    label: 'For AI agents',
    items: [
      { href: '/docs/composing-with-onda', label: 'Composing with Onda' },
    ],
  },
  {
    label: 'Reference',
    items: [
      { href: '/components', label: 'Components catalog' },
      { href: '/showcase', label: 'Showcase' },
    ],
  },
];

/**
 * Slugs served by `/docs/[slug]` — the dynamic route validates against this
 * set so an unknown slug 404s instead of trying to read a missing markdown
 * file. Mirror entries from {@link DOCS_NAV} that point at `/docs/<slug>`.
 */
export const DOCS_PAGE_SLUGS = ['motion-language', 'design-philosophy', 'composing-with-onda'] as const;
export type DocsPageSlug = (typeof DOCS_PAGE_SLUGS)[number];
