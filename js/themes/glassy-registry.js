(() => {
  'use strict';
  // Reutiliza apenas a estrutura de metadados e presets; nenhum dado do ERP.
  const theme = structuredClone(window.ERPThemeRegistry.escuro);
  const icon = path => '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';
  Object.assign(theme, {
    id: 'glassy-crm', name: 'Glass', mode: 'dark', icon: '◈',
    description: 'Cristal líquido e duas atmosferas: Pearl Crystal e Midnight Obsidian.',
    primary: '#7f8ddb', secondary: '#5fbfda', decor: '<button type="button" id="glassyMascot" class="glassy-mascot" aria-label="MIRA, mascote de cristal, clique para interagir"><img class="glassy-companion-art" src="assets/rebirth/glass-mira-companion.svg" alt="" aria-hidden="true"><span id="glassyBubble" class="glassy-bubble">A luz revela novas possibilidades. ✧</span></button>', extras: '', idStyles: {},
    font: window.ERPThemeRegistry.original.font,
    source: 'Referências fornecidas: Glass — Liquid Glass Edition, Innovation Lab',
    brand: '<div class="brand"><div class="brand-mark">' + icon('<path d="m12 3 9 9-9 9-9-9Z"/><path d="m12 7 5 5-5 5-5-5Z"/>') + '</div><div><div class="brand-title">Leticia Lustosa</div><div class="brand-sub">ERP • Encerramentos 2026</div></div></div>',
    header: '<div class="eyebrow">GLASS <span class="glassy-live-dot"></span></div><h1 class="page-title">Olá, Letícia</h1><p class="page-subtitle">Seu espaço de trabalho · Encerramentos 2026</p>',
    static: {
      '.eyebrow': ['GLASS <span class="glassy-live-dot"></span>'],
      '.page-title': ['Olá, Letícia'], '.page-subtitle': ['Seu espaço de trabalho · Encerramentos 2026'],
      '.side-aurora-name': ['Aurora Live'], '.side-aurora-tag': ['RADAR'], '.side-aurora-avatar': ['✦'],
      '.side-card-title': ['Conexão com a nuvem']
    },
    navIcons: [
      icon('<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>'),
      icon('<path d="M12 5v14M5 12h14"/>'),
      icon('<path d="M8 3h8l4 4v14H4V3Z"/><path d="M8 11h8M8 15h8M8 7h3"/>'),
      icon('<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>'),
      icon('<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/>')
    ],
    kpiIcons: ['◈', '↯', '✓', '◎']
  });
  for (const [id, chart] of Object.entries(theme.charts)) {
    if (id === 'tiposChart') Object.assign(chart.style, {backgroundColor: ['#7f8ddb', '#5fbfda', '#cf9bc8', '#78b8a1'], borderColor: 'transparent'});
    if (id === 'linhaChart') Object.assign(chart.style, {borderColor: '#7f8ddb', backgroundColor: 'rgba(127,141,219,.10)', pointBackgroundColor: '#9dbad5', borderWidth: 2});
  }
  window.ERPThemeRegistry['glassy-crm'] = theme;
})();
