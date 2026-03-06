/**
 * Pokemon Search and Filtering Logic
 * Handles case-insensitive substring search and data validation
 */

import { Mezatag } from './models';

/**
 * Check if a Pokemon has all required stats
 */
function hasValidStats(mezatag: Mezatag): boolean {
  const { hp, attack, defense, spAtk, spDef, speed } = mezatag.stats;
  return (
    typeof hp === 'number' &&
    typeof attack === 'number' &&
    typeof defense === 'number' &&
    typeof spAtk === 'number' &&
    typeof spDef === 'number' &&
    typeof speed === 'number' &&
    hp >= 0 &&
    attack >= 0 &&
    defense >= 0 &&
    spAtk >= 0 &&
    spDef >= 0 &&
    speed >= 0
  );
}

/**
 * Filter out Mezatags with missing or invalid data
 */
export function filterValidMezatags(mezatags: Mezatag[]): Mezatag[] {
  return mezatags.filter((mezatag) => {
    return (
      mezatag.name &&
      mezatag.types &&
      mezatag.types.length > 0 &&
      mezatag.move?.name &&
      mezatag.move?.type &&
      hasValidStats(mezatag)
    );
  });
}

/**
 * Perform case-insensitive substring search on Pokemon names
 */
export function searchPokemon(query: string, mezatags: Mezatag[]): Mezatag[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const lowerQuery = query.toLowerCase();
  return mezatags.filter((mezatag) => mezatag.name.toLowerCase().includes(lowerQuery));
}

/**
 * Get unique Pokemon names from Mezatags for search results
 */
export function getUniquePokemonNames(mezatags: Mezatag[]): string[] {
  const names = new Set<string>();
  for (const mezatag of mezatags) {
    names.add(mezatag.name);
  }
  return Array.from(names).sort();
}

/**
 * Get all Mezatags for a specific Pokemon name
 */
export function getMezatagsForPokemon(pokemonName: string, mezatags: Mezatag[]): Mezatag[] {
  return mezatags.filter((mezatag) => mezatag.name.toLowerCase() === pokemonName.toLowerCase());
}
