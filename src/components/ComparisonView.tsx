import { useEffect, useState, useMemo, useRef } from 'react';
import type { Guess, AccumulatedKnowledge, Character, AttributeComparison } from '../types/character';
import { attributeDisplayNames } from '../config/gameConfig';
import { eraOrder, movieOrder, tvShowOrder } from '../config/chronologicalOrder';

interface ComparisonViewProps {
  latestGuess: Guess;
  guessNumber: number;
  totalGuesses: number;
  knowledge: AccumulatedKnowledge;
  targetCharacter: Character;
  nextKnowledge?: AccumulatedKnowledge;
  isWinningGuess?: boolean;
  isNavigating?: boolean; // True when switching between existing guesses
  previousGuess?: Guess; // Previous guess for tag state comparison
  onAnimationComplete?: (isWinning: boolean) => void;
}

// Define the media types for labeling
const MEDIA_TYPES = {
  movieAppearances: 'Movies',
  tvAppearances: 'TV',
  gameAppearances: 'Games',
  bookAppearances: 'Books'
} as const;

// Animation type and constants
type AnimationPhase = 'hidden' | 'cascade' | 'slideNew' | 'colorTransition' | 'fadeGray' | 'consolidate' | 'updateBoxes' | 'slideCharacter' | 'checkWin' | 'complete';

const ANIMATION_PHASES: AnimationPhase[] = ['hidden', 'cascade', 'slideNew', 'colorTransition', 'fadeGray', 'consolidate', 'updateBoxes', 'slideCharacter', 'checkWin', 'complete'];

const PHASE_DURATIONS = {
  hidden: 100,
  cascade: (isNavigating: boolean) => {
    // Calculate cascade duration based on animation type to ensure all cells complete
    const maxIndex = 14; // Maximum number of rows that can animate
    const animationDuration = 500; // Cell animation duration in ms
    const maxDelay = isNavigating
      ? maxIndex * ANIMATION_DELAYS.navigation // ~700ms for navigation
      : maxIndex * ANIMATION_DELAYS.newGuess;  // ~1820ms for new guesses
    return maxDelay + animationDuration; // Ensure cascade phase lasts long enough for all cells
  },
  slideNew: 1000,  // New tags/values slide in from left
  colorTransition: 1000, // Tags transition from orange to green
  fadeGray: 1000,  // Non-matching tags fade to gray and shrink
  consolidate: 500, // Remaining tags slide together to fill space
  updateBoxes: 1000, // Box colors change
  slideCharacter: 2000 // Character image slides in (winning animation)
} as const;

const ANIMATION_DELAYS = {
  navigation: 50,  // Quick cascade for navigation
  newGuess: 130,   // Slower cascade for new guesses
  singleValue: 150 // Single value attribute delays
} as const;

// Derived animation durations based on PHASE_DURATIONS for consistency
const DERIVED_DURATIONS = {
  cellCascade: {
    navigation: '0.25s', // Fixed duration for navigation cell animations
    newGuess: '0.5s'     // Fixed duration for new guess cell animations
  },
  knowledgeBoxTransition: `${PHASE_DURATIONS.updateBoxes * 2}ms` // 2x updateBoxes duration for smoother transition
} as const;

// Utility function to sort tags by attribute type
const sortTagsByAttribute = <T extends { tag: string }>(items: T[], attributeName: string): T[] => {
  if (attributeName === 'eras') {
    return items.sort((a, b) => {
      const indexA = eraOrder.indexOf(a.tag);
      const indexB = eraOrder.indexOf(b.tag);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.tag.localeCompare(b.tag);
    });
  } else if (attributeName === 'movieAppearances') {
    return items.sort((a, b) => {
      const indexA = movieOrder.indexOf(a.tag);
      const indexB = movieOrder.indexOf(b.tag);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.tag.localeCompare(b.tag);
    });
  } else if (attributeName === 'tvAppearances') {
    return items.sort((a, b) => {
      const indexA = tvShowOrder.indexOf(a.tag);
      const indexB = tvShowOrder.indexOf(b.tag);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.tag.localeCompare(b.tag);
    });
  }
  return items;
};

// Utility function to create animation phase transitions
const createAnimationSequence = (
  needsFadeGray: boolean,
  isNavigating: boolean,
  isWinningGuess: boolean,
  setAnimationPhase: (phase: AnimationPhase) => void
) => {
  const timers: ReturnType<typeof setTimeout>[] = [];

  // Navigation: skip all animations, jump to complete
  if (isNavigating) {
    setAnimationPhase('complete');
    return timers;
  }

  // New guess: sequential phase transitions
  let cumulativeTime = 0;

  // Phase 1: hidden → cascade
  cumulativeTime += PHASE_DURATIONS.hidden;
  timers.push(setTimeout(() => setAnimationPhase('cascade'), cumulativeTime));

  // Phase 2: cascade → slideNew
  cumulativeTime += PHASE_DURATIONS.cascade(isNavigating);
  timers.push(setTimeout(() => setAnimationPhase('slideNew'), cumulativeTime));

  // Phase 3: slideNew → colorTransition
  cumulativeTime += PHASE_DURATIONS.slideNew;
  timers.push(setTimeout(() => setAnimationPhase('colorTransition'), cumulativeTime));

  // Always add colorTransition duration
  cumulativeTime += PHASE_DURATIONS.colorTransition;

  // Phase 4: colorTransition → fadeGray
  timers.push(setTimeout(() => setAnimationPhase('fadeGray'), cumulativeTime));

  if (needsFadeGray) {
    cumulativeTime += PHASE_DURATIONS.fadeGray;
  }

  // Phase 5: fadeGray → consolidate
  timers.push(setTimeout(() => setAnimationPhase('consolidate'), cumulativeTime));

  if (needsFadeGray) {
    cumulativeTime += PHASE_DURATIONS.consolidate;
  }

  // Phase 6: consolidate → updateBoxes
  timers.push(setTimeout(() => setAnimationPhase('updateBoxes'), cumulativeTime));

  // Always show box color changes for full duration
  cumulativeTime += PHASE_DURATIONS.updateBoxes;

  // Phase 7: updateBoxes → slideCharacter (if winning)
  if (isWinningGuess) {
    timers.push(setTimeout(() => setAnimationPhase('slideCharacter'), cumulativeTime));
    cumulativeTime += PHASE_DURATIONS.slideCharacter;
    
    // Phase 8: slideCharacter → checkWin (only for winning guesses)
    timers.push(setTimeout(() => setAnimationPhase('checkWin'), cumulativeTime));
    cumulativeTime += 1000; // 1 second delay for win modal
  }

  // Final: → complete
  timers.push(setTimeout(() => setAnimationPhase('complete'), cumulativeTime));

  return timers;
};

