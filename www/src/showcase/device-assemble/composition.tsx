'use client';

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Camera, useCameraRig } from '@onda/lib/index';
import { DeviceFrame, deviceFrameSchema } from '@onda/registry/components/device-frame/DeviceFrame';
import { BentoGrid, bentoGridSchema } from '@onda/registry/components/bento-grid/BentoGrid';
import { ShimmerSweep, shimmerSweepSchema } from '@onda/registry/components/shimmer-sweep/ShimmerSweep';

const VIEWPORT_W = 1280;
const VIEWPORT_H = 720;

// Laptop device: screen is width × width*0.62 with ~width*0.02 bezel. At
// width 980 the inner screen is ~940×569 — enough room for a 3-up bento
// dashboard plus a sweeping header. The screen clips via overflow:hidden.
const DEVICE_WIDTH = 980;

// The dashboard that reveals on the laptop screen — a shimmer-sweep header
// (the "wake-up" pass of light) above an animated bento-grid. No `placement`
// on either child, so they render inline inside the device screen.
const ScreenDashboard: React.FC = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      padding: '34px 40px',
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      background: '#0E0E12',
    }}
  >
    <ShimmerSweep
      {...shimmerSweepSchema.parse({
        text: 'Overview',
        fontSize: 52,
        delay: 24,
        duration: 38,
        align: 'left',
      })}
    />
    <BentoGrid
      {...bentoGridSchema.parse({
        width: 860,
        columns: 3,
        fontSize: 24,
        gap: 16,
        padding: 20,
        delay: 14,
        stagger: 4,
        items: [
          { title: 'Revenue', value: '$48k', caption: 'This month.', colSpan: 1, rowSpan: 1, accent: true },
          { title: 'Active', value: '2.1k', caption: 'Live sessions.', colSpan: 1, rowSpan: 1, accent: false },
          { title: 'Churn', value: '0.8%', caption: 'Down 3 pts.', colSpan: 1, rowSpan: 1, accent: false },
          { title: 'Pipeline', caption: 'Healthy across every stage.', colSpan: 3, rowSpan: 1, accent: false },
        ],
      })}
    />
  </div>
);

// A gentle Camera push-in lands on the device (zoom 1 → 1.08). The device is
// the only thing in the world, centered on the viewport.
export const DeviceAssembleComposition: React.FC = () => {
  const rig = useCameraRig([
    { frame: 0, focusX: VIEWPORT_W / 2, focusY: VIEWPORT_H / 2, zoom: 1 },
    { frame: 150, focusX: VIEWPORT_W / 2, focusY: VIEWPORT_H / 2, zoom: 1.08 },
  ]);

  return (
    <AbsoluteFill style={{ background: '#08080A' }}>
      <Camera {...rig} viewportWidth={VIEWPORT_W} viewportHeight={VIEWPORT_H}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: VIEWPORT_W, height: VIEWPORT_H }}>
          <DeviceFrame
            {...deviceFrameSchema.parse({
              device: 'laptop',
              width: DEVICE_WIDTH,
              placement: 'center',
            })}
          >
            <ScreenDashboard />
          </DeviceFrame>
        </div>
      </Camera>
    </AbsoluteFill>
  );
};
