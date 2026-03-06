/**
 * Main Application Component
 * Orchestrates search and recommendation display
 */

import { SearchComponent } from './SearchComponent';
import { RecommendationDisplay } from './RecommendationDisplay';
import { Mezatag, Pokemon } from '../domain/models';
import { getRecommendations } from '../domain/recommendationEngine';
import { getMezatagsForPokemon, filterValidMezatags } from '../domain/pokemonSearch';

export class App {
  private container: HTMLElement;
  private mezatags: Mezatag[] = [];
  private searchComponent!: SearchComponent;
  private recommendationDisplay!: RecommendationDisplay;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async render(): Promise<void> {
    try {
      // Load Mezatag data
      await this.loadMezatags();

      // Create layout
      this.createLayout();

      // Setup event handlers
      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showError('Failed to load application. Please refresh the page.');
    }
  }

  private async loadMezatags(): Promise<void> {
    try {
      const response = await fetch('/mezastar-helper/data/mezatags.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as Mezatag[];
      this.mezatags = filterValidMezatags(data);

      console.log(`Loaded ${this.mezatags.length} Mezatags`);

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

    // Header
    const header = document.createElement('header');
    header.style.cssText = `
      background-color: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    `;

    const title = document.createElement('h1');
    title.textContent = 'Mezastar Helper';
    title.style.cssText = `
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    `;

    const subtitle = document.createElement('p');
    subtitle.textContent = 'Find the best Pokemon to battle against enemy Pokemon';
    subtitle.style.cssText = `
      margin: 8px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    `;

    header.appendChild(title);
    header.appendChild(subtitle);

    // Main content
    const main = document.createElement('main');
    main.style.cssText = `
      display: flex;
      flex: 1;
      overflow: hidden;
      gap: 16px;
      padding: 16px;
    `;

    // Left panel: Search
    const leftPanel = document.createElement('div');
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
    searchTitle.textContent = 'Search';
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
    recContainer.style.cssText = `
      flex: 1;
      overflow: auto;
    `;
    this.recommendationDisplay = new RecommendationDisplay(recContainer);
    rightPanel.appendChild(recContainer);

    main.appendChild(leftPanel);
    main.appendChild(rightPanel);

    // Mobile responsive
    if (window.innerWidth < 768) {
      main.style.flexDirection = 'column';
      leftPanel.style.flex = '0 0 auto';
      leftPanel.style.maxHeight = '40vh';
    }

    this.container.appendChild(header);
    this.container.appendChild(main);
  }

  private setupEventHandlers(): void {
    this.searchComponent.onSelect((pokemonName: string) => {
      try {
        // Get the first Mezatag for this Pokemon as the enemy
        const enemyMezatags = getMezatagsForPokemon(pokemonName, this.mezatags);

        if (enemyMezatags.length === 0) {
          this.showError(`Pokemon ${pokemonName} not found`);
          return;
        }

        // Use the first variant as the enemy Pokemon
        const enemyPokemon: Pokemon = {
          name: enemyMezatags[0].name,
          types: enemyMezatags[0].types,
          stats: enemyMezatags[0].stats,
        };

        // Get recommendations
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

    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
}
