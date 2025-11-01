import type { Character, AttributeKey, MatchResult, AttributeComparison } from '../types/character';
import { defaultGameConfig, getEnabledAttributes } from '../config/gameConfig';

/**
 * Compare two values and return match result with detailed item tracking
 */
function compareValues(
  guessValue: string | string[] | boolean | undefined,
  targetValue: string | string[] | boolean | undefined
): { match: MatchResult; matchedItems?: string[]; unmatchedItems?: string[] } {
  // Handle undefined values
  if (guessValue === undefined || targetValue === undefined) {
    return { match: 'none' };
  }

  // Handle boolean values
  if (typeof guessValue === 'boolean' && typeof targetValue === 'boolean') {
    return { match: guessValue === targetValue ? 'exact' : 'none' };
  }

  // Handle string values
  if (typeof guessValue === 'string' && typeof targetValue === 'string') {
    return { match: guessValue.toLowerCase() === targetValue.toLowerCase() ? 'exact' : 'none' };
  }

  // Handle array values (partial matches allowed)
  if (Array.isArray(guessValue) && Array.isArray(targetValue)) {
    const guessSet = new Set(guessValue.map(v => v.toLowerCase()));
    const targetSet = new Set(targetValue.map(v => v.toLowerCase()));
    
    // Track which items matched and which didn't
    const matchedItems: string[] = [];
    const unmatchedItems: string[] = [];
    
    guessValue.forEach(item => {
      if (targetSet.has(item.toLowerCase())) {
        matchedItems.push(item);
      } else {
        unmatchedItems.push(item);
      }
    });
    
    // Check for exact match (all items match)
    if (guessSet.size === targetSet.size && 
        [...guessSet].every(item => targetSet.has(item))) {
      return { match: 'exact', matchedItems, unmatchedItems };
    }
    
    // Check for partial match (at least one item matches)
    const hasPartialMatch = matchedItems.length > 0;
    return { 
      match: hasPartialMatch ? 'partial' : 'none',
      matchedItems,
      unmatchedItems
    };
  }

  return { match: 'none' };
}

/**
 * Compare a guess character against the target character
 * Uses game config to determine which attributes to compare
 */
export function compareCharacters(
  guessCharacter: Character,
  targetCharacter: Character
): AttributeComparison[] {
  // Get enabled attributes from config
  const enabledAttributeKeys = getEnabledAttributes(defaultGameConfig);
  const attributes = enabledAttributeKeys as AttributeKey[];

  return attributes.map(attribute => {
    const comparisonResult = compareValues(guessCharacter[attribute], targetCharacter[attribute]);
    
    // Check if this is a complete set match for array attributes
    const isCompleteSet = comparisonResult.match === 'exact';
    
    return {
      attribute,
      value: guessCharacter[attribute] ?? [],
      match: comparisonResult.match,
      matchedItems: comparisonResult.matchedItems,
      unmatchedItems: comparisonResult.unmatchedItems,
      isCompleteSet,
    };
  });
}

/**
 * Seeded random number generator for deterministic shuffling
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Shuffle array deterministically based on a seed
 */
function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get a deterministic daily character based on date (uses UTC)
 */
export function getDailyCharacter(characters: Character[], date: Date = new Date()): Character {
  // Reset time to UTC midnight for consistency across timezones
  const dateOnly = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const daysSinceEpoch = Math.floor(dateOnly.getTime() / (1000 * 60 * 60 * 24));
  
  // Filter to enabled characters
  const availableCharacters = characters.filter(c => c.enabled);
  
  if (availableCharacters.length === 0) {
    throw new Error('No enabled characters available');
  }
  
  // Shuffle the characters deterministically using a fixed seed (42 is arbitrary)
  // This ensures the order is randomized but consistent across all users
  const shuffledCharacters = shuffleWithSeed(availableCharacters, 42);
  
  const index = daysSinceEpoch % shuffledCharacters.length;
  
  return shuffledCharacters[index];
}

/**
 * Get yesterday's daily character (uses UTC)
 */
export function getYesterdaysDailyCharacter(characters: Character[]): Character {
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return getDailyCharacter(characters, yesterday);
}

/**
 * Get a random character for practice mode
 */
export function getRandomCharacter(
  characters: Character[],
  excludeId?: string
): Character {
  // Filter to enabled characters only
  let availableCharacters = characters.filter(c => c.enabled);
  
  if (excludeId) {
    availableCharacters = availableCharacters.filter(c => c.id !== excludeId);
  }
  
  if (availableCharacters.length === 0) {
    throw new Error('No enabled characters available');
  }
  
  const randomIndex = Math.floor(Math.random() * availableCharacters.length);
  return availableCharacters[randomIndex];
}


