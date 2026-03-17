/**
 * useMezatags hook
 * Fetches and validates Mezatag data from the static JSON file.
 * Returns loading state, error state, and the filtered mezatags array.
 */

import { useState, useEffect } from 'react';
import { Mezatag } from '../domain/models';
import { filterValidMezatags } from '../domain/pokemonSearch';

interface UseMezatagsResult {
  mezatags: Mezatag[];
  loading: boolean;
  error: string | null;
}

/** Fetch mezatags.json from the public/data directory and return validated entries. */
export function useMezatags(): UseMezatagsResult {
  const [mezatags, setMezatags] = useState<Mezatag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch('data/mezatags.json');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = (await response.json()) as Mezatag[];
        const valid = filterValidMezatags(data);
        if (valid.length === 0) {
          throw new Error('No valid Mezatags found in data');
        }
        if (!cancelled) {
          setMezatags(valid);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load Mezatags:', err);
          setError('Failed to load Mezatag data. Please refresh the page.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { mezatags, loading, error };
}
