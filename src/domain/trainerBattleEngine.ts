/**
 * Trainer Battle Engine
 * Recommends an optimal 4-Pokemon team against a fixed sequence of 4 trainer Pokemon.
 *
 * Slot roles:
 *   Slot 1 — Frontliner: targets Trainer #1, must survive Trainer #1's attack (hard filter)
 *   Slot 2 — Sacrifice:  targets Trainer #1, intentionally KO'd by AoE — no defensive filter
 *   Slot 3 — Anchor:     targets Trainer #4, exposed to Trainer #1-3 AoE (survival informational)
 *   Slot 4 — Reserve:    enters after Slot 2 KO, targets Trainer #2, must survive Trainer #2's attack
 *
 * Assignment order (most constrained first): Slot 3 -> Slot 1 -> Slot 4 -> Slot 2
 * Only the rank-1 pick per slot is removed from the global pool.
 * Ties broken by energy ascending (lower energy preferred).
 */

import {
  Mezatag,
  SlotRecommendation,
  SlotSurvivalInfo,
  TrainerBattleResult,
  TrainerBattleSlot,
} from './models';
import { getOffensiveScore, getDefensiveScore } from './typeEffectiveness';

/** Minimum defensive score to be considered survivable */
const SURVIVAL_THRESHOLD = 1.0;

/** Number of ranked candidates to return per slot */
const TOP_N = 3;

/**
 * Build survival info for a set of trainer Pokemon that a slot is exposed to.
 */
function buildSurvivalInfo(mezatag: Mezatag, exposedTo: Mezatag[]): SlotSurvivalInfo[] {
  return exposedTo.map((trainerPokemon) => {
    const defensiveScore = getDefensiveScore(mezatag.types, [trainerPokemon.move.type]);
    return {
      trainerPokemon,
      defensiveScore,
      canSurvive: defensiveScore >= SURVIVAL_THRESHOLD,
    };
  });
}

/**
 * Score a Mezatag offensively against a trainer Pokemon target.
 */
function getOffensiveScoreForSlot(mezatag: Mezatag, target: Mezatag): number {
  return getOffensiveScore(mezatag.move.type, target.types);
}

/**
 * Check whether a Mezatag is defensively eligible for a slot that requires survival.
 * Returns true if defensive score vs the trainer's move type is >= SURVIVAL_THRESHOLD.
 */
function isDefensivelyEligible(mezatag: Mezatag, trainerAttacker: Mezatag): boolean {
  return getDefensiveScore(mezatag.types, [trainerAttacker.move.type]) >= SURVIVAL_THRESHOLD;
}

/**
 * Sort candidates by offensive score descending, then energy ascending.
 * Returns a new sorted array; does not mutate the input.
 */
function sortCandidates(candidates: Mezatag[], target: Mezatag): Mezatag[] {
  return [...candidates].sort((a, b) => {
    const scoreDiff = getOffensiveScoreForSlot(b, target) - getOffensiveScoreForSlot(a, target);
    if (scoreDiff !== 0) return scoreDiff;
    return a.energy - b.energy;
  });
}

/**
 * Pick top-N Mezatags from a pool for a given slot.
 * If defensiveAttacker is provided, eligible candidates (defensiveScore >= threshold) are preferred.
 * If no eligible candidates exist for rank-1, falls back to best overall and sets noEligibleCandidate.
 * Ranks 2+ are filled from the full sorted list (no defensive filter) to always show alternatives.
 * Returns an array of SlotRecommendation with ranks 1..N.
 */
