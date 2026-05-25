'use client';

import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import {
  StatCard,
  statCardSchema,
} from '@onda/registry/components/stat-card/StatCard';
import {
  WordStagger,
  wordStaggerSchema,
} from '@onda/registry/components/word-stagger/WordStagger';
import {
  TitleCard,
  titleCardSchema,
} from '@onda/registry/components/title-card/TitleCard';
import {
  GradientShift,
  gradientShiftSchema,
} from '@onda/registry/components/gradient-shift/GradientShift';
import {
  Vignette,
  vignetteSchema,
} from '@onda/registry/components/vignette/Vignette';

// Single-frame layout: header on top, four StatCards in a 2x2 grid below,
// footer caption at the bottom. Tiles stagger in via per-card `delay`
// props so the eye still gets a sequence, but the final state is one
// dashboard screenshot — the share-this-image moment.

export const KpiSnapshotComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      <GradientShift
        {...gradientShiftSchema.parse({
          from: '#08080A',
          to: '#10131A',
          angle: 135,
          speed: 0.15,
        })}
      />

      {/* Header — eyebrow + title in the upper area. */}
      <Sequence from={0}>
        <TitleCard
          {...titleCardSchema.parse({
            title: 'April snapshot',
            subtitle: 'KEY METRICS · MONTH OVER MONTH',
            titleSize: 'heading',
            subtitleSize: 'caption',
            placement: { x: 0.5, y: 0.13, anchor: 'center' },
          })}
        />
      </Sequence>

      {/* 2×2 grid of StatCards — entrances stagger via per-card delay
          so the eye reads top-left → top-right → bottom-left → bottom-right. */}
      <Sequence from={20}>
        <AbsoluteFill
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            placeItems: 'center',
            padding: '260px 200px 180px',
            gap: 60,
          }}
        >
          <StatCard
            {...statCardSchema.parse({
              value: 84,
              prefix: '$',
              suffix: 'K',
              label: 'MONTHLY RECURRING REVENUE',
              numberFontSize: 160,
              labelFontSize: 22,
              accent: true,
              delay: 0,
            })}
          />
          <StatCard
            {...statCardSchema.parse({
              value: 12,
              prefix: '+',
              suffix: '%',
              label: 'GROWTH OVER MARCH',
              numberFontSize: 160,
              labelFontSize: 22,
              accent: false,
              delay: 12,
            })}
          />
          <StatCard
            {...statCardSchema.parse({
              value: 1247,
              label: 'ACTIVE USERS',
              numberFontSize: 160,
              labelFontSize: 22,
              accent: false,
              delay: 24,
            })}
          />
          <StatCard
            {...statCardSchema.parse({
              value: 92,
              suffix: '%',
              label: 'WEEK 4 RETENTION',
              numberFontSize: 160,
              labelFontSize: 22,
              accent: false,
              delay: 36,
            })}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Footer caption — small mono line at the very bottom. */}
      <Sequence from={80}>
        <AbsoluteFill
          style={{
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingBottom: 60,
          }}
        >
          <WordStagger
            {...wordStaggerSchema.parse({
              text: 'EXPORTED FROM ONDA · 2026-05-24',
              size: 'caption',
              stagger: 4,
              justify: 'center',
              color: '#56565F',
              fontFamily: '"Space Grotesk", ui-monospace, monospace',
            })}
          />
        </AbsoluteFill>
      </Sequence>

      <Vignette {...vignetteSchema.parse({ intensity: 0.5 })} />
    </AbsoluteFill>
  );
};
