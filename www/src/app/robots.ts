import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

// robots.txt. Allow everything (we want maximum index coverage), and point
// crawlers at the sitemap so they discover every component page without
// relying on internal-link traversal.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
