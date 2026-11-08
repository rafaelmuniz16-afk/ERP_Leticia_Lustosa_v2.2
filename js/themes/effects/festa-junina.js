window.ERPThemeEffects["festa-junina"] = function(scope){
const {window,document,setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame,Audio,Swal}=scope;
const $=id=>document.getElementById(id);


// ==== FESTA JUNINA INTERATIVA & CORREIO ELEGANTE (10 CLIQUES) ====
(function() {
  // Somente figuras que remetem ao arraiá; sem estrelas ou brilhos genéricos.
  const juninaEmojis = ['🌽', '👒', '🔥']; // Emojis amplamente compatíveis; sem sanfona Unicode 13.0.
  const colors = ['#df8762','#f1ca78','#68a988','#79a9cf','#bc8eac'];
  const juninaAudio = new Audio('./musica.mp3');
  juninaAudio.preload = 'none';
  let lastBurst = 0;
  function popJunina(x, y, festive = false) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    // Cap at 100 in-flight DOM particles. Listeners/timers belong to the theme scope.
    if (document.querySelectorAll('.junina-particle').length > 94) return;
    const amount = festive ? 9 : 6;
    for (let i = 0; i < amount; i++) {
      const el = document.createElement('span');
      const speck = i % 3 === 2; // Mais figuras juninas visíveis, sem excesso de confete.
      el.className = 'junina-particle' + (speck ? ' jn-speck' : '');
      if (!speck) el.textContent = juninaEmojis[(i + Math.floor(Math.random()*juninaEmojis.length)) % juninaEmojis.length];
      else el.style.background = colors[(i + Math.floor(Math.random()*5)) % colors.length];
      el.setAttribute('aria-hidden','true');
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      const angle = (Math.PI * 2 * i / amount) + Math.random() * .31;
      const dist = 25 + Math.random() * (festive ? 64 : 42);
      el.style.setProperty('--dx', (Math.cos(angle) * dist).toFixed(1) + 'px');
      el.style.setProperty('--dy', (Math.sin(angle) * dist - 18).toFixed(1) + 'px');
      el.style.setProperty('--rot', ((-60 + Math.random() * 120).toFixed(1)) + 'deg');
      scope.append(el);
      setTimeout(() => el.remove(), 1650); // Após os 1,55 s da animação.
    }
  }
  window.popJunina = popJunina;
  scope.listen(document,'click', e => {
    // Never cancel, stop propagation, or capture the real ERP click.
    if (e.target?.closest?.('#cr-portal')) return;
    const now = performance.now();
    if (now - lastBurst < 85) return;
    lastBurst = now;
    popJunina(e.clientX, e.clientY);
  });

  const masc = document.getElementById('juninaMascot');
  const bubble = document.getElementById('juninaBubble');
  let mascotClicks = 0;
  let bubbleResetTimer = null;

  if (masc && bubble) {
    scope.listen(masc,'click', (e) => {
      mascotClicks++;
      popJunina(e.clientX, e.clientY, true);
      bubble.classList.add('is-visible');

      if (mascotClicks === 1) {
        juninaAudio.load();
      }

      if (mascotClicks === 10) {
        mascotClicks = 0;
        bubble.textContent = 'CORREIO ELEGANTE DO RAFA! 💌🔥';

        Swal.fire({
          title: '<span style="font-family:Fredoka,sans-serif;font-size:26px;font-weight:700;color:#d9381e;display:inline-block;text-shadow:0 2px 10px rgba(217,56,30,0.2);">💌 CORREIO ELEGANTE DE SÃO JOÃO 💌</span>',
          html: `
            <div class="correio-elegante-box">
              <img src="${scope.photo}" alt="Lelê no Arraiá" decoding="async">
            </div>
            <div style="font-size:14px; color:#5c2406; font-weight:600; line-height:1.78; margin:16px auto 0; max-width:440px; text-align:center;">
              Se a vida fosse um forró,
              eu continuaria procurando sua mão no meio da festa.
            </div>
          `,
          background: '#fffdf7',
          backdrop: 'rgba(69, 26, 3, 0.65)',
          confirmButtonText: 'Eu Te Amo Sem Fim, Minha Chica Benta! 💖🌽🔥',
          confirmButtonColor: '#ea580c',
          customClass: { popup: 'swal2-junina-popup' },
          willOpen: () => {
            juninaAudio.currentTime = 0;
            juninaAudio.play().catch(err => console.log('Autoplay dependente de interação:', err));
            for (let i = 0; i < 18; i++) {
              setTimeout(() => {
                const rx = Math.random() * (window.innerWidth - 60) + 30;
                const ry = Math.random() * (window.innerHeight * 0.7) + 50;
                popJunina(rx, ry, true);
              }, i * 60);
            }
          },
          didClose: () => {
            juninaAudio.pause();
            juninaAudio.currentTime = 0;
          }
        });
        return;
      }

      const msgs = [
        'Anarriê! Puxa o fole, Letícia! 🌽',
        'Olha a chuva de encerramento! ... É mentiraaa! 🌽',
        'A quadrilha jurídica mais afinada do Ceará! 🤠',
        'Sou é doidinho de amor por você! 💖',
        'Fogueira acesa e metas batidas! 🔥',
        'Correio elegante: faltam ' + (10 - mascotClicks) + ' cliques... 👀',
        'Segredo junino se aproximando... 🤫🍿'
      ];
      bubble.textContent = msgs[Math.floor(Math.random() * msgs.length)];
      clearTimeout(bubbleResetTimer);
      bubbleResetTimer = setTimeout(() => {
        bubble.textContent = 'Anarriê, Letícia! 🔥';
        bubble.classList.remove('is-visible');
      }, 2600);
    });
  }

  const origToast = window.toast;
  window.toast = function(icon, title) {
    if (typeof origToast === 'function') origToast(icon, title);
    if (window.innerWidth > 700) popJunina(window.innerWidth - 48, 85);
  };
})();

};
