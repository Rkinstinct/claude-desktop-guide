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

export const ShareClip: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const rand = React.useMemo(() => mulberry32(11), []);
  const particles = React.useMemo(() => Array.from({length: 34}, () => ({
    x: rand() * 1080, y: rand() * 1920, size: 2.5 + rand() * 5,
    phase: rand() * Math.PI * 2, speed: 0.2 + rand() * 0.45,
    color: rand() > 0.6 ? CLAY : rand() > 0.3 ? '#e3d5c8' : LINE,
    o: 0.3 + rand() * 0.4,
  })), [rand]);

  const pillT = spring({frame: frame - 4, fps, config: {damping: 14, stiffness: 150}});
  const t1 = rise(frame, 14, 26);
  const t2 = rise(frame, 26, 26);
  const t3 = rise(frame, 38, 24);

  const chips = ['20 פרקים מפורטים', 'סרטון דמו עברי לכל פרק', 'מבוסס תיעוד רשמי', 'בעברית · בחינם · מתעדכן'];
  const topics = [
    <><Ltr>Claude Chat</Ltr> ו-<Ltr>Claude Code</Ltr> ברישיון ארגוני נעול</>,
    <>שרתי <Ltr>MCP</Ltr> וסקילים שטוענים בעצמכם</>,
    <><Ltr>Skills for Fabric</Ltr> ועבודה עם <Ltr>Power BI</Ltr></>,
  ];

  const urlT = rise(frame, 292, 26);
  const urlLine = rise(frame, 306, 22);
  const tagT = rise(frame, 320, 22);

  return (
    <AbsoluteFill style={{background: PAPER, fontFamily, direction: 'rtl'}}>
      {particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: p.x, top: p.y + Math.sin(frame / 26 + p.phase) * 14 - frame * p.speed * 0.1,
          width: p.size, height: p.size, borderRadius: 99, background: p.color, opacity: p.o * rise(frame, 0, 20),
        }} />
      ))}
      <div style={{position: 'absolute', top: 56, right: 64, width: 54, height: 6, borderRadius: 99, background: CORAL, opacity: rise(frame, 30, 18)}} />
      <div style={{position: 'absolute', bottom: 56, left: 64, width: 54, height: 6, borderRadius: 99, background: CLAY, opacity: rise(frame, 36, 18)}} />

      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '120px 84px', textAlign: 'center'}}>

        <div style={{
          transform: `scale(${0.7 + 0.3 * pillT})`, opacity: pillT,
          border: `2px solid ${LINE}`, background: '#fff', borderRadius: 99,
          padding: '12px 30px', fontSize: 30, fontWeight: 700, color: SOFT, letterSpacing: 1,
        }}>מדריך חי · מתעדכן · עברית</div>

        <div style={{marginTop: 74, opacity: t1, transform: `translateY(${30 * (1 - t1)}px)`, fontSize: 74, fontWeight: 800, color: INK, lineHeight: 1.25}}>
          המדריך המלא ל-<Ltr><span style={{color: CORAL}}>Claude Desktop</span></Ltr>
        </div>
        <div style={{marginTop: 18, opacity: t2, transform: `translateY(${26 * (1 - t2)}px)`, fontSize: 44, fontWeight: 700, color: INK}}>
          + <Ltr>Fabric Skills</Ltr> ל-<Ltr>Power BI</Ltr>
        </div>
        <div style={{marginTop: 26, opacity: t3, fontSize: 32, fontWeight: 400, color: SOFT, maxWidth: 860, lineHeight: 1.5}}>
          המדריך לעובד הארגוני: בלי Cowork, בלי ענן, בלי חנות פלאגינים
        </div>

        <div style={{marginTop: 80, display: 'flex', flexDirection: 'column', gap: 22, width: '100%'}}>
          {chips.map((c, i) => {
            const t = rise(frame, 78 + i * 18, 22);
            return (
              <div key={i} style={{
                opacity: t, transform: `translateY(${24 * (1 - t)}px)`,
                border: `2px solid ${LINE}`, background: '#fff', borderRadius: 22,
                padding: '20px 34px', fontSize: 40, fontWeight: 700, color: INK,
                display: 'flex', alignItems: 'center', gap: 18, justifyContent: 'center',
              }}>
                <span style={{width: 14, height: 14, borderRadius: 99, background: i % 2 ? CLAY : CORAL, flexShrink: 0}} />
                {c}
              </div>
            );
          })}
        </div>

        <div style={{marginTop: 70, display: 'flex', flexDirection: 'column', gap: 14, width: '100%'}}>
          {topics.map((c, i) => {
            const t = rise(frame, 208 + i * 20, 22);
            return (
              <div key={i} style={{opacity: t, transform: `translateX(${(1 - t) * -26}px)`, fontSize: 36, fontWeight: 400, color: INK, lineHeight: 1.45}}>
                {c}
              </div>
            );
          })}
        </div>

        <div style={{marginTop: 'auto', opacity: urlT, transform: `translateY(${26 * (1 - urlT)}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{fontSize: 44, fontWeight: 800, color: CORAL}}>
            <Ltr>rkinstinct.github.io/claude-desktop-guide</Ltr>
          </div>
          <div style={{marginTop: 14, width: `${urlLine * 560}px`, height: 6, borderRadius: 99, background: CLAY}} />
          <div style={{marginTop: 22, opacity: tagT, fontSize: 32, fontWeight: 700, color: SOFT}}>
            לקרוא, ללמוד, לשתף
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
