'use client';

import { useState } from 'react';

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
      className="text-xs font-medium uppercase tracking-wider text-onda-faint hover:text-onda-text transition-colors px-2 py-1 rounded-md"
      aria-label={`Copy ${text}`}
    >
      {copied ? 'Copied' : label}
    </button>
  );
}
