(()=>{
 const E=window.PbiCore,C=window.PBI_CONFIG,KEY='pbi-exam-v2',T=window.PBI_TOPICS;
 const $=id=>document.getElementById(id);
 let S=null;
 const load=()=>{try{return JSON.parse(sessionStorage.getItem(KEY))}catch(e){return null}};
 const save=()=>{try{sessionStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
 const show=n=>{['s-start','s-a','s-bintro','s-b','s-c','s-res'].forEach(i=>$(i).hidden=i!==n);window.scrollTo(0,0)};
 const fmt=s=>{s=Math.max(0,Math.floor(s));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
 const newId=()=>{const a='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let o='';crypto.getRandomValues(new Uint8Array(6)).forEach(x=>o+=a[x%a.length]);return o};
 let timer=null;
 const tick=()=>{clearInterval(timer);timer=setInterval(()=>{
  if(!S)return;
  if(S.phase==='a')$('a-time').textContent=fmt((Date.now()-S.tA0)/1000);
  if(S.phase==='b'){const t=(Date.now()-S.tB0)/1000;$('b-time').textContent=fmt(t);$('b-bar').style.width=Math.min(100,t/(C.targetMinutesB*60)*100)+'%'}
  if(S.phase==='c'){const t=(Date.now()-S.tC0)/1000;$('c-time').textContent=fmt(t);$('c-bar').style.width=Math.min(100,t/(10*60)*100)+'%'}
 },500)};
 const order=(id,qid)=>{const r=E.mulberry(E.seedNum('o:'+id+qid)),a=[0,1,2,3];for(let i=3;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 let picked=null;
 function renderQ(){
  const p=E.paperA(S.id),i=S.i,q=p[i];
  $('a-count').textContent='שאלה '+(i+1)+' מתוך '+p.length;$('a-bar').style.width=(i/p.length*100)+'%';
  $('a-topic').textContent=T[q[1]];$('a-stem').textContent=q[2];
  const box=$('a-opts');box.innerHTML='';const prev=S.r[i];picked=(prev!==undefined&&prev>=0)?prev:null;$('a-next').disabled=picked===null;$('a-prev').hidden=i===0;
  $('a-next').textContent=i===p.length-1?'סיום חלק א׳':'הבא';
  order(S.id,q[0]).forEach(oi=>{const b=document.createElement('button');b.type='button';b.className='opt';b.setAttribute('role','radio');b.setAttribute('aria-checked',picked===oi?'true':'false');b.textContent=q[3][oi];
   b.onclick=()=>{picked=oi;box.querySelectorAll('.opt').forEach(x=>x.setAttribute('aria-checked','false'));b.setAttribute('aria-checked','true');$('a-next').disabled=false};box.append(b)});
 }
 function answer(v){
  S.r[S.i]=v;S.i++;
  if(S.i>=E.paperA(S.id).length){S.r=Array.from({length:E.paperA(S.id).length},(_,k)=>S.r[k]===undefined?-1:S.r[k]);S.tAsec=Math.round((Date.now()-S.tA0)/1000);S.phase='bintro';save();show('s-bintro');return}
  save();renderQ();
 }
 function dl(name,type,content){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
 const dlCsv=()=>dl('orders-2025-'+S.id+'.csv','text/csv;charset=utf-8','\ufeff'+E.csv(E.dataset(S.id)));
 function fillB(){
  $('b-v2').innerHTML='<option value="">בחרו</option>'+E.REGIONS.map(c=>'<option>'+c+'</option>').join('');
  $('b-q3').textContent='מה סך ההכנסות (Revenue) של המוצר "'+E.spec(S.id).product+'" בשנה כולה?';
 }
 function finishB(){
  const g=id=>$(id).value.trim();
  S.b={t:Math.round((Date.now()-S.tB0)/1000),v:[g('b-v1').replace(/[^\d]/g,''),$('b-v2').value,g('b-v3').replace(/[^\d]/g,''),g('b-v4').replace(/[^\d]/g,'')],note:g('b-note').slice(0,320)};
  S.phase='c';S.tC0=Date.now();save();showC();
 }
 // Part C focus guard: counts leaving the screen. Not proof of consulting an AI tool; it only flags it.
 let away=0,awayAt=0;
 function onAway(){if(!S||S.phase!=='c'||$('s-c').hidden||awayAt)return;awayAt=Date.now()}
 function onBack(){if(!awayAt)return;const sec=Math.round((Date.now()-awayAt)/1000);awayAt=0;if(!S||S.phase!=='c')return;S.co=(S.co||0)+1;S.cs=(S.cs||0)+sec;save();$('c-warn').hidden=false;$('c-warn-n').textContent=S.co}
 document.addEventListener('visibilitychange',()=>{document.hidden?onAway():onBack()});
 window.addEventListener('blur',onAway);window.addEventListener('focus',onBack);
 function showC(){
  show('s-c');tick();$('c-warn').hidden=!(S.co>0);$('c-warn-n').textContent=S.co||0;const sc=E.scenario(S.id);$('c-title').textContent=sc.title;$('c-brief').textContent=sc.brief;const q=$('c-qs');q.innerHTML='';
  E.CQ.forEach((x,i)=>{const l=document.createElement('label');l.textContent=(i+1)+'. '+x;const t=document.createElement('textarea');t.maxLength=320;t.rows=5;t.required=true;t.value=(S.cd&&S.cd[i])||'';t.oninput=()=>{(S.cd=S.cd||[])[i]=t.value;save()};l.append(t);q.append(l)});
 }
 function finish(){
  const a=[...document.querySelectorAll('#c-qs textarea')].map(t=>t.value.trim().slice(0,320));
  S.c={s:E.scenario(S.id).id,o:S.co||0,w:S.cs||0,a,t:Math.round((Date.now()-S.tC0)/1000)};S.phase='done';S.tEnd=Date.now();save();result();
 }
 function result(){
  const payload={v:C.version,id:S.id,n:S.name,e:S.email||'',s:new Date(S.tA0).toISOString(),z:new Date(S.tEnd).toISOString(),a:{r:S.r,t:S.tAsec},b:S.b,c:S.c};
  const code=E.encode(payload);show('s-res');
  $('r-ta').textContent=fmt(S.tAsec||0);$('r-tb').textContent=fmt(S.b.t);$('r-tc').textContent=fmt(S.c.t||0);$('r-code').value=code;
  const showCode=()=>{$('r-card').hidden=false;$('r-sent').textContent='השליחה האוטומטית לא הצליחה. העתיקו את הקוד ושלחו אותו למנהל המבחן.'};
  if(S.sent){$('r-card').hidden=true;$('r-ok').hidden=false;return}
  $('r-ok').hidden=true;$('r-card').hidden=true;$('r-wait').hidden=false;
  fetch(C.resultsEndpoint+'/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({exam:'pbi',code,id:S.id,name:S.name,email:S.email||''})})
   .then(r=>r.ok?r.json():Promise.reject()).then(x=>{if(!x.ok)throw 0;S.sent=true;save();$('r-wait').hidden=true;$('r-ok').hidden=false})
   .catch(()=>{$('r-wait').hidden=true;showCode()});
 }
 $('f-start').addEventListener('submit',e=>{e.preventDefault();
  const given=($('in-id').value||'').trim().toUpperCase();
  S={id:/^[A-HJKMNP-Z2-9]{6}$/.test(given)?given:newId(),name:$('in-name').value.trim(),email:$('in-mail').value.trim(),phase:'a',i:0,r:[],tA0:Date.now()};save();show('s-a');renderQ();tick()});
 $('a-next').onclick=()=>{if(picked!==null)answer(picked)};
 $('a-skip').onclick=()=>{if(S.r[S.i]===undefined)S.r[S.i]=-1;answer(S.r[S.i]);};
 $('a-prev').onclick=()=>{if(S.i>0){S.i--;save();renderQ()}};
 $('b-start').onclick=()=>{S.phase='b';S.tB0=Date.now();save();fillB();dlCsv();show('s-b');tick()};
 $('b-dl').onclick=dlCsv;
 $('f-b').addEventListener('submit',e=>{e.preventDefault();finishB()});
 $('f-c').addEventListener('submit',e=>{e.preventDefault();finish()});
 $('r-copy').onclick=async()=>{const t=$('r-code').value;try{await navigator.clipboard.writeText(t)}catch(e){$('r-code').select();document.execCommand('copy')}$('r-copy').textContent='הועתק';setTimeout(()=>$('r-copy').textContent='העתקת הקוד',2000)};
 $('r-file').onclick=()=>dl('pbi-exam-result-'+S.id+'.txt','text/plain',$('r-code').value);
 S=load();
 if(S){
  if(S.phase==='a'){show('s-a');renderQ();tick()}
  else if(S.phase==='bintro')show('s-bintro');
  else if(S.phase==='b'){fillB();show('s-b');tick()}
  else if(S.phase==='c')showC();
  else if(S.phase==='done'&&S.c)result();
 }
})();
