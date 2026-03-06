/**
 * Recommendation Engine Tests
 */

import { describe, it, expect } from 'vitest';
import { getRecommendations } from '../../src/domain/recommendationEngine';
import { Mezatag, Pokemon, PokemonType, RecommendationType } from '../../src/domain/models';

const mockMezatags: Mezatag[] = [
  {
    name: 'Pikachu',
    types: [PokemonType.Electric],
    stats: { hp: 35, attack: 55, defense: 40, spAtk: 50, spDef: 50, speed: 90 },
    move: { name: 'Thunderbolt', type: PokemonType.Electric },
  },
  {
    name: 'Charizard',
    types: [PokemonType.Fire, PokemonType.Flying],
    stats: { hp: 78, attack: 84, defense: 78, spAtk: 109, spDef: 85, speed: 100 },
    move: { name: 'Flamethrower', type: PokemonType.Fire },
  },
  {
    name: 'Blastoise',
    types: [PokemonType.Water],
    stats: { hp: 79, attack: 83, defense: 100, spAtk: 83, spDef: 83, speed: 78 },
    move: { name: 'Hydro Cannon', type: PokemonType.Water },
  },
  {
    name: 'Venusaur',
    types: [PokemonType.Grass, PokemonType.Poison],
    stats: { hp: 80, attack: 82, defense: 83, spAtk: 100, spDef: 100, speed: 80 },
    move: { name: 'Solar Beam', type: PokemonType.Grass },
  },
  {
    name: 'Alakazam',
    types: [PokemonType.Psychic],
    stats: { hp: 55, attack: 50, defense: 65, spAtk: 135, spDef: 85, speed: 120 },
    move: { name: 'Psychic', type: PokemonType.Psychic },
  },
];

const waterPokemon: Pokemon = {
  name: 'Squirtle',
  types: [PokemonType.Water],
  stats: { hp: 44, attack: 48, defense: 65, spAtk: 50, spDef: 64, speed: 43 },
};

