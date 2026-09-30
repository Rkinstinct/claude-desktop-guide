(()=>{
 const chapters=[...document.querySelectorAll('article.chapter')];
 const parts=[...document.querySelectorAll('section.part')];
 const all=chapters.map((article,index)=>({article,id:article.id,title:article.querySelector('h3').textContent.trim(),number:article.querySelector('.ch-num').textContent.trim(),index}));
 const wrap=document.querySelector('body > .wrap');
 const disclosure=wrap.querySelector(':scope > .callout');
 disclosure.classList.add('course-home-intro');
 const note=document.createElement('details');const noteSummary=document.createElement('summary');noteSummary.textContent='על הסרטונים והמקורות';note.append(noteSummary);
 while(disclosure.firstChild)note.append(disclosure.firstChild);disclosure.append(note);
 const originalSub=document.querySelector('.hero p.sub');
 const more=document.createElement('details');more.className='intro-more';const moreSummary=document.createElement('summary');moreSummary.textContent='למי מתאים המדריך?';more.append(moreSummary);
 const full=document.createElement('p');full.textContent=originalSub.textContent;more.append(full);originalSub.after(more);
 originalSub.textContent='לומדים Claude Chat ו-Claude Code בסביבה ארגונית נעולה, צעד אחר צעד, עם דמו עברי לכל נושא.';
 const bar=document.createElement('div');bar.className='course-bar';
 bar.innerHTML='<div class="wrap"><a class="course-brand" href="#start">Claude Desktop <span aria-hidden="true">✦</span> לומדים בקצב שלכם</a><span class="course-bar-meta">מדריך מעשי בעברית</span><a class="back-link" href="#start" hidden>← כל הפרקים</a></div>';
 document.body.insertBefore(bar,document.querySelector('header.hero'));
 const curriculum=document.createElement('div');curriculum.className='curriculum';curriculum.id='course-list';
 curriculum.innerHTML='<div class="curriculum-head"><h2>בוחרים נושא, מתחילים ללמוד</h2><p>פרקים קצרים לקריאה בקצב שלכם. בכל פרק אפשר להתקדם צעד אחר צעד ולצפות בדמו.</p></div>';
 parts.forEach((part,i)=>{
  const section=document.createElement('section');section.className='course-part';section.id='course-'+part.id;
  const title=part.querySelector('h2').textContent.trim();
  const subset=all.filter(c=>{let p=c.article.previousElementSibling;while(p&&!p.matches('section.part'))p=p.previousElementSibling;return p===part});
  const group=document.createElement('div');group.className='lesson-grid';
  subset.forEach(c=>{const a=document.createElement('a');a.className='lesson-card';a.href='#'+c.id;
    const number=document.createElement('span');number.className='lesson-number';number.textContent=c.number;
    const info=document.createElement('span');const strong=document.createElement('strong');strong.textContent=c.title;
    const small=document.createElement('small');small.textContent='לקריאת הפרק והדמו';info.append(strong,small);
    const arrow=document.createElement('span');arrow.className='arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='←';a.append(number,info,arrow);group.append(a)});
  const head=document.createElement('div');head.className='course-part-head';const label=document.createElement('span');label.className='course-part-label';label.textContent='חלק '+['א','ב','ג','ד'][i];const h=document.createElement('h3');h.textContent=title.replace(/^חלק [אבגד]׳:\s*/, '');head.append(label,h);section.append(head,group);curriculum.append(section);
 });
 wrap.insertBefore(curriculum,parts[0]);
 const top=document.createElement('div');top.className='lesson-top';
 const layout=document.createElement('div');layout.className='lesson-layout';
 const rail=document.createElement('nav');rail.className='step-rail';rail.setAttribute('aria-label','שלבי הפרק');
 const mainCol=document.createElement('div');mainCol.className='step-main';
 const shell=document.createElement('div');shell.className='step-shell';
 const status=document.createElement('div');status.className='step-progress';
 const picker=document.createElement('div');picker.className='step-picker';picker.setAttribute('aria-label','שלבי הפרק');
 const actions=document.createElement('div');actions.className='step-actions';
 const previous=document.createElement('button');previous.type='button';previous.innerHTML='<span class="act-dir">→</span> הקודם';
 const next=document.createElement('button');next.type='button';next.className='next';
 actions.append(previous,next);rail.append(picker);shell.append(actions);layout.append(rail,mainCol);
 const barProg=document.createElement('div');barProg.className='bar-progress';const barFill=document.createElement('div');barFill.className='bar-progress-fill';barProg.append(barFill);bar.append(barProg);
 let active=null,step=0;
 function prepare(c){if(c.steps)return;
  const nodes=[...c.article.children].filter(el=>!el.classList.contains('ch-head'));
  const groups=[];let current=[];
  nodes.forEach(el=>{if(el.tagName==='H4'&&current.length){groups.push(current);current=[]}current.push(el)});
  if(current.length)groups.push(current);
  // Demonstration and sources get their own unhurried final step, rather than sharing a dense text panel.
  const last=groups.at(-1);if(last){let vi=last.findIndex(el=>el.classList.contains('video-box'));if(vi>0){groups.push(last.splice(vi))}}
  c.steps=groups.map((group,i)=>{const section=document.createElement('section');section.className='lesson-step';section.setAttribute('aria-label',group[0]?.tagName==='H4'?group[0].textContent.trim():i===groups.length-1?'הדגמה ומקורות':'היכרות עם הנושא');group[0].before(section);group.forEach(el=>section.append(el));return section});
 }
 function showStep(n,scroll=true){step=Math.max(0,Math.min(n,active.steps.length-1));
  active.steps.forEach((el,i)=>{el.classList.toggle('active',i===step);el.hidden=i!==step});
  const stepName=i=>active.steps[i].querySelector('h4')?.textContent.trim()||(i===active.steps.length-1?'הדגמה ומקורות':'היכרות עם הנושא');
  picker.replaceChildren();active.steps.forEach((el,i)=>{const b=document.createElement('button');b.type='button';const num=document.createElement('span');num.className='chip-num';num.textContent=String(i+1).padStart(2,'0');const lbl=document.createElement('span');lbl.className='chip-label';lbl.textContent=stepName(i);const chk=document.createElement('span');chk.className='chip-check';chk.setAttribute('aria-hidden','true');chk.textContent='✓';b.append(num,lbl,chk);if(i===step)b.setAttribute('aria-current','step');if(i<step)b.classList.add('done');b.onclick=()=>showStep(i);picker.append(b)});
  const count=document.createElement('span');count.className='step-count';count.textContent=`צעד ${step+1} מתוך ${active.steps.length}`;const nm=document.createElement('span');nm.className='step-name';nm.textContent=stepName(step);status.replaceChildren(count,nm);
  barFill.style.transform=`scaleX(${(step+1)/active.steps.length})`;
  previous.disabled=step===0;
  next.innerHTML='';const nt=document.createElement('span');nt.className='act-label';nt.textContent=step===active.steps.length-1?(active.index===all.length-1?'חזרה לכל הפרקים':'לפרק הבא'):'הבא: '+stepName(step+1);const nd=document.createElement('span');nd.className='act-dir';nd.textContent='←';next.append(nt,nd);
  if(scroll)top.scrollIntoView({block:'start',behavior:'instant'});
 }
 previous.onclick=()=>showStep(step-1);
 next.onclick=()=>{if(step<active.steps.length-1)showStep(step+1);else location.hash=all[active.index+1]?.id||'start'};
 function route(){const id=decodeURIComponent(location.hash.slice(1));const c=all.find(x=>x.id===id);
  document.body.classList.toggle('lesson',!!c);document.body.classList.toggle('home',!c);
  bar.querySelector('.back-link').hidden=!c;bar.querySelector('.course-bar-meta').textContent=c?`פרק ${c.number} מתוך ${all.length}`:'מדריך מעשי בעברית';
  chapters.forEach(x=>x.classList.toggle('current',x===c?.article));
  if(c){prepare(c);active=c;top.innerHTML='';const eyebrow=document.createElement('div');eyebrow.className='eyebrow';eyebrow.textContent=`פרק ${c.number} · לומדים צעד אחר צעד`;
   const heading=document.createElement('h2');heading.textContent=c.title;top.append(eyebrow,heading);
   mainCol.append(top,status,c.article,shell);showStep(0,false);
  }else active=null;
  window.scrollTo({top:0,behavior:'instant'});
 }
 document.body.classList.add('course-ready');window.addEventListener('hashchange',route);route();
})();
