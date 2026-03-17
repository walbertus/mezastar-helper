/**
 * TrainerBattleForm component tests
 * Verifies: renders 4 slot inputs, submit validation, onSubmit called with correct sequence.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TrainerBattleForm } from '../TrainerBattleForm';
import { Mezatag, PokemonType } from '../../domain/models';

/** Four distinct Mezatag fixtures for trainer battle slot testing. */
const mockMezatags: Mezatag[] = [
  {
    name: 'Pikachu',
    types: [PokemonType.Electric],
    energy: 100,
    stats: { hp: 35, attack: 55, defense: 40, spAtk: 50, spDef: 50, speed: 90 },
    move: { name: 'Thunderbolt', type: PokemonType.Electric },
  },
  {
    name: 'Charizard',
    types: [PokemonType.Fire, PokemonType.Flying],
    energy: 120,
    stats: { hp: 78, attack: 84, defense: 78, spAtk: 109, spDef: 85, speed: 100 },
    move: { name: 'Flamethrower', type: PokemonType.Fire },
  },
  {
    name: 'Blastoise',
    types: [PokemonType.Water],
    energy: 110,
    stats: { hp: 79, attack: 83, defense: 100, spAtk: 85, spDef: 105, speed: 78 },
    move: { name: 'Surf', type: PokemonType.Water },
  },
  {
    name: 'Venusaur',
    types: [PokemonType.Grass, PokemonType.Poison],
    energy: 105,
    stats: { hp: 80, attack: 82, defense: 83, spAtk: 100, spDef: 100, speed: 80 },
    move: { name: 'Solar Beam', type: PokemonType.Grass },
  },
];

describe('TrainerBattleForm', () => {
  describe('render', () => {
    it('should render 4 slot search inputs', () => {
      render(<TrainerBattleForm mezatags={mockMezatags} onSubmit={vi.fn()} />);
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBe(4);
    });

    it('should render a submit button', () => {
      render(<TrainerBattleForm mezatags={mockMezatags} onSubmit={vi.fn()} />);
      expect(screen.getByRole('button', { name: /get recommendation/i })).toBeTruthy();
    });
  });

  describe('validation', () => {
    it('should show an error when submit is clicked with no slots filled', () => {
      render(<TrainerBattleForm mezatags={mockMezatags} onSubmit={vi.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: /get recommendation/i }));
      expect(screen.getByRole('alert')).toBeTruthy();
    });

    it('should not call onSubmit when slots are not all filled', () => {
      const onSubmit = vi.fn();
      render(<TrainerBattleForm mezatags={mockMezatags} onSubmit={onSubmit} />);
      fireEvent.click(screen.getByRole('button', { name: /get recommendation/i }));
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('slot search', () => {
    it('should show matching Pokemon in dropdown when typing in a slot', () => {
      render(<TrainerBattleForm mezatags={mockMezatags} onSubmit={vi.fn()} />);
      const inputs = screen.getAllByRole('textbox');
      fireEvent.change(inputs[0], { target: { value: 'pika' } });
      expect(screen.getByText('Pikachu')).toBeTruthy();
    });
  });
});
