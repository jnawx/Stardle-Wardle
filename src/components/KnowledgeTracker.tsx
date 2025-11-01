import type { AccumulatedKnowledge, Character } from '../types/character';

interface KnowledgeTrackerProps {
  knowledge: AccumulatedKnowledge;
  targetCharacter: Character;
}

const KnowledgeTracker = ({ knowledge, targetCharacter }: KnowledgeTrackerProps) => {

  const renderSingleValue = (
    label: string,
    value: string | boolean | undefined
  ) => {
    const hasValue = value !== undefined;
    const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;

    return (
      <div
        className={`
          ${hasValue ? 'bg-green-600' : 'bg-gray-700'}
          p-3 rounded shadow-md
        `}
      >
        <div className="flex items-center gap-4">
          <div className="text-sm font-bold w-24 flex-shrink-0 opacity-70">
            {label}
          </div>
          <div className="text-base font-bold flex-1">
            {hasValue ? displayValue : ''}
          </div>
        </div>
      </div>
    );
  };

  const renderArrayValue = (
    label: string, 
    items: string[], 
    targetItems: string[] | undefined
  ) => {
    const hasItems = items.length > 0;
    const targetArray = targetItems || [];
    
    // Check if target has "None"
    const targetHasNone = targetArray.length === 1 && targetArray[0] === 'None';
    const knowledgeHasNone = items.length === 1 && items[0] === 'None';
    
    // Determine if all items are found
    const allItemsFound = targetHasNone 
      ? knowledgeHasNone  // If target is "None", we need to have guessed "None"
      : targetArray.length > 0 && items.length === targetArray.length;
    
    const bgColor = allItemsFound ? 'bg-green-600' : hasItems ? 'bg-yellow-600' : 'bg-gray-700';

    return (
      <div className={`${bgColor} p-3 rounded shadow-md`}>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-bold opacity-70">
            {label}
          </div>
          {hasItems ? (
            <div className="flex flex-wrap gap-1.5">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-green-600 px-2 py-1 rounded text-xs font-medium"
                >
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm opacity-50 text-center py-2">
              No matches yet
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-bold text-white mb-4 text-center">
        Confirmed Knowledge
      </h3>
      
      {/* Character Image Placeholder */}
      <div className="flex items-center gap-3 p-3 bg-gray-800 rounded">
        <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center">
          <span className="text-gray-500 text-xs">?</span>
        </div>
        <div className="text-lg font-bold text-gray-500">Target Character</div>
      </div>

      {/* Single-value attributes */}
      {renderSingleValue('Species', knowledge.species)}
      {renderSingleValue('Sex', knowledge.sex)}
      {renderSingleValue('Hair', knowledge.hairColor)}
      {renderSingleValue('Eyes', knowledge.eyeColor)}
      {renderSingleValue('Homeworld', knowledge.homeworld)}
      {renderSingleValue('Force User', knowledge.forceUser)}

      {/* Array attributes */}
      {renderArrayValue('Affiliations', Object.keys(knowledge.affiliations).filter(k => knowledge.affiliations[k] === 'confirmed-match'), targetCharacter.affiliations)}
      {renderArrayValue('Eras', Object.keys(knowledge.eras).filter(k => knowledge.eras[k] === 'confirmed-match'), targetCharacter.eras)}
      {renderArrayValue('Weapons', Object.keys(knowledge.weapons).filter(k => knowledge.weapons[k] === 'confirmed-match'), targetCharacter.weapons)}
      {renderArrayValue('Movies', Object.keys(knowledge.movieAppearances).filter(k => knowledge.movieAppearances[k] === 'confirmed-match'), targetCharacter.movieAppearances)}
      {renderArrayValue('TV Shows', Object.keys(knowledge.tvAppearances).filter(k => knowledge.tvAppearances[k] === 'confirmed-match'), targetCharacter.tvAppearances)}
      {renderArrayValue('Games', Object.keys(knowledge.gameAppearances).filter(k => knowledge.gameAppearances[k] === 'confirmed-match'), targetCharacter.gameAppearances)}
      {renderArrayValue('Books/Comics', Object.keys(knowledge.bookComicAppearances).filter(k => knowledge.bookComicAppearances[k] === 'confirmed-match'), targetCharacter.bookComicAppearances)}
    </div>
  );
};

export default KnowledgeTracker;
