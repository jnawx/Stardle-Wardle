/**
 * Script to merge all new characters into characters.json
 * New characters will have null/default values and enabled: false
 * Run with: node scripts/merge-all-characters.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function toKebabCase(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function mergeCharacters() {
  console.log('Merging all Wookieepedia characters into characters.json...\n');
  
  // Load existing characters
  const existingPath = path.join(__dirname, '..', 'src', 'data', 'characters.json');
  const existingCharacters = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
  
  // Set enabled: true for all existing characters
  existingCharacters.forEach(char => {
    if (char.enabled === undefined) {
      char.enabled = true;
    }
  });
  
  console.log(`✅ Loaded ${existingCharacters.length} existing characters`);
  
  // Load all new characters
  const newCharsPath = path.join(__dirname, 'new-characters.json');
  const newCharacters = JSON.parse(fs.readFileSync(newCharsPath, 'utf8'));
  
  console.log(`📥 Loaded ${newCharacters.length} new characters\n`);
  
  // Create character entries with default values
  const formattedNewCharacters = newCharacters.map(char => ({
    id: toKebabCase(char.name),
    name: char.name,
    species: null,
    sex: null,
    hairColor: null,
    eyeColor: null,
    homeworld: null,
    affiliations: [],
    eras: [],
    weapons: [],
    forceUser: false,
    source: [],
    enabled: false,
    imageUrl: null
  }));
  
  // Merge
  const allCharacters = [...existingCharacters, ...formattedNewCharacters];
  
  console.log(`📊 Total characters: ${allCharacters.length}`);
  console.log(`   - Enabled: ${existingCharacters.length}`);
  console.log(`   - Disabled (need data): ${formattedNewCharacters.length}\n`);
  
  // Backup existing file
  const backupPath = path.join(__dirname, '..', 'src', 'data', 'characters.backup.json');
  fs.copyFileSync(existingPath, backupPath);
  console.log(`💾 Backed up existing file to: characters.backup.json\n`);
  
  // Save merged file
  fs.writeFileSync(existingPath, JSON.stringify(allCharacters, null, 2));
  
  console.log(`✅ Successfully merged characters into characters.json\n`);
  console.log('━'.repeat(60));
  console.log('Next step: Run the GUI to enable/disable characters');
  console.log('Command: npm run character-manager');
  console.log('━'.repeat(60));
}

mergeCharacters().catch(console.error);
