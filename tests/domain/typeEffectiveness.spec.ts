/**
 * Type Effectiveness Engine Tests
 * Uses numeric multiplier data with runtime dual-type computation
 */

import { describe, it, expect } from 'vitest';
import {
  getOffensiveScore,
  getDefensiveScore,
  getCombinedScore,
} from '../../src/domain/typeEffectiveness';

describe('Type Effectiveness Engine', () => {
  describe('getOffensiveScore', () => {
    it('should return 100 for super effective moves against single type', () => {
      // Fire is super effective against Grass (2x → 100)
      const score = getOffensiveScore('Fire', ['Grass']);
      expect(score).toBe(100);
    });

    it('should return 25 for not very effective moves', () => {
      // Fire is not very effective against Water (0.5x → 25)
      const score = getOffensiveScore('Fire', ['Water']);
      expect(score).toBe(25);
    });

    it('should return 50 for normal effectiveness', () => {
      // Fire vs Electric is normal (1x → 50)
      const score = getOffensiveScore('Fire', ['Electric']);
      expect(score).toBe(50);
    });

    it('should return 0 for immune matchups', () => {
      // Normal vs Ghost is immune (0x → 0)
      expect(getOffensiveScore('Normal', ['Ghost'])).toBe(0);
      // Electric vs Ground is immune (0x → 0)
      expect(getOffensiveScore('Electric', ['Ground'])).toBe(0);
      // Fighting vs Ghost is immune (0x → 0)
      expect(getOffensiveScore('Fighting', ['Ghost'])).toBe(0);
      // Ground vs Flying is immune (0x → 0)
      expect(getOffensiveScore('Ground', ['Flying'])).toBe(0);
      // Ghost vs Normal is immune (0x → 0)
      expect(getOffensiveScore('Ghost', ['Normal'])).toBe(0);
      // Psychic vs Dark is immune (0x → 0)
      expect(getOffensiveScore('Psychic', ['Dark'])).toBe(0);
      // Poison vs Steel is immune (0x → 0)
      expect(getOffensiveScore('Poison', ['Steel'])).toBe(0);
      // Dragon vs Fairy is immune (0x → 0)
      expect(getOffensiveScore('Dragon', ['Fairy'])).toBe(0);
    });

    it('should compute dual-type effectiveness by multiplying individual multipliers', () => {
      // Fire vs Water/Electric: Fire→Water=0.5, Fire→Electric=1.0, combined=0.5 → 25
      expect(getOffensiveScore('Fire', ['Water', 'Electric'])).toBe(25);

      // Fire vs Grass/Steel: Fire→Grass=2.0, Fire→Steel=2.0, combined=4.0 → 100 (capped)
      expect(getOffensiveScore('Fire', ['Grass', 'Steel'])).toBe(100);

      // Fire vs Grass/Dragon: Fire→Grass=2.0, Fire→Dragon=0.5, combined=1.0 → 50
      expect(getOffensiveScore('Fire', ['Grass', 'Dragon'])).toBe(50);

      // Fire vs Grass/Bug: Fire→Grass=2.0, Fire→Bug=2.0, combined=4.0 → 100 (capped)
      expect(getOffensiveScore('Fire', ['Grass', 'Bug'])).toBe(100);

      // Fire vs Water/Rock: Fire→Water=0.5, Fire→Rock=0.5, combined=0.25 → 12.5
      expect(getOffensiveScore('Fire', ['Water', 'Rock'])).toBe(12.5);

      // Electric vs Water/Flying: 2.0 * 2.0 = 4.0 → 100 (capped)
      expect(getOffensiveScore('Electric', ['Water', 'Flying'])).toBe(100);

      // Normal vs Rock/Ghost: 0.5 * 0.0 = 0.0 → 0 (immune due to Ghost)
      expect(getOffensiveScore('Normal', ['Rock', 'Ghost'])).toBe(0);
    });

    it('should handle all Fire type effectiveness', () => {
      // Fire super effective against: Grass, Ice, Bug, Steel (2x → 100)
      expect(getOffensiveScore('Fire', ['Grass'])).toBe(100);
      expect(getOffensiveScore('Fire', ['Ice'])).toBe(100);
      expect(getOffensiveScore('Fire', ['Bug'])).toBe(100);
      expect(getOffensiveScore('Fire', ['Steel'])).toBe(100);

      // Fire not very effective against: Water, Rock, Fire, Dragon (0.5x → 25)
      expect(getOffensiveScore('Fire', ['Water'])).toBe(25);
      expect(getOffensiveScore('Fire', ['Rock'])).toBe(25);
      expect(getOffensiveScore('Fire', ['Fire'])).toBe(25);
      expect(getOffensiveScore('Fire', ['Dragon'])).toBe(25);
    });

    it('should handle Water type effectiveness', () => {
      // Water super effective against: Fire, Ground, Rock (2x → 100)
      expect(getOffensiveScore('Water', ['Fire'])).toBe(100);
      expect(getOffensiveScore('Water', ['Ground'])).toBe(100);
      expect(getOffensiveScore('Water', ['Rock'])).toBe(100);

      // Water not very effective against: Water, Grass, Dragon (0.5x → 25)
      expect(getOffensiveScore('Water', ['Water'])).toBe(25);
      expect(getOffensiveScore('Water', ['Grass'])).toBe(25);
      expect(getOffensiveScore('Water', ['Dragon'])).toBe(25);
    });

    it('should handle Electric type effectiveness', () => {
      // Electric super effective against: Water, Flying (2x → 100)
      expect(getOffensiveScore('Electric', ['Water'])).toBe(100);
      expect(getOffensiveScore('Electric', ['Flying'])).toBe(100);

      // Electric not very effective against: Electric, Grass, Dragon (0.5x → 25)
      expect(getOffensiveScore('Electric', ['Electric'])).toBe(25);
      expect(getOffensiveScore('Electric', ['Grass'])).toBe(25);
      expect(getOffensiveScore('Electric', ['Dragon'])).toBe(25);

      // Electric immune against: Ground (0x → 0)
      expect(getOffensiveScore('Electric', ['Ground'])).toBe(0);
    });

    it('should handle Grass type effectiveness', () => {
      // Grass super effective against: Water, Ground, Rock (2x → 100)
      expect(getOffensiveScore('Grass', ['Water'])).toBe(100);
      expect(getOffensiveScore('Grass', ['Ground'])).toBe(100);
      expect(getOffensiveScore('Grass', ['Rock'])).toBe(100);

      // Grass not very effective against: Fire, Grass, Poison, Flying, Bug, Dragon, Steel (0.5x → 25)
      expect(getOffensiveScore('Grass', ['Fire'])).toBe(25);
      expect(getOffensiveScore('Grass', ['Grass'])).toBe(25);
      expect(getOffensiveScore('Grass', ['Poison'])).toBe(25);
      expect(getOffensiveScore('Grass', ['Flying'])).toBe(25);
      expect(getOffensiveScore('Grass', ['Bug'])).toBe(25);
      expect(getOffensiveScore('Grass', ['Dragon'])).toBe(25);
      expect(getOffensiveScore('Grass', ['Steel'])).toBe(25);
    });

    it('should return 50 for invalid types', () => {
      const score = getOffensiveScore('InvalidType', ['Fire']);
      expect(score).toBe(50);
    });

    it('should return 50 for empty defending types', () => {
      const score = getOffensiveScore('Fire', []);
      expect(score).toBe(50);
    });
  });

  describe('getDefensiveScore', () => {
    it('should return 75 for resisting types', () => {
      // Water resists Fire attacks (Fire→Water = 0.5x → defensive 75)
      const score = getDefensiveScore(['Water'], ['Fire']);
      expect(score).toBe(75);
    });

    it('should return 25 for weak to types', () => {
      // Water is weak to Electric attacks (Electric→Water = 2x → defensive 25)
      const score = getDefensiveScore(['Water'], ['Electric']);
      expect(score).toBe(25);
    });

    it('should return 50 for normal resistance', () => {
      // Water vs Normal (Normal→Water = 1x → defensive 50)
      const score = getDefensiveScore(['Water'], ['Normal']);
      expect(score).toBe(50);
    });

    it('should return 100 for immune matchups', () => {
      // Normal is immune to Ghost attacks (Ghost→Normal = 0x → defensive 100)
      expect(getDefensiveScore(['Normal'], ['Ghost'])).toBe(100);
      // Ghost is immune to Normal attacks (Normal→Ghost = 0x → defensive 100)
      expect(getDefensiveScore(['Ghost'], ['Normal'])).toBe(100);
      // Flying is immune to Ground attacks (Ground→Flying = 0x → defensive 100)
      expect(getDefensiveScore(['Flying'], ['Ground'])).toBe(100);
      // Ground is immune to Electric attacks (Electric→Ground = 0x → defensive 100)
      expect(getDefensiveScore(['Ground'], ['Electric'])).toBe(100);
    });

    it('should average defense against multiple attacking types', () => {
      // Water defending against Fire/Electric
      // Fire→Water = 0.5x → defensive 75
      // Electric→Water = 2x → defensive 25
      // Average: (75 + 25) / 2 = 50
      const score = getDefensiveScore(['Water'], ['Fire', 'Electric']);
      expect(score).toBe(50);
    });

    it('should compute dual-type defense by multiplying multipliers', () => {
      // Water/Grass defending against Normal attack
      // Normal→Water = 1.0, Normal→Grass = 1.0, combined = 1.0 → defensive 50
      expect(getDefensiveScore(['Water', 'Grass'], ['Normal'])).toBe(50);

      // Water/Grass defending against Electric attack
      // Electric→Water = 2.0, Electric→Grass = 0.5, combined = 1.0 → defensive 50
      expect(getDefensiveScore(['Water', 'Grass'], ['Electric'])).toBe(50);

      // Water/Grass defending against Fire attack
      // Fire→Water = 0.5, Fire→Grass = 2.0, combined = 1.0 → defensive 50
      expect(getDefensiveScore(['Water', 'Grass'], ['Fire'])).toBe(50);

      // Rock/Ground defending against Water attack
      // Water→Rock = 2.0, Water→Ground = 2.0, combined = 4.0 → defensive 0
      expect(getDefensiveScore(['Rock', 'Ground'], ['Water'])).toBe(0);

      // Steel/Fairy defending against Poison attack
      // Poison→Steel = 0.0, Poison→Fairy = 2.0, combined = 0.0 → defensive 100 (immune)
      expect(getDefensiveScore(['Steel', 'Fairy'], ['Poison'])).toBe(100);
    });

    it('should handle Fire type defenses', () => {
      // Fire resists: Fire, Grass, Ice, Bug, Steel, Fairy (0.5x → defensive 75)
      expect(getDefensiveScore(['Fire'], ['Fire'])).toBe(75);
      expect(getDefensiveScore(['Fire'], ['Grass'])).toBe(75);
      expect(getDefensiveScore(['Fire'], ['Ice'])).toBe(75);
      expect(getDefensiveScore(['Fire'], ['Bug'])).toBe(75);
      expect(getDefensiveScore(['Fire'], ['Steel'])).toBe(75);
      expect(getDefensiveScore(['Fire'], ['Fairy'])).toBe(75);

      // Fire weak to: Water, Ground, Rock (2x → defensive 25)
      expect(getDefensiveScore(['Fire'], ['Water'])).toBe(25);
      expect(getDefensiveScore(['Fire'], ['Ground'])).toBe(25);
      expect(getDefensiveScore(['Fire'], ['Rock'])).toBe(25);
    });

    it('should handle Electric type defenses', () => {
      // Electric resists: Flying, Steel, Electric (0.5x → defensive 75)
      expect(getDefensiveScore(['Electric'], ['Flying'])).toBe(75);
      expect(getDefensiveScore(['Electric'], ['Steel'])).toBe(75);
      expect(getDefensiveScore(['Electric'], ['Electric'])).toBe(75);

      // Electric weak to: Ground (2x → defensive 25)
      expect(getDefensiveScore(['Electric'], ['Ground'])).toBe(25);
    });

    it('should handle Grass type defenses', () => {
      // Grass resists: Ground, Water, Grass, Electric (0.5x → defensive 75)
      expect(getDefensiveScore(['Grass'], ['Ground'])).toBe(75);
      expect(getDefensiveScore(['Grass'], ['Water'])).toBe(75);
      expect(getDefensiveScore(['Grass'], ['Grass'])).toBe(75);
      expect(getDefensiveScore(['Grass'], ['Electric'])).toBe(75);

      // Grass weak to: Fire, Ice, Poison, Flying, Bug (2x → defensive 25)
      expect(getDefensiveScore(['Grass'], ['Fire'])).toBe(25);
      expect(getDefensiveScore(['Grass'], ['Ice'])).toBe(25);
      expect(getDefensiveScore(['Grass'], ['Poison'])).toBe(25);
      expect(getDefensiveScore(['Grass'], ['Flying'])).toBe(25);
      expect(getDefensiveScore(['Grass'], ['Bug'])).toBe(25);
    });

    it('should return 50 for invalid types', () => {
      const score = getDefensiveScore(['InvalidType'], ['Fire']);
      expect(score).toBe(50);
    });

    it('should return 50 for empty defending or attacking types', () => {
      expect(getDefensiveScore([], ['Fire'])).toBe(50);
      expect(getDefensiveScore(['Water'], [])).toBe(50);
    });
  });

  describe('getCombinedScore', () => {
    it('should calculate combined score from offensive and defensive', () => {
      // getCombinedScore(moveType, pokemonTypes, enemyTypes)
      // Fire move, Electric Pokemon, against Water enemy
      // Offensive: Fire→Water = 0.5x → 25
      // Defensive: Electric defending vs Water attacks: Water→Electric = 1.0 → 50
      // Combined: (25 + 50) / 2 = 37.5
      const score = getCombinedScore('Fire', ['Electric'], ['Water']);
      expect(score).toBe(37.5);
    });

    it('should average offensive and defensive advantages', () => {
      // Electric move, Water Pokemon, against Water enemy
      // Offensive: Electric→Water = 2.0x → 100
      // Defensive: Water defending vs Water attacks: Water→Water = 0.5x → 75
      // Combined: (100 + 75) / 2 = 87.5
      const score = getCombinedScore('Electric', ['Water'], ['Water']);
      expect(score).toBe(87.5);
    });

    it('should handle different defensive advantages', () => {
      // Fire move, Grass Pokemon, against Water enemy
      // Offensive: Fire→Water = 0.5x → 25
      // Defensive: Grass defending vs Water attacks: Water→Grass = 0.5x → 75
      // Combined: (25 + 75) / 2 = 50
      const score = getCombinedScore('Fire', ['Grass'], ['Water']);
      expect(score).toBe(50);
    });

    it('should average scores for dual-type Pokemon', () => {
      // Water move, Water/Electric Pokemon, against Normal/Fire enemy
      // Offensive: Water→[Normal, Fire]
      //   Water→Normal = 1.0, Water→Fire = 2.0, combined = 2.0 → 100
      // Defensive: [Water, Electric] defending vs [Normal, Fire]
      //   Normal→[Water, Electric] = 1.0 * 1.0 = 1.0 → defensive 50
      //   Fire→[Water, Electric] = 0.5 * 1.0 = 0.5 → defensive 75
      //   Average: (50 + 75) / 2 = 62.5
      // Combined: (100 + 62.5) / 2 = 81.25
      const score = getCombinedScore('Water', ['Water', 'Electric'], ['Normal', 'Fire']);
      expect(score).toBe(81.25);
    });

    it('should handle immunity in combined scoring', () => {
      // Normal move, Normal Pokemon, against Ghost enemy
      // Offensive: Normal→Ghost = 0x → 0
      // Defensive: Normal defending vs Ghost attacks: Ghost→Normal = 0x → 100 (immune)
      // Combined: (0 + 100) / 2 = 50
      const score = getCombinedScore('Normal', ['Normal'], ['Ghost']);
      expect(score).toBe(50);
    });
  });
});
