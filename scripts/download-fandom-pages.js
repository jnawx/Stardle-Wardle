import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Download Fandom wiki pages for all characters
 * This script fetches the HTML content from Star Wars Fandom for each character
 * to help with automatic data population.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FANDOM_BASE_URL = 'https://starwars.fandom.com/wiki';
const OUTPUT_DIR = path.join(__dirname, '..', 'fandom-cache');
const CHARACTERS_FILE = path.join(__dirname, '..', 'src', 'data', 'characters.json');
const DELAY_MS = 1000; // 1 second delay between requests to be respectful

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Convert character name to Fandom URL format
 * Examples:
 *   "Han Solo" -> "Han_Solo"
 *   "Luke Skywalker" -> "Luke_Skywalker"
 *   "Obi-Wan Kenobi" -> "Obi-Wan_Kenobi"
 */
function nameToFandomFormat(name) {
  return name.replace(/ /g, '_');
}

/**
 * Check if a name follows the expected Fandom naming convention
 * Valid: "Han Solo", "Luke Skywalker", "Obi-Wan Kenobi"
 * Invalid: "R2-D2" (has dash), "C-3PO" (has dash)
 */
function isValidFandomName(name) {
  // Skip names with special characters that don't typically work well
  // Allow spaces, hyphens in names like "Obi-Wan", apostrophes like "Qui-Gon"
  // But the URL format handles these fine with underscores
  return true; // We'll try all names and handle failures gracefully
}

/**
 * Download HTML content from a URL
 */
async function downloadPage(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.text();
  } catch (error) {
    throw error;
  }
}

/**
 * Sleep for a specified duration
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function
 */
async function main() {
  console.log('📚 Star Wars Fandom Page Downloader\n');
  console.log('Loading characters from:', CHARACTERS_FILE);
  
  const characters = JSON.parse(fs.readFileSync(CHARACTERS_FILE, 'utf8'));
  console.log(`Found ${characters.length} characters\n`);
  
  const stats = {
    total: characters.length,
    attempted: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    alreadyDownloaded: 0
  };
  
  for (const char of characters) {
    const fandomName = nameToFandomFormat(char.name);
    const url = `${FANDOM_BASE_URL}/${fandomName}`;
    const filename = `${char.id}.html`;
    const filepath = path.join(OUTPUT_DIR, filename);
    
    // Skip if already downloaded
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  ${char.name} - Already downloaded`);
      stats.alreadyDownloaded++;
      continue;
    }
    
    stats.attempted++;
    
    try {
      console.log(`📥 Downloading: ${char.name}`);
      console.log(`   URL: ${url}`);
      
      const html = await downloadPage(url);
      
      // Save to file
      fs.writeFileSync(filepath, html, 'utf8');
      
      stats.success++;
      console.log(`✅ Success! Saved to: ${filename}`);
      console.log(`   Progress: ${stats.success + stats.failed}/${stats.attempted}\n`);
      
      // Delay to be respectful to the server
      if (stats.attempted < characters.length) {
        await sleep(DELAY_MS);
      }
      
    } catch (error) {
      stats.failed++;
      console.error(`❌ Failed: ${char.name}`);
      console.error(`   Error: ${error.message}\n`);
      
      // Continue with next character
      await sleep(DELAY_MS / 2); // Shorter delay on failures
    }
  }
  
  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Download Summary:');
  console.log('='.repeat(60));
  console.log(`Total characters:      ${stats.total}`);
  console.log(`Already downloaded:    ${stats.alreadyDownloaded}`);
  console.log(`Attempted:             ${stats.attempted}`);
  console.log(`Successful:            ${stats.success}`);
  console.log(`Failed:                ${stats.failed}`);
  console.log(`Success rate:          ${stats.attempted > 0 ? ((stats.success / stats.attempted) * 100).toFixed(1) : 0}%`);
  console.log('='.repeat(60));
  console.log(`\n✅ HTML files saved to: ${OUTPUT_DIR}`);
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
