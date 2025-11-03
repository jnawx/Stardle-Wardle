import { useState, useMemo } from 'react';
import type { Character, AttributeKey } from '../types/character';

interface CharacterFilterProps {
  characters: Character[];
  guessedCharacterIds: string[];
  onFilterChange: (filteredCharacters: Character[]) => void;
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
  onFilterChange,
}: CharacterFilterProps) {
  const [selectedAttribute, setSelectedAttribute] = useState<FilterableAttribute | ''>('');
  const [selectedValue, setSelectedValue] = useState<string>('');

  // Get unguessed characters
  const unguessedCharacters = useMemo(() => {
    return characters.filter(char => !guessedCharacterIds.includes(char.id));
  }, [characters, guessedCharacterIds]);

  // Get available values for each attribute from unguessed characters
  const attributeValues = useMemo(() => {
    const values: Record<FilterableAttribute, string[]> = {
      species: [],
      sex: [],
      hairColor: [],
      eyeColor: [],
      homeworld: [],
      affiliations: [],
      eras: [],
      weapons: [],
      movieAppearances: [],
      tvAppearances: [],
      gameAppearances: [],
      bookComicAppearances: [],
    };

    unguessedCharacters.forEach(char => {
      // Single value attributes
      if (char.species && !values.species.includes(char.species)) {
        values.species.push(char.species);
      }
      if (char.sex && !values.sex.includes(char.sex)) {
        values.sex.push(char.sex);
      }
      if (char.hairColor && !values.hairColor.includes(char.hairColor)) {
        values.hairColor.push(char.hairColor);
      }
      if (char.eyeColor && !values.eyeColor.includes(char.eyeColor)) {
        values.eyeColor.push(char.eyeColor);
      }
      if (char.homeworld && !values.homeworld.includes(char.homeworld)) {
        values.homeworld.push(char.homeworld);
      }

      // Array attributes
      char.affiliations?.forEach(aff => {
        if (!values.affiliations.includes(aff)) {
          values.affiliations.push(aff);
        }
      });
      char.eras?.forEach(era => {
        if (!values.eras.includes(era)) {
          values.eras.push(era);
        }
      });
      char.weapons?.forEach(weapon => {
        if (!values.weapons.includes(weapon)) {
          values.weapons.push(weapon);
        }
      });
      char.movieAppearances?.forEach(movie => {
        if (!values.movieAppearances.includes(movie)) {
          values.movieAppearances.push(movie);
        }
      });
      char.tvAppearances?.forEach(tv => {
        if (!values.tvAppearances.includes(tv)) {
          values.tvAppearances.push(tv);
        }
      });
      char.gameAppearances?.forEach(game => {
        if (!values.gameAppearances.includes(game)) {
          values.gameAppearances.push(game);
        }
      });
      char.bookComicAppearances?.forEach(book => {
        if (!values.bookComicAppearances.includes(book)) {
          values.bookComicAppearances.push(book);
        }
      });
    });

    // Sort values alphabetically
    Object.keys(values).forEach(key => {
      values[key as FilterableAttribute].sort((a, b) => a.localeCompare(b));
    });

    return values;
  }, [unguessedCharacters]);

  // Filter characters based on selected attribute and value
  const filteredCharacters = useMemo(() => {
    if (!selectedAttribute || !selectedValue) {
      return characters; // Return all characters if no filter is applied
    }

    return characters.filter(char => {
      const attrValue = char[selectedAttribute];

      if (Array.isArray(attrValue)) {
        // For array attributes, check if the selected value is in the array
        return attrValue.includes(selectedValue);
      } else {
        // For single value attributes, check exact match
        return attrValue === selectedValue;
      }
    });
  }, [characters, selectedAttribute, selectedValue]);

  // Notify parent of filter changes
  useMemo(() => {
    onFilterChange(filteredCharacters);
  }, [filteredCharacters, onFilterChange]);

  const handleAttributeChange = (attribute: FilterableAttribute | '') => {
    setSelectedAttribute(attribute);
    setSelectedValue(''); // Reset value when attribute changes
  };

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
  };

  const clearFilter = () => {
    setSelectedAttribute('');
    setSelectedValue('');
  };

  return (
    <div className="bg-sw-gray rounded-lg p-4 border-2 border-gray-600 mb-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-white text-sm font-medium">Filter by:</label>
          <select
            value={selectedAttribute}
            onChange={(e) => handleAttributeChange(e.target.value as FilterableAttribute | '')}
            className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 text-sm focus:border-sw-yellow focus:outline-none"
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
              className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 text-sm focus:border-sw-yellow focus:outline-none"
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

        {(selectedAttribute || selectedValue) && (
          <button
            onClick={clearFilter}
            className="text-sw-yellow hover:text-yellow-300 text-sm underline focus:outline-none"
          >
            Clear filter
          </button>
        )}
      </div>

      {selectedAttribute && selectedValue && (
        <div className="mt-2 text-sm text-gray-400">
          Showing {filteredCharacters.length} character{filteredCharacters.length !== 1 ? 's' : ''} with{' '}
          <span className="text-sw-yellow font-medium">
            {ATTRIBUTE_LABELS[selectedAttribute]}: {selectedValue}
          </span>
        </div>
      )}
    </div>
  );
}
