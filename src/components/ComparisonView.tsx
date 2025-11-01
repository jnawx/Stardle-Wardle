import { useEffect, useState } from 'react';
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
}

// Define the media types for labeling
const MEDIA_TYPES = {
  movieAppearances: 'Movies',
  tvAppearances: 'TV',
  gameAppearances: 'Games',
  bookComicAppearances: 'Books/Comics'
} as const;

const ComparisonView = ({ latestGuess, guessNumber, totalGuesses, knowledge, targetCharacter, nextKnowledge, isWinningGuess, isNavigating, previousGuess }: ComparisonViewProps) => {
  const [showGuess, setShowGuess] = useState(false);
  const [slideCharacter, setSlideCharacter] = useState(false);
  const [applyTagTransitions, setApplyTagTransitions] = useState(false);

  // Animation sequence: 
  // - New guess: fade in with slow cascade (2.8s)
  // - Navigation: fade in with quick cascade (0.75s)
  useEffect(() => {
    setShowGuess(false);
    setSlideCharacter(false);
    setApplyTagTransitions(false);
    
    // Start guess fade-in
    const guessTimer = setTimeout(() => setShowGuess(true), 50);
    
    // Apply tag color transitions after cascade animation completes
    // Navigation: 0.75s cascade, New guess: 2.8s cascade
    const tagTransitionTimer = setTimeout(() => {
      setApplyTagTransitions(true);
    }, isNavigating ? 750 : 2800);
    
    // If winning guess, slide character after cascade completes
    let characterTimer: ReturnType<typeof setTimeout> | undefined;
    if (isWinningGuess && !isNavigating) {
      characterTimer = setTimeout(() => setSlideCharacter(true), 2800);
    }
    
    return () => {
      clearTimeout(guessTimer);
      clearTimeout(tagTransitionTimer);
      if (characterTimer) clearTimeout(characterTimer);
    };
  }, [latestGuess.timestamp, isWinningGuess, isNavigating]);

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

  const formatValue = (value: string | string[] | boolean | undefined): string => {
    if (value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) {
      if (value.length === 1 && value[0] === 'None') return 'None';
      return value.join(', ');
    }
    return value;
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
    // Use nextKnowledge if available (for the most recent guess with smart inference applied)
    // Otherwise use current knowledge
    const knowledgeToUse = nextKnowledge || knowledge;
    const tagStates = knowledgeToUse[comparison.attribute as keyof Pick<AccumulatedKnowledge, 'affiliations' | 'eras' | 'weapons' | 'movieAppearances' | 'tvAppearances' | 'gameAppearances' | 'bookComicAppearances'>];
    
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
    if (comparison.attribute === 'eras') {
      sortedItems = tagItems.sort((a, b) => {
        const indexA = eraOrder.indexOf(a.tag);
        const indexB = eraOrder.indexOf(b.tag);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.tag.localeCompare(b.tag);
      });
    } else if (comparison.attribute === 'movieAppearances') {
      sortedItems = tagItems.sort((a, b) => {
        const indexA = movieOrder.indexOf(a.tag);
        const indexB = movieOrder.indexOf(b.tag);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.tag.localeCompare(b.tag);
      });
    } else if (comparison.attribute === 'tvAppearances') {
      sortedItems = tagItems.sort((a, b) => {
        const indexA = tvShowOrder.indexOf(a.tag);
        const indexB = tvShowOrder.indexOf(b.tag);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.tag.localeCompare(b.tag);
      });
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
    _targetItems: string[] | undefined,
    attributeName: string
  ) => {
    // Get previous tag states from the previous guess's snapshot
    const prevTagStates = previousGuess?.tagStatesSnapshot?.[attributeName as keyof typeof previousGuess.tagStatesSnapshot];
    
    // Get next tag states if available
    const nextTagStates = nextKnowledge 
      ? (nextKnowledge[attributeName as keyof AccumulatedKnowledge] as import('../types/character').TagKnowledgeState)
      : null;
    
    // Check if exact match has been found
    const exactFlagKey = `${attributeName}Exact` as keyof AccumulatedKnowledge;
    const isExactMatch = knowledge[exactFlagKey] as boolean;
    
    // Find tags that became confirmed-non-match (need to fade out)
    const tagsToFadeOut = nextTagStates
      ? Object.entries(tagStates)
          .filter(([tag, oldState]) => {
            const newState = nextTagStates[tag];
            return oldState !== 'confirmed-non-match' && newState === 'confirmed-non-match';
          })
          .map(([tag]) => tag)
      : [];
    
    // Filter tags: exclude confirmed-non-match UNLESS they're fading out (need to show them temporarily)
    // If exact match found, only show confirmed-match tags
    const currentTags = Object.entries(tagStates)
      .filter(([tag, state]) => {
        // Keep tags that are fading out so we can animate them
        if (tagsToFadeOut.includes(tag)) return true;
        // Otherwise, filter out confirmed-non-match
        return state !== 'confirmed-non-match' && (!isExactMatch || state === 'confirmed-match');
      })
      .map(([tag, state]) => ({ tag, state }));
    
    // Find new tags from next state (excluding confirmed-non-match)
    const newTags = nextTagStates 
      ? Object.entries(nextTagStates)
          .filter(([tag, state]) => !(tag in tagStates) && state !== 'confirmed-non-match')
          .map(([tag, state]) => ({ tag, state }))
      : [];
    
    // Sort tags chronologically based on attribute type
    const sortTag = (items: { tag: string; state: any }[]) => {
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
    
    const sortedCurrentTags = sortTag(currentTags);
    const sortedNewTags = sortTag(newTags);
    
    const heightClass = getArrayHeight(attributeName);
    
    const getTagStyle = (state: string, isChanging: boolean = false, isFadingOut: boolean = false) => {
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
      
      // Add transition class for smooth color changes
      let transitionClass = "transition-all duration-700";
      
      // Add pulse animation for changing tags (after new tags slide in)
      if (isChanging) {
        transitionClass += " animate-pulse-once";
      }
      
      // Add fade out animation for tags becoming non-matches
      if (isFadingOut) {
        transitionClass += " animate-fade-out";
      }
      
      return `${baseStyle} ${commonStyle} ${transitionClass}`;
    };

    return (
      <div className="flex flex-col gap-1">
        <div className="text-sm font-bold opacity-70">{label}</div>
        {/* Fixed height with overflow scroll to accommodate varying content */}
        <div className={`flex flex-wrap gap-1 ${heightClass} overflow-y-auto content-start`}>
          {/* Show current tags with smooth CSS transitions for color changes */}
          {sortedCurrentTags.map(({ tag, state }) => {
            // Get previous state from previous guess's snapshot (if available)
            const prevState = prevTagStates?.[tag] ?? state;
            
            // Determine display state based on animation timing
            // Before cascade completes: show previous state
            // After cascade: transition to current state
            const displayState = (applyTagTransitions || isNavigating) ? state : prevState;
            
            console.log(`[Tag ${tag}] prev: ${prevState}, current: ${state}, display: ${displayState}, applyTransitions: ${applyTagTransitions}`);
            
            // Filter out confirmed-non-match after a delay to allow fade animation
            const shouldShow = displayState !== 'confirmed-non-match' || tagsToFadeOut.includes(tag);
            
            if (!shouldShow) return null;
            
            const isFadingOut = displayState === 'confirmed-non-match';
            
            // Check if this tag's state changed (for pulse animation)
            const isChanging = !isNavigating && applyTagTransitions && prevState !== state && !isFadingOut;
            
            return (
              <div
                key={`current-${tag}`}
                className={getTagStyle(displayState, isChanging, isFadingOut && !isNavigating)}
                style={isFadingOut && !isNavigating ? {
                  animationDelay: '0.7s', // Fade out after color transition
                  animationFillMode: 'forwards'
                } : undefined}
              >
                {tag}
              </div>
            );
          })}
          {/* Show new tags with slide animation (skip when navigating) */}
          {!isNavigating && nextKnowledge && sortedNewTags.map(({ tag, state }) => (
            <div
              key={`new-${tag}`}
              className={`${getTagStyle(state)} animate-slide-left-to-right`}
              style={{ animationDelay: '2.8s', opacity: 0, animationFillMode: 'forwards' }}
            >
              {tag}
            </div>
          ))}
          {/* Show new tags immediately when navigating */}
          {isNavigating && sortedNewTags.map(({ tag, state }) => (
            <div
              key={`new-${tag}`}
              className={getTagStyle(state)}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderArrayRow = (comparison: AttributeComparison, label: string, targetItems: string[] | undefined, index: number) => {
    const tagStates = knowledge[comparison.attribute as keyof Pick<AccumulatedKnowledge, 'affiliations' | 'eras' | 'weapons' | 'movieAppearances' | 'tvAppearances' | 'gameAppearances' | 'bookComicAppearances'>] as import('../types/character').TagKnowledgeState;
    
    // Check if exact match has been found
    const exactFlagKey = `${comparison.attribute}Exact` as keyof AccumulatedKnowledge;
    const isExactMatch = knowledge[exactFlagKey] as boolean;
    
    // Count visible tags (not confirmed-non-match)
    const visibleTags = Object.values(tagStates).filter(state => state !== 'confirmed-non-match').length;
    
    // Determine box background color:
    // - Green: exact match found (all tags confirmed)
    // - Orange/Yellow: has visible tags (confirmed matches or unconfirmed) but not complete
    // - Gray: no visible tags (either no tags at all, or only confirmed-non-match tags)
    const bgColor = isExactMatch ? 'bg-green-600' : visibleTags > 0 ? 'bg-yellow-600' : 'bg-gray-700';
    
    // Calculate animation properties
    // - When navigating: quick cascade (0.75s total = 14 rows * ~50ms)
    // - When new guess: slow cascade (2.8s total = 14 rows * 150ms + 700ms for last item)
    const delay = isNavigating ? index * 50 : index * 150;
    const animDuration = isNavigating ? '0.25s' : '0.5s';
    const animName = 'fade-in-down';

    return (
      <div className="grid grid-cols-2 gap-6">
        {/* Left: Guess */}
        <div 
          className={`${getMatchColor(comparison.match)} px-3 py-1.5 rounded shadow-md`}
          style={showGuess ? { 
            animation: `${animName} ${animDuration} ease-out forwards`,
            animationDelay: `${delay}ms`,
            opacity: 0
          } : { opacity: 0 }}
        >
          {renderGuessArrayCell(comparison, label)}
        </div>

        {/* Right: Knowledge */}
        <div className={`${bgColor} px-3 py-1.5 rounded shadow-md transition-all duration-1000`}>
          {renderKnowledgeArrayCell(label, tagStates, targetItems, comparison.attribute)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Headers */}
      <div className="grid grid-cols-2 gap-6 mb-4">
        <div 
          style={showGuess ? { 
            animation: `fade-in-down ${isNavigating ? '0.25s' : '0.5s'} ease-out forwards`,
            animationDelay: '0ms',
            opacity: 0
          } : { opacity: 0 }}
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
                    style={{ opacity: slideCharacter ? 0 : 1 }}
                  >
                    <span className="text-gray-500 text-xs">?</span>
                  </div>
                  <div 
                    className="text-lg font-bold text-gray-500 transition-opacity duration-1000"
                    style={{ opacity: slideCharacter ? 0 : 1 }}
                  >
                    Target Character
                  </div>
                </div>
                
                {/* Character - slides in on top */}
                {slideCharacter && (
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
                {!slideCharacter && (
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
              
              // Helper to render a single attribute cell
              const renderAttributeCell = (item: typeof singleValueComparisons[0], isGuess: boolean, displayIndex: number) => {
                if (isGuess) {
                  // Calculate delay: quick cascade for navigation (50ms), slow for new guess (150ms)
                  const cellDelay = isNavigating ? displayIndex * 50 : displayIndex * 150;
                  const cellDuration = isNavigating ? '0.25s' : '0.5s';
                  
                  return (
                    <div 
                      className={`${getMatchColor(item.comparison.match)} px-3 py-1.5 rounded shadow-md h-[52px]`}
                      style={showGuess ? { 
                        animation: `fade-in-down ${cellDuration} ease-out forwards`,
                        animationDelay: `${cellDelay}ms`,
                        opacity: 0
                      } : { opacity: 0 }}
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
                  
                  return (
                    <div className={`px-3 py-1.5 rounded shadow-md h-[52px] transition-all duration-1000 ${hasKnowledge ? 'bg-green-600' : 'bg-gray-700'}`}>
                      <div className="flex flex-col">
                        <div className="text-xs font-bold opacity-70 mb-0.5">{item.label}</div>
                        {hasKnowledge ? (
                          <div className="text-sm font-bold">{currentDisplayValue as string}</div>
                        ) : hasNextKnowledge && isNew ? (
                          <div 
                            className="text-sm font-bold animate-slide-left-to-right"
                            style={{ animationDelay: '2.8s', opacity: 0, animationFillMode: 'forwards' }}
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
              
              return (
                <div className="grid grid-cols-2 gap-6">
                  {/* Left: Guess Panel */}
                  <div className="space-y-2">
                    {/* Sex | Species | World */}
                    <div className="grid grid-cols-3 gap-2">
                      {orderedComparisons[0] && renderAttributeCell(orderedComparisons[0], true, 0)}
                      {orderedComparisons[1] && renderAttributeCell(orderedComparisons[1], true, 1)}
                      {orderedComparisons[2] && renderAttributeCell(orderedComparisons[2], true, 2)}
                    </div>
                    
                    {/* Hair Color | Eye Color */}
                    <div className="grid grid-cols-2 gap-2">
                      {orderedComparisons[3] && renderAttributeCell(orderedComparisons[3], true, 3)}
                      {orderedComparisons[4] && renderAttributeCell(orderedComparisons[4], true, 4)}
                    </div>
                    
                    {/* Force User | Speaks Basic */}
                    <div className="grid grid-cols-2 gap-2">
                      {orderedComparisons[5] && renderAttributeCell(orderedComparisons[5], true, 5)}
                      {orderedComparisons[6] && renderAttributeCell(orderedComparisons[6], true, 6)}
                    </div>
                  </div>
                  
                  {/* Right: Knowledge Panel */}
                  <div className="space-y-2">
                    {/* Sex | Species | World */}
                    <div className="grid grid-cols-3 gap-2">
                      {orderedComparisons[0] && renderAttributeCell(orderedComparisons[0], false, 0)}
                      {orderedComparisons[1] && renderAttributeCell(orderedComparisons[1], false, 1)}
                      {orderedComparisons[2] && renderAttributeCell(orderedComparisons[2], false, 2)}
                    </div>
                    
                    {/* Hair Color | Eye Color */}
                    <div className="grid grid-cols-2 gap-2">
                      {orderedComparisons[3] && renderAttributeCell(orderedComparisons[3], false, 3)}
                      {orderedComparisons[4] && renderAttributeCell(orderedComparisons[4], false, 4)}
                    </div>
                    
                    {/* Force User | Speaks Basic */}
                    <div className="grid grid-cols-2 gap-2">
                      {orderedComparisons[5] && renderAttributeCell(orderedComparisons[5], false, 5)}
                      {orderedComparisons[6] && renderAttributeCell(orderedComparisons[6], false, 6)}
                    </div>
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
                'bookComicAppearances'
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
                  {renderArrayRow(item.comparison, item.label, item.target, 7 + displayIndex)}
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
