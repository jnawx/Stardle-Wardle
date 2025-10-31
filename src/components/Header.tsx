type GameMode = 'daily' | 'random';

interface HeaderProps {
  gameMode: GameMode;
  timeRemaining: string;
  onModeSwitch: (mode: GameMode) => void;
}

export default function Header({ gameMode, timeRemaining, onModeSwitch }: HeaderProps) {
  return (
    <header className="border-b border-sw-yellow py-4 bg-sw-black">
      <div className="container mx-auto px-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Mode Toggle and Timer */}
          <div className="flex flex-col gap-2">
            {/* Mode Toggle */}
            <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
              <button
                onClick={() => onModeSwitch('daily')}
                className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-all cursor-pointer flex items-center justify-center ${
                  gameMode === 'daily'
                    ? 'bg-sw-yellow text-black'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => onModeSwitch('random')}
                className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-all cursor-pointer flex items-center justify-center ${
                  gameMode === 'random'
                    ? 'bg-sw-yellow text-black'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Random
              </button>
            </div>
            
            {/* Timer - countdown to next daily character */}
            {timeRemaining && (
              <div className="flex items-center justify-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5 border border-gray-700">
                <svg className="w-3 h-3 text-sw-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-mono text-gray-300">{timeRemaining}</span>
              </div>
            )}
          </div>

          {/* Center: Title */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-sw-yellow text-center tracking-wider">
              STAR WARS CHARACTER-DLE
            </h1>
            <p className="text-center text-gray-400 mt-2 text-sm">
              Guess the Star Wars character!
            </p>
          </div>
          
          {/* Right: Spacer for balance */}
          <div className="w-[140px]"></div>
        </div>
      </div>
    </header>
  );
}
