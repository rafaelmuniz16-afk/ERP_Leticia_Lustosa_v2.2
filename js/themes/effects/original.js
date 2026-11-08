window.ERPThemeEffects["original"] = function(scope){
const {window,document,setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame,Audio,Swal}=scope;
const $=id=>document.getElementById(id);


// ==== FOFURA INTERATIVA & EASTER EGG (10 CLIQUES COM MÚSICA) ====
(function() {
  // SVG evita caracteres de emoji ausentes na fonte do Edge/Windows.
  const heart = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.2 3.5 13A5.5 5.5 0 0 1 11.9 5.9L12 6l.1-.1a5.5 5.5 0 0 1 8.4 7.1Z"/></svg>';
  const star = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="m12 1.7 2.1 7.2 7.3 2.1-7.3 2.2-2.1 7.1-2.2-7.1L2.6 11l7.2-2.1Z"/></svg>';
  const romanticAudio = new Audio('./musica.mp3');
  romanticAudio.preload = 'none';

  function pop(x, y) {
    const amount = 7;
    for (let i = 0; i < amount; i++) {
      const el = document.createElement('span');
      el.className = (i % 2 ? 'cute-heart' : 'cute-star');
      el.innerHTML = i % 2 ? heart : star;
      el.style.color = ['#e36cae','#b17de9','#f6c862','#8c9df6'][i % 4];
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      const angle = (Math.PI * 2 * i / amount) + Math.random() * 0.55;
      const dist = 24 + Math.random() * 46;
      el.style.setProperty('--dx', (Math.cos(angle) * dist).toFixed(1) + 'px');
      el.style.setProperty('--dy', (Math.sin(angle) * dist - 18).toFixed(1) + 'px');
      el.style.setProperty('--rot', ((-35 + Math.random() * 70).toFixed(1)) + 'deg');
      el.style.fontSize = (13 + Math.random() * 11) + 'px';
      scope.append(el);
      setTimeout(() => el.remove(), 1000);
    }
  }

  window.popCute = pop;

  scope.listen(document,'click', e => {
    if (e.target.closest('#cr-portal')) return;
    pop(e.clientX, e.clientY);
  });

  const masc = document.getElementById('unicornMascot');
  const bubble = document.getElementById('unicornBubble');
  const defaultBubbleText = 'Oii, Letícia ♡';
  let unicornClicks = 0;
  let bubbleResetTimer = null;

  if (masc && bubble) {
    scope.listen(masc,'click', (e) => {
      unicornClicks++;
      pop(e.clientX, e.clientY);

      if (unicornClicks === 1) {
        romanticAudio.load();
      }

      if (unicornClicks === 10) {
        unicornClicks = 0;
        bubble.textContent = 'SURPRESA! ♡';
        clearTimeout(bubbleResetTimer);

        Swal.fire({
          title: '<span>TE AMO, LETÍCIA!</span>',
          html: `
            <div class="romantic-photo-box">
              <img src="${scope.photo}" alt="Te amo, Leticia" decoding="async">
            </div>
            <p style="font-size:14px; color:#6b4d70; font-weight:600; line-height:1.7; margin:14px 0 0;">
              Não precisava de uma ocasião especial.
              Só queria deixar uma coisa bonita aqui para você encontrar.
            </p>
          `,
          background: '#fff8fc',
          backdrop: 'rgba(93, 69, 104, 0.65)',
          confirmButtonText: 'Eu te amo infinito!',
          confirmButtonColor: '#df6ba6',
          customClass: { popup: 'swal2-romantic-popup' },
          willOpen: () => {
            romanticAudio.currentTime = 0;
            romanticAudio.play().catch(err => console.log('Áudio automático dependeu de clique:', err));
            for (let i = 0; i < 18; i++) {
              setTimeout(() => {
                const rx = Math.random() * (window.innerWidth - 60) + 30;
                const ry = Math.random() * (window.innerHeight * 0.7) + 50;
                pop(rx, ry);
              }, i * 90);
            }
          },
          didClose: () => {
            romanticAudio.pause();
            romanticAudio.currentTime = 0;
            bubble.textContent = defaultBubbleText;
          }
        });
        return;
      }

      const msgs = [
        'Clicou em mim! ♡',
        'Glitter e foco ativados! ✦',
        'A Letícia é a melhor do mundo! ♡',
        'Tudo fica bem com unicórnios! ✦',
        'Eu te amo infinitamente! ♡',
        'Faltam ' + (10 - unicornClicks) + ' cliques para o segredo...',
        'Você está quase descobrindo a surpresa... ♡'
      ];
      bubble.textContent = msgs[Math.floor(Math.random() * msgs.length)];
      clearTimeout(bubbleResetTimer);
      bubbleResetTimer = setTimeout(() => {
        bubble.textContent = defaultBubbleText;
      }, 2400);
    });
  }

  const origToast = window.toast;
  window.toast = function(icon, title) {
    if (typeof origToast === 'function') origToast(icon, title);
    if (window.innerWidth > 700) pop(window.innerWidth - 48, 85);
  };
})();

};
