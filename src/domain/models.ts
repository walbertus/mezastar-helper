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
