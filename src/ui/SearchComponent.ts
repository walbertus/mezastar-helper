/**
 * Search Component
 * Displays a search bar and list of matching Pokemon
 */

import { Mezatag } from '../domain/models';
import { searchPokemon, getUniquePokemonNames } from '../domain/pokemonSearch';

export class SearchComponent {
  private container: HTMLElement;
  private mezatags: Mezatag[];
  private onSelectCallback?: (pokemonName: string) => void;
  private searchInput!: HTMLInputElement;
  private resultsList!: HTMLElement;

  constructor(container: HTMLElement, mezatags: Mezatag[]) {
    this.container = container;
    this.mezatags = mezatags;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = '';

    // Search container
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.style.cssText = `
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    `;

    // Search input
    const searchWrapper = document.createElement('div');
    searchWrapper.style.cssText = `
      display: flex;
      gap: 8px;
      align-items: center;
    `;

    const label = document.createElement('label');
    label.textContent = 'Search Pokemon:';
    label.style.cssText = `
      font-weight: 500;
      color: var(--md-sys-color-on-surface);
    `;

    this.searchInput = document.createElement('input');
    this.searchInput.type = 'text';
    this.searchInput.placeholder = 'Type Pokemon name...';
    this.searchInput.style.cssText = `
      flex: 1;
      padding: 8px 12px;
      border: 2px solid var(--md-sys-color-outline);
      border-radius: 8px;
      font-family: inherit;
      font-size: 14px;
      background-color: var(--md-sys-color-surface);
      color: var(--md-sys-color-on-surface);
    `;

    this.searchInput.addEventListener('input', () => this.handleSearch());

    searchWrapper.appendChild(label);
    searchWrapper.appendChild(this.searchInput);
    searchContainer.appendChild(searchWrapper);

    // Results list
    this.resultsList = document.createElement('div');
    this.resultsList.className = 'search-results';
    this.resultsList.style.cssText = `
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 8px;
      background-color: var(--md-sys-color-surface-variant);
    `;

    searchContainer.appendChild(this.resultsList);
    this.container.appendChild(searchContainer);
  }

  private handleSearch(): void {
    const query = this.searchInput.value.trim();

    if (!query) {
      this.resultsList.innerHTML = '';
      return;
    }

    const results = searchPokemon(query, this.mezatags);
    const uniqueNames = getUniquePokemonNames(results);

    this.resultsList.innerHTML = '';

    if (uniqueNames.length === 0) {
      const noResults = document.createElement('div');
      noResults.textContent = 'No Pokemon found';
      noResults.style.cssText = `
        padding: 16px;
        color: var(--md-sys-color-on-surface-variant);
        text-align: center;
      `;
      this.resultsList.appendChild(noResults);
      return;
    }

    for (const name of uniqueNames) {
      const item = document.createElement('button');
      item.textContent = name;
      item.style.cssText = `
        display: block;
        width: 100%;
        padding: 12px 16px;
        border: none;
        background-color: transparent;
        color: var(--md-sys-color-on-surface);
        text-align: left;
        cursor: pointer;
        font-size: 14px;
        font-family: inherit;
        border-bottom: 1px solid var(--md-sys-color-outline-variant);
        transition: background-color 0.2s;
      `;

      item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = 'var(--md-sys-color-primary-container)';
      });

      item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = 'transparent';
      });

      item.addEventListener('click', () => {
        this.onSelectCallback?.(name);
      });

      this.resultsList.appendChild(item);
    }
  }

  onSelect(callback: (pokemonName: string) => void): void {
    this.onSelectCallback = callback;
  }

  clear(): void {
    this.searchInput.value = '';
    this.resultsList.innerHTML = '';
  }
}
