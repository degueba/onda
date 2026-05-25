import React from 'react';
import type { TransitionPresentation, TransitionPresentationComponentProps } from '@remotion/transitions';
import { AbsoluteFill, interpolate, Easing } from 'remotion';
import { devicePullbackSchema, type DevicePullbackOptions } from './schema';

export { devicePullbackSchema, type DevicePullbackOptions };

type DevicePullbackProps = {
  device: 'laptop' | 'phone';
  frameColor: string;
  startScale: number;
  background: string;
};

// House easing — no overshoot, settles smoothly.
const EASE = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * Per-device geometry, expressed as fractions of the framed content box so the
 * bezel scales with any canvas. `bezel` is the chrome thickness around the
 * content; `radius`/`screenRadius` keep the corners on the house ~20px scale.
 */
const DEVICE = {
  laptop: {
    bezel: 0.035,
    radius: 22,
    screenRadius: 8,
    // The laptop base/hinge that draws in beneath the screen.
    baseHeight: 0.05,
    baseInset: 0.06,
    notch: false,
  },
  phone: {
    bezel: 0.06,
    radius: 44,
    screenRadius: 30,
    baseHeight: 0,
    baseInset: 0,
    notch: true,
  },
} as const;

const DevicePullbackPresentation: React.FC<
  TransitionPresentationComponentProps<DevicePullbackProps>
> = ({ presentationProgress, presentationDirection, children, passedProps }) => {
  const { device, frameColor, startScale, background } = passedProps;
  const isEntering = presentationDirection === 'entering';

  // The incoming scene simply fades up underneath — the pull-back belongs to
  // the outgoing scene, which is the one being framed into the device.
  if (isEntering) {
    return (
      <AbsoluteFill style={{ opacity: presentationProgress }}>
        {children}
      </AbsoluteFill>
    );
  }

  const p = interpolate(presentationProgress, [0, 1], [0, 1], {
    easing: EASE,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const geo = DEVICE[device];

  // Content pulls back from startScale -> 1x.
  const scale = interpolate(p, [0, 1], [startScale, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // The framed content occupies less than the full canvas at rest so the bezel
  // has room to sit around it. It opens up from full-bleed (1) to framed.
  const framedWidth = interpolate(p, [0, 1], [1, 1 - geo.bezel * 2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const framedHeight = interpolate(
    p,
    [0, 1],
    [1, 1 - (geo.bezel * 2 + geo.baseHeight)],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Bezel chrome fades/draws in over the first ~70% so the device is fully
  // present before the cut, but the content read isn't interrupted up front.
  const chrome = interpolate(p, [0, 0.7], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const screenRadius = interpolate(p, [0, 1], [0, geo.screenRadius], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: background }}>
      {/* Device shell — sits behind the content, drawn in as chrome rises. */}
      <AbsoluteFill
        style={{
          width: `${framedWidth * 100}%`,
          height: `${(framedHeight + geo.bezel * 2 + geo.baseHeight) * 100}%`,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: frameColor,
          borderRadius: geo.radius,
          opacity: chrome,
          boxShadow: '0 30px 60px -34px rgba(0,0,0,0.9)',
        }}
      >
        {/* Subtle top sheen on the bezel. */}
        <AbsoluteFill
          style={{
            borderRadius: geo.radius,
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0) 18%)',
            pointerEvents: 'none',
          }}
        />
        {geo.notch ? (
          <div
            style={{
              position: 'absolute',
              top: '2.2%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '34%',
              height: '2.6%',
              backgroundColor: frameColor,
              borderRadius: 999,
              filter: 'brightness(0.7)',
            }}
          />
        ) : null}
        {geo.baseHeight > 0 ? (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: `${geo.baseInset * 100}%`,
              right: `${geo.baseInset * 100}%`,
              height: `${(geo.baseHeight / (framedHeight + geo.bezel * 2 + geo.baseHeight)) * 100}%`,
              backgroundColor: frameColor,
              borderBottomLeftRadius: geo.radius,
              borderBottomRightRadius: geo.radius,
              filter: 'brightness(0.85)',
            }}
          />
        ) : null}
      </AbsoluteFill>

      {/* The content — scales back from full-bleed into the device screen. */}
      <AbsoluteFill
        style={{
          width: `${framedWidth * 100}%`,
          height: `${framedHeight * 100}%`,
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
          borderRadius: screenRadius,
          overflow: 'hidden',
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * The outgoing scene starts as full-bleed UI scaled up, then pulls back to 1x
 * while a minimal device bezel (laptop or phone) draws in around it — so the
 * cut lands on the content framed inside a device mockup. A "pull back to
 * reveal the product" beat, common in launch and feature reels.
 *
 * Pair with the recommended Onda timing for the house feel:
 * `linearTiming({ durationInFrames: 24, easing: Easing.bezier(0.16, 1, 0.3, 1) })`
 *
 * Onda-original.
 */
export function devicePullback(
  options?: DevicePullbackOptions,
): TransitionPresentation<DevicePullbackProps> {
  const opts = devicePullbackSchema.parse(options ?? {});
  return {
    component: DevicePullbackPresentation,
    props: {
      device: opts.device,
      frameColor: opts.frameColor,
      startScale: opts.startScale,
      background: opts.background,
    },
  };
}

export default devicePullback;
