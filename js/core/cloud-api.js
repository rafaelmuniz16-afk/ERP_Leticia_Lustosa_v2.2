// ==== API & NUVEM ====
let cloudReadSequence = 0;
let cloudMutationRevision = 0;
let cloudMutationsPending = 0;
const cloudMetaQueues = new Map();
async function fetchAPI(acao, payload={}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 40000);
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {'Content-Type': 'text/plain;charset=utf-8'},
      body: JSON.stringify({acao, ...payload}),
      signal: controller.signal
    });
    if(!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch(err) {
    console.error('API', err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function serverMutation(acao, payload) {
  // Invalida leituras iniciadas antes/durante uma escrita, inclusive Aurora.
  cloudMutationRevision++;
  cloudMutationsPending++;
  const execute = async () => {
  setConn('syncing', 'Salvando…');
  const res = await fetchAPI(acao, payload);
  if(!res || res.status !== 'sucesso') {
    setConn('offline', 'Falha na nuvem');
    throw new Error(res?.mensagem || res?.message || 'Servidor não confirmou a operação.');
  }
  if (acao === 'salvarMeta') lastConfirmedMetas[payload.mes] = payload.meta;
  renderSheetMemoryStatus();
  return res;
  };
  let queued;
  const month = acao === 'salvarMeta' ? String(payload.mes) : null;
  try {
    if (month !== null) {
      queued = (cloudMetaQueues.get(month) || Promise.resolve()).catch(() => {}).then(execute);
      cloudMetaQueues.set(month, queued);
      return await queued;
    }
    return await execute();
  } finally {
    if (month !== null && cloudMetaQueues.get(month) === queued) cloudMetaQueues.delete(month);
    cloudMutationsPending--;
    cloudMutationRevision++;
  }
}

async function loadCloud(initial=false) {
  const pending = () => cloudMutationsPending > 0 || (typeof hasPendingMetaSaves === 'function' && hasPendingMetaSaves());
  if (pending()) return { status: 'pendente', mensagem: 'Aguarde o salvamento pendente antes de sincronizar.' };
  const sequence = ++cloudReadSequence, revision = cloudMutationRevision;
  setConn('syncing', 'Conectando…');
  if(initial && bd.length) renderAll();
  const res = await fetchAPI('ler');
  if (sequence !== cloudReadSequence || revision !== cloudMutationRevision || pending()) {
    return { status: 'descartado', mensagem: 'Leitura antiga descartada para preservar alterações mais recentes. Sincronize novamente.' };
  }
  if(res && res.status === 'sucesso' && Array.isArray(res.dados) && res.dados.every(row => row && typeof row === 'object' && !Array.isArray(row))) {
    bd = res.dados;
    if(res.metas && typeof res.metas === 'object' && !Array.isArray(res.metas)) {
      metas = res.metas;
      lastConfirmedMetas = JSON.parse(JSON.stringify(metas));
      localStorage.setItem(META_KEY, JSON.stringify(metas));
      // Reflete no campo a meta remota confirmada para o mes atualmente selecionado.
      updateMetaInput();
    }
    if(res.logs && Array.isArray(res.logs)) {
      logsAuditoria = res.logs;
      localStorage.setItem(LOGS_KEY, JSON.stringify(logsAuditoria));
    }
    const sheetRows = window.ERPSheetMemory?.fromResponse(res);
    if (sheetRows !== null && sheetRows !== undefined) {
      memoriaIA = window.ERPSheetMemory.normalize(sheetRows);
      localStorage.setItem(MEMORIA_KEY, JSON.stringify(memoriaIA));
      sheetMemoryFromApi = true;
      sheetMemoryLastSuccess = Date.now();
      sheetMemoryLastAttempt = Date.now();
      renderSheetMemoryStatus();
    } else {
      // O endpoint "ler" pode não incluir a aba Memoria_IA.
      // Tenta uma leitura separada sem bloquear o carregamento dos casos.
      void refreshSheetMemory();
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(bd));
    setConn('online', 'Online');
    $('sideCount').textContent = bd.length;
    renderAll();
    if (typeof startDiagnosticLoop === 'function') {
      startDiagnosticLoop();
    }
  } else {
    setConn('offline', 'Sem conexão');
    toast('warning', 'Não foi possível confirmar os dados da nuvem.');
    if (res?.status === 'sucesso') return { status: 'erro', mensagem: 'Resposta de dados inválida; a base local foi preservada.' };
  }
  return res;
}


// Sincronização independente do histórico da aba Memoria_IA para o CHATBOT.
// A Aurora Memory analítica (episódios no navegador) permanece independente.
let sheetMemoryLastAttempt = 0;
let sheetMemoryLastSuccess = 0;
let sheetMemoryFromApi = false;
let sheetMemoryPending = null;
async function refreshSheetMemory(force = false) {
  if (sheetMemoryPending) return sheetMemoryPending;
  if (!force && Date.now() - sheetMemoryLastAttempt < 60000) return sheetMemoryFromApi;
  sheetMemoryLastAttempt = Date.now();
  sheetMemoryPending = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7500);
    try {
      const response = await fetch(API_URL, {
        method: 'POST', headers: {'Content-Type':'text/plain;charset=utf-8'},
        body: JSON.stringify({acao:'lerMemoria'}), signal: controller.signal
      });
      if (!response.ok) return false;
      const payload = await response.json();
      // Resposta dedicada pode usar "dados" em vez de "memoria".
      const rows = window.ERPSheetMemory?.fromResponse(payload) ??
        (Array.isArray(payload.dados) ? payload.dados : null);
      if (rows === null || rows === undefined) return false;
      // Nunca substitua memória local com um erro/mensagem do backend.
      if (payload.status && payload.status !== 'sucesso') return false;
      memoriaIA = window.ERPSheetMemory.normalize(rows);
      localStorage.setItem(MEMORIA_KEY, JSON.stringify(memoriaIA));
      sheetMemoryLastSuccess = Date.now();
      sheetMemoryFromApi = true;
      renderSheetMemoryStatus();
      return true;
    } catch (_) { return false; }
    finally { clearTimeout(timeout); }
  })();
  try { return await sheetMemoryPending; }
  finally { sheetMemoryPending = null; }
}
window.erpSheetMemoryStatus = () => ({ fromCloud: sheetMemoryFromApi, lastSuccess: sheetMemoryLastSuccess, rows: memoriaIA.length, fallback: !sheetMemoryFromApi });

function renderSheetMemoryStatus() {
  const el = document.getElementById('aiMemorySource');
  if (!el) return;
  const n = Array.isArray(memoriaIA) ? memoriaIA.length : 0;
  el.textContent = sheetMemoryFromApi
    ? `Memoria_IA · ${n} memória${n === 1 ? '' : 's'} na nuvem`
    : `Memoria_IA · ${n ? n + ' em cache local' : 'sem leitura confirmada'}`;
}
