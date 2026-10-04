import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Heebo';

const {fontFamily} = loadFont('normal', {weights: ['400', '600', '800'], subsets: ['hebrew', 'latin']});
const INK = '#292621';
const SOFT = '#8a8378';
const CORAL = '#b65d42';
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const rise = (f: number, at: number, dur = 24) =>
  interpolate(f, [at, at + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_OUT});

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const Ltr: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span dir="ltr" style={{direction: 'ltr', unicodeBidi: 'isolate'}}>{children}</span>
);

// Wide (16:9) opening for desktop screens. Same palette, mark and wording as the square/portrait opening.
export const GuideOpening: React.FC = () => {
  const f = useCurrentFrame();
  const {fps, width: w, height: h} = useVideoConfig();
  const parts = React.useMemo(() => {
    const r = mulberry32(11);
    const cols = [CORAL, '#cfaa98', '#8a8378', '#292621', '#d9a48f'];
    return Array.from({length: 70}, (_, i) => {
      const a = r() * Math.PI * 2;
      const rad = 142 + r() * 40;
      return {a, rad, s: 1.6 + r() * 3.4, c: cols[Math.floor(r() * cols.length)], d: i % 24};
    });
  }, []);
  const arrive = spring({frame: f - 6, fps, config: {damping: 14, stiffness: 70}});
  const ring = rise(f, 4, 40);
  const cx = w / 2, size = 190, top = 34, cy = top + size / 2;
  const chips = ['20 פרקים', 'סרטוני דמו מהממשק', 'שאלות חזרה'];
  const out = interpolate(f, [284, 299], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#f3e7dc', fontFamily, direction: 'rtl', color: INK, opacity: 1}}>
      <svg width={w} height={h} style={{position: 'absolute'}}>
        <defs>
          <filter id="wc" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.0032 0.0055" numOctaves="4" seed="9" result="n" />
            <feColorMatrix in="n" type="matrix" values="3.2 0 0 0 -1.1  3.2 0 0 0 -1.1  3.2 0 0 0 -1.1  0 0 0 1 0" result="g" />
            <feComponentTransfer in="g" result="c">
              <feFuncR type="table" tableValues="0.84 0.90 0.96 0.93 0.86" />
              <feFuncG type="table" tableValues="0.50 0.68 0.87 0.86 0.82" />
              <feFuncB type="table" tableValues="0.38 0.55 0.78 0.80 0.77" />
            </feComponentTransfer>
          </filter>
          <radialGradient id="glow" cx="50%" cy="38%" r="55%">
            <stop offset="0" stopColor="#fbf5ee" stopOpacity="0.95" />
            <stop offset="1" stopColor="#fbf5ee" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={w} height={h} filter="url(#wc)" />
        <rect width={w} height={h} fill="url(#glow)" />
      </svg>
      <div style={{position: 'absolute', inset: 0, opacity: out}}>
        <svg width={w} height={h} style={{position: 'absolute'}}>
          <g transform={`translate(${cx} ${cy}) scale(${arrive * size / 300 * 1.0}) rotate(${f * 0.12})`}>
            {Array.from({length: 12}, (_, i) => (
              <line key={i} x1="0" y1="-42" x2="0" y2={-(122 + (i % 3) * 4)} stroke={CORAL} strokeWidth="30" strokeLinecap="round" transform={`rotate(${i * 30})`} />
            ))}
            <circle r="168" fill="none" stroke="#b9a99a" strokeWidth="1.3" strokeDasharray="2 7" opacity={ring * 0.9} />
            {parts.map((p, i) => (
              <circle key={i} cx={Math.cos(p.a + f * 0.003 * (i % 2 ? 1 : -1)) * p.rad} cy={Math.sin(p.a + f * 0.003 * (i % 2 ? 1 : -1)) * p.rad} r={p.s} fill={p.c} opacity={ring * (0.45 + (i % 4) * 0.13)} />
            ))}
          </g>
        </svg>
        <div style={{position: 'absolute', left: 80, right: 80, top: top + size + 34, textAlign: 'center', opacity: rise(f, 22, 26), transform: `translateY(${(1 - rise(f, 22, 26)) * 26}px)`}}>
          <div style={{fontSize: 84, fontWeight: 800, lineHeight: 1.12}}>המדריך המלא</div>
          <div style={{fontSize: 84, fontWeight: 800, lineHeight: 1.12, color: CORAL}}>ל-<Ltr>Claude Desktop</Ltr></div>
        </div>
        <div style={{position: 'absolute', left: 80, right: 80, top: top + size + 34 + 188, textAlign: 'center', fontSize: 28, color: SOFT, opacity: rise(f, 56, 22)}}>
          <Ltr>Fabric Skills + Power BI</Ltr>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: top + size + 34 + 188 + 58, display: 'flex', justifyContent: 'center', gap: 18}}>
          {chips.map((x, i) => {
            const a = spring({frame: f - 84 - i * 10, fps, config: {damping: 15}});
            return <div key={x} style={{opacity: rise(f, 84 + i * 10, 18), transform: `translateY(${(1 - a) * 30}px)`, background: '#fffefa', border: '1.5px solid #e8e2d9', borderRadius: 99, padding: '11px 28px', fontSize: 24, fontWeight: 600, boxShadow: '0 10px 22px rgba(87,64,44,0.08)'}}>{x}</div>;
          })}
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 34, textAlign: 'center', fontSize: 30, fontWeight: 600, color: CORAL, opacity: rise(f, 150, 24)}}>בואו נתחיל</div>
      </div>
    </AbsoluteFill>
  );
};
