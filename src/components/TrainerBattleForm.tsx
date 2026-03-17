/**
 * TrainerBattleForm component
 * Four search inputs for selecting trainer Pokemon in battle order.
 * Replaces the form section of the vanilla TrainerBattleComponent.
 */

import { useState } from 'react';
import { Mezatag } from '../domain/models';
import { searchPokemon, getUniquePokemonNames } from '../domain/pokemonSearch';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

/** Slot display metadata — label and accent colour per slot. */
const SLOT_META = [
  { label: 'Slot 1 — Frontliner', colorClass: 'text-[#2E7D32]' },
  { label: 'Slot 2 — Sacrifice', colorClass: 'text-[#B71C1C]' },
  { label: 'Slot 3 — Anchor', colorClass: 'text-[#E65100]' },
  { label: 'Slot 4 — Reserve', colorClass: 'text-[#1565C0]' },
];

interface TrainerBattleFormProps {
  mezatags: Mezatag[];
  onSubmit: (sequence: Mezatag[]) => void;
}

interface SlotState {
  query: string;
  selected: Mezatag | null;
  open: boolean;
}

/** Single trainer Pokemon search slot. */
function SearchSlot({
  index,
  state,
  mezatags,
  onChange,
  onSelect,
}: {
  index: number;
  state: SlotState;
  mezatags: Mezatag[];
  onChange: (query: string) => void;
  onSelect: (m: Mezatag) => void;
}) {
  const meta = SLOT_META[index];
  const results =
    state.query.trim() && !state.selected
      ? getUniquePokemonNames(searchPokemon(state.query, mezatags))
      : [];

  return (
    <div className="flex flex-col gap-1 relative">
      <label className={`text-xs font-semibold ${meta.colorClass}`}>{meta.label}</label>
      <Input
        type="text"
        placeholder={`Search trainer Pokemon ${index + 1}...`}
        value={state.query}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => onChange(state.query)}
        onBlur={() => {
          // delay close so click on item fires first
          setTimeout(() => onSelect(state.selected as Mezatag), 150);
        }}
        className={state.selected ? 'border-[var(--md-sys-color-primary)]' : ''}
        aria-label={`Trainer Pokemon ${index + 1}`}
        aria-expanded={results.length > 0}
        aria-haspopup="listbox"
      />
      {results.length > 0 && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 z-10 bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-md shadow-md max-h-40 overflow-y-auto"
        >
          {results.map((name) => (
            <button
              key={name}
              role="option"
              aria-selected={false}
              onMouseDown={() => {
                const exact = mezatags.find((m) => m.name.toLowerCase() === name.toLowerCase());
                const match = exact ?? mezatags.find((m) => m.name === name);
                if (match) onSelect(match);
              }}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-on-primary-container)] transition-colors border-b border-[var(--md-sys-color-outline-variant)] last:border-0"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Form for selecting 4 trainer Pokemon and submitting for a team recommendation. */
export function TrainerBattleForm({ mezatags, onSubmit }: TrainerBattleFormProps) {
  const [slots, setSlots] = useState<SlotState[]>([
    { query: '', selected: null, open: false },
    { query: '', selected: null, open: false },
    { query: '', selected: null, open: false },
    { query: '', selected: null, open: false },
  ]);
  const [error, setError] = useState<string | null>(null);

  /** Update the query for one slot and clear its selection. */
  function handleChange(index: number, query: string) {
    setSlots((prev) =>
      prev.map((s, i) => (i === index ? { ...s, query, selected: null, open: true } : s))
    );
  }

  /** Confirm selection for a slot. */
  function handleSelect(index: number, mezatag: Mezatag | null) {
    if (!mezatag) return;
    setSlots((prev) =>
      prev.map((s, i) =>
        i === index ? { query: mezatag.name, selected: mezatag, open: false } : s
      )
    );
  }

  function handleSubmit() {
    const missing = slots.findIndex((s) => s.selected === null);
    if (missing !== -1) {
      setError(`Please select Trainer Pokemon ${missing + 1}`);
      return;
    }
    setError(null);
    onSubmit(slots.map((s) => s.selected as Mezatag));
  }

  return (
    <Card>
      <CardHeader className="bg-[var(--md-sys-color-primary-container)] shrink-0">
        <CardTitle className="text-[var(--md-sys-color-on-primary-container)]">
          Trainer Battle
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 p-4">
        <p className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">
          Enter trainer Pokemon in battle order:
        </p>
        {slots.map((slot, i) => (
          <SearchSlot
            key={i}
            index={i}
            state={slot}
            mezatags={mezatags}
            onChange={(q) => handleChange(i, q)}
            onSelect={(m) => handleSelect(i, m)}
          />
        ))}
        {error && (
          <p className="text-sm text-[var(--md-sys-color-error)]" role="alert">
            {error}
          </p>
        )}
        <Button onClick={handleSubmit} className="mt-2 w-full">
          Get Recommendation
        </Button>
      </CardContent>
    </Card>
  );
}
