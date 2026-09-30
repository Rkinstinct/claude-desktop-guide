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

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rise = (frame: number, at: number, dur = 24) =>
  interpolate(frame, [at, at + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_OUT});

export const Celebration: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const confetti = React.useMemo(() => {
    const rand = mulberry32(42);
    const cols = [CORAL, CLAY, '#d9b48a', '#8a8378', '#c9704f'];
    return Array.from({length: 90}, () => {
      const angle = -Math.PI / 2 + (rand() - 0.5) * 1.9;
      const speed = 9 + rand() * 15;
      return {
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        w: 7 + rand() * 9, h: 4 + rand() * 7,
        rot: rand() * 360, vr: (rand() - 0.5) * 22,
        color: cols[Math.floor(rand() * cols.length)],
        delay: Math.floor(rand() * 8), x0: 540 + (rand() - 0.5) * 120,
        o: 0.75 + rand() * 0.25,
      };
    });
  }, []);

  const badge = spring({frame: frame - 6, fps, config: {damping: 11, stiffness: 160}});
  const title = rise(frame, 18, 24);
  const sub = rise(frame, 32, 22);
  const line = rise(frame, 40, 20);

  return (
    <AbsoluteFill style={{background: PAPER, fontFamily, direction: 'rtl'}}>
      {confetti.map((c, i) => {
        const t = Math.max(0, frame - c.delay) / 30;
        const x = c.x0 + c.vx * t * 30 * 0.9;
        const y = 608 - 40 + c.vy * t * 30 + 0.5 * 26 * t * t * 30;
        const fade = interpolate(frame, [55, 80], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return (
          <div key={i} style={{
            position: 'absolute', left: x, top: y, width: c.w, height: c.h,
            background: c.color, opacity: c.o * fade, borderRadius: 2,
            transform: `rotate(${c.rot + c.vr * t * 30}deg)`,
          }} />
        );
      })}

      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
        <div style={{
          transform: `scale(${badge})`, width: 110, height: 110, borderRadius: 99,
          background: CORAL, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 14px 34px rgba(182,93,66,0.28)',
        }}>
          <svg width="58" height="58" viewBox="0 0 24 24" fill="none">
            <path d="M4 12.5l5.2 5.2L20 6.5" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="26" strokeDashoffset={`${26 * (1 - rise(frame, 12, 16))}`} />
          </svg>
        </div>
        <div style={{marginTop: 34, opacity: title, transform: `translateY(${24 * (1 - title)}px)`, fontSize: 64, fontWeight: 800, color: INK}}>
          כל התשובות נכונות!
        </div>
        <div style={{marginTop: 16, opacity: sub, fontSize: 34, fontWeight: 400, color: SOFT}}>
          סיימתם את החידון של הפרק הזה
        </div>
        <div style={{marginTop: 26, width: `${line * 200}px`, height: 5, borderRadius: 99, background: CLAY}} />
      </div>
    </AbsoluteFill>
  );
};
