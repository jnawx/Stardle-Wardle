import { useState, useMemo, useEffect, useRef } from 'react';
import type { Character, AttributeKey } from '../types/character';

interface CharacterFilterProps {
  characters: Character[];
  guessedCharacterIds: string[];
  onSelectCharacter: (character: Character) => void;
  disabled?: boolean;
}

type FilterableAttribute = Exclude<AttributeKey, 'forceUser' | 'speaksBasic'>;

const ATTRIBUTE_LABELS: Record<FilterableAttribute, string> = {
  species: 'Species',
  sex: 'Sex',
  hairColor: 'Hair Color',
  eyeColor: 'Eye Color',
  homeworld: 'Homeworld',
  affiliations: 'Affiliations',
  eras: 'Eras',
  weapons: 'Weapons',
  movieAppearances: 'Movies',
  tvAppearances: 'TV Shows',
  gameAppearances: 'Games',
  bookComicAppearances: 'Books/Comics',
};

export default function CharacterFilter({
  characters,
  guessedCharacterIds,
  onSelectCharacter,
  disabled = false,
}: CharacterFilterProps) {
  const [selectedAttribute, setSelectedAttribute] = useState<FilterableAttribute | ''>('');
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get unguessed characters
  const unguessedCharacters = useMemo(() => {
    return characters.filter(char => !guessedCharacterIds.includes(char.id));
  }, [characters, guessedCharacterIds]);

  // Get available values for each attribute from unguessed characters
  const attributeValues = useMemo(() => {
    const values: Record<FilterableAttribute, Set<string>> = {
      species: new Set(),
      sex: new Set(),
      hairColor: new Set(),
      eyeColor: new Set(),
      homeworld: new Set(),
      affiliations: new Set(),
      eras: new Set(),
      weapons: new Set(),
      movieAppearances: new Set(),
      tvAppearances: new Set(),
      gameAppearances: new Set(),
      bookComicAppearances: new Set(),
    };

    unguessedCharacters.forEach(char => {
      // Single value attributes
      if (char.species) values.species.add(char.species);
      if (char.sex) values.sex.add(char.sex);
      if (char.hairColor) values.hairColor.add(char.hairColor);
      if (char.eyeColor) values.eyeColor.add(char.eyeColor);
      if (char.homeworld) values.homeworld.add(char.homeworld);

      // Array attributes
      char.affiliations?.forEach(aff => values.affiliations.add(aff));
      char.eras?.forEach(era => values.eras.add(era));
      char.weapons?.forEach(weapon => values.weapons.add(weapon));
      char.movieAppearances?.forEach(movie => values.movieAppearances.add(movie));
      char.tvAppearances?.forEach(tv => values.tvAppearances.add(tv));
      char.gameAppearances?.forEach(game => values.gameAppearances.add(game));
      char.bookComicAppearances?.forEach(book => values.bookComicAppearances.add(book));
    });

    // Convert Sets to sorted arrays
    const result: Record<FilterableAttribute, string[]> = {} as any;
    Object.keys(values).forEach(key => {
      result[key as FilterableAttribute] = Array.from(values[key as FilterableAttribute]).sort((a, b) => a.localeCompare(b));
    });

    return result;
  }, [unguessedCharacters]);

  // Filter characters based on selected attribute and value
  const filteredCharacters = useMemo(() => {
    if (!selectedAttribute || !selectedValue) {
      return [];
    }

    return characters.filter(char => {
      // Don't include guessed characters
      if (guessedCharacterIds.includes(char.id)) {
        return false;
      }

      const attrValue = char[selectedAttribute];

      if (Array.isArray(attrValue)) {
        // For array attributes, check if the selected value is in the array
        return attrValue.includes(selectedValue);
      } else {
        // For single value attributes, check exact match
        return attrValue === selectedValue;
      }
    });
  }, [characters, selectedAttribute, selectedValue, guessedCharacterIds]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAttributeChange = (attribute: FilterableAttribute | '') => {
    setSelectedAttribute(attribute);
    setSelectedValue('');
    setShowDropdown(false);
  };

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    setShowDropdown(true);
  };

  const handleCharacterSelect = (character: Character) => {
    onSelectCharacter(character);
    setShowDropdown(false);
    // Keep the filter active for potential multiple selections
  };

  const clearFilter = () => {
    setSelectedAttribute('');
    setSelectedValue('');
    setShowDropdown(false);
  };

  const hasActiveFilter = selectedAttribute && selectedValue;

  return (
    <div className="bg-sw-gray rounded-lg p-4 border-2 border-gray-600 mb-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-white text-sm font-medium">Filter by:</label>
          <select
            value={selectedAttribute}
            onChange={(e) => handleAttributeChange(e.target.value as FilterableAttribute | '')}
            disabled={disabled}
            className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 text-sm focus:border-sw-yellow focus:outline-none disabled:opacity-50"
          >
            <option value="">No filter</option>
            {Object.entries(ATTRIBUTE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {selectedAttribute && (
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">with value:</span>
            <select
              value={selectedValue}
              onChange={(e) => handleValueChange(e.target.value)}
              disabled={disabled}
              className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 text-sm focus:border-sw-yellow focus:outline-none disabled:opacity-50"
            >
              <option value="">Select value...</option>
              {attributeValues[selectedAttribute].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        )}

        {hasActiveFilter && (
          <button
            onClick={clearFilter}
            disabled={disabled}
            className="text-sw-yellow hover:text-yellow-300 text-sm underline focus:outline-none disabled:opacity-50"
          >
            Clear filter
          </button>
        )}
      </div>

      {hasActiveFilter && (
        <div className="mt-2 text-sm text-gray-400">
          Found {filteredCharacters.length} character{filteredCharacters.length !== 1 ? 's' : ''} with{' '}
          <span className="text-sw-yellow font-medium">
            {ATTRIBUTE_LABELS[selectedAttribute]}: {selectedValue}
          </span>
        </div>
      )}

      {/* Character Dropdown */}
      {hasActiveFilter && showDropdown && filteredCharacters.length > 0 && !disabled && (
        <div
          ref={dropdownRef}
          className="relative mt-4"
        >
          <div className="bg-gray-800 border-2 border-gray-600 rounded-lg max-h-64 overflow-y-auto shadow-xl">
            {filteredCharacters.map((character) => (
              <button
                key={character.id}
                onClick={() => handleCharacterSelect(character)}
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
        </div>
      )}

      {hasActiveFilter && showDropdown && filteredCharacters.length === 0 && (
        <div className="mt-4 bg-gray-800 border-2 border-gray-600 rounded-lg px-4 py-3 text-gray-400 text-center">
          No characters found with the selected filter
        </div>
      )}
    </div>
  );
}
