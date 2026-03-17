/**
 * TrainerBattleResults component
 * Displays the 4-slot team recommendation from the trainer battle engine.
 * Replaces the results section of the vanilla TrainerBattleComponent.
 */

import { TrainerBattleResult, TrainerBattleSlot, SlotRecommendation } from '../domain/models';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';

/** Slot header colour tokens keyed by slotIndex (1-based). */
const SLOT_META: Record<number, { label: string; headerClass: string; bgClass: string }> = {
  1: {
    label: 'Slot 1 — Frontliner',
    headerClass: 'bg-[#2E7D32] text-white',
    bgClass: 'bg-[#E8F5E9]',
  },
  2: {
    label: 'Slot 2 — Sacrifice',
    headerClass: 'bg-[#B71C1C] text-white',
    bgClass: 'bg-[#FFEBEE]',
  },
  3: {
    label: 'Slot 3 — Anchor',
    headerClass: 'bg-[#E65100] text-white',
    bgClass: 'bg-[#FFF3E0]',
  },
  4: {
    label: 'Slot 4 — Reserve',
    headerClass: 'bg-[#1565C0] text-white',
    bgClass: 'bg-[#E3F2FD]',
  },
};

/** A single ranked recommendation row within a slot card. */
function RecommendationRow({
  rec,
  isPrimary,
  slotIndex,
}: {
  rec: SlotRecommendation;
  isPrimary: boolean;
  slotIndex: number;
}) {
  const meta = SLOT_META[slotIndex];

  return (
    <div
      className={`flex gap-3 items-start px-3 ${isPrimary ? 'py-3' : 'py-2'} border-t border-[var(--md-sys-color-outline-variant)] ${isPrimary ? meta.bgClass : 'bg-white/40'} ${isPrimary ? 'opacity-100' : 'opacity-85'}`}
    >
      {/* Rank badge */}
      <div
        className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${isPrimary ? `${meta.headerClass}` : 'bg-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface-variant)]'}`}
      >
        #{rec.rank}
      </div>

      {/* Pokemon image */}
      {rec.mezatag.imageUrl && (
        <img
          src={rec.mezatag.imageUrl}
          alt={rec.mezatag.name}
          className={`object-contain rounded shrink-0 bg-white/60 ${isPrimary ? 'w-12 h-12' : 'w-9 h-9'}`}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className={`font-bold ${isPrimary ? 'text-base' : 'text-sm'}`}>
            {rec.mezatag.name}
          </span>
          <Badge variant="outline" className="text-[10px] px-1.5">
            ⚡ {rec.mezatag.energy}
          </Badge>
        </div>
        <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] mb-1">
          {rec.mezatag.types.join('/')} — {rec.mezatag.move.name} ({rec.mezatag.move.type}) — ATK:{' '}
          {rec.offensiveScore.toFixed(1)}x
        </div>
        <div className="flex flex-wrap gap-1">
          {rec.speedWarning && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FFF8E1] text-[#FF6F00] border border-[#FF6F0044]">
              SLOW ({rec.mezatag.stats.speed} &lt;{' '}
              {rec.survivalInfo[0]?.trainerPokemon?.stats.speed ?? '?'})
            </span>
          )}
          {rec.noEligibleCandidate && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FFEBEE] text-[#B71C1C] border border-[#B71C1C44]">
              NO SURVIVE OPTION
            </span>
          )}
          {rec.survivalInfo.map((info) => (
            <span
              key={info.trainerPokemon.name}
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${info.canSurvive ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D3244]' : 'bg-[#FFEBEE] text-[#B71C1C] border-[#B71C1C44]'}`}
            >
              {info.canSurvive ? '✓' : '⚠'} vs {info.trainerPokemon.name} (
              {info.defensiveScore.toFixed(1)}x def)
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** One slot card showing top-3 ranked candidates. */
function SlotCard({ slot }: { slot: TrainerBattleSlot }) {
  const meta = SLOT_META[slot.slotIndex];
  return (
    <div className="rounded-lg overflow-hidden border border-[var(--md-sys-color-outline-variant)]">
      {/* Header */}
      <div className={`flex justify-between items-center px-3 py-2 ${meta.headerClass}`}>
        <span className="text-sm font-bold">{meta.label}</span>
        <span className="text-[11px] opacity-90">
          vs {slot.trainerOpponent.name} ({slot.trainerOpponent.types.join('/')})
        </span>
      </div>
      {/* Recommendations */}
      {slot.recommendations.map((rec, idx) => (
        <RecommendationRow
          key={rec.mezatag.name}
          rec={rec}
          isPrimary={idx === 0}
          slotIndex={slot.slotIndex}
        />
      ))}
    </div>
  );
}

interface TrainerBattleResultsProps {
  result: TrainerBattleResult | null;
}

/** Results panel — shows 4 slot cards and total energy when a result is available. */
export function TrainerBattleResults({ result }: TrainerBattleResultsProps) {
  return (
    <Card>
      <CardHeader className="bg-[var(--md-sys-color-tertiary-container)] shrink-0">
        <CardTitle className="text-[var(--md-sys-color-on-tertiary-container)]">
          Team Recommendation
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {!result ? (
          <p className="py-8 text-center text-sm text-[var(--md-sys-color-on-surface-variant)]">
            Select 4 trainer Pokemon and press Get Recommendation.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {result.slots.map((slot) => (
              <SlotCard key={slot.slotIndex} slot={slot} />
            ))}
            <div className="px-4 py-3 rounded-lg bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] text-right font-semibold text-sm">
              Total Team Energy: {result.totalEnergy}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