// Utility function to get tag style classes
const getTagStyle = (state: string, isFadingOut: boolean = false) => {
  let baseStyle = "";
  switch (state) {
    case 'confirmed-match':
      baseStyle = "bg-green-500 bg-opacity-30 border-green-400";
      break;
    case 'unconfirmed':
      baseStyle = "bg-yellow-500 bg-opacity-40 border-yellow-400";
      break;
    case 'confirmed-non-match':
      baseStyle = "bg-gray-600 border-gray-500";
      break;
    default:
      baseStyle = "bg-gray-600 border-gray-500";
  }

  // Common styles for all tags
  let commonStyle = "px-1.5 py-0.5 rounded text-xs border h-fit";

  // Add transition class for smooth color changes only (not position) - slower transition (1s)
  let transitionClass = "transition-colors duration-1000";

  // Add fade out animation for tags becoming non-matches
  if (isFadingOut) {
    transitionClass += " animate-fade-out";
  }

  return `${baseStyle} ${commonStyle} ${transitionClass}`;
};

// Utility function to filter and prepare current tags for display
const prepareCurrentTags = (
  tagStates: import('../types/character').TagKnowledgeState,
  isExactMatch: boolean,
  tagsToFadeOut: string[],
  isNavigating: boolean
) => {
  return Object.entries(tagStates)
    .filter(([tag, state]) => {
      // Only allow fade-out animation for the latest guess, not when navigating to previous guesses
      if (tagsToFadeOut.includes(tag) && !isNavigating) return true;
      // Never show confirmed-non-match or unguessed in knowledge panel
      if (state === 'confirmed-non-match' || state === 'unguessed') return false;
      // If exact match found, only show confirmed-match tags
      if (isExactMatch) return state === 'confirmed-match';
      // Otherwise show confirmed-match and unconfirmed
      return state === 'confirmed-match' || state === 'unconfirmed';
    })
    .map(([tag, state]) => ({ tag, state }));
};

// Utility function to prepare new tags for display
const prepareNewTags = (
  nextTagStates: import('../types/character').TagKnowledgeState | undefined,
  tagStates: import('../types/character').TagKnowledgeState,
  isExactMatch: boolean
) => {
  if (!nextTagStates || isExactMatch) return [];

  return Object.entries(nextTagStates)
    .filter(([tag, state]) => !(tag in tagStates) && state !== 'confirmed-non-match')
    .map(([tag, state]) => ({ tag, state }));
};

