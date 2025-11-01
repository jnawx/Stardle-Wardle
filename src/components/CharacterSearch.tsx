import { useState, useRef, useEffect } from 'react';
import type { Character } from '../types/character';

interface CharacterSearchProps {
  characters: Character[];
  onSelectCharacter: (character: Character) => void;
  disabled?: boolean;
  guessedCharacterIds?: string[];
}

export default function CharacterSearch({
  characters,
  onSelectCharacter,
  disabled = false,
  guessedCharacterIds = [],
}: CharacterSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter characters based on search term (check name and additional names)
  // Match the start of any word, ignoring non-alphanumeric characters
  const filteredCharacters = searchTerm.trim()
    ? characters.filter(character => {
        // First, exclude already guessed characters
        if (guessedCharacterIds.includes(character.id)) {
          return false;
        }
        
        // Normalize search term: lowercase and remove non-alphanumeric
        const searchNormalized = searchTerm.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        if (!searchNormalized) return false;
        
        // Helper function to check if search matches start of any word or the full normalized name
        const matchesAnyWord = (text: string): boolean => {
          // Normalize text: lowercase and keep spaces to identify word boundaries
          const textLower = text.toLowerCase();
          
          // First check if the fully normalized name starts with the search
          const fullNormalized = textLower.replace(/[^a-z0-9]/g, '');
          if (fullNormalized.startsWith(searchNormalized)) {
            return true;
          }
          
          // Split into words (by spaces, hyphens, parentheses, etc.)
          const words = textLower.split(/[\s\-()]+/).filter(w => w.length > 0);
          
          // Check if search matches the start of any word (after removing non-alphanumeric)
          return words.some(word => {
            const wordNormalized = word.replace(/[^a-z0-9]/g, '');
            return wordNormalized.startsWith(searchNormalized);
          });
        };
        
        const nameMatch = matchesAnyWord(character.name);
        const aliasMatch = character.additionalNames?.some(alias => matchesAnyWord(alias));
        
        return nameMatch || aliasMatch;
      }).slice(0, 10) // Limit to 10 suggestions
    : [];

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (character: Character) => {
    onSelectCharacter(character);
    setSearchTerm('');
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredCharacters.length === 1) {
      handleSelect(filteredCharacters[0]);
    }
  };

  return (
    <div className="relative max-w-md mx-auto">
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search for a character..."
        disabled={disabled}
        className="w-full px-4 py-3 bg-sw-gray text-white border-2 border-gray-600 rounded-lg 
                   focus:border-sw-yellow focus:outline-none focus:ring-2 focus:ring-sw-yellow focus:ring-opacity-50
                   disabled:opacity-50 disabled:cursor-not-allowed
                   placeholder-gray-500 transition-all duration-200
                   text-lg"
      />

      {showSuggestions && filteredCharacters.length > 0 && !disabled && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-2 bg-sw-gray border-2 border-gray-600 rounded-lg 
                     max-h-64 overflow-y-auto shadow-xl animate-fade-in"
        >
          {filteredCharacters.map((character) => (
            <button
              key={character.id}
              onClick={() => handleSelect(character)}
              className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-all duration-200
                         border-b border-gray-700 last:border-b-0
                         focus:bg-gray-700 focus:outline-none flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded overflow-hidden border-2 border-gray-600 flex-shrink-0">
                <img
                  src={character.imageUrl || ''}
                  alt={character.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Show placeholder if image fails to load
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
                <div className="w-full h-full bg-gray-700 hidden items-center justify-center text-gray-500 text-xs">
                  ?
                </div>
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">{character.name}</div>
                <div className="text-sm text-gray-400">
                  {character.species} • {character.homeworld}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showSuggestions && searchTerm.trim() && filteredCharacters.length === 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-2 bg-sw-gray border-2 border-gray-600 rounded-lg 
                     px-4 py-3 text-gray-400 text-center"
        >
          No characters found
        </div>
      )}
    </div>
  );
}
