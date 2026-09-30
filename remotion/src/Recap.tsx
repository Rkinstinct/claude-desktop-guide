import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Heebo';

const {fontFamily} = loadFont('normal', {weights: ['400', '700', '800'], subsets: ['hebrew', 'latin']});

const PAPER = '#f8f6f1';
const INK = '#292621';
const SOFT = '#8a8378';
const CORAL = '#b65d42';
const CLAY = '#cfaa98';
const LINE = '#e8e2d9';

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const rise = (frame: number, at: number, dur = 24) =>
  interpolate(frame, [at, at + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_OUT});

// ~latin~ markers become isolated LTR spans
const renderLine = (line: string) => {
  const parts = line.split(/~([^~]+)~/g);
  return parts.map((p, i) =>
    i % 2 === 1
      ? <span key={i} dir="ltr" style={{direction: 'ltr', unicodeBidi: 'isolate', fontWeight: 700, color: INK}}>{p}</span>
      : <React.Fragment key={i}>{p}</React.Fragment>
  );
};

export const Recap: React.FC<{num: string; lines: string[]}> = ({num, lines}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const chipT = rise(frame, 4, 18);
  const titleT = rise(frame, 12, 22);
  const footT = rise(frame, 265, 24);

  return (
    <AbsoluteFill style={{background: PAPER, fontFamily, direction: 'rtl'}}>
      <div style={{position: 'absolute', top: 36, right: 48, width: 44, height: 5, borderRadius: 99, background: CORAL, opacity: rise(frame, 26, 18)}} />
      <div style={{position: 'absolute', bottom: 36, left: 48, width: 44, height: 5, borderRadius: 99, background: CLAY, opacity: rise(frame, 32, 18)}} />

      <div style={{position: 'absolute', top: 34, left: 0, right: 0, textAlign: 'center', opacity: chipT, transform: `translateY(${10 * (1 - chipT)}px)`}}>
        <span style={{fontSize: 21, fontWeight: 700, color: CORAL, border: `2px solid ${CORAL}`, borderRadius: 99, padding: '4px 18px'}}>פרק {num}</span>
      </div>
      <div style={{position: 'absolute', top: 84, left: 0, right: 0, textAlign: 'center', opacity: titleT, transform: `translateY(${18 * (1 - titleT)}px)`}}>
        <span style={{fontSize: 56, fontWeight: 800, color: INK}}>מה למדנו</span>
      </div>

      {lines.map((line, i) => {
        const at = 55 + i * 48;
        const t = spring({frame: frame - at, fps, config: {damping: 15, stiffness: 150}});
        const check = interpolate(frame, [at + 12, at + 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_OUT});
        return (
          <div key={i} style={{
            position: 'absolute', top: 196 + i * 108, right: 70, left: 60,
            display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 18,
            opacity: t, transform: `translateY(${20 * (1 - t)}px)`,
            background: '#fff', border: `2px solid ${LINE}`, borderRadius: 18, padding: '18px 24px',
            boxShadow: '0 8px 20px rgba(41,38,33,0.05)',
          }}>
            <div style={{
              flexShrink: 0, width: 38, height: 38, borderRadius: 99,
              border: `2.5px solid ${CORAL}`,
              background: check > 0.5 ? CORAL : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 22, fontWeight: 800,
              transform: `scale(${0.6 + 0.4 * check})`,
            }}>{check > 0.5 ? '✓' : ''}</div>
            <div style={{fontSize: 27, fontWeight: 400, color: INK, lineHeight: 1.35}}>{renderLine(line)}</div>
          </div>
        );
      })}

      <div style={{position: 'absolute', bottom: 42, left: 0, right: 0, textAlign: 'center', opacity: footT, fontSize: 24, fontWeight: 700, color: SOFT}}>
        עכשיו - בדקו את עצמכם בשאלות למטה
      </div>
    </AbsoluteFill>
  );
};
