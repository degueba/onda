// Render Remotion's `<Player>` at the resolution it'll actually be
// displayed at — not at the composition's intrinsic dims (e.g. 1920×1080)
// with a downscale tacked on after. The default Player pattern
// (`compositionWidth={1920}` in a 330px CSS container on a mobile card)
// causes a heavy transform-scale that softens thin borders and sub-pixel
// anti-aliasing. Matching the render resolution to the displayed size ×
// DPR keeps the same visual layout while dramatically improving fidelity
// on small containers — and renders fewer pixels per frame, so it's
// cheaper too.
//
// Two surfaces:
//   - `<AdaptivePlayer>` (primary) — drop-in replacement for `<Player>`;
//     manages its own measurement container internally.
//   - `useAdaptiveCompositionSize(ref, w, h)` — the underlying hook, if
//     you're already managing your own wrapper / ref and only want the
//     sizing math.
//
// Why it lives in `lib/` rather than just the docs site: any consumer
// embedding Onda compositions in a Remotion Player on their own page
// (marketing site, AI editor preview, Storybook-style catalog) hits the
// same downscale problem. Shipping the typed answer once means every
// developer using `ondajs` gets it for free.

import { Player, type PlayerPropsWithoutZod } from '@remotion/player';
import {
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';

/** Floor for the adaptive composition resolution. Below this, components
 *  that use absolute pixel sizes (raw `fontSize: 56` rather than
 *  `SizeRole: 'hero'`) start to read as chunky relative to the canvas.
 *  720px on the long edge keeps `useVideoConfig()`-driven text legible
 *  while still matching small mobile cards closely enough to avoid the
 *  heavy transform-scale that causes pixelation. */
export const DEFAULT_MIN_RENDER_LONG_EDGE = 720;

/**
 * Measure an element and project its size onto a composition's aspect
 * ratio, with a floor and an intrinsic cap. Returns the resolution the
 * Player should render at to look crisp inside that element.
 *
 * Capped at the intrinsic dims (we never render at a higher resolution
 * than the source) — the cap matters for big containers on Retina
 * monitors where going past the intrinsic resolution buys nothing but
 * burns frame budget.
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const { width, height } = useAdaptiveCompositionSize(ref, 1920, 1080);
 * return (
 *   <div ref={ref} style={{ width: '100%', aspectRatio: '16/9' }}>
 *     <Player component={...} compositionWidth={width} compositionHeight={height} {...} />
 *   </div>
 * );
 */
export function useAdaptiveCompositionSize(
  ref: RefObject<HTMLElement | null>,
  intrinsicWidth: number,
  intrinsicHeight: number,
  minRenderLongEdge: number = DEFAULT_MIN_RENDER_LONG_EDGE,
): { width: number; height: number } {
  const [size, setSize] = useState({
    width: intrinsicWidth,
    height: intrinsicHeight,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const dpr =
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

    const measure = (cssWidth: number, cssHeight: number) => {
      if (cssWidth <= 0 || cssHeight <= 0) return;
      // Drive off the longer CSS edge × DPR, then derive the other edge
      // from the intrinsic aspect ratio. This keeps the composition's
      // coordinate space proportional to the source — components that
      // use `SizeRole` props (which call
      // `Math.min(width, height) * roleRatio`) get the visual hierarchy
      // they were designed for; raw-pixel props scale relatively larger
      // on small cards, which reads as "more legible thumbnail" rather
      // than broken.
      const cssLong = cssWidth >= cssHeight ? cssWidth : cssHeight;
      const intrinsicLong =
        intrinsicWidth >= intrinsicHeight ? intrinsicWidth : intrinsicHeight;
      const targetLong = Math.min(
        intrinsicLong,
        Math.max(minRenderLongEdge, Math.round(cssLong * dpr)),
      );
      const scale = targetLong / intrinsicLong;
      const w = Math.round(intrinsicWidth * scale);
      const h = Math.round(intrinsicHeight * scale);
      setSize((prev) =>
        prev.width === w && prev.height === h ? prev : { width: w, height: h },
      );
    };

    // Prime with the current size so the Player mounts at the right
    // resolution on the first frame, not after the first
    // ResizeObserver tick.
    const rect = el.getBoundingClientRect();
    measure(rect.width, rect.height);

    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const box = entry.contentBoxSize?.[0];
        const w = box ? box.inlineSize : entry.contentRect.width;
        const h = box ? box.blockSize : entry.contentRect.height;
        measure(w, h);
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, intrinsicWidth, intrinsicHeight, minRenderLongEdge]);

  return size;
}

export type AdaptivePlayerProps<T extends Record<string, unknown>> = Omit<
  PlayerPropsWithoutZod<T>,
  'compositionWidth' | 'compositionHeight'
> & {
  /** The composition's intrinsic resolution. The Player will render at
   *  no more than this — and never less than `minRenderLongEdge` on the
   *  long edge — based on the actual displayed size × DPR. */
  compositionWidth: number;
  compositionHeight: number;
  /** Override the render-resolution floor. Defaults to
   *  {@link DEFAULT_MIN_RENDER_LONG_EDGE} (720px on the long edge). */
  minRenderLongEdge?: number;
  /** Wrapper-level style. Forwarded to the measurement container that
   *  wraps the underlying `<Player>` — set `width` / `height` /
   *  `aspectRatio` here. The `style` prop you'd normally pass to Player
   *  goes through {@link AdaptivePlayerProps.playerStyle} instead. */
  style?: React.CSSProperties;
  /** Forwarded to the underlying `<Player style={...}>`. Defaults to a
   *  full-fill block so the Player fills the adaptive wrapper. */
  playerStyle?: React.CSSProperties;
  /** Wrapper-level className (applied to the measurement container). */
  className?: string;
};

/**
 * Drop-in replacement for Remotion's `<Player>` that renders at the
 * resolution it's displayed at, not the composition's intrinsic dims.
 *
 * Pass `compositionWidth` and `compositionHeight` as the source's
 * intrinsic resolution — same as Remotion's `<Player>`. The wrapper
 * measures itself, picks an appropriate render resolution (floored at
 * `minRenderLongEdge`, capped at intrinsic), and passes that to the
 * underlying Player. Aspect ratio is preserved exactly.
 *
 * @example
 * <AdaptivePlayer
 *   component={MyComposition}
 *   inputProps={{ … }}
 *   durationInFrames={150}
 *   fps={30}
 *   compositionWidth={1920}
 *   compositionHeight={1080}
 *   autoPlay
 *   loop
 *   style={{ width: '100%', aspectRatio: '16 / 9' }}
 * />
 */
export function AdaptivePlayer<T extends Record<string, unknown>>({
  compositionWidth,
  compositionHeight,
  minRenderLongEdge,
  style,
  playerStyle,
  className,
  ...playerProps
}: AdaptivePlayerProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const { width, height } = useAdaptiveCompositionSize(
    ref,
    compositionWidth,
    compositionHeight,
    minRenderLongEdge,
  );

  return (
    <div ref={ref} className={className} style={style}>
      {/* Cast to `any` is intentional: Remotion's `<Player>` carries
          conditional generics (`{} extends T ? required-inputProps :
          optional-inputProps`) and a `RefAttributes<PlayerRef>` tail
          that defeats structural matching against our spread. The
          public type surface (`AdaptivePlayerProps<T>` above) already
          enforces the contract for callers; this cast just unblocks
          forwarding. */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Player
        {...(playerProps as any)}
        compositionWidth={width}
        compositionHeight={height}
        style={
          playerStyle ?? { width: '100%', height: '100%', display: 'block' }
        }
      />
    </div>
  );
}