describe('Recommendation Engine', () => {
  describe('getRecommendations', () => {
    it('should return recommendations for all three types', () => {
      const recommendations = getRecommendations(waterPokemon, mockMezatags);

      expect(recommendations).toHaveProperty('attack');
      expect(recommendations).toHaveProperty('defense');
      expect(recommendations).toHaveProperty('balanced');
    });

    it('should return top 6 recommendations for each type', () => {
      const recommendations = getRecommendations(waterPokemon, mockMezatags);

      // With only 5 Mezatags, should return all 5 for each
      expect(recommendations.attack.recommendations.length).toBe(5);
      expect(recommendations.defense.recommendations.length).toBe(5);
      expect(recommendations.balanced.recommendations.length).toBe(5);
    });

    it('should cap recommendations at 6 when enough data available', () => {
      const manyMezatags = [...mockMezatags, ...mockMezatags];
      const recommendations = getRecommendations(waterPokemon, manyMezatags);

      expect(recommendations.attack.recommendations.length).toBe(6);
      expect(recommendations.defense.recommendations.length).toBe(6);
      expect(recommendations.balanced.recommendations.length).toBe(6);
    });

    it('should rank by offensive score for attack recommendations', () => {
      const recommendations = getRecommendations(waterPokemon, mockMezatags);

      // Electric (Pikachu) should be ranked high for attacking Water
      // Fire (Charizard) should be ranked high for attacking Water
      const offensiveScores = recommendations.attack.recommendations.map((r) => r.offensiveScore);
      for (let i = 0; i < offensiveScores.length - 1; i++) {
        expect(offensiveScores[i]).toBeGreaterThanOrEqual(offensiveScores[i + 1]);
      }
    });

    it('should rank by defensive score for defense recommendations', () => {
      const recommendations = getRecommendations(waterPokemon, mockMezatags);

      // Defensive scores should be sorted in descending order
      const defensiveScores = recommendations.defense.recommendations.map((r) => r.defensiveScore);
      for (let i = 0; i < defensiveScores.length - 1; i++) {
        expect(defensiveScores[i]).toBeGreaterThanOrEqual(defensiveScores[i + 1]);
      }
    });

    it('should rank by combined score for balanced recommendations', () => {
      const recommendations = getRecommendations(waterPokemon, mockMezatags);

      // Combined scores should be sorted in descending order
      const combinedScores = recommendations.balanced.recommendations.map((r) => r.combinedScore);
      for (let i = 0; i < combinedScores.length - 1; i++) {
        expect(combinedScores[i]).toBeGreaterThanOrEqual(combinedScores[i + 1]);
      }
    });

    it('should include scores for each recommendation', () => {
      const recommendations = getRecommendations(waterPokemon, mockMezatags);

      for (const rec of recommendations.attack.recommendations) {
        expect(rec.offensiveScore).toBeGreaterThanOrEqual(0);
        expect(rec.offensiveScore).toBeLessThanOrEqual(100);
        expect(rec.defensiveScore).toBeGreaterThanOrEqual(0);
        expect(rec.defensiveScore).toBeLessThanOrEqual(100);
        expect(rec.combinedScore).toBeGreaterThanOrEqual(0);
        expect(rec.combinedScore).toBeLessThanOrEqual(100);
      }
    });

    it('should return correct recommendation type', () => {
      const recommendations = getRecommendations(waterPokemon, mockMezatags);

      expect(recommendations.attack.type).toBe(RecommendationType.ATTACK);
      expect(recommendations.defense.type).toBe(RecommendationType.DEFENSE);
      expect(recommendations.balanced.type).toBe(RecommendationType.BALANCED);
    });

    it('should include enemy Pokemon info', () => {
      const recommendations = getRecommendations(waterPokemon, mockMezatags);

      expect(recommendations.attack.enemyPokemon).toEqual(waterPokemon);
      expect(recommendations.defense.enemyPokemon).toEqual(waterPokemon);
      expect(recommendations.balanced.enemyPokemon).toEqual(waterPokemon);
    });

    it('should handle Fire type Pokemon', () => {
      const firePokemon: Pokemon = {
        name: 'Charmander',
        types: [PokemonType.Fire],
        stats: { hp: 39, attack: 52, defense: 43, spAtk: 60, spDef: 50, speed: 65 },
      };

      const recommendations = getRecommendations(firePokemon, mockMezatags);

      // Water should be top for both attack and defense against Fire
      const attackTop = recommendations.attack.recommendations[0];
      const defenseTop = recommendations.defense.recommendations[0];

      expect(attackTop.offensiveScore).toBeGreaterThan(50);
      expect(defenseTop.defensiveScore).toBeGreaterThan(50);
    });

    it('should handle Electric type Pokemon', () => {
      const electricPokemon: Pokemon = {
        name: 'Voltorb',
        types: [PokemonType.Electric],
        stats: { hp: 40, attack: 30, defense: 50, spAtk: 55, spDef: 55, speed: 100 },
      };

      const recommendations = getRecommendations(electricPokemon, mockMezatags);

      // Ground should be strong against Electric
      // Water should have good offense against Electric
      expect(recommendations.attack.recommendations.length).toBeGreaterThan(0);
      expect(recommendations.defense.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle empty Mezatags list', () => {
      const recommendations = getRecommendations(waterPokemon, []);

      expect(recommendations.attack.recommendations).toHaveLength(0);
      expect(recommendations.defense.recommendations).toHaveLength(0);
      expect(recommendations.balanced.recommendations).toHaveLength(0);
    });

    it('should calculate combined score correctly', () => {
      const recommendations = getRecommendations(waterPokemon, [mockMezatags[0]]);

      const rec = recommendations.balanced.recommendations[0];
      const expectedCombined = (rec.offensiveScore + rec.defensiveScore) / 2;
      expect(rec.combinedScore).toBe(expectedCombined);
    });
  });
});
