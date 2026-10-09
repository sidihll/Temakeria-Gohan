import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';
import { CartItem, CustomerInfo } from '../types';
import { formatCurrency } from '../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  customer: CustomerInfo | null;
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onCheckout: () => void;
  isCheckingOut?: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  customer,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isCheckingOut = false,
}) => {
  if (!isOpen) return null;

  const totalAmount = items.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const totalItemCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm cursor-pointer"
        />

        {/* Slide-over Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-md sm:max-w-lg h-full bg-neutral-900 border-l border-neutral-800 shadow-2xl flex flex-col z-10"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-['Outfit']">
                  Seu Pedido
                </h2>
                <p className="text-xs text-neutral-400">
                  {customer ? `Cliente: ${customer.name}` : `${totalItemCount} itens no carrinho`}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition active:scale-95 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
                <div className="w-16 h-16 rounded-full bg-neutral-800/80 flex items-center justify-center mb-3">
                  <ShoppingBag className="w-8 h-8 text-neutral-600" />
                </div>
                <p className="text-base font-semibold text-neutral-300">Carrinho vazio</p>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                  Adicione seus temakis favoritos e acompanhamentos pelo cardápio.
                </p>
              </div>
            ) : (
              items.map((cartItem) => (
                <div
                  key={cartItem.cartId}
                  className="bg-neutral-950/70 border border-neutral-800/80 rounded-2xl p-4 flex flex-col gap-2.5 transition hover:border-neutral-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {cartItem.item.imageUrl && (
                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-neutral-900 border border-neutral-800">
                          <img
                            src={cartItem.item.imageUrl}
                            alt={cartItem.item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-white font-['Outfit']">
                          {cartItem.item.name}
                        </h4>
                        <span className="text-xs font-mono text-emerald-400 font-bold">
                          {formatCurrency(cartItem.unitPrice)} un.
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(cartItem.cartId)}
                      className="text-neutral-500 hover:text-red-400 p-1.5 rounded-lg transition active:scale-90"
                      title="Remover item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Badges for Removals and Additions */}
                  {(cartItem.removals.length > 0 ||
                    cartItem.additions.length > 0 ||
                    cartItem.observation) && (
                    <div className="space-y-1 pt-1 border-t border-neutral-900 text-xs">
                      {cartItem.removals.map((r) => (
                        <div key={r} className="text-amber-400/90 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-amber-400" />
                          <span>{r}</span>
                        </div>
                      ))}
                      {cartItem.additions.map((a) => (
                        <div key={a.id} className="text-emerald-400/90 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-emerald-400" />
                          <span>{a.name} ({a.price > 0 ? `+${formatCurrency(a.price)}` : 'Grátis'})</span>
                        </div>
                      ))}
                      {cartItem.observation && (
                        <div className="text-neutral-400 italic text-[11px] pt-0.5">
                          Obs: &ldquo;{cartItem.observation}&rdquo;
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quantity Stepper & Item Total */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
                    <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl p-1">
                      <button
                        onClick={() => onUpdateQuantity(cartItem.cartId, -1)}
                        className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center font-bold active:scale-90 transition cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-mono text-sm font-bold px-2 text-white">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(cartItem.cartId, 1)}
                        className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center font-bold active:scale-90 transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <span className="text-base font-extrabold font-mono text-white">
                      {formatCurrency(cartItem.totalPrice)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sticky Drawer Footer */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-neutral-950 border-t border-neutral-800 space-y-3.5">
              {/* Subtotal summary */}
              <div className="space-y-1.5 text-xs text-neutral-400">
                <div className="flex justify-between">
                  <span>Itens ({totalItemCount})</span>
                  <span className="font-mono text-neutral-200">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de serviço do totem</span>
                  <span className="font-mono text-emerald-400">Grátis (R$ 0,00)</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-neutral-800">
                  <span>Total do Pedido</span>
                  <span className="font-mono text-emerald-400 text-xl font-extrabold">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                disabled={isCheckingOut || items.length === 0}
                onClick={onCheckout}
                className="w-full min-h-[56px] rounded-2xl bg-red-600 hover:bg-red-500 active:scale-[0.99] text-white font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingOut ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Enviando Pedido...</span>
                  </div>
                ) : (
                  <>
                    <span>Finalizar Pedido</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
