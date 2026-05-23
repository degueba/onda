import type { MetadataRoute } from 'next';
import { listComponentSlugs } from '@/lib/registry';
import { absoluteUrl } from '@/lib/seo';

// Generated sitemap.xml. Next reads this at build time and exposes it at
// /sitemap.xml — Google reads it from there once it's announced in
// robots.txt. Static routes get higher priority than component detail
// pages; everything updates weekly because Onda iterates fast at this
// stage.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('/components'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/docs'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/compare'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  const componentRoutes: MetadataRoute.Sitemap = listComponentSlugs().map(
    (slug) => ({
      url: absoluteUrl(`/components/${slug}`),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }),
  );

  return [...staticRoutes, ...componentRoutes];
}
