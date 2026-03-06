/**
 * Bulbapedia Mezatag Crawler Script
 * Runs in Node.js to crawl and save Mezatag data
 * Usage: npx ts-node scripts/crawl-mezatag.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
}

enum PokemonType {
  Normal = 'Normal',
  Fire = 'Fire',
  Water = 'Water',
  Electric = 'Electric',
  Grass = 'Grass',
  Ice = 'Ice',
  Fighting = 'Fighting',
  Poison = 'Poison',
  Ground = 'Ground',
  Flying = 'Flying',
  Psychic = 'Psychic',
  Bug = 'Bug',
  Rock = 'Rock',
  Ghost = 'Ghost',
  Dragon = 'Dragon',
  Dark = 'Dark',
  Steel = 'Steel',
  Fairy = 'Fairy',
}

interface Mezatag {
  name: string;
  type: PokemonType;
  stats: PokemonStats;
  move: {
    name: string;
    type: PokemonType;
  };
  imageUrl?: string;
}

/**
 * Fetch HTML from a URL
 */
async function fetchHTML(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    throw error;
  }
}

/**
 * Parse Pokemon name from text
 */
function parsePokemonName(text: string): string {
  return text.replace(/[0-9]/g, '').replace(/[()]/g, '').trim();
}

/**
 * Get Pokemon data from PokeAPI
 */
async function getPokemonDataFromAPI(pokemonName: string): Promise<{
  stats: PokemonStats;
  type: PokemonType;
  imageUrl: string;
} | null> {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      id: number;
      stats: Array<{ stat: { name: string }; base_stat: number }>;
      types: Array<{ type: { name: string } }>;
      sprites?: { other?: { 'official-artwork'?: { front_default?: string } } };
    };

    // Map stats
    const statsMap = new Map<string, number>();
    for (const stat of data.stats) {
      statsMap.set(stat.stat.name, stat.base_stat);
    }

    const stats: PokemonStats = {
      hp: statsMap.get('hp') || 0,
      attack: statsMap.get('attack') || 0,
      defense: statsMap.get('defense') || 0,
      spAtk: statsMap.get('special-attack') || 0,
      spDef: statsMap.get('special-defense') || 0,
      speed: statsMap.get('speed') || 0,
    };

    // Get type
    const typeStr = data.types[0]?.type.name || '';
    const capitalizedType = typeStr.charAt(0).toUpperCase() + typeStr.slice(1);
    const type = capitalizedType as PokemonType;

    // Get image URL
    const imageUrl = data.sprites?.other?.['official-artwork']?.front_default || '';

    return { stats, type, imageUrl };
  } catch (error) {
    console.warn(`Failed to fetch data for ${pokemonName}:`, error);
    return null;
  }
}

/**
 * Parse Mezatag data from Bulbapedia HTML
 */
async function parseMezatagsFromBulbapedia(html: string): Promise<Mezatag[]> {
  const mezatags: Mezatag[] = [];

  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Look for wikitable rows
    const tables = document.querySelectorAll('table.wikitable');

    for (const table of tables) {
      const rows = table.querySelectorAll('tbody tr');

      for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length < 3) continue;

        try {
          // Extract data from cells
          const pokemonCell = cells[0]?.textContent?.trim() || '';
          const moveCell = cells[1]?.textContent?.trim() || '';
          const typeCell = cells[2]?.textContent?.trim() || '';

          if (!pokemonCell || !moveCell || !typeCell) continue;

          // Validate move type
          if (!Object.values(PokemonType).includes(typeCell as PokemonType)) {
            continue;
          }

          const pokemonName = parsePokemonName(pokemonCell);

          // Fetch Pokemon data from PokeAPI
          const pokemonData = await getPokemonDataFromAPI(pokemonName);
          if (!pokemonData) {
            console.warn(`Skipping ${pokemonName}: could not fetch data`);
            continue;
          }

          const mezatag: Mezatag = {
            name: pokemonName,
            type: pokemonData.type,
            stats: pokemonData.stats,
            move: {
              name: moveCell,
              type: typeCell as PokemonType,
            },
            imageUrl: pokemonData.imageUrl,
          };

          mezatags.push(mezatag);
          console.log(`  ✓ Added ${pokemonName} with ${moveCell}`);
        } catch (error) {
          console.warn(`  ✗ Failed to parse row:`, error);
          continue;
        }
      }
    }
  } catch (error) {
    console.error('Failed to parse HTML:', error);
  }

  return mezatags;
}

/**
 * Crawl a single Bulbapedia set
 */
async function crawlBulbapediaSet(setNumber: number): Promise<Mezatag[]> {
  const url = `https://bulbapedia.bulbagarden.net/wiki/Set_${setNumber}_(Mezastar)`;

  console.log(`\nCrawling Set ${setNumber}...`);
  console.log(`URL: ${url}`);

  try {
    const html = await fetchHTML(url);
    const mezatags = await parseMezatagsFromBulbapedia(html);
    console.log(`✓ Successfully crawled ${mezatags.length} Mezatags from Set ${setNumber}`);
    return mezatags;
  } catch (error) {
    console.error(`✗ Failed to crawl Set ${setNumber}:`, error);
    return [];
  }
}

/**
 * Main crawler function
 */
async function main() {
  console.log('=== Mezastar Mezatag Crawler ===\n');

  const allMezatags: Mezatag[] = [];

  // Crawl all sets
  for (let set = 1; set <= 4; set++) {
    try {
      const mezatags = await crawlBulbapediaSet(set);
      allMezatags.push(...mezatags);

      // Add delay between requests to be respectful to Bulbapedia
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error crawling set ${set}:`, error);
    }
  }

  console.log(`\n=== Crawling Complete ===`);
  console.log(`Total Mezatags collected: ${allMezatags.length}`);

  // Save to file
  const outputPath = path.join(process.cwd(), 'data', 'mezatags.json');
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(allMezatags, null, 2));
  console.log(`✓ Saved to ${outputPath}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
