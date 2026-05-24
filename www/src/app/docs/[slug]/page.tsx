import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeShiki from '@shikijs/rehype';
import type { Pluggable } from 'unified';
import { CodeBlock } from '@/components/CodeBlock';
import { ondaShikiTheme } from '@/lib/onda-shiki-theme';
import { SITE, absoluteUrl } from '@/lib/seo';
import { DOCS_PAGE_SLUGS, type DocsPageSlug } from '@/lib/docs-nav';

// Renders any of the curated long-form docs at /docs/<slug> by reading
// the raw markdown from `docs/<slug>.md` at the repo root and feeding it
// through the same MDX pipeline the per-component pages use.
//
// Why this lives as a dynamic route instead of one page per slug:
//   - Same MDX rendering machinery for every doc — no per-page duplication.
//   - Adding a new doc is a 2-line change: drop the .md, add a slug to
//     DOCS_PAGE_SLUGS in lib/docs-nav.ts.
//   - The docs sidebar (DocsSidebar) and this route's slug set share that
//     same source — no drift possible.

const REPO_ROOT = resolve(process.cwd(), '..');

const TITLES: Record<DocsPageSlug, string> = {
  'motion-language': 'Motion language',
  'design-philosophy': 'Design philosophy',
  'composing-with-onda': 'Composing with Onda',
};

const DESCRIPTIONS: Record<DocsPageSlug, string> = {
  'motion-language':
    'The motion fingerprints that make every Onda animation recognizable — house spring, easing, timing, restraint.',
  'design-philosophy':
    'Apple discipline applied to Onda — reduction, deference, clarity, purposeful motion.',
  'composing-with-onda':
    'Reference for AI agents and brief-driven runtimes emitting valid Onda component payloads.',
};

const mdxComponents = {
  pre: CodeBlock,
};

const rehypePlugins: Pluggable[] = [
  [rehypeShiki, { theme: ondaShikiTheme, defaultLanguage: 'tsx' }],
];
const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins,
  },
};

export function generateStaticParams() {
  return DOCS_PAGE_SLUGS.map((slug) => ({ slug }));
}

const KNOWN = new Set<string>(DOCS_PAGE_SLUGS);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!KNOWN.has(slug)) return { title: 'Not found' };
  const s = slug as DocsPageSlug;
  const title = TITLES[s];
  const description = DESCRIPTIONS[s];
  const url = absoluteUrl(`/docs/${slug}`);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} — ${SITE.name}`,
      description,
      url,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — ${SITE.name}`,
      description,
    },
  };
}

function readDoc(slug: DocsPageSlug): string {
  // The dev / build process runs from `www/`, so the repo root is one up.
  // The markdown files live at `<root>/docs/<slug>.md`.
  return readFileSync(resolve(REPO_ROOT, 'docs', `${slug}.md`), 'utf8');
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!KNOWN.has(slug)) notFound();
  const s = slug as DocsPageSlug;
  const source = readDoc(s);

  return (
    <article className="prose-onda max-w-none">
      <MDXRemote source={source} options={mdxOptions} components={mdxComponents} />
    </article>
  );
}
