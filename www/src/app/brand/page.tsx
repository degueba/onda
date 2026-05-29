'use client';

// Brand playground — see how your own palette + fonts look across the Onda
// theme. Every preview element reads the `--onda-*` CSS variables (the theme
// contract from `lib/tokens.ts`); the controls set those variables, so the
// whole preview re-skins live. Brand owns the surface (color + type); motion
// stays Onda's, so it isn't exposed here.

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { CSS_VAR, COLOR, FONT, THEME } from '@onda/lib/tokens';
import { CodeBlock } from '@/components/CodeBlock';
import { ONDA } from '@/lib/onda-shiki-theme';

type BrandState = {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  borderLit: string;
  text: string;
  dim: string;
  faint: string;
  accent: string;
  accentSoft: string;
  fontDisplay: string;
  fontBody: string;
};

type ColorKey = Exclude<keyof BrandState, 'fontDisplay' | 'fontBody'>;

const ONDA_BRAND: BrandState = {
  bg: COLOR.bg,
  surface: COLOR.surface,
  surface2: COLOR.surface2,
  border: COLOR.border,
  borderLit: COLOR.borderLit,
  text: COLOR.text,
  dim: COLOR.dim,
  faint: COLOR.faint,
  accent: COLOR.accent,
  accentSoft: COLOR.accentSoft,
  fontDisplay: FONT.display,
  fontBody: FONT.body,
};

const COLOR_SLOTS: { key: ColorKey; label: string; varName: string }[] = [
  { key: 'bg', label: 'Background', varName: CSS_VAR.bg },
  { key: 'surface', label: 'Surface', varName: CSS_VAR.surface },
  { key: 'surface2', label: 'Surface 2', varName: CSS_VAR.surface2 },
  { key: 'border', label: 'Border', varName: CSS_VAR.border },
  { key: 'borderLit', label: 'Border lit', varName: CSS_VAR.borderLit },
  { key: 'text', label: 'Text', varName: CSS_VAR.text },
  { key: 'dim', label: 'Dim', varName: CSS_VAR.dim },
  { key: 'faint', label: 'Faint', varName: CSS_VAR.faint },
  { key: 'accent', label: 'Accent', varName: CSS_VAR.accent },
  { key: 'accentSoft', label: 'Accent soft', varName: CSS_VAR.accentSoft },
];

// All Google fonts referenced below — loaded once via a single stylesheet.
// (Space Grotesk is already loaded by the site layout; Clash Display via
// Fontshare in the layout. The rest come from Google Fonts so a theme author
// can preview real type without installing anything.)
const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Inter:wght@400;500;600&family=Playfair+Display:wght@600;700&family=Poppins:wght@500;600&family=Sora:wght@500;600&family=Work+Sans:wght@400;500;600&display=swap';

