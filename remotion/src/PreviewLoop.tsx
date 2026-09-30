import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Heebo';

const {fontFamily} = loadFont('normal', {weights: ['400', '700', '800'], subsets: ['hebrew', 'latin']});

const PAPER = '#f8f6f1';
const INK = '#292621';
const SOFT = '#8a8378';
const CORAL = '#b65d42';
const CLAY = '#cfaa98';
const LINE = '#e8e2d9';

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const fade = (frame: number, a0: number, a1: number, b0: number, b1: number) =>
  interpolate(frame, [a0, a1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_OUT}) *
  (1 - interpolate(frame, [b0, b1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));

const Ltr: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span dir="ltr" style={{direction: 'ltr', unicodeBidi: 'isolate'}}>{children}</span>
);

const Window: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{
    position: 'absolute', left: 80, top: 150, width: 400, height: 308,
    background: '#fff', border: `2px solid ${LINE}`, borderRadius: 20,
    boxShadow: '0 14px 34px rgba(41,38,33,0.10)', overflow: 'hidden',
  }}>
    <div style={{height: 34, background: PAPER, borderBottom: `1.5px solid ${LINE}`, display: 'flex', alignItems: 'center', gap: 7, padding: '0 14px', flexDirection: 'row-reverse'}}>
      {[CORAL, CLAY, '#d9c9a8'].map((c, i) => <div key={i} style={{width: 10, height: 10, borderRadius: 99, background: c}} />)}
    </div>
    {children}
  </div>
);

const ChatMotif: React.FC = () => (
  <Window>
    <div style={{padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14}}>
      <div style={{alignSelf: 'flex-start', background: PAPER, border: `1.5px solid ${LINE}`, borderRadius: 14, padding: '10px 16px', fontSize: 19, color: INK, maxWidth: 300}}>תכתבי לי סיכום פגישה קצר</div>
      <div style={{alignSelf: 'flex-end', background: '#fdf1ec', border: `1.5px solid ${CLAY}`, borderRadius: 14, padding: '10px 16px', fontSize: 19, color: INK, maxWidth: 300}}>הנה טיוטה: שלוש נקודות מרכזיות ומשימות להמשך...</div>
      <div style={{alignSelf: 'flex-start', background: PAPER, border: `1.5px solid ${LINE}`, borderRadius: 14, padding: '10px 16px', fontSize: 19, color: INK}}>תוסיפי טבלה</div>
    </div>
  </Window>
);

const CodeMotif: React.FC = () => (
  <Window>
    <div style={{padding: '18px 20px', fontFamily: 'monospace', fontSize: 17, direction: 'ltr', textAlign: 'left', lineHeight: 1.9}}>
      <div style={{color: SOFT}}>$ claude</div>
      <div style={{color: INK}}>✻ Building expenses-board…</div>
      <div style={{color: CORAL}}>⏺ Read expenses.xlsx</div>
      <div style={{color: CORAL}}>⏺ Write dashboard.html</div>
      <div style={{color: '#7a8a6a'}}>✓ Done - 2 files changed</div>
    </div>
  </Window>
);

const DepthMotif: React.FC = () => (
  <Window>
    <div style={{padding: '26px 24px', display: 'flex', flexWrap: 'wrap', gap: 12, alignContent: 'flex-start'}}>
      {['סקילים', 'הוקס', 'MCP', "סאב-אייג'נטים", 'פקודות סלאש', 'CLAUDE.md'].map((t, i) => (
        <div key={i} style={{border: `1.5px solid ${i % 2 ? CLAY : CORAL}`, color: INK, borderRadius: 99, padding: '8px 18px', fontSize: 19, fontWeight: 700}}>{t}</div>
      ))}
    </div>
  </Window>
);

const FabricMotif: React.FC = () => {
  const bars = [90, 150, 120, 190, 165];
  return (
    <Window>
      <div style={{padding: '22px 26px', height: '100%', display: 'flex', alignItems: 'flex-end', gap: 22, direction: 'ltr', paddingBottom: 60}}>
        {bars.map((h, i) => (
          <div key={i} style={{width: 44, height: h, borderRadius: '8px 8px 0 0', background: i === 3 ? CORAL : CLAY}} />
        ))}
      </div>
    </Window>
  );
};

const BEATS = [
  {part: "חלק א׳ · פרקים 1-6", title: <><Ltr>Claude Chat</Ltr> מההתחלה</>, sub: 'שיחות, פרויקטים, ארטיפקטים וזיכרון', Motif: ChatMotif},
  {part: "חלק ב׳ · פרקים 7-12", title: <><Ltr>Claude Code</Ltr> בעבודה</>, sub: 'סוכן הפיתוח שכותב ומריץ קוד אצלכם', Motif: CodeMotif},
  {part: "חלק ג׳ · פרקים 13-18", title: 'הולכים לעומק', sub: "סקילים, הוקס, סאב-אייג'נטים ו-MCP", Motif: DepthMotif},
  {part: "חלק ד׳ · פרקים 19-21", title: <><Ltr>Fabric</Ltr> ו-<Ltr>Power BI</Ltr></>, sub: 'דוחות וסמנטיק מודל בשפה טבעית', Motif: FabricMotif},
];

export const PreviewLoop: React.FC = () => {
  const frame = useCurrentFrame();
  // beat i visible window: [i*120, (i+1)*120); fade in first 14f (except beat0 starts visible), out [i*120+106, i*120+118] (except beat3 out [462,474])
  return (
    <AbsoluteFill style={{background: PAPER, fontFamily, direction: 'rtl'}}>
      <div style={{position: 'absolute', top: 34, right: 48, width: 44, height: 5, borderRadius: 99, background: CORAL}} />
      <div style={{position: 'absolute', bottom: 34, left: 48, width: 44, height: 5, borderRadius: 99, background: CLAY}} />
      {BEATS.map((b, i) => {
        const start = i * 120;
        const inT = i === 0 ? 1 : interpolate(frame, [start, start + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const outT = i === 0 ? 0 : interpolate(frame, i === 3 ? [462, 474] : [(i + 1) * 120 + 15, (i + 1) * 120 + 29], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const o = inT * (1 - outT);
        const slide = i === 0 ? 0 : 26 * (1 - interpolate(frame, [start, start + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_OUT}));
        return (
          <div key={i} style={{position: 'absolute', inset: 0, opacity: o, transform: `translateY(${slide}px)`, background: PAPER}}>
            <div style={{position: 'absolute', right: 70, top: 170, width: 500, textAlign: 'right'}}>
              <div style={{fontSize: 22, fontWeight: 700, color: CORAL}}>{b.part}</div>
              <div style={{marginTop: 14, fontSize: 50, fontWeight: 800, color: INK, lineHeight: 1.2}}>{b.title}</div>
              <div style={{marginTop: 16, fontSize: 27, fontWeight: 400, color: SOFT}}>{b.sub}</div>
            </div>
            <b.Motif />
          </div>
        );
      })}
      {/* progress dots */}
      <div style={{position: 'absolute', bottom: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 10, direction: 'ltr'}}>
        {BEATS.map((_, i) => {
          const active = Math.floor(((frame % 480) + 480) % 480 / 120) === i;
          return <div key={i} style={{width: active ? 26 : 9, height: 9, borderRadius: 99, background: active ? CORAL : LINE}} />;
        })}
      </div>
    </AbsoluteFill>
  );
};
