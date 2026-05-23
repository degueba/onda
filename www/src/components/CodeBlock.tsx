'use client';

import { Check, Copy } from '@phosphor-icons/react';
import {
  useCallback,
  useRef,
  useState,
  type ComponentProps,
} from 'react';

// Custom <pre> for the MDX pipeline. Wraps the Shiki-highlighted pre with a
// top-right copy affordance. Sits subtly by default (opacity-60), pops on
// hover, and flashes a rose accent ring on successful copy — the one moment
// the brand color is allowed to celebrate.
export function CodeBlock({
  children,
  className,
  ...rest
}: ComponentProps<'pre'>) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const text = preRef.current?.textContent ?? '';
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Older browsers / missing permission — fail silently. The visible code
      // is still selectable for manual copy.
    }
  }, []);

  return (
    <div className="relative group not-prose">
      <pre ref={preRef} className={className} {...rest}>
        {children}
      </pre>

      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Copied to clipboard' : 'Copy code to clipboard'}
        className={`
          absolute top-3 right-3
          inline-flex items-center gap-1.5
          px-2.5 py-1.5 rounded-md
          bg-onda-bg/70 backdrop-blur-md
          border
          font-mono text-[11px] uppercase tracking-wider
          transition-all duration-200 ease-out
          active:scale-95
          focus:outline-none focus-visible:ring-2 focus-visible:ring-onda-accent/40
          opacity-60 group-hover:opacity-100
          ${
            copied
              ? 'border-onda-accent/50 text-onda-accent opacity-100 shadow-[0_0_0_3px_rgba(217,107,130,0.12)]'
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
  );
}
