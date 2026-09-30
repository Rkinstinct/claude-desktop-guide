import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Heebo';

const {fontFamily} = loadFont('normal', {weights: ['400', '700', '800'], subsets: ['hebrew', 'latin']});

const PAPER = '#f8f6f1';
const CARD = '#fffefa';
const INK = '#292621';
const SOFT = '#8a8378';
const CORAL = '#b65d42';
const CLAY = '#cfaa98';
const LINE = '#e8e2d9';
const GREEN = '#1a9e54';

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);

const rise = (frame: number, at: number, dur = 26) =>
  interpolate(frame, [at, at + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_OUT});

// RTL spectrum: index 0 (Manual, most control) sits RIGHT, index 4 (Bypass) LEFT
const MODES = [
  {name: 'Manual', desc: 'שואל לפני כל עריכה וכל פקודה', when: 'קוד רגיש, לימוד הכלי'},
  {name: 'Accept edits', desc: 'עריכות מתאשרות לבד, פקודות שואלות', when: 'סומכים על הכיוון'},
  {name: 'Plan', desc: 'חוקר ומציג תוכנית - בלי לגעת בכלום', when: 'משימה מורכבת'},
  {name: 'Auto', desc: 'מבצע לבד עם בדיקות בטיחות', when: 'משימות שגרתיות ומוגדרות'},
  {name: 'Bypass permissions', desc: 'בלי אישורים בכלל', when: 'רק בסביבה מבודדת!'},
];

const ACTIVE_START = 80;
const ACTIVE_DUR = 44;

export const ConceptPerms: React.FC = () => {
  const frame = useCurrentFrame();

  const titleT = rise(frame, 0, 30);
  const titleOut = interpolate(frame, [52, 66], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_IN_OUT});
  const railT = rise(frame, 50, 28);
  const sceneOut = interpolate(frame, [368, 398], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_IN_OUT});
  const flowT = rise(frame, 300, 26);
  const takeT = rise(frame, 400, 28);

  const active = Math.min(MODES.length - 1, Math.floor(Math.max(0, frame - ACTIVE_START) / ACTIVE_DUR));

  return (
    <AbsoluteFill style={{background: PAPER, fontFamily, direction: 'rtl'}}>
      {/* title beat */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: titleOut}}>
        <div style={{textAlign: 'center', transform: `translateY(${(1 - titleT) * 40}px)`, opacity: titleT}}>
          <div style={{fontSize: 74, fontWeight: 800, color: INK, letterSpacing: '-0.02em'}}>מצבי הרשאות</div>
          <div style={{fontSize: 30, fontWeight: 400, color: SOFT, marginTop: 14}}>כמה עצמאות לתת לקלוד - ומתי</div>
        </div>
      </AbsoluteFill>

      {/* spectrum scene */}
      <AbsoluteFill style={{opacity: railT * (1 - sceneOut), transform: `translateY(${sceneOut * 40}px)`}}>
        {/* spectrum labels */}
        <div style={{position: 'absolute', top: 92, left: 120, right: 120, display: 'flex', justifyContent: 'space-between', fontSize: 21, color: SOFT, fontWeight: 700, opacity: railT}}>
          <span>יותר עצמאות לקלוד</span>
          <span>יותר שליטה לכם</span>
        </div>
        {/* rail */}
        <div style={{position: 'absolute', top: 140, left: 120, right: 120, height: 10, background: LINE, borderRadius: 99, opacity: railT}} />
        {/* stops (RTL: first mode rightmost) */}
        {MODES.map((m, i) => {
          const xPct = (i / (MODES.length - 1)) * 100; // 0=right in RTL flow
          const at = ACTIVE_START + i * ACTIVE_DUR;
          const t = rise(frame, at, 18);
          const isActive = frame >= at && active === i;
          return (
            <div key={i} style={{
              position: 'absolute', top: 131, right: `calc(${xPct}% + 120px - ${(xPct / 100) * 0}px)`, // adjusted below
              left: `${120 + ((MODES.length - 1 - i) / (MODES.length - 1)) * (1080 - 240) - 14}px`,
              width: 28, height: 28, borderRadius: 99,
              background: isActive ? CORAL : t > 0.5 ? CLAY : CARD,
              border: `3px solid ${isActive ? CORAL : t > 0.5 ? CLAY : LINE}`,
              transform: `scale(${isActive ? 1.35 : 1})`,
              transition: 'none',
            }} />
          );
        })}
        {/* active mode card */}
        <div style={{position: 'absolute', top: 210, left: 120, right: 120, opacity: railT}}>
          {MODES.map((m, i) => {
            const at = ACTIVE_START + i * ACTIVE_DUR;
            const on = frame >= at && frame < at + ACTIVE_DUR + (i === MODES.length - 1 ? 40 : 0);
            if (!on) return null;
            const t = rise(frame, at, 14);
            return (
              <div key={i} style={{
                background: CARD, border: `1.5px solid ${LINE}`, borderRadius: 22, padding: '28px 36px',
                boxShadow: '0 14px 44px rgba(57,41,28,0.07)', textAlign: 'center',
                opacity: t, transform: `translateY(${(1 - t) * 18}px)`,
              }}>
                <div style={{fontSize: 40, fontWeight: 800, color: CORAL, fontFamily: 'monospace', direction: 'ltr', unicodeBidi: 'isolate'}}>{m.name}</div>
                <div style={{fontSize: 27, fontWeight: 700, color: INK, marginTop: 10}}>{m.desc}</div>
                <div style={{fontSize: 22, color: SOFT, marginTop: 8}}>מתי: {m.when}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* recommended flow */}
      <AbsoluteFill style={{opacity: flowT * (1 - rise(frame, 396, 22)), pointerEvents: 'none'}}>
        <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center'}}>
          <div style={{fontSize: 32, fontWeight: 800, color: INK, opacity: flowT}}>משימה מורכבת? הזרימה המומלצת</div>
          <div style={{display: 'flex', gap: 26, justifyContent: 'center', alignItems: 'center', marginTop: 44, direction: 'ltr'}}>
            <div style={{background: CARD, border: `2px solid ${CORAL}`, borderRadius: 16, padding: '16px 34px', fontSize: 30, fontFamily: 'monospace', color: CORAL, opacity: rise(frame, 312, 18)}}>Plan</div>
            <div style={{fontSize: 34, color: SOFT, opacity: rise(frame, 326, 14)}}>←</div>
            <div style={{background: CARD, border: `2px solid ${CLAY}`, borderRadius: 16, padding: '16px 34px', fontSize: 30, fontFamily: 'monospace', color: INK, opacity: rise(frame, 336, 18)}}>Accept edits</div>
          </div>
          <div style={{fontSize: 24, color: SOFT, marginTop: 34, opacity: rise(frame, 350, 18)}}>מסכימים על הגישה כשעוד לא השתנה אף קובץ - ואז מבצעים עם מעקב</div>
        </div>
      </AbsoluteFill>

      {/* takeaway */}
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', opacity: takeT, transform: `translateY(${(1 - takeT) * 24}px)`}}>
          <div style={{fontSize: 42, fontWeight: 800, color: INK}}>המצב משתנה ממשימה למשימה</div>
          <div style={{display: 'inline-block', marginTop: 28, background: INK, color: CARD, borderRadius: 14, padding: '12px 30px', fontSize: 28, fontFamily: 'monospace', direction: 'ltr'}}>Shift+Tab</div>
          <div style={{fontSize: 24, color: SOFT, marginTop: 22}}>מחליף מצב בלחיצה · מתוך פרק 9: מצבי הרשאות</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
