import fs from 'fs';

console.log('📊 Media Appearances Statistics\n');

const characters = JSON.parse(fs.readFileSync('./src/data/characters.json', 'utf8'));

const stats = {
  total: 0,
  withMovies: 0,
  withTV: 0,
  withGames: 0,
  withBooks: 0,
  totalMovieAppearances: 0,
  totalTVAppearances: 0,
  totalGameAppearances: 0,
  totalBookAppearances: 0
};

characters.forEach(char => {
  if (!char.name) return;
  
  stats.total++;
  
  if (char.movieAppearances && char.movieAppearances.length > 0) {
    stats.withMovies++;
    stats.totalMovieAppearances += char.movieAppearances.length;
  }
  
  if (char.tvAppearances && char.tvAppearances.length > 0) {
    stats.withTV++;
    stats.totalTVAppearances += char.tvAppearances.length;
  }
  
  if (char.gameAppearances && char.gameAppearances.length > 0) {
    stats.withGames++;
    stats.totalGameAppearances += char.gameAppearances.length;
  }
  
  if (char.bookComicAppearances && char.bookComicAppearances.length > 0) {
    stats.withBooks++;
    stats.totalBookAppearances += char.bookComicAppearances.length;
  }
});

console.log(`Total Characters: ${stats.total}\n`);

console.log('📽️  Movie Appearances:');
console.log(`   Characters with movies: ${stats.withMovies}/${stats.total} (${Math.round(stats.withMovies/stats.total*100)}%)`);
console.log(`   Total movie entries: ${stats.totalMovieAppearances}`);
console.log(`   Average per character: ${stats.withMovies > 0 ? (stats.totalMovieAppearances/stats.withMovies).toFixed(1) : 0}\n`);

console.log('📺 TV Appearances:');
console.log(`   Characters with TV shows: ${stats.withTV}/${stats.total} (${Math.round(stats.withTV/stats.total*100)}%)`);
console.log(`   Total TV entries: ${stats.totalTVAppearances}`);
console.log(`   Average per character: ${stats.withTV > 0 ? (stats.totalTVAppearances/stats.withTV).toFixed(1) : 0}\n`);

console.log('🎮 Game Appearances:');
console.log(`   Characters with games: ${stats.withGames}/${stats.total} (${Math.round(stats.withGames/stats.total*100)}%)`);
console.log(`   Total game entries: ${stats.totalGameAppearances}`);
console.log(`   Average per character: ${stats.withGames > 0 ? (stats.totalGameAppearances/stats.withGames).toFixed(1) : 0}\n`);

console.log('📚 Book/Comic Appearances:');
console.log(`   Characters with books/comics: ${stats.withBooks}/${stats.total} (${Math.round(stats.withBooks/stats.total*100)}%)`);
console.log(`   Total book/comic entries: ${stats.totalBookAppearances}`);
console.log(`   Average per character: ${stats.withBooks > 0 ? (stats.totalBookAppearances/stats.withBooks).toFixed(1) : 0}\n`);

// Show some examples
console.log('📋 Sample populated characters:');
const populatedChars = characters.filter(c => 
  c.name && (
    (c.movieAppearances && c.movieAppearances.length > 0) ||
    (c.tvAppearances && c.tvAppearances.length > 0) ||
    (c.gameAppearances && c.gameAppearances.length > 0) ||
    (c.bookComicAppearances && c.bookComicAppearances.length > 0)
  )
).slice(0, 5);

populatedChars.forEach(char => {
  console.log(`\n${char.name}:`);
  if (char.movieAppearances && char.movieAppearances.length > 0) {
    console.log(`   Movies: ${char.movieAppearances.join(', ')}`);
  }
  if (char.tvAppearances && char.tvAppearances.length > 0) {
    console.log(`   TV: ${char.tvAppearances.join(', ')}`);
  }
  if (char.gameAppearances && char.gameAppearances.length > 0) {
    console.log(`   Games: ${char.gameAppearances.join(', ')}`);
  }
  if (char.bookComicAppearances && char.bookComicAppearances.length > 0) {
    console.log(`   Books/Comics: ${char.bookComicAppearances.join(', ')}`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('💡 Next: Use character-manager-pro.html to populate media appearances!');
