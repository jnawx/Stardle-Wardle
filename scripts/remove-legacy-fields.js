import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const charactersPath = path.join(__dirname, '../src/data/characters.json');
const attributeOptionsPath = path.join(__dirname, '../src/data/attribute-options.json');

console.log('🗑️  Removing legacy fields: "source" and "appears_in"...\n');

// Update characters.json
const characters = JSON.parse(fs.readFileSync(charactersPath, 'utf8'));
let removedCount = 0;

characters.forEach(char => {
  if ('source' in char) {
    delete char.source;
    removedCount++;
  }
  if ('appears_in' in char) {
    delete char.appears_in;
  }
});

fs.writeFileSync(charactersPath, JSON.stringify(characters, null, 2));
console.log(`✅ Removed "source" and "appears_in" from ${removedCount} characters`);

// Update attribute-options.json
const attributeOptions = JSON.parse(fs.readFileSync(attributeOptionsPath, 'utf8'));
let optionsRemoved = [];

if ('source' in attributeOptions) {
  delete attributeOptions.source;
  optionsRemoved.push('source');
}
if ('appears_in' in attributeOptions) {
  delete attributeOptions.appears_in;
  optionsRemoved.push('appears_in');
}

fs.writeFileSync(attributeOptionsPath, JSON.stringify(attributeOptions, null, 2));
console.log(`✅ Removed ${optionsRemoved.join(', ')} from attribute-options.json`);

console.log('\n🎉 Legacy fields removed successfully!');
