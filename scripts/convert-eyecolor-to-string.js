import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertEyeColorToString() {
  console.log('🔄 Converting eyeColor from array to string...\n');

  // Read the characters file
  const charactersPath = path.join(__dirname, '../src/data/characters.json');
  const data = await fs.readFile(charactersPath, 'utf8');
  const characters = JSON.parse(data);

  let updated = 0;

  // Convert each character's eyeColor from array to string
  characters.forEach(char => {
    if (Array.isArray(char.eyeColor)) {
      // Take the first value if it's an array
      const originalValue = char.eyeColor;
      char.eyeColor = char.eyeColor[0] || 'Unknown';
      console.log(`✅ ${char.name}: [${originalValue.join(', ')}] → "${char.eyeColor}"`);
      updated++;
    }
  });

  // Save the updated data
  await fs.writeFile(charactersPath, JSON.stringify(characters, null, 2), 'utf8');

  console.log('\n============================================================');
  console.log('✅ Eye color conversion complete!');
  console.log('============================================================');
  console.log(`Total characters: ${characters.length}`);
  console.log(`Updated: ${updated}`);
  console.log('============================================================\n');
  console.log(`✅ Characters updated and saved to: ${charactersPath}\n`);
}

convertEyeColorToString().catch(console.error);
