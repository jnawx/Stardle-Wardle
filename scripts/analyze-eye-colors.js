import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHARACTERS_FILE = path.join(__dirname, '..', 'src', 'data', 'characters.json');
const ATTRIBUTE_OPTIONS_FILE = path.join(__dirname, '..', 'src', 'data', 'attribute-options.json');

console.log('👁️ Analyzing eye color usage...\n');

// Load data
const characters = JSON.parse(fs.readFileSync(CHARACTERS_FILE, 'utf8'));
const attributeOptions = JSON.parse(fs.readFileSync(ATTRIBUTE_OPTIONS_FILE, 'utf8'));

// Get all unique eye colors currently in use
const eyeColorsInUse = new Set();

characters.forEach(char => {
  if (char.eyeColor && Array.isArray(char.eyeColor)) {
    char.eyeColor.forEach(color => {
      eyeColorsInUse.add(color);
    });
  }
});

console.log('Eye colors currently in use:');
const sortedInUse = Array.from(eyeColorsInUse).sort();
sortedInUse.forEach(color => {
  // Count how many characters have this eye color
  const count = characters.filter(c => 
    c.eyeColor && Array.isArray(c.eyeColor) && c.eyeColor.includes(color)
  ).length;
  console.log(`  ✓ ${color} (${count} character${count !== 1 ? 's' : ''})`);
});

console.log('\nEye colors defined but NOT in use:');
const unusedColors = attributeOptions.eyeColor.filter(color => !eyeColorsInUse.has(color));
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
console.log(`Total eye color options defined: ${attributeOptions.eyeColor.length}`);
console.log(`Eye colors in use: ${eyeColorsInUse.size}`);
console.log(`Unused eye colors: ${unusedColors.length}`);
console.log('='.repeat(60));

if (unusedColors.length > 0) {
  console.log('\n❓ Would you like to remove unused eye colors from attribute-options.json?');
  console.log('   Run this script again with --remove flag to remove them.');
  
  // Check if --remove flag is present
  if (process.argv.includes('--remove')) {
    console.log('\n🗑️ Removing unused eye colors...\n');
    
    attributeOptions.eyeColor = attributeOptions.eyeColor.filter(color => eyeColorsInUse.has(color));
    
    fs.writeFileSync(ATTRIBUTE_OPTIONS_FILE, JSON.stringify(attributeOptions, null, 2));
    
    console.log('✅ Removed unused eye colors from attribute-options.json');
    console.log(`   Eye colors before: ${attributeOptions.eyeColor.length + unusedColors.length}`);
    console.log(`   Eye colors after: ${attributeOptions.eyeColor.length}`);
    console.log(`   Removed: ${unusedColors.join(', ')}`);
  }
} else {
  console.log('\n✅ All defined eye colors are currently in use!');
}
