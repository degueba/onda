'use client';

import { Check, Copy } from '@phosphor-icons/react';
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from 'react';

// Onda's code-block chrome wrapping a Shiki-highlighted <pre>:
//   - pure-black surface with a hairline border and a faint rose-tinted
//     outer glow (premium, not decorative)
//   - top bar with the detected language pill (left) + copy (right),
//     divided from the code by a single hairline rule
//   - max-height with internal scroll and gradient fade-out at the top
//     and bottom edges so long snippets don't run forever
//
// Used as the `pre` slot for every MDXRemote pipeline on the site.
// Anything that wants Onda's code look-and-feel goes through this — the
// rule lives in CLAUDE.md §5.

// Derive the display language from the className Shiki sets on <pre>
// (`shiki language-tsx`). Falls back to `TSX` for our default.
function detectLanguage(className: string | undefined): string {
  const match = className?.match(/language-(\w+)/);
  return (match?.[1] ?? 'tsx').toUpperCase();
}

export function CodeBlock({
  children,
  className,
  style,
  ...rest
}: ComponentProps<'pre'>) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const language = useMemo(() => detectLanguage(className), [className]);

  const handleCopy = useCallback(async () => {
    const text = preRef.current?.textContent ?? '';
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Older browsers / missing permission — fail silently. The visible
      // code is still selectable for manual copy.
    }
  }, []);

  return (
    <div
      className="
        not-prose relative
        rounded-xl overflow-hidden
        bg-black
        border border-onda-border
        shadow-[0_0_0_1px_rgba(217,107,130,0.06),0_20px_50px_-30px_rgba(0,0,0,0.9)]
      "
    >
      {/* Top bar: language pill + copy button + hairline divider. */}
      <div
        className="
          flex items-center justify-between
          px-3 py-2
          border-b border-onda-border
          bg-black
        "
      >
        <span
          className="
            font-mono text-[10px] uppercase tracking-[0.16em]
            text-onda-faint
          "
        >
          {language}
        </span>

        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Copied to clipboard' : 'Copy code to clipboard'}
          className={`
            inline-flex items-center gap-1.5
            px-2 py-1 rounded-md
            font-mono text-[11px] uppercase tracking-wider
            border
            transition-all duration-200 ease-out
            active:scale-95
            focus:outline-none focus-visible:ring-2 focus-visible:ring-onda-accent/40
            ${
              copied
                ? 'border-onda-accent/50 text-onda-accent'
                : 'border-onda-border text-onda-dim hover:text-onda-text hover:border-onda-border-lit'
            }
          `}
        >
          {copied ? (
            <Check size={12} weight="bold" />
          ) : (
            <Copy size={12} weight="bold" />
          )}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Scroll region. Max-height caps the block so long snippets don't
          push the page; gradient fade-outs at top/bottom hint that more
          code is offscreen above/below the visible window. */}
      <div className="relative">
        <pre
          ref={preRef}
          className={`
            ${className ?? ''}
            bg-black! m-0! px-4 py-4
            max-h-60 overflow-auto
            onda-code-scroll
          `}
          style={style}
          {...rest}
        >
          {children}
        </pre>

        {/* Edge fade overlays — pointer-events-none so they don't block
            text selection or the scrollbar. The black-to-transparent
            gradient masks the first/last visible line so it reads as
            "more above/below" instead of an abrupt cut. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-linear-to-b from-black to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-linear-to-t from-black to-transparent"
        />
      </div>
    </div>
  );
}
