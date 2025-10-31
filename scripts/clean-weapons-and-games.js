import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHARACTERS_FILE = path.join(__dirname, '..', 'src', 'data', 'characters.json');
const ATTRIBUTE_OPTIONS_FILE = path.join(__dirname, '..', 'src', 'data', 'attribute-options.json');

console.log('🧹 Cleaning weapons and game appearances...\n');

// Load data
const characters = JSON.parse(fs.readFileSync(CHARACTERS_FILE, 'utf8'));
const attributeOptions = JSON.parse(fs.readFileSync(ATTRIBUTE_OPTIONS_FILE, 'utf8'));

const validWeapons = new Set(attributeOptions.weapons);

console.log(`Valid weapons (${validWeapons.size}):`);
attributeOptions.weapons.forEach(w => console.log(`  - ${w}`));
console.log('');

let weaponsChanged = 0;
let gamesChanged = 0;
let charactersUpdated = 0;

characters.forEach((char, index) => {
  let hasChanges = false;
  let weaponsRemoved = false;
  
  // Clean weapons
  if (char.weapons && Array.isArray(char.weapons)) {
    const originalWeapons = [...char.weapons];
    const cleanedWeapons = char.weapons.filter(weapon => {
      return validWeapons.has(weapon);
    });
    
    const removedWeapons = originalWeapons.filter(w => !cleanedWeapons.includes(w));
    
    if (removedWeapons.length > 0) {
      hasChanges = true;
      weaponsRemoved = true;
      weaponsChanged += removedWeapons.length;
      
      console.log(`✅ ${char.name}:`);
      console.log(`   Weapons removed: ${removedWeapons.join(', ')}`);
      if (cleanedWeapons.length > 0) {
        console.log(`   Weapons kept: ${cleanedWeapons.join(', ')}`);
      } else {
        console.log(`   Weapons kept: (none - setting to empty array)`);
      }
      
      char.weapons = cleanedWeapons;
    }
  }
  
  // Remove Galaxy of Heroes from game appearances
  if (char.gameAppearances && Array.isArray(char.gameAppearances)) {
    const originalGames = [...char.gameAppearances];
    const cleanedGames = char.gameAppearances.filter(game => game !== 'Galaxy of Heroes');
    
    if (originalGames.length !== cleanedGames.length) {
      hasChanges = true;
      gamesChanged++;
      
      // If empty after removal, add "None"
      if (cleanedGames.length === 0) {
        cleanedGames.push('None');
      }
      
      if (!weaponsRemoved) {
        console.log(`✅ ${char.name}:`);
      }
      console.log(`   Removed: Galaxy of Heroes`);
      if (cleanedGames.length > 0) {
        console.log(`   Games kept: ${cleanedGames.join(', ')}`);
      }
      
      char.gameAppearances = cleanedGames;
    }
  }
  
  if (hasChanges) {
    charactersUpdated++;
    console.log('');
  }
});

// Save updated characters
fs.writeFileSync(CHARACTERS_FILE, JSON.stringify(characters, null, 2));

console.log('='.repeat(60));
console.log('📊 Summary:');
console.log('='.repeat(60));
console.log(`Total characters: ${characters.length}`);
console.log(`Characters updated: ${charactersUpdated}`);
console.log(`Invalid weapons removed: ${weaponsChanged}`);
console.log(`Characters with Galaxy of Heroes removed: ${gamesChanged}`);
console.log('='.repeat(60));

console.log('\n✅ Characters updated and saved to:', CHARACTERS_FILE);
