import React from 'react';
import { AbsoluteFill } from 'remotion';
import { z } from 'zod';
import { DrawOn } from '../draw-on/DrawOn';
import { ScaleIn } from '../scale-in/ScaleIn';
import { Underline } from '../underline/Underline';
import { DURATION } from '../../../lib/motion';
import { PlacementBox } from '../../../lib/canvas';
import { logoStingSchema } from './schema';

export { logoStingSchema };
export type LogoStingProps = z.infer<typeof logoStingSchema>;

/**
 * Silent, restrained branded reveal. Composition order:
 *
 * 1. `DrawOn`    — the logo stroke draws itself in (the "mark arrives")
 * 2. `ScaleIn`   — the title settles into place beneath the stroke
 * 3. `Underline` — a single accent rule lands last, only when `accent === true`
 *
 * All motion lives in the three primitives; this file only choreographs the
 * offsets between them. No particles, no streaks, no glitch, no spinning,
 * no accelerating spring. Restraint IS the brand.
 *
 * @example
 * <LogoSting d="M 50 60 Q 100 20 150 60 T 250 60" title="Onda" />
 */
export const LogoSting: React.FC<LogoStingProps> = ({
  d,
  title,
  delay,
  accent,
  viewBox,
  pathWidth,
  pathHeight,
  strokeWidth,
  stroke,
  accentColor,
  titleFontSize,
  color,
  fontFamily,
  placement,
}) => {
  // Choreography offsets — frames *after* the block's own delay.
  // The stroke (DrawOn) defaults to DURATION.slow (24 frames). The title begins
  // before the stroke is fully settled so the two reveals feel linked rather
  // than sequential. The underline lands last so the eye reads mark -> word
  // -> accent.
  const TITLE_OFFSET = 18;     // title starts as the stroke is almost home
  const UNDERLINE_OFFSET = 34; // underline waits for the title to land

  const fillCanvas = placement === undefined;

  const stack = (
    <>
      {/* 1. Logo stroke — the mark arrives. */}
      <DrawOn
        d={d}
        delay={delay}
        duration={DURATION.slow}
        viewBox={viewBox}
        width={pathWidth}
        height={pathHeight}
        strokeWidth={strokeWidth}
        stroke={stroke}
      />

      {/* 2. Title — settles in beneath the mark. */}
      <ScaleIn
        text={title}
        delay={delay + TITLE_OFFSET}
        duration={DURATION.base}
        fromScale={0.9}
        color={color}
        fontSize={titleFontSize}
        fontFamily={fontFamily}
      />

      {/* 3. Accent underline — earned, single, last. Only renders when
          accent === true. The Underline primitive draws both the (here
          invisible) text and the rule; we pass an empty string and zero
          line offset so only the rule reads. */}
      {accent ? (
        <Underline
          text=""
          delay={delay + UNDERLINE_OFFSET}
          color={color}
          accentColor={accentColor}
          fontSize={titleFontSize}
          fontFamily={fontFamily}
          duration={1}
          lineDelay={0}
          lineThickness={3}
          lineOffset={0}
          lineDuration={10}
        />
      ) : null}
    </>
  );

  if (fillCanvas) {
    return (
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 32,
          fontFamily,
        }}
      >
        {stack}
      </AbsoluteFill>
    );
  }

  return (
    <PlacementBox placement={placement}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 32,
          fontFamily,
        }}
      >
        {stack}
      </div>
    </PlacementBox>
  );
};

export default LogoSting;
