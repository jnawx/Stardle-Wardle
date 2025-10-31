import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHARACTERS_FILE = path.join(__dirname, '..', 'src', 'data', 'characters.json');
const ATTRIBUTE_OPTIONS_FILE = path.join(__dirname, '..', 'src', 'data', 'attribute-options.json');

console.log('💇 Consolidating hair colors...\n');

// Load data
const characters = JSON.parse(fs.readFileSync(CHARACTERS_FILE, 'utf8'));
const attributeOptions = JSON.parse(fs.readFileSync(ATTRIBUTE_OPTIONS_FILE, 'utf8'));

// Define consolidation mapping
const consolidationMapping = {
  'Blond': 'Blonde',           // Standardize to Blonde
  'Blue-black': 'Black',       // Very dark black -> Black
  'Auburn': 'Red',             // Reddish-brown -> Red
  'Pastel purple': 'White',    // Very light color -> White
  'N/A': 'None'                // Standardize to None
};

console.log('Current hair colors in use:');
const hairColorsInUse = new Set();
characters.forEach(char => {
  if (char.hairColor) {
    hairColorsInUse.add(char.hairColor);
  }
});

Array.from(hairColorsInUse).sort().forEach(color => {
  const count = characters.filter(c => c.hairColor === color).length;
  console.log(`  ${color} (${count} character${count !== 1 ? 's' : ''})`);
});

console.log('\n' + '='.repeat(60));
console.log('Proposed consolidations:');
console.log('='.repeat(60));
Object.entries(consolidationMapping).forEach(([from, to]) => {
  const count = characters.filter(c => c.hairColor === from).length;
  console.log(`  ${from} (${count} character${count !== 1 ? 's' : ''}) → ${to}`);
});

console.log('\n' + '='.repeat(60));
console.log('Final hair color categories would be:');
console.log('='.repeat(60));
console.log('  • Black');
console.log('  • Blonde');
console.log('  • Brown');
console.log('  • Gray');
console.log('  • Red');
console.log('  • White');
console.log('  • None');
console.log('\nTotal: 7 options (down from 11)');
console.log('='.repeat(60));

// Check if --consolidate flag is present
if (process.argv.includes('--consolidate')) {
  console.log('\n🔄 Applying consolidations...\n');
  
  let charactersUpdated = 0;
  
  characters.forEach((char) => {
    if (!char.hairColor) {
      return;
    }
    
    const originalHairColor = char.hairColor;
    
    if (consolidationMapping[originalHairColor]) {
      char.hairColor = consolidationMapping[originalHairColor];
      charactersUpdated++;
      console.log(`✅ ${char.name}: ${originalHairColor} → ${char.hairColor}`);
    }
  });
  
  // Update attribute options
  const finalHairColors = [
    'Black',
    'Blonde',
    'Brown',
    'Gray',
    'Red',
    'White',
    'None'
  ];
  
  attributeOptions.hairColor = finalHairColors;
  
  // Save both files
  fs.writeFileSync(CHARACTERS_FILE, JSON.stringify(characters, null, 2));
  fs.writeFileSync(ATTRIBUTE_OPTIONS_FILE, JSON.stringify(attributeOptions, null, 2));
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Consolidation complete!');
  console.log('='.repeat(60));
  console.log(`Characters updated: ${charactersUpdated}`);
  console.log(`Hair color options: 11 → 7`);
  console.log(`Removed: ${Object.keys(consolidationMapping).join(', ')}`);
  console.log('='.repeat(60));
} else {
  console.log('\n❓ Run with --consolidate flag to apply these changes.');
}
