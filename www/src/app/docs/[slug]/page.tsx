import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeShiki from '@shikijs/rehype';
import rehypeSlug from 'rehype-slug';
import type { Pluggable } from 'unified';
import { ArrowSquareOut } from '@phosphor-icons/react/dist/ssr';
import { CodeBlock } from '@/components/CodeBlock';
import { DocsToc } from '@/components/DocsToc';
import { DocsPager } from '@/components/DocsPager';
import { ondaShikiTheme } from '@/lib/onda-shiki-theme';
import { SITE, absoluteUrl } from '@/lib/seo';
import { DOCS_PAGE_SLUGS, type DocsPageSlug } from '@/lib/docs-nav';
import { extractToc, getDocGroup, getDocNeighbors, stripLeadingH1 } from '@/lib/docs';

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
//
// Page composition: a hand-built shell (eyebrow + h1 + description)
// owns the page header so every doc starts at the same visual scale,
// matching the Getting Started page. The markdown body renders below
// with its own first-h1 stripped — otherwise we'd see the title twice.

const REPO_ROOT = resolve(process.cwd(), '..');

const TITLES: Record<DocsPageSlug, string> = {
  catalog: "What's in Onda",
  'motion-language': 'Motion language',
  'design-philosophy': 'Design philosophy',
  'composing-with-onda': 'Composing with Onda',
  'composing-placement': 'Placement & size',
  'composing-timeline': 'Timeline & transitions',
  'composing-media': 'Media & audio',
  'composing-agent-helpers': 'Agent helpers',
  'component-reference': 'Component contract',
};

const DESCRIPTIONS: Record<DocsPageSlug, string> = {
  catalog:
    'The breadth of Onda at a glance — 60 components and 15 transitions across entrances, interface, data, scenes, cinematic, media, and atmosphere, plus the shared foundation.',
  'motion-language':
    'The motion fingerprints that make every Onda animation recognizable — house spring, easing, timing, restraint.',
  'design-philosophy':
    'Apple discipline applied to Onda — reduction, deference, clarity, purposeful motion.',
  'composing-with-onda':
    'The payload shape and determinism rules for assembling Onda scenes — and the entry point to the composing reference.',
  'composing-placement':
    'Where Onda components sit on the canvas and how they scale — the placement and size vocabularies, plus annotations.',
  'composing-timeline':
    'Sequencing beats over time, cutting between scenes with the transition catalog, and rendering a payload with CompositionRenderer.',
  'composing-media':
    'Rendering user photos, video, and audio with the Onda contract — ImageReveal, VideoClip, AudioClip, and composition patterns.',
  'composing-agent-helpers':
    'Lib exports for agent runtimes — composition JSON Schema, canvas presets, and registry summarization for system prompts.',
  'component-reference':
    'The exact file shape every Onda component ships — what you get when you install one, and how to author or fork it.',
};

const mdxComponents = {
  pre: CodeBlock,
};

// rehype-slug runs first so headings carry `id` attributes that the
// right-rail TOC can link to with `#hash` and the IntersectionObserver
// can target. rehype-shiki then runs over the fenced code blocks.
const rehypePlugins: Pluggable[] = [
  rehypeSlug,
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

  const rawSource = readDoc(s);
  const headings = extractToc(rawSource);
  const body = stripLeadingH1(rawSource);

  const href = `/docs/${slug}`;
  const group = getDocGroup(href);
  const { prev, next } = getDocNeighbors(href);
  const title = TITLES[s];
  const description = DESCRIPTIONS[s];
  const editUrl = `${SITE.github}/edit/main/docs/${slug}.md`;

  return (
    <div className="flex flex-col xl:flex-row xl:gap-8">
      <div className="flex-1 min-w-0">
        <header className="mb-8 sm:mb-10">
          {group && (
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-onda-faint mb-2">
              {group}
            </p>
          )}
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
            {title}
          </h1>
          <p className="text-onda-dim mt-3 max-w-2xl leading-relaxed">
            {description}
          </p>
        </header>

        <article className="prose-onda max-w-none">
          <MDXRemote source={body} options={mdxOptions} components={mdxComponents} />
        </article>

        <DocsPager prev={prev} next={next} />

        <div className="mt-8 pt-6 border-t border-onda-border flex justify-end">
          <a
            href={editUrl}
            target="_blank"
            rel="noreferrer"
            className="
              inline-flex items-center gap-1.5
              font-mono text-[11px] uppercase tracking-[0.14em]
              text-onda-faint hover:text-onda-text
              transition-colors
            "
          >
            Edit this page on GitHub
            <ArrowSquareOut size={11} weight="regular" />
          </a>
        </div>
      </div>

      <DocsToc headings={headings} />
    </div>
  );
}
