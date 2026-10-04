/* Shared by exam.html and exam-admin.html. No network, no storage of personal data. */
window.EXAM_CONFIG={
 version:1,
 passMark:70,        // Part A/B composite needed to pass
 advancedMark:85,    // composite at or above this = advanced
 perChapter:2,       // questions drawn from each chapter's pool
 weightA:0.6, weightB:0.4,
 targetMinutesB:45,  // reference time shown to examinees and in the admin table
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
 // The three checks. Region for check 1 depends on the seed so neighbours cannot copy numbers.
 function checks(id,rows){
  const reg=REGIONS[seedNum('r:'+id)%4];
  const q3=rows.filter(x=>x.region===reg&&+x.date.slice(5,7)>=7&&+x.date.slice(5,7)<=9).reduce((a,x)=>a+x.revenue,0);
  const byCat={};rows.forEach(x=>{const o=byCat[x.category]||(byCat[x.category]={r:0,c:0});o.r+=x.revenue;o.c+=x.cost});
  const bestCat=CATS.slice().sort((a,b)=>(byCat[b].r-byCat[b].c)/byCat[b].r-(byCat[a].r-byCat[a].c)/byCat[a].r)[0];
  const mt=Array(12).fill(0);rows.forEach(x=>mt[+x.date.slice(5,7)-1]+=x.revenue);
  let worst=1,wd=Infinity;for(let m=1;m<12;m++){const d=mt[m]-mt[m-1];if(d<wd){wd=d;worst=m}}
  return {region:reg,q3,bestCat,worstMonth:MONTHS[worst]};
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
 function scoreB(id,b){
  const ex=checks(id,dataset(id)),res=[];
  res.push(Math.round(+b.v[0])===ex.q3);
  res.push(b.v[1]===ex.bestCat);
  res.push(b.v[2]===ex.worstMonth);
  return {res,ok:res.filter(Boolean).length,pct:Math.round(res.filter(Boolean).length/3*100),expected:ex};
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
 window.ExamCore={REGIONS,CATS,MONTHS,dataset,csv,checks,paper,scoreA,scoreB,level,encode,decode,mulberry,seedNum};
})();
