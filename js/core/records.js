// ==== CRUD FORMULÁRIO ====
let recordSubmitPending = false;
async function saveRecord(registro) { return await serverMutation('salvar', {registro}); }
async function editServer(registro) { return await serverMutation('editar', {registro}); }
async function deleteServer(uidValue) { return await serverMutation('apagar', {uid: uidValue}); }

function formData() {
  return {
    id: $('idCaso').value.trim(),
    processo: $('numProcesso').value.trim(),
    tipo: $('tipoEncerramento').value,
    data: $('dataEncerramento').value,
    panjud: $('panjud').value,
    recusado: $('recusado').value,
    observacoes: $('observacoes').value.trim(),
    mesReferencia: $('mesReferenciaForm').value
  };
}

function clearForm(force = false) {
  if (recordSubmitPending && force !== true) return;
  editUid = null;
  $('processForm').reset();
  $('dataEncerramento').value = getTodayLocal();
  $('mesReferenciaForm').value = getSelectedMonth();
  $('formTitle').textContent = 'Novo registro';
  $('btnSubmit').textContent = '✓ Salvar registro';
  $('btnCancel').style.display = 'none';
  setTimeout(() => $('idCaso')?.focus(), 50);
}

function startEdit(uidValue) {
  if (recordSubmitPending) return;
  const r = bd.find(x => String(x._uid) === String(uidValue));
  if(!r) return;
  editUid = uidValue;
  $('idCaso').value = r.id || '';
  $('numProcesso').value = r.processo || '';
  $('tipoEncerramento').value = r.tipo || 'Ônus';
  $('dataEncerramento').value = normalizeDate(r.data);
  $('mesReferenciaForm').value = getMesCorreto(r);
  $('panjud').value = r.panjud || 'Não';
  $('recusado').value = r.recusado || 'Não';
  $('observacoes').value = r.observacoes || '';
  $('formTitle').textContent = 'Editar registro';
  $('btnSubmit').textContent = '✓ Atualizar registro';
  $('btnCancel').style.display = 'inline-flex';
  document.getElementById('cadastro').scrollIntoView({behavior: 'smooth', block: 'start'});
  setTimeout(() => $('idCaso')?.focus(), 50);
}

async function handleSubmit(e) {
  e.preventDefault();
  if (recordSubmitPending) return;
  if($('panjud').value === 'Sim' && $('recusado').value === 'Sim') {
    toast('error', 'Um caso não pode ser encerrado e recusado no Panjud ao mesmo tempo.');
    return;
  }
  const data = formData();
  if(!data.id || !data.processo) {
    toast('warning', 'Preencha ID e número do processo.');
    return;
  }
  const submittedUid = editUid;
  const submitButton = $('btnSubmit');
  const wasDisabled = submitButton.disabled;
  recordSubmitPending = true;
  submitButton.disabled = true;
  let confirmed = false;
  try {
    setLoading(true, submittedUid ? 'Atualizando registro…' : 'Salvando registro…');
    if(submittedUid) {
      data._uid = submittedUid;
      await editServer(data);
      confirmed = true;
      const idx = bd.findIndex(x => String(x._uid) === String(submittedUid));
      if(idx >= 0) bd[idx] = data;
      registrarLog('EDITAR', data.id, 'Processo: ' + data.processo + ' | Tipo alterado: ' + data.tipo + ' | Panjud: ' + data.panjud);
      toast('success', 'Registro confirmado pela nuvem.');
    } else {
      data._uid = uid();
      await saveRecord(data);
      confirmed = true;
      bd.push(data);
      registrarLog('CADASTRAR', data.id, 'Processo: ' + data.processo + ' | Tipo: ' + data.tipo + ' | Panjud: ' + data.panjud);
      toast('success', 'Novo registro confirmado pela nuvem.');
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(bd));
    clearForm(true);
    renderAll();
    setConn('online', 'Online');
    refreshAuroraLive({ confirmed: true });
  } catch(err) {
    if (confirmed) {
      // Uma falha de cache/renderização após o aceite não é falha da escrita.
      // Evita sugerir um novo cadastro para uma operação já confirmada.
      clearForm(true);
      try { renderAll(); } catch (_) { /* O QA deve inspecionar o erro local. */ }
      toast('warning', 'Registro confirmado na nuvem, mas houve uma falha local. Não envie novamente; sincronize ou recarregue a página.');
      setConn('online', 'Confirmado · revisar estado local');
    } else {
      toast('error', err.message);
      setConn('offline', 'Falha na nuvem');
    }
  } finally {
    recordSubmitPending = false;
    submitButton.disabled = wasDisabled;
    setLoading(false);
  }
}

