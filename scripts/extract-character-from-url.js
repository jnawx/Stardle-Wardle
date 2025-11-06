#!/usr/bin/env node

/**
 * Extract Character from Fandom URL
 *
 * This script takes a Fandom URL and creates/updates a character entry
 * in data/characters_new.json with basic information extracted from the page.
 *
 * Usage: node scripts/extract-character-from-url.js [--force-update] <fandom-url>
 *
 * Example:
 * node scripts/extract-character-from-url.js "https://starwars.fandom.com/wiki/Luke_Skywalker"
 * node scripts/extract-character-from-url.js --force-update "https://starwars.fandom.com/wiki/Luke_Skywalker"
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHARACTERS_NEW_FILE = path.join(__dirname, '..', 'src', 'data', 'characters_new.json');
const ATTRIBUTE_OPTIONS_FILE = path.join(__dirname, '..', 'src', 'data', 'attribute-options.json');

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
    .replace(/<\/li>\s*<li>/gi, '|||') // Separate list items
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
 * Extract species from fandom data
 */
async function extractSpecies(fandomData, attributeOptions) {
  if (!fandomData.species) return null;
  const species = extractPrimaryValue(fandomData.species);

  // Filter out invalid species names
  if (!species || species.length === 0 || species.length >= 50) return null;

  // Check if species exists in attribute options
  if (attributeOptions.species && attributeOptions.species.includes(species)) {
    return species;
  }

  // Species not in options - prompt user for how to handle it
  return await promptSpeciesHandling(species, attributeOptions);
}

/**
 * Extract sex/gender from fandom data
 */
function extractSex(fandomData) {
  if (!fandomData.gender) return null;
  const gender = extractPrimaryValue(fandomData.gender);
  if (!gender) return null;

  const genderLower = gender.toLowerCase();
  if (genderLower.includes('male') && !genderLower.includes('female')) {
    return 'Male';
  } else if (genderLower.includes('female')) {
    return 'Female';
  } else if (genderLower.includes('none')) {
    return 'None';
  }
  return null;
}

/**
 * Extract hair color from fandom data
 */
function extractHairColor(fandomData, attributeOptions) {
  if (!fandomData.hair) return null;
  const hair = extractPrimaryValue(fandomData.hair);
  return matchHairColor(hair, attributeOptions);
}

/**
 * Extract eye color from fandom data
 */
function extractEyeColor(fandomData, attributeOptions) {
  if (!fandomData.eyes) return null;
  const eyes = extractPrimaryValue(fandomData.eyes);
  const matchedColor = matchEyeColor(eyes, attributeOptions);
  return matchedColor || null;
}

/**
 * Extract skin color from fandom data
 */
function extractSkinColor(fandomData, attributeOptions) {
  if (!fandomData.skin) return null;
  const skin = extractPrimaryValue(fandomData.skin);
  return matchSkinColor(skin, attributeOptions);
}

/**
 * Extract homeworld from fandom data
 */
async function extractHomeworld(fandomData, attributeOptions) {
  // Check if homeworld field exists
  if (!fandomData.homeworld) return null;

  // Split on separators to handle multiple homeworlds
  const homeworlds = fandomData.homeworld.split('|||').map(h => h.trim()).filter(h => h.length > 0);

  // Default 1: If there's only one homeworld, use it
  if (homeworlds.length === 1) {
    const homeworld = homeworlds[0];
    // Filter out invalid homeworld names
    if (homeworld && homeworld.length > 0 && homeworld.length < 50) {
      // Check if homeworld exists in attribute options
      if (attributeOptions.homeworld && attributeOptions.homeworld.includes(homeworld)) {
        return homeworld;
      } else {
        // Homeworld not in options - prompt user for how to handle it
        return await promptHomeworldHandling(homeworld, attributeOptions);
      }
    }
  }

  // Default 2: If multiple homeworlds, try to use the one from the birth field
  if (homeworlds.length > 1 && fandomData.birth) {
    // Look for planet names in the birth text, skipping over year patterns
    const birthPlanetMatch = fandomData.birth.match(/,\s*([^,\d]+(?:\s+[^,\d]+)*?)(?:\s*\([^)]*\))?\s*$/);
    if (birthPlanetMatch) {
      const birthPlanet = birthPlanetMatch[1].trim();
      // Filter out invalid planet names (must not contain numbers, must be reasonable length)
      if (birthPlanet && birthPlanet.length > 0 && birthPlanet.length < 50 && !/\d/.test(birthPlanet)) {
        // Check if this birth planet is in the list of homeworlds
        if (homeworlds.includes(birthPlanet)) {
          // Check if birth planet exists in attribute options
          if (attributeOptions.homeworld && attributeOptions.homeworld.includes(birthPlanet)) {
            return birthPlanet;
          } else {
            // Birth planet not in options - prompt user for how to handle it
            return await promptHomeworldHandling(birthPlanet, attributeOptions);
          }
        }
      }
    }
  }

  // Default 3: Use first valid match from multiple homeworlds
  for (const homeworld of homeworlds) {
    // Filter out invalid homeworld names
    if (!homeworld || homeworld.length === 0 || homeworld.length >= 50) continue;

    // Check if homeworld exists in attribute options
    if (attributeOptions.homeworld && attributeOptions.homeworld.includes(homeworld)) {
      return homeworld;
    }
  }

  // Default 4: Prompt to add homeworlds one by one until one is added or Unknown is chosen
  for (const homeworld of homeworlds) {
    // Filter out invalid homeworld names
    if (!homeworld || homeworld.length === 0 || homeworld.length >= 50) continue;

    // Prompt user for how to handle this homeworld
    const result = await promptHomeworldHandling(homeworld, attributeOptions);
    if (result && result !== 'Unknown') {
      return result;
    }
  }

  return null;
}

