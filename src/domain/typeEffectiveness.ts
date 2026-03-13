/**
 * Type Effectiveness Engine
 * Calculates offensive and defensive effectiveness between Pokemon types
 * Uses numeric multiplier data (attacker → defender → multiplier)
 * Dual-type effectiveness is computed at runtime by multiplying individual type multipliers
 * Scores are expressed as raw floating-point multipliers (no 0-100 mapping)
 */

import { PokemonType } from './models';
import typeMatchupsData from '../../data/type-matchups.json';

/**
 * Type matchup data: Record<AttackingType, Record<DefendingType, multiplier>>
 * Missing entries imply a 1.0 (neutral) multiplier.
 */
type TypeMatchups = Record<string, Record<string, number>>;

/** Maximum defensive score cap — mirrors the maximum offensive multiplier (4x) */
const DEFENSIVE_SCORE_CAP = 4.0;

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
 * Calculate offensive effectiveness score as a raw damage multiplier.
 * How effective a move of moveType is against defendingTypes.
 * For dual-type Pokemon, multipliers are multiplied together at runtime.
 * Returns the raw combined multiplier:
 *
 *   0.0  — immune (no effect)
 *   0.25 — double not very effective
 *   0.5  — not very effective
 *   1.0  — neutral
 *   2.0  — super effective
 *   4.0  — double super effective
 *
 * Returns 1.0 (neutral) for unknown or missing types.
 */
export function getOffensiveScore(
  moveType: PokemonType | string,
  defendingTypes: (PokemonType | string)[]
): number {
  if (defendingTypes.length === 0) {
    return 1.0; // Neutral if no types
  }

  const matchups = getTypeMatchups();
  const typeStr = moveType.toString();

  // Check if the attacking type exists in our data
  if (!matchups[typeStr]) {
    return 1.0; // Neutral if type not found
  }

  const defendingStrs = defendingTypes.map((t) => t.toString());
  return getCombinedMultiplier(typeStr, defendingStrs, matchups);
}

/**
 * Calculate defensive effectiveness score as the inverse damage multiplier (1 / damage taken).
 * How well defendingTypes resist attacks of attackingTypes.
 * For dual-type defenders, multipliers are multiplied together at runtime.
 * Returns the average of per-attacker inverse multipliers:
 *
 *   4.0  — immune or double resist (0x or 0.25x damage; capped at DEFENSIVE_SCORE_CAP)
 *   2.0  — resists (takes 0.5x damage)
 *   1.0  — neutral (takes 1x damage)
 *   0.5  — weak (takes 2x damage)
 *   0.25 — double weak (takes 4x damage)
 *
 * Higher = better defense. Returns 1.0 (neutral) for unknown or missing types.
 */
export function getDefensiveScore(
  defendingTypes: (PokemonType | string)[],
  attackingTypes: (PokemonType | string)[]
): number {
  if (defendingTypes.length === 0 || attackingTypes.length === 0) {
    return 1.0; // Neutral if no types
  }

  const matchups = getTypeMatchups();
  const defendingStrs = defendingTypes.map((t) => t.toString());

  // For each attacking type, compute 1/multiplier (capped at DEFENSIVE_SCORE_CAP for immunity)
  // then average across all attacking types
  const defenseScores = attackingTypes.map((atkType) => {
    const attackingStr = atkType.toString();
    const multiplier = getCombinedMultiplier(attackingStr, defendingStrs, matchups);
    if (multiplier === 0) return DEFENSIVE_SCORE_CAP; // immune
    return Math.min(DEFENSIVE_SCORE_CAP, 1 / multiplier);
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
