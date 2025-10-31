import fs from 'fs';
import path from 'path';

const cacheDir = './fandom-cache';
const files = fs.readdirSync(cacheDir).filter(f => f.endsWith('.html'));

const sources = new Set();

console.log('� Extracting media sources from HTML files...\n');

// Define explicit media titles we know
const knownMovies = new Set([
  'Star Wars: Episode I The Phantom Menace',
  'Star Wars: Episode II Attack of the Clones', 
  'Star Wars: Episode III Revenge of the Sith',
  'Star Wars: Episode IV A New Hope',
  'Star Wars: Episode V The Empire Strikes Back',
  'Star Wars: Episode VI Return of the Jedi',
  'Star Wars: Episode VII The Force Awakens',
  'Star Wars: Episode VIII The Last Jedi',
  'Star Wars: Episode IX The Rise of Skywalker',
  'Rogue One: A Star Wars Story',
  'Solo: A Star Wars Story'
]);

const knownTV = new Set([
  'Star Wars: The Clone Wars',
  'Star Wars Rebels',
  'The Mandalorian',
  'The Book of Boba Fett',
  'Obi-Wan Kenobi',
  'Andor',
  'Ahsoka',
  'Tales of the Jedi',
  'Tales of the Empire',
  'Star Wars: The Bad Batch',
  'Star Wars Resistance',
  'Star Wars: Visions',
  'Star Wars: Young Jedi Adventures',
  'Star Wars: Forces of Destiny',
  'The Acolyte'
]);

const knownGames = new Set([
  'Star Wars Battlefront',
  'Star Wars Battlefront II',
  'Star Wars Jedi: Fallen Order',
  'Star Wars Jedi: Survivor',
  'Star Wars: Knights of the Old Republic',
  'Star Wars: The Old Republic',
  'Star Wars: Squadrons',
  'Star Wars: Galaxy of Heroes',
  'Star Wars: Commander',
  'Star Wars: Republic Commando'
]);

files.forEach((file, index) => {
  const html = fs.readFileSync(path.join(cacheDir, file), 'utf-8');
  
  // Extract all text content from list items
  const listMatches = html.matchAll(/<li[^>]*>(.*?)<\/li>/gi);
  
  for (const match of listMatches) {
    let text = match[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&#91;/g, '[')
      .replace(/&#93;/g, ']')
      .replace(/&amp;/g, '&')
      .replace(/&#32;/g, ' ')
      .replace(/&#8212;/g, '')
      .replace(/&#124;/g, '|')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Skip episode guides and metadata
    if (text.includes('Episode Guide') || 
        text.includes('StarWars.com') ||
        text.includes('Databank') ||
        text.length < 5 ||
        text.length > 200) {
      continue;
    }
    
    // Look for actual media titles
    if (text.startsWith('Star Wars') || 
        text.includes('novel') ||
        text.includes('comic')) {
      
      // Clean up
      text = text.split('[')[0].trim();
      text = text.split('')[0].trim();
      
      if (text.length > 10) {
        sources.add(text);
      }
    }
  }
  
  if ((index + 1) % 20 === 0) {
    console.log(`Processed ${index + 1}/${files.length} files...`);
  }
});

// Add known titles
knownMovies.forEach(m => sources.add(m));
knownTV.forEach(t => sources.add(t));
knownGames.forEach(g => sources.add(g));

console.log(`\n Found ${sources.size} unique sources\n`);
console.log(' Categorizing sources...\n');

const categorized = {
  movies: new Set(),
  tv: new Set(), 
  games: new Set(),
  'books/comics': new Set()
};

sources.forEach(source => {
  const lower = source.toLowerCase();
  
  // Check against known lists first
  if (Array.from(knownMovies).some(m => source.includes(m) || m.includes(source))) {
    categorized.movies.add(source);
  } else if (Array.from(knownTV).some(t => source.includes(t) || t.includes(source))) {
    categorized.tv.add(source);
  } else if (Array.from(knownGames).some(g => source.includes(g) || g.includes(source))) {
    categorized.games.add(source);
  } else if (lower.includes('novel') || lower.includes('comic') || lower.includes('book')) {
    categorized['books/comics'].add(source);
  }
});

// Build output
let output = '';

output += '='.repeat(80) + '\n';
output += 'STAR WARS MEDIA SOURCES\n';
output += 'Extracted from Fandom HTML cache\n';
output += '='.repeat(80) + '\n\n';

Object.entries(categorized).forEach(([category, items]) => {
  if (items.size > 0) {
    output += `\n${'='.repeat(80)}\n`;
    output += `${category.toUpperCase()} (${items.size})\n`;
    output += '='.repeat(80) + '\n';
    
    Array.from(items).sort().forEach(item => {
      output += `${item}\n`;
    });
  }
});

output += `\n${'='.repeat(80)}\n`;
output += `SUMMARY\n`;
output += '='.repeat(80) + '\n';
output += `Movies: ${categorized.movies.size}\n`;
output += `TV Shows: ${categorized.tv.size}\n`;
output += `Games: ${categorized.games.size}\n`;
output += `Books/Comics: ${categorized['books/comics'].size}\n`;
output += `Total: ${Array.from(categorized.movies).length + Array.from(categorized.tv).length + Array.from(categorized.games).length + Array.from(categorized['books/comics']).length}\n`;

fs.writeFileSync('sources.txt', output);

console.log(' Summary:');
console.log(`  Movies: ${categorized.movies.size}`);
console.log(`  TV Shows: ${categorized.tv.size}`);
console.log(`  Games: ${categorized.games.size}`);
console.log(`  Books/Comics: ${categorized['books/comics'].size}`);
console.log(`  Total: ${Array.from(categorized.movies).length + Array.from(categorized.tv).length + Array.from(categorized.games).length + Array.from(categorized['books/comics']).length}`);
console.log('\n Written to sources.txt');
