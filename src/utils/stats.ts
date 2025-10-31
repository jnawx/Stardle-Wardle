export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>; // { guesses: count }
  lastPlayedDate: string;
}

const STATS_KEY = 'starwarsdle-stats';
const GAME_STATE_KEY = 'starwarsdle-game-state';

export function getStats(): GameStats {
  const stored = localStorage.getItem(STATS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return getDefaultStats();
    }
  }
  return getDefaultStats();
}

function getDefaultStats(): GameStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: {},
    lastPlayedDate: '',
  };
}

export function saveStats(stats: GameStats): void {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function updateStatsAfterWin(currentStats: GameStats, guessCount: number, todayDate: string): GameStats {
  const newStats = { ...currentStats };
  
  newStats.gamesPlayed += 1;
  newStats.gamesWon += 1;
  
  // Update streak
  const yesterday = new Date(new Date(todayDate).getTime() - 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  
  if (currentStats.lastPlayedDate === yesterday || currentStats.lastPlayedDate === todayDate) {
    newStats.currentStreak += 1;
  } else {
    newStats.currentStreak = 1;
  }
  
  newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
  
  // Update guess distribution
  newStats.guessDistribution = { ...currentStats.guessDistribution };
  newStats.guessDistribution[guessCount] = (newStats.guessDistribution[guessCount] || 0) + 1;
  
  newStats.lastPlayedDate = todayDate;
  
  return newStats;
}

export function saveGameState(state: any): void {
  localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
}

export function loadGameState(): any {
  const stored = localStorage.getItem(GAME_STATE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export function clearGameState(): void {
  localStorage.removeItem(GAME_STATE_KEY);
}
