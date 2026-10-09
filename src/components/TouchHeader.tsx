import React from 'react';
import { ShoppingBag, User, RotateCcw } from 'lucide-react';
import { CustomerInfo } from '../types';
import { formatCurrency } from '../utils/formatters';

interface TouchHeaderProps {
  customer: CustomerInfo | null;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onResetCustomer?: () => void;
}

export const TouchHeader: React.FC<TouchHeaderProps> = ({
  customer,
  cartCount,
  cartTotal,
  onOpenCart,
  onResetCustomer,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 md:gap-8">
      {/* Zone 1: Brand Zone - Single Wordmark Element */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500 font-bold font-serif text-lg">
          御
        </div>
        <div className="flex flex-col">
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-['Outfit'] whitespace-nowrap leading-none">
            GOHAN <span className="text-red-500">TEMAKERIA</span>
          </span>
          <span className="text-[11px] font-medium text-neutral-400 tracking-wider">
            AUTOATENDIMENTO
          </span>
        </div>
      </div>

      {/* Zone 2: Customer identification preview or status */}
      <div className="hidden md:flex items-center gap-3 text-xs text-neutral-400 shrink-0">
        {customer ? (
          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg">
            <User className="w-3.5 h-3.5 text-red-400" />
            <span className="text-neutral-200 font-medium">{customer.name}</span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-400 font-mono">{customer.phone}</span>
            {onResetCustomer && (
              <button
                onClick={onResetCustomer}
                title="Trocar cliente"
                className="ml-1 text-neutral-500 hover:text-neutral-300 p-0.5 rounded transition"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          <span className="text-neutral-500">Selecione seus itens e personalize seu temaki</span>
        )}
      </div>

      {/* Zone 3: 1 Primary Action - Cart Trigger (Large Touch Hitbox >= 48px) */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenCart}
          className="min-h-[48px] px-4 py-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-semibold rounded-xl flex items-center gap-2.5 shadow-lg shadow-red-600/20 transition-all duration-150 cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-red-600 text-[11px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            )}
          </div>
          <span className="hidden sm:inline text-sm whitespace-nowrap">
            {cartCount === 0 ? 'Carrinho Vazio' : 'Ver Carrinho'}
          </span>
          {cartCount > 0 && (
            <span className="font-mono text-sm font-bold bg-red-700/60 px-2 py-0.5 rounded text-white ml-0.5">
              {formatCurrency(cartTotal)}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
