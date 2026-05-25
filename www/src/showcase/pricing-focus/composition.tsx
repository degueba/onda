'use client';

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { Camera, useCameraRig } from '@onda/lib/index';
import { PricingCard, pricingCardSchema } from '@onda/registry/components/pricing-card/PricingCard';
import { ShimmerSweep, shimmerSweepSchema } from '@onda/registry/components/shimmer-sweep/ShimmerSweep';
import { Vignette, vignetteSchema } from '@onda/registry/components/vignette/Vignette';

const VIEWPORT_W = 1280;
const VIEWPORT_H = 720;

// Three 380px cards laid out in a row inside the world, centered vertically.
// The middle card is the focus target — the camera pushes in on its center
// and the two side cards dim + blur into the background.
const CARD_W = 380;
const GAP = 56;
const ROW_W = CARD_W * 3 + GAP * 2;
const ROW_LEFT = (VIEWPORT_W - ROW_W) / 2; // 70
const CARD_TOP = 150;
const LEFT_X = ROW_LEFT; // 70
const MID_X = ROW_LEFT + CARD_W + GAP; // 506
const RIGHT_X = ROW_LEFT + (CARD_W + GAP) * 2; // 942
const MID_CENTER_X = MID_X + CARD_W / 2; // 696
const MID_CENTER_Y = CARD_TOP + 250;

const HOUSE_EASE = Easing.bezier(0.16, 1, 0.3, 1);

// The two side tiers recede as the camera commits to the middle: opacity falls
// and a blur builds, pushing them behind the recommended card. Pure function of
// frame, clamped (CLAUDE.md §1, §3).
const SideCard: React.FC<{ left: number; children: React.ReactNode }> = ({ left, children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [55, 95], [1, 0.32], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: HOUSE_EASE,
  });
  const blur = interpolate(frame, [55, 95], [0, 6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: HOUSE_EASE,
  });
  return (
    <div style={{ position: 'absolute', left, top: CARD_TOP, opacity, filter: `blur(${blur}px)` }}>
      {children}
    </div>
  );
};

// Three pricing tiers settle in side by side, then the camera focuses the
// recommended middle tier — it scales up via zoom while the side cards dim and
// blur back, and a shimmer sweeps the focused CTA to seal the choice.
export const PricingFocusComposition: React.FC = () => {
  const rig = useCameraRig([
    { frame: 0, focusX: VIEWPORT_W / 2, focusY: VIEWPORT_H / 2, zoom: 1 },
    { frame: 50, focusX: VIEWPORT_W / 2, focusY: VIEWPORT_H / 2, zoom: 1 },
    { frame: 95, focusX: MID_CENTER_X, focusY: MID_CENTER_Y, zoom: 1.25 },
  ]);

  return (
    <AbsoluteFill style={{ background: '#08080A' }}>
      <Camera {...rig} viewportWidth={VIEWPORT_W} viewportHeight={VIEWPORT_H}>
        <div style={{ position: 'absolute', inset: 0 }}>
          {/* Free — left, recedes on focus */}
          <SideCard left={LEFT_X}>
            <PricingCard
              {...pricingCardSchema.parse({
                tier: 'Free',
                price: 'Free',
                period: '',
                cta: 'Start free',
                features: ['Up to 3 renders / mo', 'Watermark on export', 'Community support'],
                delay: 0,
              })}
            />
          </SideCard>

          {/* Pro — middle, the recommended focus tier */}
          <div style={{ position: 'absolute', left: MID_X, top: CARD_TOP }}>
            <PricingCard
              {...pricingCardSchema.parse({
                tier: 'Pro',
                price: '$29',
                period: '/month',
                cta: 'Get started',
                recommended: true,
                features: [
                  'Unlimited renders',
                  'Signature motion identity',
                  'Source you own, copied in',
                  'Priority support',
                ],
                delay: 8,
              })}
            />
            {/* Shimmer sweep over the focused CTA — placed at the button row. */}
            <div style={{ position: 'absolute', left: 40, right: 40, bottom: 54, height: 28, overflow: 'hidden' }}>
              <ShimmerSweep
                {...shimmerSweepSchema.parse({
                  text: 'Get started',
                  fontSize: 17,
                  align: 'center',
                  delay: 100,
                  duration: 36,
                  color: '#08080A',
                  shimmerColor: '#FFFFFF',
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 600,
                })}
              />
            </div>
          </div>

          {/* Enterprise — right, recedes on focus */}
          <SideCard left={RIGHT_X}>
            <PricingCard
              {...pricingCardSchema.parse({
                tier: 'Enterprise',
                price: 'Custom',
                period: '',
                cta: 'Talk to sales',
                features: ['SSO & SAML', 'Dedicated support', 'Custom motion presets', 'SLA & invoicing'],
                delay: 16,
              })}
            />
          </SideCard>
        </div>
      </Camera>

      <Vignette {...vignetteSchema.parse({ intensity: 0.5 })} />
    </AbsoluteFill>
  );
};
