/* Public code of the Power BI basics exam. No answers here: the key, the expected numbers and the scoring live only in the private admin file. */
window.PBI_CONFIG={version:3,passMark:70,advancedMark:85,perTopic:3,weightA:0.5,weightB:0.35,weightC:0.15,targetMinutesB:15,resultsEndpoint:null};
(function(){
 function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
 function seedNum(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
 const REGIONS=['צפון','מרכז','דרום','ירושלים'],PRODUCTS=['מחשב נייד','מסך','מקלדת','עכבר','אוזניות'],LIST={'מחשב נייד':3400,'מסך':900,'מקלדת':180,'עכבר':90,'אוזניות':260};
 function dataset(id){
  const r=mulberry(seedNum('pbi-exam:'+id)),rows=[];let oid=2001;
  const w=PRODUCTS.map(()=>.6+r()*.8);
  for(let o=0;o<110;o++){
   const day=Math.floor(r()*360),d=new Date(Date.UTC(2025,0,1)+day*864e5),date=d.toISOString().slice(0,10);
   const cust='C'+String(1+Math.floor(r()*38)).padStart(3,'0'),reg=REGIONS[Math.floor(r()*4)],lines=1+Math.floor(r()*3);
   const used=new Set();
   for(let l=0;l<lines;l++){
    let pi=Math.floor(r()*5);while(used.has(pi))pi=(pi+1)%5;used.add(pi);
    const p=PRODUCTS[pi],qty=1+Math.floor(r()*Math.max(2,6*w[pi])),price=Math.round(LIST[p]*(.9+r()*.2));
    rows.push({OrderID:oid,OrderDate:date,CustomerID:cust,Region:reg,Product:p,Quantity:qty,Revenue:qty*price});
   }
   oid++;
  }
  return rows;
 }
 function csv(rows){return 'OrderID,OrderDate,CustomerID,Region,Product,Quantity,Revenue\n'+rows.map(x=>[x.OrderID,x.OrderDate,x.CustomerID,x.Region,x.Product,x.Quantity,x.Revenue].join(',')).join('\n')+'\n'}
 function spec(id){const a=seedNum('p:'+id);return {product:PRODUCTS[a%5]}}
 function paperA(id){
  const r=mulberry(seedNum('paperA:'+id)),by={};
  window.PBI_BANK.forEach(q=>(by[q[1]]=by[q[1]]||[]).push(q));
  const out=[];Object.keys(by).map(Number).sort((a,b)=>a-b).forEach(t=>{
   const a=by[t].slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
   out.push(...a.slice(0,window.PBI_CONFIG.perTopic))});
  for(let i=out.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[out[i],out[j]]=[out[j],out[i]]}
  return out;
 }
 const SCEN=[
  {id:'dax',title:'מדדים בלי טעויות',brief:'בצוות ה-BI יש מודל עם עשרות מדדים שכתבו אנשים שונים. רוצים עוזר AI שעובר על המדדים ומחזיר רשימה של בעיות: חילוק בלי הגנה מחלוקה באפס, שמות לא ברורים ומדדים שחוזרים על עצמם. הוא רק מדווח ולא משנה כלום במודל.'},
  {id:'doc',title:'תיעוד אוטומטי של המודל',brief:'אף אחד לא זוכר מה יש במודל של המכירות: אילו טבלאות, איך הן מחוברות ומה כל מדד מחשב. רוצים עוזר AI שקורא את המודל וכותב מסמך תיעוד חדש בשפה פשוטה. הוא לא משנה את המודל ולא נוגע בנתונים עצמם.'},
  {id:'sum',title:'טיוטת סיכום חודשי למנהל',brief:'כל חודש מישהו כותב למנהל פסקה שמסכמת את דוח המכירות: מה עלה, מה ירד ומה חריג. רוצים עוזר AI שמכין טיוטה מהנתונים של החודש. הוא לא מפרסם ולא שולח כלום, ואדם קורא ומאשר לפני שזה מגיע למנהל.'}
 ];
 function scenario(id){return SCEN[seedNum('c:'+id)%SCEN.length]}
 const CQ=[
  'איך תתארו לעוזר את התפקיד שלו: מה הוא מקבל, מה הוא מחזיר ובאיזה פורמט?',
  'מה מותר לעוזר לעשות ומה אסור לו (לקרוא, לשנות, לשלוח, לגשת לנתונים רגישים), ולמה?',
  'איך תבדקו שהוא עובד נכון לפני שסומכים עליו, ומי מאשר את התוצאה?'];
 function h53(s){let h1=0xdeadbeef,h2=0x41c6ce57;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}h1=Math.imul(h1^h1>>>16,2246822507)^Math.imul(h2^h2>>>13,3266489909);h2=Math.imul(h2^h2>>>16,2246822507)^Math.imul(h1^h1>>>13,3266489909);return (4294967296*(2097151&h2)+(h1>>>0)).toString(36)}
 function b64u(s){return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
 function unb64u(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return decodeURIComponent(escape(atob(s)))}
 function encode(o){const p=b64u(JSON.stringify(o));return 'PB1.'+p+'.'+h53('p1'+p).slice(0,8)}
 function decode(code){
  const m=String(code).trim().match(/^PB1\.([A-Za-z0-9_-]+)\.([a-z0-9]+)$/);if(!m)return {error:'פורמט קוד לא תקין'};
  const checkOk=h53('p1'+m[1]).slice(0,8)===m[2];
  try{return {data:JSON.parse(unb64u(m[1])),checkOk}}catch(e){return {error:'הקוד פגום'}}
 }
 window.PbiCore={REGIONS,PRODUCTS,dataset,csv,spec,paperA,CQ,SCEN,scenario,encode,decode,mulberry,seedNum,h53};
})();
