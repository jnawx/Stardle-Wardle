import fs from 'fs';

const charactersFile = './src/data/characters.json';
const characters = JSON.parse(fs.readFileSync(charactersFile, 'utf8'));

console.log('🧹 Cleaning character data...\n');

let cleaned = 0;

characters.forEach(char => {
  let charCleaned = false;
  
  // Clean species
  if (char.species && typeof char.species === 'string') {
    const original = char.species;
    char.species = char.species
      .replace(/^(Species|Homeworld|Gender|Eye color|Hair color|Affiliation)\s+/gi, '')
      .trim();
    if (char.species !== original) charCleaned = true;
  }
  
  // Clean homeworld
  if (char.homeworld && typeof char.homeworld === 'string') {
    const original = char.homeworld;
    char.homeworld = char.homeworld
      .replace(/^(Species|Homeworld|Gender|Eye color|Hair color|Affiliation)\s+/gi, '')
      .trim();
    if (char.homeworld !== original) charCleaned = true;
  }
  
  // Clean hair color
  if (char.hairColor && typeof char.hairColor === 'string') {
    const original = char.hairColor;
    char.hairColor = char.hairColor
      .replace(/^(Species|Homeworld|Gender|Eye color|Hair color|Affiliation)\s+/gi, '')
      .trim();
    if (char.hairColor !== original) charCleaned = true;
  }
  
  // Clean eye colors (array)
  if (Array.isArray(char.eyeColor)) {
    const original = JSON.stringify(char.eyeColor);
    char.eyeColor = char.eyeColor
      .map(e => e
        .replace(/^(Species|Homeworld|Gender|Eye color|Hair color|Affiliation)\s+/gi, '')
        .replace(/\([^)]*\)/g, '')
        .trim()
      )
      .filter(e => e && e.length > 0 && e.length < 30 && !e.match(/briefly|later|under|restored|natural|dark side/i));
    if (JSON.stringify(char.eyeColor) !== original) charCleaned = true;
  }
  
  // Fix affiliations that got over-split
  if (Array.isArray(char.affiliations)) {
    const original = JSON.stringify(char.affiliations);
    // Remove very short fragments and clean prefixes
    char.affiliations = char.affiliations
      .map(a => a
        .replace(/^(Species|Homeworld|Gender|Eye color|Hair color|Affiliation)\s+/gi, '')
        .trim()
      )
      .filter(a => a.length > 3); // Remove fragments like "Non-", "The", etc.
    
    // Try to rejoin split affiliations
    const rejoined = [];
    let i = 0;
    while (i < char.affiliations.length) {
      let current = char.affiliations[i];
      
      // If current ends with incomplete word, try to join with next
      if (i < char.affiliations.length - 1) {
        const next = char.affiliations[i + 1];
        // Check if they should be joined (current ends with hyphen, is short, etc.)
        if (current.endsWith('-') || current.length < 10) {
          current = current + ' ' + next;
          i++; // Skip next item
        }
      }
      
      rejoined.push(current);
      i++;
    }
    
    char.affiliations = rejoined;
    
    if (JSON.stringify(char.affiliations) !== original) charCleaned = true;
  }
  
  if (charCleaned) {
    cleaned++;
    console.log(`✅ Cleaned: ${char.name}`);
  }
});

fs.writeFileSync(charactersFile, JSON.stringify(characters, null, 2));

console.log(`\n🎉 Cleaned ${cleaned} characters`);
console.log('✅ Saved to characters.json');
