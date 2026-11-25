// src/services/api.js
// Chamadas à REST Countries API (v3.1) com filtro de campos (?fields=) para reduzir o payload.

const BASE_URL = 'https://restcountries.com/v3.1';

export const FIELDS =
  'name,flags,capital,region,subregion,population,languages,currencies,timezones,cca3';

const sortByName = (list) =>
  [...list].sort((a, b) => a.name.common.localeCompare(b.name.common, 'pt-BR'));

async function request(path, options = {}) {
  const separator = path.includes('?') ? '&' : '?';
  const response = await fetch(`${BASE_URL}${path}${separator}fields=${FIELDS}`, options);

  // A API retorna 404 quando nenhum país corresponde à busca: tratamos como lista vazia
  if (response.status === 404) return [];

  if (!response.ok) {
    throw new Error(`Erro ${response.status} ao consultar a API de países.`);
  }

  const data = await response.json();
  return Array.isArray(data) ? sortByName(data) : [data];
}

/** Todos os países */
export function getAllCountries(options) {
  return request('/all', options);
}

/** Países de uma região (Africa, Americas, Asia, Europe, Oceania) */
export function getCountriesByRegion(region, options) {
  return request(`/region/${encodeURIComponent(region.toLowerCase())}`, options);
}

/** Busca por nome (parcial) */
export function searchCountriesByName(name, options) {
  return request(`/name/${encodeURIComponent(name.trim())}`, options);
}

/** País específico pelo código ISO alfa-3 (cca3) */
export async function getCountryByCode(code, options) {
  const result = await request(`/alpha/${encodeURIComponent(code)}`, options);
  return result[0] ?? null;
}
