import React, { useState } from 'react';
import { MenuItem } from '../types';
import { Utensils } from 'lucide-react';

interface FoodVisualProps {
  imageUrl?: string;
  name: string;
  type?: MenuItem['imageFallbackType'];
  className?: string;
  showGradient?: boolean;
}

export const FoodVisual: React.FC<FoodVisualProps> = ({
  imageUrl,
  name,
  className = '',
  showGradient = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative w-full h-full overflow-hidden bg-neutral-900 select-none ${className}`}>
      {/* Loading placeholder skeleton */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-neutral-850 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-600">
            <Utensils className="w-4 h-4 animate-spin text-neutral-500" />
          </div>
        </div>
      )}

      {/* Realistic Photography Image */}
      {!hasError && imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        />
      ) : (
        /* Styled Dark Theme Fallback */
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-neutral-400 p-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-950/40 border border-red-900/40 flex items-center justify-center text-red-500 font-serif text-xl mb-2">
            御
          </div>
          <span className="text-xs font-bold text-neutral-300 font-['Outfit']">{name}</span>
          <span className="text-[10px] text-neutral-500">Temakeria Gohan</span>
        </div>
      )}

      {/* Leve gradiente inferior escuro para valorizar a foto no dark mode */}
      {showGradient && (
        <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
      )}
    </div>
  );
};