async function deleteRecord(uidValue) {
  const r = bd.find(x => String(x._uid) === String(uidValue));
  if(!r) return;
  const result = await Swal.fire({
    title: 'Excluir este caso?',
    html: '<div style="font-size:12px;text-align:left"><b>ID:</b> ' + escapeHTML(r.id) + '<br><b>Processo:</b> ' + escapeHTML(r.processo) + '<br><b>Tipo:</b> ' + escapeHTML(r.tipo) + '</div>',
    showCancelButton: true,
    confirmButtonText: 'Excluir',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc3f5a',
    reverseButtons: true
  });
  if(!result.isConfirmed) return;
  try {
    setLoading(true, 'Excluindo registro…');
    await deleteServer(uidValue);
    bd = bd.filter(x => String(x._uid) !== String(uidValue));
    localStorage.setItem(CACHE_KEY, JSON.stringify(bd));
    registrarLog('APAGAR', r.id, 'Processo: ' + r.processo + ' removido do sistema.');
    renderAll();
    toast('success', 'Registro removido com confirmação da nuvem.');
    setConn('online', 'Online');
    refreshAuroraLive({ confirmed: true });
  } catch(err) {
    toast('error', err.message);
    setConn('offline', 'Falha na nuvem');
  } finally {
    setLoading(false);
  }
}

// Debounce independente por mês e fila por mês: uma resposta antiga nunca
// desfaz uma edição mais recente. As taxas e fórmulas permanecem intactas.
const pendingMetaSaves = new Map();
const metaSaveQueues = new Map();
function hasPendingMetaSaves() { return pendingMetaSaves.size > 0; }
async function saveMeta() {
  const month = getSelectedMonth(), value = parseNum($('metaInput').value);
  const previousJob = pendingMetaSaves.get(month);
  if (previousJob) clearTimeout(previousJob.timer);
  const job = { value, timer: null };
  pendingMetaSaves.set(month, job);
  metas[month] = value;
  localStorage.setItem(META_KEY, JSON.stringify(metas));
  renderAll();
  job.timer = setTimeout(() => {
    const previousQueue = metaSaveQueues.get(month) || Promise.resolve();
    const queued = previousQueue.catch(() => {}).then(async () => {
    if (pendingMetaSaves.get(month) !== job) return;
    try {
      setConn('syncing', 'Salvando meta…');
      await serverMutation('salvarMeta', {mes: month, meta: value});
      lastConfirmedMetas[month] = value;
      toast('success', 'Meta confirmada pela nuvem.');
      setConn('online', 'Online');
      refreshAuroraLive({ confirmed: true });
    } catch(err) {
      if (pendingMetaSaves.get(month) === job) {
        metas[month] = lastConfirmedMetas[month] ?? 0;
        localStorage.setItem(META_KEY, JSON.stringify(metas));
        if (getSelectedMonth() === month) updateMetaInput();
        renderAll();
      }
      toast('error', 'A meta não foi confirmada pelo servidor.');
      setConn('offline', 'Falha na nuvem');
    } finally {
      if (pendingMetaSaves.get(month) === job) pendingMetaSaves.delete(month);
    }
    });
    metaSaveQueues.set(month, queued);
    const clean = () => { if (metaSaveQueues.get(month) === queued) metaSaveQueues.delete(month); };
    queued.then(clean, clean);
  }, 900);
}
