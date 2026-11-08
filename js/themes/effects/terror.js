/* ERP | Motion — O Olho do Abismo.
 * Hardened for the real Cinematic DOM: delegated mascot click,
 * robust SVG iris tracking and visible click particles.
 * No backend, business state, AI, charts or history manipulation.
 */
window.ERPThemeEffects['terror'] = function(scope) {
  'use strict';
  const { window, document, setTimeout, clearTimeout, requestAnimationFrame, Swal } = scope;
  const reduced = document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)');
  const motionAllowed = () => !reduced?.matches && document.documentElement.dataset.erpEffects !== 'false';
  const symbols = ['👁️', '💀', '🕯️'];

  function currentMascot() {
    return document.getElementById('eyeMascot');
  }
  function currentBubble() {
    return document.getElementById('eyeBubble');
  }
  function currentIris() {
    return currentMascot()?.querySelector('[data-terror-tracker="iris"]') || null;
  }

  // SVG iris follows the cursor. We update both the transform attribute and
  // the inline style because some Windows browsers are picky with SVG <g> CSS transforms.
  (function bindEyeTracking() {
    let rafPending = false;
    let targetX = 0;
    let targetY = 0;

    function applyIrisPosition() {
      rafPending = false;
      if (!motionAllowed()) return;
      const mascot = currentMascot();
      const iris = currentIris();
      if (!mascot || !iris || !mascot.isConnected) return;
      const box = mascot.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const nx = (targetX - (box.left + box.width / 2)) / Math.max(82, box.width * 0.88);
      const ny = (targetY - (box.top + box.height / 2)) / Math.max(90, box.height * 0.96);
      const dx = Math.max(-14, Math.min(14, nx * 15));
      const dy = Math.max(-8, Math.min(8, ny * 9));
      const value = `translate(${dx.toFixed(2)}px,${dy.toFixed(2)}px)`;
      iris.style.transform = value;
      iris.setAttribute('transform', `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
      mascot.style.setProperty('--terror-eye-x', dx.toFixed(2) + 'px');
      mascot.style.setProperty('--terror-eye-y', dy.toFixed(2) + 'px');
    }

    function queueMove(clientX, clientY) {
      targetX = clientX;
      targetY = clientY;
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(applyIrisPosition);
    }

    function reset() {
      const iris = currentIris();
      const mascot = currentMascot();
      if (!iris) return;
      iris.style.transform = '';
      iris.removeAttribute('transform');
      mascot?.style.removeProperty('--terror-eye-x');
      mascot?.style.removeProperty('--terror-eye-y');
    }

    scope.listen(document, 'mousemove', e => {
      if (!motionAllowed()) return;
      queueMove(e.clientX, e.clientY);
    }, { passive: true });
    scope.listen(document, 'pointermove', e => {
      if (e.pointerType === 'touch' || !motionAllowed()) return;
      queueMove(e.clientX, e.clientY);
    }, { passive: true });
    scope.listen(document, 'mouseleave', reset, { passive: true });
    scope.listen(window, 'blur', reset, { passive: true });
    scope.listen(document, 'keydown', e => {
      const iris = currentIris();
      if (!iris) return;
      let dx = 0, dy = 0;
      if (e.key === 'ArrowLeft') dx = -9;
      if (e.key === 'ArrowRight') dx = 9;
      if (e.key === 'ArrowUp') dy = -5;
      if (e.key === 'ArrowDown') dy = 5;
      if (!dx && !dy) return;
      const value = `translate(${dx}px,${dy}px)`;
      iris.style.transform = value;
      iris.setAttribute('transform', `translate(${dx} ${dy})`);
    });
  })();

  // Quiet analog mist: fixed 2D canvas, 18 particles, max 30 FPS.
  const canvas = document.getElementById('horrorCanvas');
  if (canvas && motionAllowed()) {
    const ctx = canvas.getContext('2d', { alpha: true });
    if (ctx) {
      let W = 0, H = 0, DPR = 1, previous = 0;
      const resize = () => {
        DPR = Math.min(1.25, window.devicePixelRatio || 1);
        W = window.innerWidth; H = window.innerHeight;
        canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      };
      resize();
      scope.listen(window, 'resize', resize, { passive: true });
      const sparks = Array.from({ length: 18 }, (_, i) => ({
        x: ((i * 37 + 12) % 97) / 97,
        y: ((i * 43 + 3) % 91) / 91,
        radius: .8 + (i % 3) * .5,
        phase: i * 1.7,
        speed: 2 + i % 5
      }));
      const frame = now => {
        requestAnimationFrame(frame);
        if (!motionAllowed() || now - previous < 1000 / 30) return;
        previous = now;
        ctx.clearRect(0, 0, W, H);
        const t = now / 1000;
        sparks.forEach((s, i) => {
          const x = s.x * W + Math.sin(t * .37 + s.phase) * 17;
          const y = ((s.y * H + t * s.speed) % (H + 20)) - 10;
          ctx.beginPath(); ctx.arc(x, y, s.radius, 0, Math.PI * 2);
          ctx.fillStyle = i % 4 === 0 ? 'rgba(232,151,173,.36)' : 'rgba(148,60,103,.25)';
          ctx.fill();
        });
      };
      requestAnimationFrame(frame);
    }
  }

  let lastBurst = 0;
  function fragments(x, y, amount = 6, festive = false) {
    if (!motionAllowed() || !Number.isFinite(x) || !Number.isFinite(y)) return;
    if (document.querySelectorAll('.terror-fragment').length > 90) return;
    const total = festive ? Math.max(amount, 9) : amount;
    for (let i = 0; i < total; i++) {
      const piece = document.createElement('span');
      piece.className = 'terror-fragment ' + (i % 4 === 0 ? 'terror-speck' : i % 3 === 0 ? 'terror-ring' : i % 3 === 1 ? 'terror-diamond' : 'terror-shard');
      piece.setAttribute('aria-hidden', 'true');
      if (!piece.classList.contains('terror-speck')) {
        piece.textContent = symbols[(i + Math.floor(Math.random() * symbols.length)) % symbols.length];
      }
      piece.style.left = x + 'px';
      piece.style.top = y + 'px';
      const a = i * Math.PI * 2 / total + (Math.random() - .5) * .25;
      const distance = 24 + Math.random() * (festive ? 60 : 44);
      piece.style.setProperty('--tx', (Math.cos(a) * distance).toFixed(1) + 'px');
      piece.style.setProperty('--ty', (Math.sin(a) * distance - 17).toFixed(1) + 'px');
      piece.style.setProperty('--turn', ((Math.random() - .5) * 140).toFixed(1) + 'deg');
      piece.style.setProperty('--scale', (0.82 + Math.random() * 0.38).toFixed(2));
      scope.append(piece);
      setTimeout(() => piece.remove(), 1650);
    }
  }

  scope.listen(document, 'click', e => {
    if (e.target?.closest?.('#cr-portal')) return;
    const now = performance.now();
    if (now - lastBurst < 90) return;
    lastBurst = now;
    fragments(e.clientX, e.clientY);
  }, { passive: true });

  // Delegated mascot click: survives the Cinematic relocation of the mascot node.
  let touches = 0, bubbleTimeout = 0;
  function bubbleMessage(text) {
    const bubble = currentBubble();
    if (!bubble) return;
    bubble.textContent = text;
    bubble.classList.add('is-visible');
    clearTimeout(bubbleTimeout);
    bubbleTimeout = setTimeout(() => {
      const liveBubble = currentBubble();
      if (liveBubble) {
        liveBubble.textContent = 'Ele observa o silêncio...';
        liveBubble.classList.remove('is-visible');
      }
    }, 2800);
  }

  // A risada usa o gerenciador de mídia do escopo do tema. Assim, a troca
  // de tema, pagehide e visibilitychange interrompem a reprodução existente.
  // Criar o player apenas quando a mensagem final for exibida.
  let epilogueAudio = null;
  let epilogueIssued = false;
  function stopEpilogueAudio() {
    if (!epilogueAudio) return;
    epilogueAudio.pause();
    try { epilogueAudio.currentTime = 0; } catch (_) {}
  }
  scope.listen(window, 'blur', stopEpilogueAudio);

  function showAftershock() {
    // Durante o descarte do tema, Swal pode concluir seu fechamento depois
    // de a troca de tema já ter começado. Nessa situação não há epílogo.
    if (scope.stats?.().disposed || document.hidden ||
        window.ERPTheme?.state?.theme !== 'terror') return;
    // Uma emissão por fechamento legítimo (não por mensagem ainda visível).
    if (epilogueIssued) return;
    epilogueIssued = true;
    // A sessão anterior pode permanecer na tela por até 2,9 s. Nesse caso,
    // substituí-la antes do novo epílogo, sem disparar áudio duplicado.
    document.querySelectorAll('.terror-epilogue-toast').forEach(oldToast => oldToast.remove());
    const toast = document.createElement('div');
    toast.className = 'terror-epilogue-toast';
    toast.setAttribute('aria-hidden', 'true');
    toast.innerHTML = `
      <div class="terror-epilogue-card">
        <div class="terror-epilogue-line">Você viu o suficiente para ser lembrado.</div>
        <div class="terror-epilogue-subline">Quando a tela escurecer de novo, não olhe para trás.</div>
        <div class="terror-epilogue-laugh">HAHAHAHA!</div>
      </div>`;
    document.body.appendChild(toast);
    // Reproduzir imediatamente após inserir o HAHAHAHA! no DOM, sem mudar
    // os cronômetros (2050/2900 ms) nem a animação CSS já aprovada.
    try {
      if (!epilogueAudio) epilogueAudio = new scope.Audio();
      stopEpilogueAudio();
      const playback = epilogueAudio.play();
      playback?.catch?.(() => {}); // autoplay negado: mensagem permanece.
    } catch (_) {
      // A mensagem deve continuar mesmo em navegadores sem áudio.
    }
    setTimeout(() => toast.classList.add('is-leaving'), 2050);
    setTimeout(() => toast.remove(), 2900);
  }

  scope.listen(document, 'click', e => {
    const mascot = e.target?.closest?.('#eyeMascot');
    if (!mascot) return;
    touches += 1;
    fragments(e.clientX, e.clientY, 10, true);
    if (touches === 1) {
      bubbleMessage('Silêncio... o olhar acompanha você.');
      return;
    }
    if (touches >= 10) {
      touches = 0;
      // Nova sessão do Easter Egg: cancelar qualquer risada do epílogo anterior.
      stopEpilogueAudio();
      epilogueIssued = false;
      bubbleMessage('O segredo do Abismo foi revelado.');
      Swal.fire({
        title: '◉ O PACTO DO ABISMO',
        html: '<div class="secret-terror-video-frame"><video data-erp-theme-video playsinline preload="auto" aria-label="Vídeo de susto do Easter Egg de Terror"></video></div>',
        background: '#09060e',
        backdrop: 'rgba(0,0,0,.95)',
        showConfirmButton: false,
        showCloseButton: true,
        allowOutsideClick: true,
        customClass: { popup: 'swal2-horror-popup' },
        didClose: () => {
          showAftershock();
        }
      });
      return;
    }
    const texts = [
      'O arquivo sabe que você está aqui.',
      'Silêncio... o olhar acompanha você.',
      'Um segredo mora nas sombras.',
      'O Abismo guarda suas conquistas.',
      'Faltam ' + (10 - touches) + ' cliques para o pacto.'
    ];
    bubbleMessage(texts[(touches - 1) % texts.length]);
  }, { passive: true });
};
