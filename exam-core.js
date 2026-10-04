/* Shared by exam.html and exam-admin.html. No network, no storage of personal data. */
window.EXAM_CONFIG={
 version:3,
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
  const tr=rows.reduce((a,x)=>a+x.revenue,0),tc=rows.reduce((a,x)=>a+x.cost,0),margin=Math.round((tr-tc)/tr*1000)/10;
  const byReg={};rows.forEach(x=>byReg[x.region]=(byReg[x.region]||0)+x.revenue);const topRegion=REGIONS.slice().sort((a,b)=>byReg[b]-byReg[a])[0];
  const br=brand(id);return {region:reg,q3,bestCat,worstMonth:MONTHS[worst],margin,topRegion,brandName:br.name,brandColor:br.color};
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
 // Structure check for a Power BI submission. Runs in the examinee's browser and again in the admin page on the same files.
 // files: [{name,text}] (theme JSON, optionally PBIR report files). shots: hashes of the screenshots.
 function analyze(files,id){
  const br=brand(id),col=br.color.toLowerCase();
  let th=false,thFont='',thName='';
  for(const f of files){let j;try{j=JSON.parse(f.text.replace(/^\ufeff/,''))}catch(e){continue}
   if(j&&Array.isArray(j.dataColors)){thName=String(j.name||'');thFont=((f.text.match(/"fontFace"\s*:\s*"([^"]+)"/)||[])[1]||'');
    if(String(j.dataColors[0]).toLowerCase()===col)th=true;break}}
  const pb=files.filter(f=>/(^|[\\/])(page|pages|report|visual)\.json$/i.test(f.name)||/pageNavigator|PageNavigation/.test(f.text));
  let pg=0,nv=false,lg=false;
  if(pb.length){
   const pf=pb.filter(f=>/(^|[\\/])page\.json$/i.test(f.name)).length;
   let po=0;pb.forEach(f=>{if(/pages\.json$/i.test(f.name)){try{po=Math.max(po,(JSON.parse(f.text).pageOrder||[]).length)}catch(e){}}});
   pg=Math.max(pf,po);
   nv=pb.some(f=>/pageNavigator|PageNavigation/.test(f.text));
   lg=pb.some(f=>/"visualType"\s*:\s*"image"/.test(f.text)||/logo/i.test(f.text));
  }
  return {n:files.length,th,thFont,thName,pbir:pb.length>0,pg,nv,lg,hs:files.map(f=>h(f.text))};
 }
 function scoreB(id,b){
  const ex=checks(id,dataset(id)),res=[],v=b.v||[];
  res.push(Math.round(+v[0])===ex.q3);
  res.push(v[1]===ex.bestCat);
  res.push(v[2]===ex.worstMonth);
  res.push(Math.abs(parseFloat(String(v[3]).replace(',','.').replace('%',''))-ex.margin)<=0.15);
  res.push(v[4]===ex.topRegion);
  const a=(b.f&&b.f.a)||{};
  res.push(!!a.th);
  const ok=res.filter(Boolean).length;
  return {res,ok,total:6,pct:Math.round(ok/6*100),expected:ex};
 }

 // Part C: agent-building scenarios. Tools are auto-checked; the free text is for human review.
 const TOOLS=['Read','Grep','Glob','Edit','Write','Bash','WebFetch'];
 const SCEN=[
  {id:'design',title:'design-reviewer: בודק עיצוב ואחידות',brief:'צוות השיווק בונה אתר ממספר עמודי HTML ו-CSS. רוצים סוכן שעובר על העמודים ומחזיר רשימה של סטיות מהעיצוב: צבעים, פונטים ומרווחים שלא תואמים למדריך המותג. הוא רק מדווח ולעולם לא משנה קבצים.',allow:['Read','Grep','Glob'],deny:['Edit','Write','Bash','WebFetch']},
  {id:'landing',title:'landing-builder: בונה דפי נחיתה',brief:'רוצים סוכן שמקבל בריף קצר (מוצר, קהל, הצעה) ובונה דף נחיתה: קובץ HTML וקובץ CSS בתיקיית האתר, בהתאם לצבעים ולפונט שכבר קיימים באתר. הוא לא מריץ פקודות ולא יוצא לאינטרנט.',allow:['Read','Glob','Write','Edit'],deny:['Bash','WebFetch','Grep']},
  {id:'a11y',title:'copy-and-a11y-checker: בודק טקסט ונגישות',brief:'לפני עלייה לאוויר רוצים סוכן שעובר על עמודי האתר ומחזיר רשימה קצרה: שגיאות כתיב וניסוח, תמונות בלי טקסט חלופי, ותקלות בסדר הכותרות. הוא רק מדווח ולא נוגע בקבצים.',allow:['Read','Grep','Glob'],deny:['Edit','Write','Bash','WebFetch']}
 ];
 const CQ=[
  {q:'איך תכתבו את התיאור (description) כך שקלוד יפעיל את הסוכן בזמן הנכון?',r:'תיאור שמפרט מתי להפעיל (טריגר) ולא רק שם כללי',kw:['מתי','כאשר','כש','טריגר','description','תיאור']},
  {q:'אילו הוראות תכתבו לסוכן? (תפקיד, קלט, פורמט פלט)',r:'תפקיד ממוקד, מה הוא מקבל, ופורמט פלט ברור וקצר',kw:['תפקיד','פורמט','פלט','קלט','הוראות','שורות']},
  {q:'אילו כלים תאפשרו ולמה, ואילו תחסמו?',r:'הגבלת כלים כשכבת הרשאות אמיתית (least privilege), עם נימוק',kw:['Read','Grep','tools','כלים','הרשאות','חסום','Edit']},
  {q:'איפה תשמרו אותו, ואיך הוא יפעל מול הקונטקסט של השיחה הראשית?',r:'.claude/agents/ בפרויקט (משותף לצוות) או ~/.claude/agents/ (אישי); קונטקסט נקי משלו, מחזיר רק תוצאה',kw:['.claude/agents','agents','צוות','קונטקסט','נקי','סיכום','תוצאה']},
  {q:'איך תבדקו שהוא עובד ושלא חורג מהגבולות?',r:'ניסוי על דוגמה אמיתית (למשל עמוד אחד), בדיקה שלא נערכו קבצים, כוונון התיאור, וקריאת קובץ הסוכן לפני שימוש',kw:['בדיק','ניסוי','דוגמה','כוונ','לקרוא','קראתי']}
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
