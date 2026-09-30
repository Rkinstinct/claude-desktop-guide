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

const Ltr: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span dir="ltr" style={{direction: 'ltr', unicodeBidi: 'isolate'}}>{children}</span>
);

const NODES = [
  {x: 780, label: 'תחילת סשן', at: 165, event: 'SessionStart', action: 'טוען משתני סביבה ותלויות', above: true},
  {x: 540, label: 'אחרי עריכת קובץ', at: 275, event: 'PostToolUse', action: 'prettier רץ לבד על הקובץ', above: false},
  {x: 300, label: 'לפני פקודה מסוכנת', at: 385, event: 'PreToolUse', action: 'חוסם git push ישיר', above: true},
];

export const ConceptHooks: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const rand = React.useMemo(() => mulberry32(23), []);
  const particles = React.useMemo(() => Array.from({length: 22}, () => ({
    x: rand() * 1080, y: rand() * 608, size: 2.5 + rand() * 4,
    phase: rand() * Math.PI * 2, speed: 0.25 + rand() * 0.5,
    color: rand() > 0.6 ? CLAY : rand() > 0.3 ? '#e3d5c8' : LINE,
    o: 0.3 + rand() * 0.4,
  })), [rand]);

  const titleT = rise(frame, 8, 24);
  const subT = rise(frame, 22, 22);
  const lineT = rise(frame, 140, 40);
  const dotX = interpolate(frame, [165, 430], [780, 300], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_OUT});
  const takeT = rise(frame, 480, 26);
  const takeSubT = rise(frame, 505, 24);

  return (
    <AbsoluteFill style={{background: PAPER, fontFamily, direction: 'rtl'}}>
      {particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: p.x, top: p.y + Math.sin(frame / 24 + p.phase) * 10 - frame * p.speed * 0.1,
          width: p.size, height: p.size, borderRadius: 99, background: p.color, opacity: p.o * rise(frame, 0, 20),
        }} />
      ))}
      <div style={{position: 'absolute', top: 36, right: 48, width: 44, height: 5, borderRadius: 99, background: CORAL, opacity: rise(frame, 30, 18)}} />
      <div style={{position: 'absolute', bottom: 36, left: 48, width: 44, height: 5, borderRadius: 99, background: CLAY, opacity: rise(frame, 36, 18)}} />

      {/* title */}
      <div style={{position: 'absolute', top: 52, left: 0, right: 0, textAlign: 'center', opacity: titleT, transform: `translateY(${22 * (1 - titleT)}px)`}}>
        <span style={{fontSize: 56, fontWeight: 800, color: INK}}>הוקס</span>
      </div>
      <div style={{position: 'absolute', top: 122, left: 0, right: 0, textAlign: 'center', opacity: subT, fontSize: 28, fontWeight: 400, color: SOFT}}>
        אוטומציה על נקודות החיים של הסשן
      </div>

      {/* timeline */}
      <div style={{position: 'absolute', top: 262, left: 140, width: 800 * lineT, height: 3, borderRadius: 99, background: LINE}} />
      <div style={{position: 'absolute', top: 252, left: 140, width: 800, height: 3}}>
        <div style={{position: 'absolute', top: -6, right: 940 - dotX - 140 - 8, width: 15, height: 15, borderRadius: 99, background: CORAL, opacity: rise(frame, 160, 12)}} />
      </div>

      {NODES.map((n, i) => {
        const nt = rise(frame, n.at, 18);
        const ct = spring({frame: frame - (n.at + 14), fps, config: {damping: 13, stiffness: 150}});
        return (
          <React.Fragment key={i}>
            {/* node */}
            <div style={{position: 'absolute', top: 256, right: 940 - n.x - 8, width: 15, height: 15, borderRadius: 99, background: nt > 0.5 ? CORAL : '#fff', border: `3px solid ${CORAL}`, opacity: nt}} />
            <div style={{position: 'absolute', top: 282, right: 940 - n.x - 90, width: 180, textAlign: 'center', fontSize: 22, fontWeight: 700, color: INK, opacity: nt}}>
              {n.label}
            </div>
            {/* hook card */}
            <div style={{
              position: 'absolute', right: 940 - n.x - 130, width: 260,
              top: n.above ? 158 : 322,
              opacity: ct, transform: `scale(${0.8 + 0.2 * ct})`,
              border: `2px solid ${LINE}`, background: '#fff', borderRadius: 18,
              padding: '12px 18px', textAlign: 'center',
              boxShadow: '0 8px 22px rgba(41,38,33,0.07)',
            }}>
              <div style={{fontSize: 20, fontWeight: 700, color: CORAL, fontFamily: 'monospace'}}>
                <Ltr>{n.event}</Ltr>
              </div>
              <div style={{marginTop: 4, fontSize: 21, fontWeight: 400, color: INK}}>{n.action}</div>
            </div>
          </React.Fragment>
        );
      })}

      {/* takeaway */}
      <div style={{position: 'absolute', bottom: 118, left: 0, right: 0, textAlign: 'center', opacity: takeT, transform: `translateY(${22 * (1 - takeT)}px)`}}>
        <span style={{fontSize: 40, fontWeight: 800, color: INK}}>
          קלוד לא "זוכר" לעשות פורמט - <span style={{color: CORAL}}>ההוק דואג לזה</span>
        </span>
      </div>
      <div style={{position: 'absolute', bottom: 62, left: 0, right: 0, textAlign: 'center', opacity: takeSubT, fontSize: 24, fontWeight: 400, color: SOFT}}>
        מוגדר פעם אחת ב-<Ltr>.claude/</Ltr> · נשמר בגיט לכל הצוות
      </div>
    </AbsoluteFill>
  );
};
