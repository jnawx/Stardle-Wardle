import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_DIR = path.join(__dirname, '..', 'fandom-cache');
const CHARACTERS_FILE = path.join(__dirname, '..', 'src', 'data', 'characters.json');
const ATTRIBUTE_OPTIONS_FILE = path.join(__dirname, '..', 'src', 'data', 'attribute-options.json');

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
 * Extract multiple values from text (comma/line break separated)
 */
function extractMultipleValues(text) {
  if (!text) return [];
  
  const values = text
    .split(/[,;]|(\|\|\|)/) // Split by comma, semicolon, or line break marker
    .map(v => v ? v.replace(/\(.*?\)/g, '').trim() : '')
    .filter(v => v && v.length > 0 && v.length < 100);
  
  return [...new Set(values)]; // Remove duplicates
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
  
  // Extract appearances section for source/appears_in
  const appearancesMatch = html.match(/<section[^>]*class="[^"]*pi-item[^"]*pi-group[^"]*"[^>]*data-source="appearances"[^>]*>([\s\S]*?)<\/section>/);
  if (appearancesMatch) {
    const appearances = cleanText(appearancesMatch[1]);
    data.appearances = appearances;
  }
  
  return data;
}

/**
 * Extract source and appears_in from appearances text
 */
function extractMediaAppearances(appearancesText, attributeOptions) {
  if (!appearancesText) return { source: null, appears_in: [] };
  
  const text = appearancesText.toLowerCase();
  const appearsIn = [];
  
  // Check for each media type
  const mediaKeywords = {
    movies: ['star wars:', 'episode i', 'episode ii', 'episode iii', 'episode iv', 'episode v', 'episode vi', 'episode vii', 'episode viii', 'episode ix', 'rogue one', 'solo:', 'the force awakens', 'the last jedi', 'the rise of skywalker', 'phantom menace', 'attack of the clones', 'revenge of the sith', 'a new hope', 'empire strikes back', 'return of the jedi'],
    tv: ['the clone wars', 'rebels', 'the mandalorian', 'the book of boba fett', 'ahsoka', 'andor', 'obi-wan kenobi', 'tales of the jedi', 'bad batch', 'resistance', 'forces of destiny', 'visions'],
    books: ['novel', 'young adult', 'junior novel'],
    comics: ['comic', 'star wars adventures', 'darth vader'],
    games: ['video game', 'battlefront', 'jedi:', 'knights of the old republic', 'the old republic']
  };
  
  for (const [media, keywords] of Object.entries(mediaKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      appearsIn.push(media);
    }
  }
  
  // Determine primary source (movies > tv > games > books > comics)
  let primarySource = null;
  if (appearsIn.includes('movies')) primarySource = 'movies';
  else if (appearsIn.includes('tv')) primarySource = 'tv';
  else if (appearsIn.includes('games')) primarySource = 'games';
  else if (appearsIn.includes('books')) primarySource = 'books';
  else if (appearsIn.includes('comics')) primarySource = 'comics';
  
  return {
    source: primarySource,
    appears_in: appearsIn.length > 0 ? appearsIn : []
  };
}

/**
 * Map Fandom data to character attributes
 */
