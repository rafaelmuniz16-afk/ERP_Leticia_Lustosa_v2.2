/* CRONOS | ERP v2.2 — Incendio F01
   A cena é estritamente visual; montada somente após clique, desmontada em 3,8 s.
   Nenhuma chamada à rede, armazenamento, áudio ou acesso ao modelo de dados.
   Referência arquitetural: Revelio F08 (isolamento e limpeza da cena), desenho original. */
(()=>{
  'use strict';
  const SELECTOR='#cr-chrome .cronos-incendio-trigger';
  const NS='http://www.w3.org/2000/svg';
  const DURATION=3800;
  const state={started:0,finished:0,cancelled:0,active:false,lastFinish:null,sceneCount:0};
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
    const svg=el('svg',{viewBox:'0 0 120 120','aria-hidden':'true',focusable:'false'},box);
    el('circle',{cx:60,cy:60,r:48,class:'ci-ring-outer'},svg);
    el('circle',{cx:60,cy:60,r:39,class:'ci-ring-inner'},svg);
    el('circle',{cx:60,cy:60,r:29,opacity:'.54'},svg);
    for(let j=0;j<8;j++){
      const a=(j/8)*Math.PI*2;
      el('path',{d:`M ${60+35*Math.cos(a)} ${60+35*Math.sin(a)} L ${60+39*Math.cos(a+.11)} ${60+39*Math.sin(a+.11)}`,class:'ci-rune-spark'},svg);
    }
    if(index===1||index===4){
      // Chama alquímica: cinco movimentos do mesmo traço para evocar combustão.
      el('path',{d:'M60 30 C47 47 49 51 43 57 C33 73 43 90 60 93 C77 89 88 75 78 57 C76 68 69 68 70 58 C72 48 63 40 60 30 Z M59 58 C62 68 49 74 56 84 C64 88 69 79 65 71 C61 67 59 64 59 58 Z',class:'ci-rune-flame'},svg);
    }else if(index===2){
      // Sigilo geométrico das brasas, diferente dos sete símbolos da Revelio.
      el('path',{d:'M60 32 L82 75 L38 75 Z M60 39 L60 84 M43 63 L77 63 M51 84 Q60 91 69 84',class:'ci-rune-spark'},svg);
    }else{
      // Varinha geométrica e estrela solar.
      el('path',{d:'M41 80 L72 49 M68 45 L76 53 M77 27 L79 36 L88 39 L79 42 L77 51 L74 42 L65 39 L74 36 Z M36 43 L42 47 M41 34 L47 39 M81 77 L87 73',class:'ci-rune-spark'},svg);
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
      const path=el('path',{d:`M${centerX.toFixed(1)},${centerY.toFixed(1)} Q${bendX.toFixed(1)},${bendY.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`,class:'cronos-incendio-beam'},rays);
      path.style.setProperty('--ci-path-length',String(Math.ceil(path.getTotalLength()+2)));
      path.style.setProperty('--ci-delay',`${i*125}ms`);
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
    const current={button,abort:new AbortController(),timer:null,stage:null};
    session=current;state.started++;state.active=true;state.lastFinish=null;
    button.classList.add('cronos-incendio-active');button.setAttribute('aria-busy','true');
    installSafeguards(current);
    try{
      const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if(!reduced)current.stage=makeScene(button);
      state.sceneCount=current.stage?1:0;
      current.timer=window.setTimeout(()=>{if(session===current)teardown('complete')},reduced?450:DURATION);
    }catch(err){
      state.lastError=String(err?.message||err);
      teardown('scene-error');
    }
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest?.(SELECTOR);
    if(!button)return;
    event.stopPropagation();
    start(button);
  });
})();
