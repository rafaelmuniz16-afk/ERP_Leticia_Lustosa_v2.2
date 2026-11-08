
(() => {
  'use strict';
  const assets = window.ERPThemeAssets;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = null, serial = 0, pageSuspended = false;

  function createScope(theme) {
    const id = ++serial,
      abort = new AbortController(),
      timeouts = new Set(),
      intervals = new Map(),
      frames = new Map(),
      nodes = new Set(),
      audio = new Set(),
      globals = new Map();

    let disposed = false,
      frameId = null,
      sequence = 0,
      lastFrame = 0,
      ticking = false,
      renderedFrames = 0;

    const themeAssets = assets.themes[theme];
    const mediaControls = new Map();
    const backgroundColor = document.body.style.backgroundColor;
    const animated = () =>
      !disposed &&
      !document.hidden &&
      !pageSuspended &&
      ERPTheme.state.effects &&
      !motion.matches;

    function prune() {
      for (const n of nodes) {
        if (!n.isConnected) nodes.delete(n);
      }
    }

    function ensureFrame() {
      if (animated() && frames.size && !frameId && !ticking) {
        frameId = window.requestAnimationFrame(tick);
      }
    }

    function tick(now) {
      frameId = null;
      if (!animated()) return;

      // A física dos efeitos é calibrada para 60 quadros/s.
      if (lastFrame && now - lastFrame < 1000 / 60 - 0.7) {
        ensureFrame();
        return;
      }

      lastFrame = now;
      ticking = true;
      renderedFrames++;

      const callbacks = [...frames.values()];
      frames.clear();

      try {
        for (const cb of callbacks) {
          if (!disposed) cb(now);
        }
      } finally {
        ticking = false;
        ensureFrame();
      }
    }

    function frame(cb) {
      const token = ++sequence;
      frames.set(token, cb);
      ensureFrame();
      return token;
    }

    function timeout(cb, delay, ...args) {
      if (disposed) return 0;

      const handle = window.setTimeout(() => {
        timeouts.delete(handle);
        if (!disposed) cb(...args);
        prune();
      }, delay);

      timeouts.add(handle);
      return handle;
    }

    function clearTimeoutOwned(handle) {
      window.clearTimeout(handle);
      timeouts.delete(handle);
    }

    function interval(cb, delay, ...args) {
      const key = ++sequence;
      const entry = {
        cb: () => {
          if (!disposed) cb(...args);
        },
        delay,
        handle: null
      };

      intervals.set(key, entry);

      if (!document.hidden && !pageSuspended) {
        entry.handle = window.setInterval(entry.cb, delay);
      }

      return key;
    }

    function clearIntervalOwned(key) {
      const entry = intervals.get(key);
      if (entry) window.clearInterval(entry.handle);
      intervals.delete(key);
    }

    function refresh() {
      if (!animated() && frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
        lastFrame = 0;
      }

      for (const entry of intervals.values()) {
        if ((document.hidden || pageSuspended) && entry.handle) {
          window.clearInterval(entry.handle);
          entry.handle = null;
        } else if (
          !document.hidden &&
          !pageSuspended &&
          !entry.handle
        ) {
          entry.handle = window.setInterval(entry.cb, entry.delay);
        }
      }

      ensureFrame();
    }

    const facade = new Proxy(window, {
      get: (target, key) => target[key],
      set: (target, key, value) => {
        if (!globals.has(key)) {
          globals.set(key, {
            descriptor: Object.getOwnPropertyDescriptor(target, key),
            value
          });
        } else {
          globals.get(key).value = value;
        }

        target[key] = value;
        return true;
      }
    });

    function mediaNotice(filename, message) {
      const popup = window.Swal?.getPopup();
      if (popup?.dataset.erpEffectScope !== String(id)) return;

      let note = [...popup.querySelectorAll('.erp-media-status')]
        .find(n => n.dataset.asset === filename);

      if (!note) {
        note = document.createElement('p');
        note.className = 'erp-media-status';
        note.dataset.asset = filename;
        note.setAttribute('role', 'status');

        popup.querySelector('.swal2-html-container')?.append(note);
      }

      note.textContent = message;
    }

    function clearNotice(filename) {
      const popup = window.Swal?.getPopup();
      if (popup?.dataset.erpEffectScope !== String(id)) return;

      for (const note of popup.querySelectorAll('.erp-media-status')) {
        if (note.dataset.asset === filename) note.remove();
      }
    }

    // In the distributed ZIP, the media files already live in assets/.
    // Prefer the real location on first open, avoiding two failed lookups
    // before a jump scare or music starts. A remembered working URL wins.
    function mediaCandidates(filename, type) {
      const urls = assets.candidates(filename, type);
      if (!filename || !urls.length) return urls;
      const folder = {photo: 'images', audio: 'audio', video: 'video'}[type];
      if (!folder) return urls;
      try {
        const defaultFirst = new URL('./' + filename, document.baseURI).href;
        const preferred = new URL('./assets/' + folder + '/' + filename, document.baseURI).href;
        return urls[0] === defaultFirst && urls.includes(preferred)
          ? [preferred, ...urls.filter(u => u !== preferred)]
          : urls;
      } catch (_) {
        // Isolated HTML test harnesses can have an opaque about:blank base.
        return urls;
      }
    }

    function ownMedia(media, filename, type) {
      const urls = mediaCandidates(filename, type);
      let index = 0, wantsPlayback = false, released = false;

      const nativeLoad = media.load.bind(media);
      const nativePlay = media.play.bind(media);
      const nativePause = media.pause.bind(media);

      const available = () =>
        !disposed && !released && urls.length > 0;

      function source() {
        if (!media.getAttribute('src') && available()) {
          media.src = urls[index];
        }
      }

      function play() {
        if (!available()) return Promise.resolve();

        wantsPlayback = true;
        source();

        return nativePlay().catch(error => {
          if (
            !available() ||
            !wantsPlayback ||
            error.name === 'AbortError'
          ) {
            return;
          }

          if (error.name === 'NotAllowedError') {
            mediaNotice(
              filename,
              'O navegador bloqueou a reprodução automática desta lembrança.'
            );

            const popup = window.Swal?.getPopup();

            if (popup?.dataset.erpEffectScope === String(id)) {
              // Memory scenes never expose a visible player. The browser may
              // block unmuted autoplay; retain the original media without UI.
              media.controls = false;
            }
          }
        });
      }

      // A cena de susto deve começar sem aguardar carregamento manual.
      media.preload = type === 'video' ? 'auto' : 'none';

      media.load = () => {
        if (available()) {
          source();
          nativeLoad();
        }
      };

      media.play = play;
      media.pause = () => {
        wantsPlayback = false;
        nativePause();
      };

      media.addEventListener('error', () => {
        if (!available()) return;

        if (index + 1 < urls.length) {
          media.src = urls[++index];
          nativeLoad();

          if (wantsPlayback) void play();
        } else {
          mediaNotice(
            filename,
            'Não foi possível carregar ' + filename +
            '. Confira esse arquivo na raiz ou na pasta assets do projeto.'
          );
        }
      }, { signal: abort.signal });

      media.addEventListener('loadeddata', () => {
        if (available()) {
          assets.remember(filename, media.currentSrc || media.src);
          clearNotice(filename);
        }
      }, { signal: abort.signal });

      const control = {
        release() {
          if (released) return;

          released = true;
          wantsPlayback = false;
          nativePause();
          media.removeAttribute('src');
          nativeLoad();
          audio.delete(media);
          mediaControls.delete(media);
        }
      };

      audio.add(media);
      mediaControls.set(media, control);

      return media;
    }

    function OwnedAudio() {
      return ownMedia(
        new window.Audio(),
        themeAssets.audio,
        'audio'
      );
    }

    function stopAudio() {
      for (const media of audio) {
        media.pause();

        try {
          media.currentTime = 0;
        } catch (_) {}
      }
    }

    function bindPhoto(img) {
      const filename = themeAssets.photo;
      const urls = mediaCandidates(filename, 'photo');
      let index = 0;

      function next() {
        if (disposed || !img.isConnected) return;

        if (index + 1 < urls.length) {
          img.src = urls[++index];
        } else {
          img.hidden = true;

          mediaNotice(
            filename,
            'Não foi possível carregar ' + filename +
            '. Confira esse arquivo na raiz ou na pasta assets do projeto.'
          );
        }
      }

      img.addEventListener('error', next, {
        signal: abort.signal
      });

      img.addEventListener('load', () => {
        assets.remember(filename, img.currentSrc || img.src);
        clearNotice(filename);
      }, {
        signal: abort.signal
      });
    }

    // Secret Memories Edition — same original popup/content/media, new shared visual shell.
    // No theme activation/counter/data behavior is replaced here.
    function presentSecretMemory(popup) {
      if (!popup || popup.dataset.secretMemoryBuilt) return;
      popup.dataset.secretMemoryBuilt = 'true';
      popup.dataset.secretMemoryTheme = theme;
      const container = popup.querySelector('.swal2-html-container');
      if (!container) return;
      if (theme === 'terror') {
        popup.classList.add('secret-memory-terror');
        const video = container.querySelector('video[data-erp-theme-video]');
        if (video) {
          video.controls = false;
          video.removeAttribute('controls');
          video.setAttribute('playsinline', '');
          video.setAttribute('webkit-playsinline', '');
          video.setAttribute('disablepictureinpicture', '');
          video.setAttribute('disableremoteplayback', '');
          video.setAttribute('controlslist', 'nodownload nofullscreen noremoteplayback');
          video.tabIndex = -1;
          video.setAttribute('preload', 'auto');
        }
        return;
      }
      const boxes = [
        '.romantic-photo-box', '.executive-photo-box', '.xmas-photo-box',
        '.correio-elegante-box', '.secret-glass-photo'
      ];
      const photo = container.querySelector(boxes.join(','));
      if (!photo) return; // Keep original contents intact if markup differs.
      popup.classList.add('secret-memory-scene');
      const originalNodes = [...container.childNodes];
      const shell = document.createElement('div');
      shell.className = 'secret-memory-composition';
      // Fase 04: remove decorative label so the photo owns the visual hierarchy.
      // No alternative kicker is introduced; labels are kept in semantic theme metadata.
      const ambient = document.createElement('div');
      ambient.className = 'secret-memory-ambient';
      ambient.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < 6; i++) {
        const spark = document.createElement('i');
        spark.style.setProperty('--spark-index', String(i));
        ambient.appendChild(spark);
      }
      const layout = document.createElement('div');
      layout.className = 'secret-memory-layout';
      const stage = document.createElement('div');
      stage.className = 'secret-memory-stage';
      const note = document.createElement('div');
      note.className = 'secret-memory-note';
      for (const node of originalNodes) {
        if (node === photo) stage.appendChild(node);
        else if (node !== photo && node.nodeType === 1 && node.contains(photo)) {
          // Respect legacy photo containers with extra nesting.
          stage.appendChild(node);
        } else note.appendChild(node);
      }
      layout.append(stage, note);
      shell.append(ambient, layout);
      container.append(shell);
      const image = stage.querySelector('img');
      if (image) {
        image.setAttribute('decoding', 'async');
        image.setAttribute('loading', 'eager');
        try { image.fetchPriority = 'high'; } catch (_) {}
        image.style.objectFit = 'contain';
        // Borda própria envolvendo exatamente o quadro da fotografia,
        // nunca um grande retângulo vazio ao redor da imagem vertical.
        const frame = document.createElement('span');
        frame.className = 'secret-memory-photo-edge';
        image.parentNode.insertBefore(frame, image);
        frame.appendChild(image);
      }
      // CSS follows the existing lighting state on <html>; the photo/audio do not restart.
    }

    // Fase 04.2 — Aurora de tela inteira: o feixe vive FORA do popup.
    // Isso evita clipping/rolagem e permite alcançar o dashboard sob o backdrop.
    function mountSecretAurora(popup) {
      if (theme === 'terror' || !popup?.classList.contains('secret-memory-scene')) return () => {};
      const host = popup.parentElement;
      const photo = popup.querySelector('.secret-memory-photo-edge');
      const img = photo?.querySelector('img');
      if (!host || !photo || !img) return () => {};
      const ns = 'http://www.w3.org/2000/svg';
      const layer = document.createElement('div');
      layer.className = 'secret-memory-sky';
      layer.setAttribute('aria-hidden', 'true');
      const svg = document.createElementNS(ns, 'svg');
      svg.classList.add('secret-memory-sky-graphic');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('preserveAspectRatio', 'none');
      layer.appendChild(svg);
      host.insertBefore(layer, popup);
      let observer = null;
      let renderId = 0;
      let stopped = false;
      const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.erpEffects === 'false';
      const angles = window.innerWidth < 720
        ? [-156,-114,-72,-30,14,58,102,146]
        : [-166,-132,-98,-64,-30,4,38,72,106,140,174];
      const draw = () => {
        renderId = 0;
        if (stopped || !photo.isConnected || !layer.isConnected) return;
        const rect = photo.getBoundingClientRect();
        const W = window.innerWidth, H = window.innerHeight;
        if (rect.width < 8 || rect.height < 8 || W < 10 || H < 10) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        layer.style.setProperty('--sm-sky-x', cx.toFixed(1) + 'px');
        layer.style.setProperty('--sm-sky-y', cy.toFixed(1) + 'px');
        svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
        svg.replaceChildren();
        const rayKinds = (prefersReduced || W < 920) ? ['mist', 'ribbon'] : ['mist', 'ribbon', 'glint'];
        angles.forEach((angle, index) => {
          const a = angle * Math.PI / 180;
          const dx = Math.cos(a), dy = Math.sin(a);
          const t = Math.min((rect.width / 2 + 5) / Math.max(Math.abs(dx), .001),
                             (rect.height / 2 + 5) / Math.max(Math.abs(dy), .001));
          const x0 = cx + dx * t;
          const y0 = cy + dy * t;
          const reach = Math.hypot(W, H) * .62 + 80;
          const x1 = cx + dx * reach;
          const y1 = cy + dy * reach;
          const side = index % 2 ? 1 : -1;
          const curve = Math.min(120, reach * .12) * side;
          const nx = -dy, ny = dx;
          const d = 'M ' + x0.toFixed(1) + ' ' + y0.toFixed(1)
            + ' C ' + (x0 + dx * reach * .27 + nx * curve).toFixed(1) + ' '
            + (y0 + dy * reach * .27 + ny * curve).toFixed(1) + ' '
            + (x0 + dx * reach * .66 - nx * curve * .44).toFixed(1) + ' '
            + (y0 + dy * reach * .66 - ny * curve * .44).toFixed(1) + ' '
            + x1.toFixed(1) + ' ' + y1.toFixed(1);
          const group = document.createElementNS(ns, 'g');
          group.classList.add('secret-sky-ray');
          group.style.setProperty('--sky-delay', (-index * .42) + 's');
          group.style.setProperty('--sky-drift', (index % 2 ? '7px' : '-7px'));
          const variant = index % 3 === 0 ? 'b' : 'a';
          for (const kind of rayKinds) {
            const path = document.createElementNS(ns, 'path');
            path.setAttribute('d', d);
            path.classList.add('secret-sky-' + kind, 'secret-sky-color-' + variant);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('stroke-width', kind === 'mist' ? String(26 + (index % 3) * 6)
              : kind === 'ribbon' ? String(5 + (index % 2) * 2) : '1.6');
            group.appendChild(path);
          }
          svg.appendChild(group);
        });
      };
      const redraw = () => {
        if (stopped || renderId) return;
        renderId = window.requestAnimationFrame(draw);
      };
      redraw();
      if (typeof window.ResizeObserver === 'function') {
        observer = new window.ResizeObserver(redraw);
        observer.observe(photo); // Evita recalcular feixes ao animar a caixa do modal.
      }
      window.addEventListener('resize', redraw);
      img.addEventListener('load', redraw);
      return () => {
        stopped = true;
        window.removeEventListener('resize', redraw);
        img.removeEventListener('load', redraw);
        observer?.disconnect();
        if (renderId) window.cancelAnimationFrame(renderId);
        layer.remove();
      };
    }

    const scopedSwal = Object.create(window.Swal || null);

    scopedSwal.fire = options => {
      if (disposed || !window.Swal) {
        return Promise.resolve({ isDismissed: true });
      }

      const open = options.willOpen;
      const close = options.willClose;
      const didOpen = options.didOpen;
      const didClose = options.didClose;
      const returnFocus = document.activeElement;
      const videos = [];
      let unmountAurora = null;
      let auroraMountTimer = null;

      const sceneTitles = {
        original: 'Uma beleza para encontrar',
        claro: 'De perto, sempre',
        escuro: 'Onde a noite guarda luz',
        halloween: 'A surpresa no feitiço',
        natal: 'Entre as luzes da estação',
        'ano-novo': 'Tudo que ainda vem',
        pascoa: 'O jardim das pequenas surpresas',
        'festa-junina': 'No compasso da gente',
        cyberpunk: 'Um sinal só nosso',
        'glassy-crm': 'O que o cristal guarda',
        terror: 'O ABISMO DESPERTOU'
      };
      const isTerror = theme === 'terror';
      return window.Swal.fire({
        ...options,
        title: sceneTitles[theme] || options.title,
        // No introductory popup animation in Terror: the video starts from
        // willOpen inside the original tenth-click user action.
        ...(isTerror ? { showClass: {popup: '', backdrop: ''},
                         hideClass: {popup: '', backdrop: ''} } : {}),

        showCloseButton: true,
        customClass: {
          ...options.customClass,
          popup: (options.customClass?.popup || '') +
            ' erp-easter-egg secret-memory-popup'
        },

        willOpen: popup => {
          popup.dataset.erpEffectScope = String(id);

          popup.querySelectorAll('.swal2-html-container img')
            .forEach(bindPhoto);

          popup.querySelectorAll('video[data-erp-theme-video]')
            .forEach(video => {
              video.controls = false;
              video.removeAttribute('controls');
              video.setAttribute('playsinline', '');
              video.setAttribute('disablepictureinpicture', '');
              video.setAttribute('controlslist', 'nodownload nofullscreen noremoteplayback');
              video.volume = 1; // original level, no gain or processing
              ownMedia(video, themeAssets.video, 'video');
              videos.push(video);
              void video.play();
            });

          presentSecretMemory(popup);
          open?.(popup);
        },

        didOpen: popup => {
          // A foto e o texto pintam primeiro. A camada de 14 feixes é montada
          // em uma tarefa posterior, evitando bloquear a primeira exibição.
          didOpen?.(popup);
          /* Fase 04.5 — feixes/aurora boreal removidos por solicitação da usuária.
             Preservar os demais efeitos do Easter Egg sem montar a camada full-screen. */
          auroraMountTimer = null;
        },

        willClose: popup => {
          if (auroraMountTimer !== null) {
            if (typeof window.cancelIdleCallback === 'function') {
              try { window.cancelIdleCallback(auroraMountTimer); } catch (_) { window.clearTimeout(auroraMountTimer); }
            } else {
              window.clearTimeout(auroraMountTimer);
            }
            auroraMountTimer = null;
          }
          unmountAurora?.();
          unmountAurora = null;
          stopAudio();

          for (const video of videos) {
            mediaControls.get(video)?.release();
          }

          close?.(popup);
        },

        didClose: () => {
          unmountAurora?.();
          unmountAurora = null;
          didClose?.();
          if (returnFocus?.isConnected && typeof returnFocus.focus === 'function') {
            try { returnFocus.focus({ preventScroll: true }); } catch (_) {}
          }
        }
      });
    };

    const scope = {
      window: facade,
      document,

      // Recalcula o caminho quando a mídia for solicitada.
      // Assim, uma abertura posterior usa o caminho memorizado
      // após a primeira carga bem-sucedida.
      get photo() {
        return mediaCandidates(themeAssets.photo, 'photo')[0] || '';
      },

      get video() {
        return mediaCandidates(themeAssets.video, 'video')[0] || '';
      },

      setTimeout: timeout,
      clearTimeout: clearTimeoutOwned,
      setInterval: interval,
      clearInterval: clearIntervalOwned,
      requestAnimationFrame: frame,
      Audio: OwnedAudio,
      Swal: scopedSwal,
      stopAudio,
      refresh,

      listen(target, type, callback, options) {
        if (target === facade) target = window;

        // Um efeito recém-montado não processa o clique que
        // selecionou seu próprio tema.
        const wrapped = e => {
          if (e.target?.closest?.('#erp-settings')) return;
          if (!disposed) callback(e);
        };

        const opts = typeof options === 'boolean'
          ? { capture: options }
          : options || {};

        target.addEventListener(type, wrapped, {
          ...opts,
          signal: abort.signal
        });
      },

      append(node) {
        if (!animated()) return node;

        document.body.appendChild(node);
        nodes.add(node);

        return node;
      },

      stats() {
        prune();

        return {
          theme,
          frames: frames.size,
          renderedFrames,
          timeouts: timeouts.size,
          intervals: intervals.size,
          particles: nodes.size,
          disposed
        };
      },

      dispose() {
        if (disposed) return;

        disposed = true;
        abort.abort();

        if (frameId) {
          window.cancelAnimationFrame(frameId);
        }

        for (const h of timeouts) {
          window.clearTimeout(h);
        }

        for (const entry of intervals.values()) {
          window.clearInterval(entry.handle);
        }

        frames.clear();
        timeouts.clear();
        intervals.clear();

        for (const n of nodes) n.remove();
        nodes.clear();

        stopAudio();

        for (const control of [...mediaControls.values()]) {
          control.release();
        }

        audio.clear();

        const popup = window.Swal?.getPopup();

        if (popup?.dataset.erpEffectScope === String(id)) {
          window.Swal.close();
        }

        for (const [key, old] of globals) {
          if (window[key] === old.value) {
            if (old.descriptor) {
              Object.defineProperty(window, key, old.descriptor);
            } else {
              delete window[key];
            }
          }
        }

        globals.clear();
        document.body.style.backgroundColor = backgroundColor;
      }
    };

    return scope;
  }

  window.ERPThemeRuntime = Object.freeze({
    mount(theme) {
      current?.dispose();
      current = createScope(theme);
      ERPThemeEffects[theme](current);
    },

    unmount() {
      current?.dispose();
      current = null;
    },

    refresh() {
      current?.refresh();
    },

    stats() {
      return current?.stats() || null;
    }
  });

  function visibility() {
    document.documentElement.dataset.erpPaused = String(document.hidden);
    current?.refresh();

    if (document.hidden) current?.stopAudio();
  }

  document.addEventListener('visibilitychange', visibility);

  motion.addEventListener('change', () => current?.refresh());

  window.addEventListener('pagehide', e => {
    pageSuspended = true;
    current?.refresh();
    current?.stopAudio();

    if (!e.persisted) {
      current?.dispose();
      current = null;
    }
  });

  window.addEventListener('pageshow', () => {
    pageSuspended = false;
    current?.refresh();
  });
})();
