'use client';

import { Player, type PlayerRef } from '@remotion/player';
import { AbsoluteFill } from 'remotion';
import { Pause, Play } from '@phosphor-icons/react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from 'react';

type Props<T extends Record<string, unknown>> = {
  component: ComponentType<T>;
  inputProps: T;
  durationInFrames?: number;
  fps?: number;
  compositionWidth?: number;
  compositionHeight?: number;
  autoPlay?: boolean;
  loop?: boolean;
  // Gallery mode: don't autoplay, play only while hovered, reset to frame 0
  // on leave, and hide all player chrome (button + time readout) so a grid of
  // cards reads as a showcase rather than a wall of running players.
  hoverToPlay?: boolean;
  className?: string;
};

// Renders a Remotion component on the Onda canvas with a custom play / pause
// overlay. The overlay is always visible when paused and fades out while
// playing — it returns on hover so the affordance is never more than a
// mouse-move away.
export function ComponentPreview<T extends Record<string, unknown>>({
  component: Component,
  inputProps,
  durationInFrames = 90,
  fps = 30,
  compositionWidth = 1920,
  compositionHeight = 1080,
  autoPlay = true,
  loop = true,
  hoverToPlay = false,
  className,
}: Props<T>) {
  // Hover mode owns playback entirely — mount autoplay would fight the
  // play-on-hover / pause-on-leave handlers.
  const effectiveAutoPlay = hoverToPlay ? false : autoPlay;
  // Memoize so <Player /> sees a stable component identity across renders —
  // otherwise it tears down and re-mounts on every parent re-render and
  // playback never starts.
  const Wrapped = useMemo(() => {
    const WrappedComponent = (props: T) => (
      <AbsoluteFill
        style={{
          backgroundColor: '#08080A',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Component {...props} />
      </AbsoluteFill>
    );
    return WrappedComponent;
  }, [Component]);

  const playerRef = useRef<PlayerRef>(null);
  // Latest hover state for the gesture-primer listener (avoids a stale closure).
  const hoveringRef = useRef(false);
  // True once the user has produced a real activation gesture (click/key/touch).
  // Muted previews may play without a gesture, but AUDIO may not — so we only
  // unmute after the page has been activated (keeps showcases with sound silent
  // on the very first cold hover, audible once the user has interacted).
  const interactedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);

  // Mirror Player's play/pause state and current frame into React so the
  // overlay and time readout can react.
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    const onFrameUpdate = (e: { detail: { frame: number } }) => {
      setCurrentFrame(e.detail.frame);
    };
    player.addEventListener('play', onPlay);
    player.addEventListener('pause', onPause);
    player.addEventListener('ended', onEnded);
    player.addEventListener('frameupdate', onFrameUpdate);
    return () => {
      player.removeEventListener('play', onPlay);
      player.removeEventListener('pause', onPause);
      player.removeEventListener('ended', onEnded);
      player.removeEventListener('frameupdate', onFrameUpdate);
    };
  }, []);

  // Autoplay strategy: <Player autoPlay> + numberOfSharedAudioTags=0 is not
  // enough on a fresh page load — modern browsers block media play() with no
  // prior user gesture. We layer three attempts:
  //   1. immediate (covers already-permitted contexts)
  //   2. a few delayed retries (covers ref-not-ready / player-not-ready)
  //   3. a one-shot "play on first interaction" fallback that catches the
  //      first mousemove / pointerdown / keydown — typically within a
  //      second of the user landing.
  useEffect(() => {
    if (!effectiveAutoPlay) return;
    let cancelled = false;

    const tryPlay = () => {
      if (cancelled) return;
      const player = playerRef.current;
      if (!player || player.isPlaying()) return;
      player.play();
    };

    tryPlay();
    const timeoutIds = [50, 200, 500, 1000].map((ms) =>
      window.setTimeout(tryPlay, ms),
    );

    const onInteract = () => {
      tryPlay();
      cleanupListeners();
    };
    const cleanupListeners = () => {
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('pointermove', onInteract);
      window.removeEventListener('keydown', onInteract);
      window.removeEventListener('touchstart', onInteract);
    };
    window.addEventListener('pointerdown', onInteract, { once: true });
    window.addEventListener('pointermove', onInteract, { once: true });
    window.addEventListener('keydown', onInteract, { once: true });
    window.addEventListener('touchstart', onInteract, { once: true });

    return () => {
      cancelled = true;
      timeoutIds.forEach(window.clearTimeout);
      cleanupListeners();
    };
  }, [effectiveAutoPlay, Wrapped]);

  const toggle = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (player.isPlaying()) player.pause();
    else player.play();
  }, []);

  // hoverToPlay can't start on the first hover after a fresh page load:
  // `mouseenter` is NOT a user-activation gesture, so the browser blocks the
  // Player's play() until a real gesture (click / keydown / touch). Before
  // this, playback only "unlocked" after navigating (the nav click was the
  // gesture). Prime it: on the first such gesture, if this preview is being
  // hovered, start it — and the activation makes every later hover work too.
  useEffect(() => {
    if (!hoverToPlay) return;
    const onGesture = () => {
      interactedRef.current = true;
      if (hoveringRef.current) {
        const player = playerRef.current;
        if (player) {
          player.play();
          player.unmute(); // page is now activated → audio allowed
        }
      }
    };
    window.addEventListener('pointerdown', onGesture);
    window.addEventListener('keydown', onGesture);
    window.addEventListener('touchstart', onGesture);
    return () => {
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
      window.removeEventListener('touchstart', onGesture);
    };
  }, [hoverToPlay]);

  const showOverlay = !isPlaying || isHovering;

  // Time readout — seconds with one decimal. All Onda previews are short
  // loops (< 60s), so MM:SS would be mostly leading zeroes. Tabular numerals
  // keep the width steady as the digit ticks.
  const currentSec = (currentFrame / fps).toFixed(1);
  const totalSec = (durationInFrames / fps).toFixed(1);

  return (
    <div
      className={`relative w-full h-full ${className ?? ''}`}
      onMouseEnter={() => {
        setIsHovering(true);
        hoveringRef.current = true;
        if (hoverToPlay) {
          const player = playerRef.current;
          if (player) {
            player.play();
            // Unmute once the page has been activated so showcases with audio
            // are audible on hover; before activation they play muted (visual).
            const activated =
              interactedRef.current ||
              Boolean(
                (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } })
                  .userActivation?.hasBeenActive,
              );
            if (activated) player.unmute();
          }
        }
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        hoveringRef.current = false;
        if (hoverToPlay) {
          const player = playerRef.current;
          if (player) {
            player.pause();
            player.seekTo(0);
          }
        }
      }}
    >
      <Player
        ref={playerRef}
        component={Wrapped}
        inputProps={inputProps}
        durationInFrames={durationInFrames}
        fps={fps}
        compositionWidth={compositionWidth}
        compositionHeight={compositionHeight}
        autoPlay={effectiveAutoPlay}
        loop={loop}
        controls={false}
        clickToPlay={false}
        // Gallery (hoverToPlay) tiles start MUTED so the browser allows
        // playback without a prior user gesture — otherwise the first hover
        // after a cold page load is blocked (mouseenter isn't user activation)
        // and playback only "unlocks" after a navigation click. Onda previews
        // carry no essential audio, so muting the grid thumbnails is harmless;
        // the detail page / hero (autoPlay, not hoverToPlay) stay unmuted.
        initiallyMuted={hoverToPlay}
        // Disable Remotion's preloaded shared audio elements. Browsers treat
        // those as autoplay-restricted media and block Player.play() on
        // mount, even though Onda compositions have no audio. Without this,
        // the Hero (and any auto-playing preview) silently fails to start.
        numberOfSharedAudioTags={0}
        acknowledgeRemotionLicense
        style={{ width: '100%', height: '100%', display: 'block' }}
      />

      {!hoverToPlay && (
        <button
          type="button"
          onClick={toggle}
          aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
          className={`
            absolute inset-0 grid place-items-center
            transition-opacity duration-300 ease-out
            focus:outline-none
            ${showOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
        >
          <span
            className="
              grid place-items-center
              h-9 w-9 rounded-full
              bg-onda-surface/70 backdrop-blur-md
              border border-onda-border-lit
              text-onda-text
              shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)]
              transition-all duration-200 ease-out
              hover:bg-onda-surface hover:scale-105 hover:border-onda-text/40
              active:scale-95
            "
          >
            {isPlaying ? (
              <Pause size={16} weight="fill" />
            ) : (
              // The triangle's visual mass is on the left — nudge right 1px so
              // it reads as optically centered.
              <Play size={16} weight="fill" className="translate-x-px" />
            )}
          </span>
        </button>
      )}

      {/* Time readout. Sits in the bottom-right corner, restrained so it
          never competes with the content. Current frame in onda-text,
          slash in onda-faint (barely there), total in onda-dim — the eye
          lands on the moving digit, treats the rest as scaffold. Fades
          to 60% opacity while playing without hover, full otherwise. */}
      {!hoverToPlay && (
        <div
          className={`
            absolute bottom-3 right-3 pointer-events-none
            px-2 py-1 rounded-md
            bg-onda-bg/60 backdrop-blur-md
            border border-onda-border
            font-mono text-[11px] tabular-nums leading-none
            transition-opacity duration-300 ease-out
            ${isPlaying && !isHovering ? 'opacity-60' : 'opacity-100'}
          `}
        >
          <span className="text-onda-text">{currentSec}</span>
          <span className="text-onda-faint mx-1">/</span>
          <span className="text-onda-dim">{totalSec}s</span>
        </div>
      )}
    </div>
  );
}
