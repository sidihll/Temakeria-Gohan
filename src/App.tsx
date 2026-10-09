import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Search, Sparkles, Filter, ChevronRight } from 'lucide-react';
import {
  CategoryId,
  MenuItem,
  CartItem,
  CustomerInfo,
  CustomizationOption,
  OrderPayload,
} from './types';
import { MENU_ITEMS } from './data/menu';
import { salvarPedidoTotem, gerarCodigoPedido } from './lib/supabase';
import { formatCurrency } from './utils/formatters';

import { CustomerIdentification } from './components/CustomerIdentification';
import { TouchHeader } from './components/TouchHeader';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import { CustomizationModal } from './components/CustomizationModal';
import { CartDrawer } from './components/CartDrawer';
import { SuccessScreen } from './components/SuccessScreen';

export default function App() {
  // Screen state: 'identify' | 'menu' | 'success'
  const [currentScreen, setCurrentScreen] = useState<'identify' | 'menu' | 'success'>('identify');
  
  // Customer info
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);

  // Menu filters
  const [activeCategory, setActiveCategory] = useState<CategoryId>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Customization modal
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Completed order
  const [lastOrderCode, setLastOrderCode] = useState<string>('');
  const [lastOrderPayload, setLastOrderPayload] = useState<OrderPayload | null>(null);

  // Category counts
  const itemCounts = useMemo(() => {
    const counts: Record<CategoryId, number> = {
      todos: MENU_ITEMS.length,
      temakis: 0,
      entradas: 0,
      bebidas: 0,
      sobremesas: 0,
    };
    MENU_ITEMS.forEach((it) => {
      if (counts[it.category] !== undefined) {
        counts[it.category]++;
      }
    });
    return counts;
  }, []);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchCategory = activeCategory === 'todos' || item.category === activeCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  // Cart totals
  const cartTotal = useMemo(() => {
    return cartItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
  }, [cartItems]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [cartItems]);

  // Handlers
  const handleCustomerIdentified = (info: CustomerInfo) => {
    setCustomer(info);
    setCurrentScreen('menu');
  };

  const handleSelectItem = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setIsCustomizerOpen(true);
  };

  const handleConfirmCustomization = (
    item: MenuItem,
    quantity: number,
    removals: string[],
    additions: CustomizationOption[],
    observation: string
  ) => {
    const additionsPrice = additions.reduce((acc, curr) => acc + curr.price, 0);
    const unitPrice = item.price + additionsPrice;
    const totalPrice = unitPrice * quantity;

    const newItem: CartItem = {
      cartId: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      item,
      quantity,
      removals,
      additions,
      observation,
      unitPrice,
      totalPrice,
    };

    setCartItems((prev) => [...prev, newItem]);
    // Give smooth touch feedback
  };

  const handleUpdateQuantity = (cartId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((it) => {
          if (it.cartId === cartId) {
            const nextQty = it.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...it,
              quantity: nextQty,
              totalPrice: it.unitPrice * nextQty,
            };
          }
          return it;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (cartId: string) => {
    setCartItems((prev) => prev.filter((it) => it.cartId !== cartId));
  };

  /**
   * Finalizar Pedido:
   * 1. Gerar código TKG-XXXX.
   * 2. Salvar na tabela 'pedidos_totem' do Supabase.
   * 3. Enviar requisição assíncrona.
   * 4. Exibir a tela de sucesso e limpar o carrinho.
   */
  const handleCheckout = async () => {
    if (!customer || cartItems.length === 0) return;

    setIsCheckingOut(true);

    const codigo = gerarCodigoPedido();
    const payload: OrderPayload = {
      codigo_pedido: codigo,
      cliente_nome: customer.name,
      cliente_telefone: customer.phone,
      itens: cartItems.map((cartItem) => ({
        nome: cartItem.item.name,
        quantidade: cartItem.quantity,
        adicionais: cartItem.additions.map((a) => a.name),
        remocoes: cartItem.removals,
        valor_unitario: Number(cartItem.unitPrice.toFixed(2)),
        valor_total: Number(cartItem.totalPrice.toFixed(2)),
        observacao: cartItem.observation,
      })),
      valor_total: Number(cartTotal.toFixed(2)),
      observacoes: cartItems
        .filter((it) => it.observation)
        .map((it) => `${it.item.name}: ${it.observation}`)
        .join(' | '),
      criado_em: new Date().toISOString(),
    };

    try {
      await salvarPedidoTotem(payload);
    } catch (err) {
      console.warn('[Totem Gohan] Checkout silent catch:', err);
    } finally {
      setIsCheckingOut(false);
      setIsCartOpen(false);
      setLastOrderCode(codigo);
      setLastOrderPayload(payload);
      setCartItems([]);
      setCurrentScreen('success');
    }
  };

  const handleResetFlow = () => {
    setCartItems([]);
    setCustomer(null);
    setLastOrderCode('');
    setLastOrderPayload(null);
    setCurrentScreen('identify');
  };

  // 1. TELA DE IDENTIFICAÇÃO INICIAL
  if (currentScreen === 'identify') {
    return (
      <CustomerIdentification
        onConfirm={handleCustomerIdentified}
        initialCustomer={customer || undefined}
      />
    );
  }

  // 5. TELA DE SUCESSO
  if (currentScreen === 'success') {
    return (
      <SuccessScreen
        orderCode={lastOrderCode}
        order={lastOrderPayload}
        customer={customer}
        onReset={handleResetFlow}
      />
    );
  }

  // 2. TELA PRINCIPAL DO CARDÁPIO TOUCH
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col select-none">
      {/* Header com Top Bar Contract */}
      <TouchHeader
        customer={customer}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onResetCustomer={() => setCurrentScreen('identify')}
      />

      {/* Navegação de Categorias Touch */}
      <CategoryNav
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        itemCounts={itemCounts}
      />

      {/* Subheader com busca rápida e filtro visual */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Outfit']">
            {activeCategory === 'todos'
              ? 'Todos os Pratos'
              : activeCategory === 'temakis'
              ? 'Temakis Especiais'
              : activeCategory === 'entradas'
              ? 'Entradas e Acompanhamentos'
              : activeCategory === 'bebidas'
              ? 'Bebidas Geladas'
              : 'Sobremesas'}
          </h2>
          <span className="text-xs text-neutral-500 font-mono">
            ({filteredItems.length} {filteredItems.length === 1 ? 'item' : 'opções'})
          </span>
        </div>

        {/* Quick Touch Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar salmão, spicy, chá..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Main Grid de Produtos */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-28">
        {filteredItems.length === 0 ? (
          <div className="w-full py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-600 mb-3">
              <Search className="w-8 h-8" />
            </div>
            <p className="text-lg font-bold text-neutral-300">Nenhum item encontrado</p>
            <p className="text-xs text-neutral-500 mt-1">
              Tente selecionar outra categoria ou limpar a busca.
            </p>
            <button
              onClick={() => {
                setActiveCategory('todos');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold rounded-lg text-white"
            >
              Ver Cardápio Completo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredItems.map((item) => {
              const inCartCount = cartItems
                .filter((ci) => ci.item.id === item.id)
                .reduce((acc, curr) => acc + curr.quantity, 0);

              return (
                <ProductCard
                  key={item.id}
                  item={item}
                  onSelect={handleSelectItem}
                  quantityInCart={inCartCount}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Bar (Sticky Touch Bar for Quick Checkout on Mobile/Tablet Kiosks) */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-neutral-950/90 backdrop-blur-md border-t border-neutral-800/80 z-30 flex items-center justify-center">
          <div className="w-full max-w-3xl flex items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 p-2 sm:p-3 rounded-2xl shadow-2xl">
            <div className="flex items-center gap-3 pl-2">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
                {cartCount}
              </div>
              <div>
                <span className="text-xs text-neutral-400 block">Subtotal</span>
                <span className="font-mono text-lg font-extrabold text-white">
                  {formatCurrency(cartTotal)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="min-h-[48px] px-6 py-2.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-extrabold text-sm sm:text-base rounded-xl flex items-center gap-2 shadow-lg shadow-red-600/25 transition cursor-pointer"
            >
              <span>Ver Carrinho</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de Customização de Temakis */}
      <CustomizationModal
        item={selectedMenuItem}
        isOpen={isCustomizerOpen}
        onClose={() => {
          setIsCustomizerOpen(false);
          setSelectedMenuItem(null);
        }}
        onConfirm={handleConfirmCustomization}
      />

      {/* Drawer Lateral do Carrinho */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        customer={customer}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
        isCheckingOut={isCheckingOut}
      />
    </div>
  );
}
