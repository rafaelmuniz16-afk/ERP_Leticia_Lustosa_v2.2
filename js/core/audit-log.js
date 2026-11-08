// ==== AUDITORIA ====
function registrarLog(acao, idCaso, detalhes) {
  if (!Array.isArray(logsAuditoria)) logsAuditoria = [];
  const dataAtual = new Date().toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' });
  const novoLog = { dataHora: dataAtual, acao, idCaso, detalhes };
  logsAuditoria.unshift(novoLog);
  if(logsAuditoria.length > 200) logsAuditoria.pop(); 
  localStorage.setItem(LOGS_KEY, JSON.stringify(logsAuditoria));
  renderLogs();
  
  fetch(API_URL, {
    method: 'POST',
    headers: {'Content-Type': 'text/plain;charset=utf-8'},
    body: JSON.stringify({acao: 'salvarLog', dataHora: dataAtual, acaoLog: acao, idCaso: idCaso, detalhes: detalhes})
  }).catch(err => console.log('Erro de log:', err));
}

function renderLogs() {
  const tbody = $('logsTable');
  if(!tbody) return;
  tbody.replaceChildren();
  if (!Array.isArray(logsAuditoria)) logsAuditoria = [];
  if(!logsAuditoria.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty">Nenhum log registrado ainda.</td></tr>';
    return;
  }
  logsAuditoria.forEach(item => {
    const l = item && typeof item === 'object' ? item : {};
    const action = String(l.acao ?? '');
    const tr = document.createElement('tr');
    let badgeClass = 'b-acordo';
    if(action.includes('CADASTRAR')) badgeClass = 'b-exito';
    if(action.includes('APAGAR')) badgeClass = 'b-onus';
    tr.innerHTML = '<td class="audit-col-datetime"><span class="audit-datetime">' + escapeHTML(l.dataHora) + '</span></td><td class="audit-col-action"><span class="badge ' + badgeClass + '">' + escapeHTML(action) + '</span></td><td class="audit-col-id"><strong>' + escapeHTML(l.idCaso) + '</strong></td><td class="audit-col-details"><span class="audit-details">' + escapeHTML(l.detalhes) + '</span></td>';
    tbody.appendChild(tr);
  });
}

