
// ============================================================
// CONFIGURAÇÕES E BANCO NA NUVEM (API REAL)
// ============================================================
const API_URL = 'https://script.google.com/macros/s/AKfycbzkcsULH3xNPbjNFmLy-wlqKuSE0cbwBlkqmVd8t1ugoP89RHzuW9wCMHK0V7eKYrxp/exec';

const MONTHS = [['06','Junho'],['07','Julho'],['08','Agosto'],['09','Setembro'],['10','Outubro'],['11','Novembro'],['12','Dezembro']];
const CACHE_KEY = 'bd_oficial_leticia';
const META_KEY = 'metas_oficial_leticia';
const LAST_MONTH_KEY = 'ultimo_mes_selecionado';
const AI_KEY = 'groq_api_key_erp';
const LOGS_KEY = 'logs_oficial_leticia';
const MEMORIA_KEY = 'memoria_oficial_ia';

// Um cache inválido não deve impedir a leitura confirmada da nuvem.
// Não apaga nem regrava o valor original durante a inicialização.
function readCachedState(key, arrayExpected) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || (arrayExpected ? '[]' : '{}'));
    if (arrayExpected ? Array.isArray(value) : value && typeof value === 'object' && !Array.isArray(value)) return value;
  } catch (_) { /* Cache recuperável; sem conteúdo sensível no console. */ }
  return arrayExpected ? [] : {};
}
let bd = readCachedState(CACHE_KEY, true);
let metas = readCachedState(META_KEY, false);
let logsAuditoria = readCachedState(LOGS_KEY, true);
let memoriaIA = readCachedState(MEMORIA_KEY, true);
let editUid = null, currentPage = 1, itemsPerPage = 15, metaSaveTimer = null, lastConfirmedMetas = JSON.parse(JSON.stringify(metas));
let charts = {tipos:null, linha:null};
let apiKey = localStorage.getItem(AI_KEY) || '';
let chatHistory = [{role:'assistant', content:'Olá, Letícia! Eu sou a Aurora. ✦ Estou pronta para consultar a base, analisar indicadores e cadastrar ou editar casos.'}];

