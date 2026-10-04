/* Shared by exam.html and exam-admin.html. No network, no storage of personal data. */
window.EXAM_CONFIG={
 version:2,
 passMark:70,        // Part A/B composite needed to pass
 advancedMark:85,    // composite at or above this = advanced
 perChapter:2,       // questions drawn from each chapter's pool
 weightA:0.6, weightB:0.4,
 targetMinutesB:60,  // reference time shown to examinees and in the admin table
 // Later: set to a Cloudflare Worker URL and results are also POSTed there (see submitResult in exam.js).
 resultsEndpoint:null
};
(function(){
 const C=window.EXAM_CONFIG;
 function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
 function seedNum(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
 const REGIONS=['צפון','מרכז','דרום','ירושלים'],CATS=['תוכנה','חומרה','שירות','הדרכה'],MONTHS=['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
 const BASE={'תוכנה':900,'חומרה':1400,'שירות':700,'הדרכה':450},COST={'תוכנה':.28,'חומרה':.66,'שירות':.45,'הדרכה':.38},REGF={'צפון':.8,'מרכז':1.35,'דרום':.7,'ירושלים':.95};
 function dataset(id){
  const r=mulberry(seedNum('claude-exam:'+id)),rows=[];
  const phase=r()*12,shock=Math.floor(r()*12),rat=[.28,.38,.45,.62];for(let i=3;i>0;i--){const j=Math.floor(r()*(i+1));[rat[i],rat[j]]=[rat[j],rat[i]]}
  const COSTR={};CATS.forEach((c,i)=>COSTR[c]=rat[i]);
  for(let m=0;m<12;m++){const season=(1+.22*Math.sin((m-phase)/12*2*Math.PI))*(m===shock?.72:1);
   for(const g of REGIONS)for(const c of CATS){
    const units=Math.round(6+r()*30),price=Math.round(BASE[c]*REGF[g]*season*(.85+r()*.3));
    const revenue=units*price,cost=Math.round(revenue*(COSTR[c]+(r()-.5)*.06));
    rows.push({date:'2025-'+String(m+1).padStart(2,'0')+'-15',region:g,category:c,units,revenue,cost});}}
  return rows;
 }
 function csv(rows){return 'date,region,category,units,revenue,cost\n'+rows.map(x=>[x.date,x.region,x.category,x.units,x.revenue,x.cost].join(',')).join('\n')+'\n'}

 const NAMES=['Nimbus Retail','Olive & Co','Kedem Supply','Orbit Foods','Tavor Labs','Blue Harbor','Sela Market','Lumen Goods'],COLORS=['#1f6f8b','#c2573a','#2e7d5b','#6a4c93','#b8860b','#d1495b','#3a5a40','#0b6e99'];
 function brand(id){
  const r=mulberry(seedNum('brand:'+id)),name=NAMES[Math.floor(r()*NAMES.length)],color=COLORS[Math.floor(r()*COLORS.length)];
  let d='M12 52';for(let i=0;i<5;i++)d+=' L'+(12+(i+1)*10)+' '+Math.round(14+r()*34);
  return {name,color,sigD:d,initial:name[0]};
 }
 function logoSvg(id){
  const b=brand(id);
  return '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="96" viewBox="0 0 320 96" role="img" aria-label="'+b.name+'"><rect x="4" y="8" width="80" height="80" rx="18" fill="'+b.color+'"/><path d="'+b.sigD+'" transform="translate(4 8) scale(.9)" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><text x="100" y="60" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" fill="'+b.color+'">'+b.name.replace('&','&amp;')+'</text></svg>';
 }
 // The checks. Region for check 1 depends on the seed so neighbours cannot copy numbers.
 function checks(id,rows){
  const reg=REGIONS[seedNum('r:'+id)%4];
  const q3=rows.filter(x=>x.region===reg&&+x.date.slice(5,7)>=7&&+x.date.slice(5,7)<=9).reduce((a,x)=>a+x.revenue,0);
  const byCat={};rows.forEach(x=>{const o=byCat[x.category]||(byCat[x.category]={r:0,c:0});o.r+=x.revenue;o.c+=x.cost});
  const bestCat=CATS.slice().sort((a,b)=>(byCat[b].r-byCat[b].c)/byCat[b].r-(byCat[a].r-byCat[a].c)/byCat[a].r)[0];
  const mt=Array(12).fill(0);rows.forEach(x=>mt[+x.date.slice(5,7)-1]+=x.revenue);
  let worst=1,wd=Infinity;for(let m=1;m<12;m++){const d=mt[m]-mt[m-1];if(d<wd){wd=d;worst=m}}
  const br=brand(id);return {region:reg,q3,bestCat,worstMonth:MONTHS[worst],brandName:br.name,brandColor:br.color};
 }
 const FOLD={region:'region'};
 // Part A: choose perChapter questions per chapter, deterministic from the id so the admin can rebuild the paper.
 function paper(id){
  const r=mulberry(seedNum('paper:'+id)),by={};
  window.EXAM_BANK.forEach(q=>(by[q[1]]=by[q[1]]||[]).push(q));
  const out=[];Object.keys(by).map(Number).sort((a,b)=>a-b).forEach(ch=>{
   const a=by[ch].slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
   out.push(...a.slice(0,C.perChapter))});
  for(let i=out.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[out[i],out[j]]=[out[j],out[i]]}
  return out;
 }
 function scoreA(id,answers){ // answers: original option index per question in paper order, -1 = skipped
  const p=paper(id),per={};let ok=0;
  p.forEach((q,i)=>{const c=per[q[1]]=per[q[1]]||{ok:0,n:0};c.n++;if(answers[i]===0){c.ok++;ok++}});
  return {ok,n:p.length,pct:Math.round(ok/p.length*100),per};
 }
 function h(s){return h53(String(s)).slice(0,10)}
 function hexes(t){return new Set((t.match(/#[0-9a-fA-F]{6}\b/g)||[]).map(x=>x.toLowerCase()))}
 // Heuristic structure check, runs in the examinee's browser and again in the admin page on the same files.
 function analyze(files,id){
  const br=brand(id),svg=logoSvg(id),b64=btoa(svg).slice(0,100),uri=encodeURIComponent(svg).slice(0,100);
  const docs=files.filter(f=>/\.html?$/i.test(f.name)),use=docs.length?docs:files;
  const hasLogo=t=>t.includes(br.sigD)||t.includes(b64)||t.includes(uri)||t.includes('logo-'+id+'.svg');
  const logo=use.length>0&&use.every(f=>hasLogo(f.text));
  let pages=use.length,nav=false;
  if(use.length>=2){
   const names=use.map(f=>f.name.split(/[\\/]/).pop());
   nav=use.every((f,i)=>names.some((n,j)=>j!==i&&f.text.includes(n)));
  }else if(use.length===1){
   const t=use[0].text,anch=new Set((t.match(/href=["']#([^"'\s]+)["']/g)||[]).map(x=>x.slice(7,-1))),
     ids=[...anch].filter(a=>a&&t.includes('id="'+a+'"')||t.includes("id='"+a+"'")),
     dv=new Set((t.match(/data-(?:page|view|tab|target)=["']([^"']+)["']/g)||[])),
     tp=(t.match(/role=["']tabpanel["']/g)||[]).length;
   pages=Math.max(ids.length,dv.size,tp,/useState|setPage|setTab|setView/.test(t)&&/(page|tab|view)/i.test(t)?2:0);
   nav=ids.length>=2||dv.size>=2||/role=["']tab["']/.test(t)||(/onClick=\{[^}]*(setPage|setTab|setView|setActive)/.test(t));
  }
  let cons=false;
  const col=br.color.toLowerCase();
  if(use.length>=2){
   const hs=use.map(f=>hexes(f.text)),inter=[...hs[0]].filter(x=>hs.every(s=>s.has(x))).length,uni=new Set(hs.flatMap(s=>[...s])).size||1;
   const ff=use.map(f=>((f.text.match(/font-family:\s*([^;}{]+)/i)||[])[1]||'').split(',')[0].trim().toLowerCase());
   const sheets=use.map(f=>(f.text.match(/<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi)||[]).join('|'));
   const sharedSheet=sheets[0]&&sheets.every(x=>x===sheets[0]);
   cons=use.every(f=>f.text.toLowerCase().includes(col))&&(sharedSheet||inter/uni>=0.6)&&ff.every(x=>x===ff[0]);
  }else if(use.length===1){cons=use[0].text.toLowerCase().includes(col)&&pages>=2}
  return {n:use.length,logo,pages,nav,cons,hs:use.map(f=>h(f.text))};
 }
 function scoreB(id,b){
  const ex=checks(id,dataset(id)),res=[],v=b.v||[];
  res.push(Math.round(+v[0])===ex.q3);
  res.push(v[1]===ex.bestCat);
  res.push(v[2]===ex.worstMonth);
  res.push(String(v[3]||'').trim().toLowerCase()===ex.brandName.toLowerCase());
  res.push(String(v[4]||'').trim().toLowerCase().replace(/^#?/,'#')===ex.brandColor.toLowerCase());
  const a=(b.f&&b.f.a)||{};
  res.push(!!a.logo);res.push(!!(a.pages>=2&&a.nav));res.push(!!a.cons);
  const ok=res.filter(Boolean).length;
  return {res,ok,total:8,pct:Math.round(ok/8*100),expected:ex};
 }

 // Part C: agent-building scenarios. Tools are auto-checked; the free text is for human review.
 const TOOLS=['Read','Grep','Glob','Edit','Write','Bash','WebFetch'];
 const SCEN=[
  {id:'docs',title:'docs-auditor: בודק תיעוד',brief:'צוות הפיתוח רוצה סוכן שעובר על ה-README והמדריכים של הפרויקט ומחזיר רשימה של פקודות והוראות שהתיישנו. הוא לעולם לא משנה קבצים.',allow:['Read','Grep','Glob'],deny:['Edit','Write','Bash','WebFetch']},
  {id:'pr',title:'pr-reviewer: סוקר שינויים לפני merge',brief:'רוצים סוכן שסוקר את השינויים לפני merge: מוצא באגים, בעיות אבטחה וחוסר בבדיקות, ומחזיר סיכום קצר עם חומרה לכל ממצא. הוא עובד בקונטקסט נקי ומחזיר לשיחה רק את התוצאה.',allow:['Read','Grep','Glob','Bash'],deny:['Edit','Write','WebFetch']},
  {id:'log',title:'log-triager: מיון לוגים',brief:'יש קבצי לוג של מאות מגה. רוצים סוכן שסורק אותם ומחזיר חמש שורות: מה נכשל, מתי, ומה ההמלצה הראשונה. הוא לא אמור לגעת בקבצים או לצאת לאינטרנט.',allow:['Read','Grep','Glob'],deny:['Edit','Write','WebFetch']}
 ];
 const CQ=[
  {q:'איך תכתבו את התיאור (description) כך שקלוד יפעיל את הסוכן בזמן הנכון?',r:'תיאור שמפרט מתי להפעיל (טריגר) ולא רק שם כללי',kw:['מתי','כאשר','כש','טריגר','description','תיאור']},
  {q:'אילו הוראות תכתבו לסוכן? (תפקיד, קלט, פורמט פלט)',r:'תפקיד ממוקד, מה הוא מקבל, ופורמט פלט ברור וקצר',kw:['תפקיד','פורמט','פלט','קלט','הוראות','שורות']},
  {q:'אילו כלים תאפשרו ולמה, ואילו תחסמו?',r:'הגבלת כלים כשכבת הרשאות אמיתית (least privilege), עם נימוק',kw:['Read','Grep','tools','כלים','הרשאות','חסום','Edit']},
  {q:'איפה תשמרו אותו, ואיך הוא יפעל מול הקונטקסט של השיחה הראשית?',r:'.claude/agents/ בפרויקט (משותף בגיט) או ~/.claude/agents/; קונטקסט נקי משלו, מחזיר רק תוצאה',kw:['.claude/agents','agents','גיט','קונטקסט','נקי','סיכום','תוצאה']},
  {q:'איך תבדקו שהוא עובד ושלא חורג מהגבולות?',r:'ניסוי על דוגמה אמיתית, בדיקה שלא נערכו קבצים, כוונון התיאור, וקריאת קובץ הסוכן לפני שימוש',kw:['בדיק','ניסוי','דוגמה','כוונ','לקרוא','קראתי','git']}
 ];
 function scenario(id){return SCEN[seedNum('c:'+id)%SCEN.length]}
 function scoreC(id,c){
  const sc=scenario(id),t=(c&&c.tools)||[],ok=sc.allow.every(x=>t.includes(x))&&t.every(x=>sc.allow.includes(x));
  return {sc,toolsOk:ok};
 }
 function level(a,b){const t=Math.round(a*C.weightA+b*C.weightB);return {total:t,level:t>=C.advancedMark?'מתקדם':t>=C.passMark?'בינוני':'מתחיל',pass:t>=C.passMark}}
 function h53(s){let h1=0xdeadbeef,h2=0x41c6ce57;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}h1=Math.imul(h1^h1>>>16,2246822507)^Math.imul(h2^h2>>>13,3266489909);h2=Math.imul(h2^h2>>>16,2246822507)^Math.imul(h1^h1>>>13,3266489909);return(4294967296*(2097151&h2)+(h1>>>0)).toString(36)}
 function b64u(s){return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
 function unb64u(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return decodeURIComponent(escape(atob(s)))}
 // Code format: EX1.<payload>.<check>. The check catches paste damage and casual edits; it is not a signature.
 function encode(o){const p=b64u(JSON.stringify(o));return 'EX1.'+p+'.'+h53('x1'+p).slice(0,8)}
 function decode(code){
  const m=String(code).trim().replace(/\s+/g,'').match(/^EX1\.([A-Za-z0-9_-]+)\.([a-z0-9]+)$/);
  if(!m)return {error:'פורמט לא מוכר'};
  const checkOk=h53('x1'+m[1]).slice(0,8)===m[2];
  try{return {data:JSON.parse(unb64u(m[1])),checkOk}}catch(e){return {error:'הקוד פגום'}}
 }
 window.ExamCore={TOOLS,SCEN,CQ,scenario,scoreC,brand,logoSvg,analyze,h,REGIONS,CATS,MONTHS,dataset,csv,checks,paper,scoreA,scoreB,level,encode,decode,mulberry,seedNum};
})();
