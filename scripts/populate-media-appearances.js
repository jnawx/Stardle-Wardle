import fs from 'fs';
import path from 'path';

console.log('🎬 Populating character media appearances from HTML files...\n');

// Load data
const characters = JSON.parse(fs.readFileSync('./src/data/characters.json', 'utf8'));
const attributeOptions = JSON.parse(fs.readFileSync('./src/data/attribute-options.json', 'utf8'));
const cacheDir = './fandom-cache';

// Build lookup maps for matching
const movieTitles = new Set(attributeOptions.movieAppearances);
const tvTitles = new Set(attributeOptions.tvAppearances);
const gameTitles = new Set(attributeOptions.gameAppearances);

// Helper to clean media titles from HTML text
function cleanMediaTitle(text) {
  let cleaned = text
    .replace(/Star Wars:\s*/i, '')
    .replace(/Star Wars\s+/i, '')
    .replace(/Episode\s+[IVX]+:?\s*/i, '')
    .replace(/\([^)]*\)/g, '') // Remove parenthetical info
    .trim();
  
  // For titles with em-dash or en-dash followed by episode/chapter names,
  // keep only the series name (before the dash)
  // Match pattern: "Series—Episode Name" or "Series – Episode Name"
  if (cleaned.match(/^[^—–]+[—–].+$/)) {
    cleaned = cleaned.replace(/\s*[—–].*$/, '').trim();
  }
  
  return cleaned;
}

// Check if a cleaned title matches any of our known titles
function matchToKnownTitle(cleanedText, titleSet) {
  // Direct match (case-sensitive)
  if (titleSet.has(cleanedText)) {
    return cleanedText;
  }
  
  // Direct match (case-insensitive)
  const lowerText = cleanedText.toLowerCase();
  for (const title of titleSet) {
    if (lowerText === title.toLowerCase()) {
      return title;
    }
  }
  
    // Check if cleaned text contains the full title as a word
    // Use word boundary matching to avoid partial matches
    for (const title of titleSet) {
      // Create a regex that matches the title as a whole word
      const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wordBoundaryRegex = new RegExp(`\\b${escapedTitle}\\b`, 'i');
      
      if (wordBoundaryRegex.test(cleanedText)) {
        return title;
      }
    }
    
    return null;
  }// Parse media appearances from HTML - looks for the "Appearances" section specifically