/**
 * Extract affiliations from fandom data
 */
function extractAffiliations(fandomData) {
  if (!fandomData.affiliation) return [];
  const affiliation = extractPrimaryValue(fandomData.affiliation);
  return (affiliation && affiliation.length > 2 && affiliation.length < 100) ? [affiliation] : [];
}

/**
 * Determine if character is a Force user
 */
function extractForceUser(fandomData, html = '') {
  // Check for masters/apprentices (strong indicator) - but only if Force-related
  if (fandomData.masters || fandomData.apprentices) {
    const mastersText = (fandomData.masters || '').toLowerCase();
    const apprenticesText = (fandomData.apprentices || '').toLowerCase();
    const combinedText = mastersText + ' ' + apprenticesText;

    // Only consider masters/apprentices as Force indicators if they contain Force-related terms
    // or if there are other Force indicators in the affiliation
    const hasForceTerms = combinedText.includes('jedi') || combinedText.includes('sith') ||
                         combinedText.includes('force') || combinedText.includes('padawan') ||
                         combinedText.includes('youngling') || combinedText.includes('master') && combinedText.includes('jedi');

    if (hasForceTerms) {
      return true;
    }
  }

  // Check affiliations for Jedi/Sith
  if (fandomData.affiliation) {
    const affLower = fandomData.affiliation.toLowerCase();
    if (affLower.includes('jedi') || affLower.includes('sith')) {
      return true;
    }
  }

  // If HTML is provided, search article content for Force-related patterns
  if (html) {
    const htmlLower = html.toLowerCase();

    // Direct Force usage patterns - look for character name + Force action
    // This is more specific than just checking for keywords anywhere in the text
    const characterName = extractCharacterName('', html).toLowerCase();
    const nameWords = characterName.split(/\s+/).filter(word => word.length > 2);

    // Check for character-specific Force usage
    for (const nameWord of nameWords) {
      // Patterns like "Luke used the Force", "Vader wielded the Force", etc.
      const forceUsagePatterns = [
        `${nameWord}\\s+used\\s+the\\s+force`,
        `${nameWord}\\s+wielded\\s+the\\s+force`,
        `${nameWord}\\s+harnessed\\s+the\\s+force`,
        `${nameWord}\\s+channeled\\s+the\\s+force`,
        `${nameWord}\\s+mastered\\s+the\\s+force`,
        `${nameWord}\\s+learned\\s+the\\s+force`,
        `${nameWord}\\s+studied\\s+the\\s+force`,
        `${nameWord}\\s+trained\\s+in\\s+the\\s+force`,
        `${nameWord}\\s+force\\s+powers`,
        `${nameWord}\\s+force\\s+abilities`,
        `${nameWord}\\s+force\\s+sensitive`,
        `${nameWord}\\s+midichlorian`,
        `${nameWord}\\s+lightsaber`,
        `${nameWord}\\s+jedi\\s+training`,
        `${nameWord}\\s+jedi\\s+master`,
        `${nameWord}\\s+jedi\\s+knight`,
        `${nameWord}\\s+sith\\s+lord`,
        `${nameWord}\\s+dark\\s+side`,
        `${nameWord}\\s+force\\s+ghost`
      ];

      for (const pattern of forceUsagePatterns) {
        if (new RegExp(pattern, 'i').test(htmlLower)) {
          return true;
        }
      }
    }

    // Also check for general Force indicators that are more specific
    // Lightsaber usage (strong Force indicator) - make this character-specific and more precise
    for (const nameWord of nameWords) {
      if (htmlLower.includes('lightsaber') &&
          (new RegExp(`${nameWord}\\s+wielded\\s+a\\s+lightsaber`, 'i').test(htmlLower) ||
           new RegExp(`${nameWord}\\s+used\\s+a\\s+lightsaber`, 'i').test(htmlLower) ||
           new RegExp(`${nameWord}\\s+fought\\s+with\\s+a\\s+lightsaber`, 'i').test(htmlLower) ||
           new RegExp(`${nameWord}\\s+ignited\\s+his\\s+lightsaber`, 'i').test(htmlLower) ||
           new RegExp(`${nameWord}\\s+drew\\s+his\\s+lightsaber`, 'i').test(htmlLower))) {
        return true;
      }
    }

    // Character-specific Jedi/Sith training or membership
    for (const nameWord of nameWords) {
      if ((new RegExp(`${nameWord}\\s+jedi\\s+training`, 'i').test(htmlLower) ||
           new RegExp(`${nameWord}\\s+sith\\s+training`, 'i').test(htmlLower) ||
           new RegExp(`${nameWord}\\s+jedi\\s+order`, 'i').test(htmlLower) ||
           new RegExp(`${nameWord}\\s+sith\\s+order`, 'i').test(htmlLower)) &&
          !htmlLower.includes('against the jedi') && !htmlLower.includes('destroyed the jedi order')) {
        return true;
      }
    }

    // Character-specific Force ghost appearances
    for (const nameWord of nameWords) {
      if (new RegExp(`${nameWord}\\s+force\\s+ghost`, 'i').test(htmlLower) &&
          htmlLower.includes('appeared')) {
        return true;
      }
    }
  }

  return false;
}/**
 * Load attribute options from attribute-options.json
 */
