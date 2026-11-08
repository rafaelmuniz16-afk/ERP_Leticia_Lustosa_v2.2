/* ERP | Motion — Atalhos visuais de mês e meta no cabeçalho Cinematic.
 * Espelha os controles originais do Histórico, sem duplicar persistência,
 * alterar cálculos ou chamar endpoints. O ERP continua com os mesmos IDs
 * oficiais: filterMonth e metaInput.
 */
(() => {
  'use strict';
  const get = id => document.getElementById(id);
  const isValidOption = (select, value) => Array.from(select.options).some(o => o.value === value);

  function init() {
    const originalMonth = get('filterMonth');
    const originalGoal = get('metaInput');
    const shortcutMonth = get('crMonthShortcut');
    const shortcutGoal = get('crGoalShortcut');
    if (!originalMonth || !originalGoal || !shortcutMonth || !shortcutGoal) return;

    function syncFromSource() {
      // Nomes e ordem dos meses são definidos pelo ERP existente.
      const sourceOptions = Array.from(originalMonth.options);
      const differs = shortcutMonth.options.length !== sourceOptions.length ||
        sourceOptions.some((o, i) => shortcutMonth.options[i]?.value !== o.value || shortcutMonth.options[i]?.textContent !== o.textContent);
      if (differs) {
        shortcutMonth.replaceChildren(...sourceOptions.map(o => o.cloneNode(true)));
      }
      if (isValidOption(shortcutMonth, originalMonth.value) && shortcutMonth.value !== originalMonth.value) {
        shortcutMonth.value = originalMonth.value;
      }
      // O número exibido é sempre o valor do campo oficial, não uma nova meta.
      if (shortcutGoal.value !== originalGoal.value) {
        shortcutGoal.value = originalGoal.value;
      }
    }

    shortcutMonth.addEventListener('change', () => {
      if (!isValidOption(originalMonth, shortcutMonth.value)) return;
      if (originalMonth.value !== shortcutMonth.value) {
        originalMonth.value = shortcutMonth.value;
        originalMonth.dispatchEvent(new Event('change', { bubbles: true }));
      }
      syncFromSource();
    });

    shortcutGoal.addEventListener('input', () => {
      if (originalGoal.value === shortcutGoal.value) return;
      originalGoal.value = shortcutGoal.value;
      // Dispara o MESMO saveMeta já existente, com debounce e confirmação na nuvem.
      originalGoal.dispatchEvent(new Event('input', { bubbles: true }));
    });

    originalMonth.addEventListener('change', syncFromSource);
    originalGoal.addEventListener('input', syncFromSource);
    originalGoal.addEventListener('change', syncFromSource);
    window.addEventListener('erp:rendered', syncFromSource);
    document.addEventListener('erp:appearance-change', syncFromSource);
    window.addEventListener('focus', syncFromSource);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) syncFromSource(); });
    syncFromSource();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
