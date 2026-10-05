(()=>{
 const E=window.ExamCore,C=window.EXAM_CONFIG,KEY='claude-exam-v5';
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
 const A=window.EXAM_A,byId=l=>Object.fromEntries(l.map(x=>[x.id,x]));
 function renderA(){
  const P=E.paperA(S.id),d=S.da||(S.da={c:{},k:{},kr:{},w:{}});
  const mk=(host,ids,list,fn)=>{const box=$(host);box.innerHTML='';ids.forEach((id,n)=>box.append(fn(byId(list)[id],n)))};
  const sel=(opts,cur,on)=>{const s=document.createElement('select');s.required=true;if(opts[0].startsWith('/'))s.dir='ltr';s.innerHTML='<option value="">בחרו</option>'+opts.map((o,i)=>'<option value="'+i+'">'+o.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</option>').join('');if(cur!=null)s.value=String(cur);s.onchange=()=>on(s.value===''?null:+s.value);return s};
  const ta=(max,rows,cur,on)=>{const t=document.createElement('textarea');t.maxLength=max;t.rows=rows;t.value=cur||'';t.oninput=()=>on(t.value);return t};
  mk('a-cmds',P.cmds,A.cmds,(q,n)=>{const l=document.createElement('label');l.className='qa';l.dataset.k='c:'+q.id;l.append((n+1)+'. '+q.q);l.append(sel(A.cmdOpts,d.c[q.id],v=>{d.c[q.id]=v;save()}));return l});
  mk('a-tools',P.tools,A.tools,(q,n)=>{const l=document.createElement('label');l.className='qa';l.dataset.k='k:'+q.id;l.append((n+1)+'. '+q.q);l.append(sel(A.toolOpts,d.k[q.id],v=>{d.k[q.id]=v;save()}));const w=ta(140,2,d.kr[q.id],v=>{d.kr[q.id]=v;save()});w.className='why';w.placeholder='למה? משפט אחד';l.append(w);return l});
  mk('a-writes',P.writes,A.writes,(q,n)=>{const l=document.createElement('label');l.className='qa';l.dataset.k='w:'+q.id;l.append((n+1)+'. '+q.q);l.append(ta(320,5,d.w[q.id],v=>{d.w[q.id]=v;save()}));return l});
 }
 function finishA(){
  const P=E.paperA(S.id),d=S.da||{c:{},k:{},kr:{},w:{}};
  const miss=[];P.cmds.forEach(i=>{if(d.c[i]==null)miss.push('c:'+i)});P.tools.forEach(i=>{if(d.k[i]==null)miss.push('k:'+i)});
  document.querySelectorAll('.qa').forEach(x=>x.classList.toggle('bad',miss.includes(x.dataset.k)));
  if(miss.length){const f=document.querySelector('.qa.bad');f.scrollIntoView({block:'center'});alert('נשארו '+miss.length+' בחירות ריקות. תשובות הבחירה חובה; בשאלות הכתובות אפשר להשאיר ריק, וזה נחשב אפס.');return}
  const emptyW=P.writes.filter(i=>!(d.w[i]||'').trim()).length;
  if(emptyW&&!confirm(emptyW+' שאלות כתובות ריקות ויקבלו אפס. להמשיך?'))return;
  S.a={ci:P.cmds.map(i=>d.c[i]),ki:P.tools.map(i=>d.k[i]),kr:P.tools.map(i=>(d.kr[i]||'').trim().slice(0,140)),w:P.writes.map(i=>(d.w[i]||'').trim().slice(0,320)),t:Math.round((Date.now()-S.tA0)/1000)};
  S.tAsec=S.a.t;S.phase='bintro';save();show('s-bintro');
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
 // Part C focus guard: counts leaving the screen. Not proof of consulting an AI tool; it only flags it.
 let awayAt=0;
 function onAway(){if(!S||S.phase!=='c'||$('s-c').hidden||awayAt)return;awayAt=Date.now()}
 function onBack(){if(!awayAt)return;const sec=Math.round((Date.now()-awayAt)/1000);awayAt=0;if(!S||S.phase!=='c')return;S.co=(S.co||0)+1;S.cs=(S.cs||0)+sec;save();$('c-warn').hidden=false;$('c-warn-n').textContent=S.co}
 document.addEventListener('visibilitychange',()=>{document.hidden?onAway():onBack()});
 window.addEventListener('blur',onAway);window.addEventListener('focus',onBack);
 function showC(){
  const sc=E.scenario(S.id);show('s-c');tick();$('c-warn').hidden=!(S.co>0);$('c-warn-n').textContent=S.co||0;
  $('c-title').textContent=sc.title;$('c-brief').textContent=sc.brief;
  const q=$('c-qs');q.innerHTML='';
  E.CQ.forEach((x,i)=>{if(i===2)return;const l=document.createElement('label');l.textContent=(i+1)+'. '+x;const t=document.createElement('textarea');t.maxLength=350;t.rows=3;t.required=true;t.dataset.i=i;l.append(t);q.append(l)});
  const l3=document.createElement('label');l3.textContent='3. '+E.CQ[2]+' (הנימוק; את הכלים מסמנים למטה)';const t3=document.createElement('textarea');t3.maxLength=350;t3.rows=3;t3.required=true;t3.dataset.i=2;l3.append(t3);
  q.insertBefore(l3,q.children[2]||null);
  const tb=$('c-tools');tb.innerHTML='';E.TOOLS.forEach(t=>{const l=document.createElement('label');l.innerHTML='<input type="checkbox" value="'+t+'"> '+t;tb.append(l)});
 }
 function finish(){
  const a=[...document.querySelectorAll('#c-qs textarea')].sort((x,y)=>x.dataset.i-y.dataset.i).map(t=>t.value.trim().slice(0,350));
  S.c={s:E.scenario(S.id).id,o:S.co||0,w:S.cs||0,tools:[...document.querySelectorAll('#c-tools input:checked')].map(x=>x.value),a,t:Math.round((Date.now()-S.tC0)/1000)};
  S.phase='done';S.tEnd=Date.now();save();result();
 }
 function result(){
  const id=S.id;
  const payload={v:C.version,id,n:S.name,e:S.email||'',s:new Date(S.tA0).toISOString(),z:new Date(S.tEnd).toISOString(),a:S.a,b:S.b,c:S.c};
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
  const given=($('in-id').value||'').trim().toUpperCase();S={id:/^[A-HJKMNP-Z2-9]{6}$/.test(given)?given:newId(),name:$('in-name').value.trim(),email:$('in-mail').value.trim(),phase:'a',tA0:Date.now()};save();show('s-a');renderA();tick()});
 $('f-a').addEventListener('submit',e=>{e.preventDefault();finishA()});
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
  if(S.phase==='a'){show('s-a');renderA();tick()}
  else if(S.phase==='bintro')show('s-bintro');
  else if(S.phase==='b'){fillSelects();show('s-b');tick();if(proj||shots.length)refreshFind()}
  else if(S.phase==='c')showC();
  else if(S.phase==='done'&&S.c)result();
 }
})();
