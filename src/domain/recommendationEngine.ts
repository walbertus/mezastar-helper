/**
 * Recommendation Engine
 * Scores and ranks Mezatags against enemy Pokemon
 */

import { Mezatag, Pokemon, RecommendationType, ScoredMezatag, Recommendation } from './models';
import { getOffensiveScore, getDefensiveScore } from './typeEffectiveness';

/**
 * Score a single Mezatag against an enemy Pokemon
 */
function scoreMezatag(mezatag: Mezatag, enemy: Pokemon): ScoredMezatag {
  const offensiveScore = getOffensiveScore(mezatag.move.type, enemy.types);
  const defensiveScore = getDefensiveScore(mezatag.types, enemy.types);
  const combinedScore = (offensiveScore + defensiveScore) / 2;

  return {
    mezatag,
    offensiveScore,
    defensiveScore,
    combinedScore,
  };
}

/**
 * Score all Mezatags and return top 6 for each recommendation type
 */
export function getRecommendations(
  enemyPokemon: Pokemon,
  mezatags: Mezatag[]
): {
  attack: Recommendation;
  defense: Recommendation;
  balanced: Recommendation;
} {
  // Score all Mezatags
  const scoredMezatags = mezatags.map((mezatag) => scoreMezatag(mezatag, enemyPokemon));

  // Sort by different criteria; ties broken by the complementary score, then energy ascending (lower energy = higher priority)
  const byAttack = [...scoredMezatags].sort(
    (a, b) =>
      b.offensiveScore - a.offensiveScore ||
      b.defensiveScore - a.defensiveScore ||
      a.mezatag.energy - b.mezatag.energy
  );
  const byDefense = [...scoredMezatags].sort(
    (a, b) =>
      b.defensiveScore - a.defensiveScore ||
      b.offensiveScore - a.offensiveScore ||
      a.mezatag.energy - b.mezatag.energy
  );
  const byCombined = [...scoredMezatags].sort(
    (a, b) =>
      b.combinedScore - a.combinedScore ||
      b.offensiveScore - a.offensiveScore ||
      b.defensiveScore - a.defensiveScore ||
      a.mezatag.energy - b.mezatag.energy
  );

  return {
    attack: {
      type: RecommendationType.ATTACK,
      enemyPokemon,
      recommendations: byAttack.slice(0, 6),
    },
    defense: {
      type: RecommendationType.DEFENSE,
      enemyPokemon,
      recommendations: byDefense.slice(0, 6),
    },
    balanced: {
      type: RecommendationType.BALANCED,
      enemyPokemon,
      recommendations: byCombined.slice(0, 6),
    },
  };
}
