'use client';

import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import {
  BrowserFrame,
  browserFrameSchema,
} from '@onda/registry/components/browser-frame/BrowserFrame';
import {
  InputField,
  inputFieldSchema,
} from '@onda/registry/components/input-field/InputField';
import {
  ProgressBar,
  progressBarSchema,
} from '@onda/registry/components/progress-bar/ProgressBar';
import { Cursor, cursorSchema } from '@onda/registry/components/cursor/Cursor';
import { Button, buttonSchema } from '@onda/registry/components/button/Button';
import {
  DynamicGrid,
  dynamicGridSchema,
} from '@onda/registry/components/dynamic-grid/DynamicGrid';
import { Vignette, vignetteSchema } from '@onda/registry/components/vignette/Vignette';

// A product page-load demo on one continuous canvas. Beats land in
// sequence: the browser settles, an address bar types the URL, a progress
// bar loads the page, then the page content arrives and a cursor presses
// the CTA. Each beat owns its moment — nothing competes for the eye.

// CTA sits at canvas-center horizontally, lower portion vertically.
const CTA_X = 0.5;
const CTA_Y = 0.66;

export const BrowserWalkthroughComposition: React.FC = () => {
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

      <BrowserFrame
        {...browserFrameSchema.parse({
          url: 'onda.video',
          width: 960,
          height: 460,
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
            justifyContent: 'flex-start',
            gap: 32,
            padding: '40px 48px',
            boxSizing: 'border-box',
          }}
        >
          {/* Beat 1 — address bar types the URL. */}
          <InputField
            {...inputFieldSchema.parse({
              value: 'https://onda.video/launch',
              label: '',
              placeholder: 'Search or type a URL',
              typed: true,
              typeDuration: 48,
              delay: 18,
              width: 760,
              fontSize: 26,
            })}
          />

          {/* Beat 2 — a thin page-load bar pinned at the top, right under the
              address bar (full content width), the way a real browser loads. */}
          <div style={{ width: '100%', marginTop: -20 }}>
            <ProgressBar
              {...progressBarSchema.parse({
                value: 100,
                delay: 84,
                duration: 54,
                height: 3,
                radius: 2,
                showValue: false,
              })}
            />
          </div>

          {/* Beat 3 — loaded page content + CTA arrive. */}
          <Sequence from={150} layout="none">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 22,
                marginTop: 8,
              }}
            >
              <div
                style={{
                  fontFamily: '"Clash Display", sans-serif',
                  fontWeight: 600,
                  fontSize: 46,
                  letterSpacing: '-0.03em',
                  color: '#F2F2F4',
                  textAlign: 'center',
                  lineHeight: 1.05,
                }}
              >
                Ship motion today
              </div>
              <Button
                {...buttonSchema.parse({
                  label: 'Launch app',
                  variant: 'primary',
                  press: true,
                  pressFrame: 66,
                  delay: 6,
                })}
              />
            </div>
          </Sequence>
        </div>
      </BrowserFrame>

      {/* Beat 4 — cursor arcs to the CTA and clicks (press lands ~frame 216). */}
      <Sequence from={150} layout="none">
        <Cursor
          {...cursorSchema.parse({
            fromX: 0.28,
            fromY: 0.88,
            toX: CTA_X,
            toY: CTA_Y,
            delay: 30,
            clickDelay: 10,
          })}
        />
      </Sequence>

      <Vignette {...vignetteSchema.parse({ intensity: 0.5 })} />
    </AbsoluteFill>
  );
};
