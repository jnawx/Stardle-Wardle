import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_DIR = path.join(__dirname, '..', 'fandom-cache');
const FANDOM_BASE_URL = 'https://starwars.fandom.com/wiki';
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Clean and extract text from HTML content
 */
function cleanText(text) {
  return text
    .replace(/<a[^>]*>(.*?)<\/a>/g, '$1')
    .replace(/<br\s*\/?>/gi, '|||')
    .replace(/<[^>]+>/g, '')
    .replace(/\[[^\]]+\]/g, '')
    .replace(/&#91;/g, '[').replace(/&#93;/g, ']')
    .replace(/\[\d+\]/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Remove common label prefixes from values
 */
function removeLabels(text) {
  if (!text) return text;
  return text
    .replace(/^(Species|Homeworld|Gender|Pronouns|Eye color|Hair color|Skin color|Height|Mass|Born|Died|Affiliation|Master\(s\)|Apprentice\(s\)|Family|Cybernetics|Biographical information|Physical description|Chronological and political information)\s+/gi, '')
    .trim();
}

/**
 * Extract first valid value from a field (before parentheses or additional info)
 */
function extractPrimaryValue(text) {
  if (!text) return null;
  
  let cleaned = text
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/,.*$/, '')
    .replace(/;.*$/, '')
    .split('|||')[0]
    .trim();
  
  return cleaned || null;
}

/**
 * Extract multiple values from text (comma/line break separated)
 */
function extractMultipleValues(text) {
  if (!text) return [];
  
  const values = text
    .split(/[,;]|(\|\|\|)/)
    .map(v => v ? v.replace(/\(.*?\)/g, '').trim() : '')
    .filter(v => v && v.length > 0 && v.length < 100);
  
  return [...new Set(values)];
}

/**
 * Parse Fandom infobox from HTML
 */
function parseInfobox(html) {
  const data = {};
  
  const infoboxMatch = html.match(/<aside[^>]*class="[^"]*portable-infobox[^"]*"[^>]*>([\s\S]*?)<\/aside>/);
  if (!infoboxMatch) {
    return null;
  }
  
  const infobox = infoboxMatch[1];
  
  const dataSourcePattern = /data-source="([^"]+)"/g;
  let match;
  const dataSources = [];
  
  while ((match = dataSourcePattern.exec(infobox)) !== null) {
    dataSources.push(match[1]);
  }
  
  for (const source of dataSources) {
    const sectionRegex = new RegExp(`data-source="${source}"[^>]*>([\\s\\S]*?)(?:<\\/div>\\s*<\\/div>|<\\/section>)`, 'i');
    const sectionMatch = infobox.match(sectionRegex);
    
    if (sectionMatch) {
      const rawText = cleanText(sectionMatch[1]);
      const cleanedText = removeLabels(rawText);
      data[source] = cleanedText;
    }
  }
  
  const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
  if (imageMatch) {
    data.imageUrl = imageMatch[1];
  }
  
  return data;
}

/**
 * Map Fandom data to character attributes
 */
function mapToCharacterAttributes(fandomData) {
  const mapped = {};
  
  // Species
  if (fandomData.species) {
    let species = extractPrimaryValue(fandomData.species);
    species = removeLabels(species);
    if (species && species.length > 0 && species.length < 50) {
      mapped.species = species;
    }
  }
  
  // Sex/Gender
  if (fandomData.gender) {
    let gender = extractPrimaryValue(fandomData.gender);
    gender = removeLabels(gender);
    if (gender) {
      const genderLower = gender.toLowerCase();
      if (genderLower.includes('male') && !genderLower.includes('female')) {
        mapped.sex = 'Male';
      } else if (genderLower.includes('female')) {
        mapped.sex = 'Female';
      } else if (genderLower.includes('none')) {
        mapped.sex = 'None';
      } else {
        mapped.sex = gender;
      }
    }
  }
  
  // Hair Color
  if (fandomData.hair) {
    let hair = extractPrimaryValue(fandomData.hair);
    hair = removeLabels(hair);
    if (hair && hair.length > 0 && hair.length < 30) {
      mapped.hairColor = hair;
    }
  }
  
  // Eye Color (can be multiple)
  if (fandomData.eye) {
    let eyes = extractMultipleValues(fandomData.eye);
    if (eyes.length > 0) {
      mapped.eyeColor = eyes;
    }
  }
  
  // Homeworld
  if (fandomData.homeworld) {
    let homeworld = extractPrimaryValue(fandomData.homeworld);
    homeworld = removeLabels(homeworld);
    if (homeworld && homeworld.length > 0 && homeworld.length < 50) {
      mapped.homeworld = homeworld;
    }
  }
  
  // Affiliations (multiple values)
  if (fandomData.affiliation) {
    let affiliations = extractMultipleValues(fandomData.affiliation);
    if (affiliations.length > 0) {
      mapped.affiliations = affiliations;
    }
  }
  
  return mapped;
}