function loadAttributeOptions() {
  try {
    const data = fs.readFileSync(ATTRIBUTE_OPTIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ Error loading attribute options: ${error.message}`);
    return null;
  }
}

/**
 * Save attribute options to attribute-options.json
 */
function saveAttributeOptions(options) {
  try {
    fs.writeFileSync(ATTRIBUTE_OPTIONS_FILE, JSON.stringify(options, null, 2));
    console.log(`💾 Updated attribute options file`);
  } catch (error) {
    console.error(`❌ Error saving attribute options: ${error.message}`);
  }
}

/**
 * Prompt user for species handling when species doesn't match criteria
 */
function promptSpeciesHandling(fandomSpecies, attributeOptions) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log(`\n❓ Species "${fandomSpecies}" is not in the attribute options.`);
    console.log('Choose how to handle this species:');
    console.log('1) Set species to "Unknown"');
    console.log('2) Add species to attribute options and use it');
    console.log('3) Leave species as null');

    rl.question('Enter choice (1-3): ', (answer) => {
      rl.close();

      switch (answer.trim()) {
        case '1':
          console.log('✅ Setting species to "Unknown"');
          resolve('Unknown');
          break;
        case '2':
          // Add to attribute options
          if (!attributeOptions.species.includes(fandomSpecies)) {
            attributeOptions.species.push(fandomSpecies);
            attributeOptions.species.sort(); // Keep alphabetically sorted
            saveAttributeOptions(attributeOptions);
            console.log(`✅ Added "${fandomSpecies}" to species options`);
          }
          resolve(fandomSpecies);
          break;
        case '3':
          console.log('✅ Leaving species as null');
          resolve(null);
          break;
        default:
          console.log('❌ Invalid choice, defaulting to null');
          resolve(null);
          break;
      }
    });
  });
}

/**
 * Prompt user for homeworld handling when homeworld doesn't match criteria
 */
function promptHomeworldHandling(fandomHomeworld, attributeOptions) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log(`\n❓ Homeworld "${fandomHomeworld}" is not in the attribute options.`);
    console.log('Choose how to handle this homeworld:');
    console.log('1) Set homeworld to "Unknown"');
    console.log('2) Add homeworld to attribute options and use it');
    console.log('3) Leave homeworld as null');

    rl.question('Enter choice (1-3): ', (answer) => {
      rl.close();

      switch (answer.trim()) {
        case '1':
          console.log('✅ Setting homeworld to "Unknown"');
          resolve('Unknown');
          break;
        case '2':
          // Add to attribute options
          if (!attributeOptions.homeworld.includes(fandomHomeworld)) {
            attributeOptions.homeworld.push(fandomHomeworld);
            attributeOptions.homeworld.sort(); // Keep alphabetically sorted
            saveAttributeOptions(attributeOptions);
            console.log(`✅ Added "${fandomHomeworld}" to homeworld options`);
          }
          resolve(fandomHomeworld);
          break;
        case '3':
          console.log('✅ Leaving homeworld as null');
          resolve(null);
          break;
        default:
          console.log('❌ Invalid choice, defaulting to null');
          resolve(null);
          break;
      }
    });
  });
}

/**
 * Match hair color to available options
 */
function matchHairColor(colorText, attributeOptions) {
  if (!colorText || !attributeOptions?.hairColor) return null;

  const text = colorText.toLowerCase().trim();

  // Direct matches
  for (const option of attributeOptions.hairColor) {
    if (text === option.toLowerCase()) {
      return option;
    }
  }

  // Pattern matching for common variations
  if (text.includes('black') || text.includes('ebony') || text.includes('raven')) {
    return 'Black';
  }
  if (text.includes('brown') || text.includes('chestnut') || text.includes('auburn')) {
    return 'Brown';
  }
  if (text.includes('blonde') || text.includes('golden') || text.includes('yellow')) {
    return 'Blonde';
  }
  if (text.includes('red') || text.includes('ginger') || text.includes('copper')) {
    return 'Red';
  }
  if (text.includes('gray') || text.includes('grey') || text.includes('silver')) {
    return 'Gray';
  }
  if (text.includes('white') || text.includes('platinum')) {
    return 'White';
  }
  if (text.includes('none') || text.includes('bald') || text.includes('shaved')) {
    return 'None';
  }

  return null; // No match found
}

/**
 * Match eye color to available options
 */
function matchEyeColor(colorText, attributeOptions) {
  if (!colorText || !attributeOptions?.eyeColor) return null;

  const text = colorText.toLowerCase().trim();

  // Direct matches
  for (const option of attributeOptions.eyeColor) {
    if (text === option.toLowerCase()) {
      return option;
    }
  }

  // Pattern matching for common variations
  if (text.includes('brown') || text.includes('hazel') || text.includes('amber')) {
    return 'Brown/Hazel';
  }
  if (text.includes('blue') || text.includes('green') || text.includes('turquoise') || text.includes('emerald')) {
    return 'Blue/Green';
  }
  if (text.includes('yellow') || text.includes('red') || text.includes('orange') || text.includes('gold')) {
    return 'Yellow/Red';
  }
  if (text.includes('gray') || text.includes('grey') || text.includes('white') || text.includes('silver')) {
    return 'Gray/White';
  }
  if (text.includes('black') || text.includes('dark')) {
    return 'Black';
  }
  if (text.includes('none') || text.includes('blind')) {
    return 'None';
  }

  return null; // No match found
}

/**
 * Match skin color to available options
 */
function matchSkinColor(colorText, attributeOptions) {
  if (!colorText || !attributeOptions?.skinColor) return null;

  const text = colorText.toLowerCase().trim();

  // Direct matches
  for (const option of attributeOptions.skinColor) {
    if (text === option.toLowerCase()) {
      return option;
    }
  }

  // Pattern matching for common variations
  if (text.includes('light') || text.includes('fair') || text.includes('pale')) {
    return 'Light';
  }
  if (text.includes('dark') || text.includes('black') || text.includes('ebony')) {
    return 'Dark';
  }
  if (text.includes('tan') || text.includes('brown')) {
    return 'Tan';
  }
  if (text.includes('green') || text.includes('emerald')) {
    return 'Green';
  }
  if (text.includes('blue') || text.includes('azure')) {
    return 'Blue';
  }
  if (text.includes('red') || text.includes('crimson')) {
    return 'Red';
  }
  if (text.includes('yellow') || text.includes('gold')) {
    return 'Yellow';
  }
  if (text.includes('orange')) {
    return 'Orange';
  }
  if (text.includes('purple') || text.includes('violet')) {
    return 'Purple';
  }
  if (text.includes('gray') || text.includes('grey') || text.includes('silver')) {
    return 'Gray';
  }
  if (text.includes('white')) {
    return 'White';
  }
  if (text.includes('pink')) {
    return 'Pink';
  }

  return null; // No match found
}

/**
 * Extract image URL from fandom data
 */
function extractImageUrl(fandomData) {
  return fandomData.imageUrl || null;
}

/**
 * Extract birth year from fandom data
 */
function extractBirthYear(fandomData) {
  if (!fandomData.birth) return null;
  // Extract year from birth field (e.g., "41 BBY, Tatooine" -> "41 BBY")
  const yearMatch = fandomData.birth.match(/(\d+)\s*(BBY|ABY)/i);
  return yearMatch ? `${yearMatch[1]} ${yearMatch[2].toUpperCase()}` : null;
}

/**
 * Extract death year from fandom data
 */
function extractDeathYear(fandomData) {
  if (!fandomData.death) return null;
  // Extract year from death field (e.g., "4 ABY, DS-2 Death Star II" -> "4 ABY")
  const yearMatch = fandomData.death.match(/(\d+)\s*(BBY|ABY)/i);
  return yearMatch ? `${yearMatch[1]} ${yearMatch[2].toUpperCase()}` : null;
}

/**
 * Extract height from fandom data
 */
function extractHeight(fandomData) {
  if (!fandomData.height) return null;
  const height = extractPrimaryValue(fandomData.height);
  if (!height) return null;

  // Clean up height format (e.g., "1.35 meters (4 ft, 5 in)" -> "1.35 meters")
  const cleanHeight = height.replace(/\s*\([^)]*\)/g, '').trim();
  return cleanHeight || null;
}

/**
 * Extract mass from fandom data
 */
function extractMass(fandomData) {
  if (!fandomData.mass) return null;
  const mass = extractPrimaryValue(fandomData.mass);
  if (!mass) return null;

  // Clean up mass format (e.g., "120 kilograms in armor" -> "120 kilograms")
  const cleanMass = mass.replace(/\s*in\s+armor.*$/i, '').trim();
  return cleanMass || null;
}

/**
 * Extract speaksBasic from quotes section
 */
function extractSpeaksBasic(html, characterName) {
  // Find all quote divs
  const quotePattern = /<div class="quote">(.*?)<\/div>/gs;
  let match;
  let speaksBasic = null; // null means no quotes found, keep default

  while ((match = quotePattern.exec(html)) !== null) {
    const quoteContent = match[1];

    // Find quotes attributed to this character using ―Character Name pattern
    // The pattern looks for ― followed by the character name at the start of the attribution
    const attributionPattern = new RegExp(`&#8213;\\s*${characterName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s*,|\\s*$)`, 'i');
    if (!attributionPattern.test(quoteContent)) {
      continue; // Not attributed to this character as primary speaker
    }

    // Extract all dd elements from this quote
    const ddPattern = /<dd[^>]*>(.*?)<\/dd>/gs;
    const ddElements = [];
    let ddMatch;
    while ((ddMatch = ddPattern.exec(quoteContent)) !== null) {
      ddElements.push(ddMatch[1]);
    }

    // Find the dd with the attribution
    let attributionIndex = -1;
    for (let i = 0; i < ddElements.length; i++) {
      if (attributionPattern.test(ddElements[i])) {
        attributionIndex = i;
        break;
      }
    }

    if (attributionIndex > 0) { // Must have at least one dd before the attribution
      // The quote text should be in the previous dd element
      const quoteDdContent = ddElements[attributionIndex - 1];

      // Extract the quote text (clean it up)
      const quoteTextMatch = quoteDdContent.match(/<span[^>]*>(.*?)<\/span>/);
      if (quoteTextMatch) {
        const quoteText = quoteTextMatch[1].trim();

        // Check for translation mentions (indicates translated from non-Basic language)
        if (quoteText.toLowerCase().includes('translate') || quoteText.toLowerCase().includes('translation')) {
          return false; // Character speaks a non-Basic language
        }

        // Check for regular quotes (indicates Basic/English)
        if (quoteText.includes('"')) {
          return true; // Found quote in regular quotes = speaks Basic
        }

        // Check for translation markers (<< >> indicates non-Basic)
        if (quoteText.includes('&lt;&lt;') || quoteText.includes('<<')) {
          return false; // Found quote in translation format = does not speak Basic
        }
      }
    }
  }

  return speaksBasic; // null if no suitable quotes found
}
function extractAppearances(html, attributeOptions) {
  const appearances = {
    movieAppearances: [],
    tvAppearances: [],
    gameAppearances: [],
    bookAppearances: []
  };

  // Find the appearances section - look for the h2 with id="Appearances"
  const appearancesSectionMatch = html.match(/<h2[^>]*>.*?<span[^>]*id="Appearances"[^>]*>Appearances<\/span>.*?<\/h2>([\s\S]*?)(?=<h2|$)/i);
  if (!appearancesSectionMatch) {
    return appearances;
  }

  const appearancesSection = appearancesSectionMatch[1];

  // Extract list items from the appearances section
  // Pattern: <li>...</li>
  const listItemPattern = /<li[^>]*>(.*?)<\/li>/g;
  const mediaTitles = [];
  let match;

  // Keywords that indicate non-canonical appearances when found in parentheses
  const filterKeywords = [
    'voice',
    'mentioned only',
    'indirect mention',
    'indirectly mentioned',
    'novel',
    'storybook',
    'little golden book',
    'read-along storybook',
    'statue only',
    'variant cover only',
    'unborn fetus',
    'flashback',
    'flashforward',
  ];

  while ((match = listItemPattern.exec(appearancesSection)) !== null) {
    const listItemContent = match[1];

    // Skip list items that contain filter keywords in parentheses or <small> tags (case insensitive)
    const hasFilterKeyword = filterKeywords.some(keyword => {
      // Check for keywords in parentheses: (...keyword...)
      const parenPattern = new RegExp(`\\([^)]*${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^)]*\\)`, 'i');
      // Check for keywords in <small> tags: <small>(...keyword...)</small>
      const smallPattern = new RegExp(`<small>\\([^)]*${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^)]*\\)</small>`, 'i');
      
      return parenPattern.test(listItemContent) || smallPattern.test(listItemContent);
    });
    if (hasFilterKeyword) {
      continue; // Skip this list item
    }

    // Extract title from the link within the list item
    const linkMatch = listItemContent.match(/<a[^>]*title="([^"]*)"[^>]*>(.*?)<\/a>/);
    if (linkMatch) {
      const titleAttr = linkMatch[1]; // title attribute
      const linkText = linkMatch[2]; // link text

      // Use the more descriptive title attribute if available, otherwise link text
      const title = titleAttr || linkText;
      // For movies, keep the full standardized title; for others, clean up
      let cleanTitle;
      if (titleAttr && titleAttr.includes('Episode')) {
        // Keep full title for movies (e.g., "Star Wars: Episode III Revenge of the Sith")
        cleanTitle = titleAttr.trim();
      } else {
        // Clean up the title (remove "Star Wars:" prefix if present) for non-movies
        cleanTitle = title.replace(/^Star Wars:\s*/i, '').trim();
      }
      if (cleanTitle && !mediaTitles.includes(cleanTitle)) {
        mediaTitles.push(cleanTitle);
      }
    }
  }

  // Categorize appearances based on attribute options
  for (const title of mediaTitles) {
    // Helper function to check if a title matches any option with strict matching
    function matchesOption(title, options) {
      if (!options || !Array.isArray(options)) return false;

      // Clean the title for comparison
      const cleanTitle = title.toLowerCase().trim();

      for (const option of options) {
        if (option === 'None') continue; // Skip the "None" option

        const cleanOption = option.toLowerCase().trim();

        // Exact match first
        if (cleanTitle === cleanOption) return option;

        // For movies, check for exact standardized title matches
        if (options === attributeOptions.movieAppearances) {
          // Direct exact matches for standardized movie titles
          const movieTitleMap = {
            'Star Wars: Episode I The Phantom Menace': 'The Phantom Menace',
            'Star Wars: Episode II Attack of the Clones': 'Attack of the Clones',
            'Star Wars: Episode III Revenge of the Sith': 'Revenge of the Sith',
            'Star Wars: Episode IV A New Hope': 'A New Hope',
            'Star Wars: Episode V The Empire Strikes Back': 'The Empire Strikes Back',
            'Star Wars: Episode VI Return of the Jedi': 'Return of the Jedi',
            'Star Wars: Episode VII The Force Awakens': 'The Force Awakens',
            'Star Wars: Episode VIII The Last Jedi': 'The Last Jedi',
            'Star Wars: Episode IX The Rise of Skywalker': 'The Rise of Skywalker',
            'Solo: A Star Wars Story': 'Solo',
            'Rogue One: A Star Wars Story': 'Rogue One'
          };
          
          if (movieTitleMap[title]) {
            return movieTitleMap[title];
          }
        }

        // For TV, check for common abbreviations
        if (options === attributeOptions.tvAppearances) {
          if (cleanTitle.includes('clone wars') && cleanOption.includes('clone wars')) return option;
          if (cleanTitle.includes('bad batch') && cleanOption.includes('bad batch')) return option;
          if (cleanTitle.includes('mandalorian') && cleanOption.includes('mandalorian')) return option;
          if (cleanTitle.includes('rebels') && cleanOption.includes('rebels')) return option;
          if (cleanTitle.includes('forces of destiny') && cleanOption.includes('forces of destiny')) return option;
          if (cleanTitle.includes('andor') && cleanOption.includes('andor')) return option;
          if (cleanTitle.includes('resistance') && cleanOption.includes('resistance')) return option;
          if (cleanTitle.includes('tales of') && cleanOption.includes('star wars: tales')) return option;
          if (cleanTitle.includes('ahsoka') && cleanOption.includes('ahsoka')) return option;
          if (cleanTitle.includes('young jedi adventures') && cleanOption.includes('young jedi adventures')) return option;
          if (cleanTitle.includes('visions') && cleanOption.includes('visions')) return option;
        }

        // For games, check for common patterns
        if (options === attributeOptions.gameAppearances) {
          if (cleanTitle.includes('battlefront') && cleanOption.includes('battlefront')) return option;
          if (cleanTitle.includes('jedi fallen order') && cleanOption.includes('fallen order')) return option;
          if (cleanTitle.includes('jedi survivor') && cleanOption.includes('survivor')) return option;
          if (cleanTitle.includes('commander') && cleanOption.includes('commander')) return option;
          if (cleanTitle.includes('squadrons') && cleanOption.includes('squadrons')) return option;
          if (cleanTitle.includes('galaxy of heroes') && cleanOption.includes('galaxy of heroes')) return option;
          if (cleanTitle.includes('uprising') && cleanOption.includes('uprising')) return option;
          if (cleanTitle.includes('knights of the old republic') && cleanOption.includes('knights of the old republic')) return option;
          if (cleanTitle.includes('rebels rebel strike') && cleanOption.includes('rebel strike')) return option;
        }
      }

      return false;
    }

    // Check movies
    const movieMatch = matchesOption(title, attributeOptions.movieAppearances);
    if (movieMatch && !appearances.movieAppearances.includes(movieMatch)) {
      appearances.movieAppearances.push(movieMatch);
    }
    // Check TV series
    else {
      const tvMatch = matchesOption(title, attributeOptions.tvAppearances);
      if (tvMatch && !appearances.tvAppearances.includes(tvMatch)) {
        appearances.tvAppearances.push(tvMatch);
      }
      // Check games
      else {
        const gameMatch = matchesOption(title, attributeOptions.gameAppearances);
        if (gameMatch && !appearances.gameAppearances.includes(gameMatch)) {
          appearances.gameAppearances.push(gameMatch);
        }
        // Check books/comics - only if it matches predefined book options
        else {
          const bookMatch = matchesOption(title, attributeOptions.bookAppearances);
          if (bookMatch && !appearances.bookAppearances.includes(bookMatch)) {
            appearances.bookAppearances.push(bookMatch);
          }
        }
      }
    }
  }

  // Ensure all appearance arrays have at least one value - use "None" if empty
  if (appearances.movieAppearances.length === 0) {
    appearances.movieAppearances.push('None');
  }
  if (appearances.tvAppearances.length === 0) {
    appearances.tvAppearances.push('None');
  }
  if (appearances.gameAppearances.length === 0) {
    appearances.gameAppearances.push('None');
  }
  if (appearances.bookAppearances.length === 0) {
    appearances.bookAppearances.push('None');
  }

  return appearances;
}

