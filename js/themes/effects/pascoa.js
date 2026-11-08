window.ERPThemeEffects["pascoa"] = function(scope){
const {window,document,setTimeout,clearTimeout,requestAnimationFrame,Audio,Swal}=scope;

const canvas = document.getElementById('easterCanvas');
const ctx = canvas?.getContext?.('2d');
let width = 0;
let height = 0;

function resizeCanvas(){
  if (!canvas) return;
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
resizeCanvas();
scope.listen(window,'resize', resizeCanvas);

const EGG_COLORS = ['#ffb9d1','#bfe8ff','#fff1ac','#d8c4ff','#ffc995','#bff1d5'];
const FLOWER_PETALS = ['#fff8fe','#fff4ec','#fffdf5'];

class EggParticle {
  constructor(){ this.reset(true); }
  reset(initial = false){
    this.x = Math.random() * Math.max(1, width);
    this.y = initial ? Math.random() * Math.max(1, height) : height + 30 + Math.random() * 120;
    this.vy = -(0.18 + Math.random() * 0.38);
    this.vx = (Math.random() - 0.5) * 0.28;
    this.rx = 10 + Math.random() * 9;
    this.ry = this.rx * 1.35;
    this.spin = (Math.random() - 0.5) * 0.008;
    this.angle = (Math.random() - 0.5) * 0.45;
    this.alpha = 0.15 + Math.random() * 0.20;
    this.base = EGG_COLORS[(Math.random() * EGG_COLORS.length) | 0];
    this.accent = EGG_COLORS[(Math.random() * EGG_COLORS.length) | 0];
  }
  update(){
    this.y += this.vy; this.x += this.vx; this.angle += this.spin;
    if (this.y < -80 || this.x < -80 || this.x > width + 80) this.reset();
  }
  draw(){
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.globalAlpha = this.alpha;
    ctx.beginPath(); ctx.ellipse(0,0,this.rx,this.ry,0,0,Math.PI*2); ctx.fillStyle = this.base; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,.86)';
    ctx.fillRect(-this.rx, -this.ry*.18, this.rx*2, this.ry*.36);
    ctx.strokeStyle = this.accent; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-this.rx + 2, -this.ry*.46);
    for (let x = -this.rx + 2; x <= this.rx - 2; x += 5) ctx.quadraticCurveTo(x + 2.5, -this.ry*.72, x + 5, -this.ry*.46);
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-this.rx + 2, this.ry*.45);
    for (let x = -this.rx + 2; x <= this.rx - 2; x += 5) ctx.quadraticCurveTo(x + 2.5, this.ry*.73, x + 5, this.ry*.45);
    ctx.stroke();
    ctx.restore();
    ctx.restore();
  }
}

class BlossomParticle {
  constructor(){ this.reset(true); }
  reset(initial = false){
    this.x = Math.random() * Math.max(1, width);
    this.y = initial ? Math.random() * Math.max(1, height) : height + 20 + Math.random() * 80;
    this.vy = -(0.12 + Math.random() * 0.26);
    this.vx = (Math.random() - 0.5) * 0.34;
    this.size = 7 + Math.random() * 6;
    this.spin = (Math.random() - 0.5) * 0.02;
    this.angle = Math.random() * Math.PI * 2;
    this.alpha = 0.16 + Math.random() * 0.22;
    this.petal = FLOWER_PETALS[(Math.random() * FLOWER_PETALS.length) | 0];
  }
  update(){
    this.y += this.vy; this.x += this.vx; this.angle += this.spin;
    if (this.y < -60 || this.x < -60 || this.x > width + 60) this.reset();
  }
  draw(){
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.petal;
    ctx.strokeStyle = 'rgba(255,211,227,.8)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 6; i++) {
      ctx.rotate((Math.PI * 2) / 6);
      ctx.beginPath(); ctx.ellipse(0, this.size, this.size * 0.42, this.size * 0.68, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(0, 0, this.size * 0.46, 0, Math.PI * 2); ctx.fillStyle = '#ffe06f'; ctx.fill();
    ctx.restore();
  }
}

class SparkleParticle {
  constructor(){ this.reset(true); }
  reset(initial = false){
    this.x = Math.random() * Math.max(1, width);
    this.y = initial ? Math.random() * Math.max(1, height) : height + 10;
    this.vy = -(0.08 + Math.random() * 0.22);
    this.vx = (Math.random() - 0.5) * 0.18;
    this.size = 1.8 + Math.random() * 2.4;
    this.alpha = 0.12 + Math.random() * 0.16;
  }
  update(){
    this.y += this.vy; this.x += this.vx;
    if (this.y < -20) this.reset();
  }
  draw(){
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.globalAlpha = this.alpha;
    ctx.strokeStyle = '#fff5d1'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(-this.size,0); ctx.lineTo(this.size,0); ctx.moveTo(0,-this.size); ctx.lineTo(0,this.size); ctx.stroke();
    ctx.restore();
  }
}

const sceneParticles = ctx ? [
  ...Array.from({length: 14}, () => new EggParticle()),
  ...Array.from({length: 18}, () => new BlossomParticle()),
  ...Array.from({length: 18}, () => new SparkleParticle())
] : [];

(function animate(){
  if (!ctx) return;
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, width, height);
  sceneParticles.forEach(item => { item.update(); item.draw(); });
})();

