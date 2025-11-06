#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testSpecies() {
  console.log('Testing species extraction for Yoda...');

  const response = await fetch('https://starwars.fandom.com/wiki/Yoda');
  const html = await response.text();

  const infoboxMatch = html.match(/<aside[^>]*class="[^"]*portable-infobox[^"]*"[^>]*>([\s\S]*?)<\/aside>/);
  if (!infoboxMatch) {
    console.log('No infobox found');
    return;
  }

  const infobox = infoboxMatch[1];
  const data = {};

  const dataSourcePattern = /data-source="([^"]+)"/g;
  let match;
  const dataSources = [];

  while ((match = dataSourcePattern.exec(infobox)) !== null) {
    dataSources.push(match[1]);
  }

  for (const source of dataSources) {
    const sectionRegex = new RegExp(`data-source="${source}"[^>]*>([\\s\\S]*?)(?:<\\/div>\\s*<\\/div>|<\\/section>)`, 'i');
    const sectionMatch = infobox.match(sectionRegex);

    if (sectionMatch) {
      const rawText = sectionMatch[1]
        .replace(/<a[^>]*>(.*?)<\/a>/g, '$1')
        .replace(/<br\s*\/?>/gi, '|||')
        .replace(/<[^>]+>/g, '')
        .replace(/\[[^\]]+\]/g, '')
        .replace(/&#91;/g, '[').replace(/&#93;/g, ']')
        .replace(/\[\d+\]/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();

      const cleanedText = rawText
        .replace(/^(Species|Homeworld|Gender|Pronouns|Eye color|Hair color|Skin color|Height|Mass|Born|Died|Affiliation|Master\(s\)|Apprentice\(s\)|Family|Cybernetics|Biographical information|Physical description|Chronological and political information)\s+/gi, '')
        .trim();

      data[source] = cleanedText;
    }
  }

  console.log('Raw species data:', data.species);

  // Test extraction logic
  function extractPrimaryValue(text) {
    if (!text) return null;
    let cleaned = text
      .replace(/\([^)]*\)/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/,.*$/, '')
      .replace(/;.*$/, '')
      .split('|||')[0]
      .trim();
    return cleaned || null;
  }

  const species = extractPrimaryValue(data.species);
  console.log('Primary species value:', species);

  if (species) {
    const lowerSpecies = species.toLowerCase();
    if (lowerSpecies.includes("'s species") ||
        lowerSpecies.includes("unknown") ||
        lowerSpecies.includes("unnamed") ||
        (lowerSpecies === "human" && lowerSpecies !== species)) {
      console.log('Species filtered out as generic');
      console.log('Final result: null');
    } else {
      console.log('Species accepted:', species);
      console.log('Final result:', species);
    }
  } else {
    console.log('Final result: null');
  }
}

testSpecies().catch(console.error);
