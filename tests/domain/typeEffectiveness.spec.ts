/**
 * Type Effectiveness Engine Tests
 * Uses numeric multiplier data with runtime dual-type computation
 * All scores are raw floating-point multipliers (no 0-100 mapping)
 */

import { describe, it, expect } from 'vitest';
import {
  getOffensiveScore,
  getDefensiveScore,
  getCombinedScore,
} from '../../src/domain/typeEffectiveness';

describe('Type Effectiveness Engine', () => {
  describe('getOffensiveScore', () => {
    it('should return 2.0 for super effective moves against single type', () => {
      // Fire is super effective against Grass (2x)
      const score = getOffensiveScore('Fire', ['Grass']);
      expect(score).toBe(2.0);
    });

    it('should return 0.5 for not very effective moves', () => {
      // Fire is not very effective against Water (0.5x)
      const score = getOffensiveScore('Fire', ['Water']);
      expect(score).toBe(0.5);
    });

    it('should return 1.0 for normal effectiveness', () => {
      // Fire vs Electric is normal (1x)
      const score = getOffensiveScore('Fire', ['Electric']);
      expect(score).toBe(1.0);
    });

    it('should return 0 for immune matchups', () => {
      // Normal vs Ghost is immune (0x)
      expect(getOffensiveScore('Normal', ['Ghost'])).toBe(0);
      // Electric vs Ground is immune (0x)
      expect(getOffensiveScore('Electric', ['Ground'])).toBe(0);
      // Fighting vs Ghost is immune (0x)
      expect(getOffensiveScore('Fighting', ['Ghost'])).toBe(0);
      // Ground vs Flying is immune (0x)
      expect(getOffensiveScore('Ground', ['Flying'])).toBe(0);
      // Ghost vs Normal is immune (0x)
      expect(getOffensiveScore('Ghost', ['Normal'])).toBe(0);
      // Psychic vs Dark is immune (0x)
      expect(getOffensiveScore('Psychic', ['Dark'])).toBe(0);
      // Poison vs Steel is immune (0x)
      expect(getOffensiveScore('Poison', ['Steel'])).toBe(0);
      // Dragon vs Fairy is immune (0x)
      expect(getOffensiveScore('Dragon', ['Fairy'])).toBe(0);
    });

    it('should compute dual-type effectiveness by multiplying individual multipliers', () => {
      // Fire vs Water/Electric: Fire→Water=0.5, Fire→Electric=1.0, combined=0.5
      expect(getOffensiveScore('Fire', ['Water', 'Electric'])).toBe(0.5);

      // Fire vs Grass/Steel: Fire→Grass=2.0, Fire→Steel=2.0, combined=4.0
      expect(getOffensiveScore('Fire', ['Grass', 'Steel'])).toBe(4.0);

      // Fire vs Grass/Dragon: Fire→Grass=2.0, Fire→Dragon=0.5, combined=1.0
      expect(getOffensiveScore('Fire', ['Grass', 'Dragon'])).toBe(1.0);

      // Fire vs Grass/Bug: Fire→Grass=2.0, Fire→Bug=2.0, combined=4.0
      expect(getOffensiveScore('Fire', ['Grass', 'Bug'])).toBe(4.0);

      // Fire vs Water/Rock: Fire→Water=0.5, Fire→Rock=0.5, combined=0.25
      expect(getOffensiveScore('Fire', ['Water', 'Rock'])).toBe(0.25);

      // Electric vs Water/Flying: 2.0 * 2.0 = 4.0
      expect(getOffensiveScore('Electric', ['Water', 'Flying'])).toBe(4.0);

      // Normal vs Rock/Ghost: 0.5 * 0.0 = 0.0 (immune due to Ghost)
      expect(getOffensiveScore('Normal', ['Rock', 'Ghost'])).toBe(0);
    });

    it('should handle all Fire type effectiveness', () => {
      // Fire super effective against: Grass, Ice, Bug, Steel (2x)
      expect(getOffensiveScore('Fire', ['Grass'])).toBe(2.0);
      expect(getOffensiveScore('Fire', ['Ice'])).toBe(2.0);
      expect(getOffensiveScore('Fire', ['Bug'])).toBe(2.0);
      expect(getOffensiveScore('Fire', ['Steel'])).toBe(2.0);

      // Fire not very effective against: Water, Rock, Fire, Dragon (0.5x)
      expect(getOffensiveScore('Fire', ['Water'])).toBe(0.5);
      expect(getOffensiveScore('Fire', ['Rock'])).toBe(0.5);
      expect(getOffensiveScore('Fire', ['Fire'])).toBe(0.5);
      expect(getOffensiveScore('Fire', ['Dragon'])).toBe(0.5);
    });

    it('should handle Water type effectiveness', () => {
      // Water super effective against: Fire, Ground, Rock (2x)
      expect(getOffensiveScore('Water', ['Fire'])).toBe(2.0);
      expect(getOffensiveScore('Water', ['Ground'])).toBe(2.0);
      expect(getOffensiveScore('Water', ['Rock'])).toBe(2.0);

      // Water not very effective against: Water, Grass, Dragon (0.5x)
      expect(getOffensiveScore('Water', ['Water'])).toBe(0.5);
      expect(getOffensiveScore('Water', ['Grass'])).toBe(0.5);
      expect(getOffensiveScore('Water', ['Dragon'])).toBe(0.5);
    });

    it('should handle Electric type effectiveness', () => {
      // Electric super effective against: Water, Flying (2x)
      expect(getOffensiveScore('Electric', ['Water'])).toBe(2.0);
      expect(getOffensiveScore('Electric', ['Flying'])).toBe(2.0);

      // Electric not very effective against: Electric, Grass, Dragon (0.5x)
      expect(getOffensiveScore('Electric', ['Electric'])).toBe(0.5);
      expect(getOffensiveScore('Electric', ['Grass'])).toBe(0.5);
      expect(getOffensiveScore('Electric', ['Dragon'])).toBe(0.5);

      // Electric immune against: Ground (0x)
      expect(getOffensiveScore('Electric', ['Ground'])).toBe(0);
    });

    it('should handle Grass type effectiveness', () => {
      // Grass super effective against: Water, Ground, Rock (2x)
      expect(getOffensiveScore('Grass', ['Water'])).toBe(2.0);
      expect(getOffensiveScore('Grass', ['Ground'])).toBe(2.0);
      expect(getOffensiveScore('Grass', ['Rock'])).toBe(2.0);

      // Grass not very effective against: Fire, Grass, Poison, Flying, Bug, Dragon, Steel (0.5x)
      expect(getOffensiveScore('Grass', ['Fire'])).toBe(0.5);
      expect(getOffensiveScore('Grass', ['Grass'])).toBe(0.5);
      expect(getOffensiveScore('Grass', ['Poison'])).toBe(0.5);
      expect(getOffensiveScore('Grass', ['Flying'])).toBe(0.5);
      expect(getOffensiveScore('Grass', ['Bug'])).toBe(0.5);
      expect(getOffensiveScore('Grass', ['Dragon'])).toBe(0.5);
      expect(getOffensiveScore('Grass', ['Steel'])).toBe(0.5);
    });

    it('should return 1.0 for invalid types', () => {
      const score = getOffensiveScore('InvalidType', ['Fire']);
      expect(score).toBe(1.0);
    });

    it('should return 1.0 for empty defending types', () => {
      const score = getOffensiveScore('Fire', []);
      expect(score).toBe(1.0);
    });
  });

  describe('getDefensiveScore', () => {
    it('should return 2.0 for resisting types', () => {
      // Water resists Fire attacks (Fire→Water = 0.5x → 1/0.5 = 2.0)
      const score = getDefensiveScore(['Water'], ['Fire']);
      expect(score).toBe(2.0);
    });

    it('should return 0.5 for weak to types', () => {
      // Water is weak to Electric attacks (Electric→Water = 2x → 1/2.0 = 0.5)
      const score = getDefensiveScore(['Water'], ['Electric']);
      expect(score).toBe(0.5);
    });

    it('should return 1.0 for normal resistance', () => {
      // Water vs Normal (Normal→Water = 1x → 1/1.0 = 1.0)
      const score = getDefensiveScore(['Water'], ['Normal']);
      expect(score).toBe(1.0);
    });

    it('should return 4.0 for immune matchups', () => {
      // Normal is immune to Ghost attacks (Ghost→Normal = 0x → capped at 4.0)
      expect(getDefensiveScore(['Normal'], ['Ghost'])).toBe(4.0);
      // Ghost is immune to Normal attacks (Normal→Ghost = 0x → capped at 4.0)
      expect(getDefensiveScore(['Ghost'], ['Normal'])).toBe(4.0);
      // Flying is immune to Ground attacks (Ground→Flying = 0x → capped at 4.0)
      expect(getDefensiveScore(['Flying'], ['Ground'])).toBe(4.0);
      // Ground is immune to Electric attacks (Electric→Ground = 0x → capped at 4.0)
      expect(getDefensiveScore(['Ground'], ['Electric'])).toBe(4.0);
    });

    it('should average defense against multiple attacking types', () => {
      // Water defending against Fire/Electric
      // Fire→Water = 0.5x → 1/0.5 = 2.0
      // Electric→Water = 2x → 1/2.0 = 0.5
      // Average: (2.0 + 0.5) / 2 = 1.25
      const score = getDefensiveScore(['Water'], ['Fire', 'Electric']);
      expect(score).toBe(1.25);
    });

    it('should compute dual-type defense by multiplying multipliers', () => {
      // Water/Grass defending against Normal attack
      // Normal→Water = 1.0, Normal→Grass = 1.0, combined = 1.0 → 1/1.0 = 1.0
      expect(getDefensiveScore(['Water', 'Grass'], ['Normal'])).toBe(1.0);

      // Water/Grass defending against Electric attack
      // Electric→Water = 2.0, Electric→Grass = 0.5, combined = 1.0 → 1/1.0 = 1.0
      expect(getDefensiveScore(['Water', 'Grass'], ['Electric'])).toBe(1.0);

      // Water/Grass defending against Fire attack
      // Fire→Water = 0.5, Fire→Grass = 2.0, combined = 1.0 → 1/1.0 = 1.0
      expect(getDefensiveScore(['Water', 'Grass'], ['Fire'])).toBe(1.0);

      // Rock/Ground defending against Water attack
      // Water→Rock = 2.0, Water→Ground = 2.0, combined = 4.0 → 1/4.0 = 0.25
      expect(getDefensiveScore(['Rock', 'Ground'], ['Water'])).toBe(0.25);

      // Steel/Fairy defending against Poison attack
      // Poison→Steel = 0.0, Poison→Fairy = 2.0, combined = 0.0 → immune → 4.0 (cap)
      expect(getDefensiveScore(['Steel', 'Fairy'], ['Poison'])).toBe(4.0);
    });

    it('should handle Fire type defenses', () => {
      // Fire resists: Fire, Grass, Ice, Bug, Steel, Fairy (0.5x → 1/0.5 = 2.0)
      expect(getDefensiveScore(['Fire'], ['Fire'])).toBe(2.0);
      expect(getDefensiveScore(['Fire'], ['Grass'])).toBe(2.0);
      expect(getDefensiveScore(['Fire'], ['Ice'])).toBe(2.0);
      expect(getDefensiveScore(['Fire'], ['Bug'])).toBe(2.0);
      expect(getDefensiveScore(['Fire'], ['Steel'])).toBe(2.0);
      expect(getDefensiveScore(['Fire'], ['Fairy'])).toBe(2.0);

      // Fire weak to: Water, Ground, Rock (2x → 1/2.0 = 0.5)
      expect(getDefensiveScore(['Fire'], ['Water'])).toBe(0.5);
      expect(getDefensiveScore(['Fire'], ['Ground'])).toBe(0.5);
      expect(getDefensiveScore(['Fire'], ['Rock'])).toBe(0.5);
    });

    it('should handle Electric type defenses', () => {
      // Electric resists: Flying, Steel, Electric (0.5x → 1/0.5 = 2.0)
      expect(getDefensiveScore(['Electric'], ['Flying'])).toBe(2.0);
      expect(getDefensiveScore(['Electric'], ['Steel'])).toBe(2.0);
      expect(getDefensiveScore(['Electric'], ['Electric'])).toBe(2.0);

      // Electric weak to: Ground (2x → 1/2.0 = 0.5)
      expect(getDefensiveScore(['Electric'], ['Ground'])).toBe(0.5);
    });

    it('should handle Grass type defenses', () => {
      // Grass resists: Ground, Water, Grass, Electric (0.5x → 1/0.5 = 2.0)
      expect(getDefensiveScore(['Grass'], ['Ground'])).toBe(2.0);
      expect(getDefensiveScore(['Grass'], ['Water'])).toBe(2.0);
      expect(getDefensiveScore(['Grass'], ['Grass'])).toBe(2.0);
      expect(getDefensiveScore(['Grass'], ['Electric'])).toBe(2.0);

      // Grass weak to: Fire, Ice, Poison, Flying, Bug (2x → 1/2.0 = 0.5)
      expect(getDefensiveScore(['Grass'], ['Fire'])).toBe(0.5);
      expect(getDefensiveScore(['Grass'], ['Ice'])).toBe(0.5);
      expect(getDefensiveScore(['Grass'], ['Poison'])).toBe(0.5);
      expect(getDefensiveScore(['Grass'], ['Flying'])).toBe(0.5);
      expect(getDefensiveScore(['Grass'], ['Bug'])).toBe(0.5);
    });

    it('should return 1.0 for invalid types', () => {
      const score = getDefensiveScore(['InvalidType'], ['Fire']);
      expect(score).toBe(1.0);
    });

    it('should return 1.0 for empty defending or attacking types', () => {
      expect(getDefensiveScore([], ['Fire'])).toBe(1.0);
      expect(getDefensiveScore(['Water'], [])).toBe(1.0);
    });
  });

  describe('getCombinedScore', () => {
    it('should calculate combined score from offensive and defensive', () => {
      // getCombinedScore(moveType, pokemonTypes, enemyTypes)
      // Fire move, Electric Pokemon, against Water enemy
      // Offensive: Fire→Water = 0.5x → 0.5
      // Defensive: Electric defending vs Water attacks: Water→Electric = 1.0 → 1/1.0 = 1.0
      // Combined: (0.5 + 1.0) / 2 = 0.75
      const score = getCombinedScore('Fire', ['Electric'], ['Water']);
      expect(score).toBe(0.75);
    });

    it('should average offensive and defensive advantages', () => {
      // Electric move, Water Pokemon, against Water enemy
      // Offensive: Electric→Water = 2.0x → 2.0
      // Defensive: Water defending vs Water attacks: Water→Water = 0.5x → 1/0.5 = 2.0
      // Combined: (2.0 + 2.0) / 2 = 2.0
      const score = getCombinedScore('Electric', ['Water'], ['Water']);
      expect(score).toBe(2.0);
    });

    it('should handle different defensive advantages', () => {
      // Fire move, Grass Pokemon, against Water enemy
      // Offensive: Fire→Water = 0.5x → 0.5
      // Defensive: Grass defending vs Water attacks: Water→Grass = 0.5x → 1/0.5 = 2.0
      // Combined: (0.5 + 2.0) / 2 = 1.25
      const score = getCombinedScore('Fire', ['Grass'], ['Water']);
      expect(score).toBe(1.25);
    });

    it('should average scores for dual-type Pokemon', () => {
      // Water move, Water/Electric Pokemon, against Normal/Fire enemy
      // Offensive: Water→[Normal, Fire]
      //   Water→Normal = 1.0, Water→Fire = 2.0, combined = 2.0
      // Defensive: [Water, Electric] defending vs [Normal, Fire]
      //   Normal→[Water, Electric] = 1.0 * 1.0 = 1.0 → 1/1.0 = 1.0
      //   Fire→[Water, Electric] = 0.5 * 1.0 = 0.5 → 1/0.5 = 2.0
      //   Average: (1.0 + 2.0) / 2 = 1.5
      // Combined: (2.0 + 1.5) / 2 = 1.75
      const score = getCombinedScore('Water', ['Water', 'Electric'], ['Normal', 'Fire']);
      expect(score).toBe(1.75);
    });

    it('should handle immunity in combined scoring', () => {
      // Normal move, Normal Pokemon, against Ghost enemy
      // Offensive: Normal→Ghost = 0x → 0.0
      // Defensive: Normal defending vs Ghost attacks: Ghost→Normal = 0x → immune → 4.0 (cap)
      // Combined: (0.0 + 4.0) / 2 = 2.0
      const score = getCombinedScore('Normal', ['Normal'], ['Ghost']);
      expect(score).toBe(2.0);
    });
  });
});
