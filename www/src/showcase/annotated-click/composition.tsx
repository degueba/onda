'use client';

import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  BrowserFrame,
  browserFrameSchema,
} from '@onda/registry/components/browser-frame/BrowserFrame';
import { Cursor, cursorSchema } from '@onda/registry/components/cursor/Cursor';
import { Button, buttonSchema } from '@onda/registry/components/button/Button';
import {
  BoundingBox,
  boundingBoxSchema,
} from '@onda/registry/components/bounding-box/BoundingBox';
import { Callout, calloutSchema } from '@onda/registry/components/callout/Callout';
import {
  DynamicGrid,
  dynamicGridSchema,
} from '@onda/registry/components/dynamic-grid/DynamicGrid';
import { Vignette, vignetteSchema } from '@onda/registry/components/vignette/Vignette';

// A calm UI-docs walkthrough on one continuous canvas — no cuts, so the
// eye follows a single thread: the page settles, a cursor arcs to the CTA
// and presses it, a bounding box draws itself around the button, and a
// tooltip-style callout names what just happened. One focal beat at a time.

// The CTA sits at roughly 50% width / 64% height of the canvas — the cursor,
// bounding box, and callout anchors are all tuned to that point.
const CTA_X = 0.5;
const CTA_Y = 0.64;

export const AnnotatedClickComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#08080A' }}>
      <DynamicGrid
        {...dynamicGridSchema.parse({
          variant: 'dots',
          opacity: 0.3,
          speed: 0.2,
          glow: false,
        })}
      />

      {/* Beat 1 — the documented page settles in. */}
      <BrowserFrame
        {...browserFrameSchema.parse({
          url: 'onda.video/install',
          width: 920,
          height: 440,
          placement: 'center',
        })}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 28,
            padding: 48,
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: 18,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#56565F',
            }}
          >
            Onda for developers
          </div>
          <div
            style={{
              fontFamily: '"Clash Display", sans-serif',
              fontWeight: 600,
              fontSize: 56,
              letterSpacing: '-0.03em',
              color: '#F2F2F4',
              textAlign: 'center',
              lineHeight: 1.05,
            }}
          >
            Motion you own
          </div>
          <Button
            {...buttonSchema.parse({
              label: 'Get started',
              variant: 'primary',
              press: true,
              pressFrame: 78,
              delay: 12,
            })}
          />
        </div>
      </BrowserFrame>

      {/* Beat 2 — cursor arcs in and presses the CTA (click lands ~frame 78). */}
      <Cursor
        {...cursorSchema.parse({
          fromX: 0.26,
          fromY: 0.86,
          toX: CTA_X,
          toY: CTA_Y,
          delay: 24,
          clickDelay: 10,
        })}
      />

      {/* Beat 3 — the box draws itself around the element that changed. */}
      <BoundingBox
        {...boundingBoxSchema.parse({
          x: 0.405,
          y: 0.575,
          width: 0.19,
          height: 0.13,
          label: 'CTA',
          delay: 96,
        })}
      />

      {/* Beat 4 — tooltip callout names the highlighted element. */}
      <Callout
        {...calloutSchema.parse({
          label: 'Primary action button',
          x: CTA_X + 0.09,
          y: CTA_Y - 0.06,
          position: 'top-right',
          offset: 150,
          delay: 126,
        })}
      />

      <Vignette {...vignetteSchema.parse({ intensity: 0.5 })} />
    </AbsoluteFill>
  );
};
