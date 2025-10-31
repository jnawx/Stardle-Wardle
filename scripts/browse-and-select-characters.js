/**
 * Interactive script to browse and select characters from Wookieepedia
 * Run with: node scripts/browse-and-select-characters.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Fetch character list from Wookieepedia category page (with pagination)
async function fetchCharacterList() {
  console.log('Fetching character list from Wookieepedia (this may take a while)...\n');
  console.log('⚠️  The site has 1,803 characters total. Fetching in batches...\n');
  
  const allCharacterLinks = [];
  let currentUrl = 'https://star-wars-canon.fandom.com/wiki/Category:Characters';
  let pageCount = 0;
  const maxPages = 15; // Safeguard to prevent infinite loops (each page has ~200 chars)
  
  while (currentUrl && pageCount < maxPages) {
    pageCount++;
    console.log(`Fetching page ${pageCount}... (${allCharacterLinks.length} characters so far)`);
    
    try {
      const response = await fetch(currentUrl);
      const html = await response.text();
      
      // Extract character links from the category members list
      const memberListRegex = /<li class="category-page__member">[\s\S]*?<a href="\/wiki\/([^"]+)"[^>]*title="([^"]+)"/g;
      let match;
      let foundOnThisPage = 0;
      
      while ((match = memberListRegex.exec(html)) !== null) {
        const url = match[1];
        const name = match[2];
        
        // Filter out special pages, categories, and navigation
        if (!url.includes(':') && 
            !url.includes('Category') && 
            !url.includes('Special:') &&
            !url.includes('File:') &&
            !url.includes('Template:') &&
            !name.includes('Category:') &&
            name !== 'Characters' &&
            name.length > 2) {
          allCharacterLinks.push({
            name: name,
            url: `https://star-wars-canon.fandom.com/wiki/${url}`
          });
          foundOnThisPage++;
        }
      }
      
      console.log(`  Found ${foundOnThisPage} characters on this page`);
      
      // Look for the "Next" button in pagination
      const nextPageRegex = /<a[^>]*class="[^"]*category-page__pagination-next[^"]*"[^>]*href="([^"]+)"/;
      const nextMatch = html.match(nextPageRegex);
      
      if (nextMatch) {
        currentUrl = nextMatch[1].startsWith('http') 
          ? nextMatch[1] 
          : `https://star-wars-canon.fandom.com${nextMatch[1]}`;
        // Be nice to the server
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log('  No more pages found.');
        currentUrl = null; // No more pages
      }
    } catch (error) {
      console.error(`Error fetching page ${pageCount}:`, error.message);
      break;
    }
  }
  
  console.log(`\nFetched ${pageCount} pages total\n`);
  
  // Remove duplicates
  const uniqueCharacters = Array.from(
    new Map(allCharacterLinks.map(c => [c.name, c])).values()
  );
  
  return uniqueCharacters;
}

// Fetch character data from their Wookieepedia page
async function fetchCharacterData(characterUrl) {
  try {
    const response = await fetch(characterUrl);
    const html = await response.text();
    
    // Extract infobox data
    const data = {
      name: '',
      species: 'Unknown',
      gender: 'Unknown',
      hairColor: 'Unknown',
      eyeColor: 'Unknown',
      homeworld: 'Unknown',
      affiliation: [],
      era: [],
      imageUrl: ''
    };
    
    // Extract name from title
    const titleMatch = html.match(/<h1[^>]*class="[^"]*page-header__title[^"]*"[^>]*>([^<]+)<\/h1>/);
    if (titleMatch) {
      data.name = titleMatch[1].trim();
    }
    
    // Extract image
    const imageMatch = html.match(/<img[^>]*src="(https:\/\/static\.wikia\.nocookie\.net\/[^"]+)"[^>]*class="[^"]*pi-image-thumbnail[^"]*"/);
    if (imageMatch) {
      data.imageUrl = imageMatch[1].split('/revision/')[0]; // Remove revision part
    }
    
    // Extract infobox data
    const extractInfoboxValue = (label) => {
      const regex = new RegExp(`<h3[^>]*>[^<]*${label}[^<]*<\\/h3>\\s*<div[^>]*>([^<]+)<`, 'i');
      const match = html.match(regex);
      return match ? match[1].trim() : null;
    };
    
    data.species = extractInfoboxValue('Species') || 'Unknown';
    data.gender = extractInfoboxValue('Gender|Sex') || 'Unknown';
    data.hairColor = extractInfoboxValue('Hair color') || 'Unknown';
    data.eyeColor = extractInfoboxValue('Eye color') || 'Unknown';
    data.homeworld = extractInfoboxValue('Homeworld') || 'Unknown';
    
    return data;
  } catch (error) {
    console.error(`Error fetching character data: ${error.message}`);
    return null;
  }
}

// Main interactive selection process
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('   Star Wars Character Selection Tool');
  console.log('═══════════════════════════════════════════════════════\n');
  
  // Fetch available characters
  const characters = await fetchCharacterList();
  console.log(`✅ Found ${characters.length} characters\n`);
  
  // Load existing characters to avoid duplicates
  const existingPath = path.join(__dirname, '..', 'src', 'data', 'characters.json');
  const existingCharacters = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
  const existingNames = new Set(existingCharacters.map(c => c.name.toLowerCase()));
  
  console.log(`📝 You currently have ${existingCharacters.length} characters\n`);
  
  // Filter out existing characters
  const newCharacters = characters.filter(c => !existingNames.has(c.name.toLowerCase()));
  console.log(`🆕 ${newCharacters.length} new characters available\n`);
  
  // Show selection options
  console.log('═══════════════════════════════════════════════════════');
  console.log('Selection Options:');
  console.log('═══════════════════════════════════════════════════════');
  console.log('1. Browse and select manually (one by one)');
  console.log('2. Show list and pick by numbers (e.g., "1,5,10-15,20")');
  console.log('3. Export full list to file for review');
  console.log('4. Exit');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const choice = await question('Enter your choice (1-4): ');
  
  if (choice === '1') {
    await browseAndSelectManually(newCharacters);
  } else if (choice === '2') {
    await selectByNumbers(newCharacters);
  } else if (choice === '3') {
    await exportToFile(newCharacters);
  } else {
    console.log('\nGoodbye! 👋');
  }
  
  rl.close();
}

// Option 1: Browse one by one
async function browseAndSelectManually(characters) {
  const selected = [];
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('Browse Mode: Review each character');
  console.log('Commands: y=yes, n=no, s=skip remaining, q=quit');
  console.log('═══════════════════════════════════════════════════════\n');
  
  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    console.log(`\n[${i + 1}/${characters.length}] ${char.name}`);
    console.log(`URL: ${char.url}`);
    
    const answer = await question('Add this character? (y/n/s/q): ');
    
    if (answer.toLowerCase() === 'y') {
      selected.push(char);
      console.log('✅ Added!');
    } else if (answer.toLowerCase() === 's') {
      console.log('⏭️  Skipping remaining characters...');
      break;
    } else if (answer.toLowerCase() === 'q') {
      break;
    } else {
      console.log('⏭️  Skipped');
    }
  }
  
  if (selected.length > 0) {
    await fetchAndSaveSelected(selected);
  } else {
    console.log('\nNo characters selected.');
  }
}

// Option 2: Select by numbers
async function selectByNumbers(characters) {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('Available Characters:');
  console.log('═══════════════════════════════════════════════════════\n');
  
  // Show in columns
  for (let i = 0; i < characters.length; i++) {
    const num = (i + 1).toString().padStart(3, ' ');
    console.log(`${num}. ${characters[i].name}`);
    
    // Pause every 20 characters
    if ((i + 1) % 20 === 0 && i < characters.length - 1) {
      await question('\nPress Enter to see more... ');
      console.log('');
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('Enter character numbers to add:');
  console.log('Examples: "1,5,10" or "1-10,15,20-25" or "all"');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const input = await question('Numbers: ');
  
  if (input.toLowerCase() === 'all') {
    await fetchAndSaveSelected(characters);
    return;
  }
  
  // Parse the input
  const selected = [];
  const parts = input.split(',');
  
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
      for (let i = start; i <= end && i <= characters.length; i++) {
        selected.push(characters[i - 1]);
      }
    } else {
      const num = parseInt(trimmed);
      if (num > 0 && num <= characters.length) {
        selected.push(characters[num - 1]);
      }
    }
  }
  
  console.log(`\n✅ Selected ${selected.length} characters`);
  
  if (selected.length > 0) {
    await fetchAndSaveSelected(selected);
  }
}

// Option 3: Export to file
async function exportToFile(characters) {
  const outputPath = path.join(__dirname, 'available-characters.txt');
  
  const content = characters.map((c, i) => 
    `${i + 1}. ${c.name}\n   ${c.url}`
  ).join('\n\n');
  
  fs.writeFileSync(outputPath, content);
  
  console.log(`\n✅ Exported ${characters.length} characters to:`);
  console.log(`   ${outputPath}\n`);
  console.log('Review the file and come back to select specific ones!');
}

// Fetch detailed data and save
async function fetchAndSaveSelected(selected) {
  console.log(`\n═══════════════════════════════════════════════════════`);
  console.log(`Fetching detailed data for ${selected.length} characters...`);
  console.log(`═══════════════════════════════════════════════════════\n`);
  
  const characterData = [];
  
  for (let i = 0; i < selected.length; i++) {
    const char = selected[i];
    console.log(`[${i + 1}/${selected.length}] Fetching ${char.name}...`);
    
    const data = await fetchCharacterData(char.url);
    if (data) {
      characterData.push({
        name: char.name,
        url: char.url,
        ...data
      });
    }
    
    // Be nice to the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Save to file
  const outputPath = path.join(__dirname, 'selected-characters.json');
  fs.writeFileSync(outputPath, JSON.stringify(characterData, null, 2));
  
  console.log(`\n✅ Saved ${characterData.length} characters to:`);
  console.log(`   ${outputPath}\n`);
  console.log('⚠️  Review the data and format it for characters.json manually.');
  console.log('   Image URLs and other attributes may need adjustment.');
}

main().catch(console.error);
