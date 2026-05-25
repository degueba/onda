// Small pill that flags a composition as having audio. Three vertical
// bars pulse out of phase to read as "equalizer playing" at a glance —
// the universal audio-active visual. Lives absolutely positioned in the
// top-right of a ShowcasePreview frame.

export function AudioBadge() {
  return (
    <div
      className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-onda-bg/60 backdrop-blur-md border border-onda-border pointer-events-none z-10"
      aria-label="This composition includes audio"
    >
      <span aria-hidden className="flex items-end gap-[2px] h-3">
        <span
          className="onda-eq-bar w-[2px] h-full bg-onda-accent rounded-sm"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="onda-eq-bar w-[2px] h-full bg-onda-accent rounded-sm"
          style={{ animationDelay: '180ms' }}
        />
        <span
          className="onda-eq-bar w-[2px] h-full bg-onda-accent rounded-sm"
          style={{ animationDelay: '360ms' }}
        />
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-onda-dim leading-none">
        Audio
      </span>
    </div>
  );
}
