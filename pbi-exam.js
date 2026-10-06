(()=>{
 const E=window.PbiCore,C=window.PBI_CONFIG,KEY='pbi-exam-v3',T=window.PBI_TOPICS;
 const $=id=>document.getElementById(id);
 const LIMIT=C.limitMinutesB*60;
 let S=null;
 const load=()=>{try{return JSON.parse(sessionStorage.getItem(KEY))}catch(e){return null}};
 const save=()=>{try{sessionStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
 const show=n=>{['s-start','s-a','s-bintro','s-b','s-c','s-res'].forEach(i=>$(i).hidden=i!==n);window.scrollTo(0,0)};
 const fmt=s=>{s=Math.max(0,Math.floor(s));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
 const fmtH=s=>{s=Math.max(0,Math.floor(s));return Math.floor(s/3600)+':'+String(Math.floor(s%3600/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
 const newId=()=>{const a='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let o='';crypto.getRandomValues(new Uint8Array(6)).forEach(x=>o+=a[x%a.length]);return o};
 const isAns=v=>typeof v==='number'&&v>=0;
 let timer=null,closing=false;
 const deadline=()=>S.tB0+LIMIT*1000;
 const tick=()=>{clearInterval(timer);timer=setInterval(()=>{
  if(!S)return;
  if(S.phase==='a')$('a-time').textContent=fmt((Date.now()-S.tA0)/1000);
  if(S.tB0&&!S.bDone){
   const rem=(deadline()-Date.now())/1000;
   if(S.phase==='b'){const el=$('b-time');el.textContent=fmtH(rem);el.classList.toggle('b-low',rem<600);$('b-bar').style.width=Math.min(100,(LIMIT-rem)/LIMIT*100)+'%'}
   if(rem<=0)autoClose();
  }
  if(S.phase==='c'){const t=(Date.now()-S.tC0)/1000;$('c-time').textContent=fmt(t);$('c-bar').style.width=Math.min(100,t/(10*60)*100)+'%'}
 },500)};
 const order=(id,qid)=>{const r=E.mulberry(E.seedNum('o:'+id+qid)),a=[0,1,2,3];for(let i=3;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 // ---------- Part A: free navigation
 const P=()=>E.paperA(S.id);
 const answered=()=>P().reduce((n,_,i)=>n+(isAns(S.r[i])?1:0),0);
 function dots(){
  const box=$('a-dots'),n=P().length;if(box.children.length!==n){box.innerHTML='';for(let i=0;i<n;i++){const b=document.createElement('button');b.type='button';b.textContent=i+1;b.setAttribute('aria-label','שאלה '+(i+1));b.onclick=()=>go(i);box.append(b)}}
  [...box.children].forEach((b,i)=>{b.classList.toggle('done',isAns(S.r[i]));b.setAttribute('aria-current',i===S.i?'true':'false')});
  const left=n-answered();$('a-left').textContent=left?('נשארו '+left+' שאלות בלי תשובה'):'ענית על כל השאלות. אפשר עדיין לחזור ולשנות.';
 }
 function go(n){const len=P().length;if(n<0||n>=len)return;S.i=n;save();renderQ()}
 function renderQ(){
  const p=P(),i=S.i,q=p[i];
  $('a-count').textContent='שאלה '+(i+1)+' מתוך '+p.length;$('a-bar').style.width=(answered()/p.length*100)+'%';
  $('a-topic').textContent=T[q[1]];$('a-stem').textContent=q[2];
  const box=$('a-opts');box.innerHTML='';const cur=isAns(S.r[i])?S.r[i]:null;
  $('a-prev').disabled=i===0;$('a-next').textContent=i===p.length-1?'לסיום החלק':'הבאה';
  order(S.id,q[0]).forEach(oi=>{const b=document.createElement('button');b.type='button';b.className='opt';b.setAttribute('role','radio');b.setAttribute('aria-checked',cur===oi?'true':'false');b.textContent=q[3][oi];
   b.onclick=()=>{S.r[i]=oi;save();box.querySelectorAll('.opt').forEach(x=>x.setAttribute('aria-checked','false'));b.setAttribute('aria-checked','true');dots();$('a-bar').style.width=(answered()/p.length*100)+'%'};box.append(b)});
  dots();
 }
 function finishA(){
  const len=P().length,left=len-answered();
  if(left&&!confirm('נשארו '+left+' שאלות בלי תשובה, והן ייחשבו שגויות. לסיים את חלק א׳ בכל זאת? (אפשר גם ללחוץ ביטול ולחזור אליהן.)'))return;
  S.r=Array.from({length:len},(_,k)=>isAns(S.r[k])?S.r[k]:-1);
  if(!S.tAsec)S.tAsec=Math.round((Date.now()-S.tA0)/1000);
  S.phase='bintro';save();show('s-bintro');
 }
 function dl(name,type,content){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
 const dlCsv=()=>dl('orders-2025-'+S.id+'.csv','text/csv;charset=utf-8','\ufeff'+E.csv(E.dataset(S.id)));
 function fillB(){
  if($('b-v5').options.length<2){
   $('b-v5').innerHTML='<option value="">בחרו</option>'+E.PRODUCTS.map(c=>'<option>'+c+'</option>').join('');
   $('b-v6').innerHTML='<option value="">בחרו</option>'+E.MONTHS.map(c=>'<option>'+c+'</option>').join('');
  }
  if(S.bv)['b-v1','b-v2','b-v3','b-v4','b-v5','b-v6','b-note'].forEach(id=>{if(S.bv[id]!=null&&!$(id).value)$(id).value=S.bv[id]});
 }
 $('f-b').addEventListener('input',()=>{if(!S)return;S.bv=S.bv||{};['b-v1','b-v2','b-v3','b-v4','b-v5','b-v6','b-note'].forEach(id=>S.bv[id]=$(id).value);save()});
 // ---------- uploads (screenshots and ZIP) in chunks through the results Worker
 function shrink(file){return new Promise((res,rej)=>{const im=new Image(),u=URL.createObjectURL(file);im.onload=()=>{const w=Math.min(1400,im.width),h=Math.round(im.height*w/im.width),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(im,0,0,w,h);URL.revokeObjectURL(u);let q=.8,d=c.toDataURL('image/jpeg',q);while(d.length>1300000&&q>.3){q-=.1;d=c.toDataURL('image/jpeg',q)}d.length>1300000?rej():res(d)};im.onerror=()=>rej();im.src=u})}
 const readB64=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]||'');r.onerror=()=>rej();r.readAsDataURL(f)});
 async function putBlob(kind,name,b64,prog){
  const CH=700000,n=Math.max(1,Math.ceil(b64.length/CH));
  for(let i=0;i<n;i++){
   let ok=false;
   for(let t=0;t<3&&!ok;t++){
    try{const r=await fetch(C.resultsEndpoint+'/blob',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:S.id,kind,name,i,n,data:b64.slice(i*CH,(i+1)*CH)})});const x=r.ok?await r.json():null;ok=!!(x&&x.ok)}catch(e){}
    if(!ok)await new Promise(r=>setTimeout(r,800*(t+1)));
   }
   if(!ok)throw new Error('upload');
   if(prog)prog(i+1,n);
  }
 }
 async function zipCheck(f){
  if(!f)return 'חסר קובץ ZIP של הדשבורד.';
  if(!/\.zip$/i.test(f.name))return 'הקובץ חייב להיות ZIP. כווצו את קובץ ה-pbix (או את תיקיית ה-PBIP) ל-ZIP.';
  if(f.size>C.zipMaxBytes)return 'הקובץ גדול מ-5MB ('+(f.size/1048576).toFixed(1)+'MB). כווצו שוב, או הסירו נתונים מיותרים מהמודל.';
  const h=new Uint8Array(await f.slice(0,2).arrayBuffer());if(h[0]!==0x50||h[1]!==0x4b)return 'זה לא נראה כקובץ ZIP תקין. כווצו מחדש ונסו שוב.';
  return '';
 }
 function setBusy(b,msg){$('b-submit').disabled=b;$('b-toa').disabled=b;$('b-upmsg').textContent=msg||''}
 async function doUploads(force){
  const msg=[];const up=S.up=S.up||{zip:false,sh:0};
  const zf=$('b-zip').files[0],sf=[...$('b-file').files].slice(0,2);
  const zbad=zf?await zipCheck(zf):(up.zip?'':'חסר קובץ ZIP של הדשבורד.');
  if(zbad&&!force){setBusy(false,zbad);return false}
  if(!sf.length&&!up.sh&&!force){setBusy(false,'חסר צילום מסך אחד לפחות.');return false}
  for(;;){
   try{
    if(sf.length){
     for(let k=0;k<sf.length;k++){setBusy(true,'מעלה צילום מסך '+(k+1)+' מתוך '+sf.length+'…');const d=await shrink(sf[k]);await putBlob('shot'+(k+1),sf[k].name.slice(0,60),d.split(',')[1]);}
     up.sh=sf.length;
    }
    if(zf&&!zbad){setBusy(true,'מעלה ZIP…');await putBlob('zip',zf.name.slice(0,80),await readB64(zf),(i,n)=>setBusy(true,'מעלה ZIP: '+Math.round(i/n*100)+'%'));up.zip=true;S.zipInfo={n:zf.name.slice(0,80),s:zf.size}}
    save();return true;
   }catch(e){
    if(force)return true;
    if(!confirm('ההעלאה נכשלה (בדקו את החיבור). לנסות שוב? אם תלחצו ביטול, תמשיכו בלי ההעלאה, ותצטרכו לשלוח את הקבצים למנהל המבחן בנפרד.')){S.upFail=true;return true}
    sf.length&&(up.sh=0);
   }
  }
 }
 async function finishB(force){
  if(closing)return;
  if(S.bDone&&Date.now()>=deadline()){S.phase='c';save();showC();return}
  closing=true;
  try{
   const g=id=>$(id).value.trim();
   const late=!!force||!!(S.b&&S.b.late);
   if(!late){
    const ok=await doUploads(false);if(!ok){closing=false;return}
   }else{await doUploads(true)}
   const end=Math.min(Date.now(),deadline());
   S.b={t:S.b&&S.b.t?S.b.t:Math.round((end-S.tB0)/1000),v:[1,2,3,4].map(k=>g('b-v'+k).replace(/[^\d]/g,'')).concat([$('b-v5').value,$('b-v6').value]),note:g('b-note').slice(0,400),late,up:{zip:!!(S.up&&S.up.zip),sh:(S.up&&S.up.sh)||0,fail:!!S.upFail},zi:S.zipInfo||null};
   S.bDone=true;S.phase='c';S.tC0=S.tC0||Date.now();save();setBusy(false,'');showC();
  }finally{closing=false}
 }
 function autoClose(){if(S.bDone||closing)return;fillB();finishB(true).then(()=>{S.bAuto=true;save();if(S.phase==='c')showC()})}
 // Part C focus guard: counts leaving the screen. Not proof of consulting an AI tool; it only flags it.
 let awayAt=0;
 function onAway(){if(!S||S.phase!=='c'||$('s-c').hidden||awayAt)return;awayAt=Date.now()}
 function onBack(){if(!awayAt)return;const sec=Math.round((Date.now()-awayAt)/1000);awayAt=0;if(!S||S.phase!=='c')return;S.co=(S.co||0)+1;S.cs=(S.cs||0)+sec;save();$('c-warn').hidden=false;$('c-warn-n').textContent=S.co}
 document.addEventListener('visibilitychange',()=>{document.hidden?onAway():onBack()});
 window.addEventListener('blur',onAway);window.addEventListener('focus',onBack);
 function showC(){
  show('s-c');tick();$('c-warn').hidden=!(S.co>0);$('c-warn-n').textContent=S.co||0;$('c-auto').hidden=!S.b||!S.b.late;
  const sc=E.scenario(S.id);$('c-title').textContent=sc.title;$('c-brief').textContent=sc.brief;const q=$('c-qs');if(q.children.length)return;
  E.CQ.forEach((x,i)=>{const l=document.createElement('label');l.textContent=(i+1)+'. '+x;const t=document.createElement('textarea');t.maxLength=320;t.rows=5;t.required=true;t.value=(S.cd&&S.cd[i])||'';t.oninput=()=>{(S.cd=S.cd||[])[i]=t.value;save()};l.append(t);q.append(l)});
 }
 function finish(){
  const a=[...document.querySelectorAll('#c-qs textarea')].map(t=>t.value.trim().slice(0,320));
  S.c={s:E.scenario(S.id).id,o:S.co||0,w:S.cs||0,a,t:Math.round((Date.now()-S.tC0)/1000)};S.phase='done';S.tEnd=Date.now();save();result();
 }
 function result(){
  const payload={v:C.version,id:S.id,n:S.name,e:S.email||'',s:new Date(S.tA0).toISOString(),z:new Date(S.tEnd).toISOString(),a:{r:S.r,t:S.tAsec},b:S.b,c:S.c};
  const code=E.encode(payload);show('s-res');
  $('r-ta').textContent=fmt(S.tAsec||0);$('r-tb').textContent=fmtH(S.b.t);$('r-tc').textContent=fmt(S.c.t||0);$('r-code').value=code;
  const bu=S.b.up||{};$('r-files').textContent=(bu.zip?'ה-ZIP הועלה':'ה-ZIP לא הועלה: שלחו אותו למנהל המבחן בנפרד')+(bu.sh?'. הועלו '+bu.sh+' צילומי מסך.':'. צילומי המסך לא הועלו: שלחו אותם בנפרד.');
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
 $('a-next').onclick=()=>{S.i===P().length-1?finishA():go(S.i+1)};
 $('a-prev').onclick=()=>go(S.i-1);
 $('a-finish').onclick=finishA;
 $('b-back').onclick=()=>{S.phase='a';save();show('s-a');renderQ();tick()};
 $('b-toa').onclick=()=>{S.phase='a';save();show('s-a');renderQ();tick()};
 $('b-start').onclick=()=>{S.phase='b';if(!S.tB0)S.tB0=Date.now();save();fillB();dlCsv();show('s-b');tick()};
 $('b-dl').onclick=dlCsv;
 $('f-b').addEventListener('submit',e=>{e.preventDefault();finishB(false)});
 $('f-c').addEventListener('submit',e=>{e.preventDefault();finish()});
 $('c-back').onclick=()=>{S.phase='b';save();fillB();show('s-b');tick();const late=Date.now()>=deadline();if(late){$('f-b').querySelectorAll('input,select,textarea').forEach(x=>{x.disabled=true});$('b-upmsg').textContent='הזמן של חלק ב׳ נגמר, אי אפשר לערוך.'}};
 $('r-copy').onclick=async()=>{const t=$('r-code').value;try{await navigator.clipboard.writeText(t)}catch(e){$('r-code').select();document.execCommand('copy')}$('r-copy').textContent='הועתק';setTimeout(()=>$('r-copy').textContent='העתקת הקוד',2000)};
 $('r-file').onclick=()=>dl('pbi-exam-result-'+S.id+'.txt','text/plain',$('r-code').value);
 S=load();
 if(S){
  if(S.phase==='a'){show('s-a');renderQ();tick()}
  else if(S.phase==='bintro')show('s-bintro');
  else if(S.phase==='b'){fillB();show('s-b');tick()}
  else if(S.phase==='c')showC();
  else if(S.phase==='done'&&S.c)result();
  if(S.tB0&&!S.bDone)tick();
 }
})();
