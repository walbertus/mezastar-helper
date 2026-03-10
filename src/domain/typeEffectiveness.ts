/**
 * Type Effectiveness Engine
 * Calculates offensive and defensive effectiveness between Pokemon types
 * Uses numeric multiplier data (attacker → defender → multiplier)
 * Dual-type effectiveness is computed at runtime by multiplying individual type multipliers
 */

import { PokemonType } from './models';
import typeMatchupsData from '../../data/type-matchups.json';

/**
 * Type matchup data: Record<AttackingType, Record<DefendingType, multiplier>>
 * Missing entries imply a 1.0 (neutral) multiplier.
 */
type TypeMatchups = Record<string, Record<string, number>>;

/**
 * Get type matchups data (uses imported JSON)
 */
export function getTypeMatchups(): TypeMatchups {
  return typeMatchupsData as TypeMatchups;
}

/**
 * Get the damage multiplier for an attacking type against a single defending type.
 * Returns 1.0 (neutral) if no entry exists.
 */
function getMultiplier(attackType: string, defenseType: string, matchups: TypeMatchups): number {
  const attackData = matchups[attackType];
  if (!attackData) return 1.0;
  const multiplier = attackData[defenseType];
  return multiplier !== undefined ? multiplier : 1.0;
}

/**
 * Get the combined damage multiplier for an attacking type against potentially dual defending types.
 * For dual types, the individual multipliers are multiplied together.
 * e.g., Fire vs Water/Grass = Fire→Water (0.5) * Fire→Grass (2.0) = 1.0
 */
function getCombinedMultiplier(
  attackType: string,
  defendingTypes: string[],
  matchups: TypeMatchups
): number {
  return defendingTypes.reduce(
    (product, defType) => product * getMultiplier(attackType, defType, matchups),
    1.0
  );
}

/**
 * Convert a damage multiplier to an offensive score (0-100).
 * Higher multiplier = higher score (more effective attack).
 *
 * Mapping:
 *   0x    →   0  (immune)
 *   0.25x →  12.5
 *   0.5x  →  25  (not very effective)
 *   1x    →  50  (neutral)
 *   2x    → 100  (super effective)
 *   4x    → 100  (capped)
 *
 * Formula: clamp(0, 100, multiplier * 50), with 0 → 0
 */
function multiplierToOffensiveScore(multiplier: number): number {
  if (multiplier === 0) return 0;
  return Math.min(100, Math.max(0, multiplier * 50));
}

/**
 * Convert a damage multiplier to a defensive score (0-100).
 * Lower multiplier = higher score (better defense / more resistance).
 *
 * Mapping:
 *   0x    → 100  (immune)
 *   0.25x → 100  (double resist)
 *   0.5x  →  75  (resists)
 *   1x    →  50  (neutral)
 *   2x    →  25  (weak)
 *   4x    →   0  (double weak)
 *
 * Formula: clamp(0, 100, 50 - 25 * log2(multiplier)), with 0 → 100
 */
function multiplierToDefensiveScore(multiplier: number): number {
  if (multiplier === 0) return 100;
  return Math.min(100, Math.max(0, 50 - 25 * Math.log2(multiplier)));
}

/**
 * Calculate offensive effectiveness score
 * How effective a move of moveType is against defendingTypes
 * For dual-type Pokemon, multipliers are multiplied together at runtime.
 * Returns a score 0-100
 * - 0: Immune (no effect)
 * - 12.5: Double not very effective (0.25x)
 * - 25: Not very effective (0.5x)
 * - 50: Normal effectiveness (1x)
 * - 100: Super effective (2x or higher)
 */
export function getOffensiveScore(
  moveType: PokemonType | string,
  defendingTypes: (PokemonType | string)[]
): number {
  if (defendingTypes.length === 0) {
    return 50; // Neutral if no types
  }

  const matchups = getTypeMatchups();
  const typeStr = moveType.toString();

  // Check if the attacking type exists in our data
  if (!matchups[typeStr]) {
    return 50; // Neutral if type not found
  }

  const defendingStrs = defendingTypes.map((t) => t.toString());
  const multiplier = getCombinedMultiplier(typeStr, defendingStrs, matchups);
  return multiplierToOffensiveScore(multiplier);
}

/**
 * Calculate defensive effectiveness score
 * How well defendingTypes resist attacks of attackingTypes
 * For dual-type defenders, multipliers are multiplied together at runtime.
 * Returns a score 0-100
 * - 0: Double weak (takes 4x damage)
 * - 25: Weak (takes 2x damage)
 * - 50: Normal (takes 1x damage)
 * - 75: Resists (takes 0.5x damage)
 * - 100: Immune or double resist (takes 0x or 0.25x damage)
 */
export function getDefensiveScore(
  defendingTypes: (PokemonType | string)[],
  attackingTypes: (PokemonType | string)[]
): number {
  if (defendingTypes.length === 0 || attackingTypes.length === 0) {
    return 50; // Neutral if no types
  }

  const matchups = getTypeMatchups();
  const defendingStrs = defendingTypes.map((t) => t.toString());

  // For each attacking type, compute the combined multiplier against all defending types
  // then convert to a defensive score, and average across all attacking types
  const defenseScores = attackingTypes.map((atkType) => {
    const attackingStr = atkType.toString();
    const multiplier = getCombinedMultiplier(attackingStr, defendingStrs, matchups);
    return multiplierToDefensiveScore(multiplier);
  });

  return defenseScores.reduce((a, b) => a + b, 0) / defenseScores.length;
}

/**
 * Calculate combined effectiveness score
 * (Offensive + Defensive) / 2
 */
export function getCombinedScore(
  moveType: PokemonType | string,
  pokemonTypes: (PokemonType | string)[],
  enemyTypes: (PokemonType | string)[]
): number {
  const offensive = getOffensiveScore(moveType, enemyTypes);
  const defensive = getDefensiveScore(pokemonTypes, enemyTypes);
  return (offensive + defensive) / 2;
}
