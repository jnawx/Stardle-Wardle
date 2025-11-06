import type { AttributeComparison } from '../types/character';

interface GuessRowProps {
  characterName: string;
  imageUrl?: string;
  comparisons: AttributeComparison[];
  animate?: boolean;
}

// Define the media types for labeling
const MEDIA_TYPES = {
  movieAppearances: 'Movies',
  tvAppearances: 'TV',
  gameAppearances: 'Games',
  bookAppearances: 'Books'
} as const;

export default function GuessRow({ characterName, imageUrl, comparisons, animate = false }: GuessRowProps) {
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
    if (value === undefined) {
      return 'N/A';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (Array.isArray(value)) {
      // For "None" values, just display "None"
      if (value.length === 1 && value[0] === 'None') {
        return 'None';
      }
      return value.join(', ');
    }
    return value;
  };

  const isMediaAttribute = (attribute: string): attribute is keyof typeof MEDIA_TYPES => {
    return attribute in MEDIA_TYPES;
  };

  const renderMediaCell = (comparison: AttributeComparison, index: number) => {
    if (!isMediaAttribute(comparison.attribute)) {
      return null;
    }

    const guessValues = Array.isArray(comparison.value) ? comparison.value : [];
    const label = MEDIA_TYPES[comparison.attribute];
    
    // If character has "None", show simplified version
    if (guessValues.length === 0 || (guessValues.length === 1 && guessValues[0] === 'None')) {
      return (
        <div
          key={index}
          className={`
            ${getMatchColor(comparison.match)}
            p-3 rounded
            transition-all duration-300
            shadow-md hover:shadow-lg
            ${animate ? 'animate-slide-in' : ''}
          `}
          style={animate ? { animationDelay: `${index * 0.05}s`, opacity: 0, animationFillMode: 'forwards' } : { opacity: 1 }}
        >
          {/* Horizontal layout: label on left, value on right */}
          <div className="flex items-center gap-4">
            <div className="text-sm font-bold w-24 flex-shrink-0 opacity-70">
              {label}
            </div>
            <div className="text-base font-bold flex-1">
              None
            </div>
          </div>
        </div>
      );
    }

    // Get matched and unmatched items from the comparison
    const matchedItems = comparison.matchedItems || [];
    const unmatchedItems = comparison.unmatchedItems || [];
    
    return (
      <div
        key={index}
        className={`
          ${getMatchColor(comparison.match)}
          p-3 rounded
          transition-all duration-300
          shadow-md hover:shadow-lg
          ${animate ? 'animate-slide-in' : ''}
        `}
        style={animate ? { animationDelay: `${index * 0.05}s`, opacity: 0, animationFillMode: 'forwards' } : { opacity: 1 }}
      >
        {/* Vertical layout: label on top, items wrapped horizontally */}
        <div className="flex flex-col gap-2">
          {/* Label */}
          <div className="text-sm font-bold opacity-70">
            {label}
          </div>
          
          {/* Items in horizontal wrap */}
          <div className="flex flex-wrap gap-1.5">
            {/* Show matched items in green */}
            {matchedItems.map((media) => (
              <div
                key={media}
                className="bg-green-500 bg-opacity-30 px-2 py-1 rounded text-xs border border-green-400"
                title={`${media} ✓ (Match!)`}
              >
                {media}
              </div>
            ))}
            {/* Show unmatched items in red */}
            {unmatchedItems.map((media) => (
              <div
                key={media}
                className="bg-red-500 bg-opacity-30 px-2 py-1 rounded text-xs border border-red-400"
                title={`${media} ✗ (No match)`}
              >
                {media}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-4">
      {/* Character name label with image */}
      <div className="flex items-center gap-3 mb-2 px-1">
        {/* Character Image - smaller, inline */}
        <div className="w-16 h-16 flex-shrink-0 bg-sw-gray rounded overflow-hidden border-2 border-gray-700">
          <img
            src={imageUrl || ''}
            alt={characterName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-lg text-gray-200 font-bold">{characterName}</div>
      </div>
      
      {/* Vertical list of attributes - each gets full width */}
      <div className="space-y-2">
        {comparisons.map((comparison, index) => {
          // Check if this is a media appearance attribute
          if (isMediaAttribute(comparison.attribute)) {
            return renderMediaCell(comparison, index);
          }

          // Check if this is an array attribute that should show matched/unmatched items
          const isArrayAttribute = Array.isArray(comparison.value) && 
            (comparison.attribute === 'affiliations' || 
             comparison.attribute === 'eras' || 
             comparison.attribute === 'weapons');

          if (isArrayAttribute && comparison.matchedItems) {
            const matchedItems = comparison.matchedItems || [];
            const unmatchedItems = comparison.unmatchedItems || [];

            return (
              <div
                key={index}
                className={`
                  ${getMatchColor(comparison.match)}
                  p-3 rounded
                  transition-all duration-300
                  shadow-md hover:shadow-lg
                  ${animate ? 'animate-slide-in' : ''}
                `}
                style={animate ? { animationDelay: `${index * 0.05}s`, opacity: 0, animationFillMode: 'forwards' } : { opacity: 1 }}
              >
                {/* Vertical layout: label on top, items wrapped horizontally */}
                <div className="flex flex-col gap-2">
                  {/* Label */}
                  <div className="text-sm font-bold opacity-70">
                    {comparison.attribute.charAt(0).toUpperCase() + comparison.attribute.slice(1)}
                  </div>
                  
                  {/* Items in horizontal wrap */}
                  <div className="flex flex-wrap gap-1.5">
                    {/* Show matched items in green */}
                    {matchedItems.map((item) => (
                      <div
                        key={item}
                        className="bg-green-500 bg-opacity-30 px-2 py-1 rounded text-xs border border-green-400"
                        title={`${item} ✓`}
                      >
                        {item}
                      </div>
                    ))}
                    {/* Show unmatched items in red */}
                    {unmatchedItems.map((item) => (
                      <div
                        key={item}
                        className="bg-red-500 bg-opacity-30 px-2 py-1 rounded text-xs border border-red-400"
                        title={`${item} ✗`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          // Regular attribute cell (for non-array or simple display)
          return (
            <div
              key={index}
              className={`
                ${getMatchColor(comparison.match)}
                p-3 rounded
                transition-all duration-300
                shadow-md hover:shadow-lg
                ${animate ? 'animate-slide-in' : ''}
              `}
              style={animate ? { animationDelay: `${index * 0.05}s`, opacity: 0, animationFillMode: 'forwards' } : { opacity: 1 }}
            >
              {/* Horizontal layout: label on left, value on right */}
              <div className="flex items-center gap-4">
                <div className="text-sm font-bold w-24 flex-shrink-0 opacity-70">
                  {comparison.attribute.charAt(0).toUpperCase() + comparison.attribute.slice(1)}
                </div>
                <div className="text-base font-bold flex-1">
                  {formatValue(comparison.value)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
