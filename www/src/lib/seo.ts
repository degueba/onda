// Centralized SEO constants. Every per-page metadata block reaches in here
// for the canonical site URL, brand name, and default share copy so we
// never have to repeat strings across files. When the production URL or
// tagline changes, change it once here.

export const SITE = {
  name: 'Onda',
  url: 'https://onda.dev',
  tagline: 'Motion graphics for Remotion. Installed as source. Owned by you.',
  description:
    'Premium motion graphics components for Remotion — installed as source, owned by you. A signature motion identity baked in: calm springs, restrained stagger, one focal move per moment.',
  twitter: '@onda_dev', // placeholder — update when the handle exists
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
