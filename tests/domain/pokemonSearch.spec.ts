/**
 * Pokemon Search Tests
 */

import { describe, it, expect } from 'vitest';
import {
  searchPokemon,
  filterValidMezatags,
  getUniquePokemonNames,
  getMezatagsForPokemon,
} from '../../src/domain/pokemonSearch';
import { Mezatag, PokemonType } from '../../src/domain/models';

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
    name: 'Pikachu', // Duplicate name with different move
    types: [PokemonType.Electric],
    stats: { hp: 35, attack: 55, defense: 40, spAtk: 50, spDef: 50, speed: 90 },
    move: { name: 'Thunder Wave', type: PokemonType.Electric },
  },
  {
    name: 'Blastoise',
    types: [PokemonType.Water],
    stats: { hp: 79, attack: 83, defense: 100, spAtk: 83, spDef: 83, speed: 78 },
    move: { name: 'Hydro Cannon', type: PokemonType.Water },
  },
];

describe('Pokemon Search', () => {
  describe('searchPokemon', () => {
    it('should find Pokemon by exact name', () => {
      const results = searchPokemon('Pikachu', mockMezatags);
      expect(results).toHaveLength(2); // Two Pikachu entries
      expect(results[0].name).toBe('Pikachu');
    });

    it('should be case insensitive', () => {
      const results1 = searchPokemon('pikachu', mockMezatags);
      const results2 = searchPokemon('PIKACHU', mockMezatags);
      const results3 = searchPokemon('Pikachu', mockMezatags);

      expect(results1).toHaveLength(2);
      expect(results2).toHaveLength(2);
      expect(results3).toHaveLength(2);
    });

    it('should support substring search', () => {
      const results = searchPokemon('char', mockMezatags);
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Charizard');
    });

    it('should support partial matching', () => {
      const results = searchPokemon('blast', mockMezatags);
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Blastoise');
    });

    it('should return empty array for non-existent Pokemon', () => {
      const results = searchPokemon('Mewtwo', mockMezatags);
      expect(results).toHaveLength(0);
    });

    it('should return empty array for empty query', () => {
      const results = searchPokemon('', mockMezatags);
      expect(results).toHaveLength(0);
    });

    it('should return empty array for whitespace-only query', () => {
      const results = searchPokemon('   ', mockMezatags);
      expect(results).toHaveLength(0);
    });

    it('should find Pokemon starting with query', () => {
      const results = searchPokemon('Pi', mockMezatags);
      expect(results.every((m) => m.name.toLowerCase().includes('pi'))).toBe(true);
    });
  });

  describe('filterValidMezatags', () => {
    it('should keep Mezatags with all valid stats', () => {
      const results = filterValidMezatags(mockMezatags);
      expect(results).toHaveLength(4);
    });

    it('should remove Mezatags with missing stats', () => {
      const invalidMezatags = [
        ...mockMezatags,
        {
          name: 'InvalidPokemon1',
          types: [PokemonType.Normal],
          stats: { hp: -1, attack: 50, defense: 50, spAtk: 50, spDef: 50, speed: 50 },
          move: { name: 'Tackle', type: PokemonType.Normal },
        },
      ];
      const results = filterValidMezatags(invalidMezatags as Mezatag[]);
      expect(results).toHaveLength(4);
    });

    it('should remove Mezatags with missing name', () => {
      const invalidMezatags = [
        ...mockMezatags,
        {
          name: '',
          types: [PokemonType.Normal],
          stats: { hp: 50, attack: 50, defense: 50, spAtk: 50, spDef: 50, speed: 50 },
          move: { name: 'Tackle', type: PokemonType.Normal },
        },
      ];
      const results = filterValidMezatags(invalidMezatags as Mezatag[]);
      expect(results).toHaveLength(4);
    });

    it('should remove Mezatags with missing move', () => {
      const invalidMezatags: any[] = [
        ...mockMezatags,
        {
          name: 'NoMovePokemon',
          type: PokemonType.Normal,
          stats: { hp: 50, attack: 50, defense: 50, spAtk: 50, spDef: 50, speed: 50 },
          move: undefined,
        },
      ];
      const results = filterValidMezatags(invalidMezatags);
      expect(results).toHaveLength(4);
    });
  });

  describe('getUniquePokemonNames', () => {
    it('should return unique Pokemon names', () => {
      const results = getUniquePokemonNames(mockMezatags);
      expect(results).toHaveLength(3);
      expect(results).toContain('Pikachu');
      expect(results).toContain('Charizard');
      expect(results).toContain('Blastoise');
    });

    it('should return sorted names', () => {
      const results = getUniquePokemonNames(mockMezatags);
      expect(results).toEqual([...results].sort());
    });

    it('should return empty array for empty input', () => {
      const results = getUniquePokemonNames([]);
      expect(results).toHaveLength(0);
    });

    it('should deduplicate names correctly', () => {
      const duplicates = [mockMezatags[0], mockMezatags[0], mockMezatags[1]];
      const results = getUniquePokemonNames(duplicates);
      expect(results).toHaveLength(2);
    });
  });

  describe('getMezatagsForPokemon', () => {
    it('should return all Mezatags for a Pokemon', () => {
      const results = getMezatagsForPokemon('Pikachu', mockMezatags);
      expect(results).toHaveLength(2);
      expect(results.every((m) => m.name === 'Pikachu')).toBe(true);
    });

    it('should be case insensitive', () => {
      const results1 = getMezatagsForPokemon('pikachu', mockMezatags);
      const results2 = getMezatagsForPokemon('PIKACHU', mockMezatags);
      expect(results1).toHaveLength(2);
      expect(results2).toHaveLength(2);
    });

    it('should return empty array for non-existent Pokemon', () => {
      const results = getMezatagsForPokemon('Mewtwo', mockMezatags);
      expect(results).toHaveLength(0);
    });

    it('should return single Mezatag for unique Pokemon', () => {
      const results = getMezatagsForPokemon('Charizard', mockMezatags);
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Charizard');
    });
  });
});
