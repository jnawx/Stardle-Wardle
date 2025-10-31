/**
 * Game Configuration
 * Control which attributes are used in gameplay
 */

export interface GameConfig {
  attributes: {
    // Core attributes (always enabled)
    species: boolean;
    sex: boolean;
    hairColor: boolean;
    eyeColor: boolean;
    homeworld: boolean;
    affiliations: boolean;
    eras: boolean;
    weapons: boolean;
    forceUser: boolean;
    speaksBasic: boolean;
    
    // Media appearance attributes (can be toggled)
    movieAppearances: boolean;
    tvAppearances: boolean;
    gameAppearances: boolean;
    bookComicAppearances: boolean;
  };
}

/**
 * Default game configuration
 * Set attributes to false to disable them in gameplay
 */
export const defaultGameConfig: GameConfig = {
  attributes: {
    // Core attributes - always enabled
    species: true,
    sex: true,
    hairColor: true,
    eyeColor: true,
    homeworld: true,
    affiliations: true,
    eras: true,
    weapons: true,
    forceUser: true,
    speaksBasic: true,
    
    // Media appearances - can be toggled
    movieAppearances: true,
    tvAppearances: true,
    gameAppearances: true,
    bookComicAppearances: false, // Disabled by default (no data yet)
  },
};

/**
 * Get list of enabled attribute keys based on config
 * Returns attributes in the desired display order
 */
export function getEnabledAttributes(config: GameConfig = defaultGameConfig): string[] {
  // Define the desired order of attributes
  const attributeOrder = [
    'species',
    'sex',
    'hairColor',
    'eyeColor',
    'homeworld',
    'forceUser',
    'speaksBasic', // Added after forceUser
    'movieAppearances',
    'tvAppearances',
    'gameAppearances',
    'bookComicAppearances',
    'affiliations',
    'eras',
    'weapons',
  ];
  
  // Filter to only enabled attributes while maintaining order
  return attributeOrder.filter(key => config.attributes[key as keyof typeof config.attributes]);
}

/**
 * Get display names for attributes
 */
export const attributeDisplayNames: Record<string, string> = {
  species: 'Species',
  sex: 'Sex',
  hairColor: 'Hair Color',
  eyeColor: 'Eye Color',
  homeworld: 'World',
  affiliations: 'Affiliation',
  eras: 'Era',
  weapons: 'Weapon',
  forceUser: 'Force User',
  speaksBasic: 'Speaks Basic',
  movieAppearances: 'Movies',
  tvAppearances: 'TV Shows',
  gameAppearances: 'Games',
  bookComicAppearances: 'Books/Comics',
};
