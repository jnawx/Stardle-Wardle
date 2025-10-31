import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHARACTERS_FILE = path.join(__dirname, '..', 'src', 'data', 'characters.json');
const ATTRIBUTE_OPTIONS_FILE = path.join(__dirname, '..', 'src', 'data', 'attribute-options.json');

console.log('🧹 Cleaning character affiliations...\n');

// Load data
const characters = JSON.parse(fs.readFileSync(CHARACTERS_FILE, 'utf8'));
const attributeOptions = JSON.parse(fs.readFileSync(ATTRIBUTE_OPTIONS_FILE, 'utf8'));

const validAffiliations = new Set(attributeOptions.affiliations);

console.log(`Valid affiliations (${validAffiliations.size}):`);
attributeOptions.affiliations.forEach(a => console.log(`  - ${a}`));
console.log('');

let totalChanges = 0;
let charactersUpdated = 0;

characters.forEach((char, index) => {
  if (!char.affiliations || !Array.isArray(char.affiliations)) {
    return;
  }
  
  const originalAffiliations = [...char.affiliations];
  const cleanedAffiliations = char.affiliations.filter(affiliation => {
    return validAffiliations.has(affiliation);
  });
  
  // Check if any affiliations were removed
  const removed = originalAffiliations.filter(a => !cleanedAffiliations.includes(a));
  
  if (removed.length > 0) {
    charactersUpdated++;
    totalChanges += removed.length;
    
    console.log(`✅ ${char.name}:`);
    console.log(`   Removed: ${removed.join(', ')}`);
    if (cleanedAffiliations.length > 0) {
      console.log(`   Kept: ${cleanedAffiliations.join(', ')}`);
    } else {
      console.log(`   Kept: (none - setting to empty array)`);
    }
    console.log('');
    
    char.affiliations = cleanedAffiliations;
  }
});

// Save updated characters
fs.writeFileSync(CHARACTERS_FILE, JSON.stringify(characters, null, 2));

console.log('\n' + '='.repeat(60));
console.log('📊 Summary:');
console.log('='.repeat(60));
console.log(`Total characters: ${characters.length}`);
console.log(`Characters updated: ${charactersUpdated}`);
console.log(`Total affiliations removed: ${totalChanges}`);
console.log('='.repeat(60));

console.log('\n✅ Characters updated and saved to:', CHARACTERS_FILE);
