/**
 * Bulbapedia Adapter
 * Fetches and parses Mezatag data from Bulbapedia
 * Implements Adapter pattern for external data source
 */

import { Mezatag, PokemonType, PokemonStats } from '../domain/models';

interface BulbapediaRawMezatag {
  pokemonName: string;
  moveName: string;
  moveType: string;
  imageUrl: string;
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
 * Parse Pokemon name from Bulbapedia format
 */
function parsePokemonName(text: string): string {
  // Remove parentheses and numbers
  return text.replace(/[0-9]/g, '').replace(/[()]/g, '').trim();
}

/**
 * Get Pokemon sprite URL from PokeAPI
 */
async function getPokemonImageUrl(pokemonName: string): Promise<string | undefined> {
  try {
    // Try to get Pokemon data from PokeAPI
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
    if (!response.ok) {
      return undefined;
    }
    const data = (await response.json()) as {
      id: number;
      sprites?: { other?: { 'official-artwork'?: { front_default?: string } } };
    };
    return data.sprites?.other?.['official-artwork']?.front_default;
  } catch (error) {
    console.warn(`Could not fetch image for ${pokemonName}:`, error);
    return undefined;
  }
}

/**
 * Parse Mezatag data from Bulbapedia HTML table
 * This is a simplified parser that looks for common patterns
 */
function parseMezatagFromHTML(html: string): BulbapediaRawMezatag[] {
  const mezatags: BulbapediaRawMezatag[] = [];

  try {
    // Create a temporary DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Look for tables with Mezatag data
    const tables = doc.querySelectorAll('table');

    for (const table of tables) {
      const rows = table.querySelectorAll('tbody tr');

      for (const row of rows) {
        const cells = row.querySelectorAll('td, th');
        if (cells.length < 3) continue;

        try {
          // Extract Pokemon name (usually first cell)
          const pokemonCell = cells[0]?.textContent?.trim() || '';
          if (!pokemonCell) continue;

          // Extract move name (usually second cell)
          const moveCell = cells[1]?.textContent?.trim() || '';
          if (!moveCell) continue;

          // Extract move type (usually third cell)
          const typeCell = cells[2]?.textContent?.trim() || '';
          if (!typeCell) continue;

          // Validate type is a valid Pokemon type
          if (!Object.values(PokemonType).includes(typeCell as PokemonType)) {
            continue;
          }

          // Try to find image URL in the row
          const img = row.querySelector('img');
          const imageUrl = img?.getAttribute('src') || '';

          mezatags.push({
            pokemonName: parsePokemonName(pokemonCell),
            moveName: moveCell,
            moveType: typeCell,
            imageUrl,
          });
        } catch (error) {
          console.warn('Failed to parse row:', error);
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
 * Fetch Pokemon base stats from PokeAPI
 */
async function getPokemonStats(pokemonName: string): Promise<PokemonStats | null> {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      stats: Array<{ stat: { name: string }; base_stat: number }>;
      types: Array<{ type: { name: string } }>;
    };

    // Map PokeAPI stats to our format
    const statsMap = new Map<string, number>();
    for (const stat of data.stats) {
      statsMap.set(stat.stat.name, stat.base_stat);
    }

    return {
      hp: statsMap.get('hp') || 0,
      attack: statsMap.get('attack') || 0,
      defense: statsMap.get('defense') || 0,
      spAtk: statsMap.get('special-attack') || 0,
      spDef: statsMap.get('special-defense') || 0,
      speed: statsMap.get('speed') || 0,
    };
  } catch (error) {
    console.warn(`Failed to fetch stats for ${pokemonName}:`, error);
    return null;
  }
}

/**
 * Get Pokemon types from PokeAPI
 */
async function getPokemonTypes(pokemonName: string): Promise<PokemonType[]> {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as {
      types: Array<{ type: { name: string } }>;
    };

    // Get all types, sorted by order (usually primary first)
    const types: PokemonType[] = [];
    for (const typeData of data.types) {
      const typeName = typeData.type.name;
      // Capitalize and match to our PokemonType enum
      const capitalizedType = typeName.charAt(0).toUpperCase() + typeName.slice(1);
      if (Object.values(PokemonType).includes(capitalizedType as PokemonType)) {
        types.push(capitalizedType as PokemonType);
      }
    }

    return types.length > 0 ? types : [];
  } catch (error) {
    console.warn(`Failed to fetch types for ${pokemonName}:`, error);
    return [];
  }
}

/**
 * Convert raw Bulbapedia data to Mezatag format
 */
async function convertRawMezatags(raw: BulbapediaRawMezatag[]): Promise<Mezatag[]> {
  const mezatags: Mezatag[] = [];

  for (const item of raw) {
    try {
      // Fetch Pokemon data
      const [stats, types, imageUrl] = await Promise.all([
        getPokemonStats(item.pokemonName),
        getPokemonTypes(item.pokemonName),
        item.imageUrl ? Promise.resolve(item.imageUrl) : getPokemonImageUrl(item.pokemonName),
      ]);

      // Skip if critical data is missing
      if (!stats || types.length === 0) {
        console.warn(`Skipping ${item.pokemonName}: missing stats or types`);
        continue;
      }

      mezatags.push({
        name: item.pokemonName,
        types,
        stats,
        move: {
          name: item.moveName,
          type: item.moveType as PokemonType,
        },
        imageUrl,
      });
    } catch (error) {
      console.warn(`Failed to convert ${item.pokemonName}:`, error);
      // Continue with partial data as specified
      continue;
    }
  }

  return mezatags;
}

/**
 * Crawl a single Bulbapedia set page
 */
export async function crawlBulbapediaSet(setNumber: number): Promise<Mezatag[]> {
  const url = `https://bulbapedia.bulbagarden.net/wiki/Set_${setNumber}_(Mezastar)`;

  console.log(`Crawling Bulbapedia Set ${setNumber}...`);

  try {
    const html = await fetchHTML(url);
    const rawMezatags = parseMezatagFromHTML(html);
    console.log(`Found ${rawMezatags.length} raw Mezatags in Set ${setNumber}`);

    const mezatags = await convertRawMezatags(rawMezatags);
    console.log(`Successfully converted ${mezatags.length} Mezatags from Set ${setNumber}`);

    return mezatags;
  } catch (error) {
    console.error(`Failed to crawl Set ${setNumber}:`, error);
    // Continue with partial data
    return [];
  }
}

/**
 * Crawl all Bulbapedia sets (1-4)
 */
export async function crawlAllBulbapediaSets(): Promise<Mezatag[]> {
  console.log('Starting Bulbapedia crawler...');

  const allMezatags: Mezatag[] = [];

  for (let set = 1; set <= 4; set++) {
    try {
      const mezatags = await crawlBulbapediaSet(set);
      allMezatags.push(...mezatags);
    } catch (error) {
      console.error(`Error crawling set ${set}:`, error);
      // Continue with next set
    }
  }

  console.log(`Crawling complete. Total Mezatags collected: ${allMezatags.length}`);
  return allMezatags;
}
