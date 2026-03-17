/**
 * SingleBattleView component
 * Orchestrates single-battle mode: SearchPanel on the left, RecommendationPanel on the right.
 * Owns selectedPokemon state and calls getRecommendations from the domain.
 */

import { useState } from 'react';
import { Mezatag, Recommendation } from '../domain/models';
import { getMezatagsForPokemon } from '../domain/pokemonSearch';
import { getRecommendations } from '../domain/recommendationEngine';
import { SearchPanel } from './SearchPanel';
import { RecommendationPanel } from './RecommendationPanel';

interface SingleBattleViewProps {
  mezatags: Mezatag[];
}

/** Single-battle view — two-column layout on desktop, stacked on mobile. */
export function SingleBattleView({ mezatags }: SingleBattleViewProps) {
  const [recommendations, setRecommendations] = useState<{
    attack: Recommendation;
    defense: Recommendation;
    balanced: Recommendation;
  } | null>(null);

  /** Handle Pokemon selection: fetch the first matching Pokemon and compute recommendations. */
  function handleSelect(pokemonName: string) {
    const matches = getMezatagsForPokemon(pokemonName, mezatags);
    if (matches.length === 0) return;
    // Use the first match as the enemy Pokemon representation
    const enemyPokemon = matches[0];
    const recs = getRecommendations(enemyPokemon, mezatags);
    setRecommendations(recs);
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-[300px] shrink-0" style={{ minWidth: 0 }}>
        <SearchPanel mezatags={mezatags} onSelect={handleSelect} />
      </div>
      <div className="flex-1" style={{ minWidth: 0 }}>
        <RecommendationPanel recommendations={recommendations} />
      </div>
    </div>
  );
}
