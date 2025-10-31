/**
 * Simpler script to fetch all characters using manual pagination
 * Run with: node scripts/fetch-all-characters.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchAllCharacters() {
  const allCharacters = [];
  let pageCount = 0;
  let fromParam = null;
  
  console.log('Fetching ALL characters from Wookieepedia...\n');
  console.log('This will fetch multiple pages (200 characters per page)\n');
  
  while (true) {
    pageCount++;
    const url = fromParam 
      ? `https://star-wars-canon.fandom.com/wiki/Category:Characters?from=${encodeURIComponent(fromParam)}`
      : 'https://star-wars-canon.fandom.com/wiki/Category:Characters';
    
    console.log(`Page ${pageCount}: Fetching from "${fromParam || 'start'}"...`);
    
    try {
      const response = await fetch(url);
      const html = await response.text();
      
      // Extract all character links (simpler regex)
      const links = [...html.matchAll(/<li class="category-page__member"[\s\S]*?<a href="\/wiki\/([^"]+)" title="([^"]+)"/g)];
      
      console.log(`  Found ${links.length} characters`);
      
      for (const match of links) {
        const urlPath = match[1];
        const name = match[2];
        
        if (!name.includes('Category:') && !urlPath.includes(':')) {
          allCharacters.push({
            name: name,
            url: `https://star-wars-canon.fandom.com/wiki/${urlPath}`
          });
        }
      }
      
      // Find the "next 200" link to get the next page parameter
      const nextMatch = html.match(/paginator-next">[\s\S]*?<a href="[^"]*from=([^"&]+)"/);
      
      if (nextMatch) {
        fromParam = decodeURIComponent(nextMatch[1]);
        console.log(`  Next page starts at: "${fromParam}"`);
        // Be respectful to the server
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log(`  No more pages.\n`);
        break;
      }
      
      // Safety limit
      if (pageCount >= 20) {
        console.log('\n⚠️  Reached safety limit of 20 pages. Stopping.');
        break;
      }
    } catch (error) {
      console.error(`\n❌ Error on page ${pageCount}:`, error.message);
      break;
    }
  }
  
  console.log(`\n✅ Fetched ${pageCount} pages`);
  console.log(`📊 Total characters found: ${allCharacters.length}\n`);
  
  // Remove duplicates
  const uniqueCharacters = Array.from(
    new Map(allCharacters.map(c => [c.name, c])).values()
  );
  
  console.log(`📝 Unique characters: ${uniqueCharacters.length}\n`);
  
  // Load existing to show how many are new
  const existingPath = path.join(__dirname, '..', 'src', 'data', 'characters.json');
  const existingCharacters = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
  const existingNames = new Set(existingCharacters.map(c => c.name.toLowerCase()));
  
  const newCharacters = uniqueCharacters.filter(c => !existingNames.has(c.name.toLowerCase()));
  
  console.log(`🆕 New characters (not in your game): ${newCharacters.length}\n`);
  
  // Save full list
  const outputPath = path.join(__dirname, 'all-wookieepedia-characters.txt');
  const content = uniqueCharacters.map((c, i) => 
    `${(i + 1).toString().padStart(4, ' ')}. ${c.name}\n      ${c.url}`
  ).join('\n\n');
  
  fs.writeFileSync(outputPath, content);
  console.log(`✅ Saved to: ${outputPath}\n`);
  
  // Save new characters separately
  const newOutputPath = path.join(__dirname, 'new-characters-only.txt');
  const newContent = newCharacters.map((c, i) => 
    `${(i + 1).toString().padStart(4, ' ')}. ${c.name}\n      ${c.url}`
  ).join('\n\n');
  
  fs.writeFileSync(newOutputPath, newContent);
  console.log(`✅ Saved new characters to: ${newOutputPath}\n`);
  
  console.log('━'.repeat(60));
  console.log('You can now:');
  console.log('1. Review new-characters-only.txt');
  console.log('2. Run browse-and-select-characters.js to select specific ones');
  console.log('━'.repeat(60));
}

fetchAllCharacters().catch(console.error);
