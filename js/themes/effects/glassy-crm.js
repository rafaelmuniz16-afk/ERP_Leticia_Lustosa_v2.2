(() => {
  'use strict';
  // Todo recurso pertence ao escopo existente: a troca de tema interrompe
  // frames, áudio, listeners e partículas sem alterar dados do ERP.
  window.ERPThemeEffects['glassy-crm'] = scope => {
    const {document, window, Swal} = scope;
    // The former full-screen 30 FPS ambient canvas has been retired.
    // Crystal atmosphere now uses static layered CSS gradients.
    const mascot = document.getElementById('glassyMascot');
    const bubble = document.getElementById('glassyBubble');
    if(!mascot || !bubble)return;
    const motion = globalThis.matchMedia('(prefers-reduced-motion: reduce)');
    const moving = () => window.ERPTheme.state.effects && !motion.matches && !document.hidden;
    const audio = new scope.Audio();
    let clicks=0,bubbleTimer=0;
    let secretOpening = false;
    const particles=new Set();
    // Fase 02: pontos de clique com emojis cristalinos legíveis (não
    // apenas caracteres geométricos). O listener continua pertencendo ao
    // escopo do runtime e é descartado automaticamente na troca de tema.
    function burst(event) {
      if (!moving() || particles.size >= 36) return;
      const targetRect = event.detail === 0 ? event.target?.getBoundingClientRect?.() : null;
      const rawX = targetRect ? targetRect.left + targetRect.width / 2 : event.clientX;
      const rawY = targetRect ? targetRect.top + targetRect.height / 2 : event.clientY;
      if (!Number.isFinite(rawX) || !Number.isFinite(rawY)) return;
      const x = Math.max(18, Math.min(window.innerWidth - 18, rawX));
      const y = Math.max(18, Math.min(window.innerHeight - 18, rawY));
      const glyphs = ['💎', '🫧', '✨', '💠', '✦'];
      for (let i = 0; i < glyphs.length && particles.size < 36; i++) {
        const el = document.createElement('span');
        el.className = 'glassy-click-spark';
        el.setAttribute('aria-hidden', 'true');
        el.textContent = glyphs[i];
        const angle = i * (Math.PI * 2 / glyphs.length) + Math.random() * .24;
        const distance = 26 + Math.random() * 29;
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
        el.style.setProperty('--dy', Math.sin(angle) * distance - 16 + 'px');
        el.style.setProperty('--spin', (Math.random() * 70 - 35) + 'deg');
        scope.append(el);
        if (!el.isConnected) continue;
        particles.add(el);
        scope.setTimeout(() => { el.remove(); particles.delete(el); }, 920);
      }
    }
    // Pearl Memory Prism / Obsidian Memory Eclipse use only the active
    // data-glass-light state; the lighting engine itself is untouched.
    // The old character-matrix photography effect is intentionally retired.
    function openSecret() {
      if (secretOpening) return;
      secretOpening = true;
      scope.clearTimeout(bubbleTimer);
      bubble.textContent = 'Conexão eterna desbloqueada. ♡';
      bubble.classList.add('is-visible');
      // O décimo clique já é uma interação legítima do usuário: não aguardar
      // RAF do runtime, preload, decode, rede, filtros ou conclusão do áudio.
      // O áudio original começa no willOpen, preservando a autorização gestual.
      try {
        const opened = Swal.fire({
          title: 'Rafael + Letícia · conexão eterna',
          html: '<div class="secret-glass-photo"><img src="' + scope.photo + '" alt="Fotografia original de Rafael e Letícia" decoding="async"></div><p class="glassy-matrix-message">Essa fotografia já diz muita coisa sozinha.<br><strong>Eu só queria dar a ela um lugar especial para você encontrar.</strong></p>',
          customClass: { popup: 'glassy-matrix-popup' },
          backdrop: 'rgba(4,8,20,.83)',
          allowOutsideClick: false,
          allowEscapeKey: true,
          showClass: { popup: '', backdrop: '' },
          hideClass: { popup: '', backdrop: '' },
          confirmButtonText: 'Nossa conexão é eterna ♡',
          confirmButtonColor: '#7560b4',
          willOpen: () => {
            try { audio.currentTime = 0; } catch (_) {}
            const playback = audio.play();
            playback?.catch?.(() => {});
          },
          willClose: () => {
            audio.pause();
            try { audio.currentTime = 0; } catch (_) {}
          },
          didClose: () => {
            secretOpening = false;
            if (bubble.isConnected) {
              bubble.textContent = 'A luz revela novas possibilidades. ✧';
              bubble.classList.remove('is-visible');
            }
          }
        });
        // Proteção para saídas anormais do SweetAlert, sem fechar por timer.
        if (opened && typeof opened.then === 'function') {
          void opened.then(() => { secretOpening = false; }, () => { secretOpening = false; });
        }
      } catch (error) {
        secretOpening = false;
        throw error;
      }
    }
    scope.listen(document,'click',burst,{capture:true,passive:true});
    scope.listen(mascot, 'click', (event) => {
      clicks++;
      bubble.classList.add('is-visible');
      if (clicks === 10) {
        clicks = 0;
        event.stopPropagation();
        openSecret();
        return;
      }
      const messages = ['Conexão cristalina, Letícia. ◈', 'Há uma memória especial neste cristal. ♡', 'Ciano, violeta e uma surpresa só sua. ✦'];
      bubble.textContent = clicks > 6 ? 'Faltam ' + (10 - clicks) + ' toques para revelar nossa conexão. ♡' : messages[(clicks - 1) % messages.length];
      scope.clearTimeout(bubbleTimer);
      bubbleTimer = scope.setTimeout(() => {bubble.classList.remove('is-visible');bubble.textContent = 'A luz revela novas possibilidades. ✧';}, 2800);
    });
    // No continuous ambient frame loop: animation starts only inside the Easter egg.
  };
})();
