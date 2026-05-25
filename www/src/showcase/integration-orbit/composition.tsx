'use client';

import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { MeshGradient, meshGradientSchema } from '@onda/registry/components/mesh-gradient/MeshGradient';
import { TitleCard, titleCardSchema } from '@onda/registry/components/title-card/TitleCard';
import { NodeGraph, nodeGraphSchema } from '@onda/registry/components/node-graph/NodeGraph';

// Two beats, one canvas. A title lands ("Connect everything"), then the
// node-graph takes over the full frame — a central hub with integration
// satellites flying in and orbiting, connection lines lighting up. A calm
// mesh-gradient drifts behind both beats as atmosphere, never competing.
export const IntegrationOrbitComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      <MeshGradient
        {...meshGradientSchema.parse({
          colors: ['#D96B82', '#26262E', '#0E0E12'],
          opacity: 0.32,
          speed: 0.6,
        })}
      />

      {/* Beat 1 — the promise */}
      <Sequence durationInFrames={60}>
        <TitleCard
          {...titleCardSchema.parse({
            title: 'Connect everything',
            subtitle: 'ONE HUB · EVERY INTEGRATION',
            titleSize: 'hero',
            subtitleSize: 'caption',
            placement: 'center',
          })}
        />
      </Sequence>

      {/* Beat 2 — the constellation fills the canvas */}
      <Sequence from={60}>
        <NodeGraph
          {...nodeGraphSchema.parse({
            hubLabel: 'HUB',
            satellites: [
              { label: 'CRM', radius: 250, speed: 0.011, startAngle: 0.3 },
              { label: 'Email', radius: 330, speed: -0.008, startAngle: 1.6 },
              { label: 'Slack', radius: 210, speed: 0.013, startAngle: 2.8 },
              { label: 'Stripe', radius: 360, speed: -0.006, startAngle: 4.0 },
              { label: 'Drive', radius: 290, speed: 0.009, startAngle: 5.2 },
            ],
            hubDiameter: 130,
            hubSize: 'subheading',
            glow: true,
            placement: 'center',
          })}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
