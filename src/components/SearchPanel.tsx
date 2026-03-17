/**
 * SearchPanel component
 * Search input and results list for finding enemy Pokemon.
 * Replaces the vanilla SearchComponent class.
 */

import { useState } from 'react';
import { Mezatag } from '../domain/models';
import { searchPokemon, getUniquePokemonNames } from '../domain/pokemonSearch';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

interface SearchPanelProps {
  mezatags: Mezatag[];
  onSelect: (pokemonName: string) => void;
}

/** Search panel with live filtering of enemy Pokemon by name. */
export function SearchPanel({ mezatags, onSelect }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('');

  /** Show results only when actively typing (query differs from what was selected). */
  const showResults = query.trim() !== '' && query !== selected;
  const results = showResults ? searchPokemon(query, mezatags) : [];
  const uniqueNames = getUniquePokemonNames(results);

  /** Handle input change — clear selected state when user starts typing again. */
  function handleChange(value: string) {
    setQuery(value);
    if (value !== selected) setSelected('');
  }

  /** Handle Pokemon selection — update input to show chosen name, hide results. */
  function handleSelect(name: string) {
    setQuery(name);
    setSelected(name);
    onSelect(name);
  }

  return (
    <Card>
      <CardHeader className="bg-[var(--md-sys-color-primary-container)]">
        <CardTitle className="text-[var(--md-sys-color-on-primary-container)]">
          Search Enemy Pokemon
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4" style={{ minHeight: '400px' }}>
        <div className="flex items-center gap-3">
          <label
            htmlFor="pokemon-search"
            className="shrink-0 font-semibold text-[14px] text-[var(--md-sys-color-on-surface)]"
          >
            Search Pokemon:
          </label>
          <Input
            id="pokemon-search"
            type="text"
            placeholder="Type Pokemon name..."
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            aria-label="Search Pokemon"
          />
        </div>
        {showResults && (
          <div
            className="overflow-y-auto rounded-md border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-variant)]"
            style={{ maxHeight: '320px' }}
            role="listbox"
            aria-label="Search results"
          >
            {uniqueNames.length === 0 ? (
              <p className="p-4 text-sm text-center text-[var(--md-sys-color-on-surface-variant)]">
                No Pokemon found
              </p>
            ) : (
              uniqueNames.map((name) => (
                <button
                  key={name}
                  role="option"
                  aria-selected={name === selected}
                  onClick={() => handleSelect(name)}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-on-primary-container)] transition-colors"
                >
                  {name}
                </button>
              ))
            )}
          </div>
        )}
        {!showResults && selected && (
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
            Showing recommendations for{' '}
            <span className="font-semibold text-[var(--md-sys-color-on-surface)]">{selected}</span>
          </p>
        )}
        {!showResults && !selected && (
          <p className="text-sm text-center text-[var(--md-sys-color-on-surface-variant)]">
            Type a Pokemon name to search
          </p>
        )}
      </CardContent>
    </Card>
  );
}
