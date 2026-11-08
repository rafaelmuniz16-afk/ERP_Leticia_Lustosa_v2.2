(() => {
  'use strict';
  const C=window.AuroraAchievementCatalog,E=window.AuroraAchievementEngine,cache=E.createCache();
  const $=id=>document.getElementById(id),number=n=>Number(n).toLocaleString('pt-BR',{maximumFractionDigits:1});
  let current=null,rendered=null,selected=1,bound=false,memory=null,announcedResult=null;
  let flight=null,largeRows=null,largeLength=0,largeDay='';
  const paths=[
    'M12 20V10M12 14C4 14 4 5 4 5s8-1 8 9Zm0-4c0-7 8-7 8-7s1 7-8 7Z',
    'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z',
    'M12 6C8 3 3 5 3 5v14s5-2 9 1c4-3 9-1 9-1V5s-5-2-9 1Zm0 0v14',
    'M5 21V3m0 1c5-4 9 4 15 0v10c-6 4-10-4-15 0',
    'm15.5 8.5-2 5-5 2 2-5 5-2ZM12 2v3m0 14v3M2 12h3m14 0h3',
    'M8 2 6 9m10-7 2 7M9 2l3 5 3-5M8 12l4-3 4 3v5l-4 3-4-3Z',
    'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6Zm-5 9 3 3 7-7',
    'M4 4 20 20M20 4 4 20M3 7l4-4m10 18 4-4M3 17l4 4M17 3l4 4',
    'm12 2 10 7-10 13L2 9Zm-10 7h20M7 9l5 13 5-13M7 9l5-7 5 7',
    'm3 5 4 6 5-8 5 8 4-6-2 14H5ZM5 15h14'
  ];
  function node(tag,cls,text) { const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e; }
  // Ornamental badges share the immutable 70-level icon catalog.
  // Rendering only: no changes to levels, achievements, progress or data.
  let emblemSerial = 0;
  function icon(level) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 64 64');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.classList.add('aa-emblem');
    svg.dataset.tier = String(level.icon.tier);
    svg.dataset.emblem = level.icon.id;
    const serial = 'aa-medallion-' + (++emblemSerial);
    const make = (parent, tag, attrs = {}) => {
      const el = document.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, String(value)));
      parent.append(el);
      return el;
    };
    const defs = make(svg, 'defs');
    const face = make(defs, 'linearGradient', {id:serial+'-face',x1:'14%',y1:'5%',x2:'87%',y2:'100%'});
    make(face, 'stop', {offset:'0%',style:'stop-color:var(--aa-medal-face-light,#fff9eb)'});
    make(face, 'stop', {offset:'100%',style:'stop-color:var(--aa-medal-face-shade,#ead7ee)'});
    const metal = make(defs, 'linearGradient', {id:serial+'-rim',x1:'3%',y1:'0%',x2:'95%',y2:'100%'});
    make(metal, 'stop', {offset:'0%',style:'stop-color:var(--aa-medal-rim-hi,#ffe8a6)'});
    make(metal, 'stop', {offset:'47%',style:'stop-color:var(--aa-medal-rim-mid,#cda3bc)'});
    make(metal, 'stop', {offset:'100%',style:'stop-color:var(--aa-medal-rim-lo,#a67aa4)'});
    // Outer scalloped contour is subtly tiered; each of the 7 decades has
    // a distinct arrangement of engraved gems around the medal.
    let contour = '';
    for (let i=0;i<24;i++) {
      const angle=i*Math.PI/12-Math.PI/2;
      const radius=i%2===0 ? 30.1 : 28.6;
      contour += (i===0?'M':'L')+(32+Math.cos(angle)*radius).toFixed(2)+' '+(32+Math.sin(angle)*radius).toFixed(2)+' ';
    }
    make(svg,'path',{d:contour+'Z',fill:'url(#'+serial+'-rim)',stroke:'var(--aa-medal-rim-hi,#ffe8a6)','stroke-width':'.48'});
    make(svg,'circle',{cx:32,cy:32,r:26.2,fill:'url(#'+serial+'-face)',stroke:'rgba(255,255,255,.85)','stroke-width':'1.6'});
    make(svg,'circle',{cx:32,cy:32,r:22.4,fill:'none',stroke:'var(--aa-medal-rim-lo,#b98daf)','stroke-width':'.8',opacity:'.64'});
    make(svg,'circle',{cx:32,cy:32,r:19.6,fill:'none',stroke:'rgba(255,255,255,.72)','stroke-width':'.85'});
    // Laurels and the crown-shaped pearl mark add a heraldic silhouette.
    make(svg,'path',{d:'M20.9 46.8C13 42.5 10.7 34.9 13.2 27M43.1 46.8C51 42.5 53.3 34.9 50.8 27',fill:'none',stroke:'var(--aa-medal-rim-lo,#b98daf)','stroke-width':'1.12','stroke-linecap':'round',opacity:'.68'});
    for(let i=0;i<4;i++) {
      const y=29+i*3.6;
      make(svg,'ellipse',{cx:13.4+i*.54,cy:y,rx:1.7,ry:3.1,transform:'rotate('+(-35+i*9)+' '+(13.4+i*.54)+' '+y+')',fill:'var(--aa-medal-rim-mid,#cda3bc)',opacity:'.64'});
      make(svg,'ellipse',{cx:50.6-i*.54,cy:y,rx:1.7,ry:3.1,transform:'rotate('+(35-i*9)+' '+(50.6-i*.54)+' '+y+')',fill:'var(--aa-medal-rim-mid,#cda3bc)',opacity:'.64'});
    }
    make(svg,'path',{d:'M32 5.3l2.2 3.1L32 11l-2.2-2.6z',fill:'var(--aa-medal-rim-lo,#b98daf)'});
    make(svg,'circle',{cx:32,cy:32,r:15.35,fill:'rgba(255,255,255,.38)',stroke:'var(--aa-medal-rim-mid,#cda3bc)','stroke-width':'.68'});
    // Same ten base pictograms, now displayed as engraved heraldic emblems.
    make(svg,'path',{d:paths[level.icon.symbol],transform:'translate(20 20)',fill:'none',stroke:'currentColor','stroke-width':'1.72','stroke-linecap':'round','stroke-linejoin':'round'});
    make(svg,'path',{d:'M26 49.8h12',stroke:'var(--aa-medal-rim-mid,#cda3bc)','stroke-width':'.8','stroke-linecap':'round',opacity:'.77'});
    const gemCount = Math.min(7, Math.max(1, level.icon.tier+1));
    for(let i=0;i<gemCount;i++) {
      const a=Math.PI*(.12+i/(gemCount-1||1)*.76);
      const x=32+24.2*Math.cos(a), y=32+24.2*Math.sin(a);
      make(svg,'path',{d:`M${x.toFixed(2)} ${(y-1.65).toFixed(2)}l1.5 1.65-1.5 1.65-1.5-1.65z`,fill:'var(--aa-medal-gem,#fff6cc)',stroke:'var(--aa-medal-rim-lo,#b98daf)','stroke-width':'.45'});
    }
    return svg;
  }
  function progressText(p) {
    if(p.operator==='gte')return number(p.current)+' / '+number(p.target)+' '+C.metrics[p.metric];
    return '('+p.conditions.map(progressText).join(p.operator==='all'?' E ':' OU ')+')';
  }
  function missions(list,level) {
    if(!list)return;
    list.replaceChildren(...level.missions.map(m=>{
      const li=node('li','aa-mission '+(m.unlocked?'is-complete':level.locked?'is-locked':'is-pending'));
      li.dataset.mission=m.id;
      const heading=node('div','aa-mission-heading'),title=node('strong','',m.title);
      const state=m.unlocked?'Concluída':level.locked?(m.met?'Requisito alcançado · aguardando desbloqueio':'Bloqueada · requisito pendente'):'Em progresso';
      const status=node('span','aa-status',state);heading.append(title,status);
      const counts=node('p','aa-counts',progressText(m.progress));
      const track=node('div','aa-track');track.setAttribute('role','progressbar');track.setAttribute('aria-label',m.title);
      track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');
      track.setAttribute('aria-valuenow',String(Math.floor(m.percent)));track.setAttribute('aria-valuetext',state+'. '+counts.textContent);
      track.style.setProperty('--aa-progress',m.percent+'%');
      li.append(heading,counts,track);
      li.append(node('p','aa-source',m.category+' · '+m.description));
      return li;
    }));
  }
  function read() { if(memory)return memory;try{memory=JSON.parse(localStorage.getItem(E.STORAGE_KEY));}catch(_){}return memory; }
  function save(s) { memory=s;try{localStorage.setItem(E.STORAGE_KEY,JSON.stringify(s));}catch(_){} }
  function motion() { return read()?.animations!==false&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches; }
  function notice(kind,result) {
    const el=$('aa-notice');if(!el)return;
    const label='Nível '+result.currentLevel+' — '+result.current.title;
    const messages={history:'Seu histórico foi reconhecido! '+label+'.',level:'Novo nível desbloqueado! '+label+'.',complete:'Jornada concluída! Nível 70 — Lenda da Aurora.',recalculated:'Progresso recalculado com os dados disponíveis. '+label+'.'};
    el.textContent=messages[kind]||'';el.hidden=!kind;
    const detail=$('aa-journey-notice');
    if(detail){detail.textContent=el.textContent;detail.hidden=el.hidden;}
    const heading=$('aa-current-heading');heading?.classList.remove('aa-celebrate');
    if(kind&&kind!=='recalculated'&&motion()&&heading) { void heading.offsetWidth;heading.classList.add('aa-celebrate'); }
  }
  function header(target,level,state) {
    if(!target)return;const title=node('div');title.append(node('p','aa-kicker','NÍVEL '+level.number+' / 70'),node('h4','aa-title',level.title),node('p','aa-level-state',state));target.replaceChildren(icon(level),title);
  }
  function renderJourney() {
    if(!current)return;
    const level=current.levels[selected-1];
    header($('aa-journey-heading'),level,level.state==='bloqueado'?'Bloqueado · conclua o nível '+(selected-1):level.complete?'Concluído':'Nível atual');
    $('aa-level-select').value=String(selected);
    $('aa-prev').disabled=selected===1;$('aa-next').disabled=selected===70;
    $('aa-journey-detail').textContent=level.stage+' · '+level.difficulty+' · '+level.done+' de 5 requisitos alcançados.';
    $('aa-level-description').textContent=level.evolution;
    $('aa-next-title').textContent=level.number===70?(level.complete?'Todos os 70 níveis foram concluídos.':'Última etapa: conclua as cinco missões.'):'Próximo: Nível '+(level.number+1)+' — '+current.levels[level.number].title;
    missions($('auroraAchievementsCatalog'),level);
    const start=Math.floor((selected-1)/10)*10;
    const nav=$('aa-levels');nav.replaceChildren(...current.levels.slice(start,start+10).map(l=>{
      const b=node('button','aa-level-chip',l.number+(l.complete?' ✓':l.locked?' ·':' →'));
      b.type='button';b.dataset.level=l.number;b.setAttribute('aria-label','Nível '+l.number+' — '+l.title+' · '+(l.complete?'concluído':l.locked?'bloqueado':'atual'));
      if(l.number===selected)b.setAttribute('aria-current','step');return b;
    }));
    $('aa-range').textContent='Níveis '+(start+1)+'–'+(start+10)+' · use o seletor para qualquer etapa';
    $('auroraAchievementsCount').textContent=current.completedLevels+' de 70 níveis concluídos · '+current.completedMissions+' de 350 missões reconhecidas';
    $('aa-animations').checked=read()?.animations!==false;
    $('auroraAchievementsDialog').dataset.motion=String(read()?.animations!==false);
  }
  function render(result) {
    const l=result.current;
    header($('aa-current-heading'),l,result.finished?'Jornada concluída':l.done+' de 5 missões concluídas');
    const progress=$('aa-current-progress');
    if(progress){progress.style.setProperty('--aa-progress',(l.done/5*100)+'%');progress.setAttribute('aria-valuenow',String(l.done));progress.setAttribute('aria-valuetext',l.done+' de 5 missões concluídas');}
    const q=result.quality,issues=q.invalidDates+q.futureDates+q.conflictingUids+q.invalidRows;
    $('aa-scope').textContent=number(result.stats.total)+' encerramentos avaliados · todos os anos'+(issues?' · há dados não utilizáveis; consulte os critérios na jornada.':'');
    if($('aa-quality'))$('aa-quality').textContent='Datas inválidas: '+q.invalidDates+'; futuras: '+q.futureDates+'; cópias repetidas: '+q.duplicateRows+'; identidades conflitantes excluídas: '+q.conflictingUids+'; sem identidade: '+q.missingUid+' (linhas tratadas como distintas); status conflitantes: '+q.statusConflicts+'.';
    if($('auroraAchievementsDialog')?.open)renderJourney();
  }
  function commit(result,confirmed) {
    current=result;
    $('auroraAchievements')?.removeAttribute('aria-busy');
    if(!rendered)selected=result.currentLevel;
    if(result!==rendered&&$('aa-current-heading')) { render(result);rendered=result; }
    // A avaliação continua local; somente o aviso aguarda a confirmação do fluxo existente.
    if(confirmed&&announcedResult!==result) { const t=E.transition(read(),result);save(t.state);notice(t.notice,result);announcedResult=result; }
    return result;
  }
  function refresh(rows,today,confirmed=false) {
    if(rows.length>20000) {
      if(!confirmed && rows===largeRows && rows.length===largeLength && today===largeDay)return current;
      flight?.abort();const controller=new AbortController();flight=controller;
      largeRows=rows;largeLength=rows.length;largeDay=today;
      $('auroraAchievements')?.setAttribute('aria-busy','true');
      if($('aa-scope'))$('aa-scope').textContent='Reavaliando histórico amplo… o último resultado será substituído ao concluir.';
      E.evaluateAsync(rows,today,{signal:controller.signal}).then(result=>{
        if(flight!==controller||controller.signal.aborted)return;flight=null;
        commit(result,confirmed);
        window.dispatchEvent(new CustomEvent('aurora:achievements-ready',{detail:result}));
      }).catch(error=>{
        if(flight!==controller)return;flight=null;
        $('auroraAchievements')?.removeAttribute('aria-busy');
        if(error.name!=='AbortError'&&$('aa-scope'))$('aa-scope').textContent='Não foi possível avaliar este histórico. Recarregue os dados para tentar novamente.';
      });
      return current;
    }
    flight?.abort();flight=null;largeRows=null;
    return commit(cache.get(rows,today),confirmed);
  }
  function bind() {
    if(bound||!$('aa-current-heading'))return;bound=true;
    const dialog=$('auroraAchievementsDialog'),opener=$('auroraAchievementsOpen'),close=$('auroraAchievementsClose');
    function choose(n) {selected=Math.max(1,Math.min(70,Number(n)||1));renderJourney();}
    opener.addEventListener('click',()=>{if(dialog.open)return;selected=current?.currentLevel||1;renderJourney();dialog.showModal();dialog.querySelector('.aurora-catalog-body').scrollTop=0;close.focus();});
    close.addEventListener('click',()=>dialog.close());
    dialog.addEventListener('close',()=>opener.focus({preventScroll:true}));
    dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
    $('aa-prev').addEventListener('click',()=>choose(selected-1));$('aa-next').addEventListener('click',()=>choose(selected+1));
    $('aa-level-select').replaceChildren(...C.levels.map(l=>{const o=node('option','',l.number+' — '+l.title);o.value=l.number;return o;}));
    $('aa-level-select').addEventListener('change',e=>choose(e.target.value));
    $('aa-levels').addEventListener('click',e=>{const b=e.target.closest('[data-level]');if(!b)return;choose(b.dataset.level);$('aa-levels').querySelector('[aria-current]')?.focus();});
    $('aa-animations').addEventListener('change',e=>{save({...read(),version:C.VERSION,animations:e.target.checked});$('aa-current-heading').classList.remove('aa-celebrate');dialog.dataset.motion=String(e.target.checked);});
    window.addEventListener('storage',e=>{if(e.key!==E.STORAGE_KEY)return;memory=null;if(dialog.open)renderJourney();});
    dialog.addEventListener('keydown',e=>{
      if(e.key!=='Tab')return;
      const items=[...dialog.querySelectorAll('button,select,input,[tabindex="0"],summary')].filter(el=>!el.disabled&&el.getClientRects().length);
      const first=items[0],last=items.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    });
    if(current)render(current);
  }
  window.AuroraAchievements=Object.freeze({refresh,bind,icon,progressText,getSnapshot:()=>current,get builds(){return cache.builds;}});
})();