function parseMediaAppearances(html) {
  const appearances = {
    movies: new Set(),
    tv: new Set(),
    games: new Set(),
    books: new Set()
  };
  
  // Find the Appearances section (both the canonical "Appearances" and "Non-canon appearances")
  // Look for heading with "Appearances" in a span, followed by content until the next heading
  const appearancesMatch = html.match(/<h[23][^>]*>.*?id="Appearances".*?<\/h[23]>([\s\S]*?)(?=<h[23]|$)/i);
  
  if (!appearancesMatch) {
    console.log('   ⚠️  No Appearances section found in HTML');
    return {
      movies: [],
      tv: [],
      games: [],
      books: []
    };
  }
  
  const appearancesSection = appearancesMatch[1];
  
  // Look for list items in the Appearances section only
  const listMatches = appearancesSection.matchAll(/<li[^>]*>(.*?)<\/li>/gi);
  
  for (const match of listMatches) {
    let fullText = match[1];
    
    // Check for qualifiers that indicate it's not a real appearance
    // Match any <small> tag that contains these qualifiers (can be multiple <small> tags per line)
    const hasQualifier = /<small>.*?(?:Mentioned only|Indirect mention|In flashback|Appears in hologram|Appears on poster|Voice only|Vision|Picture only|Statue only|Depicted on|Variant cover|First mentioned|First appearance|Non-canon|Painting only|Mural only|Appears as a corpse|Appears through imagination|Appears in memory).*?<\/small>/i.test(fullText);
    
    if (hasQualifier) {
      // Skip this appearance - it's a mention/flashback/hologram/etc
      continue;
    }
    
    let text = fullText
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/&quot;/g, '"')
      .replace(/&#91;/g, '[')
      .replace(/&#93;/g, ']')
      .replace(/&amp;/g, '&')
      .replace(/&#32;/g, ' ')
      .replace(/&#8212;/g, '—')
      .replace(/&#8211;/g, '–')
      .replace(/&#124;/g, '|')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Skip if too short or contains certain markers
    if (text.length < 5 || 
        text.includes('Episode Guide') ||
        text.includes('StarWars.com') ||
        text.includes('Databank') ||
        text.includes('Disney Gallery') ||  // Behind-the-scenes documentaries
        text.includes('The Art of') ||      // Art books/reference materials
        text.toLowerCase().includes('encyclopedia') ||
        text.toLowerCase().includes('guide') ||
        text.toLowerCase().includes('handbook') ||
        text.toLowerCase().includes('archive')) {
      continue;
    }
    
    // Clean the title
    const cleaned = cleanMediaTitle(text);
    
    if (cleaned.length < 3) continue;
    
    // Try to match to known titles
    const movieMatch = matchToKnownTitle(cleaned, movieTitles);
    if (movieMatch) {
      appearances.movies.add(movieMatch);
      continue;
    }
    
    const tvMatch = matchToKnownTitle(cleaned, tvTitles);
    if (tvMatch) {
      appearances.tv.add(tvMatch);
      continue;
    }
    
    const gameMatch = matchToKnownTitle(cleaned, gameTitles);
    if (gameMatch) {
      appearances.games.add(gameMatch);
      continue;
    }
  }
  
  return {
    movies: Array.from(appearances.movies),
    tv: Array.from(appearances.tv),
    games: Array.from(appearances.games),
    books: Array.from(appearances.books)
  };
}

// Process each character
let updated = 0;
let skipped = 0;
let noFile = 0;

characters.forEach((char, index) => {
  if (!char.name || !char.id) {
    console.log(`⏭️  Skipping incomplete character entry at index ${index}`);
    skipped++;
    return;
  }
  
  const htmlFile = path.join(cacheDir, `${char.id}.html`);
  
  if (!fs.existsSync(htmlFile)) {
    console.log(`❌ ${char.name} - No HTML file found`);
    noFile++;
    return;
  }
  
  try {
    const html = fs.readFileSync(htmlFile, 'utf-8');
    const appearances = parseMediaAppearances(html);
    
    let hasChanges = false;
    const changes = [];
    
    // Update movie appearances (always compare, even if empty)
    const oldMovies = JSON.stringify((char.movieAppearances || []).sort());
    const newMovies = JSON.stringify(appearances.movies.sort());
    if (oldMovies !== newMovies) {
      char.movieAppearances = appearances.movies.length > 0 ? appearances.movies : [];
      hasChanges = true;
      const moviesDisplay = appearances.movies.length > 0 ? appearances.movies.join(', ') : 'NONE (cleared incorrect data)';
      changes.push(`📽️  Movies: ${moviesDisplay}`);
    }
    
    // Update TV appearances (always compare, even if empty)
    const oldTV = JSON.stringify((char.tvAppearances || []).sort());
    const newTV = JSON.stringify(appearances.tv.sort());
    if (oldTV !== newTV) {
      char.tvAppearances = appearances.tv.length > 0 ? appearances.tv : [];
      hasChanges = true;
      const tvDisplay = appearances.tv.length > 0 ? appearances.tv.join(', ') : 'NONE (cleared incorrect data)';
      changes.push(`📺 TV: ${tvDisplay}`);
    }
    
    // Update game appearances (always compare, even if empty)
    const oldGames = JSON.stringify((char.gameAppearances || []).sort());
    const newGames = JSON.stringify(appearances.games.sort());
    if (oldGames !== newGames) {
      char.gameAppearances = appearances.games.length > 0 ? appearances.games : [];
      hasChanges = true;
      const gamesDisplay = appearances.games.length > 0 ? appearances.games.join(', ') : 'NONE (cleared incorrect data)';
      changes.push(`🎮 Games: ${gamesDisplay}`);
    }
    
    if (hasChanges) {
      updated++;
      console.log(`✅ ${char.name}:`);
      changes.forEach(change => console.log(`   ${change}`));
    } else {
      console.log(`⏭️  ${char.name} - Already correct`);
      skipped++;
    }
    
  } catch (error) {
    console.error(`❌ ${char.name} - Error: ${error.message}`);
  }
});

// Replace empty arrays with ["None"]
characters.forEach(char => {
  if (char.movieAppearances && char.movieAppearances.length === 0) {
    char.movieAppearances = ["None"];
  }
  if (char.tvAppearances && char.tvAppearances.length === 0) {
    char.tvAppearances = ["None"];
  }
  if (char.gameAppearances && char.gameAppearances.length === 0) {
    char.gameAppearances = ["None"];
  }
  if (char.bookComicAppearances && char.bookComicAppearances.length === 0) {
    char.bookComicAppearances = ["None"];
  }
});

// Save updated characters
fs.writeFileSync('./src/data/characters.json', JSON.stringify(characters, null, 2));

console.log('\n' + '='.repeat(60));
console.log('📊 Summary:');
console.log('='.repeat(60));
console.log(`Total characters: ${characters.length}`);
console.log(`Updated: ${updated}`);
console.log(`Skipped: ${skipped}`);
console.log(`No HTML file: ${noFile}`);
console.log('='.repeat(60));

console.log('\n✅ Characters updated! Run check-media-appearances.js to see statistics.');
