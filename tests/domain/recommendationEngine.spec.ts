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
    energy: 0,
    stats: { hp: 35, attack: 55, defense: 40, spAtk: 50, spDef: 50, speed: 90 },
    move: { name: 'Thunderbolt', type: PokemonType.Electric },
  },
  {
    name: 'Charizard',
    types: [PokemonType.Fire, PokemonType.Flying],
    energy: 0,
    stats: { hp: 78, attack: 84, defense: 78, spAtk: 109, spDef: 85, speed: 100 },
    move: { name: 'Flamethrower', type: PokemonType.Fire },
  },
  {
    name: 'Blastoise',
    types: [PokemonType.Water],
    energy: 0,
    stats: { hp: 79, attack: 83, defense: 100, spAtk: 83, spDef: 83, speed: 78 },
    move: { name: 'Hydro Cannon', type: PokemonType.Water },
  },
  {
    name: 'Venusaur',
    types: [PokemonType.Grass, PokemonType.Poison],
    energy: 0,
    stats: { hp: 80, attack: 82, defense: 83, spAtk: 100, spDef: 100, speed: 80 },
    move: { name: 'Solar Beam', type: PokemonType.Grass },
  },
  {
    name: 'Alakazam',
    types: [PokemonType.Psychic],
    energy: 0,
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
        expect(rec.defensiveScore).toBeGreaterThanOrEqual(0);
        expect(rec.combinedScore).toBeGreaterThanOrEqual(0);
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

      expect(attackTop.offensiveScore).toBeGreaterThan(1.0);
      expect(defenseTop.defensiveScore).toBeGreaterThan(1.0);
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

    it('should break attack list ties using defensiveScore descending', () => {
      // Both Mezatags use Fighting move → offensiveScore = 2.0 vs Normal enemy (tied)
      // Ghost type is immune to Normal attacks → defensiveScore = 4.0 (higher)
      // Normal type takes 2x from Fighting → defensiveScore = 0.5 (lower)
      const normalEnemy: Pokemon = {
        name: 'Snorlax',
        types: [PokemonType.Normal],
        stats: { hp: 160, attack: 110, defense: 65, spAtk: 65, spDef: 110, speed: 30 },
      };
      const highDefMezatag: Mezatag = {
        name: 'Haunter',
        types: [PokemonType.Ghost],
        energy: 0,
        stats: { hp: 45, attack: 50, defense: 45, spAtk: 115, spDef: 55, speed: 95 },
        move: { name: 'Shadow Punch', type: PokemonType.Fighting },
      };
      const lowDefMezatag: Mezatag = {
        name: 'Rattata',
        types: [PokemonType.Normal],
        energy: 0,
        stats: { hp: 30, attack: 56, defense: 35, spAtk: 25, spDef: 35, speed: 72 },
        move: { name: 'Tackle', type: PokemonType.Fighting },
      };

      const recommendations = getRecommendations(normalEnemy, [lowDefMezatag, highDefMezatag]);
      const attackList = recommendations.attack.recommendations;

      // Both have equal offensiveScore; highDefMezatag (Ghost, def=4.0) should rank first
      expect(attackList[0].offensiveScore).toBe(attackList[1].offensiveScore);
      expect(attackList[0].mezatag.name).toBe('Haunter');
      expect(attackList[1].mezatag.name).toBe('Rattata');
    });

    it('should break defense list ties using offensiveScore descending', () => {
      // Both Mezatags have Rock type → defensiveScore is equal vs Normal enemy (tied)
      // Fighting move is super-effective vs Normal → offensiveScore = 2.0 (higher)
      // Normal move is neutral vs Normal → offensiveScore = 1.0 (lower)
      const normalEnemy: Pokemon = {
        name: 'Snorlax',
        types: [PokemonType.Normal],
        stats: { hp: 160, attack: 110, defense: 65, spAtk: 65, spDef: 110, speed: 30 },
      };
      const highAtkMezatag: Mezatag = {
        name: 'Geodude',
        types: [PokemonType.Rock],
        energy: 0,
        stats: { hp: 40, attack: 80, defense: 100, spAtk: 30, spDef: 30, speed: 20 },
        move: { name: 'Rock Smash', type: PokemonType.Fighting },
      };
      const lowAtkMezatag: Mezatag = {
        name: 'Onix',
        types: [PokemonType.Rock],
        energy: 0,
        stats: { hp: 35, attack: 45, defense: 160, spAtk: 30, spDef: 45, speed: 70 },
        move: { name: 'Tackle', type: PokemonType.Normal },
      };

      const recommendations = getRecommendations(normalEnemy, [lowAtkMezatag, highAtkMezatag]);
      const defenseList = recommendations.defense.recommendations;

      // Both have equal defensiveScore; highAtkMezatag (Fighting move, off=2.0) should rank first
      expect(defenseList[0].defensiveScore).toBe(defenseList[1].defensiveScore);
      expect(defenseList[0].mezatag.name).toBe('Geodude');
      expect(defenseList[1].mezatag.name).toBe('Onix');
    });

    it('should break balanced list ties using offensiveScore then defensiveScore', () => {
      // Against a Rock enemy:
      //   highAtkMezatag: Water move (off=2.0 vs Rock) + Normal type (def=1.0 vs Rock) → combined=1.5
      //   lowAtkMezatag:  Psychic move (off=1.0 vs Rock) + Steel type (def=2.0 vs Rock) → combined=1.5
      // Same combinedScore; highAtkMezatag has higher offensiveScore so it ranks first
      const rockEnemy: Pokemon = {
        name: 'Graveler',
        types: [PokemonType.Rock],
        stats: { hp: 55, attack: 95, defense: 115, spAtk: 45, spDef: 45, speed: 35 },
      };
      const highAtkMezatag: Mezatag = {
        name: 'Vaporeon',
        types: [PokemonType.Normal],
        energy: 0,
        stats: { hp: 130, attack: 65, defense: 60, spAtk: 110, spDef: 95, speed: 65 },
        move: { name: 'Water Gun', type: PokemonType.Water },
      };
      const highDefMezatag: Mezatag = {
        name: 'Steelix',
        types: [PokemonType.Steel],
        energy: 0,
        stats: { hp: 75, attack: 85, defense: 200, spAtk: 55, spDef: 65, speed: 30 },
        move: { name: 'Confusion', type: PokemonType.Psychic },
      };

      const recommendations = getRecommendations(rockEnemy, [highDefMezatag, highAtkMezatag]);
      const balancedList = recommendations.balanced.recommendations;

      // Both have equal combinedScore (1.5); highAtkMezatag (Water move, off=2.0) should rank first
      expect(balancedList[0].combinedScore).toBe(balancedList[1].combinedScore);
      expect(balancedList[0].mezatag.name).toBe('Vaporeon');
      expect(balancedList[1].mezatag.name).toBe('Steelix');
    });

    it('should break ties using energy ascending when all scores are equal', () => {
      // Both Mezatags are identical in type and move → all scores are equal
      // lowEnergyMezatag has energy=50, highEnergyMezatag has energy=150
      // Lower energy should rank first in all three lists
      const normalEnemy: Pokemon = {
        name: 'Snorlax',
        types: [PokemonType.Normal],
        stats: { hp: 160, attack: 110, defense: 65, spAtk: 65, spDef: 110, speed: 30 },
      };
      const lowEnergyMezatag: Mezatag = {
        name: 'LowEnergy',
        types: [PokemonType.Fighting],
        energy: 50,
        stats: { hp: 70, attack: 90, defense: 70, spAtk: 45, spDef: 60, speed: 70 },
        move: { name: 'Karate Chop', type: PokemonType.Fighting },
      };
      const highEnergyMezatag: Mezatag = {
        name: 'HighEnergy',
        types: [PokemonType.Fighting],
        energy: 150,
        stats: { hp: 70, attack: 90, defense: 70, spAtk: 45, spDef: 60, speed: 70 },
        move: { name: 'Karate Chop', type: PokemonType.Fighting },
      };

      const recommendations = getRecommendations(normalEnemy, [
        highEnergyMezatag,
        lowEnergyMezatag,
      ]);

      // All scores are identical; lower energy (50) should rank first in all lists
      expect(recommendations.attack.recommendations[0].mezatag.name).toBe('LowEnergy');
      expect(recommendations.defense.recommendations[0].mezatag.name).toBe('LowEnergy');
      expect(recommendations.balanced.recommendations[0].mezatag.name).toBe('LowEnergy');
    });
  });
});
