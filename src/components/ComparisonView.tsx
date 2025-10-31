import { useEffect, useState } from 'react';
import type { Guess, AccumulatedKnowledge, Character, AttributeComparison } from '../types/character';
import { attributeDisplayNames } from '../config/gameConfig';
import { eraOrder, movieOrder, tvShowOrder, sortByOrder } from '../config/chronologicalOrder';

interface ComparisonViewProps {
  latestGuess: Guess;
  guessNumber: number;
  totalGuesses: number;
  knowledge: AccumulatedKnowledge;
  targetCharacter: Character;
  nextKnowledge?: AccumulatedKnowledge;
  isWinningGuess?: boolean;
}

// Define the media types for labeling
const MEDIA_TYPES = {
  movieAppearances: 'Movies',
  tvAppearances: 'TV',
  gameAppearances: 'Games',
  bookComicAppearances: 'Books/Comics'
} as const;

const ComparisonView = ({ latestGuess, guessNumber, totalGuesses, knowledge, targetCharacter, nextKnowledge, isWinningGuess }: ComparisonViewProps) => {
  const [showGuess, setShowGuess] = useState(false);
  const [slideCharacter, setSlideCharacter] = useState(false);

  // Animation sequence: fade in guess, then slide in new knowledge
  useEffect(() => {
    setShowGuess(false);
    setSlideCharacter(false);
    
    // Start guess fade-in immediately
    const guessTimer = setTimeout(() => setShowGuess(true), 50);
    
    // If winning guess, slide character after cascade completes (2800ms - after all rows fade in)
    let characterTimer: ReturnType<typeof setTimeout> | undefined;
    if (isWinningGuess) {
      characterTimer = setTimeout(() => setSlideCharacter(true), 2800);
    }
    
    return () => {
      clearTimeout(guessTimer);
      if (characterTimer) clearTimeout(characterTimer);
    };
  }, [latestGuess.timestamp, isWinningGuess]);

  // Helper to check if an item is newly confirmed (will be in nextKnowledge but not current knowledge)
  const isNewlyConfirmed = (attribute: string, item?: string): boolean => {
    if (!nextKnowledge) return false;
    
    if (item) {
      // Check if this specific item is new
      const currentItems = knowledge[attribute as keyof AccumulatedKnowledge];
      const nextItems = nextKnowledge[attribute as keyof AccumulatedKnowledge];
      
      if (Array.isArray(nextItems)) {
        const currentArray = Array.isArray(currentItems) ? currentItems : [];
        return nextItems.includes(item) && !currentArray.includes(item);
      }
    } else {
      // Check if the whole attribute is newly confirmed
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
    const matchedItems = comparison.matchedItems || [];
    const unmatchedItems = comparison.unmatchedItems || [];
    
    // Combine all items with their match status
    const allItems = [
      ...matchedItems.map(item => ({ item, matched: true })),
      ...unmatchedItems.map(item => ({ item, matched: false }))
    ];
    
    // Sort all items together chronologically based on attribute type
    let sortedItems = allItems;
    if (comparison.attribute === 'eras') {
      sortedItems = allItems.sort((a, b) => {
        const indexA = eraOrder.indexOf(a.item);
        const indexB = eraOrder.indexOf(b.item);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.item.localeCompare(b.item);
      });
    } else if (comparison.attribute === 'movieAppearances') {
      sortedItems = allItems.sort((a, b) => {
        const indexA = movieOrder.indexOf(a.item);
        const indexB = movieOrder.indexOf(b.item);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.item.localeCompare(b.item);
      });
    } else if (comparison.attribute === 'tvAppearances') {
      sortedItems = allItems.sort((a, b) => {
        const indexA = tvShowOrder.indexOf(a.item);
        const indexB = tvShowOrder.indexOf(b.item);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.item.localeCompare(b.item);
      });
    }
    
    const heightClass = getArrayHeight(comparison.attribute);

    return (
      <div className="flex flex-col gap-1">
        <div className="text-sm font-bold opacity-70">{label}</div>
        {/* Fixed height with overflow scroll to accommodate varying content */}
        <div className={`flex flex-wrap gap-1 ${heightClass} overflow-y-auto content-start`}>
          {sortedItems.map(({ item, matched }) => (
            <div
              key={item}
              className={matched 
                ? "bg-green-500 bg-opacity-30 px-1.5 py-0.5 rounded text-xs border border-green-400 h-fit"
                : "bg-gray-600 px-1.5 py-0.5 rounded text-xs border border-gray-500 h-fit"
              }
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderKnowledgeArrayCell = (
    label: string,
    items: string[],
    _targetItems: string[] | undefined,
    attributeName: string
  ) => {
    // Get next items if available
    const nextItems = nextKnowledge 
      ? (nextKnowledge[attributeName as keyof AccumulatedKnowledge] as string[] || [])
      : [];
    
    // Sort items chronologically based on attribute type
    let sortedCurrentItems = [...items];
    let sortedNewItems = nextItems.filter(item => !items.includes(item));
    
    if (attributeName === 'eras') {
      sortedCurrentItems = sortByOrder(sortedCurrentItems, eraOrder);
      sortedNewItems = sortByOrder(sortedNewItems, eraOrder);
    } else if (attributeName === 'movieAppearances') {
      sortedCurrentItems = sortByOrder(sortedCurrentItems, movieOrder);
      sortedNewItems = sortByOrder(sortedNewItems, movieOrder);
    } else if (attributeName === 'tvAppearances') {
      sortedCurrentItems = sortByOrder(sortedCurrentItems, tvShowOrder);
      sortedNewItems = sortByOrder(sortedNewItems, tvShowOrder);
    }
    
    const heightClass = getArrayHeight(attributeName);

    return (
      <div className="flex flex-col gap-1">
        <div className="text-sm font-bold opacity-70">{label}</div>
        {/* Fixed height with overflow scroll to accommodate varying content */}
        <div className={`flex flex-wrap gap-1 ${heightClass} overflow-y-auto content-start`}>
          {/* Show current items (no animation) - match guess styling */}
          {sortedCurrentItems.map((item, idx) => (
            <div
              key={`current-${idx}`}
              className="bg-green-500 bg-opacity-30 px-1.5 py-0.5 rounded text-xs border border-green-400 h-fit"
            >
              {item}
            </div>
          ))}
          {/* Show new items with animation - match guess styling */}
          {nextKnowledge && sortedNewItems.map((item, idx) => (
            <div
              key={`new-${idx}`}
              className="bg-green-500 bg-opacity-30 px-1.5 py-0.5 rounded text-xs border border-green-400 h-fit animate-slide-left-to-right"
              style={{ animationDelay: '2.8s', opacity: 0, animationFillMode: 'forwards' }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderArrayRow = (comparison: AttributeComparison, label: string, targetItems: string[] | undefined, index: number) => {
    const items = knowledge[comparison.attribute as keyof Pick<AccumulatedKnowledge, 'affiliations' | 'eras' | 'weapons' | 'movieAppearances' | 'tvAppearances' | 'gameAppearances' | 'bookComicAppearances'>] as string[];
    
    const targetArray = targetItems || [];
    const targetHasNone = targetArray.length === 1 && targetArray[0] === 'None';
    
    // Use CURRENT items to determine current state (not next items)
    const knowledgeHasNone = items.length === 1 && items[0] === 'None';
    const currentAllItemsFound = targetHasNone
      ? knowledgeHasNone
      : targetArray.length > 0 && items.length === targetArray.length;
    
    const hasItems = items.length > 0;
    const bgColor = currentAllItemsFound ? 'bg-green-600' : hasItems ? 'bg-yellow-600' : 'bg-gray-700';
    
    // Calculate staggered delay: 150ms per row
    const delay = index * 150;

    return (
      <div className="grid grid-cols-2 gap-6">
        {/* Left: Guess */}
        <div 
          className={`${getMatchColor(comparison.match)} px-3 py-1.5 rounded shadow-md transition-all duration-500`}
          style={showGuess ? { 
            animation: 'fade-in-down 0.5s ease-out forwards',
            animationDelay: `${delay}ms`,
            opacity: 0
          } : { opacity: 0 }}
        >
          {renderGuessArrayCell(comparison, label)}
        </div>

        {/* Right: Knowledge */}
        <div className={`${bgColor} px-3 py-1.5 rounded shadow-md`}>
          {renderKnowledgeArrayCell(label, items, targetItems, comparison.attribute)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Headers */}
      <div className="grid grid-cols-2 gap-6 mb-4">
        <div className={showGuess ? 'animate-fade-in-down' : 'opacity-0'}>
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
          <div className="flex items-center justify-center gap-3 mt-2">
            {isWinningGuess ? (
              <>
                {/* Show placeholder until slide animation starts */}
                {!slideCharacter && (
                  <>
                    <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center">
                      <span className="text-gray-500 text-xs">?</span>
                    </div>
                    <div className="text-lg font-bold text-gray-500">Target Character</div>
                  </>
                )}
                {/* Show character with slide animation */}
                {slideCharacter && (
                  <>
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
                  </>
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
              const renderAttributeCell = (item: typeof singleValueComparisons[0], isGuess: boolean) => {
                if (isGuess) {
                  return (
                    <div 
                      className={`${getMatchColor(item.comparison.match)} px-3 py-1.5 rounded shadow-md h-[52px] transition-all duration-500`}
                      style={showGuess ? { 
                        animation: 'fade-in-down 0.5s ease-out forwards',
                        animationDelay: `${item.index * 150}ms`,
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
                    <div className={`${hasKnowledge ? 'bg-green-600' : 'bg-gray-700'} px-3 py-1.5 rounded shadow-md h-[52px]`}>
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
                      {orderedComparisons[0] && renderAttributeCell(orderedComparisons[0], true)}
                      {orderedComparisons[1] && renderAttributeCell(orderedComparisons[1], true)}
                      {orderedComparisons[2] && renderAttributeCell(orderedComparisons[2], true)}
                    </div>
                    
                    {/* Hair Color | Eye Color */}
                    <div className="grid grid-cols-2 gap-2">
                      {orderedComparisons[3] && renderAttributeCell(orderedComparisons[3], true)}
                      {orderedComparisons[4] && renderAttributeCell(orderedComparisons[4], true)}
                    </div>
                    
                    {/* Force User | Speaks Basic */}
                    <div className="grid grid-cols-2 gap-2">
                      {orderedComparisons[5] && renderAttributeCell(orderedComparisons[5], true)}
                      {orderedComparisons[6] && renderAttributeCell(orderedComparisons[6], true)}
                    </div>
                  </div>
                  
                  {/* Right: Knowledge Panel */}
                  <div className="space-y-2">
                    {/* Sex | Species | World */}
                    <div className="grid grid-cols-3 gap-2">
                      {orderedComparisons[0] && renderAttributeCell(orderedComparisons[0], false)}
                      {orderedComparisons[1] && renderAttributeCell(orderedComparisons[1], false)}
                      {orderedComparisons[2] && renderAttributeCell(orderedComparisons[2], false)}
                    </div>
                    
                    {/* Hair Color | Eye Color */}
                    <div className="grid grid-cols-2 gap-2">
                      {orderedComparisons[3] && renderAttributeCell(orderedComparisons[3], false)}
                      {orderedComparisons[4] && renderAttributeCell(orderedComparisons[4], false)}
                    </div>
                    
                    {/* Force User | Speaks Basic */}
                    <div className="grid grid-cols-2 gap-2">
                      {orderedComparisons[5] && renderAttributeCell(orderedComparisons[5], false)}
                      {orderedComparisons[6] && renderAttributeCell(orderedComparisons[6], false)}
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
              
              return sortedArrayComparisons.map((item) => (
                <div key={item.comparison.attribute}>
                  {renderArrayRow(item.comparison, item.label, item.target, item.index)}
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
