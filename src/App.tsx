import { useState, useEffect } from 'react';
import Header from './components/Header';
import CharacterSearch from './components/CharacterSearch';
import ComparisonView from './components/ComparisonView';
import WinModal from './components/WinModal2';
import StatsModal from './components/StatsModal';
import Hints from './components/Hints';
import type { Character, Guess, AccumulatedKnowledge } from './types/character';
import { compareCharacters, getDailyCharacter, getRandomCharacter, getYesterdaysDailyCharacter } from './utils/gameLogic';
import { getStats, saveStats, updateStatsAfterWin } from './utils/stats';
import { getMillisecondsUntilMidnight, formatTimeRemaining } from './utils/timeUtils';
import charactersData from './data/characters.json';

type GameMode = 'daily' | 'random';

function App() {
  const allCharacters = charactersData as Character[];
  // Filter to only enabled characters
  const characters = allCharacters.filter(c => c.enabled);
  
  const [gameMode, setGameMode] = useState<GameMode>('daily');
  const [targetCharacter, setTargetCharacter] = useState<Character>(
    getDailyCharacter(allCharacters)
  );
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(getStats());
  const [knowledge, setKnowledge] = useState<AccumulatedKnowledge>({
    affiliations: [],
    eras: [],
    weapons: [],
    movieAppearances: [],
    tvAppearances: [],
    gameAppearances: [],
    bookComicAppearances: [],
  });
  const [nextKnowledge, setNextKnowledge] = useState<AccumulatedKnowledge | undefined>(undefined);
  const [selectedGuessIndex, setSelectedGuessIndex] = useState(0); // Index of guess to display (0 = latest)
  const [quoteHintUsed, setQuoteHintUsed] = useState(false);
  const [masterHintUsed, setMasterHintUsed] = useState(false);
  const [pendingKnowledgeTimer, setPendingKnowledgeTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [pendingWinTimer, setPendingWinTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Update countdown timer (always runs to show when next daily character arrives)
  useEffect(() => {
    const updateTimer = () => {
      const ms = getMillisecondsUntilMidnight();
      setTimeRemaining(formatTimeRemaining(ms));
    };
    
    updateTimer(); // Initial update
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Save stats when won
  useEffect(() => {
    if (isWon && guesses.length > 0 && gameMode === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      const newStats = updateStatsAfterWin(stats, guesses.length, today);
      saveStats(newStats);
      setStats(newStats);
    }
  }, [isWon, gameMode]);

  // Reset game state (used by both mode switching and new random game)
  const resetGameState = () => {
    setGuesses([]);
    setIsWon(false);
    setShowWinModal(false);
    setQuoteHintUsed(false);
    setMasterHintUsed(false);
    setSelectedGuessIndex(0);
    setKnowledge({
      affiliations: [],
      eras: [],
      weapons: [],
      movieAppearances: [],
      tvAppearances: [],
      gameAppearances: [],
      bookComicAppearances: [],
    });
    setNextKnowledge(undefined);
    
    // Clear any pending timers
    if (pendingKnowledgeTimer) {
      clearTimeout(pendingKnowledgeTimer);
      setPendingKnowledgeTimer(null);
    }
    if (pendingWinTimer) {
      clearTimeout(pendingWinTimer);
      setPendingWinTimer(null);
    }
  };

  // Handle mode switching
  const handleModeSwitch = (mode: GameMode) => {
    if (mode === gameMode) return;
    
    setGameMode(mode);
    resetGameState();
    
    // Set new target character based on mode
    if (mode === 'daily') {
      setTargetCharacter(getDailyCharacter(allCharacters));
    } else {
      setTargetCharacter(getRandomCharacter(allCharacters));
    }
  };

  // Handle new random game (for when already in random mode)
  const handleNewRandomGame = () => {
    resetGameState();
    setTargetCharacter(getRandomCharacter(allCharacters));
  };

  const handleGuess = (character: Character) => {
    // Don't allow duplicate guesses
    if (guesses.some(g => g.character.id === character.id)) {
      return;
    }

    const comparisons = compareCharacters(character, targetCharacter);
    const newGuess: Guess = {
      character,
      comparisons,
      timestamp: Date.now(),
    };

    // If there's a pending animation, cancel it and immediately update knowledge
    let baseKnowledge = knowledge;
    if (pendingKnowledgeTimer) {
      clearTimeout(pendingKnowledgeTimer);
      setPendingKnowledgeTimer(null);
      // Immediately apply any pending knowledge
      if (nextKnowledge) {
        setKnowledge(nextKnowledge);
        baseKnowledge = nextKnowledge; // Use this as base for new calculation
      }
    }
    
    if (pendingWinTimer) {
      clearTimeout(pendingWinTimer);
      setPendingWinTimer(null);
    }

    // Calculate new accumulated knowledge based on this guess (using baseKnowledge)
    const newKnowledge = { ...baseKnowledge };
    comparisons.forEach(comp => {
      if (comp.match === 'exact') {
        // Single-value attributes
        if (comp.attribute === 'species') newKnowledge.species = comp.value as string;
        else if (comp.attribute === 'sex') newKnowledge.sex = comp.value as string;
        else if (comp.attribute === 'hairColor') newKnowledge.hairColor = comp.value as string;
        else if (comp.attribute === 'eyeColor') newKnowledge.eyeColor = comp.value as string;
        else if (comp.attribute === 'homeworld') newKnowledge.homeworld = comp.value as string;
        else if (comp.attribute === 'forceUser') newKnowledge.forceUser = comp.value as boolean;
        else if (comp.attribute === 'speaksBasic') newKnowledge.speaksBasic = comp.value as boolean;
      }
      
      // Array attributes: add matched items
      if (comp.matchedItems && comp.matchedItems.length > 0) {
        const arrayAttr = comp.attribute as keyof Pick<AccumulatedKnowledge, 'affiliations' | 'eras' | 'weapons' | 'movieAppearances' | 'tvAppearances' | 'gameAppearances' | 'bookComicAppearances'>;
        const existingItems = new Set(newKnowledge[arrayAttr]);
        comp.matchedItems.forEach(item => existingItems.add(item));
        newKnowledge[arrayAttr] = Array.from(existingItems);
      }
    });
    
    // Store next knowledge for comparison but don't display it yet
    setNextKnowledge(newKnowledge);

    // Add new guess to the beginning of the array (most recent on top)
    setGuesses([newGuess, ...guesses]);
    
    // Reset to show the latest guess
    setSelectedGuessIndex(0);

    const isCorrect = character.id === targetCharacter.id;
    
    // Delay knowledge update until after cascade and slide complete (2800ms cascade + 1000ms slide)
    const knowledgeTimer = setTimeout(() => {
      setKnowledge(newKnowledge);
      setNextKnowledge(undefined);
      setPendingKnowledgeTimer(null);
    }, 3900);
    setPendingKnowledgeTimer(knowledgeTimer);
    
    // Check if won - delay modal appearance with smooth slide in
    if (isCorrect) {
      setIsWon(true);
      // Delay win modal until after all animations complete (extra 500ms for breathing room)
      const winTimer = setTimeout(() => {
        setShowWinModal(true);
        setPendingWinTimer(null);
      }, 4500);
      setPendingWinTimer(winTimer);
    }
  };

  return (
    <div className="min-h-screen bg-sw-space">
      <Header 
        gameMode={gameMode}
        timeRemaining={timeRemaining}
        onModeSwitch={handleModeSwitch}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Search Input with Hints */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
              {/* Hint Icons - only show after first guess */}
              {guesses.length > 0 && !isWon ? (
                <Hints
                  quoteHint={targetCharacter.quoteHint}
                  masterHint={targetCharacter.masterHint}
                  guessCount={guesses.length}
                  quoteHintUsed={quoteHintUsed}
                  masterHintUsed={masterHintUsed}
                  onQuoteHintClick={() => setQuoteHintUsed(true)}
                  onMasterHintClick={() => setMasterHintUsed(true)}
                />
              ) : (
                <div className="w-[88px]"></div>
              )}
              
              {/* Search Bar */}
              <div className="flex-1">
                <CharacterSearch
                  characters={characters}
                  onSelectCharacter={handleGuess}
                  disabled={isWon}
                  guessedCharacterIds={guesses.map(g => g.character.id)}
                />
              </div>
              
              {/* Spacer for visual balance */}
              <div className="w-[88px]"></div>
            </div>
          </div>

          {/* Win Message */}
          {showWinModal && (
            <div className="animate-slide-up">
              <WinModal 
                character={targetCharacter} 
                guessCount={guesses.length}
                quoteHintUsed={quoteHintUsed}
                masterHintUsed={masterHintUsed}
              />
              
              {/* New Game button for Random mode */}
              {gameMode === 'random' && (
                <div className="mt-4 text-center">
                  <button
                    onClick={handleNewRandomGame}
                    className="bg-sw-yellow text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-300 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    🎲 New Random Game
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Stats Modal */}
          {showStats && (
            <StatsModal stats={stats} onClose={() => setShowStats(false)} />
          )}

          {/* Two Column Layout: Selected Guess | Accumulated Knowledge */}
          {/* Only show after first guess */}
          {guesses.length > 0 && (
            <div className="mb-8">
              <ComparisonView
                latestGuess={guesses[selectedGuessIndex]}
                guessNumber={guesses.length - selectedGuessIndex}
                totalGuesses={guesses.length}
                knowledge={knowledge}
                targetCharacter={targetCharacter}
                nextKnowledge={selectedGuessIndex === 0 ? nextKnowledge : undefined}
                isWinningGuess={isWon && selectedGuessIndex === 0}
              />
            </div>
          )}

          {/* Guess Carousel */}
          {guesses.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-white mb-4 text-center">All Guesses</h3>
              <div className="relative max-w-3xl mx-auto">
                <div className="flex items-center justify-between">
                  {/* Left Arrow - for pagination only */}
                  <button
                    onClick={() => {
                      const container = document.getElementById('carousel-container');
                      if (container) container.scrollBy({ left: -200, behavior: 'smooth' });
                    }}
                    disabled={guesses.length <= 6}
                    className={`p-2 rounded-lg transition-colors ${
                      guesses.length <= 6
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-40'
                        : 'bg-sw-yellow text-black hover:bg-yellow-300 cursor-pointer'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Carousel Items - left-aligned */}
                  <div id="carousel-container" className="flex gap-2 overflow-x-auto overflow-y-hidden px-2 py-1 scroll-smooth flex-1 mx-2">
                    {guesses.map((guess, index) => (
                      <button
                        key={guess.timestamp}
                        onClick={() => setSelectedGuessIndex(index)}
                        className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-lg transition-all relative ${
                          selectedGuessIndex === index
                            ? 'bg-sw-yellow text-black scale-105 shadow-lg'
                            : 'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                      >
                        <div className={`w-14 h-14 rounded overflow-hidden border-2 ${
                          selectedGuessIndex === index ? 'border-black' : 'border-gray-600'
                        }`}>
                          <img
                            src={guess.character.imageUrl || ''}
                            alt={guess.character.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-sm font-bold">#{guesses.length - index}</div>
                      </button>
                    ))}
                  </div>

                  {/* Right Arrow - for pagination only */}
                  <button
                    onClick={() => {
                      const container = document.getElementById('carousel-container');
                      if (container) container.scrollBy({ left: 200, behavior: 'smooth' });
                    }}
                    disabled={guesses.length <= 6}
                    className={`p-2 rounded-lg transition-colors ${
                      guesses.length <= 6
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-40'
                        : 'bg-sw-yellow text-black hover:bg-yellow-300 cursor-pointer'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {guesses.length === 0 && (
            <>
              <div className="bg-sw-gray rounded-lg p-8 text-center mt-8 border-2 border-gray-700 animate-fade-in">
                <p className="text-2xl text-sw-yellow mb-4 font-bold">
                  🌟 May the Force be with You
                </p>
                <p className="text-gray-300 mb-6">
                  Search for a Star Wars character to begin your quest!
                </p>
                <div className="mt-6 text-sm text-gray-400 space-y-2 inline-block text-left">
                  <div className="flex items-center gap-3">
                    <span className="inline-block w-6 h-6 bg-green-600 rounded"></span>
                    <span>Green = Exact match</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-block w-6 h-6 bg-yellow-600 rounded"></span>
                    <span>Yellow = Partial match (for lists)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-block w-6 h-6 bg-gray-700 rounded"></span>
                    <span>Gray = No match</span>
                  </div>
                </div>
              </div>

              {/* Yesterday's Daily Character - only show in daily mode */}
              {gameMode === 'daily' && (() => {
                const yesterdaysCharacter = getYesterdaysDailyCharacter(allCharacters);
                return (
                  <div className="bg-sw-gray rounded-lg p-6 text-center mt-6 border-2 border-gray-700 animate-fade-in">
                    <p className="text-lg text-gray-300 mb-4 font-semibold">
                      Yesterday's Daily Character
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden border-2 border-sw-yellow">
                        <img
                          src={yesterdaysCharacter.imageUrl || ''}
                          alt={yesterdaysCharacter.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xl font-bold text-sw-yellow">
                        {yesterdaysCharacter.name}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

