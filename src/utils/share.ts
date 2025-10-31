import type { Guess } from '../types/character';

export function generateShareText(
  guesses: Guess[],
  isWon: boolean,
  characterName: string,
  dayNumber: number
): string {
  const emoji = guesses.map(guess => {
    return guess.comparisons.map(comp => {
      switch (comp.match) {
        case 'exact':
          return '🟢';
        case 'partial':
          return '🟡';
        default:
          return '⚫';
      }
    }).join('');
  }).join('\n');

  const result = isWon ? `${guesses.length}/∞` : 'X/∞';
  
  return `Star Wars Character-dle #${dayNumber} ${result}\n\n${emoji}`;
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text)
      .then(() => true)
      .catch(() => false);
  }
  
  // Fallback for older browsers
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  document.body.appendChild(textArea);
  textArea.select();
  
  try {
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return Promise.resolve(true);
  } catch (err) {
    document.body.removeChild(textArea);
    return Promise.resolve(false);
  }
}

export function getDayNumber(): number {
  // Calculate days since epoch (or a fixed start date)
  const startDate = new Date('2025-01-01');
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