const DISPLAY_FONTS: { label: string; value: string }[] = [
  { label: 'Clash Display (Onda)', value: '"Clash Display", sans-serif' },
  { label: 'Sora', value: '"Sora", sans-serif' },
  { label: 'Poppins', value: '"Poppins", sans-serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'Inter', value: '"Inter", sans-serif' },
];

const BODY_FONTS: { label: string; value: string }[] = [
  { label: 'Space Grotesk (Onda)', value: '"Space Grotesk", sans-serif' },
  { label: 'Inter', value: '"Inter", sans-serif' },
  { label: 'DM Sans', value: '"DM Sans", sans-serif' },
  { label: 'Work Sans', value: '"Work Sans", sans-serif' },
];

// Onda's neutral dark ramp — most brands keep a calm dark UI and only change
// the accent + fonts, so presets that do exactly that share this.
const DARK_NEUTRALS = {
  bg: '#08080A',
  surface: '#0E0E12',
  surface2: '#121217',
  border: '#1C1C22',
  borderLit: '#26262E',
  text: '#F2F2F4',
  dim: '#8E8E98',
  faint: '#56565F',
} as const;

function darkBrand(
  accent: string,
  accentSoft: string,
  fontDisplay: string = FONT.display,
  fontBody: string = FONT.body,
): BrandState {
  return { ...DARK_NEUTRALS, accent, accentSoft, fontDisplay, fontBody };
}

const PRESETS: { name: string; brand: BrandState }[] = [
  { name: 'Onda', brand: ONDA_BRAND },
  {
    name: 'Indigo',
    brand: {
      bg: '#0B0B12',
      surface: '#14141F',
      surface2: '#1B1B29',
      border: '#262636',
      borderLit: '#343449',
      text: '#F4F4F8',
      dim: '#9292A6',
      faint: '#5E5E76',
      accent: '#6366F1',
      accentSoft: '#A5B4FC',
      fontDisplay: '"Sora", sans-serif',
      fontBody: '"Inter", sans-serif',
    },
  },
  {
    name: 'Emerald',
    brand: {
      bg: '#07100D',
      surface: '#0E1A15',
      surface2: '#13231C',
      border: '#1E3329',
      borderLit: '#2A4537',
      text: '#EEF5F1',
      dim: '#8AA89B',
      faint: '#56705F',
      accent: '#46B891',
      accentSoft: '#79CFB1',
      fontDisplay: '"Poppins", sans-serif',
      fontBody: '"DM Sans", sans-serif',
    },
  },
  { name: 'Sunset', brand: darkBrand('#F59E0B', '#FCD34D', '"Sora", sans-serif', '"Work Sans", sans-serif') },
  { name: 'Ruby', brand: darkBrand('#E11D48', '#FB7185') },
  { name: 'Ocean', brand: darkBrand('#06B6D4', '#67E8F9', '"Inter", sans-serif', '"Inter", sans-serif') },
  { name: 'Violet', brand: darkBrand('#8B5CF6', '#C4B5FD', '"Poppins", sans-serif', '"DM Sans", sans-serif') },
  { name: 'Mint', brand: darkBrand('#34D399', '#6EE7B7', '"DM Sans", sans-serif', '"DM Sans", sans-serif') },
  { name: 'Coral', brand: darkBrand('#FB7185', '#FDA4AF', '"Sora", sans-serif', '"Inter", sans-serif') },
  { name: 'Sky', brand: darkBrand('#38BDF8', '#7DD3FC', '"Inter", sans-serif', '"Inter", sans-serif') },
  { name: 'Sapphire', brand: darkBrand('#3B82F6', '#93C5FD', '"Sora", sans-serif', '"Inter", sans-serif') },
  { name: 'Teal', brand: darkBrand('#14B8A6', '#5EEAD4', '"Poppins", sans-serif', '"DM Sans", sans-serif') },
  { name: 'Lime', brand: darkBrand('#84CC16', '#BEF264', '"Sora", sans-serif', '"Work Sans", sans-serif') },
  { name: 'Tangerine', brand: darkBrand('#FB923C', '#FDBA74', '"Sora", sans-serif', '"Inter", sans-serif') },
  { name: 'Fuchsia', brand: darkBrand('#D946EF', '#F0ABFC', '"Poppins", sans-serif', '"Inter", sans-serif') },
  { name: 'Lavender', brand: darkBrand('#B4A7F5', '#D7CEFB', '"DM Sans", sans-serif', '"DM Sans", sans-serif') },
  { name: 'Slate', brand: darkBrand('#64748B', '#94A3B8', '"Inter", sans-serif', '"Inter", sans-serif') },
  { name: 'Mono', brand: darkBrand('#E5E5EA', '#C4C4CC', '"Inter", sans-serif', '"Inter", sans-serif') },
  {
    name: 'Gold',
    brand: {
      bg: '#0B0A07',
      surface: '#15130D',
      surface2: '#1C1910',
      border: '#2A2517',
      borderLit: '#3A331F',
      text: '#F5F1E6',
      dim: '#A99F86',
      faint: '#6E6550',
      accent: '#C8A24B',
      accentSoft: '#E3C97E',
      fontDisplay: '"Playfair Display", serif',
      fontBody: '"Work Sans", sans-serif',
    },
  },
  {
    name: 'Daylight',
    brand: {
      bg: '#FFFFFF',
      surface: '#F6F6F8',
      surface2: '#ECECEF',
      border: '#E2E2E6',
      borderLit: '#D3D3DA',
      text: '#0B0B0F',
      dim: '#5B5B66',
      faint: '#9A9AA6',
      accent: '#D96B82',
      accentSoft: '#E89AAB',
      fontDisplay: '"Playfair Display", serif',
      fontBody: '"Work Sans", sans-serif',
    },
  },
];

// Minimal CSS syntax highlight for the export block — colors come from the
// site's Shiki palette (onda-shiki-theme) so it matches every other code block.
function highlightCss(css: string): React.ReactNode {
  return css.split('\n').map((line, i) => {
    const prefix = i > 0 ? '\n' : '';
    const decl = line.match(/^(\s*)(--[\w-]+)(:\s*)(.+?)(;)\s*$/);
    if (decl) {
      const [, indent, prop, colon, value, semi] = decl;
      const valueColor = value.trim().startsWith('#') ? ONDA.number : ONDA.string;
      return (
        <span key={i}>
          {prefix}
          {indent}
          <span style={{ color: ONDA.fg }}>{prop}</span>
          <span style={{ color: ONDA.dim }}>{colon}</span>
          <span style={{ color: valueColor }}>{value}</span>
          <span style={{ color: ONDA.dim }}>{semi}</span>
        </span>
      );
    }
    return (
      <span key={i} style={{ color: line.includes('}') ? ONDA.dim : ONDA.fg }}>
        {prefix}
        {line}
      </span>
    );
  });
}

// Same lightweight highlight for the JSON form — string keys/values in cyan,
// punctuation dim, matching the Shiki palette.
function highlightJson(json: string): React.ReactNode {
  return json.split('\n').map((line, i) => {
    const prefix = i > 0 ? '\n' : '';
    const decl = line.match(/^(\s*)("[^"]+")(:\s*)(.+?)(,?)$/);
    if (decl) {
      const [, indent, key, colon, value, comma] = decl;
      return (
        <span key={i}>
          {prefix}
          {indent}
          <span style={{ color: ONDA.fg }}>{key}</span>
          <span style={{ color: ONDA.dim }}>{colon}</span>
          <span style={{ color: ONDA.string }}>{value}</span>
          <span style={{ color: ONDA.dim }}>{comma}</span>
        </span>
      );
    }
    return (
      <span key={i} style={{ color: ONDA.dim }}>
        {prefix}
        {line}
      </span>
    );
  });
}

// The animated composition Player is client-only (the Remotion Player needs
// the DOM), so load it with ssr: false.
const BrandComposition = dynamic(() => import('./BrandPlayer'), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl bg-onda-surface" style={{ aspectRatio: '16 / 9' }} />
  ),
});

