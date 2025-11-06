import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🌌 Populating character eras from media appearances...\n');

// Era constants (matching attribute-options.json)
const ERAS = {
  OLD_REPUBLIC: 'The Old Republic',
  HIGH_REPUBLIC: 'The High Republic',
  GALACTIC_REPUBLIC: 'The Galactic Republic',
  GALACTIC_EMPIRE: 'The Galactic Empire',
  NEW_REPUBLIC: 'The New Republic',
};

// Media to Era mapping (matching src/utils/mediaEraMapping.ts)
const mediaToEras = {
  // MOVIES
  movies: {
    'The Phantom Menace': [ERAS.GALACTIC_REPUBLIC],
    'Attack of the Clones': [ERAS.GALACTIC_REPUBLIC],
    'Revenge of the Sith': [ERAS.GALACTIC_REPUBLIC], // Changed: removed GALACTIC_EMPIRE
    'A New Hope': [ERAS.GALACTIC_EMPIRE],
    'The Empire Strikes Back': [ERAS.GALACTIC_EMPIRE],
    'Return of the Jedi': [ERAS.GALACTIC_EMPIRE], // Changed: removed NEW_REPUBLIC
    'The Force Awakens': [ERAS.NEW_REPUBLIC],
    'The Last Jedi': [ERAS.NEW_REPUBLIC],
    'The Rise of Skywalker': [ERAS.NEW_REPUBLIC],
    'Rogue One': [ERAS.GALACTIC_EMPIRE],
    'Solo': [ERAS.GALACTIC_EMPIRE],
  },

  // TV SHOWS
  tv: {
    'Ahsoka': [ERAS.NEW_REPUBLIC],
    'Andor': [ERAS.GALACTIC_EMPIRE],
    'Obi-Wan Kenobi': [ERAS.GALACTIC_EMPIRE],
    'Rebels': [ERAS.GALACTIC_EMPIRE],
    'Resistance': [ERAS.NEW_REPUBLIC],
    'Forces of Destiny': [], // Changed: removed all eras (anthology spanning all)
    'The Bad Batch': [ERAS.GALACTIC_EMPIRE],
    'The Clone Wars': [ERAS.GALACTIC_REPUBLIC],
    'Visions': [], // Changed: removed all eras (anthology spanning all)
    'Young Jedi Adventures': [ERAS.HIGH_REPUBLIC],
    'Tales of the Empire': [], // Changed: removed all eras (anthology)
    'Tales of the Jedi': [], // Changed: removed all eras (anthology)
    'The Acolyte': [ERAS.HIGH_REPUBLIC],
    'The Book of Boba Fett': [ERAS.NEW_REPUBLIC],
    'The Mandalorian': [ERAS.NEW_REPUBLIC],
  },

  // GAMES
  games: {
    'Battlefront': [],
    'Battlefront II': [],
    'Jedi: Fallen Order': [ERAS.GALACTIC_EMPIRE],
    'Jedi: Survivor': [ERAS.GALACTIC_EMPIRE],
    'Commander': [], // Changed: removed all eras (spans all eras)
    'Galaxy of Heroes': [], // Changed: removed all eras (spans all eras)
    'Knights of the Old Republic': [ERAS.OLD_REPUBLIC],
    'Republic Commando': [ERAS.GALACTIC_REPUBLIC],
    'Squadrons': [], // Changed: removed NEW_REPUBLIC (could span eras)
    'The Old Republic': [ERAS.OLD_REPUBLIC],
  },

  // BOOKS/COMICS (empty for now)
  booksComics: {},
};

/**
 * Get eras from a character's media appearances
 */
function getErasFromMedia(movieAppearances = [], tvAppearances = [], gameAppearances = [], bookAppearances = []) {
  const eras = new Set();

  // Process movies
  movieAppearances.forEach(movie => {
    if (movie === 'None') return;
    const movieEras = mediaToEras.movies[movie];
    if (movieEras) {
      movieEras.forEach(era => eras.add(era));
    }
  });

  // Process TV shows
  tvAppearances.forEach(show => {
    if (show === 'None') return;
    const tvEras = mediaToEras.tv[show];
    if (tvEras) {
      tvEras.forEach(era => eras.add(era));
    }
  });

  // Process games
  gameAppearances.forEach(game => {
    if (game === 'None') return;
    const gameEras = mediaToEras.games[game];
    if (gameEras) {
      gameEras.forEach(era => eras.add(era));
    }
  });

  // Process books/comics
  bookAppearances.forEach(book => {
    if (book === 'None') return;
    const bookEras = mediaToEras.booksComics[book];
    if (bookEras) {
      bookEras.forEach(era => eras.add(era));
    }
  });

  // Sort by chronological order
  const eraOrder = [
    ERAS.OLD_REPUBLIC,
    ERAS.HIGH_REPUBLIC,
    ERAS.GALACTIC_REPUBLIC,
    ERAS.GALACTIC_EMPIRE,
    ERAS.NEW_REPUBLIC,
  ];

  return Array.from(eras).sort((a, b) => eraOrder.indexOf(a) - eraOrder.indexOf(b));
}

// Load characters
const charactersPath = path.join(__dirname, '../src/data/characters.json');
const characters = JSON.parse(fs.readFileSync(charactersPath, 'utf8'));

let updated = 0;
let skipped = 0;
let noMedia = 0;

characters.forEach(char => {
  const { movieAppearances, tvAppearances, gameAppearances, bookAppearances } = char;
  
  // Check if character has any media appearances
  const hasMovies = movieAppearances && movieAppearances.length > 0 && movieAppearances[0] !== 'None';
  const hasTV = tvAppearances && tvAppearances.length > 0 && tvAppearances[0] !== 'None';
  const hasGames = gameAppearances && gameAppearances.length > 0 && gameAppearances[0] !== 'None';
  const hasBooks = bookAppearances && bookAppearances.length > 0 && bookAppearances[0] !== 'None';
  
  if (!hasMovies && !hasTV && !hasGames && !hasBooks) {
    console.log(`⏭️  ${char.name} - No media appearances found`);
    noMedia++;
    return;
  }
  
  // Get eras from media
  const derivedEras = getErasFromMedia(
    movieAppearances || [],
    tvAppearances || [],
    gameAppearances || [],
    bookAppearances || []
  );
  
  if (derivedEras.length === 0) {
    console.log(`⚠️  ${char.name} - Has media but no era mappings found`);
    skipped++;
    return;
  }
  
  // Always replace with derived eras (don't check if changed)
  // This ensures we remove eras that are no longer applicable
  const oldEras = char.eras || [];
  const oldErasStr = oldEras.length > 0 ? oldEras.join(', ') : 'None';
  const newErasStr = derivedEras.join(', ');
  
  if (oldErasStr !== newErasStr) {
    char.eras = derivedEras;
    updated++;
    console.log(`✅ ${char.name}:`);
    console.log(`   Old: ${oldErasStr}`);
    console.log(`   New: ${newErasStr}`);
  } else {
    console.log(`✓  ${char.name} - Already correct`);
    skipped++;
  }
});

// Save updated characters
fs.writeFileSync(charactersPath, JSON.stringify(characters, null, 2));

console.log('\n' + '='.repeat(60));
console.log('📊 Summary:');
console.log('='.repeat(60));
console.log(`Total characters: ${characters.length}`);
console.log(`Updated: ${updated}`);
console.log(`Already correct: ${skipped}`);
console.log(`No media: ${noMedia}`);
console.log('='.repeat(60));

console.log('\n✅ Eras updated based on media appearances!');
