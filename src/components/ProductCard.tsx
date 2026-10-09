import React from 'react';
import { Plus, SlidersHorizontal, Flame, Sparkles } from 'lucide-react';
import { MenuItem } from '../types';
import { FoodVisual } from './FoodVisual';
import { formatCurrency } from '../utils/formatters';

interface ProductCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
  quantityInCart?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  onSelect,
  quantityInCart = 0,
}) => {
  return (
    <div
      onClick={() => onSelect(item)}
      className="group relative bg-neutral-900/80 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700/80 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 shadow-lg hover:shadow-2xl cursor-pointer active:scale-[0.99] select-none"
    >
      {/* Visual Header / Image Container com fotografia realista 4:3 */}
      <div className="relative w-full aspect-[4/3] sm:h-56 overflow-hidden bg-neutral-950 rounded-t-2xl">
        <FoodVisual
          imageUrl={item.imageUrl}
          type={item.imageFallbackType}
          name={item.name}
          className="h-full"
          showGradient={true}
        />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {item.badge && (
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-neutral-950/85 text-neutral-200 border border-neutral-700/60 backdrop-blur-md flex items-center gap-1">
              {item.spicy ? <Flame className="w-3 h-3 text-red-500" /> : <Sparkles className="w-3 h-3 text-amber-400" />}
              {item.badge}
            </span>
          )}
        </div>

        {/* In-cart indicator badge */}
        {quantityInCart > 0 && (
          <div className="absolute top-3 right-3 z-10 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
            <span>{quantityInCart} no pedido</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1 font-['Outfit']">
              {item.name}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 line-clamp-2 leading-relaxed mb-4">
            {item.description}
          </p>
        </div>

        {/* Footer with Price and Action Button */}
        <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider block">
              Valor
            </span>
            <span className="text-lg sm:text-xl font-bold font-mono text-emerald-400">
              {formatCurrency(item.price)}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item);
            }}
            className={`min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-md ${
              item.isTemaki
                ? 'bg-neutral-800 hover:bg-red-600 text-white border border-neutral-700/80 hover:border-red-500 active:scale-95'
                : 'bg-red-600 hover:bg-red-500 text-white active:scale-95'
            }`}
          >
            {item.isTemaki ? (
              <>
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Personalizar</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