export default function BrandPlaygroundPage() {
  const [brand, setBrand] = useState<BrandState>(ONDA_BRAND);
  const [activePreset, setActivePreset] = useState<string | null>('Onda');

  const cssVars = {
    [CSS_VAR.bg]: brand.bg,
    [CSS_VAR.surface]: brand.surface,
    [CSS_VAR.surface2]: brand.surface2,
    [CSS_VAR.border]: brand.border,
    [CSS_VAR.borderLit]: brand.borderLit,
    [CSS_VAR.text]: brand.text,
    [CSS_VAR.dim]: brand.dim,
    [CSS_VAR.faint]: brand.faint,
    [CSS_VAR.accent]: brand.accent,
    [CSS_VAR.accentSoft]: brand.accentSoft,
    [CSS_VAR.fontDisplay]: brand.fontDisplay,
    [CSS_VAR.fontBody]: brand.fontBody,
  } as React.CSSProperties;

  const set = (key: keyof BrandState, value: string) => {
    setBrand((b) => ({ ...b, [key]: value }));
    setActivePreset(null); // manual edit no longer matches a preset
  };

  // Export — how a consumer actually uses the theme: paste the CSS into their
  // project, or hand the JSON to brandToCssVars() / <ThemeProvider>. A toggle
  // switches the format; the CodeBlock provides the copy affordance.
  const [format, setFormat] = useState<'css' | 'json'>('css');
  const cssText = [
    ':root {',
    ...COLOR_SLOTS.map((s) => `  ${s.varName}: ${brand[s.key]};`),
    `  ${CSS_VAR.fontDisplay}: ${brand.fontDisplay};`,
    `  ${CSS_VAR.fontBody}: ${brand.fontBody};`,
    '}',
  ].join('\n');
  const jsonText = JSON.stringify(brand, null, 2);

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
      {/* Google Fonts for the brand-font picker (hoisted to <head> by React). */}
      <link rel="stylesheet" href={GOOGLE_FONTS_HREF} />

      <header className="mb-10">
        <p className="text-onda-faint text-xs uppercase tracking-[0.18em] mb-3">
          Theme
        </p>
        <h1
          className="text-onda-text text-4xl md:text-5xl font-semibold tracking-tight"
          style={{ fontFamily: '"Clash Display", sans-serif' }}
        >
          Brand playground
        </h1>
        <p className="text-onda-dim mt-4 max-w-2xl leading-relaxed">
          Onda components read their colors and fonts from CSS variables. Set
          your brand below and every component re-skins — your palette, your
          type, Onda&apos;s motion. The default values are Onda&apos;s own, so
          unset slots always fall back gracefully.
        </p>
      </header>

      <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
        {/* ---- Controls ---- */}
        <aside className="lg:sticky lg:top-8 min-w-0 space-y-6 rounded-2xl border border-onda-border bg-onda-surface p-4 sm:p-5">
          <div>
            <p className="text-onda-text text-sm font-medium mb-3 flex items-center gap-2">
              Presets
              <span className="rounded-full border border-onda-border px-1.5 py-px text-[10px] font-mono text-onda-faint">
                {PRESETS.length}
              </span>
            </p>
            {/* Horizontal scroll — the list outgrows the sidebar. Badges stay
                small; the active one pops with an accent ring + slight scale. */}
            {/* py/px give the scaled + ringed active badge room so it isn't
                clipped by the scrollport; -mx keeps the row aligned to the
                sidebar edges. The active ring uses the preset's own accent. */}
            <div className="flex gap-2 overflow-x-auto -mx-2 px-2 py-2 [scrollbar-width:thin]">
              {PRESETS.map((p) => {
                const active = activePreset === p.name;
                return (
                  <button
                    key={p.name}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setBrand(p.brand);
                      setActivePreset(p.name);
                    }}
                    style={
                      active
                        ? {
                            borderColor: p.brand.accent,
                            boxShadow: `0 0 0 3px ${p.brand.accent}2A`,
                          }
                        : undefined
                    }
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] transition-all duration-200 ease-out active:scale-95 ${
                      active
                        ? 'bg-onda-surface text-onda-text scale-105'
                        : 'border-onda-border text-onda-dim hover:text-onda-text hover:border-onda-border-lit'
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-onda-text text-sm font-medium mb-3">Color</p>
            <div className="space-y-2">
              {COLOR_SLOTS.map((slot) => (
                <label
                  key={slot.key}
                  className="flex items-center gap-3 cursor-pointer min-w-0"
                >
                  <input
                    type="color"
                    aria-label={slot.label}
                    value={brand[slot.key]}
                    onChange={(e) => set(slot.key, e.target.value)}
                    className="h-8 w-8 shrink-0 cursor-pointer rounded-md border border-onda-border bg-transparent p-0"
                  />
                  <span className="min-w-0 leading-tight">
                    <span className="block text-onda-dim text-sm truncate">
                      {slot.label}
                    </span>
                    <span className="block text-onda-faint text-[10px] font-mono uppercase">
                      {brand[slot.key]}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-onda-text text-sm font-medium">Type</p>
            <label className="block">
              <span className="text-onda-dim text-xs">Display font</span>
              <select
                value={brand.fontDisplay}
                onChange={(e) => set('fontDisplay', e.target.value)}
                className="mt-1 w-full rounded-md border border-onda-border bg-onda-bg px-2 py-1.5 text-sm text-onda-text"
              >
                {DISPLAY_FONTS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-onda-dim text-xs">Body font</span>
              <select
                value={brand.fontBody}
                onChange={(e) => set('fontBody', e.target.value)}
                className="mt-1 w-full rounded-md border border-onda-border bg-onda-bg px-2 py-1.5 text-sm text-onda-text"
              >
                {BODY_FONTS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={() => {
              setBrand(ONDA_BRAND);
              setActivePreset('Onda');
            }}
            className="w-full rounded-lg border border-onda-border bg-onda-bg py-2 text-xs text-onda-dim hover:text-onda-text transition-colors"
          >
            Reset to Onda
          </button>
        </aside>

        {/* ---- Live preview (scoped to the brand vars) ---- */}
        <section
          style={{
            ...cssVars,
            background: THEME.bg,
            borderColor: THEME.border,
            color: THEME.text,
            fontFamily: THEME.fontBody,
          }}
          className="min-w-0 overflow-hidden rounded-2xl border p-4 sm:p-8 space-y-10"
        >
          {/* Animated composition — how the theme reads in motion (real Onda
              choreography, your colors + type). */}
          <BrandComposition />
          <PreviewSurface brand={brand} />
        </section>
      </div>

      {/* ---- Export (full width — a code block needs room to breathe) ---- */}
      <section className="mt-12 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              className="text-onda-text text-xl font-semibold tracking-tight"
              style={{ fontFamily: '"Clash Display", sans-serif' }}
            >
              Export your theme
            </h2>
            <p className="text-onda-dim text-sm mt-1 max-w-2xl leading-relaxed">
              Paste the CSS into your project (a wrapper or <code>:root</code>), or use the JSON
              with <code className="text-onda-text">brandToCssVars()</code> /{' '}
              <code className="text-onda-text">&lt;ThemeProvider&gt;</code>.{' '}
              <a
                href="/docs/theming"
                className="underline decoration-onda-border-lit underline-offset-2 hover:text-onda-text"
              >
                Theming guide →
              </a>
            </p>
          </div>
          {/* CSS / JSON toggle */}
          <div className="inline-flex rounded-lg border border-onda-border p-0.5 text-xs">
            {(['css', 'json'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={`rounded-md px-3 py-1.5 font-mono uppercase tracking-wider transition-colors ${
                  format === f
                    ? 'bg-onda-surface text-onda-text'
                    : 'text-onda-dim hover:text-onda-text'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="max-w-2xl">
          {format === 'css' ? (
            <CodeBlock className="language-css">
              <code>{highlightCss(cssText)}</code>
            </CodeBlock>
          ) : (
            <CodeBlock className="language-json">
              <code>{highlightJson(jsonText)}</code>
            </CodeBlock>
          )}
        </div>
      </section>
    </main>
  );
}

// Everything below reads the THEME var() tokens, so it tracks the enclosing
// brand vars. Kept inline (no Remotion) so it re-skins instantly.
function PreviewSurface({ brand }: { brand: BrandState }) {
  return (
    <>
      {/* Palette swatches */}
      <div className="space-y-3">
        <p style={{ color: THEME.faint }} className="text-xs uppercase tracking-[0.16em]">
          Palette
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {COLOR_SLOTS.map((slot) => (
            <div key={slot.key} className="min-w-0">
              <div
                style={{
                  background: `var(${slot.varName})`,
                  borderColor: THEME.border,
                }}
                className="h-16 rounded-xl border"
              />
              <p style={{ color: THEME.dim }} className="mt-1.5 text-xs">
                {slot.label}
              </p>
              <p style={{ color: THEME.faint }} className="text-[10px] font-mono">
                {brand[slot.key]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-2">
        <p style={{ color: THEME.faint }} className="text-xs uppercase tracking-[0.16em]">
          Type
        </p>
        <h2 style={{ fontFamily: THEME.fontDisplay, color: THEME.text }} className="text-3xl sm:text-4xl font-semibold tracking-tight">
          The quick brown fox
        </h2>
        <p style={{ fontFamily: THEME.fontBody, color: THEME.dim }} className="max-w-prose leading-relaxed">
          Body copy renders in your body font and dim text color. The accent is{' '}
          <span style={{ color: THEME.accent }} className="font-medium">earned</span> — one
          word, one underline, one call to action.
        </p>
      </div>

      {/* Component mockups */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Card */}
        <div
          style={{ background: THEME.surface, borderColor: THEME.border }}
          className="rounded-2xl border p-6"
        >
          <p style={{ color: THEME.faint }} className="text-[11px] uppercase tracking-[0.16em]">
            Feature
          </p>
          <h3 style={{ fontFamily: THEME.fontDisplay, color: THEME.text }} className="mt-2 text-xl font-semibold">
            Quality by construction
          </h3>
          <p style={{ color: THEME.dim }} className="mt-2 text-sm leading-relaxed">
            A raised surface with your border and text colors.
          </p>
          <div
            style={{ height: 3, width: 56, background: THEME.accent, borderRadius: 999 }}
            className="mt-4"
          />
        </div>

        {/* Open-source card — ondajs is free / MIT, so no pricing here */}
        <div
          style={{ background: THEME.surface, borderColor: THEME.borderLit }}
          className="rounded-2xl border p-6"
        >
          <p style={{ color: THEME.dim }} className="text-sm">Open source</p>
          <p style={{ fontFamily: THEME.fontDisplay, color: THEME.text }} className="mt-1 text-3xl font-semibold">
            Free<span style={{ color: THEME.faint }} className="text-base font-normal"> · MIT</span>
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {['Unlimited renders', 'Your brand, your fonts', 'Onda motion'].map((f) => (
              <li key={f} style={{ color: THEME.dim }} className="flex items-center gap-2">
                <span style={{ color: THEME.accent }}>✓</span>
                {f}
              </li>
            ))}
          </ul>
          <button
            type="button"
            style={{ background: THEME.accent, color: THEME.bg, fontFamily: THEME.fontBody }}
            className="mt-5 w-full rounded-lg py-2 text-sm font-medium"
          >
            Add a component
          </button>
        </div>
      </div>

      {/* Accent glow moment */}
      <div
        style={{ background: THEME.surface2, borderColor: THEME.border }}
        className="relative overflow-hidden rounded-2xl border p-8 sm:p-10 text-center"
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle 40% at 50% 30%, ${THEME.accent}, transparent 70%)`,
            opacity: 0.25,
          }}
        />
        <p style={{ fontFamily: THEME.fontDisplay, color: THEME.text }} className="relative text-2xl font-semibold">
          One focal move. <span style={{ color: THEME.accent }}>Earned</span> accent.
        </p>
      </div>
    </>
  );
}
