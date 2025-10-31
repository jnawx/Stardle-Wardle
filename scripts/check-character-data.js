import fs from 'fs';

const characters = JSON.parse(fs.readFileSync('./src/data/characters.json', 'utf8'));

const samples = ['Han Solo', 'Padmé Amidala', 'Din Grogu', 'Ahsoka Tano', 'Jango Fett'];

console.log('📊 Sample Character Data:\n');

samples.forEach(name => {
  const c = characters.find(ch => ch.name === name);
  if (c) {
    console.log(`${c.name}:`);
    console.log(`  Species: ${c.species}`);
    console.log(`  Sex: ${c.sex}`);
    console.log(`  Homeworld: ${c.homeworld}`);
    console.log(`  Eye Color: ${JSON.stringify(c.eyeColor)}`);
    console.log(`  Hair Color: ${c.hairColor}`);
    console.log(`  Force User: ${c.forceUser}`);
    console.log(`  Affiliations: ${JSON.stringify(c.affiliations)}`);
    console.log(`  Source: ${c.source || 'Not set'}`);
    console.log(`  Appears In: ${JSON.stringify(c.appears_in || [])}`);
    console.log();
  }
});

// Count populated fields
let populated = {
  species: 0,
  sex: 0,
  homeworld: 0,
  eyeColor: 0,
  hairColor: 0,
  forceUser: 0,
  affiliations: 0,
  imageUrl: 0
};

characters.forEach(c => {
  if (c.species && c.species !== null) populated.species++;
  if (c.sex && c.sex !== null) populated.sex++;
  if (c.homeworld && c.homeworld !== null) populated.homeworld++;
  if (c.eyeColor && c.eyeColor.length > 0) populated.eyeColor++;
  if (c.hairColor && c.hairColor !== null) populated.hairColor++;
  if (c.forceUser) populated.forceUser++;
  if (c.affiliations && c.affiliations.length > 0) populated.affiliations++;
  if (c.imageUrl) populated.imageUrl++;
});

console.log('📈 Population Statistics (out of 150 characters):');
console.log(`  Species:      ${populated.species}`);
console.log(`  Sex:          ${populated.sex}`);
console.log(`  Homeworld:    ${populated.homeworld}`);
console.log(`  Eye Color:    ${populated.eyeColor}`);
console.log(`  Hair Color:   ${populated.hairColor}`);
console.log(`  Force Users:  ${populated.forceUser}`);
console.log(`  Affiliations: ${populated.affiliations}`);
console.log(`  Image URLs:   ${populated.imageUrl}`);
console.log(`  Source:       ${characters.filter(c => c.source).length}`);
console.log(`  Appears In:   ${characters.filter(c => c.appears_in && c.appears_in.length > 0).length}`);
