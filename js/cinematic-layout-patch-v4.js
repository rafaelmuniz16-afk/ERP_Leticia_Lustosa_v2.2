/* ERP 2.1.3 Cinematic Rebirth — interaction-safe layout patch.
 * Does not modify ERP data, endpoints, formulas, storage, or backend.
 * History and its original filter controls are moved, not cloned.
 */
(() => {
  'use strict';
  const isCinematic = () => ['original','halloween','claro','escuro','natal','ano-novo','pascoa','festa-junina','terror','cyberpunk','glassy-crm'].includes(document.documentElement.dataset.erpTheme);
  const byId = id => document.getElementById(id);
  const history = byId('historico');
  const filters = document.querySelector('.main > .filters');
  const main = document.querySelector('.main');
  if (!history || !filters || !main) return;

  // Insertion points allow a lossless return to each of the nine original layouts.
  const historyHome = document.createComment('original history location');
  history.after(historyHome);
  const filterHome = document.createComment('original filter location');
  filters.after(filterHome);

  const header = history.querySelector('.panel-head');
  const filterSlot = document.createElement('div');
  filterSlot.className = 'cr-history-filter-slot';
  const filterTitle = document.createElement('div');
  filterTitle.className = 'cr-filter-title';
  filterTitle.textContent = 'Filtros e pesquisa';
  filterSlot.append(filterTitle);
  header?.insertAdjacentElement('afterend',filterSlot);

  const backdrop = byId('historyModalBackdrop');
  const search = byId('searchInput');
  const close = byId('btnCloseHistoryModal');
  const inFormLink = byId('btnOpenHistoryInline');
  const navHistory = document.querySelector('.nav-btn[data-target="historico"]');
  let returnFocus = null;

  function placeElements() {
    if (isCinematic()) {
      if (history.parentElement !== document.body) document.body.append(history);
      if (filters.parentElement !== filterSlot) filterSlot.append(filters);
      history.setAttribute('role','dialog');
      history.setAttribute('aria-modal','true');
      history.setAttribute('aria-label','Histórico de casos');
      if (!document.body.classList.contains('history-open')) history.setAttribute('aria-hidden','true');
    } else {
      closeHistory(false);
      if (filterHome.parentNode && filters.nextSibling !== filterHome) filterHome.before(filters);
      if (historyHome.parentNode && history.nextSibling !== historyHome) historyHome.before(history);
      history.removeAttribute('role');
      history.removeAttribute('aria-modal');
      history.removeAttribute('aria-hidden');
      history.removeAttribute('aria-label');
    }
  }

  function openHistory(focusSearch = false) {
    if (!isCinematic()) {
      history.scrollIntoView({behavior:'smooth',block:'start'});
      return;
    }
    placeElements();
    returnFocus = document.activeElement;
    // Another overlay must not intercept this modal.
    if (byId('aiDrawer')?.classList.contains('ai-open') && typeof window.closeAI === 'function') window.closeAI();
    document.body.classList.add('history-open');
    history.setAttribute('aria-hidden','false');
    if (backdrop) backdrop.hidden = false;
    window.requestAnimationFrame(() => {
      (focusSearch ? search : close)?.focus({preventScroll:true});
    });
  }

  function closeHistory(restoreFocus = true) {
    if (!document.body.classList.contains('history-open')) return;
    document.body.classList.remove('history-open');
    history.setAttribute('aria-hidden', isCinematic() ? 'true':'false');
    if (backdrop) backdrop.hidden = true;
    if (restoreFocus && returnFocus?.isConnected && typeof returnFocus.focus === 'function') {
      returnFocus.focus({preventScroll:true});
    }
  }

  // The original record editor fills the existing registration form on click.
  // Close the cinematic History overlay *before* its own button listener runs,
  // so that form and focus become visible. CRUD and cloud actions stay untouched.
  history.addEventListener('click', event => {
    if (!isCinematic() || !document.body.classList.contains('history-open')) return;
    const action = event.target?.closest?.('.actions button.icon-btn');
    if (!action || !history.contains(action) || action.title !== 'Editar') return;
    // Move focus out of the soon-to-be-hidden dialog before setting aria-hidden.
    byId('idCaso')?.focus({preventScroll:true});
    closeHistory(false);
  }, true);

  // Public API is presentation-only and used by the existing top search action.
  window.erpOpenHistoryModal = ({focusSearch=false}={}) => openHistory(focusSearch);
  window.erpCloseHistoryModal = () => closeHistory();

  // Capture registered here takes precedence over the legacy scrollIntoView handler.
  [inFormLink, navHistory].filter(Boolean).forEach(button => {
    button.addEventListener('click',event => {
      if (!isCinematic()) return;
      event.preventDefault(); event.stopImmediatePropagation();
      openHistory(false);
    },true);
  });
  [close,backdrop].filter(Boolean).forEach(button => {
    button.addEventListener('click',event => {
      if (!isCinematic()) return;
      event.preventDefault(); event.stopImmediatePropagation();
      closeHistory();
    },true);
  });
  document.addEventListener('keydown',event => {
    if (!isCinematic()) return;
    if (event.key === 'Escape' && document.body.classList.contains('history-open')) {
      event.preventDefault(); closeHistory();
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault(); openHistory(true);
    }
  },true);

  // The JS source of truth remains the existing change event from the theme runtime.
  document.addEventListener('erp:appearance-change',() => {
    placeElements();
  });

  placeElements();
})();
