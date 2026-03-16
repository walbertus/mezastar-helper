/**
 * Trainer Battle Component
 * Renders 4 trainer Pokemon search inputs and displays the recommended team result.
 */

import {
  Mezatag,
  SlotRecommendation,
  TrainerBattleResult,
  TrainerBattleSlot,
} from '../domain/models';
import { searchPokemon, getUniquePokemonNames } from '../domain/pokemonSearch';
import { getTrainerBattleRecommendation } from '../domain/trainerBattleEngine';

/** Labels and colors for each slot */
const SLOT_META = [
  { label: 'SLOT 1 — FRONTLINER', color: '#2E7D32', bg: '#E8F5E9' },
  { label: 'SLOT 2 — SACRIFICE', color: '#B71C1C', bg: '#FFEBEE' },
  { label: 'SLOT 3 — ANCHOR', color: '#E65100', bg: '#FFF3E0' },
  { label: 'SLOT 4 — RESERVE', color: '#1565C0', bg: '#E3F2FD' },
];

/** Rank badge labels */
const RANK_LABELS = ['#1', '#2', '#3'];

export class TrainerBattleComponent {
  private container: HTMLElement;
  private mezatags: Mezatag[];
  private selectedTrainers: (Mezatag | null)[] = [null, null, null, null];
  private searchInputs: HTMLInputElement[] = [];
  private searchDropdowns: HTMLElement[] = [];
  private resultContainer!: HTMLElement;
  private submitButton!: HTMLButtonElement;

  constructor(container: HTMLElement, mezatags: Mezatag[]) {
    this.container = container;
    this.mezatags = mezatags;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = '';

    // ---- Left panel: 4 search inputs ----
    const form = document.createElement('div');
    form.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
    `;

    const formTitle = document.createElement('div');
    formTitle.textContent = 'Enter trainer Pokemon in battle order:';
    formTitle.style.cssText = `
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
      margin-bottom: 4px;
    `;
    form.appendChild(formTitle);

    for (let i = 0; i < 4; i++) {
      const slotWrapper = this.createSearchSlot(i);
      form.appendChild(slotWrapper);
    }

    // Submit button
    this.submitButton = document.createElement('button');
    this.submitButton.textContent = 'Get Recommendation';
    this.submitButton.style.cssText = `
      margin-top: 8px;
      padding: 10px 16px;
      background-color: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
    `;
    this.submitButton.addEventListener('click', () => this.handleSubmit());
    form.appendChild(this.submitButton);

    // ---- Right panel: results ----
    this.resultContainer = document.createElement('div');
    this.resultContainer.style.cssText = `
      padding: 16px;
    `;
    this.showResultPlaceholder();

    this.container.appendChild(form);
    this.container.appendChild(this.resultContainer);
  }

  private createSearchSlot(index: number): HTMLElement {
    const slotMeta = SLOT_META[index];
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 4px;
      position: relative;
    `;

    const label = document.createElement('label');
    label.textContent = `Trainer Pokemon ${index + 1}`;
    label.style.cssText = `
      font-size: 12px;
      font-weight: 600;
      color: ${slotMeta.color};
    `;

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Search Pokemon ${index + 1}...`;
    input.style.cssText = `
      padding: 8px 12px;
      border: 2px solid var(--md-sys-color-outline);
      border-radius: 8px;
      font-family: inherit;
      font-size: 14px;
      background-color: var(--md-sys-color-surface);
      color: var(--md-sys-color-on-surface);
    `;

    const dropdown = document.createElement('div');
    dropdown.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      z-index: 10;
      background-color: var(--md-sys-color-surface);
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 8px;
      max-height: 160px;
      overflow-y: auto;
      display: none;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    `;

    input.addEventListener('input', () => this.handleSearch(index, input, dropdown));
    input.addEventListener('blur', () => {
      // Delay hide so click on dropdown item fires first
      setTimeout(() => {
        dropdown.style.display = 'none';
      }, 150);
    });

    this.searchInputs.push(input);
    this.searchDropdowns.push(dropdown);

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    wrapper.appendChild(dropdown);
    return wrapper;
  }

