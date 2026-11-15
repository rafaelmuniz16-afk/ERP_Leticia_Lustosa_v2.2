/* CRONOS | ERP v2.2 — Incendio F01
   A cena é estritamente visual; montada somente após clique, desmontada em 3,8 s.
   Nenhuma chamada a backend, armazenamento ou acesso ao modelo de dados.
   Som exclusivo no clique (MP3 local), com parada no encerramento/cancelamento.
   Referência arquitetural: Revelio F08 (isolamento e limpeza da cena), desenho original. */
(()=>{
  'use strict';
  const SELECTOR='#cr-chrome .cronos-incendio-trigger';
  const NS='http://www.w3.org/2000/svg';
  const DURATION=3800;
  const AUDIO_PATH='assets/audio/Incendio.mp3';
  const state={started:0,finished:0,cancelled:0,active:false,lastFinish:null,sceneCount:0,
    audioPlayRequests:0,audioStatus:'idle',lastAudioError:null};
  let spellAudio=null;
  function primeSpellAudio(){
    if(spellAudio)return spellAudio;
    try{
      const audio=new Audio();
      audio.preload='auto'; // Pequeno SFX local, pré-carregado sem tocar no carregamento da ERP.
      audio.loop=false;
      audio.src=AUDIO_PATH;
      spellAudio=audio;
      return audio;
    }catch(err){
      state.lastAudioError=String(err?.message||err);
      state.audioStatus='unavailable';
      return null;
    }
  }
  function stopSpellAudio(current){
    const audio=current.audio;
    current.audio=null;
    if(!audio)return;
    try{audio.pause();audio.currentTime=0;}catch(_){}
    state.audioStatus='stopped';
  }
  function startSpellAudio(current){
    const audio=primeSpellAudio();
    if(!audio||session!==current)return;
    try{
      audio.pause();
      audio.currentTime=0;
      current.audio=audio;
      state.audioStatus='requested';
      state.lastAudioError=null;
      state.audioPlayRequests++;
      // Chamado sincronamente dentro do clique real; bloqueio do navegador não impede a cena.
      const play=audio.play();
      play?.then?.(()=>{
        if(session===current)state.audioStatus='playing';
      })?.catch?.(err=>{
        if(session===current){
          state.audioStatus='blocked';
          state.lastAudioError=String(err?.name||err);
        }
      });
    }catch(err){
      if(session===current){
        state.audioStatus='error';
        state.lastAudioError=String(err?.message||err);
      }
      stopSpellAudio(current);
    }
  }
  Object.defineProperty(window,'ERPIncendioSpellState',{value:state,configurable:true});
  let session=null;
  const el=(tag,attrs,parent)=>{
    const item=document.createElementNS(NS,tag);
    Object.entries(attrs).forEach(([key,value])=>item.setAttribute(key,String(value)));
    if(parent)parent.appendChild(item);
    return item;
  };
  const number=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
  const randomGenerator=(seed)=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  function teardown(reason){
    if(!session)return;
    const prev=session;session=null;
    prev.abort.abort();
    window.clearTimeout(prev.timer);
    stopSpellAudio(prev);
    prev.stage?.remove();
    prev.button.classList.remove('cronos-incendio-active');
    prev.button.removeAttribute('aria-busy');
    state.active=false;state.lastFinish=reason;
    state.sceneCount=document.querySelectorAll('.cronos-incendio-stage').length;
    if(reason==='complete')state.finished++;else state.cancelled++;
  }
  function installSafeguards(current){
    const signal=current.abort.signal;
    document.addEventListener('visibilitychange',()=>{if(document.hidden)teardown('tab-hidden')},{signal});
    window.addEventListener('pagehide',()=>teardown('pagehide'),{signal});
    window.addEventListener('resize',()=>teardown('resize'),{signal});
    window.addEventListener('scroll',()=>teardown('scroll'),{capture:true,passive:true,signal});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')teardown('escape')},{signal});
    document.documentElement.addEventListener('erp-theme-changed',()=>teardown('theme-changed'),{signal});
    const mutation=new MutationObserver(records=>{
      if(records.some(r=>r.attributeName==='data-erp-theme'||r.attributeName==='data-erp-layout'||r.attributeName==='data-glass-light'))teardown('theme-or-layout-change');
    });
    mutation.observe(document.documentElement,{attributes:true,attributeFilter:['data-erp-theme','data-erp-layout','data-glass-light']});
    signal.addEventListener('abort',()=>mutation.disconnect(),{once:true});
  }
  function locationSeeds(w,h,anchor){
    const p=[[.13,.26],[.47,.30],[.82,.25],[.20,.72],[.73,.73]];
    const {left,top,right,bottom}=anchor.getBoundingClientRect();
    const size=number(Math.min(w,h)*.13,56,90);
    const occupied=[...document.querySelectorAll('button,input,textarea,select,a,[role="button"],h1,h2,h3,h4,td,th,label')]
      .filter(item=>!item.closest('.cronos-incendio-stage'))
      .map(item=>item.getBoundingClientRect())
      .filter(r=>r.width>1&&r.height>1&&r.bottom>=0&&r.top<=h);
    occupied.push({left,top,right,bottom});
    return p.map(([fx,fy])=>{
      const idealX=w*fx,idealY=h*fy;
      let best=null;
      for(let gx=0;gx<7;gx++)for(let gy=0;gy<7;gy++){
        const x=number(idealX+(gx-3)*size*.63,size*.6,w-size*.6);
        const y=number(idealY+(gy-3)*size*.63,size*.6,h-size*.6);
        const s={left:x-size*.42,right:x+size*.42,top:y-size*.42,bottom:y+size*.42};
        const overlaps=occupied.reduce((sum,r)=>sum+(s.left<r.right+5&&s.right>r.left-5&&s.top<r.bottom+5&&s.bottom>r.top-5?1:0),0);
        const cost=overlaps*250+Math.hypot((x-idealX)/w,(y-idealY)/h)*100;
        if(!best||cost<best.cost)best={x,y,cost};
      }
      return {x:best.x,y:best.y,size};
    });
  }
  function makeSigil(stage,point,index){
    const box=document.createElement('div');box.className='cronos-incendio-sigil';
    box.style.left=`${point.x}px`;box.style.top=`${point.y}px`;
    box.style.setProperty('--ci-size',`${point.size}px`);
    box.style.setProperty('--ci-delay',`${index*125}ms`);
    box.style.setProperty('--ci-impact-delay',`${180+index*125}ms`);
    box.style.setProperty('--ci-draw-delay',`${340+index*125}ms`);
    const impact=document.createElement('span');impact.className='ci-impact';box.appendChild(impact);
    const svg=el('svg',{viewBox:'0 0 120 120','aria-hidden':'true',focusable:'false'},box);
    const sigilKinds=['flame-a','flame-b','platform','hallows','glasses'];
    box.dataset.sigil=sigilKinds[index%sigilKinds.length];
    const create=(tag,attrs)=>el(tag,attrs,svg);
    const p100=(attrs)=>Object.assign({pathLength:'100'},attrs);

    create('circle',p100({cx:60,cy:60,r:48,class:'ci-ring-outer ci-draw'}));
    create('circle',p100({cx:60,cy:60,r:37,class:'ci-ring-inner ci-draw'}));

    if(index===0){
      create('path',p100({d:'M60 14 C52 25 45 34 46 46 C38 52 34 64 38 75 C43 90 53 100 60 103 C67 100 77 91 82 77 C86 66 83 54 74 47 C75 35 69 25 60 14 Z',class:'ci-rune-flame ci-draw'}));
      create('path',p100({d:'M60 35 C55 44 53 51 55 58 C49 63 49 72 54 78 C58 83 63 83 67 78 C72 72 71 63 65 58 C67 51 65 44 60 35 Z',class:'ci-rune-flame-inner ci-draw'}));
      create('path',p100({d:'M47 92 Q60 88 73 92',class:'ci-rune-detail ci-draw'}));
      create('path',p100({d:'M42 79 Q60 71 78 79',class:'ci-rune-detail ci-draw'}));
    }else if(index===1){
      create('path',p100({d:'M60 18 C64 30 74 35 77 47 C80 58 76 67 68 74 C76 81 78 92 71 100 C64 107 54 105 49 97 C43 88 46 79 54 73 C46 67 41 58 43 47 C45 35 56 29 60 18 Z',class:'ci-rune-flame ci-draw'}));
      create('path',p100({d:'M59 33 C62 42 68 46 67 54 C66 60 63 64 60 67 C56 64 53 60 52 54 C51 46 57 42 59 33 Z',class:'ci-rune-flame-inner ci-draw'}));
      create('path',p100({d:'M39 84 Q49 78 60 85 Q71 78 81 84',class:'ci-rune-detail ci-draw'}));
      create('path',p100({d:'M47 95 Q60 89 73 95',class:'ci-rune-detail ci-draw'}));
    }else if(index===2){
      create('circle',p100({cx:60,cy:58,r:24,class:'ci-rune-platform ci-draw'}));
      create('circle',p100({cx:60,cy:58,r:18,class:'ci-rune-platform ci-draw ci-rune-platform-inner'}));
      create('path',p100({d:'M60 82 V95 M49 95 H71',class:'ci-rune-platform ci-draw'}));
      create('text',{x:60,y:64,'text-anchor':'middle',class:'ci-rune-platform-text ci-draw'},svg).textContent='9¾';
      create('path',p100({d:'M45 29 Q60 21 75 29',class:'ci-rune-detail ci-draw'}));
    }else if(index===3){
      create('path',p100({d:'M60 22 L84 89 H36 Z',class:'ci-hallows ci-draw'}));
      create('circle',p100({cx:60,cy:63,r:15.4,class:'ci-hallows ci-draw ci-hallows-circle'}));
      create('path',p100({d:'M60 22 L60 89',class:'ci-hallows ci-draw ci-hallows-wand'}));
    }else{
      create('circle',p100({cx:44,cy:62,r:15,class:'ci-rune-glasses ci-draw'}));
      create('circle',p100({cx:76,cy:62,r:15,class:'ci-rune-glasses ci-draw'}));
      create('path',p100({d:'M59 62 H61',class:'ci-rune-glasses ci-draw'}));
      create('path',p100({d:'M29 60 Q35 52 42 53',class:'ci-rune-glasses ci-draw'}));
      create('path',p100({d:'M91 60 Q85 52 78 53',class:'ci-rune-glasses ci-draw'}));
      create('path',p100({d:'M57 28 L51 40 L58 38 L53 51',class:'ci-rune-scar ci-draw'}));
      create('path',p100({d:'M36 47 Q60 36 84 47',class:'ci-rune-detail ci-draw'}));
    }
    stage.appendChild(box);
  }
  function makeScene(button){
    const stage=document.createElement('div');stage.className='cronos-incendio-stage';
    stage.setAttribute('aria-hidden','true');
    const mist=document.createElement('div');mist.className='cronos-incendio-haze';stage.appendChild(mist);
    const w=window.innerWidth,h=window.innerHeight;
    const anchor=button.getBoundingClientRect(),centerX=anchor.left+anchor.width/2,centerY=anchor.top+anchor.height/2;
    const points=locationSeeds(w,h,button);
    const rays=el('svg',{class:'cronos-incendio-beams',viewBox:`0 0 ${w} ${h}`,'aria-hidden':'true',preserveAspectRatio:'none'},stage);
    points.forEach((p,i)=>{
      const sign=i%2?-1:1;
      const bendX=(centerX+p.x)/2+sign*number(w*.06,22,65);
      const bendY=(centerY+p.y)/2-number(h*.07,20,70);
      const glow=el('path',{d:`M${centerX.toFixed(1)},${centerY.toFixed(1)} Q${bendX.toFixed(1)},${bendY.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`,class:'cronos-incendio-beam cronos-incendio-beam-glow'},rays);
      const core=el('path',{d:`M${centerX.toFixed(1)},${centerY.toFixed(1)} Q${bendX.toFixed(1)},${bendY.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`,class:'cronos-incendio-beam cronos-incendio-beam-core'},rays);
      [glow,core].forEach(path=>{
        path.style.setProperty('--ci-path-length',String(Math.ceil(path.getTotalLength()+2)));
        path.style.setProperty('--ci-delay',`${i*125}ms`);
      });
      makeSigil(stage,p,i);
    });
    const rnd=randomGenerator(Math.round(centerX*113+centerY*79+DURATION)>>>0);
    // Brasas concentradas na origem e próximos dos glifos. Só existem durante o feitiço.
    const emit=(x,y,k)=>{
      const b=document.createElement('i');b.className='cronos-incendio-ember';
      b.style.setProperty('--ci-x',`${x.toFixed(2)}px`);
      b.style.setProperty('--ci-y',`${y.toFixed(2)}px`);
      b.style.setProperty('--ci-dx',`${((rnd()-.5)*(k===0?240:105)).toFixed(2)}px`);
      b.style.setProperty('--ci-dy',`${(-28-rnd()*(k===0?170:100)).toFixed(2)}px`);
      b.style.setProperty('--ci-life',`${Math.round(1200+rnd()*1600)}ms`);
      b.style.setProperty('--ci-delay',`${Math.round(k===0?rnd()*600:650+rnd()*1100)}ms`);
      b.style.setProperty('--ci-ember-size',`${(2.5+rnd()*4.5).toFixed(2)}px`);
      stage.appendChild(b);
    };
    for(let i=0;i<28;i++)emit(centerX+(rnd()-.5)*Math.min(anchor.width,90),centerY+(rnd()-.5)*12,0);
    points.forEach((p)=>{for(let i=0;i<7;i++)emit(p.x+(rnd()-.5)*16,p.y+(rnd()-.5)*16,1)});
    document.body.appendChild(stage);
    return stage;
  }
  function start(button){
    if(session||document.hidden||!button.isConnected)return;
    const current={button,abort:new AbortController(),timer:null,stage:null,audio:null};
    session=current;state.started++;state.active=true;state.lastFinish=null;
    button.classList.add('cronos-incendio-active');button.setAttribute('aria-busy','true');
    installSafeguards(current);
    try{
      const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if(!reduced)current.stage=makeScene(button);
      state.sceneCount=current.stage?1:0;
      // Início imediatamente após a montagem visual. Sem som no modo de movimento reduzido.
      if(!reduced)startSpellAudio(current);
      current.timer=window.setTimeout(()=>{if(session===current)teardown('complete')},reduced?450:DURATION);
    }catch(err){
      state.lastError=String(err?.message||err);
      teardown('scene-error');
    }
  }
  // Pré-buffer silencioso para reduzir atraso entre o clique e o primeiro estalo de fogo.
  primeSpellAudio();
  document.addEventListener('click',event=>{
    const button=event.target.closest?.(SELECTOR);
    if(!button)return;
    event.stopPropagation();
    start(button);
  });
})();
