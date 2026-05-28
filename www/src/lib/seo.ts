// Centralized SEO constants. Every per-page metadata block reaches in here
// for the canonical site URL, brand name, and default share copy so we
// never have to repeat strings across files. When the production URL or
// tagline changes, change it once here.

export const SITE = {
  name: 'Onda',
  url: 'https://onda.video',
  // Tagline used in title tags and OG images. Kept short on purpose:
  // combined with the brand name (`Onda — <tagline>`) it has to stay
  // under ~60 characters or Google truncates the search-result title
  // and SEO checkers flag it as too long.
  tagline: 'Motion graphics for Remotion. Owned by you.',
  // Meta description — Google renders ~155–160 characters before
  // truncating, and most SEO tools flag anything longer than 160 or
  // shorter than 70 as out of band. This sits at ~155.
  description:
    'Premium motion graphics components for Remotion. Installed as source, owned by you. Signature motion identity: calm springs, restraint, focal moves.',
  // Twitter/X handle. Empty until we claim one — leaving it null keeps the
  // `twitter:creator` / `twitter:site` tags off the page rather than
  // pointing at a non-existent profile (which gates Twitter's card preview
  // for some validators).
  twitter: null as string | null,
  github: 'https://github.com/degueba/onda',
  keywords: [
    'remotion',
    'motion graphics',
    'react motion',
    'animation library',
    'video components',
    'kinetic typography',
    'shadcn registry',
    'design system',
  ],
} as const;

// Build a fully-qualified URL for a path. Use everywhere we need an absolute
// URL (canonical, OG, sitemap) rather than concatenating strings inline.
export const absoluteUrl = (path = '/'): string => {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${SITE.url}${p === '/' ? '' : p}`;
};
