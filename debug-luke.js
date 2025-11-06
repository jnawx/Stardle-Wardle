import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function debugLuke() {
  console.log('Fetching Luke Skywalker page...');

  try {
    // Use curl to fetch the page
    const curlCommand = 'curl -s -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "https://starwars.fandom.com/wiki/Luke_Skywalker"';
    const html = execSync(curlCommand, { encoding: 'utf8' });

    console.log('Page fetched, length:', html.length);

    // Find the portable-infobox
    const infoboxMatch = html.match(/<aside[^>]*class="[^"]*portable-infobox[^"]*"[^>]*>([\s\S]*?)<\/aside>/);
    if (!infoboxMatch) {
      console.log('No infobox found');
      return;
    }

    const infobox = infoboxMatch[1];
    console.log('Found infobox, extracting data sources...');

    // Extract data-source fields
    const dataSourcePattern = /data-source="([^"]+)"/g;
    let match;
    const dataSources = [];

    while ((match = dataSourcePattern.exec(infobox)) !== null) {
      dataSources.push(match[1]);
    }

    console.log('Data sources found:', dataSources);

    // Extract values for each data source
    const data = {};
    for (const source of dataSources) {
      const sectionRegex = new RegExp(`data-source="${source}"[^>]*>([\\s\\S]*?)(?:<\\/div>\\s*<\\/div>|<\\/section>)`, 'i');
      const sectionMatch = infobox.match(sectionRegex);

      if (sectionMatch) {
        const rawText = sectionMatch[1].replace(/<a[^>]*>(.*?)<\/a>/g, '$1').replace(/<\/li>\s*<li>/gi, '|||').replace(/<br\s*\/?>/gi, '|||').replace(/<[^>]+>/g, '').replace(/\[[^\]]+\]/g, '').replace(/&#91;/g, '[').replace(/&#93;/g, ']').replace(/\[\d+\]/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
        data[source] = rawText;
      }
    }

    console.log('Extracted data:');
    console.log('homeworld:', data.homeworld);
    console.log('birth:', data.birth);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugLuke().catch(console.error);