/**
 * Map Fandom data to character attributes (basic version)
 */
async function mapToCharacterAttributes(fandomData, attributeOptions, html, characterName) {
  const appearances = extractAppearances(html, attributeOptions);
  const speaksBasic = extractSpeaksBasic(html, characterName);

  return {
    species: await extractSpecies(fandomData, attributeOptions),
    sex: extractSex(fandomData),
    hairColor: extractHairColor(fandomData, attributeOptions),
    eyeColor: extractEyeColor(fandomData, attributeOptions),
    skinColor: extractSkinColor(fandomData, attributeOptions),
    homeworld: await extractHomeworld(fandomData, attributeOptions),
    birthYear: extractBirthYear(fandomData),
    deathYear: extractDeathYear(fandomData),
    height: extractHeight(fandomData),
    mass: extractMass(fandomData),
    affiliations: extractAffiliations(fandomData),
    forceUser: extractForceUser(fandomData, html),
    speaksBasic: speaksBasic,
    imageUrl: extractImageUrl(fandomData),
    movieAppearances: appearances.movieAppearances,
    tvAppearances: appearances.tvAppearances,
    gameAppearances: appearances.gameAppearances,
    bookAppearances: appearances.bookAppearances
  };
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
    eyeColor: null,
    skinColor: null,
    homeworld: null,
    birthYear: null,
    deathYear: null,
    height: null,
    mass: null,
    affiliations: [],
    eras: [],
    weapons: [],
    forceUser: false,
    speaksBasic: null, // null means not determined, will be set from extraction
    movieAppearances: [],
    tvAppearances: [],
    gameAppearances: [],
    bookAppearances: [],
    enabled: false,
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

  // Parse command line arguments
  const args = process.argv.slice(2);
  const forceUpdate = args.includes('--force-update');
  const url = args.find(arg => !arg.startsWith('--'));

  if (!url) {
    console.error('❌ Usage: node scripts/extract-character-from-url.js [--force-update] <fandom-url>');
    console.error('   Example: node scripts/extract-character-from-url.js "https://starwars.fandom.com/wiki/Luke_Skywalker"');
    console.error('   Example: node scripts/extract-character-from-url.js --force-update "https://starwars.fandom.com/wiki/Luke_Skywalker"');
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

    // Load attribute options
    const attributeOptions = loadAttributeOptions();
    if (!attributeOptions) {
      console.error('❌ Could not load attribute options. Exiting.');
      process.exit(1);
    }

    // Parse the infobox data
    const fandomData = parseInfobox(html);
    const extractedAttributes = fandomData ? await mapToCharacterAttributes(fandomData, attributeOptions, html, characterName) : {};

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
      const existingChar = characters[existingIndex];
      console.log(`📝 Character "${characterName}" already exists. ${existingChar.enabled ? 'Enabled' : 'Disabled'}.`);

      // Check if we can update this character
      if (existingChar.enabled && !forceUpdate) {
        console.log(`⚠️  Character is enabled. Use --force-update to update enabled characters.`);
        console.log(`💾 No changes made to existing character.`);
      } else {
        // Update with new extracted data
        let updated = false;
        Object.keys(extractedAttributes).forEach(key => {
          const newValue = extractedAttributes[key];
          if (newValue !== null && newValue !== undefined) {
            if (Array.isArray(newValue)) {
              // For appearance arrays, update if they only contain "None" or are empty, or if force updating
              const isAppearanceArray = ['movieAppearances', 'tvAppearances', 'gameAppearances', 'bookAppearances'].includes(key);
              if (isAppearanceArray) {
                const currentValue = existingChar[key] || [];
                // Update if empty or only contains "None", or if force updating
                if (currentValue.length === 0 || (currentValue.length === 1 && currentValue[0] === 'None') || forceUpdate) {
                  existingChar[key] = newValue;
                  updated = true;
                }
              } else {
                // For other arrays, only update if empty or force updating
                if ((existingChar[key] && existingChar[key].length === 0) || forceUpdate) {
                  existingChar[key] = newValue;
                  updated = true;
                }
              }
            } else {
              // For speaksBasic, update if it's currently null or if force updating
              if (key === 'speaksBasic') {
                if (existingChar[key] === null || forceUpdate) {
                  existingChar[key] = newValue;
                  updated = true;
                }
              } else {
                // For single values, only update if null or force updating
                if (existingChar[key] === null || forceUpdate) {
                  existingChar[key] = newValue;
                  updated = true;
                }
              }
            }
          }
        });

        // Always update the source URL
        existingChar.sourceUrl = url;

        if (updated) {
          console.log(`✅ Updated character with new data`);
        } else {
          console.log(`⏭️  No new data to update`);
        }
      }
    } else {
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
