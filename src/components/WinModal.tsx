import type { Character } from '../types/character';

interface WinModalProps {
  character: Character;
  guessCount: number;
}

import { useState } from 'react';
import type { Character } from '../types/character';

interface WinModalProps {
  character: Character;
  guessCount: number;
}

export default function WinModal({ character, guessCount }: WinModalProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Debug: Log character data
  console.log('WinModal character:', character);
  console.log('Image URL:', character.imageUrl);

  const handleImageError = () => {
    console.error('Image failed to load:', character.imageUrl);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', character.imageUrl);
    setImageLoaded(true);
  };

  return (
    <div className="mb-6 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-lg overflow-hidden shadow-2xl">
      <div className="p-6">
        <div className="text-center mb-4">
          <p className="text-3xl font-bold mb-2">🎉 Victory!</p>
          <p className="text-xl">
            You guessed <span className="font-bold text-sw-yellow">{character.name}</span>
          </p>
          <p className="text-lg mt-2">
            in {guessCount} {guessCount === 1 ? 'guess' : 'guesses'}!
          </p>
        </div>

        {/* Character Image */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            {character.imageUrl ? (
              <div className="relative">
                <img
                  src={character.imageUrl}
                  alt={character.name}
                  className="w-48 h-48 object-cover rounded-lg border-4 border-sw-yellow shadow-lg"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  style={{ display: imageError ? 'none' : 'block' }}
                />
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 w-48 h-48 bg-gray-700 rounded-lg border-4 border-sw-yellow flex items-center justify-center">
                    <p className="text-sm text-gray-400">Loading...</p>
                  </div>
                )}
                {imageError && (
                  <div className="w-48 h-48 bg-gray-700 rounded-lg border-4 border-sw-yellow flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-4xl mb-2">🌟</p>
                      <p className="text-xs text-gray-400">Image unavailable</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-48 h-48 bg-gray-700 rounded-lg border-4 border-sw-yellow flex items-center justify-center">
                <p className="text-4xl">🌟</p>
              </div>
            )}
          </div>
        </div>

        {/* Share button placeholder */}
        <div className="text-center">
          <button
            className="bg-sw-yellow text-black font-bold py-2 px-6 rounded-lg 
                     hover:bg-yellow-300 transition-colors"
            onClick={() => {
              // TODO: Implement share functionality
              alert('Share functionality coming soon!');
            }}
          >
            📤 Share Result
          </button>
        </div>
      </div>
    </div>
  );
}
