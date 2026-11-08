/* ERP | Motion & Animações — Radar Financeiro: apresentação apenas.
 * O diagnóstico, seus textos, valores, ordem e rotação continuam sendo
 * fornecidos integralmente pelos módulos originais. Este módulo apenas
 * troca a aparência do emoji inicial por um ícone SVG vetorial.
 */
(() => {
  'use strict';

  const CINEMATIC = new Set(['original','claro','escuro','natal','ano-novo','pascoa','halloween','festa-junina','terror','cyberpunk','glassy-crm']);

  const GLYPHS = Object.freeze({
    '📈': 'trend', '🏆': 'award', '🎯': 'target', '💰': 'wallet',
    '💵': 'wallet', '✨': 'sparkle', '⭐': 'sparkle', '⏱️': 'clock',
    '⚡': 'zap', '✅': 'check', '⚠️': 'alert', '💎': 'gem',
    '💼': 'briefcase', '🤝': 'handshake', '🎉': 'sparkle', '📁': 'archive',
    '📊': 'chart', '📅': 'calendar', '📌': 'pin', '🏁': 'flag'
  });

  // Geometria autoral simples, sem fontes de ícones, emojis ou recursos externos.
  const DRAWINGS = Object.freeze({
    trend: '<path d="M3.8 16.3 9.2 11l4.1 3.6 6.9-7.1"/><path d="M14.8 7.5h5.4v5.4"/>',
    award: '<circle cx="12" cy="9" r="5"/><path d="m8.7 13.1-1.3 7 4.6-2.6 4.6 2.6-1.3-7"/><path d="m12 6.6.6 1.6h1.8l-1.5 1.1.6 1.7L12 10l-1.5 1 .6-1.7-1.5-1.1h1.8z"/>',
    target: '<circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.4"/>',
    wallet: '<rect x="3.6" y="6" width="16.8" height="12.6" rx="2.8"/><path d="M5 6V4.9A1.8 1.8 0 0 1 6.8 3h10M15.5 10.5h5v3.8h-5a1.9 1.9 0 0 1 0-3.8z"/><circle cx="16.4" cy="12.4" r=".7" fill="currentColor" stroke="none"/>',
    sparkle: '<path d="m12 2.9 2.2 6.8L21 12l-6.8 2.3L12 21.1l-2.3-6.8L3 12l6.7-2.3z"/><path d="m19 3 .7 2.1L22 6l-2.3.8L19 9"/>',
    clock: '<circle cx="12" cy="12" r="8.8"/><path d="M12 7.4v5.1l3.4 2"/>',
    zap: '<path d="m13.9 2.8-9 10.1h6.5l-1.3 8.3 9-10.1h-6.5z"/>',
    check: '<circle cx="12" cy="12" r="8.7"/><path d="m8 12.2 2.7 2.7 5.3-5.5"/>',
    alert: '<path d="M10.5 4.5a1.8 1.8 0 0 1 3 0l8 13.2a1.9 1.9 0 0 1-1.5 2.8H4a1.9 1.9 0 0 1-1.5-2.8z"/><path d="M12 9.1v4.9M12 17.2h.01"/>',
    gem: '<path d="M7.3 4.6h9.4l4 5.2L12 20.6 3.3 9.8z"/><path d="M3.3 9.8h17.4M8.1 4.6 6.5 9.8 12 20.6l5.5-10.8-1.6-5.2"/>',
    briefcase: '<rect x="3.2" y="7.2" width="17.6" height="12.2" rx="2.3"/><path d="M8.7 7.2V5.4A1.8 1.8 0 0 1 10.5 3.6h3A1.8 1.8 0 0 1 15.3 5.4v1.8M3.2 12.5c5.2 3.2 12.4 3.2 17.6 0M10.7 13.8h2.6"/>',
    handshake: '<path d="M3.4 9.2 6.2 6l4.5 1.1 2 1.7 2-1.7L18 6l2.6 3.2-3 3.3-3.3-2.2-3.5 2.7 4.2 3.7a1.3 1.3 0 0 1-1.8 1.9l-1.4-1.2M8.8 15.6l-1.3 1.2a1.4 1.4 0 0 1-2-1.8l2.2-2.2M11.6 17.2l-1.3 1.1a1.4 1.4 0 0 1-2-1.9"/>',
    archive: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M3 3.4h18v4H3zM9.5 12h5"/>',
    chart: '<path d="M4.2 19.7h15.6M6.8 16.2v-4M11.9 16.2V6.7M17 16.2V9.7" stroke-width="3.1" stroke-linecap="round"/>',
    calendar: '<rect x="3.8" y="5.8" width="16.4" height="14.7" rx="2"/><path d="M7.5 3.5v4.2M16.5 3.5v4.2M3.8 10h16.4M7.8 14h3M13.3 14h3M7.8 17.1h3"/>',
    pin: '<path d="M9 4.6h6l-.8 5.3 2.7 2.4v1.3H7.1v-1.3l2.7-2.4zM12 13.6v7"/>',
    flag: '<path d="M5 3.7v16.6M5 4.8c4.2-2.2 6 2 10.1.1l3.2-1.2v9.1l-3.2 1.2C11 15.9 9.2 11.7 5 14"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 10.7v5.1M12 7.6h.01"/>'
  });

  const PREFIX = /^(\s*)(📈|🏆|🎯|💰|💵|✨|⭐|⏱️|⚡|✅|⚠️|💎|💼|🤝|🎉|📁|📊|📅|📌|🏁)(\s*)/u;
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const create = (tag, className) => {
    const node = document.createElement(tag);
    node.className = className;
    return node;
  };

  function decorate(message) {
    if (!message || message.querySelector(':scope > .motion-radar-icon')) return;
    const original = message.textContent || '';
    if (!original.trim()) return;
    const match = PREFIX.exec(original);
    const leading = match ? match[0] : '';
    const iconKind = match ? (GLYPHS[match[2]] || 'info') : 'info';
    const visible = original.slice(leading.length);

    const icon = create('span', 'motion-radar-icon');
    icon.setAttribute('aria-hidden', 'true');
    icon.dataset.kind = iconKind;
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.7');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = DRAWINGS[iconKind]; // fixed application-owned SVG paths, no user input.
    icon.appendChild(svg);

    const content = create('span', 'motion-radar-content');
    // Invisible original prefix preserves textContent byte for byte. The
    // Aurora view checks textContent before updates; its logic is untouched.
    if (leading) {
      const hidden = create('span', 'motion-radar-original');
      hidden.textContent = leading;
      hidden.setAttribute('aria-hidden', 'true');
      content.appendChild(hidden);
    }
    const colon = /^([^:]{2,72}:)(\s*)([\s\S]*)$/u.exec(visible);
    if (colon) {
      const label = create('span', 'motion-radar-keyword');
      label.textContent = colon[1];
      content.appendChild(label);
      content.appendChild(document.createTextNode(colon[2] + colon[3]));
    } else {
      content.appendChild(document.createTextNode(visible));
    }
    message.replaceChildren(icon, content);
    // no changes to message value for data/comparison/screen reader purposes
  }

  function start() {
    const message = document.getElementById('sideAuroraMsg');
    if (!message) return;
    const syncAppearance = () => {
      if (CINEMATIC.has(document.documentElement.dataset.erpTheme)) {
        decorate(message);
      } else if (message.querySelector(':scope > .motion-radar-icon')) {
        // Restore the exact original text in the two legacy visual themes.
        message.textContent = message.textContent;
      }
    };
    syncAppearance();
    const observer = new MutationObserver(syncAppearance);
    observer.observe(message, { childList: true });
    const themeObserver = new MutationObserver(syncAppearance);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-erp-theme'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
