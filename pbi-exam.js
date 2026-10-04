(()=>{
 const E=window.PbiCore,C=window.PBI_CONFIG,KEY='pbi-exam-v1',T=window.PBI_TOPICS;
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
  const box=$('a-opts');box.innerHTML='';picked=null;$('a-next').disabled=true;
  $('a-next').textContent=i===p.length-1?'סיום חלק א׳':'הבא';
  order(S.id,q[0]).forEach(oi=>{const b=document.createElement('button');b.type='button';b.className='opt';b.setAttribute('role','radio');b.setAttribute('aria-checked','false');b.textContent=q[3][oi];
   b.onclick=()=>{picked=oi;box.querySelectorAll('.opt').forEach(x=>x.setAttribute('aria-checked','false'));b.setAttribute('aria-checked','true');$('a-next').disabled=false};box.append(b)});
 }
 function answer(v){
  S.r[S.i]=v;S.i++;
  if(S.i>=E.paperA(S.id).length){S.tAsec=Math.round((Date.now()-S.tA0)/1000);S.phase='bintro';save();show('s-bintro');return}
  save();renderQ();
 }
 function dl(name,type,content){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
 const dlCsv=()=>dl('orders-2025-'+S.id+'.csv','text/csv;charset=utf-8','\ufeff'+E.csv(E.dataset(S.id)));
 function fillB(){
  $('b-v4').innerHTML='<option value="">בחרו</option>'+E.PRODUCTS.map(c=>'<option>'+c+'</option>').join('');
  const sp=E.spec(S.id);
  $('b-q1').textContent='מה סך ההכנסות (Quantity כפול UnitPrice, מסוכם) של המוצר "'+sp.product+'" באזור '+sp.region+'?';
  $('b-q3').textContent='מה סך ההכנסות של כל השנה, בכל האזורים והמוצרים?';
  $('b-q6').textContent='איזה אחוז מסך ההכנסות של השנה מגיע מאזור '+sp.shareRegion+'?';
  // keep question order stable with the form: 1 product+region, 2 customers, 3 total
 }
 function finishB(){
  const g=id=>$(id).value.trim();
  S.b={t:Math.round((Date.now()-S.tB0)/1000),v:[g('b-v1').replace(/[^\d]/g,''),g('b-v2').replace(/[^\d]/g,''),g('b-v3').replace(/[^\d]/g,''),$('b-v4').value,g('b-v5').replace(/[^\d]/g,''),g('b-v6')],dax:g('b-dax').slice(0,500)};
  S.phase='c';S.tC0=Date.now();save();showC();
 }
 function showC(){
  show('s-c');tick();const q=$('c-qs');q.innerHTML='';
  E.CQ.forEach((x,i)=>{const l=document.createElement('label');l.textContent=(i+1)+'. '+x;const t=document.createElement('textarea');t.maxLength=320;t.rows=5;t.required=true;t.value=(S.cd&&S.cd[i])||'';t.oninput=()=>{(S.cd=S.cd||[])[i]=t.value;save()};l.append(t);q.append(l)});
 }
 function finish(){
  const a=[...document.querySelectorAll('#c-qs textarea')].map(t=>t.value.trim().slice(0,320));
  S.c={a,t:Math.round((Date.now()-S.tC0)/1000)};S.phase='done';S.tEnd=Date.now();save();result();
 }
 function result(){
  const payload={v:C.version,id:S.id,n:S.name,e:S.email||'',s:new Date(S.tA0).toISOString(),z:new Date(S.tEnd).toISOString(),a:{r:S.r,t:S.tAsec},b:S.b,c:S.c};
  const code=E.encode(payload);show('s-res');
  $('r-ta').textContent=fmt(S.tAsec||0);$('r-tb').textContent=fmt(S.b.t);$('r-tc').textContent=fmt(S.c.t||0);$('r-code').value=code;
  $('r-sent').textContent='קוד נבחן: '+S.id+'. הקוד מכיל את התשובות והזמנים, לא את הציון. שלחו אותו למנהל המבחן.';
  if(C.resultsEndpoint)fetch(C.resultsEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})}).catch(()=>{});
 }
 $('f-start').addEventListener('submit',e=>{e.preventDefault();
  const given=($('in-id').value||'').trim().toUpperCase();
  S={id:/^[A-HJKMNP-Z2-9]{6}$/.test(given)?given:newId(),name:$('in-name').value.trim(),email:$('in-mail').value.trim(),phase:'a',i:0,r:[],tA0:Date.now()};save();show('s-a');renderQ();tick()});
 $('a-next').onclick=()=>{if(picked!==null)answer(picked)};
 $('a-skip').onclick=()=>{if(confirm('דילוג נחשב לתשובה שגויה, ואי אפשר לחזור אליה. לדלג?'))answer(-1)};
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
