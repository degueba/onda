import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Circle, MinusCircle, XCircle } from '@phosphor-icons/react/dist/ssr';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { LivePreview } from '@/components/LivePreview';
import { SITE, absoluteUrl } from '@/lib/seo';

const PAGE_TITLE = 'Compare';
const PAGE_DESCRIPTION =
  'An honest comparison of Onda versus rolling your own Remotion primitives, buying After Effects templates, and using Framer Motion. Where each one fits, where Onda earns its place.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: absoluteUrl('/compare') },
  openGraph: {
    title: `${PAGE_TITLE} — ${SITE.name}`,
    description: PAGE_DESCRIPTION,
    url: absoluteUrl('/compare'),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${PAGE_TITLE} — ${SITE.name}`,
    description: PAGE_DESCRIPTION,
  },
};

// The four approaches we compare against. Ordered so Onda lands last —
// the eye reads left-to-right (or top-to-bottom on narrow screens) and
// finishes on the column that's about to be argued for. Honesty matters
// more than spin here: each approach gets a fair one-liner, not a strawman.
const APPROACHES = [
  {
    id: 'roll-your-own',
    name: 'Roll your own',
    subtitle: 'with Remotion primitives',
  },
  {
    id: 'templates',
    name: 'AE templates',
    subtitle: 'Envato, Motion Array, …',
  },
  {
    id: 'framer-motion',
    name: 'Framer Motion',
    subtitle: 'inside Remotion',
  },
  {
    id: 'onda',
    name: 'Onda',
    subtitle: 'this library',
  },
] as const;

type ApproachId = (typeof APPROACHES)[number]['id'];

type CellKind = 'yes' | 'no' | 'partial' | 'na';

type CapabilityRow = {
  label: string;
  hint?: string;
  values: Record<ApproachId, { kind: CellKind; text: string }>;
};

// The matrix rows. Each cell carries both a status glyph (✓ / · / – / ✕)
// AND a short text label — the icon alone is too vague, the text alone
// reads as a wall. Together they let a skimmer get the shape in two
// seconds and a reader get the substance in twenty.
const CAPABILITIES: CapabilityRow[] = [
  {
    label: 'Distribution',
    hint: 'How the thing reaches your project',
    values: {
      'roll-your-own': { kind: 'partial', text: 'npm primitives' },
      templates: { kind: 'no', text: 'Paid .mp4 / .aep' },
      'framer-motion': { kind: 'partial', text: 'npm package' },
      onda: { kind: 'yes', text: 'Source you own' },
    },
  },
  {
    label: 'Programmatic data',
    hint: 'Pass real values from your app at render time',
    values: {
      'roll-your-own': { kind: 'yes', text: 'Yes' },
      templates: { kind: 'no', text: 'No — baked-in' },
      'framer-motion': { kind: 'yes', text: 'Yes' },
      onda: { kind: 'yes', text: 'Yes' },
    },
  },
  {
    label: 'Motion identity',
    hint: 'A consistent way things move across components',
    values: {
      'roll-your-own': { kind: 'no', text: 'None — you decide' },
      templates: { kind: 'partial', text: 'Strong, but rented' },
      'framer-motion': { kind: 'no', text: 'UI animation feel' },
      onda: { kind: 'yes', text: 'One signature identity' },
    },
  },
  {
    label: 'Premium defaults',
    hint: 'Looks finished with zero configuration',
    values: {
      'roll-your-own': { kind: 'no', text: 'Start from zero' },
      templates: { kind: 'yes', text: 'Locked-in' },
      'framer-motion': { kind: 'no', text: 'Start from zero' },
      onda: { kind: 'yes', text: 'Token-based' },
    },
  },
  {
    label: 'Scene-grade blocks',
    hint: 'TitleCard, LowerThird, StatCard, EndCard — ready to drop in',
    values: {
      'roll-your-own': { kind: 'no', text: 'Build them yourself' },
      templates: { kind: 'na', text: 'N/A — whole-scene only' },
      'framer-motion': { kind: 'no', text: 'Not its domain' },
      onda: { kind: 'yes', text: '7 and growing' },
    },
  },
  {
    label: 'AI-agent friendly',
    hint: 'Zod-typed props an LLM can generate against',
    values: {
      'roll-your-own': { kind: 'no', text: 'No schemas' },
      templates: { kind: 'no', text: 'No API' },
      'framer-motion': { kind: 'partial', text: 'TS types only' },
      onda: { kind: 'yes', text: 'Zod schemas' },
    },
  },
  {
    label: 'Render pipeline',
    hint: 'Where the pixels come from',
    values: {
      'roll-your-own': { kind: 'yes', text: 'Remotion' },
      templates: { kind: 'no', text: 'After Effects' },
      'framer-motion': { kind: 'partial', text: 'Browser-only by default' },
      onda: { kind: 'yes', text: 'Remotion' },
    },
  },
];

// Honest "where each one wins" — Onda doesn't have to be the right answer
// for every situation, and pretending otherwise is what makes comparison
// pages feel like marketing. Each card names a real scenario where the
// other option is the better call.
const STRENGTHS = [
  {
    name: 'Roll your own',
    when: 'You need a motion language no library can give you, you like the boilerplate, and you have the time to maintain it.',
  },
  {
    name: 'AE templates',
    when: 'You need fifty stock-footage business intros by tomorrow and you are paying specifically for the "designed-looking" preset.',
  },
  {
    name: 'Framer Motion',
    when: 'You are already deep in React UI-animation patterns and your video is essentially a longer landing page.',
  },
  {
    name: 'Onda',
    when: 'You want code-first videos that do not look generated, with Zod-typed props an AI agent can compose against.',
  },
];

// Vanilla-Remotion code sample shown in the "three ways" section. Kept
// realistic — this is roughly the minimum you'd write to ship a calm,
// non-default-feeling hero title with springs and an entrance. The point
// of showing it is contrast, not mockery: it IS a sensible thing to write
// if you want full control. It's just a lot of glue for one title.
const VANILLA_REMOTION = `import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from 'remotion';

export const HeroTitle = ({ text }: { text: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame, fps,
    config: { damping: 200, stiffness: 100, mass: 1 },
    durationInFrames: 18,
  });

  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const y = interpolate(progress, [0, 1], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const blur = interpolate(progress, [0, 1], [12, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        opacity,
        transform: \`translateY(\${y}px)\`,
        filter: \`blur(\${blur}px)\`,
        fontSize: 96,
        fontFamily: '"Clash Display", sans-serif',
        fontWeight: 600,
        color: '#F2F2F4',
      }}>
        {text}
      </div>
    </AbsoluteFill>
  );
};`;

const ONDA_CODE = `import { BlurReveal } from '@/components/onda/blur-reveal/BlurReveal';

<BlurReveal text="Onda" />`;

// Cell renderer — pairs the glyph with the short text. Colors are mapped
// from the cell kind: only 'yes' on the Onda column earns the accent rose;
// everywhere else stays neutral so the rare accent reads as praise, not
// decoration.
function StatusCell({
  kind,
  text,
  isOnda,
}: {
  kind: CellKind;
  text: string;
  isOnda: boolean;
}) {
  const accent = isOnda && kind === 'yes';
  const iconColor = accent
    ? 'text-onda-accent'
    : kind === 'yes'
    ? 'text-onda-text'
    : kind === 'partial'
    ? 'text-onda-dim'
    : kind === 'na'
    ? 'text-onda-faint'
    : 'text-onda-faint';

  const Icon =
    kind === 'yes'
      ? CheckCircle
      : kind === 'partial'
      ? MinusCircle
      : kind === 'na'
      ? Circle
      : XCircle;

  const weight = kind === 'yes' ? 'fill' : 'regular';

  return (
    <div className="flex items-start gap-2">
      <Icon
        size={14}
        weight={weight}
        className={`${iconColor} mt-0.5 shrink-0`}
        aria-hidden
      />
      <span
        className={`text-xs sm:text-[13px] leading-snug ${
          accent ? 'text-onda-text' : 'text-onda-dim'
        }`}
      >
        {text}
      </span>
    </div>
  );
}

export default function ComparePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1 w-full max-w-150 mx-auto px-3 sm:px-4 py-8 sm:py-12">
        {/* Header — eyebrow + the headline + a single honest lede.
            The headline is the page's only large type, so it has to land. */}
        <header className="onda-rise onda-rise-1 mb-10 sm:mb-14">
          <p className="text-xs uppercase tracking-[0.16em] text-onda-faint mb-3">
            Compare
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.05] text-onda-text max-w-100">
            How Onda is{' '}
            <span className="text-onda-accent">different.</span>
          </h1>
          <p className="text-onda-dim mt-4 sm:mt-5 max-w-100 leading-relaxed">
            Most code-driven motion looks like a 2009 After Effects export — or
            it&apos;s so generic the brand vanishes inside it. Here&apos;s an
            honest read on where Onda fits and where it doesn&apos;t.
          </p>
        </header>

        {/* The matrix.
            - Sticky-feeling header row with each approach's name + subtitle.
            - Onda column gets a faint surface-2 tint so the eye lands there
              without anything shouting.
            - Rows use a CSS grid so columns stay perfectly aligned regardless
              of cell content length.
            - Horizontal scroll on mobile via the wrapping <div overflow-x-auto>;
              min-width keeps the grid honest at narrow viewports. */}
        <section className="onda-rise onda-rise-2 mb-14 sm:mb-20">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-onda-text">
              The honest matrix
            </h2>
            <span className="text-[10px] uppercase tracking-[0.16em] text-onda-faint tabular-nums">
              {CAPABILITIES.length} rows
            </span>
          </div>

          <div className="overflow-x-auto -mx-3 sm:-mx-4 px-3 sm:px-4">
            <div className="min-w-85 rounded-2xl border border-onda-border overflow-hidden bg-onda-surface">
              {/* Header row */}
              <div className="grid grid-cols-[1.1fr_1fr_1fr_1fr_1fr] bg-onda-surface-2 border-b border-onda-border">
                <div className="px-3 sm:px-4 py-3 sm:py-4">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-onda-faint">
                    Capability
                  </p>
                </div>
                {APPROACHES.map((a) => {
                  const isOnda = a.id === 'onda';
                  return (
                    <div
                      key={a.id}
                      className={`px-3 sm:px-4 py-3 sm:py-4 border-l border-onda-border ${
                        isOnda ? 'bg-onda-surface' : ''
                      }`}
                    >
                      <p
                        className={`font-display text-sm sm:text-base font-semibold tracking-tight ${
                          isOnda ? 'text-onda-text' : 'text-onda-text'
                        }`}
                      >
                        {a.name}
                        {isOnda && (
                          <span
                            className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-onda-accent align-middle"
                            aria-hidden
                          />
                        )}
                      </p>
                      <p className="text-[11px] text-onda-faint mt-0.5 leading-tight">
                        {a.subtitle}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Capability rows */}
              {CAPABILITIES.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-[1.1fr_1fr_1fr_1fr_1fr] ${
                    i < CAPABILITIES.length - 1
                      ? 'border-b border-onda-border'
                      : ''
                  }`}
                >
                  <div className="px-3 sm:px-4 py-3 sm:py-4 bg-onda-surface-2/40">
                    <p className="text-sm font-medium text-onda-text leading-snug">
                      {row.label}
                    </p>
                    {row.hint && (
                      <p className="text-[11px] text-onda-faint mt-0.5 leading-snug">
                        {row.hint}
                      </p>
                    )}
                  </div>
                  {APPROACHES.map((a) => {
                    const isOnda = a.id === 'onda';
                    const cell = row.values[a.id];
                    return (
                      <div
                        key={a.id}
                        className={`px-3 sm:px-4 py-3 sm:py-4 border-l border-onda-border ${
                          isOnda ? 'bg-onda-surface' : ''
                        }`}
                      >
                        <StatusCell
                          kind={cell.kind}
                          text={cell.text}
                          isOnda={isOnda}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend — small, well below the table so it doesn't compete. */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-onda-faint">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle size={12} weight="fill" className="text-onda-text" />
              Yes
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MinusCircle size={12} className="text-onda-dim" />
              Partial
            </span>
            <span className="inline-flex items-center gap-1.5">
              <XCircle size={12} className="text-onda-faint" />
              No
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Circle size={12} className="text-onda-faint" />
              Not applicable
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-onda-accent" />
              Onda
            </span>
          </div>
        </section>

        {/* Same moment, three ways.
            The argument the matrix sketches gets made concretely here: one
            specific task (a hero title reveal), three concrete renditions.
            The Onda card is the only one that animates — the difference IS
            the point of the section. */}
        <section className="onda-rise onda-rise-3 mb-14 sm:mb-20">
          <div className="mb-4">
            <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-onda-text">
              Same moment, three ways
            </h2>
            <p className="text-sm text-onda-faint mt-1 max-w-100">
              Animate a hero title. Three ways to get there, one of which
              reads instantly as Onda.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Card 1 — vanilla Remotion */}
            <div className="bg-onda-surface border border-onda-border rounded-2xl p-4 flex flex-col">
              <div className="flex items-baseline justify-between mb-3">
                <p className="font-display text-base font-semibold tracking-tight text-onda-text">
                  Roll your own
                </p>
                <span className="text-[10px] uppercase tracking-[0.16em] text-onda-faint">
                  ~38 lines
                </span>
              </div>
              <pre className="text-[10.5px] leading-snug font-mono text-onda-dim bg-onda-bg/60 border border-onda-border rounded-lg p-3 overflow-x-auto flex-1 max-h-72">
                <code>{VANILLA_REMOTION}</code>
              </pre>
              <p className="text-xs text-onda-faint mt-3 leading-relaxed">
                Springs, easings, blur, layout — every primitive wired by hand.
                Total control, zero identity.
              </p>
            </div>

            {/* Card 2 — AE template (representational, not actual chrome) */}
            <div className="bg-onda-surface border border-onda-border rounded-2xl p-4 flex flex-col">
              <div className="flex items-baseline justify-between mb-3">
                <p className="font-display text-base font-semibold tracking-tight text-onda-text">
                  AE template
                </p>
                <span className="text-[10px] uppercase tracking-[0.16em] text-onda-faint">
                  $24
                </span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center bg-onda-bg/60 border border-onda-border rounded-lg p-4 text-center min-h-24">
                <p className="font-display text-xs uppercase tracking-[0.2em] text-onda-faint mb-2">
                  Cinematic Title Intro
                </p>
                <p className="font-display text-xl font-semibold text-onda-dim tracking-tight">
                  Volume 12
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                  {['lens flare', '4K ProRes', 'no plug-ins'].map((t) => (
                    <span
                      key={t}
                      className="text-[9px] uppercase tracking-wider text-onda-faint border border-onda-border rounded-md px-1.5 py-0.5"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-onda-faint mt-4">
                  Edit-in-After-Effects. Export an .mp4.
                </p>
              </div>
              <p className="text-xs text-onda-faint mt-3 leading-relaxed">
                Designed-looking, but the same fingerprint as every other
                buyer. No props, no data.
              </p>
            </div>

            {/* Card 3 — Onda — the only card with live motion */}
            <div className="bg-onda-surface border border-onda-border-lit rounded-2xl p-4 flex flex-col relative overflow-hidden">
              {/* Faint accent corner — the single earned accent of this section */}
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-[0.08] pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle, var(--color-onda-accent) 0%, transparent 70%)',
                }}
                aria-hidden
              />
              <div className="flex items-baseline justify-between mb-3 relative">
                <p className="font-display text-base font-semibold tracking-tight text-onda-text">
                  Onda
                  <span
                    className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-onda-accent align-middle"
                    aria-hidden
                  />
                </p>
                <span className="text-[10px] uppercase tracking-[0.16em] text-onda-faint">
                  1 import
                </span>
              </div>
              <div className="relative">
                <LivePreview slug="blur-reveal" />
              </div>
              <pre className="mt-3 text-[10.5px] leading-snug font-mono text-onda-dim bg-onda-bg/60 border border-onda-border rounded-lg p-3 overflow-x-auto">
                <code>{ONDA_CODE}</code>
              </pre>
              <p className="text-xs text-onda-faint mt-3 leading-relaxed">
                Premium defaults, signature spring, owned source. Same moment,
                one component.
              </p>
            </div>
          </div>
        </section>

        {/* Where each one wins.
            The trust move of the page — Onda is not the right answer for
            every situation, and the page is more credible for naming it.
            Four restrained cards, equal weight, only the Onda card carries
            the accent dot. */}
        <section className="onda-rise onda-rise-4 mb-14 sm:mb-20">
          <div className="mb-4">
            <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-onda-text">
              Where each one wins
            </h2>
            <p className="text-sm text-onda-faint mt-1 max-w-100">
              No tool is right for every job. Here&apos;s when you should pick
              something other than Onda — and when Onda is the answer.
            </p>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STRENGTHS.map((s) => {
              const isOnda = s.name === 'Onda';
              return (
                <li
                  key={s.name}
                  className={`bg-onda-surface border rounded-2xl p-4 ${
                    isOnda ? 'border-onda-border-lit' : 'border-onda-border'
                  }`}
                >
                  <p className="font-display text-base font-semibold tracking-tight text-onda-text">
                    {s.name}
                    {isOnda && (
                      <span
                        className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-onda-accent align-middle"
                        aria-hidden
                      />
                    )}
                  </p>
                  <p className="text-sm text-onda-dim mt-1.5 leading-relaxed">
                    {s.when}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Final pitch — one tight paragraph + CTAs. Mirrors the home page's
            quiet-conclusion pattern; the accent word picks up "feel" because
            that's what the whole page has been arguing for. */}
        <section className="onda-rise onda-rise-5 text-center mt-4">
          <p className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-onda-text max-w-90 mx-auto leading-snug">
            Onda is for people who care about how it{' '}
            <span className="text-onda-accent">feels</span>.
          </p>
          <p className="text-onda-dim mt-3 sm:mt-4 max-w-100 mx-auto leading-relaxed">
            38 components, one motion identity, source you own. Free, MIT,
            built on Remotion.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/components"
              className="px-4 py-2 rounded-lg bg-onda-text text-onda-bg font-medium hover:opacity-90 transition-opacity"
            >
              Browse components →
            </Link>
            <a
              href="https://github.com/degueba/onda"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-lg border border-onda-border-lit text-onda-text font-medium hover:bg-onda-surface transition-colors"
            >
              GitHub
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
