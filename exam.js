(()=>{
 const E=window.ExamCore,C=window.EXAM_CONFIG,KEY='claude-exam-v2';
 const $=id=>document.getElementById(id);
 let S=null,files=[];
 const load=()=>{try{return JSON.parse(sessionStorage.getItem(KEY))}catch(e){return null}};
 const save=()=>{try{sessionStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
 const show=n=>{['s-start','s-a','s-bintro','s-b','s-c','s-res'].forEach(i=>$(i).hidden=i!==n);window.scrollTo(0,0)};
 const fmt=s=>{s=Math.max(0,Math.floor(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return(h?h+':':'')+String(m).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
 const newId=()=>{const a='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let o='';crypto.getRandomValues(new Uint8Array(6)).forEach(x=>o+=a[x%a.length]);return o};
 let timer=null;
 const tick=()=>{clearInterval(timer);timer=setInterval(()=>{
  if(S&&S.phase==='a')$('a-time').textContent=fmt((Date.now()-S.tA0)/1000);
  if(S&&S.phase==='b'){const t=(Date.now()-S.tB0)/1000;$('b-time').textContent=fmt(t);$('b-bar').style.width=Math.min(100,t/(C.targetMinutesB*60)*100)+'%'}
 },500)};
 const order=(id,qid)=>{const r=E.mulberry(E.seedNum('o:'+id+qid)),a=[0,1,2,3];for(let i=3;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 function fillStem(el,text){
  el.textContent='';
  text.split('```').forEach((part,i)=>{
   if(i%2){const p=document.createElement('pre');p.textContent=part.replace(/^\n|\n$/g,'');el.append(p)}
   else if(part.trim()){const s=document.createElement('span');s.className='tx';s.textContent=part.replace(/^\n|\n$/g,'');el.append(s)}
  });
 }
 let picked=null;
 function renderQ(){
  const p=E.paper(S.id),i=S.i,q=p[i];
  $('a-count').textContent='שאלה '+(i+1)+' מתוך '+p.length;
  $('a-bar').style.width=(i/p.length*100)+'%';
  fillStem($('a-stem'),q[2]);
  const box=$('a-opts');box.innerHTML='';picked=null;$('a-next').disabled=true;
  $('a-next').textContent=i===p.length-1?'סיום חלק א׳':'הבא';
  order(S.id,q[0]).forEach(oi=>{const b=document.createElement('button');b.type='button';b.className='opt';b.setAttribute('role','radio');b.setAttribute('aria-checked','false');b.textContent=q[3][oi];
   b.onclick=()=>{picked=oi;box.querySelectorAll('.opt').forEach(x=>x.setAttribute('aria-checked','false'));b.setAttribute('aria-checked','true');$('a-next').disabled=false};box.append(b)});
 }
 function answer(v){
  S.r[S.i]=v;S.i++;
  if(S.i>=E.paper(S.id).length){S.tAsec=Math.round((Date.now()-S.tA0)/1000);S.phase='bintro';save();show('s-bintro');return}
  save();renderQ();
 }
 function fillSelects(){
  $('b-v2').innerHTML='<option value="">בחרו</option>'+E.CATS.map(c=>'<option>'+c+'</option>').join('');
  $('b-v3').innerHTML='<option value="">בחרו</option>'+E.MONTHS.slice(1).map(c=>'<option>'+c+'</option>').join('');
  $('b-q1').textContent='מה סך ההכנסות ברבעון 3 (יולי עד ספטמבר) באזור '+E.checks(S.id,E.dataset(S.id)).region+'?';
 }
 function dl(name,type,content){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
 const dlCsv=()=>dl('sales-2025-'+S.id+'.csv','text/csv;charset=utf-8','\ufeff'+E.csv(E.dataset(S.id)));
 const dlLogo=()=>dl('logo-'+S.id+'.svg','image/svg+xml',E.logoSvg(S.id));
 const readFile=f=>new Promise(r=>{const fr=new FileReader();fr.onload=()=>r({name:f.name,text:String(fr.result)});fr.readAsText(f)});
 $('b-files').addEventListener('change',async e=>{
  files=await Promise.all([...e.target.files].slice(0,4).map(readFile));
  const a=E.analyze(files,S.id),box=$('b-find');box.innerHTML='';
  const row=(ok,t)=>{const d=document.createElement('div');d.className=ok?'y':'n';d.textContent=(ok?'✓ ':'✗ ')+t;box.append(d)};
  row(a.logo,'הלוגו שהורד מופיע בכל עמוד');row(a.pages>=2,'זוהו לפחות שני עמודים (זוהו: '+a.pages+')');row(a.nav,'זוהה ניווט בין העמודים');row(a.cons,'מראה אחיד: צבע המותג, פונט וגיליון סגנונות/צבעים משותפים');
  const n=document.createElement('div');n.className='muted';n.textContent='זו בדיקה ראשונית וגסה שרצה בדפדפן. אם משהו לא זוהה אבל הוא קיים, חלק ב׳ עדיין נשמר והמנהל יבדוק את הקבצים בעצמו.';box.append(n);
  S.fa={n:a.n,logo:a.logo,pages:a.pages,nav:a.nav,cons:a.cons,hs:a.hs};save();
 });
 function finishB(){
  const g=id=>$(id).value.trim();
  S.b={k:S.track,t:Math.round((Date.now()-S.tB0)/1000),v:[g('b-v1').replace(/[^\d]/g,''),$('b-v2').value,$('b-v3').value,g('b-v4'),g('b-v5')],note:g('b-note').slice(0,300),f:{a:S.fa||{n:0,logo:false,pages:0,nav:false,cons:false,hs:[]}}};
  S.f=S.b.f;S.phase='c';S.tC0=Date.now();save();showC();
 }
 function showC(){
  const sc=E.scenario(S.id);show('s-c');tick();
  $('c-title').textContent=sc.title;$('c-brief').textContent=sc.brief;
  const q=$('c-qs');q.innerHTML='';
  E.CQ.forEach((x,i)=>{if(i===2)return;const l=document.createElement('label');l.textContent=(i+1)+'. '+x.q;const t=document.createElement('textarea');t.maxLength=350;t.rows=3;t.required=true;t.dataset.i=i;l.append(t);q.append(l)});
  const l3=document.createElement('label');l3.textContent='3. '+E.CQ[2].q+' (הנימוק; את הכלים מסמנים למטה)';const t3=document.createElement('textarea');t3.maxLength=350;t3.rows=3;t3.required=true;t3.dataset.i=2;l3.append(t3);
  q.insertBefore(l3,q.children[2]||null);
  const tb=$('c-tools');tb.innerHTML='';E.TOOLS.forEach(t=>{const l=document.createElement('label');l.innerHTML='<input type="checkbox" value="'+t+'"> '+t;tb.append(l)});
 }
 function finish(){
  const a=[...document.querySelectorAll('#c-qs textarea')].sort((x,y)=>x.dataset.i-y.dataset.i).map(t=>t.value.trim().slice(0,350));
  S.c={s:E.SCEN.indexOf(E.scenario(S.id)),tools:[...document.querySelectorAll('#c-tools input:checked')].map(x=>x.value),a,t:Math.round((Date.now()-S.tC0)/1000)};
  S.phase='done';S.tEnd=Date.now();save();result();
 }
 function result(){
  const id=S.id,sa=E.scoreA(id,S.r),sb=E.scoreB(id,S.b),sc=E.scoreC(id,S.c),lv=E.level(sa.pct,sb.pct);
  const payload={v:C.version,id,n:S.name,e:S.email||'',s:new Date(S.tA0).toISOString(),z:new Date(S.tEnd).toISOString(),a:{r:S.r,t:S.tAsec},b:S.b,c:S.c};
  const code=E.encode(payload);
  show('s-res');
  $('r-pill').textContent=lv.pass?'עברתם חלקים א׳ ו-ב׳':'עוד לא עברתם חלקים א׳ ו-ב׳';
  $('r-title').textContent='רמה: '+lv.level;
  $('r-total').textContent=lv.total;$('r-a').textContent=sa.pct;$('r-b').textContent=sb.ok+'/8';$('r-tb').textContent=fmt(S.b.t);$('r-c').textContent=sc.toolsOk?'כלים ✓':'כלים ✗';
  $('r-code').value=code;
  $('r-sent').textContent='קוד אישי: '+id+'. הציון המשוקלל הוא 60% חלק א׳ ו-40% חלק ב׳. התשובות החופשיות של חלק ג׳ נבדקות על ידי מנהל המבחן. ההצלחה בחלק ב׳ מחושבת מחדש אצלו, מלבד בדיקות הקבצים שהוא מריץ שוב על הקבצים אם יבקש אותם.';
  const ch=$('r-chapters');ch.innerHTML='';
  Object.keys(sa.per).map(Number).sort((a,b)=>a-b).forEach(k=>{const o=sa.per[k],pc=o.ok/o.n*100;const d=document.createElement('div');d.className='crow';
   d.innerHTML='<span class="t"></span><span class="m"><i class="'+(pc<50?'lo':'')+'" style="width:'+pc+'%"></i></span><span class="n">'+o.ok+'/'+o.n+'</span>';d.querySelector('.t').textContent='פרק '+k+': '+window.EXAM_CHAPTERS[k];ch.append(d)});
  const bc=$('r-bc');bc.innerHTML='';
  const names=['הכנסות רבעון 3','קטגוריה עם הרווח הגולמי הגבוה','החודש עם הירידה החדה','שם החברה בלוגו','צבע המותג','לוגו בכל עמוד (בדיקה אוטומטית)','שני עמודים וניווט (בדיקה אוטומטית)','מראה אחיד (בדיקה אוטומטית)'];
  sb.res.forEach((ok,i)=>{const d=document.createElement('div');d.className='rv';const x=document.createElement('span');x.className=ok?'ok':'bad';x.textContent=(ok?'✓ ':'✗ ')+names[i];d.append(x);bc.append(d)});
  const dc=document.createElement('div');dc.className='rv';dc.textContent='חלק ג׳: '+sc.sc.title+'. בחירת הכלים '+(sc.toolsOk?'מתאימה':'לא מתאימה')+' (הכלים המתאימים: '+sc.sc.allow.join(', ')+'). שאר התשובות נבדקות על ידי מנהל המבחן.';bc.append(dc);
  const rv=$('r-review');rv.innerHTML='';const p=E.paper(id);let any=false;
  p.forEach((q,i)=>{if(S.r[i]===0)return;any=true;const d=document.createElement('div');d.className='rv';
   const b=document.createElement('b');fillStem(b,q[2]);const g=document.createElement('div');g.className='ok';g.textContent='התשובה הנכונה: '+q[3][0]+(q[4]?' - '+q[4]:'');
   const a=document.createElement('a');a.href='index.html#ch'+String(q[1]).padStart(2,'0');a.textContent='חזרה לפרק '+q[1];d.append(b,g,a);rv.append(d)});
  if(!any)rv.textContent='ענו נכון על הכל. אין מה לחזור עליו.';
  submitResult(payload,code);
 }
 function submitResult(payload,code){if(!C.resultsEndpoint)return;fetch(C.resultsEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})}).catch(()=>{})}
 $('f-start').addEventListener('submit',e=>{e.preventDefault();
  S={id:newId(),name:$('in-name').value.trim(),email:$('in-mail').value.trim(),phase:'a',i:0,r:[],tA0:Date.now()};save();show('s-a');renderQ();tick()});
 $('a-next').onclick=()=>{if(picked!==null)answer(picked)};
 $('a-skip').onclick=()=>answer(-1);
 $('b-start').onclick=()=>{S.track=(document.querySelector('input[name=track]:checked')||{}).value||'chat';S.phase='b';S.tB0=Date.now();save();fillSelects();dlCsv();setTimeout(dlLogo,500);show('s-b');tick()};
 $('b-dl').onclick=dlCsv;$('b-dl2').onclick=dlLogo;
 $('f-b').addEventListener('submit',e=>{e.preventDefault();finishB()});
 $('f-c').addEventListener('submit',e=>{e.preventDefault();finish()});
 $('r-copy').onclick=async()=>{const t=$('r-code').value;try{await navigator.clipboard.writeText(t)}catch(e){$('r-code').select();document.execCommand('copy')}$('r-copy').textContent='הועתק';setTimeout(()=>$('r-copy').textContent='העתקת הקוד',2000)};
 $('r-file').onclick=()=>dl('exam-result-'+S.id+'.txt','text/plain',$('r-code').value);
 S=load();
 if(S){
  if(S.phase==='a'){show('s-a');renderQ();tick()}
  else if(S.phase==='bintro')show('s-bintro');
  else if(S.phase==='b'){fillSelects();show('s-b');tick()}
  else if(S.phase==='c')showC();
  else if(S.phase==='done'&&S.c)result();
 }
})();