function mapToCharacterAttributes(fandomData, attributeOptions) {
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
      // Map gender to sex options
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
  if (fandomData.eyes) {
    let eyesText = removeLabels(fandomData.eyes);
    const eyeColors = extractMultipleValues(eyesText)
      .map(e => removeLabels(e))
      .filter(e => e && e.length > 0 && e.length < 30 && !e.match(/briefly|later|under|restored|natural|dark side/i));
    if (eyeColors.length > 0) {
      mapped.eyeColor = eyeColors;
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
  
  // Affiliation (can be multiple, but don't over-split)
  if (fandomData.affiliation) {
    const affiliations = fandomData.affiliation
      .split(/\|\|\|/) // Split by line breaks only
      .map(a => removeLabels(a.trim()))
      .filter(a => a && a.length > 2 && a.length < 100);
    if (affiliations.length > 0) {
      mapped.affiliations = affiliations;
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
  
  // Extract source and appears_in from appearances
  if (fandomData.appearances) {
    const media = extractMediaAppearances(fandomData.appearances, attributeOptions);
    if (media.source) {
      mapped.source = media.source;
    }
    if (media.appears_in.length > 0) {
      mapped.appears_in = media.appears_in;
    }
  }
  
  // Image URL
  if (fandomData.imageUrl) {
    mapped.imageUrl = fandomData.imageUrl;
  }
  
  return mapped;
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Star Wars Fandom HTML Parser\n');
  
  // Load characters
  const characters = JSON.parse(fs.readFileSync(CHARACTERS_FILE, 'utf8'));
  const attributeOptions = JSON.parse(fs.readFileSync(ATTRIBUTE_OPTIONS_FILE, 'utf8'));
  
  console.log(`📚 Loaded ${characters.length} characters\n`);
  
  const stats = {
    total: characters.length,
    parsed: 0,
    updated: 0,
    failed: 0,
    noFile: 0
  };
  
  const newSpecies = new Set();
  const newHomeworlds = new Set();
  const newHairColors = new Set();
  const newEyeColors = new Set();
  
  // Process each character
  for (const char of characters) {
    const htmlFile = path.join(CACHE_DIR, `${char.id}.html`);
    
    if (!fs.existsSync(htmlFile)) {
      console.log(`⏭️  ${char.name} - No HTML file found`);
      stats.noFile++;
      continue;
    }
    
    try {
      const html = fs.readFileSync(htmlFile, 'utf8');
      const fandomData = parseInfobox(html);
      
      if (!fandomData) {
        console.log(`❌ ${char.name} - Could not parse infobox`);
        stats.failed++;
        continue;
      }
      
      const mapped = mapToCharacterAttributes(fandomData, attributeOptions);
      
      stats.parsed++;
      
      // Track new values
      if (mapped.species && !attributeOptions.species.includes(mapped.species)) {
        newSpecies.add(mapped.species);
      }
      if (mapped.homeworld && !attributeOptions.homeworld.includes(mapped.homeworld)) {
        newHomeworlds.add(mapped.homeworld);
      }
      if (mapped.hairColor && !attributeOptions.hairColor.includes(mapped.hairColor)) {
        newHairColors.add(mapped.hairColor);
      }
      if (mapped.eyeColor) {
        mapped.eyeColor.forEach(color => {
          if (!attributeOptions.eyeColor.includes(color)) {
            newEyeColors.add(color);
          }
        });
      }
      
      // Update character with parsed data
      let updated = false;
      if (mapped.species && char.species === null) {
        char.species = mapped.species;
        updated = true;
      }
      if (mapped.sex && char.sex === null) {
        char.sex = mapped.sex;
        updated = true;
      }
      if (mapped.hairColor && char.hairColor === null) {
        char.hairColor = mapped.hairColor;
        updated = true;
      }
      if (mapped.eyeColor && char.eyeColor.length === 0) {
        char.eyeColor = mapped.eyeColor;
        updated = true;
      }
      if (mapped.homeworld && char.homeworld === null) {
        char.homeworld = mapped.homeworld;
        updated = true;
      }
      if (mapped.affiliations && char.affiliations.length === 0) {
        char.affiliations = mapped.affiliations;
        updated = true;
      }
      if (mapped.forceUser !== undefined && !char.forceUser) {
        char.forceUser = mapped.forceUser;
        updated = true;
      }
      if (mapped.imageUrl && !char.imageUrl) {
        char.imageUrl = mapped.imageUrl;
        updated = true;
      }
      // Always update source and appears_in if we have new data from appearances section
      if (mapped.source) {
        char.source = mapped.source;
        updated = true;
      }
      if (mapped.appears_in && mapped.appears_in.length > 0) {
        char.appears_in = mapped.appears_in;
        updated = true;
      }
      
      if (updated) {
        stats.updated++;
        console.log(`✅ ${char.name} - Updated with parsed data`);
      } else {
        console.log(`⏭️  ${char.name} - No updates needed (already has data)`);
      }
      
    } catch (error) {
      console.error(`❌ ${char.name} - Error: ${error.message}`);
      stats.failed++;
    }
  }
  
  // Display new values found
  console.log('\n' + '='.repeat(60));
  console.log('📊 Parsing Summary:');
  console.log('='.repeat(60));
  console.log(`Total characters:      ${stats.total}`);
  console.log(`Successfully parsed:   ${stats.parsed}`);
  console.log(`Updated:               ${stats.updated}`);
  console.log(`Failed:                ${stats.failed}`);
  console.log(`No HTML file:          ${stats.noFile}`);
  console.log('='.repeat(60));
  
  if (newSpecies.size > 0) {
    console.log(`\n🆕 New species found (${newSpecies.size}):`);
    console.log(Array.from(newSpecies).sort().join(', '));
  }
  
  if (newHomeworlds.size > 0) {
    console.log(`\n🆕 New homeworlds found (${newHomeworlds.size}):`);
    console.log(Array.from(newHomeworlds).sort().join(', '));
  }
  
  if (newHairColors.size > 0) {
    console.log(`\n🆕 New hair colors found (${newHairColors.size}):`);
    console.log(Array.from(newHairColors).sort().join(', '));
  }
  
  if (newEyeColors.size > 0) {
    console.log(`\n🆕 New eye colors found (${newEyeColors.size}):`);
    console.log(Array.from(newEyeColors).sort().join(', '));
  }
  
  // Add new values to attribute options
  if (newSpecies.size > 0 || newHomeworlds.size > 0 || newHairColors.size > 0 || newEyeColors.size > 0) {
    console.log('\n📝 Updating attribute-options.json with new values...');
    
    if (newSpecies.size > 0) {
      attributeOptions.species.push(...Array.from(newSpecies));
      attributeOptions.species.sort();
    }
    if (newHomeworlds.size > 0) {
      attributeOptions.homeworld.push(...Array.from(newHomeworlds));
      attributeOptions.homeworld.sort();
    }
    if (newHairColors.size > 0) {
      attributeOptions.hairColor.push(...Array.from(newHairColors));
      attributeOptions.hairColor.sort();
    }
    if (newEyeColors.size > 0) {
      attributeOptions.eyeColor.push(...Array.from(newEyeColors));
      attributeOptions.eyeColor.sort();
    }
    
    fs.writeFileSync(ATTRIBUTE_OPTIONS_FILE, JSON.stringify(attributeOptions, null, 2));
    console.log('✅ Updated attribute-options.json');
  }
  
  // Save updated characters
  fs.writeFileSync(CHARACTERS_FILE, JSON.stringify(characters, null, 2));
  console.log('\n✅ Updated characters.json');
  
  console.log('\n🎉 Parsing complete!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
