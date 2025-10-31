import fs from 'fs';

console.log('📝 Adding media appearance fields to all characters...\n');

// Load characters
const characters = JSON.parse(fs.readFileSync('./src/data/characters.json', 'utf8'));

let updated = 0;

characters.forEach(char => {
  // Skip if character doesn't have a name (incomplete entry)
  if (!char.name) {
    return;
  }
  
  // Add fields if they don't exist
  let changed = false;
  
  if (!char.movieAppearances) {
    char.movieAppearances = [];
    changed = true;
  }
  
  if (!char.tvAppearances) {
    char.tvAppearances = [];
    changed = true;
  }
  
  if (!char.gameAppearances) {
    char.gameAppearances = [];
    changed = true;
  }
  
  if (!char.bookComicAppearances) {
    char.bookComicAppearances = [];
    changed = true;
  }
  
  if (changed) {
    updated++;
    console.log(`✅ ${char.name} - Added media appearance fields`);
  } else {
    console.log(`⏭️  ${char.name} - Already has media appearance fields`);
  }
});

// Save updated characters
fs.writeFileSync('./src/data/characters.json', JSON.stringify(characters, null, 2));

console.log(`\n✅ Updated ${updated} characters with media appearance fields`);
console.log('📊 All characters now have: movieAppearances, tvAppearances, gameAppearances, bookComicAppearances');