/**
 * Check if cached HTML exists and is less than 1 week old
 */
function getCachedHtml(characterId) {
  const filepath = path.join(CACHE_DIR, `${characterId}.html`);
  
  if (!fs.existsSync(filepath)) {
    return { html: null, isFresh: false };
  }
  
  const stats = fs.statSync(filepath);
  const ageMs = Date.now() - stats.mtimeMs;
  const isFresh = ageMs < CACHE_MAX_AGE_MS;
  
  if (!isFresh) {
    return { html: null, isFresh: false };
  }
  
  const html = fs.readFileSync(filepath, 'utf8');
  return { html, isFresh: true };
}

/**
 * Download HTML from Fandom and cache it
 */
async function downloadAndCacheHtml(characterId, characterName) {
  const fandomName = characterName.replace(/ /g, '_');
  const url = `${FANDOM_BASE_URL}/${fandomName}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Cache the HTML
    const filepath = path.join(CACHE_DIR, `${characterId}.html`);
    fs.writeFileSync(filepath, html, 'utf8');
    
    return { html, fromCache: false };
  } catch (error) {
    throw new Error(`Failed to download: ${error.message}`);
  }
}

/**
 * Populate character information from Fandom
 * @param {string} characterId - The character ID
 * @param {string} characterName - The character name
 * @param {boolean} populateAll - If true, populate all fields. If false, only populate missing fields.
 * @param {Object} currentData - Current character data
 * @returns {Object} - { success, data, error, fromCache }
 */
export async function populateCharacterInfo(characterId, characterName, populateAll = false, currentData = {}) {
  try {
    // Check cache first
    let { html, isFresh } = getCachedHtml(characterId);
    let fromCache = isFresh;
    
    // Download if not cached or cache is stale
    if (!html) {
      const result = await downloadAndCacheHtml(characterId, characterName);
      html = result.html;
      fromCache = false;
    }
    
    // Parse the HTML
    const fandomData = parseInfobox(html);
    if (!fandomData) {
      return {
        success: false,
        error: 'Could not parse character infobox from Fandom page',
        fromCache
      };
    }
    
    // Map to character attributes
    const mappedData = mapToCharacterAttributes(fandomData);
    
    // If populateAll is false, only include fields that are null or empty in currentData
    let finalData = {};
    if (populateAll) {
      finalData = mappedData;
    } else {
      // Only populate missing fields
      for (const [key, value] of Object.entries(mappedData)) {
        const currentValue = currentData[key];
        const isEmpty = currentValue === null || 
                       currentValue === undefined || 
                       currentValue === '' ||
                       (Array.isArray(currentValue) && currentValue.length === 0) ||
                       (Array.isArray(currentValue) && currentValue.length === 1 && currentValue[0] === 'None');
        
        if (isEmpty) {
          finalData[key] = value;
        }
      }
    }
    
    return {
      success: true,
      data: finalData,
      fromCache,
      fandomUrl: `${FANDOM_BASE_URL}/${characterName.replace(/ /g, '_')}`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      fromCache: false
    };
  }
}

/**
 * Command-line interface for testing
 */
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  (async () => {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
      console.log('Usage: node populate-character-api.js <characterId> <characterName> [--all]');
      console.log('Example: node populate-character-api.js luke-skywalker "Luke Skywalker"');
      console.log('Example: node populate-character-api.js luke-skywalker "Luke Skywalker" --all');
      process.exit(1);
    }
    
    const characterId = args[0];
    const characterName = args[1];
    const populateAll = args.includes('--all');
    
    console.log(`\n🔍 Populating character info for: ${characterName}`);
    console.log(`   Character ID: ${characterId}`);
    console.log(`   Mode: ${populateAll ? 'Populate All' : 'Populate Missing'}\n`);
    
    const result = await populateCharacterInfo(characterId, characterName, populateAll, {
      species: null,
      sex: 'Male',
      hairColor: null
    });
    
    console.log('Result:', JSON.stringify(result, null, 2));
  })();
}
