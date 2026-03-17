/**
 * SearchPanel component tests
 * Verifies: renders input, typing triggers search results, clicking a result calls onSelect.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchPanel } from '../SearchPanel';
import { Mezatag, PokemonType } from '../../domain/models';

/** Minimal Mezatag fixture matching the Mezatag interface. */
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
    name: 'Bulbasaur',
    types: [PokemonType.Grass, PokemonType.Poison],
    energy: 80,
    stats: { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 },
    move: { name: 'Razor Leaf', type: PokemonType.Grass },
  },
];

describe('SearchPanel', () => {
  describe('render', () => {
    it('should render the search input', () => {
      render(<SearchPanel mezatags={mockMezatags} onSelect={vi.fn()} />);
      expect(screen.getByRole('textbox', { name: /search pokemon/i })).toBeTruthy();
    });

    it('should show placeholder prompt when input is empty', () => {
      render(<SearchPanel mezatags={mockMezatags} onSelect={vi.fn()} />);
      expect(screen.getByText(/type a pokemon name to search/i)).toBeTruthy();
    });
  });

  describe('search', () => {
    it('should display matching Pokemon names when user types', () => {
      render(<SearchPanel mezatags={mockMezatags} onSelect={vi.fn()} />);
      const input = screen.getByRole('textbox', { name: /search pokemon/i });
      fireEvent.change(input, { target: { value: 'pika' } });
      expect(screen.getByText('Pikachu')).toBeTruthy();
    });

    it('should not display non-matching Pokemon names', () => {
      render(<SearchPanel mezatags={mockMezatags} onSelect={vi.fn()} />);
      const input = screen.getByRole('textbox', { name: /search pokemon/i });
      fireEvent.change(input, { target: { value: 'pika' } });
      expect(screen.queryByText('Charizard')).toBeNull();
    });

    it('should show no results message when nothing matches', () => {
      render(<SearchPanel mezatags={mockMezatags} onSelect={vi.fn()} />);
      const input = screen.getByRole('textbox', { name: /search pokemon/i });
      fireEvent.change(input, { target: { value: 'zzznomatch' } });
      expect(screen.getByText(/no pokemon found/i)).toBeTruthy();
    });
  });

  describe('selection', () => {
    it('should call onSelect with the Pokemon name when a result is clicked', () => {
      const onSelect = vi.fn();
      render(<SearchPanel mezatags={mockMezatags} onSelect={onSelect} />);
      const input = screen.getByRole('textbox', { name: /search pokemon/i });
      fireEvent.change(input, { target: { value: 'char' } });
      const result = screen.getByText('Charizard');
      fireEvent.click(result);
      expect(onSelect).toHaveBeenCalledWith('Charizard');
    });
  });
});
