// ==== INICIALIZAÇÃO & MODO TURBO ====
function bind() {
  fillMonths();
  $('dataEncerramento').value = getTodayLocal();$('filterMonth').addEventListener('change', () => {
    localStorage.setItem(LAST_MONTH_KEY, getSelectedMonth());
    updateMetaInput();
    $('mesReferenciaForm').value = getSelectedMonth();
    currentPage = 1;
    renderAll();
  });
  $('metaInput').addEventListener('input', saveMeta);
  ['filterTipo','filterEncerrado','pageSize','sortOrder','dateStart','dateEnd'].forEach(id => {
    $(id).addEventListener('change', () => {
      currentPage = 1;
      if(id === 'pageSize') itemsPerPage = parseInt($(id).value, 10);
      renderAll();
    });
  });
  $('searchInput').addEventListener('input', () => {
    currentPage = 1;
    renderAll();
  });
  $('panjud').addEventListener('change', () => {
    if($('panjud').value === 'Sim')$('recusado').value = 'Não';
  });
  $('recusado').addEventListener('change', () => {
    if($('recusado').value === 'Sim')$('panjud').value = 'Não';
  });
  $('dataEncerramento').addEventListener('change', () => {
    const v = $('dataEncerramento').value;
    if(v) $('mesReferenciaForm').value = v.split('-')[1];
  });
  $('processForm').addEventListener('submit', handleSubmit);$('btnCancel').addEventListener('click', clearForm);
  $('btnReset').addEventListener('click', clearForm);$('btnPrevPage').addEventListener('click', () => {
    if(currentPage > 1) { currentPage--; renderAll(); }
  });
  $('btnNextPage').addEventListener('click', () => {
    const max = Math.max(1, Math.ceil(getFiltered().length / itemsPerPage));
    if(currentPage < max) { currentPage++; renderAll(); }
  });
  $('btnRefresh').addEventListener('click', () => loadCloud(false));$('btnAiTop').addEventListener('click', openAI);
  $('openAiFromNav').addEventListener('click', openAI);$('btnAiClose').addEventListener('click', closeAI);
  $('aiBackdrop').addEventListener('click', closeAI);$('btnAiKey')?.addEventListener('click', configAPIKey);
  $('btnChatSend').addEventListener('click', processAI);$('chatInputText').addEventListener('keydown', e => {
    if(e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processAI();
    }
  });

  $('auroraRadarNext')?.addEventListener('click', rotateBusinessDiagnostic);
  $('auroraRadarPause')?.addEventListener('click', toggleDiagnosticRotation);
  AuroraLiveView.bind();

  // MODO TURBO DE NAVEGAÇÃO POR TECLADO
  const ordemCampos = ['idCaso','numProcesso','tipoEncerramento','dataEncerramento','mesReferenciaForm','panjud','recusado','observacoes'];
  ordemCampos.forEach((id, index) => {
    const campo = $(id);
    if (!campo) return;
    campo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        $('processForm').requestSubmit();
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (index === ordemCampos.length - 1) {
          $('processForm').requestSubmit();
        } else {
          const proximoCampo = $(ordemCampos[index + 1]);
          if (proximoCampo) {
            proximoCampo.focus();
            if (proximoCampo.select) proximoCampo.select();
          }
        }
      }
    });
  });

  $('btnNavAuditoria')?.addEventListener('click', toggleAuditoria);
  $('btnCloseAuditoria')?.addEventListener('click', () => {$('winAuditoria').style.display = 'none'; });

  const historySection = $('historico');
  const historyBackdrop = $('historyModalBackdrop');
  const openHistoryModal = () => {
    if (!historySection) return;
    document.body.classList.add('history-open');
    historySection.setAttribute('aria-hidden', 'false');
    historyBackdrop && (historyBackdrop.hidden = false);
  };
  const closeHistoryModal = () => {
    if (!historySection) return;
    document.body.classList.remove('history-open');
    historySection.setAttribute('aria-hidden', 'true');
    historyBackdrop && (historyBackdrop.hidden = true);
  };
  $('btnOpenHistoryInline')?.addEventListener('click', openHistoryModal);
  $('btnCloseHistoryModal')?.addEventListener('click', closeHistoryModal);
  historyBackdrop?.addEventListener('click', closeHistoryModal);

  document.querySelectorAll('.nav-btn[data-target]').forEach(b => {
    b.addEventListener('click', () => {
      if (b.dataset.target === 'historico') {
        openHistoryModal();
        return;
      }
      const target = document.getElementById(b.dataset.target);
      if (!target) return;
      const chromeOffset = document.getElementById('cr-chrome')?.offsetHeight || 0;
      const extraOffset = 18;
      const top = target.getBoundingClientRect().top + window.scrollY - chromeOffset - extraOffset;
      window.scrollTo({ top, behavior: 'smooth' });
      if (b.dataset.target === 'novoRegistro') {
        setTimeout(() => document.getElementById('idCaso')?.focus({ preventScroll: true }), 420);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('history-open')) closeHistoryModal();
  });

  renderAll();
}

bind();
startDiagnosticLoop(false);
loadCloud(true);
