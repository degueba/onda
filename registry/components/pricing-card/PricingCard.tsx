import React from 'react';
import { useVideoConfig } from 'remotion';
import { PlacementBox, resolveSize } from '../../../lib/canvas';
import { Surface, Glow } from '../../../lib/primitives';
import { useEntrance } from '../../../lib/hooks';
import { pricingCardSchema, type PricingCardProps } from './schema';

export { pricingCardSchema, type PricingCardProps };

const BODY_FONT = '"Space Grotesk", sans-serif';

/**
 * A single pricing tier on the Onda glass `Surface` — tier name, a large
 * price, billing period, an accent-checkmark feature list, and a CTA button.
 * The card rises in on the house spring. Set `recommended` to lift + scale it
 * slightly, add an accent badge, and float a soft accent glow behind it — the
 * highlighted tier in a three-up row. One card; the consumer arranges three.
 *
 * @example
 * <PricingCard tier="Pro" price="$29" recommended placement="center" />
 */
export const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  price,
  period,
  features,
  cta,
  recommended,
  accent,
  delay,
  width,
  size,
  fontFamily,
  placement,
}) => {
  const { width: cw, height: ch } = useVideoConfig();
  const entrance = useEntrance({ type: 'rise', delay });
  const priceFontSize = size ? resolveSize(size, { width: cw, height: ch }) : 64;

  // The recommended tier sits a touch higher and larger — a static lift
  // composed with the entrance transform, not an animation.
  const lift = recommended ? ' translateY(-16px) scale(1.04)' : '';

  return (
    <PlacementBox placement={placement}>
      <div style={{ opacity: entrance.opacity, transform: `${entrance.transform}${lift}` }}>
        <Surface
          variant="glass"
          width={width}
          padding={40}
          borderColor={recommended ? accent : undefined}
        >
          {recommended && <Glow color={accent} size={0.9} x={0.5} y={0.1} opacity={0.22} />}

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Tier name + recommended badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div
                style={{
                  color: '#8E8E98',
                  fontFamily: BODY_FONT,
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                }}
              >
                {tier}
              </div>
              {recommended && (
                <div
                  style={{
                    color: accent,
                    fontFamily: BODY_FONT,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    border: `1px solid ${accent}`,
                    borderRadius: 999,
                    padding: '4px 12px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Recommended
                </div>
              )}
            </div>

            {/* Price + period */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span
                style={{
                  color: '#F2F2F4',
                  fontFamily,
                  fontSize: priceFontSize,
                  fontWeight: 600,
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}
              >
                {price}
              </span>
              {period && (
                <span
                  style={{
                    color: '#56565F',
                    fontFamily: BODY_FONT,
                    fontSize: 18,
                    fontWeight: 500,
                  }}
                >
                  {period}
                </span>
              )}
            </div>

            {/* Feature checklist — accent checkmarks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {features.map((feature, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    aria-hidden
                    style={{ flexShrink: 0, marginTop: 3 }}
                  >
                    <path
                      d="M4 9.5L7.2 12.5L14 5.5"
                      stroke={accent}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    style={{
                      color: '#F2F2F4',
                      fontFamily: BODY_FONT,
                      fontSize: 18,
                      fontWeight: 400,
                      lineHeight: 1.4,
                    }}
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA button */}
            <div
              style={{
                marginTop: 8,
                width: '100%',
                textAlign: 'center',
                fontFamily: BODY_FONT,
                fontSize: 17,
                fontWeight: 600,
                letterSpacing: '0.01em',
                padding: '14px 24px',
                borderRadius: 12,
                background: recommended ? accent : 'transparent',
                color: recommended ? '#08080A' : '#F2F2F4',
                border: `1px solid ${recommended ? accent : '#26262E'}`,
              }}
            >
              {cta}
            </div>
          </div>
        </Surface>
      </div>
    </PlacementBox>
  );
};

export default PricingCard;
