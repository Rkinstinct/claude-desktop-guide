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

export type ChapterCardProps = {num: string; title: string; part: string; seed?: number};

export const ChapterCard: React.FC<ChapterCardProps> = ({num, title, part, seed = 7}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const rand = React.useMemo(() => mulberry32(seed), [seed]);
  const particles = React.useMemo(() => Array.from({length: 26}, () => ({
    x: rand() * 1080, y: rand() * 608, size: 2.5 + rand() * 4.5,
    phase: rand() * Math.PI * 2, speed: 0.25 + rand() * 0.5,
    color: rand() > 0.6 ? CLAY : rand() > 0.3 ? '#e3d5c8' : LINE,
    o: 0.35 + rand() * 0.4,
  })), [rand]);

  const numT = spring({frame: frame - 8, fps, config: {damping: 13, stiffness: 150}});
  const titleT = rise(frame, 22, 26);
  const lineT = rise(frame, 34, 22);
  const partT = rise(frame, 40, 20);

  const fontSize = title.length > 42 ? 44 : title.length > 28 ? 54 : 64;

  return (
    <AbsoluteFill style={{background: PAPER, fontFamily, direction: 'rtl'}}>
      {particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: p.x, top: p.y + Math.sin(frame / 24 + p.phase) * 12 - frame * p.speed * 0.12,
          width: p.size, height: p.size, borderRadius: 99, background: p.color, opacity: p.o * rise(frame, 0, 20),
        }} />
      ))}
      {/* corner accents */}
      <div style={{position: 'absolute', top: 44, right: 54, width: 46, height: 5, borderRadius: 99, background: CORAL, opacity: rise(frame, 30, 18)}} />
      <div style={{position: 'absolute', bottom: 44, left: 54, width: 46, height: 5, borderRadius: 99, background: CLAY, opacity: rise(frame, 36, 18)}} />

      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center', padding: '0 70px'}}>
          <div style={{
            fontSize: 22, fontWeight: 700, color: SOFT, letterSpacing: '0.02em',
            opacity: partT, transform: `translateY(${(1 - partT) * 12}px)`,
          }}>{part}</div>
          <div style={{
            fontFamily: 'monospace', fontSize: 120, fontWeight: 800, color: CORAL, lineHeight: 1, marginTop: 12,
            transform: `scale(${interpolate(numT, [0, 1], [0.55, 1])})`, opacity: numT,
            direction: 'ltr',
          }}>{num}</div>
          <div style={{
            width: 120, height: 4, borderRadius: 99, background: CLAY, margin: '22px auto 0',
            transform: `scaleX(${lineT})`,
          }} />
          <div style={{
            fontSize, fontWeight: 800, color: INK, letterSpacing: '-0.02em', lineHeight: 1.3, marginTop: 24,
            opacity: titleT, transform: `translateY(${(1 - titleT) * 20}px)`,
          }}>{title}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};