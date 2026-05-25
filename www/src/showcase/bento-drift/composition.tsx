'use client';

import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame, interpolate } from 'remotion';
import { Camera } from '@onda/lib/index';
import { Vignette, vignetteSchema } from '@onda/registry/components/vignette/Vignette';

const VIEWPORT_W = 1280;
const VIEWPORT_H = 720;
const WORLD_W = 4000;
const WORLD_H = 2500;
const DURATION = 270;

// One bento tile: a colorful image filling its grid cell with a slow,
// deterministic ken-burns. Direction (in/out) and origin vary per tile (keyed
// off `lock`) so the whole plane shimmers with life as the camera glides,
// rather than every tile zooming in lockstep.
const Tile: React.FC<{ area: string; topic: string; lock: number }> = ({ area, topic, lock }) => {
  const frame = useCurrentFrame();
  const zoomIn = lock % 2 === 0;
  const scale = interpolate(frame, [0, DURATION], zoomIn ? [1.05, 1.18] : [1.18, 1.05], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const originX = (lock % 3) * 50; // 0 / 50 / 100%
  const originY = (Math.floor(lock / 3) % 3) * 50;
  return (
    <div
      style={{
        gridArea: area,
        position: 'relative',
        borderRadius: 22,
        overflow: 'hidden',
        border: '1px solid #26262E',
        // Floating "glass" depth: deep soft drop shadow + a 1px top sheen.
        boxShadow: '0 38px 72px -36px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.14)',
      }}
    >
      {/* LoremFlickr serves free Flickr photos by keyword — vibrant topics give
          colorful tiles; `lock` pins a stable image so the render stays
          deterministic (only the ken-burns scale changes per frame). */}
      <Img
        src={`https://loremflickr.com/1000/1000/${topic}?lock=${lock}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
          transformOrigin: `${originX}% ${originY}%`,
        }}
      />
    </div>
  );
};

// 15 tiles that EXACTLY tile an 8×5 grid (varying spans = bento), no gaps, no
// overlaps. gridArea = "row-start / col-start / row-end / col-end". The grid is
// larger than the camera ever shows, so the pan keeps revealing fresh tiles.
const TILES: Array<{ area: string; topic: string; lock: number }> = [
  { area: '1 / 1 / 3 / 3', topic: 'neon', lock: 11 },
  { area: '1 / 3 / 2 / 6', topic: 'sunset', lock: 12 },
  { area: '1 / 6 / 3 / 9', topic: 'aurora', lock: 13 },
  { area: '2 / 3 / 3 / 5', topic: 'colorful', lock: 14 },
  { area: '2 / 5 / 3 / 6', topic: 'paint', lock: 15 },
  { area: '3 / 1 / 5 / 2', topic: 'graffiti', lock: 16 },
  { area: '3 / 2 / 4 / 4', topic: 'prism', lock: 17 },
  { area: '3 / 4 / 5 / 6', topic: 'nebula', lock: 18 },
  { area: '3 / 6 / 4 / 8', topic: 'fireworks', lock: 19 },
  { area: '3 / 8 / 5 / 9', topic: 'rainbow', lock: 20 },
  { area: '4 / 2 / 5 / 4', topic: 'galaxy', lock: 21 },
  { area: '4 / 6 / 6 / 8', topic: 'coral', lock: 22 },
  { area: '5 / 1 / 6 / 4', topic: 'psychedelic', lock: 23 },
  { area: '5 / 4 / 6 / 6', topic: 'mural', lock: 24 },
  { area: '5 / 8 / 6 / 9', topic: 'tropical', lock: 25 },
];

// A constant-velocity diagonal drift across a bento grid larger than the frame.
// The pan never decelerates (linear) and never reaches an edge, so it reads as
// genuinely infinite; each tile breathes with its own ken-burns and the
// vignette masks the bounds.
export const BentoDriftComposition: React.FC = () => {
  const frame = useCurrentFrame();
  // LINEAR (constant speed) — still gliding on the last frame, no ease-to-stop.
  const t = interpolate(frame, [0, DURATION], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const focusX = 950 + t * (3050 - 950);
  const focusY = 680 + t * (1820 - 680);

  return (
    <AbsoluteFill style={{ background: '#08080A' }}>
      <Camera
        focusX={focusX}
        focusY={focusY}
        zoom={0.92}
        viewportWidth={VIEWPORT_W}
        viewportHeight={VIEWPORT_H}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: WORLD_W,
            height: WORLD_H,
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gridTemplateRows: 'repeat(5, 1fr)',
            gap: 32,
            padding: 32,
          }}
        >
          {TILES.map((tile) => (
            <Tile key={tile.lock} area={tile.area} topic={tile.topic} lock={tile.lock} />
          ))}
        </div>
      </Camera>

      {/* Mask the world edges so the grid feels like it extends past frame. */}
      <Vignette {...vignetteSchema.parse({ intensity: 0.62, innerRadius: 34 })} />
    </AbsoluteFill>
  );
};
