/* Public exam page code. No answers here: the key, the expected Part B answers and the scoring live only in the private admin file. */
window.EXAM_CONFIG={
 version:5.1,
 passMark:70,        // Part A/B composite needed to pass
 advancedMark:85,    // composite at or above this = advanced
 weightA:0.45, weightB:0.40, weightC:0.15,
 targetMinutesB:60,  // reference time shown to examinees and in the admin table
 // Later: set to a Cloudflare Worker URL and results are also POSTed there (see submitResult in exam.js).
 resultsEndpoint:'https://exam-results-api.ariel-crm.workers.dev',
 scenarioSet:'web' // 'web' (site building and design) or 'bi' (Power BI): which Part C scenarios are drawn
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

 // What the Part B questions ask about. The expected answers are NOT here: they live in the admin file only.
 function spec(id){const r=seedNum('r:'+id)%4;return {region:REGIONS[r],ytdRegion:REGIONS[(r+1+seedNum('y:'+id)%3)%4],ytdMonth:5+seedNum('m:'+id)%6}}
 // Part A: the order of the items is deterministic from the id, so the admin can rebuild what the examinee saw.
 function paperA(id){
  const r=mulberry(seedNum('paperA:'+id)),A=window.EXAM_A;
  const sh=l=>{const a=l.map(x=>x.id);for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  return {cmds:sh(A.cmds),tools:sh(A.tools),writes:sh(A.writes)};
 }

 // Part C: agent-building scenarios (public part: titles, briefs, questions). Tool rules and the rubric are in the admin file.
 const TOOLS=['Read','Grep','Glob','Edit','Write','Bash','WebFetch'];
 const SCEN={
  web:[
   {id:'design',title:'design-reviewer: בודק עיצוב ואחידות',brief:'צוות השיווק בונה אתר ממספר עמודי HTML ו-CSS. רוצים סוכן שעובר על העמודים ומחזיר רשימה של סטיות מהעיצוב: צבעים, פונטים ומרווחים שלא תואמים למדריך המותג. הוא רק מדווח ולעולם לא משנה קבצים.'},
   {id:'landing',title:'landing-builder: בונה דפי נחיתה',brief:'רוצים סוכן שמקבל בריף קצר (מוצר, קהל, הצעה) ובונה דף נחיתה חדש: קובץ HTML וקובץ CSS בתיקיית האתר, בהתאם לצבעים ולפונט שכבר קיימים באתר. הוא לא מריץ פקודות ולא יוצא לאינטרנט.'},
   {id:'fixer',title:'typo-fixer: מתקן שגיאות כתיב',brief:'באתר יש עשרות עמודי HTML קיימים. רוצים סוכן שמתקן בהם שגיאות כתיב וניסוח קטנות, ישירות בקבצים הקיימים. הוא לא יוצר קבצים חדשים, לא מריץ פקודות ולא יוצא לאינטרנט.'}
  ],
  bi:[
   {id:'dax',title:'dax-reviewer: סוקר מדדי DAX',brief:'יש פרויקט Power BI בפורמט PBIP. רוצים סוכן שעובר על קובצי ה-TMDL ומחזיר רשימה של מדדים שלא משתמשים ב-DIVIDE או ששמם לא לפי המוסכמה של הארגון. הוא רק מדווח ולעולם לא משנה קבצים.'},
   {id:'theme',title:'theme-enforcer: מחיל ערכת נושא',brief:'רוצים סוכן שמחיל את ערכת הנושא של הארגון על קובצי ה-PBIR של דוח קיים, ישירות בקבצים הקיימים. הוא לא יוצר קבצים חדשים, לא מריץ פקודות ולא יוצא לאינטרנט.'},
   {id:'doc',title:'model-documenter: מתעד מודל',brief:'רוצים סוכן שסורק את קובצי המודל וכותב קובץ MODEL.md חדש עם הטבלאות, הקשרים והמדדים. הוא לא משנה קבצים קיימים, לא מריץ פקודות ולא יוצא לאינטרנט.'}
  ]};
 const CQ=['איך תכתבו את התיאור (description) כך שקלוד יפעיל את הסוכן בזמן הנכון?','אילו הוראות תכתבו לסוכן? (תפקיד, קלט, פורמט פלט)','אילו כלים תאפשרו ולמה, ואילו תחסמו?','איפה תשמרו אותו, ואיך הוא יפעל מול הקונטקסט של השיחה הראשית?','איך תבדקו שהוא עובד ושלא חורג מהגבולות?'];
 function scenario(id){const s=SCEN[C.scenarioSet]||SCEN.web;return s[seedNum('c:'+id)%s.length]}
 function h(s){return h53(String(s)).slice(0,10)}
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
 window.ExamCore={TOOLS,SCEN,CQ,scenario,spec,brand,logoSvg,h,REGIONS,CATS,MONTHS,dataset,csv,paperA,encode,decode,mulberry,seedNum,h53};
})();
