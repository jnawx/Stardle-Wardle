import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHARACTERS_FILE = path.join(__dirname, '..', 'src', 'data', 'characters.json');
const ATTRIBUTE_OPTIONS_FILE = path.join(__dirname, '..', 'src', 'data', 'attribute-options.json');

console.log('👁️ Further consolidating eye colors...\n');

// Load data
const characters = JSON.parse(fs.readFileSync(CHARACTERS_FILE, 'utf8'));
const attributeOptions = JSON.parse(fs.readFileSync(ATTRIBUTE_OPTIONS_FILE, 'utf8'));

// Define consolidation mapping for rare colors
const consolidationMapping = {
  'BluePurple': 'Blue/Green',      // Purple tint -> Blue/Green
  'BrownGold': 'Brown/Hazel',      // Gold tint -> Brown/Hazel
  'Gray-blue': 'Blue/Green',       // Gray-blue -> Blue/Green
  'Red-gold': 'Yellow/Red',        // Red with gold -> Yellow/Red
  'Indigo': 'Blue/Green',          // Indigo (blue-purple) -> Blue/Green
  'Gold': 'Yellow/Red'             // Gold -> Yellow/Red
};

console.log('Proposed consolidations:');
Object.entries(consolidationMapping).forEach(([from, to]) => {
  // Count how many characters have this eye color
  const count = characters.filter(c => 
    c.eyeColor && Array.isArray(c.eyeColor) && c.eyeColor.includes(from)
  ).length;
  console.log(`  ${from} (${count} character${count !== 1 ? 's' : ''}) → ${to}`);
});

console.log('\nFinal eye color categories would be:');
console.log('  • Black');
console.log('  • Black with white irises');
console.log('  • Brown/Hazel');
console.log('  • Blue/Green');
console.log('  • Yellow/Red');
console.log('  • Gray/White');
console.log('  • None');
console.log('\nTotal: 7 options (down from 13)');

// Check if --consolidate flag is present
if (process.argv.includes('--consolidate')) {
  console.log('\n🔄 Applying consolidations...\n');
  
  let charactersUpdated = 0;
  
  characters.forEach((char) => {
    if (!char.eyeColor || !Array.isArray(char.eyeColor)) {
      return;
    }
    
    const originalEyeColors = [...char.eyeColor];
    const updatedEyeColors = new Set();
    
    char.eyeColor.forEach(color => {
      if (consolidationMapping[color]) {
        updatedEyeColors.add(consolidationMapping[color]);
      } else {
        updatedEyeColors.add(color);
      }
    });
    
    const newEyeColorArray = Array.from(updatedEyeColors);
    
    // Check if anything changed
    const changed = JSON.stringify(originalEyeColors.sort()) !== JSON.stringify(newEyeColorArray.sort());
    
    if (changed) {
      charactersUpdated++;
      console.log(`✅ ${char.name}: ${originalEyeColors.join(', ')} → ${newEyeColorArray.join(', ')}`);
      char.eyeColor = newEyeColorArray;
    }
  });
  
  // Update attribute options - keep only the consolidated colors
  const finalEyeColors = [
    'Black',
    'Black with white irises',
    'Brown/Hazel',
    'Blue/Green',
    'Yellow/Red',
    'Gray/White',
    'None'
  ];
  
  attributeOptions.eyeColor = finalEyeColors;
  
  // Save both files
  fs.writeFileSync(CHARACTERS_FILE, JSON.stringify(characters, null, 2));
  fs.writeFileSync(ATTRIBUTE_OPTIONS_FILE, JSON.stringify(attributeOptions, null, 2));
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Consolidation complete!');
  console.log('='.repeat(60));
  console.log(`Characters updated: ${charactersUpdated}`);
  console.log(`Eye color options: 13 → 7`);
  console.log(`Removed: BluePurple, BrownGold, Gray-blue, Red-gold, Indigo, Gold`);
  console.log('='.repeat(60));
} else {
  console.log('\n❓ Run with --consolidate flag to apply these changes.');
}
