/**
 * Domain Models for Mezastar Helper
 * Defines core data structures and types
 */

/**
 * Pokemon statistics
 */
export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
}

/**
 * Pokemon type enumeration
 */
export enum PokemonType {
  Normal = 'Normal',
  Fire = 'Fire',
  Water = 'Water',
  Electric = 'Electric',
  Grass = 'Grass',
  Ice = 'Ice',
  Fighting = 'Fighting',
  Poison = 'Poison',
  Ground = 'Ground',
  Flying = 'Flying',
  Psychic = 'Psychic',
  Bug = 'Bug',
  Rock = 'Rock',
  Ghost = 'Ghost',
  Dragon = 'Dragon',
  Dark = 'Dark',
  Steel = 'Steel',
  Fairy = 'Fairy',
}

/**
 * Move information
 */
export interface Move {
  name: string;
  type: PokemonType;
}

/**
 * Pokemon information with types and stats
 */
export interface Pokemon {
  name: string;
  types: PokemonType[];
  stats: PokemonStats;
}

/**
 * Mezatag - Pokemon tag with a single move
 */
export interface Mezatag extends Pokemon {
  energy: number;
  move: Move;
  imageUrl?: string;
}

/**
 * Recommendation type
 */
export enum RecommendationType {
  ATTACK = 'attack',
  DEFENSE = 'defense',
  BALANCED = 'balanced',
}

/**
 * Scored recommendation result
 */
export interface ScoredMezatag {
  mezatag: Mezatag;
  offensiveScore: number; // 0.0-4.0 raw damage multiplier (higher = more effective attack)
  defensiveScore: number; // 0.25-4.0 inverse multiplier 1/damage (higher = better defense); 4.0 = immune/double resist cap
  combinedScore: number; // average of offensiveScore and defensiveScore
}

/**
 * Recommendation response
 */
export interface Recommendation {
  type: RecommendationType;
  enemyPokemon: Pokemon;
  recommendations: ScoredMezatag[];
}

/**
 * Per-trainer survival info for a single trainer Pokemon that a slot is exposed to.
 * defensiveScore is the inverse-multiplier of our Mezatag's types against the trainer's move type.
 * trainerPokemon is a Mezatag so that the trainer's move type is always accessible.
 */
export interface SlotSurvivalInfo {
  trainerPokemon: Mezatag;
  defensiveScore: number; // >= 1.0 means neutral or better; < 1.0 means at risk
  canSurvive: boolean; // defensiveScore >= 1.0
}

/**
 * A single ranked candidate within a slot's top-3 recommendations.
 */
export interface SlotRecommendation {
  rank: number; // 1 = best, 2 = second best, 3 = third best
  mezatag: Mezatag;
  offensiveScore: number; // move type effectiveness vs trainerOpponent
  survivalInfo: SlotSurvivalInfo[]; // survival flags for each trainer Pokemon this slot is exposed to
  speedWarning: boolean; // true if this Mezatag speed < trainerOpponent speed
  noEligibleCandidate: boolean; // true if no eligible candidate met the defensive filter (fallback used)
}

/**
 * One slot in a trainer battle team recommendation.
 * Each slot provides top 3 ranked Mezatag candidates for the player to choose from.
 * trainerOpponent is a Mezatag so the trainer's move type is accessible for scoring.
 */
export interface TrainerBattleSlot {
  slotIndex: number; // 1–4
  isReserve: boolean; // true for slot 4 (enters after slot 2 is KO'd)
  isSacrifice: boolean; // true for slot 2 (intentionally KO'd by trainer AoE)
  trainerOpponent: Mezatag; // primary trainer Pokemon this slot targets
  recommendations: SlotRecommendation[]; // top 3 candidates, rank 1 is primary
}

/**
 * Full trainer battle team recommendation for a 4-Pokemon trainer sequence.
 * totalEnergy is based on the rank-1 (primary) pick for each slot.
 */
export interface TrainerBattleResult {
  slots: TrainerBattleSlot[]; // exactly 4, in slot order (index 0 = slot 1)
  totalEnergy: number; // sum of rank-1 Mezatag energies across all 4 slots
}
