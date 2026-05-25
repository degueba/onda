import React from 'react';
import { useVideoConfig } from 'remotion';

/**
 * A render-safe 2D camera. Renders an oversized "world" (its children, laid
 * out in world-pixel coordinates) and frames it: centers a world point in the
 * viewport at a given zoom, with optional roll. Used for pans across a grid
 * larger than the canvas, push-in "fly-overs", and focus moves that dim the
 * rest of a scene.
 *
 * Deliberately 2D — translate + scale + rotate only, `transform-style: flat`.
 * No `preserve-3d`: nested 3D contexts flatten unpredictably in Remotion's
 * render path, so depth is faked with layered children + per-layer scale/blur
 * instead — cheaper and fully deterministic (CLAUDE.md §1).
 *
 * Position/size is owned by the camera (it fills its positioned parent); lay
 * the children out in absolute world coordinates. Pair with {@link useCameraRig}
 * to interpolate focus/zoom/roll across keyframes.
 */
export type CameraProps = {
  /** The world — children laid out in absolute world-pixel coordinates. */
  children?: React.ReactNode;
  /** World x (px) to center in the viewport. Defaults to viewport center (no pan). */
  focusX?: number;
  /** World y (px) to center in the viewport. Defaults to viewport center (no pan). */
  focusY?: number;
  /** Zoom factor about the focus point. 1 = neutral, >1 = pushed in. */
  zoom?: number;
  /** Camera roll in degrees (2D rotation about the focus point). */
  rotate?: number;
  /** Override the viewport size; defaults to the Remotion canvas (`useVideoConfig`). */
  viewportWidth?: number;
  viewportHeight?: number;
};

export const Camera: React.FC<CameraProps> = ({
  children,
  focusX,
  focusY,
  zoom = 1,
  rotate = 0,
  viewportWidth,
  viewportHeight,
}) => {
  const config = useVideoConfig();
  const vw = viewportWidth ?? config.width;
  const vh = viewportHeight ?? config.height;
  const fx = focusX ?? vw / 2;
  const fy = focusY ?? vh / 2;

  // Map world point (fx, fy) to viewport center, then zoom + roll about it.
  // Read right-to-left: shift focus to origin → scale → rotate → recenter.
  const transform =
    `translate(${vw / 2}px, ${vh / 2}px) ` +
    `rotate(${rotate}deg) scale(${zoom}) ` +
    `translate(${-fx}px, ${-fy}px)`;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transformOrigin: '0 0',
          transformStyle: 'flat',
          transform,
        }}
      >
        {children}
      </div>
    </div>
  );
};
