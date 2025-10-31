import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_DIR = path.join(__dirname, '..', 'fandom-cache');

// Analyze Luke Skywalker's page as a sample
const sampleFile = path.join(CACHE_DIR, 'luke-skywalker.html');
const html = fs.readFileSync(sampleFile, 'utf8');

console.log('📊 Analyzing HTML structure...\n');

// Look for the infobox (portable-infobox)
const infoboxMatch = html.match(/<aside[^>]*class="[^"]*portable-infobox[^"]*"[^>]*>([\s\S]*?)<\/aside>/);

if (infoboxMatch) {
  console.log('✅ Found portable-infobox\n');
  const infobox = infoboxMatch[1];
  
  // Try different patterns
  console.log('Infobox length:', infobox.length);
  console.log('\nFirst 2000 characters of infobox:');
  console.log(infobox.substring(0, 2000));
  
  // Look for data-source attributes
  const dataSourcePattern = /data-source="([^"]+)"/g;
  let sourceMatch;
  const dataSources = [];
  while ((sourceMatch = dataSourcePattern.exec(infobox)) !== null) {
    dataSources.push(sourceMatch[1]);
  }
  
  console.log('\n📋 Found data-source attributes:');
  console.log(dataSources.slice(0, 20));
  
  // Try to extract values more simply
  const fields = {};
  for (const source of dataSources.slice(0, 30)) {
    // Find the section with this data-source
    const sectionRegex = new RegExp(`data-source="${source}"[^>]*>([\\s\\S]*?)<\\/div>(?:[\\s\\S]*?<\\/div>)?`, 'i');
    const sectionMatch = infobox.match(sectionRegex);
    if (sectionMatch) {
      // Extract text content, removing HTML tags
      let value = sectionMatch[1]
        .replace(/<a[^>]*>(.*?)<\/a>/g, '$1')
        .replace(/<br\s*\/?>/gi, ', ')
        .replace(/<[^>]+>/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();
      
      if (value && value.length < 500) {
        fields[source] = value;
      }
    }
  }
  
  console.log('\n🔍 Extracted field values:');
  Object.entries(fields).slice(0, 15).forEach(([key, value]) => {
    console.log(`- ${key}: ${value}`);
  });
  
} else {
  console.log('❌ portable-infobox not found, trying alternative patterns...\n');
  
  // Try to find any infobox
  const altInfobox = html.match(/<table[^>]*class="[^"]*infobox[^"]*"[^>]*>([\s\S]{0,2000})/);
  if (altInfobox) {
    console.log('Found alternative infobox structure:');
    console.log(altInfobox[0].substring(0, 1000));
  }
}

// Also check for image
const imagePattern = /<meta property="og:image" content="([^"]+)"/;
const imageMatch = html.match(imagePattern);
if (imageMatch) {
  console.log('\n🖼️ Character image:', imageMatch[1]);
}
