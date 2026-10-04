(()=>{
 const E=window.ExamCore,C=window.EXAM_CONFIG,KEY='claude-exam-v1';
 const $=id=>document.getElementById(id);
 let S=null;
 const load=()=>{try{return JSON.parse(sessionStorage.getItem(KEY))}catch(e){return null}};
 const save=()=>{try{sessionStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
 const show=n=>{['s-start','s-a','s-bintro','s-b','s-res'].forEach(i=>$(i).hidden=i!==n);window.scrollTo(0,0)};
 const fmt=s=>{s=Math.max(0,Math.floor(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return(h?h+':':'')+String(m).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
 const newId=()=>{const a='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let o='';const b=crypto.getRandomValues(new Uint8Array(6));b.forEach(x=>o+=a[x%a.length]);return o};
 let timer=null;
 const tick=()=>{clearInterval(timer);timer=setInterval(()=>{
  if(S&&S.phase==='a')$('a-time').textContent=fmt((Date.now()-S.tA0)/1000);
  if(S&&S.phase==='b'){const t=(Date.now()-S.tB0)/1000;$('b-time').textContent=fmt(t);$('b-bar').style.width=Math.min(100,t/(C.targetMinutesB*60)*100)+'%'}
 },500)};
 // option order on screen is shuffled per question, stable across refresh
 const order=(id,qid)=>{const r=E.mulberry(E.seedNum('o:'+id+qid)),a=[0,1,2,3];for(let i=3;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 let picked=null;
 function renderQ(){
  const p=E.paper(S.id),i=S.i,q=p[i];
  $('a-count').textContent='שאלה '+(i+1)+' מתוך '+p.length;
  $('a-bar').style.width=(i/p.length*100)+'%';
  $('a-stem').textContent=q[2];
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
 function download(){
  const blob=new Blob(['\ufeff'+E.csv(E.dataset(S.id))],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='sales-2025-'+S.id+'.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);
 }
 function finish(){
  const bv=[$('b-v1').value.replace(/[^\d]/g,''),$('b-v2').value,$('b-v3').value];
  S.b={k:S.track,t:Math.round((Date.now()-S.tB0)/1000),v:bv,note:$('b-note').value.trim().slice(0,300)};
  S.phase='done';S.tEnd=Date.now();save();result();
 }
 function result(){
  const id=S.id,sa=E.scoreA(id,S.r),sb=E.scoreB(id,S.b),lv=E.level(sa.pct,sb.pct);
  const payload={v:C.version,id,n:S.name,e:S.email||'',s:new Date(S.tA0).toISOString(),z:new Date(S.tEnd).toISOString(),a:{r:S.r,t:S.tAsec},b:S.b};
  const code=E.encode(payload);
  show('s-res');
  $('r-pill').textContent=lv.pass?'עברתם':'עוד לא עברתם';
  $('r-title').textContent='רמה: '+lv.level;
  $('r-total').textContent=lv.total;$('r-a').textContent=sa.pct;$('r-b').textContent=sb.ok+'/3';$('r-tb').textContent=fmt(S.b.t);
  $('r-code').value=code;
  $('r-sent').textContent='קוד אישי: '+id+'. הציונים שמופיעים כאן מחושבים בדפדפן שלכם; מנהל המבחן מחשב אותם מחדש מהקוד.';
  const ch=$('r-chapters');ch.innerHTML='';
  Object.keys(sa.per).map(Number).sort((a,b)=>a-b).forEach(k=>{const o=sa.per[k],pc=o.ok/o.n*100;const d=document.createElement('div');d.className='crow';
   d.innerHTML='<span class="t"></span><span class="m"><i class="'+(pc<50?'lo':'')+'" style="width:'+pc+'%"></i></span><span class="n">'+o.ok+'/'+o.n+'</span>';d.querySelector('.t').textContent='פרק '+k+': '+window.EXAM_CHAPTERS[k];ch.append(d)});
  const rv=$('r-review');rv.innerHTML='';const p=E.paper(id);let any=false;
  p.forEach((q,i)=>{if(S.r[i]===0)return;any=true;const d=document.createElement('div');d.className='rv';
   const b=document.createElement('b');b.textContent=q[2];const g=document.createElement('div');g.className='ok';g.textContent='התשובה הנכונה: '+q[3][0];
   const a=document.createElement('a');a.href='index.html#ch'+String(q[1]).padStart(2,'0');a.textContent='חזרה לפרק '+q[1];d.append(b,g,a);rv.append(d)});
  if(!any)rv.textContent='ענו נכון על הכל. אין מה לחזור עליו.';
  if(sb.ok<3){const d=document.createElement('div');d.className='rv';d.innerHTML='<b>חלק ב׳</b>';const x=document.createElement('div');x.textContent='לא כל התשובות בדשבורד התאימו לנתונים שלכם. כדאי לבדוק מול ה-CSV איך חושב סכום, אחוז רווח וירידה חודשית.';d.append(x);rv.prepend(d)}
  submitResult(payload,code);
 }
 // Hook for a future results store. With resultsEndpoint=null nothing leaves the device.
 function submitResult(payload,code){if(!C.resultsEndpoint)return;fetch(C.resultsEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})}).catch(()=>{})}
 $('f-start').addEventListener('submit',e=>{e.preventDefault();
  S={id:newId(),name:$('in-name').value.trim(),email:$('in-mail').value.trim(),phase:'a',i:0,r:[],tA0:Date.now()};save();show('s-a');renderQ();tick()});
 $('a-next').onclick=()=>{if(picked!==null)answer(picked)};
 $('a-skip').onclick=()=>answer(-1);
 $('b-start').onclick=()=>{S.track=(document.querySelector('input[name=track]:checked')||{}).value||'chat';S.phase='b';S.tB0=Date.now();save();fillSelects();download();show('s-b');tick()};
 $('b-dl').onclick=download;
 $('f-b').addEventListener('submit',e=>{e.preventDefault();finish()});
 $('r-copy').onclick=async()=>{const t=$('r-code').value;try{await navigator.clipboard.writeText(t)}catch(e){$('r-code').select();document.execCommand('copy')}$('r-copy').textContent='הועתק';setTimeout(()=>$('r-copy').textContent='העתקת הקוד',2000)};
 $('r-file').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([$('r-code').value],{type:'text/plain'}));a.download='exam-result-'+S.id+'.txt';document.body.append(a);a.click();a.remove()};
 S=load();
 if(S){
  if(S.phase==='a'){show('s-a');renderQ();tick()}
  else if(S.phase==='bintro')show('s-bintro');
  else if(S.phase==='b'){fillSelects();show('s-b');tick()}
  else if(S.phase==='done'&&S.b)result();
 }
})();
