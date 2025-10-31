import type { GameStats } from '../utils/stats';

interface StatsModalProps {
  stats: GameStats;
  onClose: () => void;
}

export default function StatsModal({ stats, onClose }: StatsModalProps) {
  const winPercentage = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;

  const maxGuessCount = Math.max(
    ...Object.keys(stats.guessDistribution).map(Number),
    1
  );
  
  const maxDistributionValue = Math.max(
    ...Object.values(stats.guessDistribution),
    1
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-sw-gray border-2 border-sw-yellow rounded-lg max-w-md w-full p-6 relative animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-sw-yellow mb-6 text-center">
          Statistics
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{stats.gamesPlayed}</div>
            <div className="text-xs text-gray-400">Played</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{winPercentage}</div>
            <div className="text-xs text-gray-400">Win %</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{stats.currentStreak}</div>
            <div className="text-xs text-gray-400">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{stats.maxStreak}</div>
            <div className="text-xs text-gray-400">Max Streak</div>
          </div>
        </div>

        {/* Guess Distribution */}
        <div className="mt-6">
          <h3 className="text-sm font-bold text-gray-400 mb-3">GUESS DISTRIBUTION</h3>
          <div className="space-y-1">
            {Array.from({ length: Math.min(maxGuessCount, 10) }, (_, i) => i + 1).map((guessNum) => {
              const count = stats.guessDistribution[guessNum] || 0;
              const percentage = maxDistributionValue > 0
                ? (count / maxDistributionValue) * 100
                : 0;
              
              return (
                <div key={guessNum} className="flex items-center gap-2">
                  <div className="text-xs text-gray-400 w-4">{guessNum}</div>
                  <div className="flex-1 bg-gray-700 rounded overflow-hidden h-6">
                    <div
                      className="bg-sw-yellow h-full flex items-center justify-end pr-2 transition-all duration-300"
                      style={{ width: `${Math.max(percentage, count > 0 ? 10 : 0)}%` }}
                    >
                      {count > 0 && (
                        <span className="text-xs font-bold text-black">{count}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
