import fs from 'fs';

// List of major movie characters
const movieCharacters = new Set([
  'Luke Skywalker', 'Leia Organa', 'Darth Vader', 'Han Solo', 'Yoda',
  'Obi-Wan Kenobi', 'Chewbacca', 'R2-D2', 'C-3PO', 'Padmé Amidala',
  'Rey', 'Kylo Ren', 'Anakin Skywalker', 'Mace Windu', 'Qui-Gon Jinn',
  'Darth Maul', 'Count Dooku', 'General Grievous', 'Jango Fett', 'Boba Fett',
  'Lando Calrissian', 'Emperor Palpatine', 'Poe Dameron', 'Finn',
  'Captain Phasma', 'BB-8', 'Grand Moff Tarkin', 'Mon Mothma', 'Wedge Antilles',
  'Jar Jar Binks', 'Admiral Ackbar', 'Nien Nunb', 'Bail Prestor Organa',
  'Owen Lars', 'Shmi Skywalker Lars', 'Wilhuff Tarkin', 'Ben Solo',
  'Rose Tico', 'Unkar Plutt', 'Armitage Hux', 'Snoke', 'Rey Skywalker',
  'Jyn Erso', 'Cassian Andor', 'Orson Callan Krennic', 'Saw Gerrera',
  'Galen Walton Erso', 'K-2SO', 'Ponda Baba', 'Greedo', 'Biggs Darklighter',
  'Lobot', 'Jek Tono Porkins', 'Jan Dodonna', 'Cliegg Lars', 'Amilyn Holdo',
  'Gregar Typho', 'Watto', 'Sebulba', 'Finis Valorum', 'Sifo-Dyas', 'Nute Gunray',
  'Roos Tarpals', 'Orn Free Taa', 'Zam Wesell', 'Taun We', 'Lama Su', 'Poggle the Lesser',
  'Bib Fortuna', 'Salacious B. Crumb', 'Max Rebo', 'Wicket Wystri Warrick',
  'Adi Gallia', 'Yarael Poof', 'Eeth Koth', 'Ki-Adi-Mundi', 'Plo Koon',
  'Saesee Tiin', 'Aayla Secura', 'Shaak Ti', 'Stass Allie', 'Barriss Offee',
  'Jocasta Nu', 'Pong Krell', 'Dooku'
]);

const tvCharacters = new Set([
  'Ahsoka Tano', 'Din Djarin', 'Din Grogu', 'Bo-Katan Kryze', 'Fennec Shand',
  'Cad Bane', 'Savage Opress', 'Asajj Ventress', 'Hondo Ohnaka', 'Pre Vizsla',
  'Satine Kryze', 'Riyo Chuchi', 'Rush Clovis', 'Ezra Bridger', 'Kanan Jarrus',
  'Hera Syndulla', 'Sabine Wren', 'Zeb Orrelios', 'Chopper', 'Grand Admiral Thrawn',
  'Mitth\'raw\'nuruodo', 'Trace Martez', 'Omega', 'Embo', 'Aurra Sing',
  'Bossk', 'Dengar', 'IG-88B', 'Zuckuss', '4-LOM', 'Babu Frik', 'Phasma',
  'Wat Tambor', 'Maz Kanata'
]);

const cloneTrooperPrefixes = ['CC-', 'CT-', 'RC-'];

const gameCharacters = new Set([
  'Cal Kestis', 'Bastila Shan', 'Revan', 'Darth Bane', 'Darth Plagueis'
]);

// Load characters
const characters = JSON.parse(fs.readFileSync('./src/data/characters.json', 'utf8'));

console.log('🎯 Setting smart defaults for source and appears_in\n');

let updated = 0;

characters.forEach(char => {
  let source = char.source;
  let appears_in = char.appears_in || [];
  
  // Skip if already has source
  if (source && source !== null) {
    console.log(`⏭️  ${char.name} - Already has source: ${source}`);
    return;
  }
  
  // Check clone troopers
  const isCloneTrooper = cloneTrooperPrefixes.some(prefix => char.name.startsWith(prefix));
  
  if (movieCharacters.has(char.name)) {
    source = 'movies';
    appears_in = ['movies'];
  } else if (tvCharacters.has(char.name) || isCloneTrooper) {
    source = 'tv';
    appears_in = ['tv'];
  } else if (gameCharacters.has(char.name)) {
    source = 'games';
    appears_in = ['games'];
  } else {
    // Default to TV for remaining characters (most are from Clone Wars/Rebels)
    source = 'tv';
    appears_in = ['tv'];
  }
  
  char.source = source;
  char.appears_in = appears_in;
  updated++;
  console.log(`✅ ${char.name} - Set to: ${source}`);
});

// Save updated characters
fs.writeFileSync('./src/data/characters.json', JSON.stringify(characters, null, 2));

console.log(`\n✅ Updated ${updated} characters with source/appears_in defaults`);
console.log(`📊 Total characters with source: ${characters.filter(c => c.source).length}/150`);
