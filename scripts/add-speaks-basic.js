import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHARACTERS_FILE = path.join(__dirname, '..', 'src', 'data', 'characters.json');

console.log('➕ Adding "speaksBasic" field to all characters...\n');

// Load characters
const characters = JSON.parse(fs.readFileSync(CHARACTERS_FILE, 'utf8'));

// Characters/species that typically don't speak Basic
const nonBasicSpeakers = [
  'R2-D2',
  'Chewbacca',
  'BB-8',
  'Wicket Wystri Warrick',
  'Salacious B. Crumb',
  'Max Rebo',
  'Sebulba'
];

let added = 0;

characters.forEach((char) => {
  // Add speaksBasic field after forceUser
  // Set to false for known non-speakers, true for others as default
  const speaksBasic = !nonBasicSpeakers.includes(char.name);
  
  // Create new character object with fields in correct order
  const updatedChar = {
    id: char.id,
    name: char.name,
    species: char.species,
    sex: char.sex,
    hairColor: char.hairColor,
    eyeColor: char.eyeColor,
    homeworld: char.homeworld,
    affiliations: char.affiliations,
    eras: char.eras,
    weapons: char.weapons,
    forceUser: char.forceUser,
    speaksBasic: speaksBasic,
    imageUrl: char.imageUrl,
    enabled: char.enabled,
    movieAppearances: char.movieAppearances,
    tvAppearances: char.tvAppearances,
    gameAppearances: char.gameAppearances,
    bookComicAppearances: char.bookComicAppearances
  };
  
  // Add aliases if it exists
  if (char.aliases) {
    updatedChar.aliases = char.aliases;
  }
  
  // Add fandomUrl if it exists
  if (char.fandomUrl) {
    updatedChar.fandomUrl = char.fandomUrl;
  }
  
  // Replace the character in the array
  Object.assign(char, updatedChar);
  
  added++;
  
  if (!speaksBasic) {
    console.log(`✅ ${char.name}: speaksBasic = false`);
  }
});

// Save updated characters
fs.writeFileSync(CHARACTERS_FILE, JSON.stringify(characters, null, 2));

console.log('\n' + '='.repeat(60));
console.log(`✅ Added "speaksBasic" field to ${added} characters`);
console.log('='.repeat(60));
console.log('\n✅ Characters updated and saved to:', CHARACTERS_FILE);