(function easterInteractions(){
  const clickSymbols = ['🐰','🥚','🌷','🌼','🥕','🎀','✨','💛','🪺','🌸'];
  const eggHuntAudio = new Audio(scope.audio || './Pascoa.mp3');
  eggHuntAudio.preload = 'none';
  let huntClicks = 0;
  let bubbleTimer = null;

  function mascot(){ return document.getElementById('bunnyMascot'); }
  function bubble(){ return document.getElementById('bunnyBubble'); }

  function showBubble(message){
    const bubbleEl = bubble();
    if (!bubbleEl) return;
    bubbleEl.textContent = message;
    bubbleEl.classList.add('is-visible');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => {
      bubbleEl.textContent = 'Oie Letícia, Feliz Páscoa! 🌸';
      bubbleEl.classList.remove('is-visible');
    }, 2500);
  }

  function burst(x, y, amount = 8){
    for (let i = 0; i < amount; i++) {
      const el = document.createElement('span');
      el.className = 'easter-pop';
      el.textContent = clickSymbols[(Math.random() * clickSymbols.length) | 0];
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      const angle = (Math.PI * 2 * i / amount) + Math.random() * 0.45;
      const dist = 30 + Math.random() * 54;
      el.style.setProperty('--dx', (Math.cos(angle) * dist).toFixed(1) + 'px');
      el.style.setProperty('--dy', (Math.sin(angle) * dist - 16).toFixed(1) + 'px');
      el.style.setProperty('--rot', ((-40 + Math.random() * 80).toFixed(1)) + 'deg');
      el.style.fontSize = (17 + Math.random() * 11) + 'px';
      scope.append(el);
      setTimeout(() => el.remove(), 980);
    }
  }

  function celebratoryShower(total = 20){
    for (let i = 0; i < total; i++) {
      setTimeout(() => {
        burst(
          Math.random() * (window.innerWidth - 40) + 20,
          Math.random() * (window.innerHeight * 0.72) + 40,
          6 + ((Math.random() * 4) | 0)
        );
      }, i * 85);
    }
  }

  scope.listen(document,'click', (e) => {
    const target = e.target;
    const isMascot = target.closest('#bunnyMascot');
    burst(e.clientX, e.clientY, isMascot ? 10 : 7);
    if (!isMascot) return;
    huntClicks += 1;
    if (huntClicks === 1) eggHuntAudio.load();

    const remaining = Math.max(0, 10 - huntClicks);
    const messages = [
      'A toca mágica se abriu só um pouquinho... 🐰',
      'Cenourinhas, flores e conquistas pra você! 🌷',
      'Esse tema nasceu pra esconder um easter egg de verdade ✨',
      'Caça aos ovinhos ativada! 🪺',
      remaining > 0 ? `Faltam ${remaining} cliques para revelar o segredo... 👀` : 'Você encontrou o portal encantado! 💖',
      'A primavera inteira sorriu pra você 🌼'
    ];
    showBubble(messages[(Math.random() * messages.length) | 0]);

    if (huntClicks < 10) return;
    huntClicks = 0;
    showBubble('EASTER EGG ENCONTRADO! 🥚✨');

    Swal.fire({
      title: '<span style="font-family:Fredoka,cursive;font-size:26px;font-weight:700;color:#de78a2;display:inline-block;text-shadow:0 0 20px rgba(244,114,182,0.32);">🥚 Easter Egg encontrado! ✨</span>',
      html: `
        <div class="romantic-photo-box">
          <img src="${scope.photo}" alt="Páscoa Cinematic" decoding="async">
        </div>
        <p style="font-size:14.4px;color:#6f5560;font-weight:600;line-height:1.78;margin:16px 0 0;">
          Escondi essa surpresa aqui porque queria que um clique qualquer
          acabasse virando um sorriso seu.
        </p>
      `,
      backdrop: 'rgba(116, 83, 96, 0.42)',
      confirmButtonText: 'Abrir o jardim encantado 🌼',
      confirmButtonColor: '#e482ad',
      customClass: { popup: 'swal2-easter-popup' },
      willOpen: () => {
        eggHuntAudio.currentTime = 0;
        eggHuntAudio.play().catch(() => {});
        celebratoryShower(20);
      },
      didClose: () => {
        eggHuntAudio.pause();
        eggHuntAudio.currentTime = 0;
      }
    });
  });
})();

};
