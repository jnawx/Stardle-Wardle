import fs from 'fs';

console.log('🔍 Debugging Darth Bane appearances extraction...\n');

// Load data
const attributeOptions = JSON.parse(fs.readFileSync('./src/data/attribute-options.json', 'utf8'));

// Build lookup maps for matching
const movieTitles = new Set(attributeOptions.movieAppearances);

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
  for (const title of titleSet) {
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const wordBoundaryRegex = new RegExp(`\\b${escapedTitle}\\b`, 'i');
    
    if (wordBoundaryRegex.test(cleanedText)) {
      return title;
    }
  }
  
  return null;
}

// Read Darth Bane HTML
const html = fs.readFileSync('./fandom-cache/darth-bane.html', 'utf-8');

// Find the Appearances section
const appearancesMatch = html.match(/<h[23][^>]*>.*?id="Appearances".*?<\/h[23]>([\s\S]*?)(?=<h[23]|$)/i);

if (!appearancesMatch) {
  console.log('❌ No Appearances section found!');
  process.exit(1);
}

console.log('✅ Found Appearances section\n');

const appearancesSection = appearancesMatch[1];

// Count characters
console.log(`📊 Appearances section length: ${appearancesSection.length} characters\n`);

// Show first 500 characters
console.log('📝 First 500 characters of Appearances section:');
console.log('='.repeat(60));
console.log(appearancesSection.substring(0, 500));
console.log('='.repeat(60));
console.log('\n');

// Look for list items
const listMatches = appearancesSection.matchAll(/<li[^>]*>(.*?)<\/li>/gi);

console.log('📋 Processing list items:\n');

let itemNum = 0;
for (const match of listMatches) {
  itemNum++;
  let fullText = match[1];
  
  // Check for qualifiers
  const hasQualifier = /<small>.*?(?:Mentioned only|Indirect mention|In flashback|Appears in hologram|Appears on poster|Voice only|Vision|Picture only|Statue only|Depicted on|Variant cover|First mentioned|First appearance|Non-canon|Painting only|Mural only|Appears as a corpse|Appears through imagination|Appears in memory).*?<\/small>/i.test(fullText);
  
  let text = fullText
    .replace(/<[^>]+>/g, '')
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
  
  const cleaned = cleanMediaTitle(text);
  const movieMatch = matchToKnownTitle(cleaned, movieTitles);
  
  console.log(`Item ${itemNum}:`);
  console.log(`  Raw (first 80 chars): ${fullText.substring(0, 80).replace(/\n/g, ' ')}...`);
  console.log(`  Cleaned text: "${text}"`);
  console.log(`  Cleaned title: "${cleaned}"`);
  console.log(`  Has qualifier: ${hasQualifier}`);
  console.log(`  Movie match: ${movieMatch || 'NONE'}`);
  
  if (movieMatch) {
    console.log(`  ⚠️  FOUND MOVIE: ${movieMatch}`);
  }
  
  console.log('');
}

console.log(`\n✅ Processed ${itemNum} list items`);
