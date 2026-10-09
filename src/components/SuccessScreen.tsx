import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { CheckCircle2, RotateCcw, Clock, Utensils, ReceiptText, ChefHat, Sparkles } from 'lucide-react';
import { CustomerInfo, OrderPayload } from '../types';
import { formatCurrency } from '../utils/formatters';

interface SuccessScreenProps {
  orderCode: string;
  order: OrderPayload | null;
  customer: CustomerInfo | null;
  onReset: () => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  orderCode,
  order,
  customer,
  onReset,
}) => {
  const [countdown, setCountdown] = useState(25);

  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#84cc16', '#ffffff', '#f59e0b'],
      });
    } catch {
      // Ignore if canvas is unavailable
    }

    // Auto-reset timer for the totem
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onReset();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onReset]);

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 relative overflow-hidden select-none">
      {/* Background Japanese aesthetic accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Brand */}
      <header className="w-full max-w-xl text-center pt-2 sm:pt-4 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-xs font-semibold text-neutral-400 mb-2">
          <ChefHat className="w-3.5 h-3.5 text-red-500" />
          <span>COZINHA NOTIFICADA</span>
          <span className="text-neutral-600">·</span>
          <span className="text-emerald-400">PEDIDO CONFIRMADO</span>
        </div>
      </header>

      {/* Central Confirmation Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xl bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl z-10 my-4 text-center"
      >
        {/* Animated Check Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Highlighted Order Code (TKG-XXXX) */}
        <div className="mb-4">
          <span className="text-xs uppercase font-extrabold tracking-widest text-neutral-400 block mb-1">
            CÓDIGO DE RETIRADA NO PAINEL
          </span>
          <div className="inline-block bg-neutral-950 border-2 border-red-500/60 rounded-2xl px-6 sm:px-8 py-3.5 shadow-xl">
            <span className="text-4xl sm:text-5xl md:text-6xl font-black font-mono tracking-wider text-red-500">
              {orderCode}
            </span>
          </div>
        </div>

        {/* Mandated Message: "Seu temaki já está sendo preparado, obrigado por escolher Temakeria Gohan!" */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Outfit'] mb-2">
          Seu temaki já está sendo preparado, obrigado por escolher Temakeria Gohan!
        </h2>

        <p className="text-sm text-neutral-400 max-w-md mx-auto mb-6">
          Acompanhe seu código <strong className="text-white font-mono">{orderCode}</strong> na tela de chamadas do balcão. Você também receberá uma notificação no WhatsApp cadastrado.
        </p>

        {/* Order Details Mini Receipt */}
        {order && (
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 text-left mb-6 space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-800 pb-2">
              <span className="flex items-center gap-1.5 font-medium text-neutral-300">
                <ReceiptText className="w-3.5 h-3.5 text-red-400" />
                Resumo do Pedido
              </span>
              <span className="font-mono text-neutral-400">
                Cliente: <strong className="text-white">{order.cliente_nome}</strong>
              </span>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
              {order.itens.map((it, idx) => (
                <div key={idx} className="flex items-start justify-between text-xs text-neutral-300">
                  <div className="pr-2">
                    <span className="font-bold text-white">
                      {it.quantidade}x {it.nome}
                    </span>
                    {(it.remocoes.length > 0 || it.adicionais.length > 0) && (
                      <p className="text-[11px] text-neutral-500">
                        {it.remocoes.join(', ')} {it.adicionais.length > 0 ? `· ${it.adicionais.join(', ')}` : ''}
                      </p>
                    )}
                  </div>
                  <span className="font-mono text-neutral-300 shrink-0">
                    {formatCurrency(it.valor_total)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-sm font-extrabold">
              <span className="text-neutral-400">Total Pago</span>
              <span className="font-mono text-emerald-400 text-base">
                {formatCurrency(order.valor_total)}
              </span>
            </div>
          </div>
        )}

        {/* Estimated Time Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 bg-neutral-950/50 py-2 px-4 rounded-xl border border-neutral-800/80 mb-6">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Tempo estimado de preparo: <strong>10 a 14 minutos</strong></span>
        </div>

        {/* Primary Action Button: Reiniciar o fluxo */}
        <button
          onClick={onReset}
          className="w-full min-h-[56px] rounded-2xl bg-neutral-100 hover:bg-white text-neutral-950 font-extrabold text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-xl active:scale-[0.98] transition cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 text-neutral-950" />
          <span>Iniciar Novo Pedido ({countdown}s)</span>
        </button>
      </motion.div>

      {/* Footer */}
      <footer className="w-full max-w-xl text-center pb-2 z-10 text-xs text-neutral-500">
        Temakeria Gohan · Totem de Autoatendimento Touch
      </footer>
    </div>
  );
};
