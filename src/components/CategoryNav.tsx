import React from 'react';
import { CategoryId } from '../types';
import { CATEGORIES } from '../data/menu';

interface CategoryNavProps {
  activeCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  itemCounts: Record<CategoryId, number>;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
  itemCounts,
}) => {
  return (
    <div className="w-full bg-neutral-950/60 border-b border-neutral-900 py-3 px-4 sm:px-6 sticky top-[69px] z-20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          const count = itemCounts[cat.id] ?? 0;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`min-h-[48px] px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap shrink-0 flex items-center gap-2.5 transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-neutral-100 text-neutral-950 shadow-md shadow-white/5 active:scale-95'
                  : 'bg-neutral-900/90 text-neutral-400 hover:text-white hover:bg-neutral-850 border border-neutral-800/80 active:scale-95'
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-md font-mono ${
                  isActive
                    ? 'bg-neutral-200 text-neutral-900 font-bold'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
