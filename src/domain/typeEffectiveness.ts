/**
 * Type Effectiveness Engine
 * Calculates offensive and defensive effectiveness between Pokemon types
 */

import { PokemonType } from './models';
import typeMatchupsData from '../../data/type-matchups.json';

interface TypeMatchupData {
  superEffectiveAgainst: string[];
  weakTo: string[];
  resistsAgainst: string[];
  superEffectiveFrom: string[];
}

type TypeMatchups = Record<string, TypeMatchupData>;

/**
 * Get type matchups data (uses imported JSON)
 */
export function getTypeMatchups(): TypeMatchups {
  return typeMatchupsData as TypeMatchups;
}

/**
 * Calculate offensive effectiveness score
 * How effective a move of moveType is against defendingTypes
 * For dual-type Pokemon, averages the effectiveness against both types
 * Returns a score 0-100
 * - 0-33: Not very effective
 * - 34-66: Normal effectiveness
 * - 67-100: Super effective
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
  const typeData = matchups[typeStr];

  if (!typeData) {
    return 50; // Neutral if type not found
  }

  // Score against each defending type and average
  const scores = defendingTypes.map((defType) => {
    const defendingStr = defType.toString();

    // Super effective: 100
    if (typeData.superEffectiveAgainst.includes(defendingStr)) {
      return 100;
    }

    // Not very effective: 25
    if (typeData.weakTo.includes(defendingStr)) {
      return 25;
    }

    // Normal effectiveness: 50
    return 50;
  });

  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

/**
 * Calculate defensive effectiveness score
 * How well defendingTypes resist attacks of attackingTypes
 * For dual-type Pokemon, averages the defensive scores against both types
 * Returns a score 0-100
 * - 0-33: Takes super effective damage (weak)
 * - 34-66: Takes normal damage
 * - 67-100: Resists damage
 */
export function getDefensiveScore(
  defendingTypes: (PokemonType | string)[],
  attackingTypes: (PokemonType | string)[]
): number {
  if (defendingTypes.length === 0 || attackingTypes.length === 0) {
    return 50; // Neutral if no types
  }

  const matchups = getTypeMatchups();

  // Calculate defensive score for each defending type against each attacking type
  const scores: number[] = [];

  for (const defType of defendingTypes) {
    const defendingStr = defType.toString();
    const typeData = matchups[defendingStr];

    if (!typeData) {
      scores.push(50); // Neutral if type not found
      continue;
    }

    // For each defending type, score against all attacking types
    const defenseScores = attackingTypes.map((atkType) => {
      const attackingStr = atkType.toString();

      // Resists damage: 75
      if (typeData.resistsAgainst.includes(attackingStr)) {
        return 75;
      }

      // Takes super effective damage (weak): 25
      if (typeData.superEffectiveFrom.includes(attackingStr)) {
        return 25;
      }

      // Normal effectiveness: 50
      return 50;
    });

    // Average the defense against all attacking types for this defending type
    scores.push(defenseScores.reduce((a, b) => a + b, 0) / defenseScores.length);
  }

  // Average across all defending types
  return scores.reduce((a, b) => a + b, 0) / scores.length;
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
