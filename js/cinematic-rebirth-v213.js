/* ==========================================================
 * ERP v2.1.3 — Cinematic Rebirth / presentation-only runtime
 * Eight Cinematic visual universes; Terror as an isolated Motion candidate.
 * WebGL atmospheric transition + Canvas scenery/particles + optional GSAP choreography.
 * Existing ERP calculations, sheets, actions and easter eggs are unchanged.
 * ========================================================== */
(() => {
  'use strict';
  const THEMES = new Set(['original', 'halloween', 'claro', 'escuro', 'natal', 'ano-novo', 'pascoa', 'festa-junina', 'terror', 'cyberpunk', 'glassy-crm']);
  const mediaReduce = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const $ = (id) => document.getElementById(id);
  const esc = (selector) => document.querySelector(selector);
  const theme = () => document.documentElement.dataset.erpTheme || 'original';
  const enabled = () => THEMES.has(theme());
  const allowMotion = () => !(mediaReduce?.matches || document.documentElement.dataset.erpEffects === 'false');
  const isDarkTheme = (t = theme()) => t === 'halloween' || t === 'escuro' || t === 'ano-novo' || t === 'terror' || t === 'cyberpunk';
  const file = (name) => `assets/rebirth/${name}`;
  const svg = (paths) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const icons = {
    search: svg('<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.5-4.5"/>'),
    refresh: svg('<path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M6 9a7 7 0 0 1 12-2l2 5M4 12l2 5a7 7 0 0 0 12-2"/>'),
    settings: svg('<circle cx="12" cy="12" r="3"/><path d="m19 13 2-1-2-1-.5-2 1-2-2-2-2 1-2-.5-1-2-1 2-2 .5-2-1-2 2 1 2-.5 2-2 1 2 1 .5 2-1 2 2 2 2-1 2 .5 1 2 1-2 2-.5 2 1 2-2-1-2Z"/>'),
    help: svg('<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.8 2.8 0 1 1 4.3 2.3c-1.3.9-1.8 1.4-1.8 2.7M12 17h.01"/>')
  };

  const THEME_META = {
    original: { titleWord: 'Unicórnio', fullTitle: 'Unicórnio', subtitle: 'Encerramentos 2026 · Seu universo de resultados e produtividade.', caption: 'O encanto de cada conquista ✦', asset: 'unicorn-mascot.svg', portalCaption: 'Um pouco de magia para você', mascotSelector: '.unicorn-mascot' },
    halloween: { titleWord: 'Halloween', fullTitle: 'Halloween', subtitle: 'Encerramentos 2026 · Seu universo de resultados e produtividade.', caption: 'Uma noite cheia de mistérios ✦', asset: 'pumpkin.svg', portalCaption: 'A noite ganha vida', mascotSelector: '.pumpkin-mascot' },
    claro: { titleWord: 'Luminous', fullTitle: 'Luminous', subtitle: 'Encerramentos 2026 · Clareza, leveza e produtividade em foco.', caption: 'Clareza para cada conquista ✦', asset: 'light-mascot.svg', portalCaption: 'Tudo fica mais leve por aqui', mascotSelector: '.gemini-mascot' },
    escuro: { titleWord: 'Midnight', fullTitle: 'Midnight', subtitle: 'Encerramentos 2026 · Elegância, foco e profundidade operacional.', caption: 'O brilho calmo de cada insight ✦', asset: 'dark-mascot.svg', portalCaption: 'O universo escuro desperta', mascotSelector: '.gemini-mascot' },
    natal: { titleWord: 'Natal', fullTitle: 'Natal', subtitle: 'Encerramentos 2026 · Magia, aconchego e produtividade natalina.', caption: 'A magia de cada conquista ✦', asset: 'christmas-mascot.svg', portalCaption: 'Neve, estrelas e Papai Noel', mascotSelector: '.santa-mascot' },
    'ano-novo': { titleWord: 'Celestial', fullTitle: 'Celestial', subtitle: 'Encerramentos 2026 · Brilho, metas e energia de recomeço.', caption: 'Um brinde a cada conquista ✦', asset: 'newyear-mascot-v3.svg', portalCaption: 'A virada acende o horizonte', mascotSelector: '.toast-mascot' },
    pascoa: { titleWord: 'Páscoa', fullTitle: 'Páscoa', subtitle: 'Encerramentos 2026 · Doçura, recomeços e um easter egg espetacular.', caption: 'Um jardim de ovos encantados ✦', asset: 'easter-bunny-mascot.svg', portalCaption: 'A caça aos ovos começou', mascotSelector: '.bunny-mascot' },
    'festa-junina': { titleWord: 'Arraiá', fullTitle: 'Arraiá', subtitle: 'Encerramentos 2026 · Forró, encanto e grandes conquistas.', caption: 'O arraiá das suas conquistas ✦', asset: 'junina-mascot.svg', portalCaption: 'Anarriê! O arraiá vai começar', mascotSelector: '.junina-mascot' },
    cyberpunk: { titleWord: 'Cyberpunk', fullTitle: 'Cyberpunk', subtitle: 'Encerramentos 2026 · Entre neon, dados e futuros possíveis.', caption: 'KIRA-09 · Seu elo com a cidade digital', asset: 'cyberpunk-kira09-v2.svg', portalCaption: 'A cidade digital reconheceu sua assinatura', mascotSelector: '.cyber-mascot' },
    'glassy-crm': { titleWord: 'Glass', fullTitle: 'Glass', subtitle: 'Encerramentos 2026 · Luz, cristal e precisão em cada conquista.', caption: 'MIRA · Guardiã do cristal ✧', asset: 'glass-mira-companion.svg', portalCaption: 'A luz transforma cada conquista', mascotSelector: '.glassy-mascot' },
    terror: { titleWord: 'Nocturne', fullTitle: 'Nocturne', subtitle: 'Encerramentos 2026 · Um olhar além do visível.', caption: 'O abismo observa suas conquistas', asset: 'terror-eye-mascot.svg', portalCaption: 'O olho se abriu. A escuridão observa.', mascotSelector: '.eye-mascot' }
  };
  const getThemeMeta = (key = theme()) => THEME_META[key] || THEME_META.original;

  const clearMascotCaptionTimer = () => {
    if (mascotCaptionTimer) {
      clearInterval(mascotCaptionTimer);
      mascotCaptionTimer = null;
    }
  };

  function formatNewYearCountdown() {
    const target = new Date(2027, 0, 1, 0, 0, 0, 0);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return 'Feliz Ano Novo! ✨';
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `Faltam ${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }

  function refreshMascotCaption(nextTheme) {
    const house = $('cr-mascot-house');
    const caption = house?.querySelector('.cr-mascot-caption');
    if (!caption) return;
    clearMascotCaptionTimer();
    caption.classList.toggle('is-countdown', nextTheme === 'ano-novo');
    if (nextTheme === 'ano-novo') {
      const tick = () => {
        caption.textContent = formatNewYearCountdown();
      };
      tick();
      mascotCaptionTimer = window.setInterval(tick, 1000);
      return;
    }
    caption.textContent = getThemeMeta(nextTheme).caption;
  }

  let previousTheme = theme();
  let stopPortal = null;
  let ambientAnimation = null;
  let mascotCaptionTimer = null;
  let scrollObserver = null;
  let entryAnim = null;
  let frameTimer = null;
  let touchInitialized = false;
  const addedOrnaments = [];

  function createChrome() {
    if ($('cr-chrome')) return;
    const chrome = document.createElement('header');
    chrome.id = 'cr-chrome';
    chrome.innerHTML = `
      <div class="cr-logo" aria-label="ERP Letícia Lustosa v2.2 - Cinematic Rebirth"><span class="cr-logo-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="cr-logo-text"><span class="cr-logo-main">ERP Letícia Lustosa</span> <span class="cr-logo-version">v2.2 - Cinematic Rebirth</span></span></div>
      <button class="cr-top-search" type="button" id="cr-search" aria-label="Pesquisar processos e casos">${icons.search}<span>Pesquisar no seu universo...</span></button>
      <div class="cr-chrome-spacer"></div>
      <div class="cr-nav-actions">
       <button class="cr-tool" id="cr-refresh" type="button" aria-label="Atualizar dados" title="Atualizar dados">${icons.refresh}</button>
       <button class="cr-tool" id="cr-pref" type="button" aria-label="Configurações" title="Configurações">${icons.settings}</button>
       <div class="cr-user"><span>Letícia</span><span class="cr-avatar">L</span></div>
      </div>`;
    document.body.insertBefore(chrome, document.body.firstChild);
    $('cr-search').addEventListener('click', () => {
      if (THEMES.has(theme()) && typeof window.erpOpenHistoryModal === 'function') {
        window.erpOpenHistoryModal({focusSearch:true});
        return;
      }
      const search = $('searchInput');
      search?.scrollIntoView({block:'center',behavior:allowMotion()?'smooth':'instant'});
      search?.focus({preventScroll:true});
    });
    $('cr-refresh').addEventListener('click', () => $('btnRefresh')?.click());
    $('cr-pref').addEventListener('click', () => $('erp-open-settings-top')?.click());
    const sidebar = esc('.sidebar');
    if (sidebar && !$('cr-mascot-house')) {
      const house = document.createElement('div');
      house.id = 'cr-mascot-house';
      house.innerHTML = '<span class="cr-mascot-caption">Um universo só seu ✦</span>';
      const brand = sidebar.querySelector('.brand');
      brand ? brand.insertAdjacentElement('afterend', house) : sidebar.prepend(house);
    }
    const topbar = esc('.topbar');
    if (topbar && !$('cr-theme-picker')) {
      const picker = document.createElement('label');
      picker.id = 'cr-theme-picker';
      picker.innerHTML = '<select id="cr-theme-choice" aria-label="Escolher tema da ERP"><option value="original">🦄 Unicórnio</option><option value="claro">☀️ Luminous</option><option value="escuro">🌙 Midnight</option><option value="natal">🎄 Natal</option><option value="ano-novo">✨ Celestial</option><option value="pascoa">🥚 Páscoa</option><option value="halloween">🎃 Halloween</option><option value="festa-junina">🌽 Arraiá</option><option value="terror">◉ Nocturne</option><option value="cyberpunk">⚡️ Cyberpunk</option><option value="glassy-crm">◈ Glass</option></select>';
      topbar.appendChild(picker);
      $('cr-theme-choice').addEventListener('change', (event) => {
        const next = event.currentTarget.value;
        // Todos os 11 temas são selecionados aqui, inclusive Glass.
        // THEMES identifica somente os dez universos Cinematic e não limita o registro.
        if (window.ERPTheme?.themes[next]) window.ERPTheme.apply({...window.ERPTheme.state, theme:next});
      });
    }
    if (!$('cr-portal')) {
      const portal = document.createElement('div');
      portal.id = 'cr-portal';portal.setAttribute('aria-hidden','true');
      portal.innerHTML = `<canvas class="cr-gpu-cloud"></canvas><canvas class="cr-motion-layer"></canvas><div class="cr-vignette"></div><img class="cr-portal-sleigh" src="${file('christmas-sleigh.svg')}" alt="" aria-hidden="true"><div class="cr-portal-logo"><img src="${file('unicorn-mascot.svg')}" alt=""><div class="cr-portal-title">Unicorn Theme</div><div class="cr-portal-caption">Seu universo está nascendo</div></div>`;
      document.body.appendChild(portal);
    }
  }

  function relocateMascot(nextTheme) {
    const house = $('cr-mascot-house');
    if (!house) return;
    const meta = getThemeMeta(nextTheme);
    const selector = meta.mascotSelector;
    const source = THEMES.has(nextTheme) ? $('erp-theme-visuals')?.querySelector(selector) : null;
    for(const old of house.querySelectorAll('.unicorn-mascot,.pumpkin-mascot,.gemini-mascot,.santa-mascot,.toast-mascot,.bunny-mascot,.junina-mascot,.eye-mascot,.cyber-mascot,.glassy-mascot')) {
      if (!THEMES.has(nextTheme) || (source && old !== source) || !old.matches(selector)) old.remove();
    }
    if (!THEMES.has(nextTheme)) return;
    if (source) house.insertBefore(source, house.querySelector('.cr-mascot-caption'));
    refreshMascotCaption(nextTheme);
  }

  function updateTitle(nextTheme) {
    if (!THEMES.has(nextTheme)) return;
    const node = esc('.topbar .page-title');
    if (!node) return;
    const meta = getThemeMeta(nextTheme);
    const main = document.createElement('span');
    main.className = 'cr-head-accent';
    main.textContent = meta.titleWord;
    node.replaceChildren(main);
    const sub = esc('.topbar .page-subtitle');
    if (sub) sub.textContent = meta.subtitle;
  }

  function addDecoration(target, name, className) {
    if (!target || target.querySelector(`.cr-orbital-illustration.${className}`)) return;
    const el = document.createElement('span');
    el.className = `cr-orbital-illustration ${className}`;
    el.setAttribute('aria-hidden','true');
    target.appendChild(el);
    addedOrnaments.push(el);
  }

  function applyOrnaments(nextTheme) {
    for (const item of addedOrnaments) item.remove();
    addedOrnaments.length = 0;
    if (!THEMES.has(nextTheme)) return;
    const linePanel = esc('.analytics-section > .panel:first-child');
    const donutPanel = esc('#cadastro > .panel:first-child');
    const summary = esc('.analytics-section > .panel:last-child');
    const history = $('historico');
    if (nextTheme === 'original') {
      addDecoration(linePanel, 'rainbow', 'cr-rainbow');
      addDecoration(donutPanel, 'rainbow', 'cr-rainbow');
      addDecoration(summary, 'rainbow', 'cr-rainbow');
    } else if (nextTheme === 'claro') {
      addDecoration(linePanel, 'sunburst', 'cr-sunburst');
      addDecoration(donutPanel, 'prism', 'cr-prism');
      addDecoration(summary, 'comet', 'cr-comet');
      addDecoration(history, 'sparkles', 'cr-sparkles');
    } else if (nextTheme === 'escuro') {
      addDecoration(linePanel, 'moon', 'cr-moon');
      addDecoration(donutPanel, 'constellation', 'cr-constellation');
      addDecoration(summary, 'orbit', 'cr-orbit');
      addDecoration(history, 'startrail', 'cr-startrail');
    } else if (nextTheme === 'natal') {
      // Ilustrações natalinas exclusivas: nenhuma arte de outros temas.
      addDecoration(linePanel, 'christmas-tree', 'cr-christmas-tree');
      addDecoration(donutPanel, 'christmas-hat', 'cr-christmas-hat');
      addDecoration(summary, 'christmas-star', 'cr-christmas-star');
      addDecoration(history, 'christmas-snow', 'cr-christmas-snow');
    } else if (nextTheme === 'ano-novo') {
      addDecoration(linePanel, 'fireworks', 'cr-fireworks');
      addDecoration(donutPanel, 'champagne', 'cr-champagne');
      addDecoration(summary, 'confetti', 'cr-confetti');
      addDecoration(history, 'midnightclock', 'cr-midnight-clock');
    } else if (nextTheme === 'pascoa') {
      addDecoration(linePanel, 'eggs', 'cr-es-eggs');
      addDecoration(donutPanel, 'basket', 'cr-es-basket');
      addDecoration(summary, 'blossom', 'cr-es-blossom');
      addDecoration(history, 'ribbon', 'cr-es-ribbon');
    } else if (nextTheme === 'festa-junina') {
      addDecoration(linePanel, 'bunting', 'cr-jn-bunting');
      addDecoration(linePanel, 'fireflies', 'cr-jn-spark');
      addDecoration(donutPanel, 'lantern', 'cr-jn-lantern');
      addDecoration(summary, 'bonfire', 'cr-jn-fire');
      addDecoration(summary, 'fireflies', 'cr-jn-spark');
      addDecoration(history, 'accordion', 'cr-jn-accordion');
    } else if (nextTheme === 'cyberpunk') {
      addDecoration(linePanel, 'circuit', 'cr-cy-circuit');
      addDecoration(donutPanel, 'chip', 'cr-cy-chip');
      addDecoration(summary, 'holo', 'cr-cy-diamond');
      addDecoration(history, 'circuit', 'cr-cy-circuit');
    } else if (nextTheme === 'terror') {
      addDecoration(linePanel, 'watcher', 'cr-tr-watcher');
      addDecoration(linePanel, 'veil', 'cr-tr-veil');
      addDecoration(donutPanel, 'seal', 'cr-tr-seal');
      addDecoration(summary, 'hourglass', 'cr-tr-hourglass');
      addDecoration(history, 'runes', 'cr-tr-runes');
    } else if (nextTheme === 'halloween') {
      addDecoration(linePanel, 'ghost', 'cr-ghost');
      addDecoration(linePanel, 'web', 'cr-web');
      addDecoration(donutPanel, 'pumpkin', 'cr-pumpkin');
      addDecoration(donutPanel, 'graveyard', 'cr-tombstones');
      addDecoration(summary, 'bat', 'cr-panel-bat');
      addDecoration(history, 'web', 'cr-web');
    }
  }

  function animateEntrance(nextTheme) {
    if (!THEMES.has(nextTheme) || !allowMotion()) return;
    const targets = [esc('.topbar'), esc('.filters'), esc('.analytics-section>.panel:first-child'), esc('#cadastro>.panel:first-child'), esc('.kpi-grid'), esc('.status'), esc('.analytics-section>.panel:last-child')].filter(Boolean);
    if (window.gsap) {
      entryAnim?.kill?.();
      entryAnim = gsap.fromTo(targets, {autoAlpha:0, y:28, scale:.975, filter:'blur(5px)'}, {autoAlpha:1, y:0, scale:1, filter:'blur(0px)', duration:.75, stagger:.055, ease:'power3.out', clearProps:'opacity,visibility,transform,filter'});
    } else {
      targets.forEach((node,i) => node.animate([{opacity:0,transform:'translateY(20px) scale(.985)',filter:'blur(4px)'},{opacity:1,transform:'translateY(0) scale(1)',filter:'blur(0)'}],{duration:680,delay:i*45,easing:'cubic-bezier(.18,.84,.23,1)'}));
    }
  }

  /* GPU shader. It generates volumetric-looking fBm clouds without altering dashboard charts. */
  const vertexShader = `attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.0,1.0);}`;
  const fragmentShader = `
precision mediump float;
uniform vec2 u_resolution;uniform float u_time;uniform float u_progress;uniform float u_theme;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.55;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.06+vec2(12.8,8.4);a*=.48;}return v;}
void main(){
 vec2 uv=gl_FragCoord.xy/u_resolution;vec2 q=uv; q.x*=u_resolution.x/u_resolution.y;
 float t=u_time;
 float n=fbm(q*3.5+vec2(t*.16,-t*.10));
 float n2=fbm(q*6.4-vec2(t*.21,t*.07)+n*.45);
 float vortex=sin(q.x*3.9+q.y*4.1+n*4.5-t*2.0)*.11;
 float sweep=mix(-.18,1.5,smoothstep(.0,.85,u_progress));
 float front=1.-smoothstep(sweep-.50,sweep+.17,uv.x+n*.27+vortex);
 float retreat=1.-smoothstep(.68,1.0,u_progress);
 float appear=smoothstep(.02,.26,u_progress);
 float density=smoothstep(.28,.78,n*.9+n2*.65+vortex+.25)*front;
 density*=appear*min(1.,retreat*3.2+0.03);
 vec3 purple=vec3(.35,.12,.56),magenta=vec3(.63,.25,.68),orange=vec3(.98,.34,.12);
 vec3 lavender=vec3(.77,.53,.95),pink=vec3(1.,.65,.85),sky=vec3(.77,.85,1.);
 vec3 darkColor=mix(purple,magenta,clamp(n2*1.3,0.,1.));darkColor=mix(darkColor,orange,smoothstep(.63,.92,n+n2*.3)*.32);
 vec3 lightColor=mix(lavender,pink,clamp(n*.9,0.,1.));lightColor=mix(lightColor,sky,n2*.48);
 vec3 clearColor=mix(vec3(.42,.79,1.),vec3(.73,.57,.99),clamp(n*.96,0.,1.));
 clearColor=mix(clearColor,vec3(1.,.91,.67),smoothstep(.63,.96,n2)*.34);
 vec3 midnightColor=mix(vec3(.055,.17,.43),vec3(.22,.18,.61),clamp(n2,0.,1.));
 midnightColor=mix(midnightColor,vec3(.19,.72,1.),smoothstep(.56,.9,n+n2*.18)*.28);
 vec3 christmasColor=mix(vec3(.76,.10,.24),vec3(.12,.45,.25),clamp(n2*.88,0.,1.));
 christmasColor=mix(christmasColor,vec3(.96,.83,.42),smoothstep(.55,.92,n+n2*.28)*.30);
 vec3 newYearColor=mix(vec3(.06,.12,.27),vec3(.12,.35,.58),clamp(n2*.9,0.,1.));
 newYearColor=mix(newYearColor,vec3(.96,.82,.45),smoothstep(.58,.94,n+n2*.24)*.34);
 vec3 easterColor=mix(vec3(1.,.81,.88),vec3(.80,.90,1.),clamp(n2*.88,0.,1.));
 easterColor=mix(easterColor,vec3(1.,.94,.67),smoothstep(.56,.92,n+n2*.22)*.34);
 vec3 juninaColor=mix(vec3(.52,.24,.15),vec3(.92,.51,.24),clamp(n2*.9,0.,1.));
 juninaColor=mix(juninaColor,vec3(.19,.56,.39),smoothstep(.55,.90,n+n2*.18)*.45);
 vec3 terrorColor=mix(vec3(.10,.025,.09),vec3(.53,.09,.18),clamp(n2*1.20,0.,1.));
 terrorColor=mix(terrorColor,vec3(.54,.30,.46),smoothstep(.66,.97,n+n2*.2)*.28);
 vec3 color=lightColor;
 if(u_theme>7.5) color=easterColor;
 else if(u_theme>6.5) color=terrorColor;
 else if(u_theme>5.5) color=juninaColor;
 else if(u_theme>4.5) color=newYearColor;
 else if(u_theme>3.5) color=christmasColor;
 else if(u_theme>2.5) color=midnightColor;
 else if(u_theme>1.5) color=clearColor;
 else if(u_theme>.5) color=darkColor;
 float alpha=density*.95;
 alpha*=retreat*.85+.15;
 gl_FragColor=vec4(color,clamp(alpha,0.,.91));
}`;

  function createGPU(canvas) {
    try {
      const gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false});
      if (!gl) return null;
      const shader=(type,source) => {
        const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
        if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;
      };
      const prog=gl.createProgram();gl.attachShader(prog,shader(gl.VERTEX_SHADER,vertexShader));gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,fragmentShader));gl.linkProgram(prog);
      if(!gl.getProgramParameter(prog,gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(prog));
      gl.useProgram(prog);
      const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
      const loc=gl.getAttribLocation(prog,'a_position');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
      const resolution=gl.getUniformLocation(prog,'u_resolution'),time=gl.getUniformLocation(prog,'u_time'),progress=gl.getUniformLocation(prog,'u_progress'),themeLoc=gl.getUniformLocation(prog,'u_theme');
      const dpr=Math.min(1.5,window.devicePixelRatio||1);canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);
      gl.viewport(0,0,canvas.width,canvas.height);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      return {draw(t,p,themeKey){gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform2f(resolution,canvas.width,canvas.height);gl.uniform1f(time,t);gl.uniform1f(progress,p);gl.uniform1f(themeLoc,({original:0,halloween:1,claro:2,escuro:3,natal:4,'ano-novo':5,'festa-junina':6,terror:7,pascoa:8})[themeKey]??0);gl.drawArrays(gl.TRIANGLES,0,6);},dispose(){gl.deleteBuffer(buffer);gl.deleteProgram(prog)}};
    } catch(e){return null;}
  }

  function drawBat(ctx,x,y,r,t,i,opacity) {
    const flap=Math.sin(t*19+i*.9)*.38;
    ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t*2+i)*.11);ctx.scale(r,r);ctx.globalAlpha=opacity;ctx.fillStyle='#0a0910';
    ctx.beginPath();ctx.moveTo(0,.13);ctx.lineTo(-.13,-.06);
    ctx.bezierCurveTo(-.43,-.34-flap,-.63,-.72-flap,-1.1,-.50-flap);
    ctx.quadraticCurveTo(-.9,-.20-flap,-.86,.18);ctx.quadraticCurveTo(-.56,-.02,-.35,.23);ctx.lineTo(0,.13);
    ctx.lineTo(.35,.23);ctx.quadraticCurveTo(.56,-.02,.86,.18);
    ctx.quadraticCurveTo(.9,-.2-flap,1.1,-.5-flap);ctx.bezierCurveTo(.63,-.72-flap,.43,-.34-flap,.13,-.06);ctx.closePath();ctx.fill();ctx.restore();
  }
  function drawSpark(ctx,x,y,r,color,alpha) {
    ctx.save();ctx.translate(x,y);ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.beginPath();
    ctx.moveTo(0,-r);ctx.quadraticCurveTo(r*.25,-r*.2,r,0);ctx.quadraticCurveTo(r*.22,r*.25,0,r);
    ctx.quadraticCurveTo(-r*.25,r*.2,-r,0);ctx.quadraticCurveTo(-r*.22,-r*.25,0,-r);ctx.fill();ctx.restore();
  }
  // Claro: sunrise and prismatic rays, designed independently of the unicorn transition.
  function drawLuminousTransition(ctx,W,H,p,opacity) {
    const ease=p*p*(3-2*p);
    const cx=W*(.18+ease*.54),cy=H*(.63-ease*.38),R=Math.min(W,H)*(.13+.18*p);
    ctx.save();ctx.globalCompositeOperation='screen';
    const glow=ctx.createRadialGradient(cx,cy,4,cx,cy,R*2.25);
    glow.addColorStop(0,`rgba(255,255,238,${opacity*.87})`);
    glow.addColorStop(.24,`rgba(255,225,161,${opacity*.32})`);
    glow.addColorStop(.58,`rgba(115,202,255,${opacity*.14})`);
    glow.addColorStop(1,'rgba(115,202,255,0)');
    ctx.fillStyle=glow;ctx.fillRect(cx-R*2.5,cy-R*2.5,R*5,R*5);
    for(let i=0;i<16;i++) {
      const a=i*Math.PI/8+p*.7,len=R*(.9+(i%3)*.17);
      ctx.save();ctx.translate(cx,cy);ctx.rotate(a);ctx.beginPath();ctx.moveTo(R*.64,0);ctx.lineTo(len*2.5,0);
      ctx.strokeStyle=i%2===0?`rgba(133,218,255,${opacity*.48})`:`rgba(255,239,194,${opacity*.45})`;
      ctx.lineWidth=i%3===0?2.8:1.3;ctx.shadowBlur=12;ctx.shadowColor='#b8dcff';ctx.stroke();ctx.restore();
    }
    ctx.globalCompositeOperation='source-over';
    for(let j=0;j<4;j++) {
      const band=R*(.92+j*.17);
      ctx.beginPath();ctx.ellipse(cx,cy,band*1.45,band*.38,-.2-p*.15,Math.PI*.17,Math.PI*1.23);
      ctx.strokeStyle=['#8bcafa','#b2a4ff','#efbdfb','#fae1aa'][j];ctx.globalAlpha=opacity*.44;
      ctx.lineWidth=2.2;ctx.stroke();
    }
    for(let i=0;i<38;i++) {
      const a=i*2.3999632+p*2.5,dist=R*(.65+((i*7)%19)/12+p*2.1);
      const x=cx+Math.cos(a)*dist*1.45,y=cy+Math.sin(a)*dist*.8;
      const r=2+(i%5)*.8;
      drawSpark(ctx,x,y,r,['#ffffff','#ffe8ad','#92d7ff','#d9baff'][i%4],opacity*.88);
    }
    ctx.restore();
  }

  // Escuro: moonlight, orbit rings and interconnected constellations.
  // No bats, no pumpkin smoke, and no recycled Halloween choreography.
  function drawMidnightTransition(ctx,W,H,p,opacity) {
    const cx=W*(.53+Math.sin(p*2.6)*.035),cy=H*.47,R=Math.min(W,H)*(.115+.11*Math.sin(Math.PI*p));
    ctx.save();ctx.globalCompositeOperation='screen';
    const aura=ctx.createRadialGradient(cx,cy,R*.1,cx,cy,R*2.5);
    aura.addColorStop(0,`rgba(203,229,255,${opacity*.38})`);
    aura.addColorStop(.27,`rgba(80,175,255,${opacity*.22})`);
    aura.addColorStop(.65,`rgba(114,86,255,${opacity*.16})`);
    aura.addColorStop(1,'rgba(50,52,140,0)');
    ctx.fillStyle=aura;ctx.fillRect(cx-R*2.5,cy-R*2.5,R*5,R*5);
    ctx.globalCompositeOperation='source-over';
    ctx.save();ctx.globalAlpha=opacity*.96;ctx.fillStyle='#e3efff';ctx.shadowColor='#76c8ff';ctx.shadowBlur=27;
    ctx.beginPath();ctx.arc(cx,cy,R*.7,0,Math.PI*2);
    ctx.moveTo(cx+R*.28+R*.64,cy-R*.24);
    ctx.arc(cx+R*.28,cy-R*.24,R*.64,0,Math.PI*2,true);
    ctx.fill('evenodd');ctx.restore();
    ctx.lineWidth=1.3;
    for(let orbit=0;orbit<3;orbit++){
      const angle=.18+orbit*.5+p*.16,radius=R*(1.32+orbit*.38);
      ctx.save();ctx.translate(cx,cy);ctx.rotate(angle);
      ctx.beginPath();ctx.ellipse(0,0,radius,radius*.34,0,0,Math.PI*2);
      ctx.strokeStyle=orbit%2===0?`rgba(116,207,255,${opacity*.63})`:`rgba(178,141,255,${opacity*.55})`;
      ctx.shadowColor='#7d9aff';ctx.shadowBlur=9;ctx.stroke();ctx.restore();
    }
    for(let g=0;g<5;g++){
      const points=[];
      for(let i=0;i<5;i++){
        const u=(g*61+i*47+9)%101/100,v=(g*37+i*31+12)%107/106;
        const x=W*(.06+.88*u)+Math.sin(p*6+g+i)*7;
        const y=H*(.1+.78*v)+Math.cos(p*5+g+i)*7;
        points.push([x,y]);
      }
      ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
      for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
      ctx.strokeStyle=`rgba(115,197,255,${opacity*.23})`;ctx.lineWidth=1.2;ctx.stroke();
      for(const [x,y] of points){drawSpark(ctx,x,y,2.5,'#c1ecff',opacity*.87)}
    }
    for(let i=0;i<42;i++){
      const x=W*((i*47%101)/100),y=H*((i*29%97)/96);
      const size=1.6+(i%5)*.75;
      drawSpark(ctx,x,y,size,['#dff6ff','#8ac7ff','#b39bff'][i%3],opacity*(.35+(i%3)*.19));
    }
    ctx.restore();
  }


function drawChristmasTransition(ctx,W,H,p,opacity) {
  // Snowfall, starlight and a Christmas sleigh (separate SVG in the portal).
  // No rainbow arcs: the Christmas universe has its own choreography.
  ctx.save();
  const shade = ctx.createLinearGradient(0,0,0,H);
  shade.addColorStop(0,`rgba(12,42,58,${opacity*.44})`);
  shade.addColorStop(.56,`rgba(20,83,73,${opacity*.29})`);
  shade.addColorStop(1,`rgba(249,252,244,${opacity*.12})`);
  ctx.fillStyle=shade; ctx.fillRect(0,0,W,H);
  const glow=ctx.createRadialGradient(W*.53,H*.24,0,W*.53,H*.24,Math.max(W,H)*.58);
  glow.addColorStop(0,`rgba(251,248,215,${opacity*.34})`);
  glow.addColorStop(.52,`rgba(226,244,243,${opacity*.12})`);
  glow.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);

  // Reproducible per-snowflake drift (no random state or flashing each frame).
  for(let i=0;i<110;i++){
    const sx=((i*73+29)%113)/113 * W;
    const sy=((i*41+17)%109)/109 * (H+80);
    const phase=(p*(.66+(i%7)*.036)+i*.033)%1;
    const y=(sy+phase*H*1.3)%(H+80)-40;
    const x=sx+Math.sin(p*7+i*.77)*(7+(i%4)*4);
    const radius=(i%9===0?3.5:1.2)+(i%4)*.36;
    ctx.globalAlpha=opacity*(.38+(i%5)*.1);
    ctx.fillStyle=i%5===0?'#ffefbf':'#fff';
    ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();
    if(i%14===0){ctx.lineWidth=1.05;ctx.strokeStyle='#fff';
      ctx.beginPath();ctx.moveTo(x-radius*2.4,y);ctx.lineTo(x+radius*2.4,y);
      ctx.moveTo(x,y-radius*2.4);ctx.lineTo(x,y+radius*2.4);ctx.stroke();}
  }

  // A few golden stars twinkle at different times, rather than a prism/rainbow.
  for(let i=0;i<16;i++){
    const x=W*(.075+((i*23)%85)/100),y=H*(.10+((i*19)%62)/100);
    drawSpark(ctx,x,y,2.5+(i%3)*1.3,i%3===0?'#fff6cb':'#ffffff',opacity*(.55+.25*Math.sin(p*12+i)));
  }
  ctx.restore();
}

function drawNewYearTransition(ctx,W,H,p,opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  const glow = ctx.createRadialGradient(W*.5,H*.5,0,W*.5,H*.5,Math.max(W,H)*.5);
  glow.addColorStop(0,'rgba(245,209,121,.24)');
  glow.addColorStop(.34,'rgba(114,162,255,.14)');
  glow.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle = glow;ctx.fillRect(0,0,W,H);
  for(let i=0;i<7;i++){
    const burst=(p*1.08 + i*.11)%1;
    const x=W*(.16 + (i%4)*.2 + (i>3?.08:0));
    const y=H*(.18 + (i%3)*.15);
    for(let r=0;r<18;r++){
      const a=Math.PI*2*r/18 + i*.1;
      const len=(14 + burst*52 + (r%3)*7);
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*len,y+Math.sin(a)*len);
      ctx.strokeStyle=['#ffe8a1','#f7c95d','#7ed3ff','#ffffff','#d7b4ff'][r%5];
      ctx.lineWidth = r%4===0 ? 2.2 : 1.3; ctx.stroke();
    }
    drawSpark(ctx,x,y,4.4,'#ffffff',opacity);
  }
  for(let i=0;i<64;i++){
    const x=W*((i*37%103)/102), y=H*((i*29%101)/100);
    const sway=Math.sin(p*10+i)*10;
    ctx.save(); ctx.translate(x+sway*.2,y + ((p*200+i*7)%220)-80); ctx.rotate((p*3+i)*.4);
    ctx.fillStyle=['rgba(255,226,154,.8)','rgba(255,255,255,.82)','rgba(126,211,255,.72)','rgba(218,180,255,.75)'][i%4];
    ctx.fillRect(-2.2,-1.2,4.4,2.4); ctx.restore();
  }
  ctx.restore();
}

  /** São João: original illustrated stage. No bitmap or assets downloaded per frame.
   *  All objects are deterministic and disappear with the existing portal RAF cleanup. */
  function drawJuninaTransition(ctx,W,H,p,opacity) {
    ctx.save();
    const fade=Math.max(0,opacity);
    ctx.globalAlpha=fade;
    const backdrop=ctx.createLinearGradient(0,0,0,H);
    backdrop.addColorStop(0,'rgba(41,54,74,.69)');
    backdrop.addColorStop(.55,'rgba(101,65,54,.55)');
    backdrop.addColorStop(1,'rgba(155,77,41,.4)');
    ctx.fillStyle=backdrop;ctx.fillRect(0,0,W,H);
    // Warm stage spotlights fan outward, with a soft green complementary edge.
    for (let i=0;i<4;i++) {
      const x=W*(.12+i*.26),y=H*(.06+(i%2)*.04);
      const beam=ctx.createRadialGradient(x,y,5,x,H*.82,H*.94);
      beam.addColorStop(0,`rgba(${i%2?'255,214,137':'125,200,156'},${fade*.42})`);
      beam.addColorStop(.28,`rgba(${i%2?'255,191,99':'88,171,119'},${fade*.13})`);
      beam.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=beam;ctx.fillRect(0,0,W,H);
    }
    // Eight strings of pennants, each anchored to its own sweeping cord.
    for(let row=0;row<3;row++){
      const baseY=H*(.095+row*.105),sway=Math.sin(p*7+row*.7)*7;
      ctx.beginPath();ctx.moveTo(-20,baseY+8);
      ctx.quadraticCurveTo(W*.48,baseY+H*.085+sway,W+20,baseY-2);
      ctx.strokeStyle=`rgba(255,223,167,${fade*.68})`;ctx.lineWidth=1.8;ctx.stroke();
      const n=Math.min(28,Math.max(10,Math.round(W/55)));
      for(let i=0;i<n;i++) {
        const k=(i+.45)/n,x=k*W;
        const y=baseY+H*.085*4*k*(1-k)+sway*Math.sin(k*Math.PI);
        const flutter=Math.sin(p*11+i*.84+row)*3;
        ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(p*6+i*.67)*.055);
        ctx.fillStyle=['#f47e5c','#ecc16a','#6ac7a3','#86b4da','#d59ac7'][((i+row*2)%5)];
        ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(10,0);ctx.lineTo(10+flutter,27);
        ctx.lineTo(0,19);ctx.lineTo(-10-flutter,27);ctx.closePath();ctx.fill();ctx.restore();
      }
    }
    // Floating lanterns ascend gradually. Drawn with geometry and a local warm glow.
    for(let i=0;i<7;i++){
      const k=((i*17+3)%13)/13;
      const x=W*(.07+(i%7)*.143)+Math.sin(p*8+i)*15;
      const y=H*(.83-k*.48)-p*H*(.26+(i%3)*.07);
      const r=13+(i%3)*3;
      const glow=ctx.createRadialGradient(x,y,1,x,y,r*3.5);
      glow.addColorStop(0,`rgba(255,188,93,${fade*.31})`);glow.addColorStop(1,'rgba(255,156,70,0)');
      ctx.fillStyle=glow;ctx.fillRect(x-r*4,y-r*4,r*8,r*8);
      ctx.beginPath();ctx.ellipse(x,y,r*.78,r,0,0,2*Math.PI);
      ctx.fillStyle=['#ed9c63','#f1bd79','#e8a36a'][i%3];ctx.fill();
      ctx.lineWidth=1.8;ctx.strokeStyle='#9e593d';ctx.stroke();
      ctx.beginPath();ctx.moveTo(x-r*.55,y-r*.42);ctx.lineTo(x+r*.55,y-r*.42);
      ctx.moveTo(x-r*.5,y+r*.5);ctx.lineTo(x+r*.5,y+r*.5);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x,y+r);ctx.lineTo(x,y+r+9);ctx.stroke();
    }
    // Glowing embers and tiny fireflies; movement varies without extra timers.
    for(let i=0;i<76;i++){
      const q=(i*.61803398875)%1;
      const x=W*((i*47%97)/97)+Math.sin(p*6+i)*11;
      const y=H*((i*31%89)/89)-p*(35+(i%6)*16);
      const radius=1.3+(i%5)*.55;
      const gold=i%4===0?'#8ed4a7':i%3===0?'#fbeac1':'#ffc982';
      drawSpark(ctx,x,y,radius,gold,fade*(.40+.1*(i%5)));
    }
    ctx.restore();
  }

  // Terror: a slow opening aperture, geometric sigils and suspended embers.
  // No strobe, startling jumps or persisted overlays. Runs only during the portal.
  function drawTerrorTransition(ctx,W,H,p,opacity) {
    const centerX=W*.5,centerY=H*.5,rad=Math.max(W,H)*.65;
    ctx.save();
    ctx.globalAlpha=Math.max(0,opacity);
    const fog=ctx.createRadialGradient(centerX,centerY,0,centerX,centerY,rad);
    fog.addColorStop(0,'rgba(135,33,69,.32)');fog.addColorStop(.45,'rgba(48,12,36,.65)');fog.addColorStop(1,'rgba(8,6,16,.92)');
    ctx.fillStyle=fog;ctx.fillRect(0,0,W,H);
    const sweep=Math.sin(Math.PI*p);
    for(let j=0;j<4;j++){
      const r=Math.min(W,H)*(.13+j*.08+p*.18);
      ctx.beginPath();ctx.ellipse(centerX,centerY,r*1.55,r*.64,0,0,Math.PI*2);
      ctx.strokeStyle=`rgba(${j%2?'211,139,144':'192,61,90'},${opacity*(.51-j*.095)})`;
      ctx.lineWidth=j===0?2.8:1.15;ctx.stroke();
      for(let i=0;i<12;i++){
        const a=i*Math.PI/6+p*.12,r2=r*(1.15+j*.025);
        const x=centerX+Math.cos(a)*r2,y=centerY+Math.sin(a)*r2*.44;
        ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI/2);
        ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(4,0);ctx.lineTo(0,6);ctx.lineTo(-4,0);ctx.closePath();
        ctx.fillStyle=`rgba(224,143,151,${opacity*.5})`;ctx.fill();ctx.restore();
      }
    }
    // The aperture visually opens, without covering interactive UI after the portal finishes.
    const eyelid=Math.max(0,(1-p)*H*.34);
    ctx.fillStyle=`rgba(9,6,16,${Math.min(.9,opacity+.11)})`;
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W,0);
    ctx.quadraticCurveTo(centerX,centerY-eyelid,H*-1,0);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(W,H);
    ctx.quadraticCurveTo(centerX,centerY+eyelid,0,H);ctx.closePath();ctx.fill();
    for(let i=0;i<37;i++){
      const k=((i*71)%97)/97, x=W*k+Math.sin(i+p*5)*12;
      const y=H*((i*31%89)/89)-p*90;
      ctx.fillStyle=`rgba(234,119,146,${opacity*(.13+(i%3)*.07)})`;
      ctx.fillRect(x,y,1.3+(i%3),1.3+(i%3));
    }
    ctx.restore();
  }

  function drawEasterTransition(ctx,W,H,p,opacity) {
    const centerX=W*.5, centerY=H*.54;
    ctx.save();
    const mist=ctx.createRadialGradient(centerX,centerY,Math.min(W,H)*.05,centerX,centerY,Math.max(W,H)*.62);
    mist.addColorStop(0,`rgba(255,247,234,${opacity*.30})`);
    mist.addColorStop(.36,`rgba(247,188,212,${opacity*.22})`);
    mist.addColorStop(.68,`rgba(179,226,255,${opacity*.16})`);
    mist.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=mist; ctx.fillRect(0,0,W,H);

    ctx.globalAlpha=opacity*.88;
    for(let i=0;i<5;i++){
      const rx=Math.min(W,H)*(.10+i*.06+p*.03);
      const ry=rx*1.28;
      ctx.beginPath();
      ctx.ellipse(centerX,centerY,rx,ry,0,0,Math.PI*2);
      ctx.lineWidth=i===0?3.2:1.6;
      ctx.strokeStyle=[`rgba(236,129,171,${opacity*(.46-i*.07)})`,`rgba(255,230,162,${opacity*(.42-i*.06)})`,`rgba(147,213,247,${opacity*(.38-i*.05)})`,`rgba(210,183,255,${opacity*(.30-i*.05)})`,`rgba(255,255,255,${opacity*(.24-i*.04)})`][i];
      ctx.stroke();
    }

    const eggs=12;
    for(let i=0;i<eggs;i++){
      const a=(Math.PI*2*i/eggs)+(p*2.8);
      const orbitX=Math.cos(a)*Math.min(W,H)*(.16+(i%3)*.045);
      const orbitY=Math.sin(a)*Math.min(W,H)*(.09+(i%2)*.03);
      const x=centerX+orbitX, y=centerY+orbitY;
      const rx=10+(i%3)*2.2, ry=14+(i%3)*2.4;
      ctx.save();
      ctx.translate(x,y); ctx.rotate(a*.55);
      ctx.fillStyle=['#ffbfd3','#bce7ff','#fff1ad','#dcc9ff','#ffd8b1','#c9f1d6'][i%6];
      ctx.strokeStyle='rgba(255,255,255,.58)'; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,.78)'; ctx.lineWidth=1.1;
      ctx.beginPath(); ctx.moveTo(-rx*.8,-ry*.12); ctx.lineTo(rx*.8,-ry*.12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-rx*.7,ry*.28); ctx.lineTo(rx*.7,ry*.28); ctx.stroke();
      ctx.restore();
    }

    for(let i=0;i<18;i++){
      const a=(i*0.89)+(p*3.2);
      const x=centerX+Math.cos(a)*Math.min(W,H)*(.28+.04*(i%3));
      const y=centerY+Math.sin(a*1.17)*Math.min(W,H)*(.18+.03*(i%2));
      ctx.save(); ctx.translate(x,y); ctx.rotate(a); ctx.globalAlpha=opacity*(.45+(i%3)*.08);
      for(let k=0;k<5;k++){ ctx.rotate((Math.PI*2)/5); ctx.fillStyle=['#fff9fe','#fff4ea','#fffceb'][k%3]; ctx.beginPath(); ctx.ellipse(0,11,4,8,0,0,Math.PI*2); ctx.fill(); }
      ctx.beginPath(); ctx.arc(0,0,4,0,Math.PI*2); ctx.fillStyle='#ffe06f'; ctx.fill();
      ctx.restore();
    }

    for(let i=0;i<30;i++){
      const a=(i*2.3999632)+(p*8.0);
      const x=centerX+Math.cos(a)*Math.min(W,H)*(.34+.02*(i%4));
      const y=centerY+Math.sin(a*1.11)*Math.min(W,H)*(.24+.015*(i%5));
      drawSpark(ctx,x,y,(i%4===0?4.8:2.5),['#fff8d3','#ffffff','#ffd2ea','#d7eeff'][i%4],opacity*(i%4===0?.92:.62));
    }
    ctx.restore();
  }


  // CYBERPUNK // NEURAL CONVERGENCE
  // Cinematic, full-viewport circuitry that retains the actual ERP underneath.
  // The chip activates first; its pathways draw power from peripheral processors;
  // KIRA-09 then manifests as a transparent hologram in the existing logo layer.
  // This draw function changes no DOM business content or operational data.
  function drawCyberpunkTransition(ctx,W,H,p,opacity) {
    const clamp=(n)=>Math.max(0,Math.min(1,n));
    const ease=(n)=>{n=clamp(n);return n*n*(3-2*n);};
    const appear=ease(p/.16), depart=1-ease((p-.89)/.11);
    const strength=appear*depart;
    const cx=W*.50,cy=H*.50,sh=Math.min(W,H);
    const chipSize=Math.min(104,Math.max(65,sh*.105));
    const chroma=['#58f5ff','#f17cea','#8e94ff','#a2fdff'];
    ctx.save();
    ctx.lineCap='round';ctx.lineJoin='round';

    // Distributed neon mists: low-opacity bloom spans the viewport but never
    // paints an opaque screen over the dashboard. Static geometry; no blur filter.
    ctx.globalCompositeOperation='screen';
    const fogStrength=strength*(.65+.35*ease(p/.45));
    for(let i=0;i<8;i++) {
      const a=i*2.3999632+p*.34;
      const x=W*(.5+Math.cos(a)*.46),y=H*(.5+Math.sin(a)*.40);
      const r=Math.min(Math.max(W,H)*.35,sh*(.28+.045*(i%4)));
      const rgb=i%3===0?'220,72,237':i%3===1?'25,213,250':'73,105,231';
      const g=ctx.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0,`rgba(${rgb},${fogStrength*.17})`);
      g.addColorStop(.48,`rgba(${rgb},${fogStrength*.066})`);
      g.addColorStop(1,`rgba(${rgb},0)`);
      ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r);
    }
    ctx.globalCompositeOperation='source-over';

    function buildPath(i) {
      const side=i%4, lane=Math.floor(i/4), fraction=(lane+.9)/9.0;
      const jitter=((i*7)%5-2)*8;
      const hubOffset=((i*13)%9-4)*chipSize*.13;
      if(side===0){
        const sy=H*fraction,ex=cx-chipSize*.73,ey=cy+hubOffset;
        const px=W*(.15+((lane%3)*.044));
        return [[0,sy],[px,sy],[px,ey+jitter],[ex,ey+jitter],[ex,ey]];
      }
      if(side===1){
        const sy=H*fraction,ex=cx+chipSize*.73,ey=cy+hubOffset;
        const px=W*(.85-((lane%3)*.044));
        return [[W,sy],[px,sy],[px,ey+jitter],[ex,ey+jitter],[ex,ey]];
      }
      if(side===2){
        const sx=W*fraction,ex=cx+hubOffset,ey=cy-chipSize*.73;
        const py=H*(.16+((lane%3)*.035));
        return [[sx,0],[sx,py],[ex+jitter,py],[ex+jitter,ey],[ex,ey]];
      }
      const sx=W*fraction,ex=cx+hubOffset,ey=cy+chipSize*.73;
      const py=H*(.84-((lane%3)*.035));
      return [[sx,H],[sx,py],[ex+jitter,py],[ex+jitter,ey],[ex,ey]];
    }
    function partialPath(points,fraction){
      const segments=[];let total=0;
      for(let j=1;j<points.length;j++){
        const a=points[j-1],b=points[j];
        const d=Math.hypot(b[0]-a[0],b[1]-a[1]);segments.push(d);total+=d;
      }
      let remain=total*clamp(fraction);
      ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
      for(let j=1;j<points.length&&remain>0;j++){
        const a=points[j-1],b=points[j],d=segments[j-1];
        if(remain>=d){ctx.lineTo(b[0],b[1]);remain-=d;}
        else{const t=d?remain/d:0;ctx.lineTo(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t);remain=0;}
      }
      return segments.reduce((v,n)=>v+n,0);
    }
    function at(points,fraction){
      const seg=[],total=points.slice(1).reduce((acc,b,i)=>{const a=points[i];const d=Math.hypot(b[0]-a[0],b[1]-a[1]);seg.push(d);return acc+d;},0);
      let remain=total*clamp(fraction);
      for(let j=1;j<points.length;j++){
        const a=points[j-1],b=points[j],d=seg[j-1];
        if(remain<=d||j===points.length-1){const t=d?Math.min(1,remain/d):0;return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];}
        remain-=d;
      }
      return points[points.length-1];
    }

    // 36 electrical traces connect every edge of the viewport to the core.
    // Fine shadows are applied to only a subset of traces (performance bound).
    const completion=ease((p-.04)/.60);
    for(let i=0;i<36;i++){
      const path=buildPath(i),color=chroma[i%4];
      const track=ease((completion-(i%7)*.023)/.84);
      ctx.globalAlpha=strength*(.17+.11*(i%4===0));
      partialPath(path,1);
      ctx.strokeStyle=color;ctx.lineWidth=.7;ctx.stroke();
      ctx.globalAlpha=strength*(.52+.18*(i%5===0));
      partialPath(path,track);
      ctx.strokeStyle=color;ctx.lineWidth=i%7===0?2.15:1.15;
      if(i%9===0){ctx.shadowColor=color;ctx.shadowBlur=8;}
      ctx.stroke();ctx.shadowBlur=0;
      if(track>.04){
        const packetAt=Math.min(track,(p*1.1+i*.075)%1);
        const pos=at(path,packetAt);
        ctx.globalAlpha=strength*(.7+.3*(i%5===0));
        ctx.fillStyle=i%4===1?'#ffa7f6':'#a4ffff';
        ctx.beginPath();ctx.arc(pos[0],pos[1],i%8===0?3.1:1.9,0,Math.PI*2);ctx.fill();
      }
      if(track>.88){const end=path[path.length-1];ctx.globalAlpha=strength*.60;ctx.beginPath();ctx.arc(end[0],end[1],2,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
    }
    ctx.globalAlpha=1;

    // Eight satellite chips distributed around the screen, each feeding a
    // distinctly colored network branch (no full-screen opaque backplate).
    for(let i=0;i<8;i++){
      const edge=i%4,k=Math.floor(i/4),px=edge===0?W*.09:edge===1?W*.91:W*(k?.75:.25);
      const py=edge===2?H*.11:edge===3?H*.89:H*(k?.73:.27);
      const size=Math.max(17,Math.min(29,sh*.037)),alpha=strength*(.55+.25*completion);
      ctx.save();ctx.translate(px,py);ctx.globalAlpha=alpha;
      ctx.fillStyle='rgba(9,19,42,.25)';ctx.strokeStyle=chroma[i%4];ctx.lineWidth=1.4;
      ctx.beginPath();ctx.roundRect(-size/2,-size/2,size,size,4);ctx.fill();ctx.stroke();
      ctx.strokeRect(-size*.22,-size*.22,size*.44,size*.44);
      for(let pin=-1;pin<=1;pin++){
        ctx.beginPath();ctx.moveTo(-size*.72,pin*size*.22);ctx.lineTo(-size*.51,pin*size*.22);
        ctx.moveTo(size*.51,pin*size*.22);ctx.lineTo(size*.72,pin*size*.22);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Central processor awakens, emits a readout and transfers the scene to
    // the KIRA-09 hologram between p=.65 and p=.82.
    const coreOn=ease((p-.17)/.19)*(1-ease((p-.68)/.20));
    if(coreOn>.01){
      ctx.save();ctx.translate(cx,cy);ctx.globalAlpha=strength*coreOn;
      const outer=chipSize*.54;
      for(let ring=0;ring<3;ring++){
        const radius=outer+ring*14+Math.sin(p*25+ring)*2;
        ctx.beginPath();ctx.arc(0,0,radius,-Math.PI*.85,Math.PI*.15);
        ctx.strokeStyle=ring%2?'#ea78f7':'#5efaff';ctx.lineWidth=ring===0?2.4:1;ctx.stroke();
      }
      const aura=ctx.createRadialGradient(0,0,0,0,0,outer*1.7);
      aura.addColorStop(0,'rgba(68,237,255,.23)');aura.addColorStop(1,'rgba(68,237,255,0)');
      ctx.fillStyle=aura;ctx.fillRect(-outer*1.7,-outer*1.7,outer*3.4,outer*3.4);
      ctx.fillStyle='rgba(10,23,52,.70)';ctx.strokeStyle='#72faff';ctx.lineWidth=3;
      ctx.beginPath();ctx.roundRect(-outer*.66,-outer*.66,outer*1.32,outer*1.32,9);ctx.fill();ctx.stroke();
      ctx.strokeStyle='#d47df3';ctx.lineWidth=1.6;
      ctx.strokeRect(-outer*.35,-outer*.35,outer*.7,outer*.7);
      for(let j=-3;j<=3;j++){
        ctx.beginPath();ctx.moveTo(-outer*.66,j*outer*.15);ctx.lineTo(-outer*.85,j*outer*.15);
        ctx.moveTo(outer*.66,j*outer*.15);ctx.lineTo(outer*.85,j*outer*.15);ctx.stroke();
        ctx.beginPath();ctx.moveTo(j*outer*.15,-outer*.66);ctx.lineTo(j*outer*.15,-outer*.85);
        ctx.moveTo(j*outer*.15,outer*.66);ctx.lineTo(j*outer*.15,outer*.85);ctx.stroke();
      }
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`700 ${Math.max(10,outer*.28)}px monospace`;
      ctx.fillStyle='#b4fdff';ctx.fillText('N / 09',0,0);
      ctx.restore();
    }
    // Phase-sensitive glints around the materializing mascot.
    const manifest=ease((p-.64)/.20)*(1-ease((p-.95)/.05));
    if(manifest>.01){
      for(let i=0;i<22;i++){
        const a=i*2.3999632+p*2.1,rad=sh*(.12+((i%6)*.022));
        const x=cx+Math.cos(a)*rad,y=cy+Math.sin(a*1.3)*rad*.78;
        const size=2+((i%4)===0?2.8:0);
        drawSpark(ctx,x,y,size,chroma[i%4],manifest*strength*(i%3===0?.9:.45));
      }
    }
    ctx.restore();
  }

  // Crystal Formation — Pearl / Obsidian materializing above the live dashboard.
  // 2D/36 fps, no blur loops; all drawing is decorative and short-lived.
  function drawGlassTransition(ctx,W,H,p,opacity){
    const pearl=document.documentElement.dataset.glassLight!=='obsidian';
    const rgb=pearl?'125,165,225':'119,153,206';
    const violet=pearl?'198,160,230':'145,125,210';
    const fade=Math.sin(Math.PI*p)*opacity;
    const cx=W*.5,cy=H*.48;
    ctx.save();ctx.globalCompositeOperation='screen';
    const rays=22;
    for(let i=0;i<rays;i++){
      const a=i*Math.PI*2/rays+Math.sin(i*9)*.14;
      const length=(.18+.46*Math.min(1,p*1.5))*Math.max(W,H);
      const outer=Math.max(60,length),inner=Math.max(30,outer*(1-.83*p));
      const stagger=Math.max(0,Math.min(1,(p-i*.008)*2.6));
      const xa=cx+Math.cos(a)*outer,ya=cy+Math.sin(a)*outer*.68;
      const xb=cx+Math.cos(a)*inner,yb=cy+Math.sin(a)*inner*.68;
      ctx.beginPath();ctx.moveTo(xa,ya);ctx.lineTo(xb,yb);
      ctx.strokeStyle=`rgba(${i%3===0?violet:rgb},${(.09+.24*stagger)*fade})`;
      ctx.lineWidth=i%4===0?2.3:1.15;ctx.stroke();
      const q=Math.max(0,Math.min(1,(p-.1-i*.004)*2.9));
      const px=xa+(xb-xa)*q,py=ya+(yb-ya)*q;
      ctx.beginPath();ctx.arc(px,py,i%5===0?3:1.5,0,Math.PI*2);
      ctx.fillStyle=`rgba(${i%3===0?violet:rgb},${.5*fade})`;ctx.fill();
    }
    for(let i=0;i<12;i++){
      const a=(i/12)*Math.PI*2+p*.25;
      const r=75+Math.max(W,H)*(.03+.11*Math.sin(Math.PI*p));
      const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.65;
      const h=6+Math.sin(i*7+p*9)*3;
      ctx.beginPath();ctx.moveTo(x,y-h);ctx.lineTo(x+h*.72,y);ctx.lineTo(x,y+h);ctx.lineTo(x-h*.72,y);ctx.closePath();
      ctx.fillStyle=`rgba(${i%2?violet:rgb},${.2*fade})`;ctx.fill();
      ctx.strokeStyle=`rgba(255,255,255,${.35*fade})`;ctx.lineWidth=.9;ctx.stroke();
    }
    const radiance=ctx.createRadialGradient(cx,cy,18,cx,cy,Math.max(W,H)*.49);
    radiance.addColorStop(0,`rgba(${rgb},${.13*fade})`);
    radiance.addColorStop(.5,`rgba(${violet},${.03*fade})`);
    radiance.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=radiance;ctx.fillRect(0,0,W,H);
    const scanY=H*(.18+.69*Math.min(1,p*1.22));
    const line=ctx.createLinearGradient(0,scanY,W,scanY);
    line.addColorStop(0,'rgba(255,255,255,0)');line.addColorStop(.5,`rgba(${rgb},${.16*fade})`);line.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=line;ctx.fillRect(0,scanY,W,1.6);
    ctx.restore();
  }

  function drawFloatingElements(canvas,p,themeKey) {
    const ctx=canvas.getContext('2d');if(!ctx)return;
    const dpr=Math.min(1.6,devicePixelRatio||1),W=window.innerWidth,H=window.innerHeight;
    if(canvas.width!==Math.round(W*dpr)||canvas.height!==Math.round(H*dpr)){canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr)}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    const opacity=Math.sin(Math.PI*p),t=p*2.3;
    if(themeKey==='cyberpunk'){drawCyberpunkTransition(ctx,W,H,p,opacity);return;}
    if(themeKey==='glassy-crm'){drawGlassTransition(ctx,W,H,p,opacity);return;}
    if(themeKey==='claro'){drawLuminousTransition(ctx,W,H,p,opacity);return;}
    if(themeKey==='escuro'){drawMidnightTransition(ctx,W,H,p,opacity);return;}
    if(themeKey==='natal'){drawChristmasTransition(ctx,W,H,p,opacity);return;}
    if(themeKey==='ano-novo'){drawNewYearTransition(ctx,W,H,p,opacity);return;}
    if(themeKey==='pascoa'){drawEasterTransition(ctx,W,H,p,opacity);return;}
    if(themeKey==='festa-junina'){drawJuninaTransition(ctx,W,H,p,opacity);return;}
    if(themeKey==='terror'){drawTerrorTransition(ctx,W,H,p,opacity);return;}
    const dark=themeKey==='halloween';
    // Volumetric-looking illustrated smoke blooms: stratified highlight/shadow
    // puffs make the GPU noise feel spatial, rather than a flat color fade.
    const intensity=Math.max(0,Math.min(1,(p-.05)*4))*Math.pow(Math.max(0,1-p),.8);
    if(intensity>.01){
      ctx.save();ctx.globalCompositeOperation='screen';
      for(let i=0;i<27;i++){
        const a=i*2.3999632,progress=Math.min(1,p*1.4);
        const x=W*(.86-progress*.64)+Math.sin(a)*W*.18+Math.cos(a*2.2)*W*.09;
        const y=H*(.62+Math.cos(a*1.27)*.26)-progress*H*.09;
        const rad=Math.min(W,H)*(.11+(i%5)*.018)*(1+progress*.38);
        const g=ctx.createRadialGradient(x-rad*.18,y-rad*.2,rad*.06,x,y,rad);
        const c=dark?['140,77,193','126,63,186','194,115,228','109,43,159'][i%4]:['255,211,246','216,172,255','255,239,249','190,191,255'][i%4];
        const alpha=intensity*(dark?.42:.31)*(i%3===0?1.1:.86);
        g.addColorStop(0,`rgba(${c},${alpha})`);g.addColorStop(.32,`rgba(${c},${alpha*.66})`);g.addColorStop(.72,`rgba(${c},${alpha*.22})`);g.addColorStop(1,`rgba(${c},0)`);
        ctx.fillStyle=g;ctx.fillRect(x-rad,y-rad,rad*2,rad*2);
      }
      ctx.restore();
    }
    const n=dark?20:32;
    for(let i=0;i<n;i++){
      const seed=(i*0.6180339887)%1;const a=seed*Math.PI*2*3;
      const x=W*(.5+Math.sin(a)*p*.84)+(i%5)*7;
      const y=H*(.5+Math.cos(a*1.12)*p*.75)+Math.sin(t*8+i)*15;
      const R=(i%4===0?5:2)+(i%3)*.7;
      drawSpark(ctx,x,y,R,dark?['#ffa661','#d4a0ff','#fff2cb'][i%3]:['#fff','#ffe5b1','#ffb8e3','#b3d7ff'][i%4],opacity*(i%4===0?.98:.65));
    }
    if(dark){for(let i=0;i<11;i++){
      const shift=(p*.94+i*.087)%1;const x=(-.13+shift*1.42)*W;
      const y=(.13+(i%7)*.12)*H+Math.sin(p*14+i)*25;
      drawBat(ctx,x,y,13+(i%4)*5,t,i,opacity*.86);
    }} else {
      // luminous arc with layered pastel strokes, used only in the transition
      ctx.save();ctx.globalAlpha=opacity*.67;ctx.lineCap='round';
      const colors=['#f8a0bd','#ffd8a2','#f8eabc','#a9e8d5','#9cc8ee','#d0b1f7'];
      const cx=W*.5,cy=H*.73,R=Math.min(W,H)*.5;
      colors.forEach((c,i)=>{ctx.beginPath();ctx.arc(cx,cy,R-i*7,Math.PI*1.04,Math.PI*1.96);ctx.lineWidth=6;ctx.strokeStyle=c;ctx.stroke()});ctx.restore();
    }
  }

  function playTransition(nextTheme) {
    stopPortal?.();
    if (!THEMES.has(nextTheme) || !allowMotion()) return;
    const portal=$('cr-portal');const shaderCanvas=portal?.querySelector('.cr-gpu-cloud');const motionCanvas=portal?.querySelector('.cr-motion-layer');
    if(!portal||!shaderCanvas||!motionCanvas)return;
    portal.classList.remove('theme-original','theme-halloween','theme-claro','theme-escuro','theme-natal','theme-ano-novo','theme-pascoa','theme-festa-junina','theme-terror','theme-cyberpunk','theme-glassy-crm');
    portal.classList.add('is-playing','theme-'+nextTheme);
    const logo=portal.querySelector('.cr-portal-logo');
    const meta = getThemeMeta(nextTheme);
    const dark=isDarkTheme(nextTheme);
    logo.querySelector('img').src=file(nextTheme==='cyberpunk'?'cyberpunk-kira09-v2.svg':meta.asset);
    logo.querySelector('.cr-portal-title').textContent=nextTheme==='cyberpunk'?'KIRA-09 // ONLINE':(nextTheme==='glassy-crm'?'MIRA · CRYSTAL FORMATION':meta.fullTitle);
    logo.querySelector('.cr-portal-caption').textContent=nextTheme==='cyberpunk'?'CONEXÃO NEURAL ESTABELECIDA':meta.portalCaption;
    // Páscoa: manter centralização na própria transform para Edge/Chromium.
    if(nextTheme==='pascoa') logo.style.transform='translate(-50%,-50%)';
    const gpu=(nextTheme==='cyberpunk'||nextTheme==='glassy-crm')?null:createGPU(shaderCanvas);
    let frame=0,stopped=false;const duration=nextTheme==='cyberpunk'?3600:(nextTheme==='glassy-crm'?2750:((nextTheme==='festa-junina'||nextTheme==='terror')?1650:1900)),started=performance.now();
    const gsapTl=(nextTheme!=='cyberpunk' && nextTheme!=='glassy-crm' && nextTheme!=='pascoa' && window.gsap) ? gsap.timeline({paused:true}) : null;
    if(gsapTl){gsapTl.fromTo(logo,{opacity:0,scale:.65,y:30},{opacity:1,scale:1,y:0,duration:.45,ease:'back.out(1.65)'},.15)
      .to(logo,{opacity:0,scale:1.2,y:-26,duration:.28,ease:'power2.in'},.73);gsapTl.play();}
    let lastCyberPaint=0; // Portal Cyberpunk: limite aproximado de 36 fps durante 3,6 s.
    function render(now){
      if(stopped)return;
      const p=Math.min(1,(now-started)/duration);const t=(now-started)/1000;
      if((nextTheme==='cyberpunk'||nextTheme==='glassy-crm') && now-lastCyberPaint<28 && p<1){
        frame=requestAnimationFrame(render);return;
      }
      if(nextTheme==='cyberpunk'||nextTheme==='glassy-crm')lastCyberPaint=now;
      if(gpu)gpu.draw(t,p,nextTheme);
      else if(nextTheme==='cyberpunk'||nextTheme==='glassy-crm') {
        // Wide transparent cyan/magenta light fields; no black or opaque veil.
        // The actual dashboard remains visible throughout the portal.
        const back=shaderCanvas.getContext('2d');
        if(back){const dpr=Math.min(devicePixelRatio||1,1.25),w=innerWidth,h=innerHeight;
          if(shaderCanvas.width!==Math.round(w*dpr)||shaderCanvas.height!==Math.round(h*dpr)){
            shaderCanvas.width=Math.round(w*dpr);shaderCanvas.height=Math.round(h*dpr);
          }
          back.setTransform(dpr,0,0,dpr,0,0);back.clearRect(0,0,w,h);
          const alpha=Math.sin(Math.PI*p)*.30;
          for(let i=0;i<5;i++){
            const x=w*(.12+i*.20),y=h*(.31+(i%2)*.38),r=Math.max(w,h)*.31;
            const rgb=i%2===0?'43,218,247':'214,80,228';
            const glow=back.createRadialGradient(x,y,0,x,y,r);
            glow.addColorStop(0,`rgba(${rgb},${alpha*.35})`);
            glow.addColorStop(.55,`rgba(${rgb},${alpha*.10})`);
            glow.addColorStop(1,`rgba(${rgb},0)`);
            back.fillStyle=glow;back.fillRect(x-r,y-r,r*2,r*2);
          }
        }
      }
      else {const fallback=shaderCanvas.getContext('2d');if(fallback){const w=shaderCanvas.width=innerWidth,h=shaderCanvas.height=innerHeight;const grad=fallback.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,Math.max(w,h)*.63);grad.addColorStop(0,({original:'rgba(240,166,233,.76)',halloween:'rgba(100,39,153,.86)',claro:'rgba(134,202,255,.73)',escuro:'rgba(35,74,176,.79)',natal:'rgba(180,54,72,.74)','ano-novo':'rgba(245,209,121,.8)',pascoa:'rgba(238,144,180,.76)','festa-junina':'rgba(237,147,75,.74)',terror:'rgba(103,25,53,.80)'})[nextTheme]);grad.addColorStop(1,'rgba(0,0,0,0)');fallback.fillStyle=grad;fallback.globalAlpha=Math.sin(Math.PI*p);fallback.fillRect(0,0,w,h);}}
      drawFloatingElements(motionCanvas,p,nextTheme);
      if(nextTheme==='cyberpunk'||nextTheme==='glassy-crm'){
        const rise=Math.min(1,Math.max(0,(p-.62)/.20));
        const reveal=rise*rise*(3-2*rise);
        const fade=Math.max(0,Math.min(1,(1-p)/.075));
        logo.style.opacity=String(reveal*fade);
        logo.style.transform=`translate(-50%,-50%) translateY(${Math.round((1-reveal)*23)}px) scale(${.72+.28*reveal})`;
      }else if(!gsapTl){
        const show=Math.max(0,Math.min(1,(p-.16)*7,(1-p)*8));
        logo.style.opacity=String(show);
        logo.style.transform=`translate(-50%,-50%) scale(${.76+Math.sin(Math.PI*p)*.26})`;
      }
      if(p<1)frame=requestAnimationFrame(render);else close();
    }
    function close(){if(stopped)return;stopped=true;cancelAnimationFrame(frame);gsapTl?.kill();gpu?.dispose();portal.classList.remove('is-playing','theme-original','theme-halloween','theme-claro','theme-escuro','theme-natal','theme-ano-novo','theme-pascoa','theme-festa-junina','theme-terror','theme-cyberpunk','theme-glassy-crm');logo.style.opacity='';logo.style.transform='';shaderCanvas.width=0;shaderCanvas.height=0;motionCanvas.width=0;motionCanvas.height=0;stopPortal=null;}
    stopPortal=close;
    frame=requestAnimationFrame(render);
  }

  function syncTheme(nextTheme,animate=false) {
    const active=THEMES.has(nextTheme);
    relocateMascot(nextTheme);
    if(active)updateTitle(nextTheme);
    applyOrnaments(nextTheme);
    const pick=$('cr-theme-choice');if(pick && window.ERPTheme?.themes[nextTheme])pick.value=nextTheme;
    document.body.classList.toggle('cr-rebirth-active',active);
    if(active && animate){animateEntrance(nextTheme);playTransition(nextTheme);}
    if(!active)stopPortal?.();
    // Chart.js canvases retain their original instances and calculations.
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  }

  function start() {
    // Optional GSAP choreography loads without blocking the application.
    // The animated Canvas/WebGL transition and WAAPI fallback work offline.
    if (!window.gsap) {
      const src=document.createElement('script');
      src.src='https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js';
      src.async=true;src.crossOrigin='anonymous';
      src.onerror=() => { src.remove(); };
      document.head.appendChild(src);
    }
    createChrome();
    syncTheme(theme(),false);
    document.addEventListener('erp:appearance-change', e => {
      const next=e.detail?.theme||theme();
      const changed=next!==previousTheme;
      syncTheme(next,changed);
      previousTheme=next;
    });
    if(!touchInitialized){touchInitialized=true;document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPortal?.();},{passive:true});}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