  private handleSearch(index: number, input: HTMLInputElement, dropdown: HTMLElement): void {
    const query = input.value.trim();

    // Clear selection for this slot when user types again
    this.selectedTrainers[index] = null;
    this.updateInputBorder(index, false);

    if (!query) {
      dropdown.style.display = 'none';
      return;
    }

    const results = searchPokemon(query, this.mezatags);
    const uniqueNames = getUniquePokemonNames(results);

    dropdown.innerHTML = '';

    if (uniqueNames.length === 0) {
      dropdown.style.display = 'none';
      return;
    }

    for (const name of uniqueNames) {
      const item = document.createElement('button');
      item.textContent = name;
      item.style.cssText = `
        display: block;
        width: 100%;
        padding: 8px 12px;
        border: none;
        background-color: transparent;
        color: var(--md-sys-color-on-surface);
        text-align: left;
        cursor: pointer;
        font-size: 13px;
        font-family: inherit;
        border-bottom: 1px solid var(--md-sys-color-outline-variant);
      `;
      item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = 'var(--md-sys-color-primary-container)';
      });
      item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = 'transparent';
      });
      item.addEventListener('mousedown', () => {
        this.selectTrainer(index, name, input, dropdown);
      });
      dropdown.appendChild(item);
    }

    dropdown.style.display = 'block';
  }

  private selectTrainer(
    index: number,
    name: string,
    input: HTMLInputElement,
    dropdown: HTMLElement
  ): void {
    // Use the first matching Mezatag for this trainer Pokemon
    const results = searchPokemon(name, this.mezatags);
    const exactMatch = results.find((m) => m.name.toLowerCase() === name.toLowerCase());
    const selected = exactMatch ?? results[0];

    this.selectedTrainers[index] = selected;
    input.value = selected.name;
    dropdown.style.display = 'none';
    this.updateInputBorder(index, true);
  }

  private updateInputBorder(index: number, selected: boolean): void {
    const color = selected ? SLOT_META[index].color : 'var(--md-sys-color-outline)';
    this.searchInputs[index].style.borderColor = color;
  }

  private handleSubmit(): void {
    const missing = this.selectedTrainers.findIndex((t) => t === null);
    if (missing !== -1) {
      this.showError(`Please select Trainer Pokemon ${missing + 1}`);
      return;
    }

    try {
      const result = getTrainerBattleRecommendation(
        this.selectedTrainers as Mezatag[],
        this.mezatags
      );
      this.displayResult(result);
    } catch (error) {
      console.error('Trainer battle recommendation failed:', error);
      this.showError('Failed to generate recommendation. Please try again.');
    }
  }

  private displayResult(result: TrainerBattleResult): void {
    this.resultContainer.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 12px;
    `;

    for (const slot of result.slots) {
      wrapper.appendChild(this.createSlotCard(slot));
    }

    // Total energy footer
    const footer = document.createElement('div');
    footer.style.cssText = `
      padding: 12px 16px;
      background-color: var(--md-sys-color-secondary-container);
      border-radius: 8px;
      font-weight: 600;
      color: var(--md-sys-color-on-secondary-container);
      text-align: right;
    `;
    footer.textContent = `Total Team Energy: ${result.totalEnergy}`;
    wrapper.appendChild(footer);

    this.resultContainer.appendChild(wrapper);
  }

  private createSlotCard(slot: TrainerBattleSlot): HTMLElement {
    const meta = SLOT_META[slot.slotIndex - 1];

    const card = document.createElement('div');
    card.style.cssText = `
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 8px;
      overflow: hidden;
      background-color: ${meta.bg};
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 8px 14px;
      background-color: ${meta.color};
      color: white;
      font-weight: 700;
      font-size: 13px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.textContent = meta.label;

    // Trainer opponent label
    const trainerLabel = document.createElement('span');
    trainerLabel.style.cssText = `
      font-size: 11px;
      font-weight: 400;
      opacity: 0.9;
    `;
    trainerLabel.textContent = `vs ${slot.trainerOpponent.name} (${slot.trainerOpponent.types.join('/')})`;
    header.appendChild(trainerLabel);

    // Ranked recommendations list
    const recList = document.createElement('div');
    recList.style.cssText = `display: flex; flex-direction: column;`;

    slot.recommendations.forEach((rec, idx) => {
      recList.appendChild(this.createRecommendationRow(rec, idx === 0, meta.color, meta.bg));
    });

    card.appendChild(header);
    card.appendChild(recList);
    return card;
  }

  /**
   * Render a single ranked recommendation row within a slot card.
   * The primary (rank-1) row is visually highlighted.
   */
  private createRecommendationRow(
    rec: SlotRecommendation,
    isPrimary: boolean,
    accentColor: string,
    bgColor: string
  ): HTMLElement {
    const row = document.createElement('div');
    row.style.cssText = `
      display: flex;
      gap: 10px;
      align-items: flex-start;
      padding: ${isPrimary ? '12px 14px' : '8px 14px'};
      border-top: 1px solid var(--md-sys-color-outline-variant);
      background-color: ${isPrimary ? bgColor : 'rgba(255,255,255,0.4)'};
      opacity: ${isPrimary ? '1' : '0.85'};
    `;

    // Rank badge
    const rankBadge = document.createElement('div');
    rankBadge.textContent = RANK_LABELS[rec.rank - 1] ?? `#${rec.rank}`;
    rankBadge.style.cssText = `
      flex-shrink: 0;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background-color: ${isPrimary ? accentColor : 'var(--md-sys-color-outline-variant)'};
      color: ${isPrimary ? 'white' : 'var(--md-sys-color-on-surface-variant)'};
      font-size: 10px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 2px;
    `;

    // Pokemon image
    const img = document.createElement('img');
    img.src = rec.mezatag.imageUrl ?? 'placeholder.svg';
    img.alt = rec.mezatag.name;
    img.style.cssText = `
      width: ${isPrimary ? '52px' : '36px'};
      height: ${isPrimary ? '52px' : '36px'};
      object-fit: contain;
      border-radius: 4px;
      background-color: rgba(255,255,255,0.6);
      flex-shrink: 0;
    `;
    img.addEventListener('error', () => {
      img.src = 'placeholder.svg';
    });

    // Info section
    const info = document.createElement('div');
    info.style.cssText = `flex: 1;`;

    // Name + energy
    const name = document.createElement('div');
    name.style.cssText = `font-weight: 700; font-size: ${isPrimary ? '15px' : '13px'}; margin-bottom: 2px;`;
    name.textContent = `${rec.mezatag.name} (${rec.mezatag.energy})`;

    // Move + offensive score
    const move = document.createElement('div');
    move.style.cssText = `font-size: 12px; color: var(--md-sys-color-on-surface-variant); margin-bottom: ${isPrimary ? '6px' : '4px'};`;
    move.textContent = `${rec.mezatag.move.name} (${rec.mezatag.move.type}) — ATK: ${rec.offensiveScore.toFixed(1)}x`;

    info.appendChild(name);
    info.appendChild(move);

    // Badges row (only show for primary or if there are notable flags)
    const badges = document.createElement('div');
    badges.style.cssText = `display: flex; flex-wrap: wrap; gap: 6px; font-size: 11px;`;

    // Speed warning badge
    if (rec.speedWarning) {
      badges.appendChild(
        this.makeBadge(
          `SLOW (${rec.mezatag.stats.speed} < ${rec.survivalInfo[0]?.trainerPokemon?.stats.speed ?? '?'})`,
          '#FF6F00',
          '#FFF8E1'
        )
      );
    }

    // No eligible candidate warning (rank-1 only)
    if (rec.noEligibleCandidate) {
      badges.appendChild(this.makeBadge('NO SURVIVE OPTION', '#B71C1C', '#FFEBEE'));
    }

    // Survival info flags
    for (const survInfo of rec.survivalInfo) {
      const icon = survInfo.canSurvive ? '✓' : '⚠';
      const bgColor = survInfo.canSurvive ? '#E8F5E9' : '#FFEBEE';
      const textColor = survInfo.canSurvive ? '#2E7D32' : '#B71C1C';
      badges.appendChild(
        this.makeBadge(
          `${icon} vs ${survInfo.trainerPokemon.name} (${survInfo.defensiveScore.toFixed(1)}x def)`,
          textColor,
          bgColor
        )
      );
    }

    if (badges.childElementCount > 0) {
      info.appendChild(badges);
    }

    row.appendChild(rankBadge);
    row.appendChild(img);
    row.appendChild(info);
    return row;
  }

  private makeBadge(text: string, color: string, bg: string): HTMLElement {
    const badge = document.createElement('span');
    badge.textContent = text;
    badge.style.cssText = `
      padding: 2px 7px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 11px;
      color: ${color};
      background-color: ${bg};
      border: 1px solid ${color}44;
    `;
    return badge;
  }

  private showResultPlaceholder(): void {
    this.resultContainer.innerHTML = '';
    const placeholder = document.createElement('div');
    placeholder.textContent = 'Select 4 trainer Pokemon and press Get Recommendation';
    placeholder.style.cssText = `
      padding: 24px;
      text-align: center;
      color: var(--md-sys-color-on-surface-variant);
    `;
    this.resultContainer.appendChild(placeholder);
  }

  private showError(message: string): void {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: var(--md-sys-color-error);
      color: var(--md-sys-color-on-error);
      padding: 14px 20px;
      border-radius: 8px;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      font-size: 14px;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 4000);
  }

  /** Reset the component to its initial state */
  reset(): void {
    this.selectedTrainers = [null, null, null, null];
    this.render();
  }
}
