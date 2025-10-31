import fs from 'fs/promises';

async function verifyHints() {
  const data = await fs.readFile('src/data/characters.json', 'utf8');
  const characters = JSON.parse(data);
  
  console.log('📊 Hint Population Verification\n');
  console.log(`Total characters: ${characters.length}`);
  
  const withHints = characters.filter(c => c.quoteHint && c.masterHint);
  const withoutHints = characters.filter(c => !c.quoteHint || !c.masterHint);
  
  console.log(`✅ Characters with both hints: ${withHints.length}`);
  console.log(`❌ Characters missing hints: ${withoutHints.length}\n`);
  
  if (withoutHints.length > 0) {
    console.log('Missing hints:');
    withoutHints.forEach(c => console.log(`  - ${c.name} (${c.id})`));
  } else {
    console.log('🎉 All characters have complete hints!\n');
    
    // Show sample of populated hints
    console.log('Sample of populated hints:\n');
    const samples = [
      characters[0],  // Luke
      characters[25], // Random
      characters[75], // Random
      characters[100], // Random
      characters[142]  // Last
    ];
    
    samples.forEach(char => {
      console.log(`\n${char.name}:`);
      console.log(`  Quote: "${char.quoteHint}"`);
      console.log(`  Master: "${char.masterHint.substring(0, 80)}..."`);
    });
  }
}

verifyHints();
