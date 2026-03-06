/**
 * Recommendation Display Component
 * Shows three collapsible sections: Attack, Defense, and Balanced recommendations
 */

import { Recommendation } from '../domain/models';

export class RecommendationDisplay {
  private container: HTMLElement;
  private recommendations: {
    attack: Recommendation;
    defense: Recommendation;
    balanced: Recommendation;
  } | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  display(recommendations: {
    attack: Recommendation;
    defense: Recommendation;
    balanced: Recommendation;
  }): void {
    this.recommendations = recommendations;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = '';

    if (!this.recommendations) {
      const placeholder = document.createElement('div');
      placeholder.textContent = 'Select a Pokemon to see recommendations';
      placeholder.style.cssText = `
        padding: 24px;
        text-align: center;
        color: var(--md-sys-color-on-surface-variant);
      `;
      this.container.appendChild(placeholder);
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
    `;

    // Enemy Pokemon info
    const enemyInfo = document.createElement('div');
    enemyInfo.style.cssText = `
      padding: 12px;
      background-color: var(--md-sys-color-secondary-container);
      border-radius: 8px;
      margin-bottom: 8px;
    `;
    enemyInfo.innerHTML = `
      <div style="font-weight: 600; color: var(--md-sys-color-on-secondary-container);">
        Enemy Pokemon: ${this.recommendations.attack.enemyPokemon.name}
        <span style="font-size: 12px; margin-left: 8px;">
          (${this.recommendations.attack.enemyPokemon.types.join('/')})
        </span>
      </div>
    `;
    wrapper.appendChild(enemyInfo);

    // Three recommendation sections
    wrapper.appendChild(
      this.createRecommendationSection('Attack', this.recommendations.attack, '#E8F5E9', '#2E7D32')
    );
    wrapper.appendChild(
      this.createRecommendationSection(
        'Defense',
        this.recommendations.defense,
        '#E3F2FD',
        '#1565C0'
      )
    );
    wrapper.appendChild(
      this.createRecommendationSection(
        'Balanced',
        this.recommendations.balanced,
        '#FFF3E0',
        '#E65100'
      )
    );

    this.container.appendChild(wrapper);
  }

  private createRecommendationSection(
    title: string,
    recommendation: Recommendation,
    bgColor: string,
    headerColor: string
  ): HTMLElement {
    const section = document.createElement('div');
    section.style.cssText = `
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 8px;
      overflow: hidden;
      background-color: var(--md-sys-color-surface);
    `;

    // Header (collapsible)
    const header = document.createElement('button');
    header.style.cssText = `
      width: 100%;
      padding: 12px 16px;
      background-color: ${headerColor};
      color: white;
      border: none;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      text-align: left;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: opacity 0.2s;
    `;
    header.textContent = `${title} (${recommendation.recommendations.length})`;

    // Collapse indicator
    const indicator = document.createElement('span');
    indicator.textContent = '▼';
    indicator.style.cssText = `
      transition: transform 0.2s;
    `;
    header.appendChild(indicator);

    // Content
    const content = document.createElement('div');
    content.style.cssText = `
      max-height: 500px;
      overflow-y: auto;
      background-color: ${bgColor};
    `;

    // Populate recommendations
    if (recommendation.recommendations.length === 0) {
      const noData = document.createElement('div');
      noData.textContent = 'No recommendations available';
      noData.style.cssText = `
        padding: 16px;
        text-align: center;
        color: var(--md-sys-color-on-surface-variant);
      `;
      content.appendChild(noData);
    } else {
      for (const scored of recommendation.recommendations) {
        const item = this.createMezatagItem(scored);
        content.appendChild(item);
      }
    }

    // Collapse functionality
    let isOpen = true;
    header.addEventListener('click', () => {
      isOpen = !isOpen;
      if (isOpen) {
        content.style.maxHeight = '500px';
        content.style.overflow = 'auto';
        indicator.style.transform = 'rotate(0deg)';
      } else {
        content.style.maxHeight = '0';
        content.style.overflow = 'hidden';
        indicator.style.transform = 'rotate(-90deg)';
      }
    });

    section.appendChild(header);
    section.appendChild(content);
    return section;
  }

  private createMezatagItem(scored: any): HTMLElement {
    const item = document.createElement('div');
    item.style.cssText = `
      padding: 12px 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      display: flex;
      gap: 12px;
      align-items: center;
    `;

    // Image
    const img = document.createElement('img');
    img.src = scored.mezatag.imageUrl || '/placeholder.png';
    img.alt = scored.mezatag.name;
    img.style.cssText = `
      width: 48px;
      height: 48px;
      object-fit: contain;
      border-radius: 4px;
      background-color: rgba(255, 255, 255, 0.5);
    `;

    img.addEventListener('error', () => {
      img.src = '/placeholder.png';
    });

    // Info
    const info = document.createElement('div');
    info.style.cssText = `
      flex: 1;
    `;

    const name = document.createElement('div');
    name.style.cssText = `
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 4px;
    `;
    name.textContent = `${scored.mezatag.name}`;

    const move = document.createElement('div');
    move.style.cssText = `
      font-size: 12px;
      color: var(--md-sys-color-on-surface-variant);
    `;
    move.textContent = `${scored.mezatag.move.name} (${scored.mezatag.move.type})`;

    // Scores
    const scores = document.createElement('div');
    scores.style.cssText = `
      font-size: 11px;
      color: var(--md-sys-color-on-surface-variant);
      margin-top: 4px;
      display: flex;
      gap: 8px;
    `;

    const attackScore = document.createElement('span');
    attackScore.textContent = `ATK: ${scored.offensiveScore.toFixed(0)}`;
    const defenseScore = document.createElement('span');
    defenseScore.textContent = `DEF: ${scored.defensiveScore.toFixed(0)}`;

    scores.appendChild(attackScore);
    scores.appendChild(defenseScore);

    info.appendChild(name);
    info.appendChild(move);
    info.appendChild(scores);

    item.appendChild(img);
    item.appendChild(info);
    return item;
  }

  clear(): void {
    this.recommendations = null;
    this.render();
  }
}
