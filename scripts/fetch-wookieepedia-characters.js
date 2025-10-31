/**
 * Script to fetch characters from Wookieepedia Canon character list
 * Run with: node scripts/fetch-wookieepedia-characters.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Wookieepedia base URL
const WOOKIEEPEDIA_BASE = 'https://starwars.fandom.com';

// Helper to fetch and parse a Wookieepedia page
async function fetchWookieepediaPage(url) {
  console.log(`Fetching: ${url}`);
  try {
    const response = await fetch(url);
    const html = await response.text();
    return html;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    return null;
  }
}

// Extract character links from category page
function extractCharacterLinks(html) {
  const links = [];
  const seen = new Set();
  
  // Look specifically for the category members section
  const categoryMembersMatch = html.match(/<div class="category-page__members">([\s\S]*?)<\/div>/);
  if (!categoryMembersMatch) {
    // Try alternate pattern - look for links in the page content
    const linkRegex = /<a[^>]*class="category-page__member-link"[^>]*href="(\/wiki\/[^"]+)"[^>]*title="([^"]+)"[^>]*>/g;
    let match;
    
    while ((match = linkRegex.exec(html)) !== null) {
      const [, href, title] = match;
      
      if (!seen.has(href)) {
        seen.add(href);
        links.push({
          url: WOOKIEEPEDIA_BASE + href,
          name: title
        });
      }
    }
    
    return links;
  }
  
  const membersHtml = categoryMembersMatch[1];
  
  // Match character links in the category listing
  const linkRegex = /<a href="(\/wiki\/[^"]+)"[^>]*title="([^"]+)"[^>]*>/g;
  let match;
  
  while ((match = linkRegex.exec(membersHtml)) !== null) {
    const [, href, title] = match;
    
    // Filter out non-character pages
    if (href.includes('Category:') || 
        href.includes('File:') || 
        href.includes('Special:') ||
        href.includes('Template:') ||
        href.includes('Wookieepedia:') ||
        href.includes('Help:') ||
        title.includes('Category:') ||
        title.includes('Legends') ||
        title.includes('disambiguation')) {
      continue;
    }
    
    if (!seen.has(href)) {
      seen.add(href);
      links.push({
        url: WOOKIEEPEDIA_BASE + href,
        name: title
      });
    }
  }
  
  return links;
}

// Parse character infobox data
function parseCharacterInfobox(html, characterName) {
  const data = {
    name: characterName,
    species: 'Unknown',
    sex: 'Unknown',
    hairColor: 'Unknown',
    eyeColor: 'Unknown',
    homeworld: 'Unknown',
    affiliations: [],
    eras: [],
    imageUrl: null
  };
  
  // Extract image URL
  const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
  if (imageMatch) {
    let imageUrl = imageMatch[1];
    // Clean up the URL - remove scale parameters
    imageUrl = imageUrl.split('/revision/')[0];
    data.imageUrl = imageUrl;
  }
  
  // Look for infobox data
  const infoboxMatch = html.match(/<aside[^>]*class="[^"]*portable-infobox[^"]*"[^>]*>([\s\S]*?)<\/aside>/);
  if (!infoboxMatch) {
    return data;
  }
  
  const infoboxHtml = infoboxMatch[1];
  
  // Helper to extract field value
  const extractField = (fieldName) => {
    const regex = new RegExp(`<div[^>]*data-source="${fieldName}"[^>]*>[\\s\\S]*?<div[^>]*class="pi-data-value[^"]*"[^>]*>([\\s\\S]*?)<\/div>`, 'i');
    const match = infoboxHtml.match(regex);
    if (match) {
      // Strip HTML tags and clean up
      let value = match[1].replace(/<[^>]+>/g, '').trim();
      value = value.replace(/\[[^\]]+\]/g, '').trim(); // Remove references
      value = value.replace(/\s+/g, ' ').trim();
      return value;
    }
    return null;
  };
  
  // Extract species
  const species = extractField('species') || extractField('Species');
  if (species && species !== 'N/A') {
    data.species = species;
  }
  
  // Extract gender/sex
  const gender = extractField('gender') || extractField('Gender') || extractField('sex') || extractField('Sex');
  if (gender) {
    if (gender.toLowerCase().includes('male') && !gender.toLowerCase().includes('female')) {
      data.sex = 'Male';
    } else if (gender.toLowerCase().includes('female')) {
      data.sex = 'Female';
    } else {
      data.sex = 'N/A';
    }
  }
  
  // Extract hair color
  const hair = extractField('hair') || extractField('Hair color');
  if (hair && hair !== 'N/A' && hair !== 'None') {
    data.hairColor = hair.split(',')[0].trim();
  } else if (hair === 'None') {
    data.hairColor = 'Bald';
  }
  
  // Extract eye color
  const eyes = extractField('eyes') || extractField('Eye color');
  if (eyes && eyes !== 'N/A') {
    data.eyeColor = eyes.split(',')[0].trim();
  }
  
  // Extract homeworld
  const homeworld = extractField('homeworld') || extractField('Homeworld');
  if (homeworld && homeworld !== 'N/A') {
    data.homeworld = homeworld;
  }
  
  // Extract affiliation
  const affiliation = extractField('affiliation') || extractField('Affiliation');
  if (affiliation) {
    // Split multiple affiliations
    const affiliations = affiliation.split(/[,\n]/).map(a => a.trim()).filter(a => a && a !== 'N/A');
    data.affiliations = affiliations.slice(0, 3); // Limit to 3
  }
  
  return data;
}

// Determine era from page content
function determineEras(html, characterName) {
  const eras = new Set();
  
  const content = html.toLowerCase();
  const name = characterName.toLowerCase();
  
  // Check for era mentions
  if (content.includes('clone wars') || content.includes('prequel')) {
    eras.add('Prequel');
  }
  if (content.includes('galactic civil war') || content.includes('original trilogy') || 
      content.includes('battle of yavin') || content.includes('battle of hoth')) {
    eras.add('Original');
  }
  if (content.includes('first order') || content.includes('resistance') || 
      content.includes('sequel trilogy') || name.includes('rey') || name.includes('kylo')) {
    eras.add('Sequel');
  }
  
  // Default to Original if nothing found
  if (eras.size === 0) {
    eras.add('Original');
  }
  
  return Array.from(eras);
}

// Guess weapons based on character data
function guessWeapons(characterData, html) {
  const content = html.toLowerCase();
  const name = characterData.name.toLowerCase();
  
  // Check for Jedi/Sith
  if (content.includes('jedi') || content.includes('sith') || 
      content.includes('lightsaber') || content.includes('force-sensitive')) {
    return ['Lightsaber'];
  }
  
  // Check for droids
  if (characterData.species.toLowerCase().includes('droid')) {
    return ['None'];
  }
  
  // Check for specific weapon mentions
  if (content.includes('blaster')) {
    return ['Blaster'];
  }
  
  // Default
  return ['Blaster'];
}

// Check if Force user
function isForceUser(characterData, html) {
  const content = html.toLowerCase();
  const name = characterData.name.toLowerCase();
  
  return content.includes('jedi') || 
         content.includes('sith') || 
         content.includes('force-sensitive') ||
         content.includes('force user') ||
         characterData.weapons?.includes('Lightsaber');
}

// Convert to kebab-case ID
function toKebabCase(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Fetch and parse a single character
async function fetchCharacter(link, index, total) {
  console.log(`\n[${index}/${total}] Processing: ${link.name}`);
  
  const html = await fetchWookieepediaPage(link.url);
  if (!html) {
    return null;
  }
  
  const characterData = parseCharacterInfobox(html, link.name);
  const eras = determineEras(html, link.name);
  const weapons = guessWeapons(characterData, html);
  const forceUser = isForceUser(characterData, html);
  
  const character = {
    id: toKebabCase(link.name),
    name: link.name,
    species: characterData.species,
    sex: characterData.sex,
    hairColor: characterData.hairColor,
    eyeColor: characterData.eyeColor,
    homeworld: characterData.homeworld,
    affiliations: characterData.affiliations.length > 0 ? characterData.affiliations : ['Unknown'],
    eras: eras,
    weapons: weapons,
    forceUser: forceUser,
    source: ['movies', 'tv'],
    imageUrl: characterData.imageUrl || ''
  };
  
  console.log(`  ✓ Species: ${character.species}, Homeworld: ${character.homeworld}`);
  
  return character;
}

// Main function
async function main() {
  console.log('Fetching Wookieepedia Canon characters...\n');
  
  // Start with the main canon characters category
  const categoryUrl = 'https://starwars.fandom.com/wiki/Category:Canon_characters';
  
  console.log('Fetching character list from category page...');
  const categoryHtml = await fetchWookieepediaPage(categoryUrl);
  
  if (!categoryHtml) {
    console.error('Failed to fetch category page');
    return;
  }
  
  const characterLinks = extractCharacterLinks(categoryHtml);
  console.log(`\nFound ${characterLinks.length} potential character links`);
  
  // Limit to first N characters to avoid overwhelming the API
  const LIMIT = 50; // Adjust this number
  const linksToProcess = characterLinks.slice(0, LIMIT);
  
  console.log(`Processing first ${linksToProcess.length} characters...\n`);
  
  // Load existing characters to avoid duplicates
  const existingPath = path.join(__dirname, '..', 'src', 'data', 'characters.json');
  const existingCharacters = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
  const existingIds = new Set(existingCharacters.map(c => c.id));
  
  const newCharacters = [];
  
  for (let i = 0; i < linksToProcess.length; i++) {
    try {
      const character = await fetchCharacter(linksToProcess[i], i + 1, linksToProcess.length);
      
      if (character && !existingIds.has(character.id)) {
        newCharacters.push(character);
      } else if (character) {
        console.log(`  ⊘ Already exists, skipping`);
      }
      
      // Be nice to Wookieepedia - rate limit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`  ✗ Error processing character:`, error.message);
    }
  }
  
  console.log(`\n\n✅ Successfully processed ${newCharacters.length} new characters`);
  console.log(`📝 ${existingCharacters.length} characters already in database`);
  
  // Save to file
  const outputPath = path.join(__dirname, 'wookieepedia-characters-new.json');
  fs.writeFileSync(outputPath, JSON.stringify(newCharacters, null, 2));
  
  console.log(`\n✨ Saved to: ${outputPath}`);
  console.log('\nReview the file and merge into src/data/characters.json when ready.');
}

main().catch(console.error);
