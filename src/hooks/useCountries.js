// src/hooks/useCountries.js
// Busca países na REST Countries API de acordo com a região e o texto de busca.
import { useEffect, useState } from 'react';
import {
  getAllCountries,
  getCountriesByRegion,
  searchCountriesByName,
} from '../services/api';

const SEARCH_DEBOUNCE_MS = 400;

export default function useCountries(region = 'All', searchQuery = '', reloadKey = 0) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const term = searchQuery.trim();
    const hasRegion = region && region !== 'All';

    async function fetchCountries() {
      setLoading(true);
      setError(null);

      try {
        let data;

        if (term) {
          // Busca por nome e, se houver região selecionada, filtra o resultado
          data = await searchCountriesByName(term, { signal: controller.signal });
          if (hasRegion) data = data.filter((c) => c.region === region);
        } else if (hasRegion) {
          data = await getCountriesByRegion(region, { signal: controller.signal });
        } else {
          data = await getAllCountries({ signal: controller.signal });
        }

        setCountries(data);
      } catch (err) {
        if (err.name === 'AbortError') return; // requisição substituída por outra
        setCountries([]);
        setError(err.message || 'Não foi possível carregar os países.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    // Debounce apenas quando o usuário está digitando
    const timer = setTimeout(fetchCountries, term ? SEARCH_DEBOUNCE_MS : 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [region, searchQuery, reloadKey]);

  return { countries, loading, error };
}
