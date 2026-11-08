/* ERP Motion — Glass Liquid Glass Edition | illumination control (presentation only).
 * No ERP preference contract, cloud API, localStorage or data path modified.
 * Manual selection is intentionally session-only; durable preference is a handoff for General.
 */
(() => {
  'use strict';
  const THEME='glassy-crm';
  const root=document.documentElement;
  const isGlass=()=>root.dataset.erpTheme===THEME;
  const localMode=()=>{const h=new Date().getHours();return h>=6&&h<18?'pearl':'obsidian';};
  let preference='auto';
  let interval=null;
  let control=null;
  let select=null;
  let wash=null;
  let washTimer=0;
  const atmospheres={
    pearl:'radial-gradient(ellipse 50% 42% at 15% 8%,rgba(204,230,253,.88),transparent 77%),radial-gradient(ellipse 41% 48% at 93% 3%,rgba(223,210,254,.74),transparent 82%),radial-gradient(ellipse 57% 48% at 72% 99%,rgba(247,221,238,.58),transparent 86%),linear-gradient(145deg,#f7f9fe,#edf4fc 54%,#f7f3fb)',
    obsidian:'radial-gradient(ellipse 47% 39% at 15% 8%,rgba(59,94,134,.3),transparent 74%),radial-gradient(ellipse 40% 45% at 94% 4%,rgba(92,71,156,.28),transparent 79%),radial-gradient(ellipse 55% 49% at 74% 98%,rgba(36,92,117,.24),transparent 81%),linear-gradient(145deg,#0c1423,#121c2c 53%,#101725)'
  };
  function disposeWash(){
    if(washTimer){clearTimeout(washTimer);washTimer=0;}
    wash?.remove();wash=null;
  }
  function crossfade(previous){
    disposeWash();
    const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if(reduce || root.dataset.erpEffects==='false' || document.hidden || !document.body)return;
    wash=document.createElement('div');wash.className='glass-light-wash';
    wash.style.background=atmospheres[previous];
    document.body.appendChild(wash);
    requestAnimationFrame(()=>{
      if(wash?.isConnected)wash.style.opacity='0';
    });
    washTimer=setTimeout(disposeWash,880);
  }
  function paint(){
    if(!isGlass())return;
    const next=preference==='auto'?localMode():preference;
    if(root.dataset.glassLight!==next){
      const previous=root.dataset.glassLight;
      root.dataset.glassLight=next;
      if(previous==='pearl'||previous==='obsidian')crossfade(previous);
    }
    if(select && select.value!==preference)select.value=preference;
    if(control){
      control.querySelector('.glass-light-symbol').textContent=next==='pearl'?'☼':'◐';
      control.title=preference==='auto'?'Iluminação automática pelo horário local':'Iluminação escolhida para esta sessão';
    }
  }
  function create(){
    if(control)return;
    const top=document.querySelector('.topbar');
    if(!top)return;
    control=document.createElement('label');
    control.className='glass-light-control';
    control.setAttribute('aria-label','Iluminação do tema Glass');
    control.innerHTML='<span class="glass-light-symbol" aria-hidden="true">☼</span><span class="glass-light-title">Iluminação</span><select aria-label="Escolher iluminação do Glass"><option value="auto">Automática</option><option value="pearl">Cristal Perolado</option><option value="obsidian">Obsidiana Noturna</option></select>';
    select=control.querySelector('select');
    select.value=preference;
    select.addEventListener('change',event=>{
      if(!['auto','pearl','obsidian'].includes(event.target.value))return;
      preference=event.target.value;
      paint();
    });
    const bar=top.querySelector('.cr-month-meta-bar');
    if(bar)bar.before(control);else top.append(control);
  }
  function stop(){if(interval!==null){clearInterval(interval);interval=null;}}
  function sync(){
    create();
    if(!isGlass()){stop();disposeWash();delete root.dataset.glassLight;return;}
    paint();
    if(interval===null)interval=setInterval(()=>{if(!document.hidden)paint();},30000);
  }
  document.addEventListener('erp:appearance-change',sync);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)paint();});
  window.addEventListener('focus',paint,{passive:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
})();
