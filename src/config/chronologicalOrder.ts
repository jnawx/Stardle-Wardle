/**
 * Canonical chronological ordering for Star Wars eras, movies, and TV shows
 */

export const eraOrder: string[] = [
  'The Old Republic',
  'The High Republic',
  'The Galactic Republic',
  'The Galactic Empire',
  'The New Republic'
];

export const movieOrder: string[] = [
  'The Phantom Menace',
  'Attack of the Clones',
  'The Clone Wars', // Animated movie
  'Revenge of the Sith',
  'Solo',
  'Rogue One',
  'A New Hope',
  'The Empire Strikes Back',
  'Return of the Jedi',
  'The Force Awakens',
  'The Last Jedi',
  'The Rise of Skywalker'
];

export const tvShowOrder: string[] = [
  'The Acolyte',
  'Young Jedi Adventures',
  'Tales of the Jedi', // Anthology spanning multiple eras
  'The Clone Wars',
  'The Bad Batch',
  'Tales of the Empire', // Anthology spanning multiple eras
  'Obi-Wan Kenobi',
  'Rebels',
  'Andor',
  'Rogue One', // If TV movie
  'Solo', // If TV movie
  'Forces of Destiny', // Anthology spanning OT era
  'The Mandalorian',
  'The Book of Boba Fett',
  'Ahsoka',
  'Resistance',
  'Visions' // Non-canon anthology
];

/**
 * Sort an array of values based on a canonical order
 * Items not in the order list will be placed at the end alphabetically
 */
export function sortByOrder(items: string[], orderList: string[]): string[] {
  return [...items].sort((a, b) => {
    const indexA = orderList.indexOf(a);
    const indexB = orderList.indexOf(b);
    
    // If both items are in the order list, sort by their position
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    
    // If only a is in the order list, it comes first
    if (indexA !== -1) return -1;
    
    // If only b is in the order list, it comes first
    if (indexB !== -1) return 1;
    
    // If neither is in the order list, sort alphabetically
    return a.localeCompare(b);
  });
}
