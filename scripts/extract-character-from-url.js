#!/usr/bin/env node

/**
 * Extract Character from Fandom URL
 *
 * This script takes a Fandom URL and creates/updates a character entry
 * in data/characters_new.json with basic information extracted from the page.
 *
 * Usage: node scripts/extract-character-from-url.js <fandom-url>
 *
 * Example:
 * node scripts/extract-character-from-url.js "https://starwars.fandom.com/wiki/Luke_Skywalker"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHARACTERS_NEW_FILE = path.join(__dirname, '..', 'src', 'data', 'characters_new.json');

/**
 * Download HTML content from a URL
 */
async function downloadPage(url) {
  try {
    console.log(`📥 Downloading: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`✅ Successfully downloaded ${html.length} characters of HTML`);
    return html;
  } catch (error) {
    console.error(`❌ Failed to download: ${error.message}`);
    throw error;
  }
}

/**
 * Extract character name from URL or page title
 */
function extractCharacterName(url, html) {
  // Try to extract from URL first
  const urlMatch = url.match(/\/wiki\/([^/?#]+)/);
  if (urlMatch) {
    const urlName = decodeURIComponent(urlMatch[1]).replace(/_/g, ' ');
    // Clean up common prefixes/suffixes
    return urlName.replace(/^(Category:|File:|Template:|User:|Help:)/i, '');
  }

  // Fallback: extract from page title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  if (titleMatch) {
    let title = titleMatch[1];
    // Remove common suffixes
    title = title.replace(/\s*-\s*Star Wars[^-]*/i, '');
    title = title.replace(/\s*-\s*Wookieepedia[^-]*/i, '');
    title = title.replace(/\s*-\s*Fandom[^-]*/i, '');
    return title.trim();
  }

  throw new Error('Could not extract character name from URL or page title');
}

/**
 * Clean and extract text from HTML content
 */
function cleanText(text) {
  return text
    .replace(/<a[^>]*>(.*?)<\/a>/g, '$1') // Extract link text
    .replace(/<br\s*\/?>/gi, '|||') // Temp marker for line breaks
    .replace(/<[^>]+>/g, '') // Remove all HTML tags
    .replace(/\[[^\]]+\]/g, '') // Remove reference brackets [1], [2], etc.
    .replace(/&#91;/g, '[').replace(/&#93;/g, ']') // Decode HTML entities
    .replace(/\[\d+\]/g, '') // Remove decoded references
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

  // Remove everything after certain markers
  let cleaned = text
    .replace(/\(.*?\)/g, '') // Remove parentheses content
    .replace(/\[.*?\]/g, '') // Remove brackets
    .replace(/,.*$/, '') // Take only first comma-separated value
    .replace(/;.*$/, '') // Take only first semicolon-separated value
    .split('|||')[0] // Take first line
    .trim();

  return cleaned || null;
}

/**
 * Parse Fandom infobox from HTML
 */
function parseInfobox(html) {
  const data = {};

  // Find the portable-infobox
  const infoboxMatch = html.match(/<aside[^>]*class="[^"]*portable-infobox[^"]*"[^>]*>([\s\S]*?)<\/aside>/);
  if (!infoboxMatch) {
    return null;
  }

  const infobox = infoboxMatch[1];

  // Extract data-source fields
  const dataSourcePattern = /data-source="([^"]+)"/g;
  let match;
  const dataSources = [];

  while ((match = dataSourcePattern.exec(infobox)) !== null) {
    dataSources.push(match[1]);
  }

  // Extract values for each data source
  for (const source of dataSources) {
    const sectionRegex = new RegExp(`data-source="${source}"[^>]*>([\\s\\S]*?)(?:<\\/div>\\s*<\\/div>|<\\/section>)`, 'i');
    const sectionMatch = infobox.match(sectionRegex);

    if (sectionMatch) {
      const rawText = cleanText(sectionMatch[1]);
      const cleanedText = removeLabels(rawText);
      data[source] = cleanedText;
    }
  }

  // Extract image URL
  const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
  if (imageMatch) {
    data.imageUrl = imageMatch[1];
  }

  return data;
}

/**
 * Map Fandom data to character attributes (basic version)
 */
function mapToCharacterAttributes(fandomData) {
  const mapped = {};

  // Species
  if (fandomData.species) {
    const species = extractPrimaryValue(fandomData.species);
    if (species && species.length > 0 && species.length < 50) {
      mapped.species = species;
    }
  }

  // Sex/Gender
  if (fandomData.gender) {
    const gender = extractPrimaryValue(fandomData.gender);
    if (gender) {
      // Map gender to sex options
      const genderLower = gender.toLowerCase();
      if (genderLower.includes('male') && !genderLower.includes('female')) {
        mapped.sex = 'Male';
      } else if (genderLower.includes('female')) {
        mapped.sex = 'Female';
      } else if (genderLower.includes('none')) {
        mapped.sex = 'None';
      }
    }
  }

  // Hair Color
  if (fandomData.hair) {
    const hair = extractPrimaryValue(fandomData.hair);
    if (hair && hair.length > 0 && hair.length < 30) {
      mapped.hairColor = hair;
    }
  }

  // Eye Color
  if (fandomData.eyes) {
    const eyes = extractPrimaryValue(fandomData.eyes);
    if (eyes && eyes.length > 0 && eyes.length < 30) {
      mapped.eyeColor = [eyes]; // Store as array
    }
  }

  // Homeworld
  if (fandomData.homeworld) {
    const homeworld = extractPrimaryValue(fandomData.homeworld);
    if (homeworld && homeworld.length > 0 && homeworld.length < 50) {
      mapped.homeworld = homeworld;
    }
  }

  // Affiliation (basic - take first one)
  if (fandomData.affiliation) {
    const affiliation = extractPrimaryValue(fandomData.affiliation);
    if (affiliation && affiliation.length > 2 && affiliation.length < 100) {
      mapped.affiliations = [affiliation];
    }
  }

  // Check if Force user based on masters/apprentices or Jedi/Sith affiliation
  if (fandomData.masters || fandomData.apprentices) {
    mapped.forceUser = true;
  } else if (fandomData.affiliation) {
    const affLower = fandomData.affiliation.toLowerCase();
    if (affLower.includes('jedi') || affLower.includes('sith')) {
      mapped.forceUser = true;
    }
  }

  // Image URL
  if (fandomData.imageUrl) {
    mapped.imageUrl = fandomData.imageUrl;
  }

  return mapped;
}

/**
 * Generate a unique ID from character name
 */
function generateCharacterId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Create a basic character object
 */
function createBasicCharacter(name, url) {
  const id = generateCharacterId(name);

  return {
    id,
    name,
    additionalNames: [],
    species: null,
    sex: null,
    hairColor: null,
    eyeColor: [],
    homeworld: null,
    affiliations: [],
    eras: [],
    weapons: [],
    forceUser: false,
    speaksBasic: true, // Default assumption
    movieAppearances: [],
    tvAppearances: [],
    gameAppearances: [],
    bookComicAppearances: [],
    enabled: true,
    quoteHint: null,
    masterHint: null,
    imageUrl: null,
    sourceUrl: url // Store the original Fandom URL
  };
}

/**
 * Load existing characters from characters_new.json
 */
function loadCharacters() {
  if (!fs.existsSync(CHARACTERS_NEW_FILE)) {
    console.log('📄 Creating new characters_new.json file');
    return [];
  }

  try {
    const data = fs.readFileSync(CHARACTERS_NEW_FILE, 'utf8');
    const characters = JSON.parse(data);
    console.log(`📚 Loaded ${characters.length} existing characters`);
    return characters;
  } catch (error) {
    console.error(`❌ Error loading characters file: ${error.message}`);
    return [];
  }
}

/**
 * Save characters to characters_new.json
 */
function saveCharacters(characters) {
  try {
    fs.writeFileSync(CHARACTERS_NEW_FILE, JSON.stringify(characters, null, 2));
    console.log(`💾 Saved ${characters.length} characters to ${CHARACTERS_NEW_FILE}`);
  } catch (error) {
    console.error(`❌ Error saving characters file: ${error.message}`);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Star Wars Character Extractor from Fandom URL\n');

  // Get URL from command line arguments
  const url = process.argv[2];
  if (!url) {
    console.error('❌ Usage: node scripts/extract-character-from-url.js <fandom-url>');
    console.error('   Example: node scripts/extract-character-from-url.js "https://starwars.fandom.com/wiki/Luke_Skywalker"');
    process.exit(1);
  }

  // Validate URL format
  if (!url.includes('fandom.com') && !url.includes('wikipedia.org')) {
    console.warn('⚠️  URL does not appear to be from Fandom or Wikipedia. Proceeding anyway...');
  }

  try {
    // Download the page
    const html = await downloadPage(url);

    // Extract character name
    const characterName = extractCharacterName(url, html);
    console.log(`👤 Character name: "${characterName}"`);

    // Generate ID
    const characterId = generateCharacterId(characterName);
    console.log(`🆔 Character ID: "${characterId}"`);

    // Parse the infobox data
    const fandomData = parseInfobox(html);
    const extractedAttributes = fandomData ? mapToCharacterAttributes(fandomData) : {};

    if (fandomData) {
      console.log(`📊 Extracted ${Object.keys(extractedAttributes).length} attributes from infobox`);
    } else {
      console.log(`⚠️  Could not find infobox on page`);
    }

    // Load existing characters
    const characters = loadCharacters();

    // Check if character already exists
    const existingIndex = characters.findIndex(char => char.id === characterId);

    if (existingIndex >= 0) {
      console.log(`📝 Character "${characterName}" already exists. Updating...`);
      const existingChar = characters[existingIndex];

      // Update with new extracted data (only if fields are null/empty)
      Object.keys(extractedAttributes).forEach(key => {
        if (extractedAttributes[key] !== null && extractedAttributes[key] !== undefined) {
          if (Array.isArray(extractedAttributes[key])) {
            // For arrays, only update if empty
            if (existingChar[key] && existingChar[key].length === 0) {
              existingChar[key] = extractedAttributes[key];
            }
          } else {
            // For single values, only update if null
            if (existingChar[key] === null) {
              existingChar[key] = extractedAttributes[key];
            }
          }
        }
      });

      // Always update the source URL
      existingChar.sourceUrl = url;
    } else {
      console.log(`🆕 Creating new character "${characterName}"`);
      // Create new character with extracted data
      const newCharacter = createBasicCharacter(characterName, url);

      // Apply extracted attributes
      Object.keys(extractedAttributes).forEach(key => {
        if (extractedAttributes[key] !== null && extractedAttributes[key] !== undefined) {
          newCharacter[key] = extractedAttributes[key];
        }
      });

      characters.push(newCharacter);
    }

    // Save the updated characters
    saveCharacters(characters);

    console.log('\n✅ Character extraction complete!');
    console.log(`📄 File: ${CHARACTERS_NEW_FILE}`);
    console.log(`👥 Total characters: ${characters.length}`);

  } catch (error) {
    console.error(`\n❌ Extraction failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
