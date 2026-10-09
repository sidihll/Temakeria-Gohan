import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Check, Sparkles, MessageSquare, UtensilsCrossed } from 'lucide-react';
import { MenuItem, CustomizationOption } from '../types';
import { TEMAKI_REMOVALS, TEMAKI_ADDITIONS, QUICK_OBSERVATIONS } from '../data/menu';
import { FoodVisual } from './FoodVisual';
import { formatCurrency } from '../utils/formatters';

interface CustomizationModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    item: MenuItem,
    quantity: number,
    removals: string[],
    additions: CustomizationOption[],
    observation: string
  ) => void;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
  item,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!item || !isOpen) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedRemovals, setSelectedRemovals] = useState<string[]>([]);
  const [selectedAdditions, setSelectedAdditions] = useState<CustomizationOption[]>([]);
  const [observation, setObservation] = useState('');

  // Calculate pricing
  const additionsTotal = selectedAdditions.reduce((acc, curr) => acc + curr.price, 0);
  const unitPrice = item.price + additionsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleRemoval = (removalName: string) => {
    setSelectedRemovals((prev) =>
      prev.includes(removalName) ? prev.filter((r) => r !== removalName) : [...prev, removalName]
    );
  };

  const toggleAddition = (addition: CustomizationOption) => {
    setSelectedAdditions((prev) => {
      const exists = prev.some((a) => a.id === addition.id);
      if (exists) {
        return prev.filter((a) => a.id !== addition.id);
      } else {
        return [...prev, addition];
      }
    });
  };

  const handleQuickObs = (obsText: string) => {
    setObservation((prev) => {
      if (!prev) return obsText;
      if (prev.includes(obsText)) return prev;
      return `${prev}, ${obsText}`;
    });
  };

  const handleConfirm = () => {
    onConfirm(item, quantity, selectedRemovals, selectedAdditions, observation.trim());
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden z-10"
        >
          {/* Header Bar */}
          <div className="p-4 sm:p-5 border-b border-neutral-800/90 flex items-center justify-between gap-4 bg-neutral-950/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white font-['Outfit'] line-clamp-1">
                  {item.name}
                </h2>
                <span className="text-xs text-neutral-400 font-mono">
                  Base: {formatCurrency(item.price)}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-11 h-11 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center active:scale-90 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Visual Photo Banner com fotografia gastronômica realista */}
            <div className="w-full h-48 sm:h-56 rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-inner">
              <FoodVisual
                imageUrl={item.imageUrl}
                type={item.imageFallbackType}
                name={item.name}
                className="h-full"
                showGradient={true}
              />
            </div>

            {/* Description */}
            <p className="text-sm text-neutral-300 leading-relaxed bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/50">
              {item.description}
            </p>

            {/* 1. SELEÇÃO DE RETIRADAS (Sem cebolinha, Sem cream cheese, etc.) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Prefere retirar algum ingrediente?
                </h3>
                <span className="text-xs text-neutral-500">Opcional</span>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                {TEMAKI_REMOVALS.map((rem) => {
                  const isSelected = selectedRemovals.includes(rem);
                  return (
                    <button
                      key={rem}
                      type="button"
                      onClick={() => toggleRemoval(rem)}
                      className={`min-h-[50px] p-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all duration-150 border cursor-pointer ${
                        isSelected
                          ? 'bg-amber-950/40 text-amber-300 border-amber-600/70 shadow-sm'
                          : 'bg-neutral-950/60 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <span>{rem}</span>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                          isSelected
                            ? 'bg-amber-500 border-amber-500 text-neutral-950'
                            : 'border-neutral-700 bg-neutral-800'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. SELEÇÃO DE ADICIONAIS (Extra gergelim, Molho tarê à parte, etc.) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Adicionais e Molhos
                </h3>
                <span className="text-xs text-neutral-500">Toque para incluir</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {TEMAKI_ADDITIONS.map((add) => {
                  const isSelected = selectedAdditions.some((a) => a.id === add.id);
                  return (
                    <button
                      key={add.id}
                      type="button"
                      onClick={() => toggleAddition(add)}
                      className={`min-h-[50px] p-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all duration-150 border cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/70 shadow-sm'
                          : 'bg-neutral-950/60 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                            isSelected
                              ? 'bg-emerald-500 border-emerald-500 text-neutral-950'
                              : 'border-neutral-700 bg-neutral-800'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-left">{add.name}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-400 shrink-0 ml-2">
                        {add.price === 0 ? 'Grátis' : `+${formatCurrency(add.price)}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. CAMPO DE OBSERVAÇÃO TOUCH */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-neutral-400" />
                  Observações para a Cozinha
                </label>
              </div>

              {/* Quick tags */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {QUICK_OBSERVATIONS.map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => handleQuickObs(quick)}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60 active:scale-95 transition"
                  >
                    + {quick}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Ex: pouco arroz, tarê bem caprichado..."
                className="w-full p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Sticky Modal Footer with Quantity and Confirm Button */}
          <div className="p-4 sm:p-5 bg-neutral-950 border-t border-neutral-800/90 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Quantity Stepper (Hitboxes >= 48px) */}
            <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-2xl p-1.5 w-full sm:w-auto justify-between sm:justify-start">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-12 h-12 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center font-bold active:scale-90 transition cursor-pointer"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="font-mono text-xl font-extrabold px-4 text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-12 h-12 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center font-bold active:scale-90 transition cursor-pointer"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Confirm CTA Button */}
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full sm:w-auto flex-1 min-h-[52px] sm:min-h-[56px] px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl shadow-red-600/25 transition-all cursor-pointer"
            >
              <span>Confirmar Item</span>
              <span className="text-white/60">·</span>
              <span className="font-mono font-extrabold">{formatCurrency(totalPrice)}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
