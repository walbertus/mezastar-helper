/**
 * RecommendationPanel component tests
 * Verifies: renders null/empty state, renders attack/defense/balanced tabs with mock data.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecommendationPanel } from '../RecommendationPanel';
import {
  Recommendation,
  RecommendationType,
  ScoredMezatag,
  PokemonType,
} from '../../domain/models';

/** Minimal ScoredMezatag fixture. */
function makeScoredMezatag(name: string, offensive: number, defensive: number): ScoredMezatag {
  return {
    mezatag: {
      name,
      types: [PokemonType.Fire],
      energy: 100,
      stats: { hp: 78, attack: 84, defense: 78, spAtk: 109, spDef: 85, speed: 100 },
      move: { name: 'Flamethrower', type: PokemonType.Fire },
    },
    offensiveScore: offensive,
    defensiveScore: defensive,
    combinedScore: (offensive + defensive) / 2,
  };
}

const enemyPokemon = {
  name: 'Bulbasaur',
  types: [PokemonType.Grass, PokemonType.Poison],
  stats: { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 },
};

const mockRecommendations: {
  attack: Recommendation;
  defense: Recommendation;
  balanced: Recommendation;
} = {
  attack: {
    type: RecommendationType.ATTACK,
    enemyPokemon,
    recommendations: [makeScoredMezatag('AttackTag', 2.0, 1.0)],
  },
  defense: {
    type: RecommendationType.DEFENSE,
    enemyPokemon,
    recommendations: [makeScoredMezatag('DefenseTag', 1.0, 2.0)],
  },
  balanced: {
    type: RecommendationType.BALANCED,
    enemyPokemon,
    recommendations: [makeScoredMezatag('BalancedTag', 1.5, 1.5)],
  },
};

describe('RecommendationPanel', () => {
  describe('null state', () => {
    it('should show a prompt to search when recommendations is null', () => {
      render(<RecommendationPanel recommendations={null} />);
      expect(screen.getByText(/search for an enemy pokemon/i)).toBeTruthy();
    });
  });

  describe('with recommendations', () => {
    it('should display the enemy Pokemon name', () => {
      render(<RecommendationPanel recommendations={mockRecommendations} />);
      expect(screen.getByText(/bulbasaur/i)).toBeTruthy();
    });

    it('should render the attack tab and its recommendations by default', () => {
      render(<RecommendationPanel recommendations={mockRecommendations} />);
      expect(screen.getByText('AttackTag')).toBeTruthy();
    });

    it('should switch to defense tab and show defense recommendations', async () => {
      const user = userEvent.setup();
      render(<RecommendationPanel recommendations={mockRecommendations} />);
      const defenseTab = screen.getByRole('tab', { name: /defense/i });
      await user.click(defenseTab);
      expect(screen.getByText('DefenseTag')).toBeTruthy();
    });

    it('should switch to balanced tab and show balanced recommendations', async () => {
      const user = userEvent.setup();
      render(<RecommendationPanel recommendations={mockRecommendations} />);
      const balancedTab = screen.getByRole('tab', { name: /balanced/i });
      await user.click(balancedTab);
      expect(screen.getByText('BalancedTag')).toBeTruthy();
    });
  });
});
