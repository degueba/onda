'use client';

import React from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { TitleCard, titleCardSchema } from '@onda/registry/components/title-card/TitleCard';
import { DeviceFrame, deviceFrameSchema } from '@onda/registry/components/device-frame/DeviceFrame';
import { SpotlightCard, spotlightCardSchema } from '@onda/registry/components/spotlight-card/SpotlightCard';
import { EndCard, endCardSchema } from '@onda/registry/components/end-card/EndCard';
import { MeshGradient, meshGradientSchema } from '@onda/registry/components/mesh-gradient/MeshGradient';
import { Vignette, vignetteSchema } from '@onda/registry/components/vignette/Vignette';
import { crossFade } from '@onda/registry/transitions/cross-fade/crossFade';

const houseTiming = linearTiming({
  durationInFrames: 18,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
});

// The "live screen" inside the phone — a real product dashboard, not a
// gradient. Plain flex/divs (no canvas-relative PlacementBox) so it fills the
// device screen cleanly at any scale. Tokens only; one earned accent.
const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div
    style={{
      flex: 1,
      background: '#121217',
      border: '1px solid #1C1C22',
      borderRadius: 20,
      padding: 22,
    }}
  >
    <div style={{ color: '#8E8E98', fontSize: 16, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
      {label}
    </div>
    <div
      style={{
        color: '#F2F2F4',
        fontFamily: '"Clash Display", sans-serif',
        fontWeight: 600,
        fontSize: 40,
        letterSpacing: '-0.02em',
        marginTop: 8,
      }}
    >
      {value}
    </div>
  </div>
);

const PhoneApp: React.FC = () => (
  <AbsoluteFill
    style={{
      background: '#0E0E12',
      padding: 40,
      display: 'flex',
      flexDirection: 'column',
      gap: 22,
      fontFamily: '"Space Grotesk", sans-serif',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div
        style={{
          color: '#F2F2F4',
          fontFamily: '"Clash Display", sans-serif',
          fontWeight: 600,
          fontSize: 36,
          letterSpacing: '-0.02em',
        }}
      >
        Dashboard
      </div>
      <div style={{ width: 40, height: 40, borderRadius: 999, background: '#D96B82' }} />
    </div>

    {/* Hero stat */}
    <div style={{ background: '#121217', border: '1px solid #26262E', borderRadius: 28, padding: 32 }}>
      <div style={{ color: '#8E8E98', fontSize: 18, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Renders · this week
      </div>
      <div
        style={{
          color: '#F2F2F4',
          fontFamily: '"Clash Display", sans-serif',
          fontWeight: 600,
          fontSize: 84,
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
          marginTop: 6,
        }}
      >
        1,248
      </div>
      <div style={{ color: '#D96B82', fontSize: 22, fontWeight: 500, marginTop: 4 }}>▲ 18%</div>
    </div>

    <div style={{ display: 'flex', gap: 18 }}>
      <StatCard label="Uptime" value="99.9%" />
      <StatCard label="Components" value="70" />
    </div>
  </AbsoluteFill>
);

export const ProductLaunchComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#08080A' }}>
      {/* Restrained atmosphere: a dark-weighted mesh (one rose blob, two
          near-black) at low opacity — depth, not a pink wash (§2). */}
      <MeshGradient
        {...meshGradientSchema.parse({
          colors: ['#D96B82', '#26262E', '#121217'],
          opacity: 0.22,
          speed: 0.5,
        })}
      />

      <TransitionSeries>
        {/* Beat 1 — intro */}
        <TransitionSeries.Sequence durationInFrames={75}>
          <TitleCard
            {...titleCardSchema.parse({
              title: 'Introducing',
              subtitle: 'ONDA',
              titleSize: 'hero',
              subtitleSize: 'caption',
              placement: 'center',
            })}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={crossFade()} timing={houseTiming} />

        {/* Beat 2 — the product on a device, live screen */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <DeviceFrame {...deviceFrameSchema.parse({ device: 'phone', width: 540, placement: 'center' })}>
            <PhoneApp />
          </DeviceFrame>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={crossFade()} timing={houseTiming} />

        {/* Beat 3 — headline feature */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <SpotlightCard
            {...spotlightCardSchema.parse({
              eyebrow: 'FEATURE',
              title: 'Motion identity',
              body: 'One consistent feel across every component.',
              placement: 'center',
            })}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={crossFade()} timing={houseTiming} />

        {/* Beat 4 — CTA */}
        <TransitionSeries.Sequence durationInFrames={75}>
          <EndCard
            {...endCardSchema.parse({ cta: 'Start building', handles: ['onda.video'], placement: 'center' })}
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Vignette {...vignetteSchema.parse({ intensity: 0.5 })} />
    </AbsoluteFill>
  );
};
