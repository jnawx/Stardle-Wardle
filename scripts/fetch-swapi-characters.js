/**
 * Script to fetch all characters from SWAPI and format them for characters.json
 * Run with: node scripts/fetch-swapi-characters.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to fetch all pages from SWAPI
async function fetchAllCharacters() {
  const allCharacters = [];
  let nextUrl = 'https://swapi.dev/api/people/';
  
  while (nextUrl) {
    console.log(`Fetching: ${nextUrl}`);
    const response = await fetch(nextUrl);
    const data = await response.json();
    
    allCharacters.push(...data.results);
    nextUrl = data.next;
    
    // Be nice to the API
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return allCharacters;
}

// Helper to fetch homeworld name
async function fetchHomeworldName(url) {
  if (!url) return 'Unknown';
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.name;
  } catch (error) {
    console.error(`Error fetching homeworld: ${url}`, error);
    return 'Unknown';
  }
}

// Helper to fetch species name
async function fetchSpeciesName(url) {
  if (!url) return 'Human';
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.name;
  } catch (error) {
    console.error(`Error fetching species: ${url}`, error);
    return 'Unknown';
  }
}

// Map film URLs to eras
function getEras(films) {
  const eras = new Set();
  
  films.forEach(filmUrl => {
    const filmId = filmUrl.match(/\/films\/(\d+)\//)?.[1];
    if (!filmId) return;
    
    const id = parseInt(filmId);
    // 1-3: Original Trilogy, 4-6: Prequel Trilogy, 7: Sequel Trilogy
    if ([4, 5, 6].includes(id)) {
      eras.add('Original');
    } else if ([1, 2, 3].includes(id)) {
      eras.add('Prequel');
    } else if (id === 7) {
      eras.add('Sequel');
    }
  });
  
  return Array.from(eras);
}

// Determine affiliations based on character name and era
function guessAffiliations(name, eras) {
  const nameLower = name.toLowerCase();
  
  // Droids
  if (nameLower.includes('r2-d2') || nameLower.includes('c-3po')) {
    return ['Rebel Alliance', 'Resistance'];
  }
  
  // Empire
  if (nameLower.includes('vader') || nameLower.includes('tarkin') || 
      nameLower.includes('palpatine') || nameLower.includes('imperial')) {
    return ['Empire', 'Sith'];
  }
  
  // Rebels
  if (nameLower.includes('organa') || nameLower.includes('solo') || 
      nameLower.includes('skywalker') || nameLower.includes('antilles')) {
    return ['Rebel Alliance'];
  }
  
  // Jedi
  if (nameLower.includes('kenobi') || nameLower.includes('yoda') || 
      nameLower.includes('windu') || nameLower.includes('qui-gon')) {
    return ['Jedi', 'Republic'];
  }
  
  // Default based on era
  if (eras.includes('Prequel')) {
    return ['Republic'];
  } else if (eras.includes('Original')) {
    return ['Rebel Alliance'];
  } else if (eras.includes('Sequel')) {
    return ['Resistance'];
  }
  
  return ['Unknown'];
}

// Guess weapons based on character type
function guessWeapons(name, species) {
  const nameLower = name.toLowerCase();
  
  // Droids typically have none
  if (species === 'Droid') {
    return ['None'];
  }
  
  // Jedi/Sith
  if (nameLower.includes('skywalker') || nameLower.includes('vader') || 
      nameLower.includes('kenobi') || nameLower.includes('yoda') || 
      nameLower.includes('windu') || nameLower.includes('qui-gon') ||
      nameLower.includes('maul') || nameLower.includes('dooku')) {
    return ['Lightsaber'];
  }
  
  // Bounty hunters
  if (nameLower.includes('fett') || nameLower.includes('greedo')) {
    return ['Blaster'];
  }
  
  // Default
  return ['Blaster'];
}

// Check if character is a Force user
function isForceUser(name) {
  const nameLower = name.toLowerCase();
  const forceUsers = [
    'skywalker', 'vader', 'kenobi', 'yoda', 'palpatine', 
    'windu', 'qui-gon', 'maul', 'dooku', 'sidious'
  ];
  
  return forceUsers.some(user => nameLower.includes(user));
}

// Convert to kebab-case ID
function toKebabCase(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Format character for our schema
async function formatCharacter(swapiChar, index) {
  console.log(`Processing ${index + 1}: ${swapiChar.name}...`);
  
  const homeworld = await fetchHomeworldName(swapiChar.homeworld);
  const species = swapiChar.species.length > 0 
    ? await fetchSpeciesName(swapiChar.species[0]) 
    : 'Human';
  
  const eras = getEras(swapiChar.films);
  
  // Be nice to the API
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    id: toKebabCase(swapiChar.name),
    name: swapiChar.name,
    species: species,
    sex: swapiChar.gender === 'male' ? 'Male' : 
         swapiChar.gender === 'female' ? 'Female' : 
         swapiChar.gender === 'hermaphroditic' ? 'Hermaphrodite' : 'N/A',
    hairColor: swapiChar.hair_color === 'n/a' ? 'N/A' : 
               swapiChar.hair_color.split(',')[0].trim().charAt(0).toUpperCase() + 
               swapiChar.hair_color.split(',')[0].trim().slice(1),
    eyeColor: swapiChar.eye_color === 'n/a' ? 'N/A' : 
              swapiChar.eye_color.split(',')[0].trim().charAt(0).toUpperCase() + 
              swapiChar.eye_color.split(',')[0].trim().slice(1),
    homeworld: homeworld,
    affiliations: guessAffiliations(swapiChar.name, eras),
    eras: eras.length > 0 ? eras : ['Original'],
    weapons: guessWeapons(swapiChar.name, species),
    forceUser: isForceUser(swapiChar.name),
    source: ['movies'],
    imageUrl: `https://static.wikia.nocookie.net/starwars/images/PLACEHOLDER/${toKebabCase(swapiChar.name)}.png`
  };
}

// Main function
async function main() {
  console.log('Fetching all characters from SWAPI...\n');
  
  const swapiCharacters = await fetchAllCharacters();
  console.log(`\nFound ${swapiCharacters.count} characters total`);
  console.log(`Fetched ${swapiCharacters.length} characters\n`);
  
  console.log('Processing characters...\n');
  const formattedCharacters = [];
  
  for (let i = 0; i < swapiCharacters.length; i++) {
    const formatted = await formatCharacter(swapiCharacters[i], i);
    formattedCharacters.push(formatted);
  }
  
  // Load existing characters
  const existingPath = path.join(__dirname, '..', 'src', 'data', 'characters.json');
  const existingCharacters = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
  
  // Filter out duplicates (by ID)
  const existingIds = new Set(existingCharacters.map(c => c.id));
  const newCharacters = formattedCharacters.filter(c => !existingIds.has(c.id));
  
  console.log(`\n✅ Processed ${formattedCharacters.length} characters`);
  console.log(`📝 ${existingCharacters.length} already exist`);
  console.log(`🆕 ${newCharacters.length} new characters to add\n`);
  
  // Save to file
  const outputPath = path.join(__dirname, 'swapi-characters-new.json');
  fs.writeFileSync(outputPath, JSON.stringify(newCharacters, null, 2));
  
  console.log(`✨ Saved new characters to: ${outputPath}\n`);
  console.log('⚠️  NOTE: Image URLs are placeholders and need to be updated manually!');
  console.log('Review the file and merge into src/data/characters.json when ready.');
}

main().catch(console.error);
