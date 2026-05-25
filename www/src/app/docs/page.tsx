import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeShiki from '@shikijs/rehype';
import type { Pluggable } from 'unified';
import Link from 'next/link';
import { ArrowSquareOut } from '@phosphor-icons/react/dist/ssr';
import { CodeBlock } from '@/components/CodeBlock';
import { CopyButton } from '@/components/CopyButton';
import { DocsPager } from '@/components/DocsPager';
import { ondaShikiTheme } from '@/lib/onda-shiki-theme';
import { SITE, absoluteUrl } from '@/lib/seo';
import { getDocNeighbors } from '@/lib/docs';

// Single canonical "Getting Started" page — lives at /docs (not /docs/getting-
// started) so the URL stays short while the catalog is still small. When more
// docs land they can move under /docs/<topic> and this page becomes /docs/start.
const PAGE_TITLE = 'Getting started';
const PAGE_DESCRIPTION =
  'How to install Onda components, set up the fonts and tokens, and render your first Remotion composition with the Onda motion language.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: absoluteUrl('/docs') },
  openGraph: {
    title: `${PAGE_TITLE} — ${SITE.name}`,
    description: PAGE_DESCRIPTION,
    url: absoluteUrl('/docs'),
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${PAGE_TITLE} — ${SITE.name}`,
    description: PAGE_DESCRIPTION,
  },
};

const REMOTION_CREATE = 'npx create-video@latest my-video';
const INSTALL_LINE = 'npx ondajs add fade-in';

const COMPOSITION_SNIPPET = `import { Composition } from 'remotion';
import { FadeIn, fadeInSchema } from './components/onda/fade-in/FadeIn';

export const Root: React.FC = () => (
  <Composition
    id="MyFade"
    component={FadeIn}
    durationInFrames={60}
    fps={30}
    width={1080}
    height={1920}
    schema={fadeInSchema}
    defaultProps={{
      text: 'Hello',
      delay: 0,
      duration: 18,
      color: '#F2F2F4',
      fontSize: 96,
      fontFamily: '"Clash Display", sans-serif',
    }}
  />
);`;

const FONTS_SNIPPET = `<link
  rel="stylesheet"
  href="https://fonts.cdnfonts.com/css/clash-display"
/>
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&display=swap"
/>`;

const TOKENS_SNIPPET = `import { COLOR, DURATION, SPRING_SMOOTH } from '@/lib';

spring({ frame, fps, config: SPRING_SMOOTH, durationInFrames: DURATION.base });
return <div style={{ color: COLOR.text }}>…</div>;`;

// Route every snippet on this page through the same MDX + Shiki +
// CodeBlock pipeline used by the rest of the docs. Otherwise raw <pre>
// dumps would skip syntax highlighting and the copy button, breaking
// the site-wide code-block consistency rule from CLAUDE.md §5.
const mdxOptions = {
  mdxOptions: {
    rehypePlugins: [
      [rehypeShiki, { theme: ondaShikiTheme, defaultLanguage: 'tsx' }],
    ] as Pluggable[],
  },
};

const mdxComponents = { pre: CodeBlock };

// 4-tilde fence so any embedded triple-backticks in a snippet (none
// here today, but defensive) can't accidentally close the block.
function HighlightedSnippet({ code, lang }: { code: string; lang: string }) {
  const source = `~~~~${lang}\n${code}\n~~~~`;
  return (
    <MDXRemote source={source} options={mdxOptions} components={mdxComponents} />
  );
}

/** A reusable "command line" snippet block with a copy affordance on the right. */
function CommandLine({ text }: { text: string }) {
  return (
    <div className="bg-onda-surface border border-onda-border rounded-xl px-3 py-2 flex items-center justify-between gap-2">
      <code className="font-mono text-sm text-onda-text overflow-x-auto whitespace-nowrap">
        <span className="text-onda-faint">$</span> {text}
      </code>
      <CopyButton text={text} />
    </div>
  );
}

/** Numbered step header — matches the home page's typographic hierarchy. */
function StepHeader({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-3">
      <span className="font-mono text-xs text-onda-faint tabular-nums">
        {String(n).padStart(2, '0')}
      </span>
      <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-onda-text">
        {title}
      </h2>
    </div>
  );
}

export default function DocsPage() {
  const { prev, next } = getDocNeighbors('/docs');
  const sourceUrl = `${SITE.github}/blob/main/www/src/app/docs/page.tsx`;

  return (
    <div className="max-w-2xl">
      <header className="mb-8 sm:mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-onda-faint mb-2">
          Start
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
          Getting started
        </h1>
        <p className="text-onda-dim mt-3 leading-relaxed">
          Onda components are <span className="text-onda-text">source you own</span>,
          not a black-box dependency. Five short steps to get an Onda
          primitive rendering inside your own Remotion project.
        </p>
      </header>

      {/* 01 — Remotion project */}
      <section className="mb-10 sm:mb-12">
        <StepHeader n={1} title="Have a Remotion project" />
        <p className="text-onda-text mb-4 leading-relaxed">
          Onda components are React + Zod and run inside any{' '}
          <a
            href="https://remotion.dev"
            target="_blank"
            rel="noreferrer"
            className="text-onda-text underline decoration-onda-border-lit underline-offset-[3px] hover:decoration-onda-accent transition-colors"
          >
            Remotion
          </a>{' '}
          composition. If you don't have a Remotion project yet, scaffold one
          with the official starter:
        </p>
        <CommandLine text={REMOTION_CREATE} />
        <p className="text-xs text-onda-faint mt-3">
          Onda requires Remotion <code className="text-onda-text">4.x</code>,
          React <code className="text-onda-text">19+</code>, and TypeScript.
        </p>
      </section>

      {/* 02 — Add a component */}
      <section className="mb-10 sm:mb-12">
        <StepHeader n={2} title="Add a component" />
        <p className="text-onda-text mb-4 leading-relaxed">
          From the root of your Remotion project, install any component by
          slug. The CLI drops the source files into{' '}
          <code className="text-onda-text font-mono text-sm">
            components/onda/&lt;slug&gt;/
          </code>{' '}
          — they're yours to read, edit, and version.
        </p>
        <CommandLine text={INSTALL_LINE} />
        <p className="text-onda-text mt-4 leading-relaxed">
          Browse the{' '}
          <Link
            href="/components"
            className="text-onda-text underline decoration-onda-border-lit underline-offset-[3px] hover:decoration-onda-accent transition-colors"
          >
            full catalog
          </Link>{' '}
          to find a slug, or hit{' '}
          <kbd className="font-mono text-[11px] text-onda-faint border border-onda-border rounded px-1.5 py-0.5">
            ⌘K
          </kbd>{' '}
          to jump straight to a component by name.
        </p>
      </section>

      {/* 03 — Fonts */}
      <section className="mb-10 sm:mb-12">
        <StepHeader n={3} title="Load the Onda fonts" />
        <p className="text-onda-text mb-4 leading-relaxed">
          The Onda look depends on two typefaces:{' '}
          <span className="text-onda-text">Clash Display</span> for headlines
          and <span className="text-onda-text">Space Grotesk</span> for body
          and UI. Every component accepts a{' '}
          <code className="text-onda-text font-mono text-sm">fontFamily</code>{' '}
          prop, but the defaults assume these are loaded.
        </p>
        <HighlightedSnippet code={FONTS_SNIPPET} lang="html" />
        <p className="text-xs text-onda-faint mt-3 leading-relaxed">
          Use any font-loading strategy you prefer — what matters is that{' '}
          <code className="text-onda-text font-mono">"Clash Display"</code>{' '}
          and{' '}
          <code className="text-onda-text font-mono">"Space Grotesk"</code>{' '}
          resolve. Never fall back to Inter / Arial / system — those read as
          generic.
        </p>
      </section>

      {/* 04 — Use in a Composition */}
      <section className="mb-10 sm:mb-12">
        <StepHeader n={4} title="Use it in a Composition" />
        <p className="text-onda-text mb-4 leading-relaxed">
          Every Onda component is a default-exported React component plus a
          named Zod schema. Pass the schema to Remotion's{' '}
          <code className="text-onda-text font-mono text-sm">
            &lt;Composition&gt;
          </code>{' '}
          for runtime prop validation and the Remotion Studio sidebar.
        </p>
        <HighlightedSnippet code={COMPOSITION_SNIPPET} lang="tsx" />
        <p className="text-onda-text mt-4 leading-relaxed">
          Each component ships with sensible defaults — drop it in with no
          props and it already looks correct. Every prop is documented in the
          component's README and on its{' '}
          <Link
            href="/components"
            className="text-onda-text underline decoration-onda-border-lit underline-offset-[3px] hover:decoration-onda-accent transition-colors"
          >
            catalog page
          </Link>
          .
        </p>
      </section>

      {/* 05 — Tokens */}
      <section className="mb-10 sm:mb-12">
        <StepHeader n={5} title="Compose with the tokens" />
        <p className="text-onda-text mb-4 leading-relaxed">
          The motion fingerprint comes from a small, shared token set:
          durations, springs, easing, colors. When you build your own
          components, reuse these instead of hardcoding values — that's what
          keeps every scene feeling like the same library.
        </p>
        <HighlightedSnippet code={TOKENS_SNIPPET} lang="tsx" />
        <ul className="mt-4 text-sm text-onda-text space-y-2 leading-relaxed">
          <li>
            <code className="text-onda-text font-mono">DURATION</code> — the
            frame-count scale (instant, fast, base, slow, slower, hold).
          </li>
          <li>
            <code className="text-onda-text font-mono">SPRING_SMOOTH</code>,{' '}
            <code className="text-onda-text font-mono">SPRING_SNAPPY</code> —
            the two house springs. Never reduce damping for a "pop."
          </li>
          <li>
            <code className="text-onda-text font-mono">HOUSE_EASE</code> —
            ease curve for opacity and color fades.
          </li>
          <li>
            <code className="text-onda-text font-mono">STAGGER</code>,{' '}
            <code className="text-onda-text font-mono">staggerFrames</code> —
            the canonical 4-frame stagger between siblings.
          </li>
          <li>
            <code className="text-onda-text font-mono">COLOR</code>,{' '}
            <code className="text-onda-text font-mono">FONT</code> — the
            design-token palette.
          </li>
        </ul>
      </section>

      <DocsPager prev={prev} next={next} />

      <div className="mt-8 pt-6 border-t border-onda-border flex justify-end">
        <a
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="
            inline-flex items-center gap-1.5
            font-mono text-[11px] uppercase tracking-[0.14em]
            text-onda-faint hover:text-onda-text
            transition-colors
          "
        >
          View page source on GitHub
          <ArrowSquareOut size={11} weight="regular" />
        </a>
      </div>
    </div>
  );
}
