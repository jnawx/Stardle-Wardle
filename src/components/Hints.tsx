import { useState, useEffect } from 'react';

interface HintsProps {
  quoteHint?: string;
  masterHint?: string;
  guessCount: number;
  quoteHintUsed: boolean;
  masterHintUsed: boolean;
  onQuoteHintClick: () => void;
  onMasterHintClick: () => void;
}

const Hints = ({
  quoteHint,
  masterHint,
  guessCount,
  quoteHintUsed,
  masterHintUsed,
  onQuoteHintClick,
  onMasterHintClick,
}: HintsProps) => {
  const [showQuoteHint, setShowQuoteHint] = useState(false);
  const [showMasterHint, setShowMasterHint] = useState(false);
  const [quoteJustEnabled, setQuoteJustEnabled] = useState(false);
  const [masterJustEnabled, setMasterJustEnabled] = useState(false);

  const quoteHintEnabled = guessCount >= 4;
  const masterHintEnabled = guessCount >= 7;

  // Flash animation when hints become available
  useEffect(() => {
    if (quoteHintEnabled && !quoteHintUsed && guessCount === 4) {
      setQuoteJustEnabled(true);
      setTimeout(() => setQuoteJustEnabled(false), 2000);
    }
  }, [quoteHintEnabled, quoteHintUsed, guessCount]);

  useEffect(() => {
    if (masterHintEnabled && !masterHintUsed && guessCount === 7) {
      setMasterJustEnabled(true);
      setTimeout(() => setMasterJustEnabled(false), 2000);
    }
  }, [masterHintEnabled, masterHintUsed, guessCount]);

  const handleQuoteHintClick = () => {
    if (!quoteHintUsed && quoteHintEnabled) {
      setShowQuoteHint(true);
      onQuoteHintClick();
    }
  };

  const handleMasterHintClick = () => {
    if (!masterHintUsed && masterHintEnabled) {
      setShowMasterHint(true);
      onMasterHintClick();
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Quote Hint Icon */}
      <div className="relative group">
        <button
          onClick={handleQuoteHintClick}
          disabled={!quoteHintEnabled}
          className={`p-2 rounded-lg transition-all duration-300 ${
            quoteHintUsed
              ? 'opacity-50 text-sw-yellow hover:bg-gray-700 cursor-pointer'
              : quoteHintEnabled
              ? quoteJustEnabled
                ? 'opacity-100 animate-pulse text-sw-yellow hover:bg-gray-700'
                : 'opacity-100 text-sw-yellow hover:bg-gray-700 cursor-pointer'
              : 'opacity-20 cursor-not-allowed text-gray-500'
          }`}
          title={
            quoteHintUsed
              ? 'Quote hint (click to view again)'
              : quoteHintEnabled
              ? 'Click for quote hint'
              : `Quote hint unlocks after 4 guesses (${4 - guessCount} more)`
          }
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </button>
        {/* Tooltip */}
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          {quoteHintUsed ? 'View' : quoteHintEnabled ? 'Quote' : `4 guesses`}
        </div>
      </div>

      {/* Master Hint Icon */}
      <div className="relative group">
        <button
          onClick={handleMasterHintClick}
          disabled={!masterHintEnabled}
          className={`p-2 rounded-lg transition-all duration-300 ${
            masterHintUsed
              ? 'opacity-50 text-purple-400 hover:bg-gray-700 cursor-pointer'
              : masterHintEnabled
              ? masterJustEnabled
                ? 'opacity-100 animate-pulse text-purple-400 hover:bg-gray-700'
                : 'opacity-100 text-purple-400 hover:bg-gray-700 cursor-pointer'
              : 'opacity-20 cursor-not-allowed text-gray-500'
          }`}
          title={
            masterHintUsed
              ? 'Master hint (click to view again)'
              : masterHintEnabled
              ? 'Click for master hint'
              : `Master hint unlocks after 7 guesses (${7 - guessCount} more)`
          }
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </button>
        {/* Tooltip */}
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          {masterHintUsed ? 'View' : masterHintEnabled ? 'Master' : `7 guesses`}
        </div>
      </div>

      {/* Hint Display Modals */}
      {showQuoteHint && quoteHint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowQuoteHint(false)}>
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-sw-yellow" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              <h3 className="text-lg font-bold text-white">Quote Hint</h3>
            </div>
            <div className="bg-gray-900 rounded p-4 border-l-4 border-sw-yellow mb-4">
              <p className="text-white italic">"{quoteHint}"</p>
            </div>
            <button
              onClick={() => setShowQuoteHint(false)}
              className="w-full py-2 px-4 bg-sw-yellow text-black rounded font-semibold hover:bg-yellow-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showMasterHint && masterHint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowMasterHint(false)}>
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-bold text-white">Master Hint</h3>
            </div>
            <div className="bg-gray-900 rounded p-4 border-l-4 border-purple-400 mb-4">
              <p className="text-white">{masterHint}</p>
            </div>
            <button
              onClick={() => setShowMasterHint(false)}
              className="w-full py-2 px-4 bg-purple-500 text-white rounded font-semibold hover:bg-purple-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hints;
