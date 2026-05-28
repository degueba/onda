// Centralized SEO constants. Every per-page metadata block reaches in here
// for the canonical site URL, brand name, and default share copy so we
// never have to repeat strings across files. When the production URL or
// tagline changes, change it once here.

export const SITE = {
  name: 'Onda',
  url: 'https://onda.video',
  tagline: 'Motion graphics for Remotion. Installed as source. Owned by you.',
  description:
    'Premium motion graphics components for Remotion — installed as source, owned by you. A signature motion identity baked in: calm springs, restrained stagger, one focal move per moment.',
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
