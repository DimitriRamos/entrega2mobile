// src/services/api.js
// Chamadas à REST Countries API (v3.1) com filtro de campos (?fields=) para reduzir o payload.
//
// Se a API oficial estiver fora do ar (ou bloqueada pela rede/extensões do navegador),
// usamos um espelho público com o MESMO formato de dados (v3.1), mantido pela
// Universidade de Helsinque, e aplicamos os filtros de região/nome no próprio app.

const BASE_URL = 'https://restcountries.com/v3.1';
const FALLBACK_URL = 'https://studies.cs.helsinki.fi/restcountries/api/all';

export const FIELDS =
  'name,flags,capital,region,subregion,population,languages,currencies,timezones,cca3';

const sortByName = (list) =>
  [...list].sort((a, b) => a.name.common.localeCompare(b.name.common, 'pt-BR'));

// ---------- Espelho (fallback) ----------
let fallbackCache = null;

async function getFallbackCountries(options) {
  if (!fallbackCache) {
    const response = await fetch(FALLBACK_URL, options);
    if (!response.ok) throw new Error(`Erro ${response.status} ao consultar a API de países.`);
    fallbackCache = sortByName(await response.json());
  }
  return fallbackCache;
}

const normalize = (text) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

async function fallbackRequest({ region, name, code }, options) {
  let data = await getFallbackCountries(options);

  if (region) data = data.filter((c) => c.region?.toLowerCase() === region.toLowerCase());
  if (code) data = data.filter((c) => c.cca3 === code.toUpperCase());
  if (name) {
    const term = normalize(name.trim());
    data = data.filter(
      (c) =>
        normalize(c.name.common).includes(term) || normalize(c.name.official).includes(term)
    );
  }
  return data;
}

// ---------- API oficial ----------
async function request(path, fallbackQuery, options = {}) {
  try {
    const separator = path.includes('?') ? '&' : '?';
    const response = await fetch(`${BASE_URL}${path}${separator}fields=${FIELDS}`, options);

    // A API retorna 404 quando nenhum país corresponde à busca: tratamos como lista vazia
    if (response.status === 404) return [];
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    return Array.isArray(data) ? sortByName(data) : [data];
  } catch (error) {
    if (error.name === 'AbortError') throw error; // requisição cancelada pelo hook

    console.warn('REST Countries indisponível, usando espelho:', error.message);
    try {
      return await fallbackRequest(fallbackQuery, options);
    } catch (fallbackError) {
      if (fallbackError.name === 'AbortError') throw fallbackError;
      throw new Error(
        'Não foi possível carregar os países. Verifique sua internet ou desative bloqueadores de anúncio para este site.'
      );
    }
  }
}

/** Todos os países */
export function getAllCountries(options) {
  return request('/all', {}, options);
}

/** Países de uma região (Africa, Americas, Asia, Europe, Oceania) */
export function getCountriesByRegion(region, options) {
  return request(`/region/${encodeURIComponent(region.toLowerCase())}`, { region }, options);
}

/** Busca por nome (parcial) */
export function searchCountriesByName(name, options) {
  return request(`/name/${encodeURIComponent(name.trim())}`, { name }, options);
}

/** País específico pelo código ISO alfa-3 (cca3) */
export async function getCountryByCode(code, options) {
  const result = await request(`/alpha/${encodeURIComponent(code)}`, { code }, options);
  return result[0] ?? null;
}
