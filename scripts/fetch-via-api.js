/**
 * Fetch ALL characters using Fandom's MediaWiki API
 * Run with: node scripts/fetch-via-api.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchAllCharactersViaAPI() {
  const allCharacters = [];
  let continueParam = null;
  let batchCount = 0;
  
  console.log('Fetching ALL characters using Fandom API...\n');
  
  while (true) {
    batchCount++;
    
    let url = 'https://star-wars-canon.fandom.com/api.php?action=query&list=categorymembers&cmtitle=Category:Characters&cmlimit=500&format=json';
    
    if (continueParam) {
      url += `&cmcontinue=${encodeURIComponent(continueParam)}`;
    }
    
    console.log(`Batch ${batchCount}: Fetching up to 500 characters...`);
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      const members = data.query.categorymembers;
      console.log(`  Received ${members.length} characters`);
      
      for (const member of members) {
        allCharacters.push({
          name: member.title,
          url: `https://star-wars-canon.fandom.com/wiki/${member.title.replace(/ /g, '_')}`
        });
      }
      
      // Check if there are more results
      if (data.continue && data.continue.cmcontinue) {
        continueParam = data.continue.cmcontinue;
        console.log(`  More results available, continuing...\n`);
        // Be nice to the API
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        console.log(`  No more results.\n`);
        break;
      }
      
    } catch (error) {
      console.error(`\n❌ Error on batch ${batchCount}:`, error.message);
      break;
    }
  }
  
  console.log(`✅ Fetched ${batchCount} batches`);
  console.log(`📊 Total characters found: ${allCharacters.length}\n`);
  
  // Load existing to show how many are new
  const existingPath = path.join(__dirname, '..', 'src', 'data', 'characters.json');
  const existingCharacters = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
  const existingNames = new Set(existingCharacters.map(c => c.name.toLowerCase()));
  
  const newCharacters = allCharacters.filter(c => !existingNames.has(c.name.toLowerCase()));
  
  console.log(`🆕 New characters (not in your game): ${newCharacters.length}\n`);
  
  // Save full list
  const outputPath = path.join(__dirname, 'all-wookieepedia-characters.txt');
  const content = allCharacters.map((c, i) => 
    `${(i + 1).toString().padStart(4, ' ')}. ${c.name}\n      ${c.url}`
  ).join('\n\n');
  
  fs.writeFileSync(outputPath, content);
  console.log(`✅ Saved ALL characters to: ${outputPath}\n`);
  
  // Save new characters separately
  const newOutputPath = path.join(__dirname, 'new-characters-only.txt');
  const newContent = newCharacters.map((c, i) => 
    `${(i + 1).toString().padStart(4, ' ')}. ${c.name}\n      ${c.url}`
  ).join('\n\n');
  
  fs.writeFileSync(newOutputPath, newContent);
  console.log(`✅ Saved NEW characters to: ${newOutputPath}\n`);
  
  // Also save as JSON for the selection script
  fs.writeFileSync(
    path.join(__dirname, 'all-characters.json'),
    JSON.stringify(allCharacters, null, 2)
  );
  
  fs.writeFileSync(
    path.join(__dirname, 'new-characters.json'),
    JSON.stringify(newCharacters, null, 2)
  );
  
  console.log('━'.repeat(60));
  console.log(`📝 Summary:`);
  console.log(`   Total Canon Characters: ${allCharacters.length}`);
  console.log(`   Already in your game: ${existingCharacters.length}`);
  console.log(`   Available to add: ${newCharacters.length}`);
  console.log('━'.repeat(60));
  console.log('\nNext steps:');
  console.log('1. Review new-characters-only.txt');
  console.log('2. Run: node scripts/browse-and-select-characters.js');
  console.log('━'.repeat(60));
}

fetchAllCharactersViaAPI().catch(console.error);
