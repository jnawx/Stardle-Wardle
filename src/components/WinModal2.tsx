import { useState } from 'react';
import type { Character } from '../types/character';

interface WinModalProps {
  character: Character;
  guessCount: number;
  quoteHintUsed?: boolean;
  masterHintUsed?: boolean;
}

export default function WinModal({ character, guessCount, quoteHintUsed = false, masterHintUsed = false }: WinModalProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Use image URL from character data
  const imageUrl = character.imageUrl || '';

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className="mb-6 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-lg overflow-hidden shadow-2xl animate-slide-up-scale">
      <div className="p-6">
        {/* Horizontal layout: Image on left, content on right - centered */}
        <div className="flex items-center justify-center gap-6">
          {/* Character Image */}
          <div className="flex-shrink-0">
            {imageUrl ? (
              <div className="relative">
                {/* Starfield background container */}
                <div className="w-32 h-32 bg-sw-space rounded-lg border-4 border-sw-yellow shadow-lg overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={character.name}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    style={{ display: imageError ? 'none' : 'block' }}
                  />
                </div>
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 w-32 h-32 bg-sw-space rounded-lg border-4 border-sw-yellow flex items-center justify-center">
                    <p className="text-xs text-gray-400">Loading...</p>
                  </div>
                )}
                {imageError && (
                  <div className="w-32 h-32 bg-sw-space rounded-lg border-4 border-sw-yellow flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl mb-1">🌟</p>
                      <p className="text-xs text-gray-400">Image unavailable</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-32 h-32 bg-sw-space rounded-lg border-4 border-sw-yellow flex items-center justify-center">
                <p className="text-3xl">🌟</p>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col justify-center text-center">
            <p className="text-2xl font-bold mb-3">🎉 Victory! 🎉</p>
            <p className="text-xl mb-2">
              You guessed <span className="font-bold text-sw-yellow">{character.name}</span>
            </p>
            <p className="text-lg mb-2">
              in <span className="font-bold text-sw-yellow">{guessCount}</span> {guessCount === 1 ? 'guess' : 'guesses'}!
            </p>

            {/* Hint Usage Display */}
            {(quoteHintUsed || masterHintUsed) && (
              <div className="flex items-center justify-center gap-3 text-sm opacity-80">
                {quoteHintUsed && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-sw-yellow" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                    <span>Quote used</span>
                  </div>
                )}
                {masterHintUsed && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>Master used</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
