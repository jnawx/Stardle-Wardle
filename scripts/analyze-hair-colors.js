import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHARACTERS_FILE = path.join(__dirname, '..', 'src', 'data', 'characters.json');
const ATTRIBUTE_OPTIONS_FILE = path.join(__dirname, '..', 'src', 'data', 'attribute-options.json');

console.log('💇 Analyzing hair color usage...\n');

// Load data
const characters = JSON.parse(fs.readFileSync(CHARACTERS_FILE, 'utf8'));
const attributeOptions = JSON.parse(fs.readFileSync(ATTRIBUTE_OPTIONS_FILE, 'utf8'));

// Get all unique hair colors currently in use
const hairColorsInUse = new Set();

characters.forEach(char => {
  if (char.hairColor) {
    hairColorsInUse.add(char.hairColor);
  }
});

console.log('Hair colors currently in use:');
const sortedInUse = Array.from(hairColorsInUse).sort();
sortedInUse.forEach(color => {
  // Count how many characters have this hair color
  const count = characters.filter(c => c.hairColor === color).length;
  console.log(`  ✓ ${color} (${count} character${count !== 1 ? 's' : ''})`);
});

console.log('\nHair colors defined but NOT in use:');
const unusedColors = attributeOptions.hairColor.filter(color => !hairColorsInUse.has(color));
if (unusedColors.length === 0) {
  console.log('  (none - all defined colors are in use)');
} else {
  unusedColors.forEach(color => {
    console.log(`  ✗ ${color}`);
  });
}

console.log('\n' + '='.repeat(60));
console.log('Summary:');
console.log('='.repeat(60));
console.log(`Total hair color options defined: ${attributeOptions.hairColor.length}`);
console.log(`Hair colors in use: ${hairColorsInUse.size}`);
console.log(`Unused hair colors: ${unusedColors.length}`);
console.log('='.repeat(60));

if (unusedColors.length > 0) {
  console.log('\n❓ Would you like to remove unused hair colors from attribute-options.json?');
  console.log('   Run this script again with --remove flag to remove them.');
  
  // Check if --remove flag is present
  if (process.argv.includes('--remove')) {
    console.log('\n🗑️ Removing unused hair colors...\n');
    
    attributeOptions.hairColor = attributeOptions.hairColor.filter(color => hairColorsInUse.has(color));
    
    fs.writeFileSync(ATTRIBUTE_OPTIONS_FILE, JSON.stringify(attributeOptions, null, 2));
    
    console.log('✅ Removed unused hair colors from attribute-options.json');
    console.log(`   Hair colors before: ${attributeOptions.hairColor.length + unusedColors.length}`);
    console.log(`   Hair colors after: ${attributeOptions.hairColor.length}`);
    console.log(`   Removed: ${unusedColors.join(', ')}`);
  }
} else {
  console.log('\n✅ All defined hair colors are currently in use!');
}
