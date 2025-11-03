import { useState, useEffect } from 'react';
import Header from './components/Header';
import CharacterSearch from './components/CharacterSearch';
import CharacterFilter from './components/CharacterFilter';
import ComparisonView from './components/ComparisonView';
import WinModal from './components/WinModal';
import StatsModal from './components/StatsModal';
import Hints from './components/Hints';
import type { Character, Guess, AccumulatedKnowledge, TagKnowledgeState } from './types/character';
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
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>(characters);
  const [knowledge, setKnowledge] = useState<AccumulatedKnowledge>({
    affiliations: {},
    eras: {},
    weapons: {},
    movieAppearances: {},
    tvAppearances: {},
    gameAppearances: {},
    bookComicAppearances: {},
    affiliationsExact: false,
    erasExact: false,
    weaponsExact: false,
    movieAppearancesExact: false,
    tvAppearancesExact: false,
    gameAppearancesExact: false,
    bookComicAppearancesExact: false,
  });
  const [nextKnowledge, setNextKnowledge] = useState<AccumulatedKnowledge | undefined>(undefined);
  const [selectedGuessIndex, setSelectedGuessIndex] = useState(0); // Index of guess to display (0 = latest)
  const [isNavigatingGuesses, setIsNavigatingGuesses] = useState(false); // True when switching between old guesses
  const [quoteHintUsed, setQuoteHintUsed] = useState(false);
  const [masterHintUsed, setMasterHintUsed] = useState(false);
  const [pendingKnowledgeTimer, setPendingKnowledgeTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [pendingWinTimer, setPendingWinTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);

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

  // Show win modal 1 second after animation completes
  useEffect(() => {
    if (isWon && animationComplete) {
      const winTimer = setTimeout(() => {
        setShowWinModal(true);
      }, 1000);
      setPendingWinTimer(winTimer);
    }
  }, [isWon, animationComplete]);

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
    setAnimationComplete(false);
    setFilteredCharacters(characters); // Reset filter to show all characters
    setKnowledge({
      affiliations: {},
      eras: {},
      weapons: {},
      movieAppearances: {},
      tvAppearances: {},
      gameAppearances: {},
      bookComicAppearances: {},
      affiliationsExact: false,
      erasExact: false,
      weaponsExact: false,
      movieAppearancesExact: false,
      tvAppearancesExact: false,
      gameAppearancesExact: false,
      bookComicAppearancesExact: false,
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

    // Reset navigation flag when making a new guess
    setIsNavigatingGuesses(false);
    setAnimationComplete(false);

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
    const newKnowledge: AccumulatedKnowledge = {
      ...baseKnowledge,
      affiliations: { ...baseKnowledge.affiliations },
      eras: { ...baseKnowledge.eras },
      weapons: { ...baseKnowledge.weapons },
      movieAppearances: { ...baseKnowledge.movieAppearances },
      tvAppearances: { ...baseKnowledge.tvAppearances },
      gameAppearances: { ...baseKnowledge.gameAppearances },
      bookComicAppearances: { ...baseKnowledge.bookComicAppearances },
    };
    
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
      
      // Array attributes: update tag states based on match type
      if (comp.attribute === 'affiliations' || comp.attribute === 'eras' || comp.attribute === 'weapons' ||
          comp.attribute === 'movieAppearances' || comp.attribute === 'tvAppearances' || 
          comp.attribute === 'gameAppearances' || comp.attribute === 'bookComicAppearances') {
        
        const tagStates = newKnowledge[comp.attribute];
        const exactFlagKey = `${comp.attribute}Exact` as keyof AccumulatedKnowledge;
        
        // Check if we already found the exact match in a previous guess
        const alreadyFoundExact = baseKnowledge[exactFlagKey] as boolean;
        
        if (comp.match === 'exact' && comp.isCompleteSet) {
          // Exact match: mark all guessed items as confirmed-match
          if (comp.matchedItems) {
            comp.matchedItems.forEach(item => {
              tagStates[item] = 'confirmed-match';
            });
          }
          (newKnowledge as any)[exactFlagKey] = true;
          
          // NOTE: We DON'T mark unguessed/unconfirmed tags as confirmed-non-match here
          // because we want the animations to play first. This will be done after
          // the animation delay when we apply the knowledge state.
        } else if (alreadyFoundExact) {
          // If we already found exact match previously, any tag we haven't seen must be a non-match
          const guessedTags = Array.isArray(comp.value) ? comp.value as string[] : [];
          guessedTags.forEach(tag => {
            const currentState = tagStates[tag];
            // If tag is not in our knowledge yet, or is unconfirmed, mark it as non-match
            // (confirmed-match tags were already set when we found the exact match)
            if (!currentState || currentState === 'unguessed' || currentState === 'unconfirmed') {
              tagStates[tag] = 'confirmed-non-match';
            }
          });
        } else if (comp.match === 'none') {
          // No matches: mark all guessed items as confirmed-non-match
          if (Array.isArray(comp.value)) {
            (comp.value as string[]).forEach(item => {
              tagStates[item] = 'confirmed-non-match';
            });
          }
        } else if (comp.match === 'partial') {
          // Partial match: complex logic for unconfirmed tags
          const guessedTags = comp.value as string[];
          
          // First, mark all newly guessed tags as unconfirmed (unless already confirmed)
          guessedTags.forEach(tag => {
            const currentState = tagStates[tag] || 'unguessed';
            
            // If already confirmed, don't change
            if (currentState === 'confirmed-match' || currentState === 'confirmed-non-match') {
              return;
            }
            
            // If we already found the exact match, any new tag must be a non-match
            if (alreadyFoundExact) {
              tagStates[tag] = 'confirmed-non-match';
              return;
            }
            
            // Mark as unconfirmed (we can't tell which matched in a partial match)
            tagStates[tag] = 'unconfirmed';
          });
          
          // Smart inference: Try to deduce which tags are matches
          const unconfirmedTags = guessedTags.filter(tag => tagStates[tag] === 'unconfirmed');
          const matchedCount = (comp.matchedItems?.length || 0);
          
          // Single-tag deduction: If only ONE unconfirmed tag in this guess and it's a partial match,
          // and all OTHER tags in this guess are confirmed non-matches, then this tag must be the match
          if (unconfirmedTags.length === 1 && matchedCount > 0) {
            // Check if all other guessed tags are confirmed non-matches
            const allOthersAreNonMatches = guessedTags.filter(t => t !== unconfirmedTags[0])
              .every(t => tagStates[t] === 'confirmed-non-match');
            
            if (allOthersAreNonMatches) {
              // This single unconfirmed tag must be the match
              tagStates[unconfirmedTags[0]] = 'confirmed-match';
            }
          }
        }
      }
    });
    
    // Auto-confirm: If all target tags are individually confirmed as matches, mark category as exact
    const arrayAttributes = ['affiliations', 'eras', 'weapons', 'movieAppearances', 
                             'tvAppearances', 'gameAppearances', 'bookComicAppearances'];
    
    arrayAttributes.forEach(attr => {
      const targetTags = targetCharacter[attr as keyof Character] as string[] | undefined;
      if (!targetTags || targetTags.length === 0) return;
      
      const tagStates = newKnowledge[attr as keyof AccumulatedKnowledge] as any;
      const exactFlagKey = `${attr}Exact` as keyof AccumulatedKnowledge;
      const alreadyExact = newKnowledge[exactFlagKey] as boolean;
      
      if (alreadyExact) return; // Already marked as exact
      
      // Check if ALL target tags are confirmed as matches
      const allTargetTagsConfirmed = targetTags.every(tag => tagStates[tag] === 'confirmed-match');
      
      if (allTargetTagsConfirmed) {
        console.log(`[Auto-confirm] All ${attr} tags individually confirmed, marking as exact match`);
        // Mark category as exact
        (newKnowledge as any)[exactFlagKey] = true;
        
        // Mark any other known tags as confirmed-non-match
        Object.keys(tagStates).forEach(tag => {
          if (tagStates[tag] !== 'confirmed-match' && tagStates[tag] !== 'confirmed-non-match') {
            tagStates[tag] = 'confirmed-non-match';
          }
        });
      }
    });
    
    // Store next knowledge for comparison but don't display it yet
    setNextKnowledge(newKnowledge);

    // Create a snapshot of tag states for this guess (before exact match cleanup)
    const tagStatesSnapshot = {
      affiliations: { ...newKnowledge.affiliations } as TagKnowledgeState,
      eras: { ...newKnowledge.eras } as TagKnowledgeState,
      weapons: { ...newKnowledge.weapons } as TagKnowledgeState,
      movieAppearances: { ...newKnowledge.movieAppearances } as TagKnowledgeState,
      tvAppearances: { ...newKnowledge.tvAppearances } as TagKnowledgeState,
      gameAppearances: { ...newKnowledge.gameAppearances } as TagKnowledgeState,
      bookComicAppearances: { ...newKnowledge.bookComicAppearances } as TagKnowledgeState,
    };
    
    // Attach snapshot to the guess
    newGuess.tagStatesSnapshot = tagStatesSnapshot;

    // Add new guess to the beginning of the array (most recent on top)
    setGuesses([newGuess, ...guesses]);
    
    // Reset to show the latest guess
    setSelectedGuessIndex(0);

    const isCorrect = character.id === targetCharacter.id;
    
    // Delay knowledge update until after cascade and slide complete (2800ms cascade + 1000ms slide)
    const knowledgeTimer = setTimeout(() => {
      // Before applying, mark any unguessed/unconfirmed tags as non-matches for exact matches
      const finalKnowledge = { ...newKnowledge };
      let hasExactMatchCleanup = false;
      
      // Process each array attribute to clean up after exact matches
      const arrayAttributes = ['affiliations', 'eras', 'weapons', 'movieAppearances', 
                               'tvAppearances', 'gameAppearances', 'bookComicAppearances'];
      
      arrayAttributes.forEach(attr => {
        const exactFlagKey = `${attr}Exact` as keyof AccumulatedKnowledge;
        const isExact = finalKnowledge[exactFlagKey] as boolean;
        
        if (isExact) {
          const tagStates = finalKnowledge[attr as keyof AccumulatedKnowledge] as any;
          // Mark all unguessed or unconfirmed tags as confirmed-non-match
          Object.keys(tagStates).forEach(tag => {
            const state = tagStates[tag];
            if (state === 'unguessed' || state === 'unconfirmed') {
              tagStates[tag] = 'confirmed-non-match';
              hasExactMatchCleanup = true;
            }
          });
        }
      });
      
      // If we're doing exact match cleanup, we need to trigger transitions properly
      if (hasExactMatchCleanup) {
        console.log('[Knowledge Update] Exact match cleanup detected, setting nextKnowledge first');
        // First, set nextKnowledge so ComparisonView sees what's about to change
        setNextKnowledge(finalKnowledge);
        // Wait for render, then trigger the actual knowledge update to start CSS transitions
        setTimeout(() => {
          console.log('[Knowledge Update] Updating knowledge after 50ms');
          setKnowledge(finalKnowledge);
          // Keep nextKnowledge around longer for fade-out detection
          setTimeout(() => {
            console.log('[Knowledge Update] Clearing nextKnowledge after 1500ms');
            setNextKnowledge(undefined);
          }, 1500); // Keep it for transition (700ms) + fade-out (700ms) + buffer
        }, 50);
      } else {
        // No exact match cleanup needed, just update normally
        setKnowledge(finalKnowledge);
        setNextKnowledge(undefined);
      }
      setPendingKnowledgeTimer(null);
    }, 3900);
    setPendingKnowledgeTimer(knowledgeTimer);
    
    // Check if won
    if (isCorrect) {
      setIsWon(true);
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
          {/* Character Filter */}
          {!showWinModal && guesses.length === 0 && (
            <CharacterFilter
              characters={characters}
              guessedCharacterIds={[]}
              onFilterChange={setFilteredCharacters}
            />
          )}

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
              {!showWinModal && (
                <div className="flex-1">
                  <CharacterSearch
                    characters={filteredCharacters}
                    onSelectCharacter={handleGuess}
                    disabled={isWon}
                    guessedCharacterIds={guesses.map(g => g.character.id)}
                  />
                </div>
              )}
              
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
                isNavigating={isNavigatingGuesses}
                previousGuess={selectedGuessIndex < guesses.length - 1 ? guesses[selectedGuessIndex + 1] : undefined}
                onAnimationComplete={(isWinning) => isWinning && setAnimationComplete(true)}
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
                        onClick={() => {
                          // Only trigger animation if clicking a different guess
                          if (index !== selectedGuessIndex) {
                            setIsNavigatingGuesses(true);
                            setSelectedGuessIndex(index);
                          }
                        }}
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