function pickTopN(
  pool: Mezatag[],
  target: Mezatag,
  defensiveAttacker: Mezatag | null,
  exposedTo: Mezatag[],
  n: number
): SlotRecommendation[] {
  const sorted = sortCandidates(pool, target);

  let rank1: Mezatag;
  let noEligibleCandidate = false;

  if (defensiveAttacker === null) {
    rank1 = sorted[0];
  } else {
    const eligible = sorted.filter((m) => isDefensivelyEligible(m, defensiveAttacker));
    if (eligible.length > 0) {
      rank1 = eligible[0];
    } else {
      rank1 = sorted[0];
      noEligibleCandidate = true;
    }
  }

  // Build ranked list: rank-1 first, then remaining from sorted order (skipping rank-1)
  const remaining = sorted.filter((m) => m !== rank1);
  const ranked = [rank1, ...remaining].slice(0, n);

  return ranked.map((mezatag, idx) => ({
    rank: idx + 1,
    mezatag,
    offensiveScore: getOffensiveScoreForSlot(mezatag, target),
    survivalInfo: buildSurvivalInfo(mezatag, exposedTo),
    speedWarning: mezatag.stats.speed < target.stats.speed,
    // noEligibleCandidate only applies to rank-1 (and only for slots with a defensive filter)
    noEligibleCandidate: idx === 0 ? noEligibleCandidate : false,
  }));
}

/**
 * Recommend an optimal 4-Pokemon team for a trainer battle.
 *
 * @param trainerSequence - Exactly 4 trainer Mezatags in battle order.
 *   Index 0 = first trainer Pokemon (initial wave), index 3 = trainer reserve.
 * @param mezatags - Full pool of available player Mezatags to choose from.
 * @returns TrainerBattleResult with 4 slots (each with top-3 candidates) and total energy.
 */
export function getTrainerBattleRecommendation(
  trainerSequence: Mezatag[],
  mezatags: Mezatag[]
): TrainerBattleResult {
  if (trainerSequence.length !== 4) {
    throw new Error(`trainerSequence must have exactly 4 Pokemon, got ${trainerSequence.length}`);
  }
  if (mezatags.length === 0) {
    throw new Error('mezatags pool is empty');
  }

  const [t1, t2, t3, t4] = trainerSequence;

  // Greedy assignment pool — remove rank-1 pick per slot to prevent team duplicates
  let pool = [...mezatags];

  // --- Slot 3: Anchor — targets Trainer #4, no survival filter (informational only) ---
  const slot3Recs = pickTopN(pool, t4, null, [t1, t2, t3], TOP_N);
  pool = pool.filter((m) => m !== slot3Recs[0].mezatag);
  const slot3: TrainerBattleSlot = {
    slotIndex: 3,
    isReserve: false,
    isSacrifice: false,
    trainerOpponent: t4,
    recommendations: slot3Recs,
  };

  // --- Slot 1: Frontliner — targets Trainer #1, must survive Trainer #1's attack ---
  const slot1Recs = pickTopN(pool, t1, t1, [t1], TOP_N);
  pool = pool.filter((m) => m !== slot1Recs[0].mezatag);
  const slot1: TrainerBattleSlot = {
    slotIndex: 1,
    isReserve: false,
    isSacrifice: false,
    trainerOpponent: t1,
    recommendations: slot1Recs,
  };

  // --- Slot 4: Reserve — targets Trainer #2, must survive Trainer #2's attack ---
  const slot4Recs = pickTopN(pool, t2, t2, [t2], TOP_N);
  pool = pool.filter((m) => m !== slot4Recs[0].mezatag);
  const slot4: TrainerBattleSlot = {
    slotIndex: 4,
    isReserve: true,
    isSacrifice: false,
    trainerOpponent: t2,
    recommendations: slot4Recs,
  };

  // --- Slot 2: Sacrifice — targets Trainer #1, no survival filter ---
  const slot2Recs = pickTopN(pool, t1, null, [], TOP_N);
  const slot2: TrainerBattleSlot = {
    slotIndex: 2,
    isReserve: false,
    isSacrifice: true,
    trainerOpponent: t1,
    recommendations: slot2Recs,
  };

  const slots = [slot1, slot2, slot3, slot4];
  const totalEnergy = slots.reduce((sum, s) => sum + s.recommendations[0].mezatag.energy, 0);

  return { slots, totalEnergy };
}
