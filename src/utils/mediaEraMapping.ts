/**
 * Media to Era Mapping
 * Maps Star Wars media (movies, TV shows, games, books/comics) to their canonical eras
 */

export interface MediaEraMap {
  movies: Record<string, string[]>;
  tv: Record<string, string[]>;
  games: Record<string, string[]>;
  booksComics: Record<string, string[]>;
}

/**
 * Star Wars Eras (as defined in attribute-options.json)
 */
export const STAR_WARS_ERAS = {
  OLD_REPUBLIC: 'The Old Republic',
  HIGH_REPUBLIC: 'The High Republic',
  GALACTIC_REPUBLIC: 'The Galactic Republic',
  GALACTIC_EMPIRE: 'The Galactic Empire',
  NEW_REPUBLIC: 'The New Republic',
} as const;

/**
 * Complete mapping of all media to their corresponding eras
 */
export const mediaToEraMapping: MediaEraMap = {
  // MOVIES
  movies: {
    'The Phantom Menace': [STAR_WARS_ERAS.GALACTIC_REPUBLIC],
    'Attack of the Clones': [STAR_WARS_ERAS.GALACTIC_REPUBLIC],
    'Revenge of the Sith': [
      STAR_WARS_ERAS.GALACTIC_REPUBLIC,
    ],
    'A New Hope': [STAR_WARS_ERAS.GALACTIC_EMPIRE],
    'The Empire Strikes Back': [STAR_WARS_ERAS.GALACTIC_EMPIRE],
    'Return of the Jedi': [
      STAR_WARS_ERAS.GALACTIC_EMPIRE,
    ],
    'The Force Awakens': [STAR_WARS_ERAS.NEW_REPUBLIC],
    'The Last Jedi': [STAR_WARS_ERAS.NEW_REPUBLIC],
    'The Rise of Skywalker': [STAR_WARS_ERAS.NEW_REPUBLIC],
    'Rogue One': [STAR_WARS_ERAS.GALACTIC_EMPIRE],
    'Solo': [STAR_WARS_ERAS.GALACTIC_EMPIRE],
  },

  // TV SHOWS
  tv: {
    'Ahsoka': [STAR_WARS_ERAS.NEW_REPUBLIC],
    'Andor': [STAR_WARS_ERAS.GALACTIC_EMPIRE],
    'Obi-Wan Kenobi': [STAR_WARS_ERAS.GALACTIC_EMPIRE],
    'Rebels': [STAR_WARS_ERAS.GALACTIC_EMPIRE],
    'Resistance': [STAR_WARS_ERAS.NEW_REPUBLIC],
    'Forces of Destiny': [
    ],
    'The Bad Batch': [STAR_WARS_ERAS.GALACTIC_EMPIRE], // Right after Order 66
    'The Clone Wars': [STAR_WARS_ERAS.GALACTIC_REPUBLIC],
    'Visions': [
    ],
    'Young Jedi Adventures': [STAR_WARS_ERAS.HIGH_REPUBLIC],
    'Tales of the Empire': [
    ],
    'Tales of the Jedi': [
    ],
    'The Acolyte': [STAR_WARS_ERAS.HIGH_REPUBLIC],
    'The Book of Boba Fett': [STAR_WARS_ERAS.NEW_REPUBLIC],
    'The Mandalorian': [STAR_WARS_ERAS.NEW_REPUBLIC],
  },

  // GAMES
  games: {
    'Battlefront': [
      STAR_WARS_ERAS.GALACTIC_REPUBLIC,
      STAR_WARS_ERAS.GALACTIC_EMPIRE,
    ],
    'Battlefront II': [
      STAR_WARS_ERAS.GALACTIC_REPUBLIC,
      STAR_WARS_ERAS.GALACTIC_EMPIRE,
      STAR_WARS_ERAS.NEW_REPUBLIC,
    ],
    'Jedi: Fallen Order': [STAR_WARS_ERAS.GALACTIC_EMPIRE],
    'Jedi: Survivor': [STAR_WARS_ERAS.GALACTIC_EMPIRE],
    'Commander': [
    ],
    'Galaxy of Heroes': [
    ],
    'Knights of the Old Republic': [STAR_WARS_ERAS.OLD_REPUBLIC],
    'Republic Commando': [STAR_WARS_ERAS.GALACTIC_REPUBLIC],
    'Squadrons': [],
    'The Old Republic': [STAR_WARS_ERAS.OLD_REPUBLIC],
  },

  // BOOKS/COMICS (empty for now, can be populated later)
  booksComics: {},
};

/**
 * Get all eras that a character appears in based on their media appearances
 * @param movieAppearances Array of movies the character appears in
 * @param tvAppearances Array of TV shows the character appears in
 * @param gameAppearances Array of games the character appears in
 * @param bookComicAppearances Array of books/comics the character appears in
 * @returns Deduplicated array of eras
 */
export function getErasFromMedia(
  movieAppearances: string[] = [],
  tvAppearances: string[] = [],
  gameAppearances: string[] = [],
  bookComicAppearances: string[] = []
): string[] {
  const eras = new Set<string>();

  // Process movies
  movieAppearances.forEach((movie) => {
    if (movie === 'None') return;
    const movieEras = mediaToEraMapping.movies[movie];
    if (movieEras) {
      movieEras.forEach((era) => eras.add(era));
    }
  });

  // Process TV shows
  tvAppearances.forEach((show) => {
    if (show === 'None') return;
    const tvEras = mediaToEraMapping.tv[show];
    if (tvEras) {
      tvEras.forEach((era) => eras.add(era));
    }
  });

  // Process games
  gameAppearances.forEach((game) => {
    if (game === 'None') return;
    const gameEras = mediaToEraMapping.games[game];
    if (gameEras) {
      gameEras.forEach((era) => eras.add(era));
    }
  });

  // Process books/comics
  bookComicAppearances.forEach((book) => {
    if (book === 'None') return;
    const bookEras = mediaToEraMapping.booksComics[book];
    if (bookEras) {
      bookEras.forEach((era) => eras.add(era));
    }
  });

  // Convert set to array and sort by chronological order
  const eraOrder: string[] = [
    STAR_WARS_ERAS.OLD_REPUBLIC,
    STAR_WARS_ERAS.HIGH_REPUBLIC,
    STAR_WARS_ERAS.GALACTIC_REPUBLIC,
    STAR_WARS_ERAS.GALACTIC_EMPIRE,
    STAR_WARS_ERAS.NEW_REPUBLIC,
  ];

  return Array.from(eras).sort(
    (a, b) => eraOrder.indexOf(a) - eraOrder.indexOf(b)
  );
}

/**
 * Validate that all media in attribute-options.json has an era mapping
 * @param attributeOptions The attribute options object
 * @returns Object with missing mappings
 */
export function validateMediaEraMapping(attributeOptions: {
  movieAppearances: string[];
  tvAppearances: string[];
  gameAppearances: string[];
  bookComicAppearances: string[];
}): {
  missingMovies: string[];
  missingTv: string[];
  missingGames: string[];
  missingBooks: string[];
} {
  const missingMovies = attributeOptions.movieAppearances.filter(
    (movie) => !mediaToEraMapping.movies[movie]
  );
  const missingTv = attributeOptions.tvAppearances.filter(
    (show) => !mediaToEraMapping.tv[show]
  );
  const missingGames = attributeOptions.gameAppearances.filter(
    (game) => !mediaToEraMapping.games[game]
  );
  const missingBooks = attributeOptions.bookComicAppearances.filter(
    (book) => !mediaToEraMapping.booksComics[book]
  );

  return { missingMovies, missingTv, missingGames, missingBooks };
}
