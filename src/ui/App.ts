/**
 * Main Application Component
 * Orchestrates search and recommendation display for Single Battle and Trainer Battle modes
 */

import { SearchComponent } from './SearchComponent';
import { RecommendationDisplay } from './RecommendationDisplay';
import { TrainerBattleComponent } from './TrainerBattleComponent';
import { Mezatag, Pokemon } from '../domain/models';
import { getRecommendations } from '../domain/recommendationEngine';
import { getMezatagsForPokemon, filterValidMezatags } from '../domain/pokemonSearch';

type AppMode = 'single' | 'trainer';

export class App {
  private container: HTMLElement;
  private mezatags: Mezatag[] = [];
  private mode: AppMode = 'single';
  private searchComponent!: SearchComponent;
  private recommendationDisplay!: RecommendationDisplay;
  private singleBattlePanel!: HTMLElement;
  private trainerBattlePanel!: HTMLElement;
  private tabSingle!: HTMLButtonElement;
  private tabTrainer!: HTMLButtonElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async render(): Promise<void> {
    try {
      await this.loadMezatags();
      this.createLayout();
      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showError('Failed to load application. Please refresh the page.');
    }
  }

  private async loadMezatags(): Promise<void> {
    try {
      const response = await fetch('data/mezatags.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as Mezatag[];
      this.mezatags = filterValidMezatags(data);

      console.warn(`Loaded ${this.mezatags.length} Mezatags`);

      if (this.mezatags.length === 0) {
        throw new Error('No valid Mezatags found in data');
      }
    } catch (error) {
      console.error('Failed to load Mezatags:', error);
      throw error;
    }
  }

  private createLayout(): void {
    this.container.innerHTML = '';
    this.container.style.cssText = `
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: var(--md-sys-color-background);
    `;

    // ---- Header ----
    const header = document.createElement('header');
    header.style.cssText = `
      background-color: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
      padding: 16px 20px 0 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    `;

    const titleRow = document.createElement('div');
    titleRow.style.cssText = `
      display: flex;
      align-items: baseline;
      gap: 16px;
      margin-bottom: 12px;
    `;

    const title = document.createElement('h1');
    title.textContent = 'Mezastar Helper';
    title.style.cssText = `
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    `;

    const subtitle = document.createElement('p');
    subtitle.textContent = 'Find the best Pokemon for your battles';
    subtitle.style.cssText = `
      margin: 0;
      font-size: 13px;
      opacity: 0.85;
    `;

    titleRow.appendChild(title);
    titleRow.appendChild(subtitle);

    // ---- Mode tabs ----
    const tabs = document.createElement('div');
    tabs.style.cssText = `display: flex; gap: 4px;`;

    this.tabSingle = this.createTab('Single Battle', true);
    this.tabTrainer = this.createTab('Trainer Battle', false);
    tabs.appendChild(this.tabSingle);
    tabs.appendChild(this.tabTrainer);

    this.tabSingle.addEventListener('click', () => this.switchMode('single'));
    this.tabTrainer.addEventListener('click', () => this.switchMode('trainer'));

    header.appendChild(titleRow);
    header.appendChild(tabs);

    // ---- Main content ----
    const main = document.createElement('main');
    main.className = 'main-content';
    main.style.cssText = `
      display: flex;
      flex: 1;
      overflow: auto;
      gap: 16px;
      padding: 16px;
    `;

    // ---- Single Battle panel ----
    this.singleBattlePanel = document.createElement('div');
    this.singleBattlePanel.style.cssText = `
      display: flex;
      flex: 1;
      gap: 16px;
      overflow: hidden;
    `;
    this.buildSingleBattlePanel(this.singleBattlePanel);

    // ---- Trainer Battle panel ----
    this.trainerBattlePanel = document.createElement('div');
    this.trainerBattlePanel.style.cssText = `
      display: none;
      flex: 1;
      gap: 16px;
      overflow: hidden;
    `;
    this.buildTrainerBattlePanel(this.trainerBattlePanel);

    main.appendChild(this.singleBattlePanel);
    main.appendChild(this.trainerBattlePanel);

    this.container.appendChild(header);
    this.container.appendChild(main);
  }

  private createTab(label: string, active: boolean): HTMLButtonElement {
    const tab = document.createElement('button');
    tab.textContent = label;
    tab.style.cssText = `
      padding: 8px 18px;
      border: none;
      border-radius: 6px 6px 0 0;
      font-size: 13px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: background-color 0.15s, color 0.15s;
    `;
    this.applyTabStyle(tab, active);
    return tab;
  }

  private applyTabStyle(tab: HTMLButtonElement, active: boolean): void {
    if (active) {
      tab.style.backgroundColor = 'var(--md-sys-color-background)';
      tab.style.color = 'var(--md-sys-color-primary)';
    } else {
      tab.style.backgroundColor = 'rgba(255,255,255,0.15)';
      tab.style.color = 'rgba(255,255,255,0.85)';
    }
  }

  private switchMode(mode: AppMode): void {
    if (this.mode === mode) return;
    this.mode = mode;

    const isSingle = mode === 'single';
    this.applyTabStyle(this.tabSingle, isSingle);
    this.applyTabStyle(this.tabTrainer, !isSingle);
    this.singleBattlePanel.style.display = isSingle ? 'flex' : 'none';
    this.trainerBattlePanel.style.display = isSingle ? 'none' : 'flex';
  }

  private buildSingleBattlePanel(panel: HTMLElement): void {
    // Left panel: Search
    const leftPanel = document.createElement('div');
    leftPanel.className = 'left-panel';
    leftPanel.style.cssText = `
      flex: 0 0 300px;
      background-color: var(--md-sys-color-surface);
      border-radius: 8px;
      border: 1px solid var(--md-sys-color-outline-variant);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;

    const searchTitle = document.createElement('div');
    searchTitle.textContent = 'Search Enemy Pokemon';
    searchTitle.style.cssText = `
      padding: 12px 16px;
      font-weight: 600;
      background-color: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
    `;
    leftPanel.appendChild(searchTitle);

    const searchContainer = document.createElement('div');
    searchContainer.style.cssText = `
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;
    this.searchComponent = new SearchComponent(searchContainer, this.mezatags);
    leftPanel.appendChild(searchContainer);

    // Right panel: Recommendations
    const rightPanel = document.createElement('div');
    rightPanel.className = 'right-panel';
    rightPanel.style.cssText = `
      flex: 1;
      background-color: var(--md-sys-color-surface);
      border-radius: 8px;
      border: 1px solid var(--md-sys-color-outline-variant);
      overflow: auto;
      display: flex;
      flex-direction: column;
    `;

    const recTitle = document.createElement('div');
    recTitle.textContent = 'Recommendations';
    recTitle.style.cssText = `
      padding: 12px 16px;
      font-weight: 600;
      background-color: var(--md-sys-color-tertiary-container);
      color: var(--md-sys-color-on-tertiary-container);
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
      flex-shrink: 0;
    `;
    rightPanel.appendChild(recTitle);

    const recContainer = document.createElement('div');
    recContainer.style.cssText = `flex: 1; overflow: auto;`;
    this.recommendationDisplay = new RecommendationDisplay(recContainer);
    rightPanel.appendChild(recContainer);

    panel.appendChild(leftPanel);
    panel.appendChild(rightPanel);
  }

  private buildTrainerBattlePanel(panel: HTMLElement): void {
    // Left panel: trainer inputs
    const leftPanel = document.createElement('div');
    leftPanel.className = 'left-panel';
    leftPanel.style.cssText = `
      flex: 0 0 360px;
      background-color: var(--md-sys-color-surface);
      border-radius: 8px;
      border: 1px solid var(--md-sys-color-outline-variant);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    `;

    const panelTitle = document.createElement('div');
    panelTitle.textContent = 'Trainer Battle';
    panelTitle.style.cssText = `
      padding: 12px 16px;
      font-weight: 600;
      background-color: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
      flex-shrink: 0;
    `;
    leftPanel.appendChild(panelTitle);

    // Right panel: results
    const rightPanel = document.createElement('div');
    rightPanel.className = 'right-panel';
    rightPanel.style.cssText = `
      flex: 1;
      background-color: var(--md-sys-color-surface);
      border-radius: 8px;
      border: 1px solid var(--md-sys-color-outline-variant);
      overflow-y: auto;
    `;

    const resultTitle = document.createElement('div');
    resultTitle.textContent = 'Team Recommendation';
    resultTitle.style.cssText = `
      padding: 12px 16px;
      font-weight: 600;
      background-color: var(--md-sys-color-tertiary-container);
      color: var(--md-sys-color-on-tertiary-container);
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
    `;
    rightPanel.appendChild(resultTitle);

    const resultBody = document.createElement('div');
    resultBody.style.cssText = `overflow-y: auto;`;
    rightPanel.appendChild(resultBody);

    // TrainerBattleComponent: form goes in leftPanel content area, results in resultBody
    const formArea = document.createElement('div');
    formArea.style.cssText = `flex: 1;`;
    leftPanel.appendChild(formArea);

    new TrainerBattleComponentLayout(formArea, resultBody, this.mezatags);

    panel.appendChild(leftPanel);
    panel.appendChild(rightPanel);
  }

  private setupEventHandlers(): void {
    this.searchComponent.onSelect((pokemonName: string) => {
      try {
        const enemyMezatags = getMezatagsForPokemon(pokemonName, this.mezatags);

        if (enemyMezatags.length === 0) {
          this.showError(`Pokemon ${pokemonName} not found`);
          return;
        }

        const enemyPokemon: Pokemon = {
          name: enemyMezatags[0].name,
          types: enemyMezatags[0].types,
          stats: enemyMezatags[0].stats,
        };

        const recommendations = getRecommendations(enemyPokemon, this.mezatags);
        this.recommendationDisplay.display(recommendations);
      } catch (error) {
        console.error('Failed to generate recommendations:', error);
        this.showError('Failed to generate recommendations');
      }
    });
  }

  private showError(message: string): void {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: var(--md-sys-color-error);
      color: var(--md-sys-color-on-error);
      padding: 16px 20px;
      border-radius: 8px;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }
}

/**
 * Layout adapter: renders TrainerBattleComponent form into formContainer
 * and wires results output to resultContainer.
 */
class TrainerBattleComponentLayout {
  private formContainer: HTMLElement;
  private resultContainer: HTMLElement;
  private mezatags: Mezatag[];
  private inner: TrainerBattleComponent;

  constructor(formContainer: HTMLElement, resultContainer: HTMLElement, mezatags: Mezatag[]) {
    this.formContainer = formContainer;
    this.resultContainer = resultContainer;
    this.mezatags = mezatags;

    // Render the TrainerBattleComponent into a temporary host
    const host = document.createElement('div');
    this.inner = new TrainerBattleComponent(host, this.mezatags);

    // TrainerBattleComponent appends [form, results] as two children
    const children = Array.from(host.children);
    if (children[0]) this.formContainer.appendChild(children[0]);
    if (children[1]) this.resultContainer.appendChild(children[1]);
  }

  /** Expose inner component for any future interactions */
  getInner(): TrainerBattleComponent {
    return this.inner;
  }
}
