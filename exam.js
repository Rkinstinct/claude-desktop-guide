(()=>{
 const E=window.ExamCore,C=window.EXAM_CONFIG,KEY='claude-exam-v4';
 const $=id=>document.getElementById(id);
 let S=null,proj=null,shots=[];
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
  $('b-v5').innerHTML='<option value="">בחרו</option>'+E.REGIONS.map(c=>'<option>'+c+'</option>').join('');
  $('b-v3').innerHTML='<option value="">בחרו</option>'+E.MONTHS.slice(1).map(c=>'<option>'+c+'</option>').join('');
  const sp=E.spec(S.id);$('b-q1').textContent='מה סך ההכנסות ברבעון 3 (יולי עד ספטמבר) באזור '+sp.region+'?';$('b-q6').textContent='מה ההכנסות המצטברות מתחילת השנה (ינואר) ועד סוף חודש '+E.MONTHS[sp.ytdMonth-1]+', באזור '+sp.ytdRegion+'? (YTD)';
 }
 function dl(name,type,content){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
 const dlCsv=()=>dl('sales-2025-'+S.id+'.csv','text/csv;charset=utf-8','\ufeff'+E.csv(E.dataset(S.id)));
 const dlLogo=()=>dl('logo-'+S.id+'.svg','image/svg+xml',E.logoSvg(S.id));
 const dlPng=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=960;c.height=288;const x=c.getContext('2d');x.drawImage(im,0,0,960,288);c.toBlob(bl=>{const a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download='logo-'+S.id+'.png';document.body.append(a);a.click();a.remove()},'image/png')};im.src='data:image/svg+xml;base64,'+btoa(E.logoSvg(S.id))};
 const hashBuf=async f=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',await f.arrayBuffer()))].map(x=>x.toString(16).padStart(2,'0')).join('').slice(0,16);
 const kb=n=>n>1048576?(n/1048576).toFixed(1)+'MB':Math.round(n/1024)+'KB';
 function refreshFind(){
  const box=$('b-find');box.innerHTML='';
  const row=(ok,t)=>{const d=document.createElement('div');d.className=ok?'y':'n';d.textContent=(ok?'✓ ':'✗ ')+t;box.append(d)};
  row(!!proj,proj?'קובץ פרויקט: '+proj.n+' ('+kb(proj.s)+', חתימה '+proj.h+')':'עוד לא נבחר קובץ פרויקט');
  row(shots.length>=2&&new Set(shots).size===shots.length,'צילומי מסך: '+shots.length+' (נדרשים לפחות שניים שונים)');
  const n=document.createElement('div');n.className='muted';n.textContent='כאן מחושבת רק חתימה של הקבצים, כדי שאי אפשר יהיה להחליף אותם אחרי ההגשה. מבנה הדוח נבדק אצל מנהל המבחן, מהקובץ שתשלחו לו.';box.append(n);
  S.fa={z:proj,sh:shots.slice()};save();
 }
 $('b-proj').addEventListener('change',async e=>{const f=e.target.files[0];proj=f?{n:f.name.slice(0,80),s:f.size,h:await hashBuf(f)}:null;refreshFind()});
 $('b-shots').addEventListener('change',async e=>{shots=await Promise.all([...e.target.files].slice(0,6).map(hashBuf));refreshFind()});
 function finishB(){
  const g=id=>$(id).value.trim();
  if(!proj||shots.length<2||new Set(shots).size<shots.length){refreshFind();$('b-find').scrollIntoView({block:'center'});return}
  S.b={k:S.track,t:Math.round((Date.now()-S.tB0)/1000),v:[g('b-v1').replace(/[^\d]/g,''),$('b-v2').value,$('b-v3').value,g('b-v4'),$('b-v5').value,g('b-v6').replace(/[^\d]/g,'')],note:g('b-note').slice(0,300),z:proj,sh:shots.slice()};
  S.phase='c';S.tC0=Date.now();save();showC();
 }
 function showC(){
  const sc=E.scenario(S.id);show('s-c');tick();
  $('c-title').textContent=sc.title;$('c-brief').textContent=sc.brief;
  const q=$('c-qs');q.innerHTML='';
  E.CQ.forEach((x,i)=>{if(i===2)return;const l=document.createElement('label');l.textContent=(i+1)+'. '+x;const t=document.createElement('textarea');t.maxLength=350;t.rows=3;t.required=true;t.dataset.i=i;l.append(t);q.append(l)});
  const l3=document.createElement('label');l3.textContent='3. '+E.CQ[2]+' (הנימוק; את הכלים מסמנים למטה)';const t3=document.createElement('textarea');t3.maxLength=350;t3.rows=3;t3.required=true;t3.dataset.i=2;l3.append(t3);
  q.insertBefore(l3,q.children[2]||null);
  const tb=$('c-tools');tb.innerHTML='';E.TOOLS.forEach(t=>{const l=document.createElement('label');l.innerHTML='<input type="checkbox" value="'+t+'"> '+t;tb.append(l)});
 }
 function finish(){
  const a=[...document.querySelectorAll('#c-qs textarea')].sort((x,y)=>x.dataset.i-y.dataset.i).map(t=>t.value.trim().slice(0,350));
  S.c={s:E.scenario(S.id).id,tools:[...document.querySelectorAll('#c-tools input:checked')].map(x=>x.value),a,t:Math.round((Date.now()-S.tC0)/1000)};
  S.phase='done';S.tEnd=Date.now();save();result();
 }
 function result(){
  const id=S.id;
  const payload={v:C.version,id,n:S.name,e:S.email||'',s:new Date(S.tA0).toISOString(),z:new Date(S.tEnd).toISOString(),a:{r:S.r,t:S.tAsec},b:S.b,c:S.c};
  const code=E.encode(payload);
  show('s-res');
  $('r-ta').textContent=fmt(S.tAsec||0);$('r-tb').textContent=fmt(S.b.t);$('r-tc').textContent=fmt(S.c.t||0);
  $('r-code').value=code;
  $('r-sent').textContent='קוד נבחן: '+id+'. הקוד מכיל את התשובות והזמנים שלכם, לא את הציון.';
  const bc=$('r-bc');bc.innerHTML='';
  ['הקוד שלמעלה (העתקה או שמירה כקובץ)','קובץ הפרויקט: '+(S.b.z?S.b.z.n:'')+' (חתימה '+(S.b.z?S.b.z.h:'')+'). חייב להיות אותו קובץ שבחרתם, בלי עריכה אחריה','צילומי המסך של שני העמודים, אותם קבצים שבחרתם ('+(S.b.sh||[]).length+')'].forEach(t=>{const d=document.createElement('div');d.className='rv';d.textContent='• '+t;bc.append(d)});
  submitResult(payload,code);
 }
 function submitResult(payload,code){if(!C.resultsEndpoint)return;fetch(C.resultsEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})}).catch(()=>{})}
 $('f-start').addEventListener('submit',e=>{e.preventDefault();
  const given=($('in-id').value||'').trim().toUpperCase();S={id:/^[A-HJKMNP-Z2-9]{6}$/.test(given)?given:newId(),name:$('in-name').value.trim(),email:$('in-mail').value.trim(),phase:'a',i:0,r:[],tA0:Date.now()};save();show('s-a');renderQ();tick()});
 $('a-next').onclick=()=>{if(picked!==null)answer(picked)};
 $('a-skip').onclick=()=>{if(confirm('דילוג נחשב לתשובה שגויה, ואי אפשר לחזור אליה. לדלג?'))answer(-1)};
 $('env-check').onclick=()=>dl('sample-check.csv','text/csv;charset=utf-8','\ufeffdate,region,category,units,revenue,cost\n2025-01-15,צפון,תוכנה,10,9000,2500\n2025-02-15,מרכז,חומרה,8,11000,7200\n2025-03-15,דרום,שירות,12,8400,3800\n');
 $('b-start').onclick=()=>{S.track=(document.querySelector('input[name=track]:checked')||{}).value||'chat';S.phase='b';S.tB0=Date.now();save();fillSelects();dlCsv();setTimeout(dlLogo,500);show('s-b');tick()};
 $('b-dl').onclick=dlCsv;$('b-dl2').onclick=dlLogo;$('b-dl3').onclick=dlPng;
 $('f-b').addEventListener('submit',e=>{e.preventDefault();finishB()});
 $('f-c').addEventListener('submit',e=>{e.preventDefault();finish()});
 $('r-copy').onclick=async()=>{const t=$('r-code').value;try{await navigator.clipboard.writeText(t)}catch(e){$('r-code').select();document.execCommand('copy')}$('r-copy').textContent='הועתק';setTimeout(()=>$('r-copy').textContent='העתקת הקוד',2000)};
 $('r-file').onclick=()=>dl('exam-result-'+S.id+'.txt','text/plain',$('r-code').value);
 S=load();
 if(S){
  if(S.fa){proj=S.fa.z||null;shots=S.fa.sh||[]}
  if(S.phase==='a'){show('s-a');renderQ();tick()}
  else if(S.phase==='bintro')show('s-bintro');
  else if(S.phase==='b'){fillSelects();show('s-b');tick();if(proj||shots.length)refreshFind()}
  else if(S.phase==='c')showC();
  else if(S.phase==='done'&&S.c)result();
 }
})();
