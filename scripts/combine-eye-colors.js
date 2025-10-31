import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHARACTERS_FILE = path.join(__dirname, '..', 'src', 'data', 'characters.json');
const ATTRIBUTE_OPTIONS_FILE = path.join(__dirname, '..', 'src', 'data', 'attribute-options.json');

console.log('👁️ Combining eye color tags...\n');

// Load data
const characters = JSON.parse(fs.readFileSync(CHARACTERS_FILE, 'utf8'));
const attributeOptions = JSON.parse(fs.readFileSync(ATTRIBUTE_OPTIONS_FILE, 'utf8'));

// Define the mapping
const eyeColorMapping = {
  'Brown': 'Brown/Hazel',
  'Hazel': 'Brown/Hazel',
  'Blue': 'Blue/Green',
  'Green': 'Blue/Green',
  'Yellow': 'Yellow/Red',
  'Orange': 'Yellow/Red',
  'Red': 'Yellow/Red',
  'Silver': 'Gray/White',
  'Gray': 'Gray/White',
  'White': 'Gray/White'
};

// Colors to remove from attribute-options.json
const colorsToRemove = new Set([
  'Brown', 'Hazel', 'Blue', 'Green', 'Yellow', 'Orange', 'Red', 'Silver', 'Gray', 'White'
]);

// New colors to add
const newColors = ['Brown/Hazel', 'Blue/Green', 'Yellow/Red', 'Gray/White'];

console.log('Mapping:');
Object.entries(eyeColorMapping).forEach(([from, to]) => {
  console.log(`  ${from} → ${to}`);
});
console.log('');

let charactersUpdated = 0;
let totalReplacements = 0;

// Update characters
characters.forEach((char) => {
  if (!char.eyeColor || !Array.isArray(char.eyeColor)) {
    return;
  }
  
  const originalEyeColors = [...char.eyeColor];
  const updatedEyeColors = new Set(); // Use Set to avoid duplicates
  
  char.eyeColor.forEach(color => {
    if (eyeColorMapping[color]) {
      updatedEyeColors.add(eyeColorMapping[color]);
    } else {
      updatedEyeColors.add(color);
    }
  });
  
  const newEyeColorArray = Array.from(updatedEyeColors);
  
  // Check if anything changed
  const changed = JSON.stringify(originalEyeColors.sort()) !== JSON.stringify(newEyeColorArray.sort());
  
  if (changed) {
    charactersUpdated++;
    const replacements = originalEyeColors.filter(c => eyeColorMapping[c]);
    totalReplacements += replacements.length;
    
    console.log(`✅ ${char.name}:`);
    console.log(`   Before: ${originalEyeColors.join(', ')}`);
    console.log(`   After:  ${newEyeColorArray.join(', ')}`);
    console.log('');
    
    char.eyeColor = newEyeColorArray;
  }
});

// Update attribute options
const originalEyeColors = [...attributeOptions.eyeColor];
const updatedEyeColors = attributeOptions.eyeColor.filter(color => !colorsToRemove.has(color));

// Add new combined colors at the beginning (after "Black" colors)
const blackColors = updatedEyeColors.filter(c => c.startsWith('Black'));
const otherColors = updatedEyeColors.filter(c => !c.startsWith('Black'));

attributeOptions.eyeColor = [
  ...blackColors,
  ...newColors,
  ...otherColors
].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates

// Save both files
fs.writeFileSync(CHARACTERS_FILE, JSON.stringify(characters, null, 2));
fs.writeFileSync(ATTRIBUTE_OPTIONS_FILE, JSON.stringify(attributeOptions, null, 2));

console.log('='.repeat(60));
console.log('📊 Summary:');
console.log('='.repeat(60));
console.log(`Total characters: ${characters.length}`);
console.log(`Characters updated: ${charactersUpdated}`);
console.log(`Total eye color replacements: ${totalReplacements}`);
console.log('');
console.log('Attribute Options Changes:');
console.log(`  Removed: ${Array.from(colorsToRemove).join(', ')}`);
console.log(`  Added: ${newColors.join(', ')}`);
console.log(`  Eye colors before: ${originalEyeColors.length}`);
console.log(`  Eye colors after: ${attributeOptions.eyeColor.length}`);
console.log('='.repeat(60));

console.log('\n✅ Characters updated and saved to:', CHARACTERS_FILE);
console.log('✅ Attribute options updated and saved to:', ATTRIBUTE_OPTIONS_FILE);