// Utility function to render a grid of attribute cells
const renderAttributeGrid = (
  attributes: Array<{ comparison: AttributeComparison; label: string; index: number }>,
  gridCols: number,
  isGuess: boolean,
  baseIndex: number,
  // Pass required dependencies
  animationPhase: AnimationPhase,
  isNavigating: boolean,
  knowledge: AccumulatedKnowledge,
  nextKnowledge: AccumulatedKnowledge | undefined,
  initialKnowledgeRef: React.MutableRefObject<AccumulatedKnowledge | null>,
  isPhaseAtOrAfter: (targetPhase: AnimationPhase) => boolean,
  isNewlyConfirmed: (attribute: string, item?: string) => boolean
) => {
  const getMatchColor = (match: string) => {
    switch (match) {
      case 'exact':
        return 'bg-green-600 text-white';
      case 'partial':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  const formatValue = (value: string | string[] | boolean | undefined): string => {
    if (value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) {
      if (value.length === 1 && value[0] === 'None') return 'None';
      return value.join(', ');
    }
    return value;
  };

  const renderAttributeCell = (item: typeof attributes[0], displayIndex: number) => {
    if (isGuess) {
      const cellDelay = isNavigating ? (baseIndex + displayIndex) * ANIMATION_DELAYS.navigation : (baseIndex + displayIndex) * ANIMATION_DELAYS.singleValue;
      const cellDuration = isNavigating ? DERIVED_DURATIONS.cellCascade.navigation : DERIVED_DURATIONS.cellCascade.newGuess;

      return (
        <div
          className={`${getMatchColor(item.comparison.match)} px-3 py-1.5 rounded shadow-md h-[52px] opacity-0`}
          style={animationPhase === 'cascade' ? {
            animation: `fade-in-down ${cellDuration} ease-out forwards`,
            animationDelay: `${cellDelay}ms`
          } : isPhaseAtOrAfter('slideNew') ? {
            opacity: 1,
            transform: 'translateY(0)'
          } : {}}
        >
          <div className="flex flex-col">
            <div className="text-xs font-bold opacity-70 mb-0.5">{item.label}</div>
            <div className="text-sm font-bold">{formatValue(item.comparison.value)}</div>
          </div>
        </div>
      );
    } else {
      const hasKnowledge = knowledge[item.comparison.attribute as keyof AccumulatedKnowledge] !== undefined;
      const knowledgeValue = knowledge[item.comparison.attribute as keyof AccumulatedKnowledge];
      const hasNextKnowledge = nextKnowledge?.[item.comparison.attribute as keyof AccumulatedKnowledge] !== undefined;
      const nextValue = nextKnowledge?.[item.comparison.attribute as keyof AccumulatedKnowledge];
      const displayValue = typeof nextValue === 'boolean' ? (nextValue ? 'Yes' : 'No') : nextValue;
      const currentDisplayValue = typeof knowledgeValue === 'boolean' ? (knowledgeValue ? 'Yes' : 'No') : knowledgeValue;
      const isNew = isNewlyConfirmed(item.comparison.attribute);
      const shouldShowNewValue = isPhaseAtOrAfter('slideNew');

      const thisGuessRevealed = item.comparison.match !== 'none';
      
      // Check if this attribute was already known from previous guesses
      const prevHasKnowledge = initialKnowledgeRef.current?.[item.comparison.attribute as keyof AccumulatedKnowledge] !== undefined;
      
      // Use previous knowledge state before updateBoxes phase, current state after
      const displayHasKnowledge = isPhaseAtOrAfter('updateBoxes') ? (hasNextKnowledge || hasKnowledge || thisGuessRevealed) : prevHasKnowledge;

      return (
        <div className={`px-3 py-1.5 rounded shadow-md h-[52px] ${displayHasKnowledge ? 'bg-green-600' : 'bg-gray-700'}`}
             style={{ transition: `background-color ${DERIVED_DURATIONS.knowledgeBoxTransition} ease-out` }}>
          <div className="flex flex-col">
            <div className="text-xs font-bold opacity-70 mb-0.5">{item.label}</div>
            {hasKnowledge ? (
              <div className="text-sm font-bold">{currentDisplayValue as string}</div>
            ) : hasNextKnowledge && isNew && shouldShowNewValue ? (
              <div
                className="text-sm font-bold animate-slide-left-to-right"
              >
                {displayValue as string}
              </div>
            ) : (
              <div className="text-sm font-bold">&nbsp;</div>
            )}
          </div>
        </div>
      );
    }
  };

  const gridClass = `grid gap-2 ${gridCols === 3 ? 'grid-cols-3' : gridCols === 2 ? 'grid-cols-2' : 'grid-cols-1'}`;

  return (
    <div className={gridClass}>
      {attributes.map((item, index) => renderAttributeCell(item, index))}
    </div>
  );
};

const ComparisonView = ({ latestGuess, guessNumber, totalGuesses, knowledge, targetCharacter, nextKnowledge, isWinningGuess, isNavigating, previousGuess, onAnimationComplete }: ComparisonViewProps) => {
  // Animation state machine - single source of truth for all animation timing
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('hidden');
  
  // Helper function to check if current phase is at or after a target phase
  const isPhaseAtOrAfter = (targetPhase: AnimationPhase): boolean => {
    const currentIndex = ANIMATION_PHASES.indexOf(animationPhase);
    const targetIndex = ANIMATION_PHASES.indexOf(targetPhase);
    return currentIndex >= targetIndex;
  };

  // Detect if we need colorTransition and fadeGray phases
  // Capture knowledge states at the moment the guess is made (don't recalculate when props update mid-animation)
  const initialKnowledgeRef = useRef<AccumulatedKnowledge | null>(null);
  const initialNextKnowledgeRef = useRef<AccumulatedKnowledge | undefined | null>(null);
  const lastGuessTimestampRef = useRef<number | null>(null);
  
  // When a new guess arrives, capture the initial state
  if (latestGuess && latestGuess.timestamp !== lastGuessTimestampRef.current) {
    initialKnowledgeRef.current = knowledge;
    initialNextKnowledgeRef.current = nextKnowledge;
    lastGuessTimestampRef.current = latestGuess.timestamp;
  }

  const needsColorTransition = useMemo(() => {
    const knowledgeSnapshot = initialKnowledgeRef.current;
    const nextKnowledgeSnapshot = initialNextKnowledgeRef.current;
    
    if (!nextKnowledgeSnapshot) return false;
    
    // Check all tag-based attributes for any tags changing color from unconfirmed (orange)
    const attributes: (keyof Pick<AccumulatedKnowledge, 'affiliations' | 'eras' | 'weapons' | 'movieAppearances' | 'tvAppearances' | 'gameAppearances' | 'bookAppearances'>)[] = 
      ['affiliations', 'eras', 'weapons', 'movieAppearances', 'tvAppearances', 'gameAppearances', 'bookAppearances'];
    
    const result = attributes.some(attr => {
      const currentStates = knowledgeSnapshot?.[attr] as import('../types/character').TagKnowledgeState;
      const nextStates = nextKnowledgeSnapshot[attr] as import('../types/character').TagKnowledgeState;
      
      if (!currentStates || !nextStates) return false;
      
      // Check if any tag is changing from unconfirmed (orange) to any other color
      // This includes: unconfirmed → confirmed-match (orange → green)
      //           AND: unconfirmed → confirmed-non-match (orange → gray)
      return Object.entries(nextStates).some(([tag, nextState]) => {
        const currentState = currentStates[tag];
        // Need transition if: tag was unconfirmed and is changing to something else
        const needsTransition = currentState === 'unconfirmed' && nextState !== 'unconfirmed';
        
        return needsTransition;
      });
    });
    
    return result;
  }, [latestGuess?.timestamp, guessNumber]);

  const needsFadeGray = useMemo(() => {
    const knowledgeSnapshot = initialKnowledgeRef.current;
    const nextKnowledgeSnapshot = initialNextKnowledgeRef.current;
    
    if (!nextKnowledgeSnapshot || !latestGuess) return false;
    
    // If no tags changed color, there are no green tags to fade to gray
    if (!needsColorTransition) return false;
    
    // On a winning guess, exact match cleanup makes remaining tags gray
    // This happens before we can detect the transition, so check if any tags exist that are now gray
    if (isWinningGuess) {
      const attributes: (keyof Pick<AccumulatedKnowledge, 'affiliations' | 'eras' | 'weapons' | 'movieAppearances' | 'tvAppearances' | 'gameAppearances' | 'bookAppearances'>)[] = 
        ['affiliations', 'eras', 'weapons', 'movieAppearances', 'tvAppearances', 'gameAppearances', 'bookAppearances'];
      
      const hasGrayTags = attributes.some(attr => {
        const nextStates = nextKnowledgeSnapshot[attr] as import('../types/character').TagKnowledgeState;
        if (!nextStates) return false;
        return Object.values(nextStates).some(state => state === 'confirmed-non-match');
      });
      
      return hasGrayTags;
    }
    
    // Check all tag-based attributes for any tags transitioning to confirmed-non-match
    const attributes: (keyof Pick<AccumulatedKnowledge, 'affiliations' | 'eras' | 'weapons' | 'movieAppearances' | 'tvAppearances' | 'gameAppearances' | 'bookAppearances'>)[] = 
      ['affiliations', 'eras', 'weapons', 'movieAppearances', 'tvAppearances', 'gameAppearances', 'bookAppearances'];
    
    let result = attributes.some(attr => {
      const currentStates = knowledgeSnapshot?.[attr] as import('../types/character').TagKnowledgeState;
      const nextStates = nextKnowledgeSnapshot[attr] as import('../types/character').TagKnowledgeState;
      
      if (!currentStates || !nextStates) return false;
      
      // Check if any tag is changing to confirmed-non-match
      // Compare current knowledge with next knowledge (after this guess)
      const hasTransitioningTags = Object.entries(nextStates).some(([tag, nextState]) => {
        const currentState = currentStates[tag];
        // Need fade if: tag exists and is becoming confirmed-non-match
        const needsFade = currentState && currentState !== 'confirmed-non-match' && nextState === 'confirmed-non-match';
        
        return needsFade;
      });
      
      // Also check if THIS GUESS introduced any non-matching tags
      // This handles the case where exact match cleanup made tags gray before we could check
      const guessComparison = latestGuess.comparisons.find(c => c.attribute === attr);
      if (guessComparison && guessComparison.match === 'partial') {
        // Partial match means some tags don't match - they need to fade
        const guessedTags = (guessComparison.value as string[]) || [];
        const hasNonMatchingTags = guessedTags.some(tag => {
          const state = nextStates[tag];
          return state === 'confirmed-non-match';
        });
        
        if (hasNonMatchingTags) return true;
      }
      
      return hasTransitioningTags;
    });
    
    // For exact matches, always include fadeGray phase because cleanup will create gray tags
    if (!result) {
      const exactAttributes = ['affiliations', 'eras', 'weapons', 'movieAppearances', 'tvAppearances', 'gameAppearances', 'bookAppearances'];
      result = exactAttributes.some(attr => {
        const exactFlagKey = `${attr}Exact` as keyof AccumulatedKnowledge;
        return nextKnowledgeSnapshot[exactFlagKey] as boolean;
      });
    }
    
    return result;
  }, [latestGuess?.timestamp, guessNumber, isWinningGuess]);

  // Animation phase state machine - controls all animation timing
  useEffect(() => {
    // Calculate phase needs ONCE at the start of the animation
    const needsFadeGrayNow = needsFadeGray;

    // Reset to hidden state
    setAnimationPhase('hidden');

    // Create and start animation sequence
    const timers = createAnimationSequence(
      needsFadeGrayNow,
      isNavigating || false,
      isWinningGuess || false,
      setAnimationPhase
    );

    return () => timers.forEach(timer => clearTimeout(timer));
    // Note: needsColorTransition and needsFadeGray are NOT in deps because we capture their values
    // at the start of the effect to prevent retriggering when knowledge props update mid-animation
  }, [latestGuess.timestamp, isWinningGuess, isNavigating]);

  // Call onAnimationComplete when checkWin phase is reached for winning guesses
  useEffect(() => {
    if (animationPhase === 'checkWin' && isWinningGuess) {
      onAnimationComplete?.(true);
    }
  }, [animationPhase, onAnimationComplete, isWinningGuess]);

  // Helper to check if an item is newly confirmed (will be in nextKnowledge but not current knowledge)
  const isNewlyConfirmed = (attribute: string, item?: string): boolean => {
    if (!nextKnowledge) return false;
    
    if (item) {
      // Check if this specific tag's state changed
      const currentStates = knowledge[attribute as keyof AccumulatedKnowledge];
      const nextStates = nextKnowledge[attribute as keyof AccumulatedKnowledge];
      
      // Handle TagKnowledgeState objects
      if (typeof currentStates === 'object' && !Array.isArray(currentStates) && currentStates !== null &&
          typeof nextStates === 'object' && !Array.isArray(nextStates) && nextStates !== null) {
        const currentState = (currentStates as any)[item];
        const nextState = (nextStates as any)[item];
        return nextState !== undefined && (currentState === undefined || currentState !== nextState);
      }
    } else {
      // Check if the whole attribute is newly confirmed (for single-value attributes)
      const currentValue = knowledge[attribute as keyof AccumulatedKnowledge];
      const nextValue = nextKnowledge[attribute as keyof AccumulatedKnowledge];
      
      return nextValue !== undefined && currentValue === undefined;
    }
    
    return false;
  };
  const getMatchColor = (match: string) => {
    switch (match) {
      case 'exact':
        return 'bg-green-600 text-white';
      case 'partial':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  const isMediaAttribute = (attribute: string): attribute is keyof typeof MEDIA_TYPES => {
    return attribute in MEDIA_TYPES;
  };

  const isArrayAttribute = (attribute: string) => {
    return ['affiliations', 'eras', 'weapons'].includes(attribute);
  };

  const getArrayHeight = (attribute: string): string => {
    // Set heights based on max possible values for each attribute
    switch (attribute) {
      case 'weapons': return 'h-[35px]'; // max ~2 items
      case 'eras': return 'h-[45px]'; // max ~4 items
      case 'gameAppearances': return 'h-[50px]'; // max ~3 items
      case 'affiliations': return 'h-[50px]'; // max ~5 items
      default: return 'h-[80px]'; // movies, TV, books/comics can have more
    }
  };

  const renderGuessArrayCell = (comparison: AttributeComparison, label: string) => {
    const guessedTags = (comparison.value as string[]) || [];
    
    // Use captured snapshots during animation to prevent mid-animation updates from affecting display
    // After animation completes, use current props
    const knowledgeToUse = (animationPhase === 'complete' || animationPhase === 'checkWin')
      ? (nextKnowledge || knowledge)
      : (initialNextKnowledgeRef.current || initialKnowledgeRef.current || knowledge);
    
    const tagStates = knowledgeToUse[comparison.attribute as keyof Pick<AccumulatedKnowledge, 'affiliations' | 'eras' | 'weapons' | 'movieAppearances' | 'tvAppearances' | 'gameAppearances' | 'bookAppearances'>];
    
    // Determine color for each tag based on its state and the comparison result
    const tagItems = guessedTags.map(tag => {
      const currentState = (tagStates as any)[tag] || 'unguessed';
      
      let displayState: 'green' | 'orange' | 'gray';
      
      if (comparison.match === 'exact' && comparison.isCompleteSet) {
        // Exact match: all tags are confirmed matches (green)
        displayState = 'green';
      } else if (comparison.match === 'none') {
        // No match: all tags are confirmed non-matches (gray)
        displayState = 'gray';
      } else if (comparison.match === 'partial') {
        // Partial match: show based on current knowledge state
        if (currentState === 'confirmed-match') {
          displayState = 'green';
        } else if (currentState === 'confirmed-non-match') {
          displayState = 'gray';
        } else {
          // Unguessed or unconfirmed: show as orange (uncertain)
          displayState = 'orange';
        }
      } else {
        displayState = 'gray';
      }
      
      return { tag, displayState };
    });
    
    // Sort items chronologically based on attribute type
    let sortedItems = tagItems;
    if (comparison.attribute === 'eras' || comparison.attribute === 'movieAppearances' || comparison.attribute === 'tvAppearances') {
      sortedItems = sortTagsByAttribute(tagItems, comparison.attribute);
    }
    
    const heightClass = getArrayHeight(comparison.attribute);
    
    const getTagStyle = (state: 'green' | 'orange' | 'gray') => {
      switch (state) {
        case 'green':
          return "bg-green-500 bg-opacity-30 px-1.5 py-0.5 rounded text-xs border border-green-400 h-fit";
        case 'orange':
          return "bg-yellow-500 bg-opacity-40 px-1.5 py-0.5 rounded text-xs border border-yellow-400 h-fit";
        case 'gray':
          return "bg-gray-600 px-1.5 py-0.5 rounded text-xs border border-gray-500 h-fit";
      }
    };

    return (
      <div className="flex flex-col gap-1">
        <div className="text-sm font-bold opacity-70">{label}</div>
        {/* Fixed height with overflow scroll to accommodate varying content */}
        <div className={`flex flex-wrap gap-1 ${heightClass} overflow-y-auto content-start`}>
          {sortedItems.map(({ tag, displayState }) => (
            <div
              key={tag}
              className={getTagStyle(displayState)}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderKnowledgeArrayCell = (
    label: string,
    tagStates: import('../types/character').TagKnowledgeState,
    attributeName: string
  ) => {
    // Get tag states BEFORE this guess (from captured snapshot)
    const knowledgeBeforeGuess = initialKnowledgeRef.current || knowledge;
    const prevTagStates = knowledgeBeforeGuess[attributeName as keyof AccumulatedKnowledge] as import('../types/character').TagKnowledgeState | undefined;

    // Get tag states AFTER this guess (from captured snapshot)
    const knowledgeAfterGuess = initialNextKnowledgeRef.current || nextKnowledge || knowledge;
    const nextTagStates = knowledgeAfterGuess[attributeName as keyof AccumulatedKnowledge] as import('../types/character').TagKnowledgeState | undefined;

    // Check if exact match has been found
    const exactFlagKey = `${attributeName}Exact` as keyof AccumulatedKnowledge;
    const isExactMatch = knowledge[exactFlagKey] as boolean;

    // Find tags that became confirmed-non-match (need to fade out)
    const tagsToFadeOut = prevTagStates && nextTagStates
      ? Object.entries(nextTagStates)
          .filter(([tag, nextState]) => {
            const prevState = prevTagStates[tag];
            return prevState && prevState !== 'confirmed-non-match' && nextState === 'confirmed-non-match';
          })
          .map(([tag]) => tag)
      : [];

    // For exact matches, also include tags that are currently unconfirmed/unguessed
    // because they will become confirmed-non-match during exact match cleanup
    if (isExactMatch && prevTagStates) {
      Object.entries(prevTagStates).forEach(([tag, prevState]) => {
        if ((prevState === 'unconfirmed' || prevState === 'unguessed') && !tagsToFadeOut.includes(tag)) {
          tagsToFadeOut.push(tag);
        }
      });
    }

    // Prepare current and new tags
    const currentTags = prepareCurrentTags(tagStates, isExactMatch, tagsToFadeOut, isNavigating || false);
    const newTags = prepareNewTags(nextTagStates, tagStates, isExactMatch);

    // Sort tags chronologically
    const sortedCurrentTags = sortTagsByAttribute(currentTags, attributeName);
    const sortedNewTags = sortTagsByAttribute(newTags, attributeName);

    const heightClass = getArrayHeight(attributeName);

    return (
      <div className="flex flex-col gap-1">
        <div className="text-sm font-bold opacity-70">{label}</div>
        {/* Fixed height with overflow scroll to accommodate varying content */}
        <div className={`flex flex-wrap gap-1 ${heightClass} overflow-y-auto content-start`}>
          {/* Show current tags with smooth CSS transitions for color changes */}
          {sortedCurrentTags.map(({ tag, state }) => {
            // Get state BEFORE this guess from captured snapshot
            const prevState = prevTagStates?.[tag] ?? state;

            // Determine display state based on animation phase
            const displayState = isPhaseAtOrAfter('colorTransition') ? state : prevState;

            // Determine if this tag should fade out
            const isTransitioningToGray = prevState !== 'confirmed-non-match' && state === 'confirmed-non-match';
            // For exact matches, unconfirmed tags that become confirmed-non-match should fade out
            const shouldFadeOutDueToExactMatch = isExactMatch && prevState === 'unconfirmed' && state === 'confirmed-non-match';
            const shouldFadeOut = (isTransitioningToGray || shouldFadeOutDueToExactMatch) && (animationPhase === 'fadeGray' || animationPhase === 'consolidate');

            // Show the tag if:
            // - It's not a non-match, OR
            // - It's transitioning to non-match AND we haven't started sliding yet (need to show during fade)
            if (state === 'confirmed-non-match' && !isTransitioningToGray) {
              return null; // Don't show tags that were already non-match
            }

            // Remove faded tags when consolidate phase begins
            if (isTransitioningToGray && (animationPhase === 'consolidate' || animationPhase === 'updateBoxes' || animationPhase === 'slideCharacter' || animationPhase === 'checkWin' || animationPhase === 'complete')) {
              return null;
            }
            // Also remove tags that faded out due to exact match cleanup
            if (shouldFadeOutDueToExactMatch && (animationPhase === 'consolidate' || animationPhase === 'updateBoxes' || animationPhase === 'slideCharacter' || animationPhase === 'checkWin' || animationPhase === 'complete')) {
              return null;
            }

            return (
              <div
                key={`current-${tag}`}
                className={getTagStyle(displayState, shouldFadeOut)}
                style={{
                  ...(shouldFadeOut ? {
                    animationDelay: '0s',
                    animationFillMode: 'forwards',
                    overflow: 'hidden'
                  } : {}),
                  // Only add position transition during consolidate phase and beyond
                  ...(isPhaseAtOrAfter('consolidate') ? {
                    transition: 'transform 0.3s ease-out, margin 0.3s ease-out'
                  } : {})
                }}
              >
                {tag}
              </div>
            );
          })}
          {/* Show new tags with slide animation */}
          {(animationPhase === 'slideNew' || animationPhase === 'colorTransition' || animationPhase === 'fadeGray' || animationPhase === 'consolidate' || animationPhase === 'updateBoxes' || animationPhase === 'slideCharacter' || animationPhase === 'checkWin' || animationPhase === 'complete') && sortedNewTags.map(({ tag, state }) => {
            // Build tag styling - apply slower transition and remove pulse animation
            let tagClasses = getTagStyle(state)
              .replace('transition-colors duration-700', 'transition-colors duration-1000')
              .replace('animate-pulse-once', '')
              .trim();

            // Apply animation class for all new tags (they only render from slideNew onwards)
            tagClasses += ' animate-slide-left-to-right';

            return (
              <div
                key={`new-${tag}`}
                className={tagClasses}
              >
                {tag}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderArrayRow = (comparison: AttributeComparison, label: string, index: number) => {
    const tagStates = knowledge[comparison.attribute as keyof Pick<AccumulatedKnowledge, 'affiliations' | 'eras' | 'weapons' | 'movieAppearances' | 'tvAppearances' | 'gameAppearances' | 'bookAppearances'>] as import('../types/character').TagKnowledgeState;
    
    // Check if exact match has been found
    const exactFlagKey = `${comparison.attribute}Exact` as keyof AccumulatedKnowledge;
    const isExactMatch = knowledge[exactFlagKey] as boolean;
    
    // Get previous tag states for transition logic
    const prevTagStates = previousGuess?.tagStatesSnapshot?.[comparison.attribute as keyof typeof previousGuess.tagStatesSnapshot] as import('../types/character').TagKnowledgeState | undefined;
    
    // Count visible tags (not confirmed-non-match) for both current and previous states
    const visibleTags = Object.values(tagStates).filter(state => state !== 'confirmed-non-match').length;
    const prevVisibleTags = prevTagStates ? Object.values(prevTagStates).filter(state => state !== 'confirmed-non-match').length : 0;
    
    // Check if exact match was ALREADY found in a previous guess (box should already be green)
    const prevExactFlagKey = `${comparison.attribute}Exact` as keyof AccumulatedKnowledge;
    const prevExactMatch = previousGuess?.tagStatesSnapshot ? 
      (knowledge[prevExactFlagKey] as boolean) && 
      Object.values(previousGuess.tagStatesSnapshot[comparison.attribute as keyof typeof previousGuess.tagStatesSnapshot] || {})
        .some(state => state === 'confirmed-match') &&
      Object.values(previousGuess.tagStatesSnapshot[comparison.attribute as keyof typeof previousGuess.tagStatesSnapshot] || {})
        .filter(state => state !== 'confirmed-non-match').length === 
      Object.values(previousGuess.tagStatesSnapshot[comparison.attribute as keyof typeof previousGuess.tagStatesSnapshot] || {})
        .filter(state => state === 'confirmed-match').length
      : false;
    
    // Check if any tags are transitioning from unconfirmed to confirmed-match
    // If no unconfirmed tags exist, we can update the box color earlier (during colorTransition)
    // Determine box background color with animation phase:
    // Use nextKnowledge during updateBoxes phase (before knowledge state updates from parent)
    // Fall back to current knowledge if nextKnowledge is not available
    const nextTagStates = nextKnowledge?.[comparison.attribute as keyof AccumulatedKnowledge] as import('../types/character').TagKnowledgeState | undefined;
    const nextVisibleTags = nextTagStates ? Object.values(nextTagStates).filter(state => state !== 'confirmed-non-match').length : visibleTags;
    const nextExactFlagKey = `${comparison.attribute}Exact` as keyof AccumulatedKnowledge;
    const nextIsExact = nextKnowledge ? (nextKnowledge[nextExactFlagKey] as boolean) : isExactMatch;
    
    // Use nextKnowledge values if available, otherwise fall back to current knowledge values
    // This ensures boxes update even if nextKnowledge has been cleared
    const displayVisibleTags = isPhaseAtOrAfter('updateBoxes') ? (nextTagStates ? nextVisibleTags : visibleTags) : prevVisibleTags;
    const displayIsExact = isPhaseAtOrAfter('updateBoxes') ? (nextKnowledge ? nextIsExact : isExactMatch) : prevExactMatch;
    
    // - Green: exact match found (all tags confirmed)
    // - Orange/Yellow: has visible tags (confirmed matches or unconfirmed) but not complete
    // - Gray: no visible tags (either no tags at all, or only confirmed-non-match tags)
    const bgColor = displayIsExact ? 'bg-green-600' : displayVisibleTags > 0 ? 'bg-yellow-600' : 'bg-gray-700';
    
    // Calculate animation properties
    // - When navigating: quick cascade (0.75s total = 14 rows * ~50ms)
    // - When new guess: faster cascade (2.4s total = 14 rows * ~130ms)
    const delay = isNavigating ? index * ANIMATION_DELAYS.navigation : index * ANIMATION_DELAYS.newGuess;
    const animDuration = isNavigating ? DERIVED_DURATIONS.cellCascade.navigation : DERIVED_DURATIONS.cellCascade.newGuess;
    const animName = 'fade-in-down';

    return (
      <div className="grid grid-cols-2 gap-6">
        {/* Left: Guess */}
        <div 
          className={`${getMatchColor(comparison.match)} px-3 py-1.5 rounded shadow-md opacity-0`}
          style={animationPhase === 'cascade' ? { 
            animation: `${animName} ${animDuration} ease-out forwards`,
            animationDelay: `${delay}ms`
          } : isPhaseAtOrAfter('slideNew') ? {
            opacity: 1,
            transform: 'translateY(0)'
          } : {}}
        >
          {renderGuessArrayCell(comparison, label)}
        </div>

        {/* Right: Knowledge */}
        <div className={`${bgColor} px-3 py-1.5 rounded shadow-md`}
             style={{ transition: `background-color ${DERIVED_DURATIONS.knowledgeBoxTransition} ease-out` }}>
          {renderKnowledgeArrayCell(label, tagStates, comparison.attribute)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Headers */}
      <div className="grid grid-cols-2 gap-6 mb-4">
        <div 
          className="opacity-0"
          style={animationPhase === 'cascade' ? { 
            animation: `fade-in-down ${isNavigating ? DERIVED_DURATIONS.cellCascade.navigation : DERIVED_DURATIONS.cellCascade.newGuess} ease-out forwards`,
            animationDelay: '0ms'
          } : isPhaseAtOrAfter('slideNew') ? {
            opacity: 1,
            transform: 'translateY(0)'
          } : {}}
        >
          <h3 className="text-lg font-bold text-white text-center">
            Guess #{guessNumber} {totalGuesses > 1 && <span className="text-sm opacity-70">of {totalGuesses}</span>}
          </h3>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="w-16 h-16 bg-sw-gray rounded overflow-hidden border-2 border-gray-700">
              <img
                src={latestGuess.character.imageUrl || ''}
                alt={latestGuess.character.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-lg font-bold">{latestGuess.character.name}</div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white text-center">Confirmed Knowledge</h3>
          <div className="flex items-center justify-center gap-3 mt-2 relative">
            {isWinningGuess ? (
              <>
                {/* Placeholder - stays visible and fades out */}
                <div className="absolute inset-0 flex items-center justify-center gap-3">
                  <div 
                    className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center transition-opacity duration-1000"
                    style={{ opacity: animationPhase === 'slideCharacter' || animationPhase === 'checkWin' || animationPhase === 'complete' ? 0 : 1 }}
                  >
                    <span className="text-gray-500 text-xs">?</span>
                  </div>
                  <div 
                    className="text-lg font-bold text-gray-500 transition-opacity duration-1000"
                    style={{ opacity: animationPhase === 'slideCharacter' || animationPhase === 'checkWin' || animationPhase === 'complete' ? 0 : 1 }}
                  >
                    Target Character
                  </div>
                </div>
                
                {/* Character - slides in on top */}
                {(animationPhase === 'slideCharacter' || animationPhase === 'checkWin' || animationPhase === 'complete') && (
                  <div className="flex items-center justify-center gap-3">
                    <div 
                      className="w-16 h-16 bg-sw-gray rounded overflow-hidden border-2 border-green-500 animate-slide-left-to-right"
                      style={{ animationDelay: '0s', opacity: 0, animationFillMode: 'forwards' }}
                    >
                      <img
                        src={latestGuess.character.imageUrl || ''}
                        alt={latestGuess.character.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div 
                      className="text-lg font-bold text-green-400 animate-slide-left-to-right"
                      style={{ animationDelay: '0s', opacity: 0, animationFillMode: 'forwards' }}
                    >
                      {latestGuess.character.name}
                    </div>
                  </div>
                )}
                
                {/* Spacer to maintain layout when not sliding in */}
                {animationPhase !== 'slideCharacter' && animationPhase !== 'checkWin' && animationPhase !== 'complete' && (
                  <div className="flex items-center justify-center gap-3 opacity-0">
                    <div className="w-16 h-16"></div>
                    <div className="text-lg font-bold">Placeholder</div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-gray-500 text-xs">?</span>
                </div>
                <div className="text-lg font-bold text-gray-500">Target Character</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Attributes */}
      {(() => {
        // Separate single-value and array attributes
        const singleValueComparisons: Array<{ comparison: AttributeComparison; label: string; index: number }> = [];
        const arrayComparisons: Array<{ comparison: AttributeComparison; label: string; target: string[] | undefined; index: number }> = [];
        
        latestGuess.comparisons.forEach((comparison, index) => {
          const attr = comparison.attribute;
          
          if (isMediaAttribute(attr)) {
            arrayComparisons.push({
              comparison,
              label: MEDIA_TYPES[attr],
              target: targetCharacter[attr],
              index
            });
          } else if (isArrayAttribute(attr)) {
            arrayComparisons.push({
              comparison,
              label: attributeDisplayNames[attr] || attr.charAt(0).toUpperCase() + attr.slice(1),
              target: targetCharacter[attr as 'affiliations' | 'eras' | 'weapons'],
              index
            });
          } else {
            singleValueComparisons.push({
              comparison,
              label: attributeDisplayNames[attr] || attr.charAt(0).toUpperCase() + attr.slice(1),
              index
            });
          }
        });
        
        return (
          <>
            {/* Render single-value attributes with custom order: Sex, Species|World, Hair|Eye, Force|Basic */}
            {(() => {
              // Create a map of comparisons by attribute for easy lookup
              const comparisonMap = new Map(
                singleValueComparisons.map(item => [item.comparison.attribute, item])
              );
              
              // Get comparisons in the desired order
              const orderedComparisons = [
                comparisonMap.get('sex'),
                comparisonMap.get('species'),
                comparisonMap.get('homeworld'),
                comparisonMap.get('hairColor'),
                comparisonMap.get('eyeColor'),
                comparisonMap.get('forceUser'),
                comparisonMap.get('speaksBasic')
              ].filter((item): item is typeof singleValueComparisons[0] => item !== undefined);
              
              return (
                <div className="grid grid-cols-2 gap-6">
                  {/* Left: Guess Panel */}
                  <div className="space-y-2">
                    {/* Sex | Species | World */}
                    {renderAttributeGrid(orderedComparisons.slice(0, 3), 3, true, 0, animationPhase, isNavigating || false, knowledge, nextKnowledge, initialKnowledgeRef, isPhaseAtOrAfter, isNewlyConfirmed)}

                    {/* Hair Color | Eye Color */}
                    {renderAttributeGrid(orderedComparisons.slice(3, 5), 2, true, 3, animationPhase, isNavigating || false, knowledge, nextKnowledge, initialKnowledgeRef, isPhaseAtOrAfter, isNewlyConfirmed)}

                    {/* Force User | Speaks Basic */}
                    {renderAttributeGrid(orderedComparisons.slice(5, 7), 2, true, 5, animationPhase, isNavigating || false, knowledge, nextKnowledge, initialKnowledgeRef, isPhaseAtOrAfter, isNewlyConfirmed)}
                  </div>

                  {/* Right: Knowledge Panel */}
                  <div className="space-y-2">
                    {/* Sex | Species | World */}
                    {renderAttributeGrid(orderedComparisons.slice(0, 3), 3, false, 0, animationPhase, isNavigating || false, knowledge, nextKnowledge, initialKnowledgeRef, isPhaseAtOrAfter, isNewlyConfirmed)}

                    {/* Hair Color | Eye Color */}
                    {renderAttributeGrid(orderedComparisons.slice(3, 5), 2, false, 3, animationPhase, isNavigating || false, knowledge, nextKnowledge, initialKnowledgeRef, isPhaseAtOrAfter, isNewlyConfirmed)}

                    {/* Force User | Speaks Basic */}
                    {renderAttributeGrid(orderedComparisons.slice(5, 7), 2, false, 5, animationPhase, isNavigating || false, knowledge, nextKnowledge, initialKnowledgeRef, isPhaseAtOrAfter, isNewlyConfirmed)}
                  </div>
                </div>
              );
            })()}
            
            {/* Render array attributes (full width) in specific order */}
            {(() => {
              // Define the desired order for array attributes
              const arrayAttributeOrder = [
                'affiliations',
                'eras', 
                'weapons',
                'movieAppearances',
                'tvAppearances',
                'gameAppearances',
                'bookAppearances'
              ];
              
              // Sort array comparisons by the defined order
              const sortedArrayComparisons = [...arrayComparisons].sort((a, b) => {
                const indexA = arrayAttributeOrder.indexOf(a.comparison.attribute);
                const indexB = arrayAttributeOrder.indexOf(b.comparison.attribute);
                return indexA - indexB;
              });
              
              // Render with sequential display indices starting from 7 (after single-value attributes)
              return sortedArrayComparisons.map((item, displayIndex) => (
                <div key={item.comparison.attribute}>
                  {renderArrayRow(item.comparison, item.label, 7 + displayIndex)}
                </div>
              ));
            })()}
          </>
        );
      })()}
    </div>
  );
};

export default ComparisonView;
