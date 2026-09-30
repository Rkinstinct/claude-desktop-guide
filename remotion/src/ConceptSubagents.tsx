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

const SUBS = [
  {task: 'סריקת קודבייס ענק', report: '3 קבצים רלוונטיים', y: 175, at: 150},
  {task: "סקירת מסמך - פרסונה א'", report: 'ממצאים תוכן', y: 270, at: 185},
  {task: "סקירת מסמך - פרסונה ב'", report: 'ממצאים סיכונים', y: 365, at: 220},
];

export const ConceptSubagents: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const titleT = rise(frame, 8, 24);
  const subT = rise(frame, 22, 22);
  const mainT = spring({frame: frame - 60, fps, config: {damping: 14, stiffness: 140}});
  const mainBar = interpolate(frame, [330, 480], [0, 0.18], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const takeT = rise(frame, 490, 26);
  const takeSubT = rise(frame, 515, 24);

  return (
    <AbsoluteFill style={{background: PAPER, fontFamily, direction: 'rtl'}}>
      <div style={{position: 'absolute', top: 36, right: 48, width: 44, height: 5, borderRadius: 99, background: CORAL, opacity: rise(frame, 30, 18)}} />
      <div style={{position: 'absolute', bottom: 36, left: 48, width: 44, height: 5, borderRadius: 99, background: CLAY, opacity: rise(frame, 36, 18)}} />

      <div style={{position: 'absolute', top: 44, left: 0, right: 0, textAlign: 'center', opacity: titleT, transform: `translateY(${22 * (1 - titleT)}px)`}}>
        <span style={{fontSize: 54, fontWeight: 800, color: INK}}>סאב-אייג׳נטים</span>
      </div>
      <div style={{position: 'absolute', top: 112, left: 0, right: 0, textAlign: 'center', opacity: subT, fontSize: 28, fontWeight: 400, color: SOFT}}>
        לפצל משימה גדולה נכון
      </div>

      {/* main agent card (right) */}
      <div style={{
        position: 'absolute', top: 230, right: 60, width: 300,
        opacity: mainT, transform: `scale(${0.85 + 0.15 * mainT})`,
        border: `2.5px solid ${CORAL}`, background: '#fff', borderRadius: 20, padding: '16px 20px', textAlign: 'center',
        boxShadow: '0 10px 26px rgba(182,93,66,0.14)',
      }}>
        <div style={{fontSize: 26, fontWeight: 800, color: INK}}>הסוכן הראשי</div>
        <div style={{marginTop: 4, fontSize: 19, fontWeight: 400, color: SOFT}}>התזמורת</div>
        {/* main context bar - stays clean */}
        <div style={{marginTop: 12, height: 10, borderRadius: 99, background: LINE, overflow: 'hidden'}}>
          <div style={{width: `${mainBar * 100}%`, height: '100%', background: CORAL, borderRadius: 99}} />
        </div>
        <div style={{marginTop: 5, fontSize: 16, color: SOFT}}>חלון ההקשר שלו נשאר נקי</div>
      </div>

      {/* subagents */}
      {SUBS.map((s, i) => {
        const st = spring({frame: frame - s.at, fps, config: {damping: 14, stiffness: 140}});
        const work = interpolate(frame, [s.at + 40, s.at + 150], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const rep = rise(frame, s.at + 170, 22);
        const repX = interpolate(frame, [s.at + 170, s.at + 230], [0, 300], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_OUT});
        return (
          <React.Fragment key={i}>
            <div style={{
              position: 'absolute', top: s.y, left: 60, width: 340,
              opacity: st, transform: `scale(${0.85 + 0.15 * st})`,
              border: `2px solid ${LINE}`, background: '#fff', borderRadius: 18, padding: '13px 18px',
              boxShadow: '0 8px 20px rgba(41,38,33,0.06)',
            }}>
              <div style={{fontSize: 22, fontWeight: 700, color: INK}}>{s.task}</div>
              <div style={{marginTop: 8, height: 9, borderRadius: 99, background: LINE, overflow: 'hidden'}}>
                <div style={{width: `${work * 100}%`, height: '100%', background: CLAY, borderRadius: 99}} />
              </div>
              <div style={{marginTop: 4, fontSize: 15, color: SOFT}}>חלון הקשר נקי משלו</div>
            </div>
            {/* report chip traveling back to main */}
            <div style={{
              position: 'absolute', top: s.y + 26, left: 420 + repX * 0 , right: 'auto',
              opacity: rep * (1 - rise(frame, s.at + 225, 16)), transform: `translateX(${repX}px)`,
              border: `2px solid ${CORAL}`, background: '#fff', borderRadius: 99,
              padding: '6px 16px', fontSize: 18, fontWeight: 700, color: CORAL, whiteSpace: 'nowrap',
            }}>
              {s.report}
            </div>
          </React.Fragment>
        );
      })}

      {/* takeaway */}
      <div style={{position: 'absolute', bottom: 96, left: 0, right: 0, textAlign: 'center', opacity: takeT, transform: `translateY(${22 * (1 - takeT)}px)`}}>
        <span style={{fontSize: 34, fontWeight: 800, color: INK}}>
          הוא מפצל, הם עובדים, הוא מחזיר <span style={{color: CORAL}}>תשובה אחת מאוחדת</span>
        </span>
      </div>
      <div style={{position: 'absolute', bottom: 48, left: 0, right: 0, textAlign: 'center', opacity: takeSubT, fontSize: 23, fontWeight: 400, color: SOFT}}>
        הסריקה הכבדה קורית בסשן המשני - והסשן הראשי מקבל רק סיכום אחד
      </div>
    </AbsoluteFill>
  );
};
