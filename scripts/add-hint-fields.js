import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHARACTERS_FILE = path.join(__dirname, '..', 'src', 'data', 'characters.json');

console.log('💬 Adding Quote Hint and Master Hint fields...\n');

// Load data
const characters = JSON.parse(fs.readFileSync(CHARACTERS_FILE, 'utf8'));

let updated = 0;

characters.forEach((char, index) => {
  // Check if fields already exist
  const hasQuoteHint = 'quoteHint' in char;
  const hasMasterHint = 'masterHint' in char;
  
  if (!hasQuoteHint || !hasMasterHint) {
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
      speaksBasic: char.speaksBasic,
      quoteHint: char.quoteHint || null,
      masterHint: char.masterHint || null,
      imageUrl: char.imageUrl,
      enabled: char.enabled,
      movieAppearances: char.movieAppearances,
      tvAppearances: char.tvAppearances,
      gameAppearances: char.gameAppearances,
      bookComicAppearances: char.bookComicAppearances
    };
    
    // Add optional fields if they exist
    if (char.aliases) {
      updatedChar.aliases = char.aliases;
    }
    if (char.fandomUrl) {
      updatedChar.fandomUrl = char.fandomUrl;
    }
    
    // Replace the character in the array
    characters[index] = updatedChar;
    updated++;
  }
});

// Save updated characters
fs.writeFileSync(CHARACTERS_FILE, JSON.stringify(characters, null, 2));

console.log('='.repeat(60));
console.log('✅ Added hint fields to all characters');
console.log('='.repeat(60));
console.log(`Total characters: ${characters.length}`);
console.log(`Characters updated: ${updated}`);
console.log('\nFields added:');
console.log('  • quoteHint (null by default)');
console.log('  • masterHint (null by default)');
console.log('='.repeat(60));

console.log('\n✅ Characters updated and saved to:', CHARACTERS_FILE);
