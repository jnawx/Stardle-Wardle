export interface Character {
  id: string;
  name: string;
  additionalNames?: string[]; // Aliases or alternate names
  // Core attributes
  species: string;
  sex: string;
  hairColor: string;
  eyeColor: string;
  homeworld: string;
  affiliations: string[];
  eras: string[];
  weapons: string[];
  forceUser: boolean;
  speaksBasic: boolean;
  // Media appearances
  movieAppearances?: string[];
  tvAppearances?: string[];
  gameAppearances?: string[];
  bookComicAppearances?: string[];
  // Metadata
  enabled: boolean;
  // Hints
  quoteHint?: string;
  masterHint?: string;
  // Optional future attributes
  height?: number;
  firstAppearance?: string;
  status?: string;
  birthYear?: string;
  imageUrl?: string;
}

export type AttributeKey = 
  | 'species'
  | 'sex'
  | 'hairColor'
  | 'eyeColor'
  | 'homeworld'
  | 'affiliations'
  | 'eras'
  | 'weapons'
  | 'forceUser'
  | 'speaksBasic'
  | 'movieAppearances'
  | 'tvAppearances'
  | 'gameAppearances'
  | 'bookComicAppearances';

export type MatchResult = 'exact' | 'partial' | 'none';

export interface AttributeComparison {
  attribute: AttributeKey;
  value: string | string[] | boolean | undefined;
  match: MatchResult;
  // For array values, track which items matched and which didn't
  matchedItems?: string[];
  unmatchedItems?: string[];
}

export interface Guess {
  character: Character;
  comparisons: AttributeComparison[];
  timestamp: number;
}

// Tracks what we've learned about the target character across all guesses
export interface AccumulatedKnowledge {
  // Single-value attributes that have been confirmed
  species?: string;
  sex?: string;
  hairColor?: string;
  eyeColor?: string;
  homeworld?: string;
  forceUser?: boolean;
  speaksBasic?: boolean;
  // Array attributes: track confirmed matching items
  affiliations: string[];
  eras: string[];
  weapons: string[];
  movieAppearances: string[];
  tvAppearances: string[];
  gameAppearances: string[];
  bookComicAppearances: string[];
}

export type GameMode = 'daily' | 'practice';

export interface GameState {
  mode: GameMode;
  targetCharacter: Character;
  guesses: Guess[];
  isComplete: boolean;
  isWon: boolean;
}
