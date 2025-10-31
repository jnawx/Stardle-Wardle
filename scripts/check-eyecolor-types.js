import fs from 'fs/promises';

async function checkEyeColorTypes() {
  const data = await fs.readFile('src/data/characters.json', 'utf8');
  const characters = JSON.parse(data);
  
  const arrays = characters.filter(c => Array.isArray(c.eyeColor));
  const strings = characters.filter(c => typeof c.eyeColor === 'string');
  
  console.log(`Total characters: ${characters.length}`);
  console.log(`Arrays: ${arrays.length}`);
  console.log(`Strings: ${strings.length}`);
  
  if (arrays.length > 0) {
    console.log('\nCharacters with array eyeColor:');
    arrays.forEach(c => console.log(`  - ${c.name}: [${c.eyeColor.join(', ')}]`));
  }
}

checkEyeColorTypes();
