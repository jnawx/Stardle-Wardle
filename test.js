import fs from 'fs';

function extractSpeaksBasic(html, characterName) {
  // Find all quote divs
  const quotePattern = /<div class="quote">(.*?)<\/div>/gs;
  let match;
  let speaksBasic = null; // null means no quotes found, keep default

  while ((match = quotePattern.exec(html)) !== null) {
    const quoteContent = match[1];

    // Find quotes attributed to this character using ―Character Name pattern
    // The pattern looks for ― followed by the character name at the start of the attribution
    const attributionPattern = new RegExp(`&#8213;\\s*${characterName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s*,|\\s*$)`, 'i');
    if (!attributionPattern.test(quoteContent)) {
      continue; // Not attributed to this character as primary speaker
    }

    console.log('Found matching quote:', quoteContent.substring(0, 200) + '...');

    // Extract all dd elements from this quote
    const ddPattern = /<dd[^>]*>(.*?)<\/dd>/gs;
    const ddElements = [];
    let ddMatch;
    while ((ddMatch = ddPattern.exec(quoteContent)) !== null) {
      ddElements.push(ddMatch[1]);
    }

    // Find the dd with the attribution
    let attributionIndex = -1;
    for (let i = 0; i < ddElements.length; i++) {
      if (attributionPattern.test(ddElements[i])) {
        attributionIndex = i;
        break;
      }
    }

    if (attributionIndex > 0) { // Must have at least one dd before the attribution
      // The quote text should be in the previous dd element
      const quoteDdContent = ddElements[attributionIndex - 1];

      // Extract the quote text (clean it up)
      const quoteTextMatch = quoteDdContent.match(/<span[^>]*>(.*?)<\/span>/);
      if (quoteTextMatch) {
        const quoteText = quoteTextMatch[1].trim();

        console.log('Quote text:', quoteText.substring(0, 100) + '...');
        console.log('Includes Shyriiwook:', quoteText.toLowerCase().includes('shryiiwook') || quoteText.toLowerCase().includes('shyriiwook'));

        // Check for Shyriiwook mentions (indicates translated from non-Basic language)
        if (quoteText.toLowerCase().includes('shryiiwook') || quoteText.toLowerCase().includes('shyriiwook')) {
          console.log('Returning false due to Shyriiwook');
          return false; // Character speaks a non-Basic language
        }

        // Check for regular quotes (indicates Basic/English)
        if (quoteText.includes('"')) {
          console.log('Returning true due to quotes');
          return true; // Found quote in regular quotes = speaks Basic
        }

        // Check for translation markers (<< >> indicates non-Basic)
        if (quoteText.includes('&lt;&lt;') || quoteText.includes('<<')) {
          console.log('Returning false due to translation markers');
          return false; // Found quote in translation format = does not speak Basic
        }
      }
    }
  }

  console.log('No suitable quotes found, returning null');
  return speaksBasic; // null if no suitable quotes found
}

const html = fs.readFileSync('fandom-cache/chewbacca.html', 'utf8');
const result = extractSpeaksBasic(html, 'Chewbacca');
console.log('Final result:', result);
