import type { ShowcaseMeta } from '@/lib/showcase';

export const browserWalkthroughMeta: ShowcaseMeta = {
  slug: 'browser-walkthrough',
  title: 'Browser walkthrough · 9s',
  description:
    'Landscape (1280×720) product page-load demo. A BrowserFrame settles, an InputField address bar types a URL, a ProgressBar loads the page, then the page content lands and a Cursor moves to the CTA and clicks. A single continuous take that reads as a real browse-to-launch flow — the interface category as a product reel.',
  duration: 9,
  fps: 30,
  width: 1280,
  height: 720,
  categoriesUsed: ['interface', 'entrances', 'scenes'],
  category: 'developer',
};
