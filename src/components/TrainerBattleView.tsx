/**
 * TrainerBattleView component
 * Orchestrates trainer-battle mode: TrainerBattleForm on the left, TrainerBattleResults on the right.
 * Owns the TrainerBattleResult state and calls getTrainerBattleRecommendation from the domain.
 */

import { useState } from 'react';
import { Mezatag, TrainerBattleResult } from '../domain/models';
import { getTrainerBattleRecommendation } from '../domain/trainerBattleEngine';
import { TrainerBattleForm } from './TrainerBattleForm';
import { TrainerBattleResults } from './TrainerBattleResults';

interface TrainerBattleViewProps {
  mezatags: Mezatag[];
}

/** Trainer-battle view — two-column layout on desktop, stacked on mobile. */
export function TrainerBattleView({ mezatags }: TrainerBattleViewProps) {
  const [result, setResult] = useState<TrainerBattleResult | null>(null);

  /** Receive the 4-Pokemon sequence from the form and compute the team recommendation. */
  function handleSubmit(sequence: Mezatag[]) {
    try {
      const recommendation = getTrainerBattleRecommendation(sequence, mezatags);
      setResult(recommendation);
    } catch (err) {
      console.error('Trainer battle recommendation failed:', err);
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-[380px] shrink-0">
        <TrainerBattleForm mezatags={mezatags} onSubmit={handleSubmit} />
      </div>
      <div className="flex-1" style={{ minWidth: 0 }}>
        <TrainerBattleResults result={result} />
      </div>
    </div>
  );
}
