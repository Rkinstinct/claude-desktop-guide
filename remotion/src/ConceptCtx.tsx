import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
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

// Window: x 240..840 (600 wide), y 150..560 (410 tall). Fill grows upward from bottom.
const WIN = {x: 240, y: 150, w: 600, h: 410};

type Chunk = {label: string; frac: number; color: string; at: number};
const CHUNKS: Chunk[] = [
  {label: 'הוראות וכלים', frac: 0.14, color: CLAY, at: 80},
  {label: 'ההודעות שלכם', frac: 0.24, color: '#d9c6b4', at: 120},
  {label: 'התשובות של קלוד', frac: 0.21, color: '#c99b85', at: 160},
  {label: 'קבצים ותוצאות כלים', frac: 0.26, color: CORAL, at: 200},
];
const FULL = CHUNKS.reduce((s, c) => s + c.frac, 0); // 0.85

const rise = (frame: number, at: number, dur = 26) =>
  interpolate(frame, [at, at + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_OUT});

export const ConceptCtx: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // phases
  const titleT = rise(frame, 0, 30);
  const titleOut = interpolate(frame, [52, 66], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_IN_OUT});
  const winT = rise(frame, 45, 30);
  const warnT = interpolate(frame, [240, 262], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_OUT});
  const compactT = interpolate(frame, [306, 344], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_IN_OUT});
  const refillT = interpolate(frame, [366, 420], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_OUT});
  const takeT = rise(frame, 430, 30);

  // fill fraction over time
  let fill = 0;
  for (const c of CHUNKS) fill += c.frac * rise(frame, c.at, 24);
  fill = fill * (1 - compactT) + 0.14 * compactT; // after compact: only summary block
  fill = fill + 0.31 * refillT * compactT; // healthy refill to 0.45
  const pct = Math.round(fill * 100);

  // meter color
  const meterColor = fill > 0.7 ? CORAL : fill > 0.45 ? CLAY : GREEN;

  const warnPulse = warnT * (1 - compactT) * (0.5 + 0.5 * Math.sin(frame / 5));

  return (
    <AbsoluteFill style={{background: PAPER, fontFamily, direction: 'rtl'}}>
      {/* title beat */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: titleOut}}>
        <div style={{textAlign: 'center', transform: `translateY(${(1 - titleT) * 40}px)`, opacity: titleT}}>
          <div style={{fontSize: 74, fontWeight: 800, color: INK, letterSpacing: '-0.02em'}}>חלון הקונטקסט</div>
          <div style={{fontSize: 30, fontWeight: 400, color: SOFT, marginTop: 14}}>זיכרון העבודה של קלוד - ומה קורה כשהוא מתמלא</div>
        </div>
      </AbsoluteFill>

      {/* window scene */}
      <AbsoluteFill style={{opacity: winT}}>
        {/* window frame */}
        <div style={{
          position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h,
          background: CARD, border: `2px solid ${LINE}`, borderRadius: 26, overflow: 'hidden',
          boxShadow: '0 18px 60px rgba(57,41,28,0.08)',
          transform: `translateY(${(1 - winT) * 30}px)`,
        }}>
          {/* title bar */}
          <div style={{height: 46, borderBottom: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 8}}>
            <div style={{width: 12, height: 12, borderRadius: 99, background: CLAY}} />
            <div style={{width: 12, height: 12, borderRadius: 99, background: LINE}} />
            <div style={{fontSize: 17, color: SOFT, marginRight: 8}}>השיחה שלכם עם קלוד</div>
          </div>
          {/* fill area */}
          <div style={{position: 'absolute', left: 0, right: 0, top: 46, bottom: 0}}>
            {/* chunks (pre-compact) */}
            {CHUNKS.map((c, i) => {
              const t = rise(frame, c.at, 24);
              const below = CHUNKS.slice(0, i).reduce((s, x) => s + x.frac, 0);
              const hPx = (WIN.h - 46) * c.frac;
              const yBase = WIN.h - 46 - (WIN.h - 46) * below;
              const collapse = compactT;
              const y = yBase - t * hPx + collapse * ((WIN.h - 46) * 0.5 - yBase + t * hPx);
              return (
                <div key={i} style={{
                  position: 'absolute', left: 14, right: 14, top: y - hPx * (1 - collapse) * 0, height: Math.max(0, t * hPx * (1 - collapse)),
                  background: c.color, borderRadius: 12, marginBottom: 6, overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: t * (1 - collapse),
                }}>
                  <div style={{fontSize: 20, fontWeight: 700, color: '#fffefa'}}>{c.label}</div>
                </div>
              );
            })}
            {/* summary block (post-compact) */}
            <div style={{
              position: 'absolute', left: 14, right: 14, bottom: 0, height: (WIN.h - 46) * 0.14,
              background: GREEN, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: compactT, transform: `scale(${0.6 + 0.4 * spring({frame: frame - 330, fps, config: {damping: 12, stiffness: 160}})})`,
            }}>
              <div style={{fontSize: 20, fontWeight: 700, color: '#fffefa'}}>סיכום דחוס של השיחה</div>
            </div>
            {/* healthy refill */}
            <div style={{
              position: 'absolute', left: 14, right: 14, bottom: (WIN.h - 46) * 0.14 + 8, height: (WIN.h - 46) * 0.31 * refillT,
              background: CLAY, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            }}>
              <div style={{fontSize: 20, fontWeight: 700, color: '#fffefa', opacity: refillT}}>ממשיכים לעבוד בראש נקי</div>
            </div>
            {/* warn tint */}
            <div style={{position: 'absolute', inset: 0, background: CORAL, opacity: warnPulse * 0.16, pointerEvents: 'none'}} />
          </div>
        </div>

        {/* meter */}
        <div style={{position: 'absolute', left: WIN.x + WIN.w + 36, top: WIN.y + 46, width: 26, height: WIN.h - 46, background: LINE, borderRadius: 99, overflow: 'hidden', opacity: winT}}>
          <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: `${fill * 100}%`, background: meterColor, borderRadius: 99}} />
        </div>
        <div style={{position: 'absolute', left: WIN.x + WIN.w + 14, top: WIN.y + WIN.h + 8, width: 90, textAlign: 'center', fontSize: 30, fontWeight: 800, color: meterColor, fontVariantNumeric: 'tabular-nums', direction: 'ltr'}}>
          {pct}%
        </div>

        {/* phase captions */}
        <div style={{position: 'absolute', top: WIN.y + WIN.h + 26, left: 0, right: 0, textAlign: 'center'}}>
          {frame >= 240 && frame < 306 && (
            <div style={{fontSize: 30, fontWeight: 700, color: CORAL, opacity: warnT}}>החלון מתמלא - והביצועים יורדים</div>
          )}
          {frame >= 300 && frame < 366 && (
            <div style={{fontSize: 30, fontWeight: 700, color: INK, opacity: compactT}}>
              <span style={{fontFamily: 'monospace', color: CORAL}}>/compact</span> דוחס את השיחה ומפנה מקום
            </div>
          )}
          {frame >= 366 && frame < 436 && (
            <div style={{fontSize: 30, fontWeight: 700, color: GREEN, opacity: refillT}}>הסיכום נשאר - המקום מתפנה</div>
          )}
        </div>

        {/* compact chip flying in */}
        {frame >= 296 && frame < 350 && (
          <div style={{
            position: 'absolute', left: '50%', top: 110, transform: `translateX(-50%) translateY(${(1 - rise(frame, 296, 14)) * -60}px)`,
            background: INK, color: CARD, borderRadius: 14, padding: '10px 26px', fontSize: 26, fontFamily: 'monospace', direction: 'ltr',
            opacity: frame > 340 ? interpolate(frame, [340, 350], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1,
          }}>/compact</div>
        )}

        {/* takeaway */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center',
          opacity: takeT, transform: `translateY(${(1 - takeT) * 24}px)`,
        }}>
          <div style={{fontSize: 40, fontWeight: 800, color: INK}}>מי שמנהל את החלון נכון - מקבל תשובות טובות יותר</div>
          <div style={{display: 'flex', gap: 18, justifyContent: 'center', marginTop: 26, direction: 'ltr'}}>
            {['/compact', '/usage', '/btw'].map((cmd, i) => (
              <div key={cmd} style={{
                background: CARD, border: `1.5px solid ${LINE}`, borderRadius: 12, padding: '8px 22px',
                fontSize: 24, fontFamily: 'monospace', color: CORAL,
                opacity: rise(frame, 452 + i * 10, 16), transform: `translateY(${(1 - rise(frame, 452 + i * 10, 16)) * 16}px)`,
              }}>{cmd}</div>
            ))}
          </div>
          <div style={{fontSize: 21, color: SOFT, marginTop: 20}}>מתוך פרק 6: קונטקסט וטוקנים</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
