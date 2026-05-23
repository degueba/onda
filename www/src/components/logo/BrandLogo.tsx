// The Onda brand logo — mark + wordmark together.
//
// Pairs the animated BrandMark with the "Onda" word in Clash Display. The
// mark is vertically centered against the wordmark x-height and sits to its
// LEFT, separated by a half-icon-height gap. Sizing is height-driven: pass
// one number and both the mark and the wordmark scale to match.
//
// Use this anywhere the full brand should read — nav, hero placements, the
// docs site header. For icon-only contexts, use BrandMark directly.

import { BrandMark } from './BrandMark';

type BrandLogoProps = {
  /** Pixel height of the mark — the wordmark scales to match. */
  height?: number;
  /** Play the mark's entry + drift animations. */
  animate?: boolean;
  /** Optional outer wrapper class. */
  className?: string;
};

export function BrandLogo({
  height = 24,
  animate = true,
  className,
}: BrandLogoProps) {
  // Wordmark sits ~1.5× the mark height so "Onda" reads at headline weight
  // without dwarfing the wave. Gap is half the mark height — tight enough
  // to read as a single logo, loose enough to keep both elements distinct.
  const wordSize = Math.round(height * 1.5);
  const gap = Math.round(height * 0.5);

  return (
    <span
      className={`inline-flex items-center text-onda-text ${className ?? ''}`}
      style={{ gap }}
      aria-label="Onda"
    >
      <BrandMark height={height} animate={animate} />
      <span
        className="font-display font-semibold tracking-tight leading-none"
        style={{ fontSize: wordSize }}
        // Hide the wordmark from screen readers — the outer span already
        // announces "Onda" via aria-label, so we'd duplicate otherwise.
        aria-hidden
      >
        Onda
      </span>
    </span>
  );
}
