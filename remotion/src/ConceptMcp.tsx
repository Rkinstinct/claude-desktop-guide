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

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);

const rise = (frame: number, at: number, dur = 26) =>
  interpolate(frame, [at, at + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_OUT});

const CX = 540, CY = 300;
const SYSTEMS = [
  {label: 'בסיס נתונים', tool: 'קרא מה-DB', x: 180, y: 130},
  {label: 'GitHub', tool: 'ניהול Issues', x: 540, y: 92, latin: true},
  {label: 'Fabric', tool: 'צור דוח', x: 900, y: 130, latin: true},
  {label: 'קבצים מקומיים', tool: 'גישה לקבצים', x: 260, y: 470},
  {label: 'API פנימי', tool: 'שאילתה פנימית', x: 820, y: 470},
];
const LINE_START = 150;
const LINE_DUR = 44;

export const ConceptMcp: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const titleT = rise(frame, 0, 30);
  const titleOut = interpolate(frame, [50, 64], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_IN_OUT});
  const sceneT = rise(frame, 46, 26);
  const cfgT = rise(frame, 88, 24);
  const cfgOut = interpolate(frame, [386, 412], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_IN_OUT});
  const capT = rise(frame, 396, 22);
  const takeT = rise(frame, 452, 26);
  const sceneOut = interpolate(frame, [446, 478], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_IN_OUT});

  return (
    <AbsoluteFill style={{background: PAPER, fontFamily, direction: 'rtl'}}>
      {/* title */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: titleOut}}>
        <div style={{textAlign: 'center', transform: `translateY(${(1 - titleT) * 40}px)`, opacity: titleT}}>
          <div style={{fontSize: 80, fontWeight: 800, color: INK, letterSpacing: '-0.02em', direction: 'ltr'}}>MCP</div>
          <div style={{fontSize: 30, fontWeight: 400, color: SOFT, marginTop: 12}}>לחבר את קלוד למערכות שלכם - בעצמכם</div>
        </div>
      </AbsoluteFill>

      {/* hub scene */}
      <AbsoluteFill style={{opacity: sceneT * (1 - sceneOut), transform: `translateY(${sceneOut * 40}px)`}}>
        {/* connection lines */}
        <svg width={1080} height={608} style={{position: 'absolute', inset: 0}}>
          {SYSTEMS.map((s, i) => {
            const at = LINE_START + i * LINE_DUR;
            const t = rise(frame, at, 26);
            const len = Math.hypot(s.x - CX, s.y - CY);
            return (
              <line key={i} x1={CX} y1={CY} x2={s.x} y2={s.y}
                stroke={CORAL} strokeWidth={3.5} strokeLinecap="round"
                strokeDasharray={len} strokeDashoffset={(1 - t) * len} opacity={0.85} />
            );
          })}
        </svg>
        {/* center node */}
        <div style={{
          position: 'absolute', left: CX - 62, top: CY - 62, width: 124, height: 124, borderRadius: 999,
          background: CARD, border: `3px solid ${CORAL}`, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 40px rgba(182,93,66,0.18)',
          transform: `scale(${spring({frame: frame - 50, fps, config: {damping: 12, stiffness: 170}})})`,
        }}>
          <div style={{width: 34, height: 34, borderRadius: 8, background: CORAL, transform: 'rotate(45deg)'}} />
          <div style={{fontSize: 19, fontWeight: 800, color: INK, marginTop: 10}}>קלוד</div>
        </div>
        {/* system nodes */}
        {SYSTEMS.map((s, i) => {
          const at = LINE_START + i * LINE_DUR;
          const t = rise(frame, at + 18, 16);
          const chipT = rise(frame, at + 30, 14);
          return (
            <React.Fragment key={i}>
              <div style={{
                position: 'absolute', left: s.x - 78, top: s.y - 30, width: 156, padding: '12px 0',
                background: CARD, border: `2px solid ${t > 0.5 ? CORAL : LINE}`, borderRadius: 16, textAlign: 'center',
                color: t > 0.5 ? INK : SOFT, fontSize: 20, fontWeight: 700,
                opacity: sceneT * (0.45 + 0.55 * t),
              }}>
                <span style={{direction: s.latin ? 'ltr' : 'rtl', unicodeBidi: 'isolate'}}>{s.label}</span>
              </div>
              <div style={{
                position: 'absolute', left: s.x - 78, top: s.y + 36, width: 156, textAlign: 'center',
                opacity: chipT, transform: `translateY(${(1 - chipT) * 10}px)`,
              }}>
                <span style={{background: '#fdf0ea', color: CORAL, borderRadius: 99, padding: '5px 16px', fontSize: 16.5, fontWeight: 700, whiteSpace: 'nowrap'}}>
                  {s.tool}
                </span>
              </div>
            </React.Fragment>
          );
        })}
        {/* config card */}
        <div style={{
          position: 'absolute', left: 330, right: 330, bottom: 26, background: INK, borderRadius: 16,
          padding: '14px 22px', opacity: cfgT * cfgOut, transform: `translateY(${(1 - cfgT) * 30}px)`,
        }}>
          <div style={{fontSize: 15, color: CLAY, fontFamily: 'monospace', direction: 'ltr', textAlign: 'left'}}>claude_desktop_config.json</div>
          <div style={{fontSize: 16.5, color: CARD, fontFamily: 'monospace', direction: 'ltr', textAlign: 'left', marginTop: 4}}>
            "mcpServers": {'{'} "filesystem": {'{'} ... {'}'} {'}'}
          </div>
        </div>
        {/* caption */}
        {frame >= 396 && frame < 452 && (
          <div style={{position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center', fontSize: 27, fontWeight: 700, color: INK, opacity: capT}}>
            אחרי הטעינה - הכלים מופיעים בסשן כמו כל כלי אחר
          </div>
        )}
      </AbsoluteFill>

      {/* takeaway */}
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center', opacity: takeT, transform: `translateY(${(1 - takeT) * 24}px)`}}>
          <div style={{fontSize: 42, fontWeight: 800, color: INK}}>תקן פתוח, קובץ הגדרות אחד</div>
          <div style={{fontSize: 27, color: SOFT, marginTop: 16}}>בלי ספריית קונקטורים - טוענים שרתי <span style={{direction: 'ltr', unicodeBidi: 'isolate'}}>MCP</span> בעצמכם</div>
          <div style={{fontSize: 21, color: SOFT, marginTop: 26}}>מתוך פרק 18: MCP</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
