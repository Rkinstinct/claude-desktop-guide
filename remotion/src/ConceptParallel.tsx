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

const Ltr: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span dir="ltr" style={{direction: 'ltr', unicodeBidi: 'isolate'}}>{children}</span>
);

const LANES = [CORAL, CLAY, '#6f6a60'];

const SESSIONS = [
  {n: 'סשן 1', task: 'בונה דשבורד', at: 55, speed: 0.85},
  {n: 'סשן 2', task: 'כותב בדיקות', at: 85, speed: 0.6},
  {n: 'סשן 3', task: 'מתקן באג', at: 115, speed: 0.7},
];

const CARD_W = 300;
const GAP = 30;
const RIGHT0 = 60;

const cardCenterX = (i: number) => 1080 - (RIGHT0 + i * (CARD_W + GAP) + CARD_W / 2);

export const ConceptParallel: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const titleT = rise(frame, 8, 24);
  const subT = rise(frame, 22, 22);
  const repoT = spring({frame: frame - 300, fps, config: {damping: 14, stiffness: 140}});
  const takeT = rise(frame, 520, 26);
  const takeSubT = rise(frame, 545, 24);

  return (
    <AbsoluteFill style={{background: PAPER, fontFamily, direction: 'rtl'}}>
      <div style={{position: 'absolute', top: 36, right: 48, width: 44, height: 5, borderRadius: 99, background: CORAL, opacity: rise(frame, 30, 18)}} />
      <div style={{position: 'absolute', bottom: 36, left: 48, width: 44, height: 5, borderRadius: 99, background: CLAY, opacity: rise(frame, 36, 18)}} />

      <div style={{position: 'absolute', top: 42, left: 0, right: 0, textAlign: 'center', opacity: titleT, transform: `translateY(${22 * (1 - titleT)}px)`}}>
        <span style={{fontSize: 52, fontWeight: 800, color: INK}}>עבודה מקבילה</span>
      </div>
      <div style={{position: 'absolute', top: 106, left: 0, right: 0, textAlign: 'center', opacity: subT, fontSize: 27, fontWeight: 400, color: SOFT}}>
        כמה סשנים על אותו פרויקט
      </div>

      {/* session cards */}
      {SESSIONS.map((s, i) => {
        const st = spring({frame: frame - s.at, fps, config: {damping: 14, stiffness: 140}});
        const work = interpolate(frame, [s.at + 20, s.at + 20 + 260 * s.speed], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const chipT = rise(frame, s.at + 100, 20);
        const cx = cardCenterX(i);
        return (
          <React.Fragment key={i}>
            <div style={{
              position: 'absolute', top: 156, right: RIGHT0 + i * (CARD_W + GAP), width: CARD_W,
              opacity: st, transform: `scale(${0.85 + 0.15 * st})`,
              border: `2px solid ${LANES[i]}`, background: '#fff', borderRadius: 18, padding: '12px 18px',
              boxShadow: '0 8px 20px rgba(41,38,33,0.06)', textAlign: 'center',
            }}>
              <div style={{fontSize: 23, fontWeight: 800, color: INK}}>{s.n}</div>
              <div style={{marginTop: 2, fontSize: 19, fontWeight: 400, color: SOFT}}>{s.task}</div>
              <div style={{marginTop: 9, height: 9, borderRadius: 99, background: LINE, overflow: 'hidden'}}>
                <div style={{width: `${work * 100}%`, height: '100%', background: LANES[i], borderRadius: 99}} />
              </div>
            </div>
            {/* worktree chip */}
            <div style={{
              position: 'absolute', top: 288, right: RIGHT0 + i * (CARD_W + GAP) + 35, width: 230,
              opacity: chipT, textAlign: 'center',
              border: `1.5px dashed ${LANES[i]}`, background: PAPER, borderRadius: 99, padding: '5px 10px',
            }}>
              <span style={{fontSize: 17, fontWeight: 700, color: INK}}>עותק מבודד </span>
              <span style={{fontSize: 15, fontWeight: 700, color: LANES[i]}}><Ltr>(worktree)</Ltr></span>
            </div>
            {/* lane down to repo */}
            <div style={{
              position: 'absolute', top: 324, left: cx - 1.5, width: 3, height: 62,
              background: LANES[i], opacity: chipT * repoT, borderRadius: 99,
            }} />
            {/* change pulse */}
            {(() => {
              const pulseAt = 380 + i * 30;
              const pt = interpolate(frame, [pulseAt, pulseAt + 60], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
              if (pt <= 0 || pt >= 1) return null;
              return (
                <div style={{
                  position: 'absolute', top: 324 + pt * 56, left: cx - 6, width: 12, height: 12,
                  borderRadius: 99, background: LANES[i], boxShadow: `0 0 10px ${LANES[i]}`,
                }} />
              );
            })()}
          </React.Fragment>
        );
      })}

      {/* shared repo */}
      <div style={{
        position: 'absolute', top: 388, left: 0, right: 0, margin: '0 auto', width: 700,
        opacity: repoT, transform: `scale(${0.9 + 0.1 * repoT})`,
        border: `2.5px solid ${INK}`, background: '#fff', borderRadius: 18, padding: '12px 20px', textAlign: 'center',
        boxShadow: '0 10px 26px rgba(41,38,33,0.12)',
      }}>
        <div style={{fontSize: 24, fontWeight: 800, color: INK}}>הפרויקט המשותף</div>
        <div style={{marginTop: 2, fontSize: 18, fontWeight: 700, color: SOFT}}><Ltr>expenses-board</Ltr></div>
      </div>

      {/* takeaway */}
      <div style={{position: 'absolute', top: 478, left: 0, right: 0, textAlign: 'center', opacity: takeT, transform: `translateY(${14 * (1 - takeT)}px)`}}>
        <span style={{fontSize: 29, fontWeight: 800, color: INK}}>כל סשן עובד על עותק מבודד של הריפו</span>
      </div>
      <div style={{position: 'absolute', top: 520, left: 0, right: 0, textAlign: 'center', opacity: takeSubT, fontSize: 21, fontWeight: 400, color: SOFT}}>
        שני סשנים לא דורסים אחד את השני · <Ltr>Cmd+N</Ltr> סשן חדש · התראה כשסשן מסיים
      </div>
    </AbsoluteFill>
  );
};
