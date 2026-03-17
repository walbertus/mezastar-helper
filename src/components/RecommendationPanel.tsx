/**
 * RecommendationPanel component
 * Displays attack, defense, and balanced Mezatag recommendations in a tabbed view.
 * Replaces the vanilla RecommendationDisplay class.
 */

import { useState } from 'react';
import { ScoredMezatag, Recommendation, RecommendationType } from '../domain/models';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface RecommendationPanelProps {
  recommendations: {
    attack: Recommendation;
    defense: Recommendation;
    balanced: Recommendation;
  } | null;
}

const TAB_LABELS: { value: RecommendationType; label: string }[] = [
  { value: RecommendationType.ATTACK, label: 'Attack' },
  { value: RecommendationType.DEFENSE, label: 'Defense' },
  { value: RecommendationType.BALANCED, label: 'Balanced' },
];

/** Format a multiplier score as a readable label with colour coding. */
function ScoreBadge({ score, label }: { score: number; label: string }) {
  const variant =
    score >= 2.0
      ? 'success'
      : score >= 1.0
        ? 'secondary'
        : score >= 0.5
          ? 'outline'
          : 'destructive';
  return (
    <Badge variant={variant} className="text-xs">
      {label}: {score.toFixed(2)}x
    </Badge>
  );
}

/** Single Mezatag row in the recommendations list. */
function MezatagRow({ item, rank }: { item: ScoredMezatag; rank: number }) {
  return (
    <div
      className="flex items-start gap-3 border-b border-[var(--md-sys-color-outline-variant)] last:border-0"
      style={{ padding: '12px 0' }}
    >
      <span
        className="text-[var(--md-sys-color-on-surface-variant)] shrink-0 mt-0.5"
        style={{ fontSize: '12px', fontWeight: 700, width: '16px' }}
      >
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '4px' }}>
          <span
            className="text-[var(--md-sys-color-on-surface)]"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            {item.mezatag.name}
          </span>
          <span
            className="text-[var(--md-sys-color-on-surface-variant)]"
            style={{ fontSize: '12px' }}
          >
            {item.mezatag.types.join('/')}
          </span>
          <Badge variant="outline" className="text-xs">
            ⚡ {item.mezatag.energy}
          </Badge>
        </div>
        <div
          className="text-[var(--md-sys-color-on-surface-variant)]"
          style={{ fontSize: '12px', marginBottom: '6px' }}
        >
          Move: {item.mezatag.move.name} ({item.mezatag.move.type})
        </div>
        <div className="flex gap-1 flex-wrap">
          <ScoreBadge score={item.offensiveScore} label="Atk" />
          <ScoreBadge score={item.defensiveScore} label="Def" />
        </div>
      </div>
    </div>
  );
}

/** List of scored Mezatags for one recommendation type. */
function RecommendationList({ recommendations }: { recommendations: ScoredMezatag[] }) {
  if (recommendations.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--md-sys-color-on-surface-variant)]">
        No recommendations available.
      </p>
    );
  }
  return (
    <div>
      {recommendations.map((item, i) => (
        <MezatagRow key={`${item.mezatag.name}-${i}`} item={item} rank={i + 1} />
      ))}
    </div>
  );
}

/** Recommendations panel — shows attack/defense/balanced tabs after a Pokemon is selected. */
export function RecommendationPanel({ recommendations }: RecommendationPanelProps) {
  const [activeTab, setActiveTab] = useState<RecommendationType>(RecommendationType.ATTACK);

  const activeRecs =
    recommendations == null
      ? null
      : activeTab === RecommendationType.ATTACK
        ? recommendations.attack.recommendations
        : activeTab === RecommendationType.DEFENSE
          ? recommendations.defense.recommendations
          : recommendations.balanced.recommendations;

  return (
    <Card>
      <CardHeader className="bg-[var(--md-sys-color-tertiary-container)]">
        <CardTitle className="text-[var(--md-sys-color-on-tertiary-container)]">
          Recommendations
          {recommendations && (
            <span style={{ fontWeight: 400, fontSize: '12px', marginLeft: '8px' }}>
              vs. {recommendations.attack.enemyPokemon.name} (
              {recommendations.attack.enemyPokemon.types.join('/')})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4" style={{ minHeight: '400px' }}>
        {!recommendations ? (
          <p className="py-8 text-center text-sm text-[var(--md-sys-color-on-surface-variant)]">
            Search for an enemy Pokemon to see recommendations.
          </p>
        ) : (
          <>
            {/* Tab bar */}
            <div
              className="flex rounded-md overflow-hidden border border-[var(--md-sys-color-outline-variant)] mb-4"
              role="tablist"
            >
              {TAB_LABELS.map(({ value, label }) => {
                const isActive = activeTab === value;
                return (
                  <button
                    key={value}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: 'none',
                      borderRight:
                        value !== RecommendationType.BALANCED
                          ? '1px solid var(--md-sys-color-outline-variant)'
                          : 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s, color 0.15s',
                      backgroundColor: isActive
                        ? 'var(--md-sys-color-primary-container)'
                        : 'var(--md-sys-color-surface-variant)',
                      color: isActive
                        ? 'var(--md-sys-color-on-primary-container)'
                        : 'var(--md-sys-color-on-surface-variant)',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {/* Tab content */}
            <RecommendationList recommendations={activeRecs!} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
