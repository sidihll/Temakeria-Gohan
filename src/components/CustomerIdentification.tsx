import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Phone, ArrowRight, Sparkles, Delete, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { CustomerInfo } from '../types';
import { formatPhone, isValidPhone } from '../utils/formatters';

interface CustomerIdentificationProps {
  onConfirm: (customer: CustomerInfo) => void;
  initialCustomer?: CustomerInfo;
}

export const CustomerIdentification: React.FC<CustomerIdentificationProps> = ({
  onConfirm,
  initialCustomer,
}) => {
  const [name, setName] = useState(initialCustomer?.name || '');
  const [phone, setPhone] = useState(initialCustomer?.phone || '');
  const [activeField, setActiveField] = useState<'name' | 'phone'>('name');
  const [showTouchKeypad, setShowTouchKeypad] = useState(true);

  const phoneIsValid = isValidPhone(phone);
  const nameIsValid = name.trim().length >= 2;
  const canProceed = nameIsValid && phoneIsValid;

  const handlePhoneChange = (raw: string) => {
    setPhone(formatPhone(raw));
  };

  const handleKeyPress = (char: string) => {
    if (activeField === 'phone') {
      if (char === 'BACKSPACE') {
        const digits = phone.replace(/\D/g, '');
        const sliced = digits.slice(0, -1);
        setPhone(formatPhone(sliced));
      } else if (char === 'CLEAR') {
        setPhone('');
      } else if (/[0-9]/.test(char)) {
        const digits = phone.replace(/\D/g, '') + char;
        if (digits.length <= 11) {
          setPhone(formatPhone(digits));
        }
      }
    } else {
      if (char === 'BACKSPACE') {
        setName((prev) => prev.slice(0, -1));
      } else if (char === 'CLEAR') {
        setName('');
      } else if (char === 'SPACE') {
        setName((prev) => prev + ' ');
      } else {
        setName((prev) => prev + char);
      }
    }
  };

  const handleQuickDemo = () => {
    setName('Lucas Mendes');
    setPhone('(11) 98765-4321');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (canProceed) {
      onConfirm({
        name: name.trim(),
        phone: phone.trim(),
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 bg-neutral-950 text-neutral-100 relative overflow-hidden select-none">
      {/* Background Japanese stylized accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner / Totem Header */}
      <header className="w-full max-w-2xl flex flex-col items-center text-center pt-2 sm:pt-4 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-xs font-medium text-neutral-400 mb-3 tracking-wide">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>TOTEM DE AUTOATENDIMENTO TOUCH</span>
          <span className="text-neutral-600">·</span>
          <span className="text-red-400">御飯 GOHAN</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white font-['Outfit']">
          Temakeria <span className="text-red-500">Gohan</span>
        </h1>
        <p className="mt-2 text-sm sm:text-base text-neutral-400 max-w-md">
          Identifique-se para iniciar o seu pedido e acompanhar o preparo no painel.
        </p>
      </header>

      {/* Main Touch Form Box */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl bg-neutral-900/90 border border-neutral-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl z-10 my-4"
      >
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Campo Nome */}
          <div
            onClick={() => setActiveField('name')}
            className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${
              activeField === 'name'
                ? 'border-red-500 bg-neutral-800/80 ring-2 ring-red-500/20'
                : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs uppercase tracking-wider font-semibold text-neutral-400 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-red-400" />
                Seu Nome Completo
              </label>
              {nameIsValid && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Pronto
                </span>
              )}
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setActiveField('name')}
              placeholder="Digite seu nome (ex: Lucas Silva)"
              autoComplete="name"
              className="w-full bg-transparent text-lg sm:text-xl font-semibold text-white placeholder-neutral-600 focus:outline-none"
            />
          </div>

          {/* Campo Telefone com Máscara */}
          <div
            onClick={() => setActiveField('phone')}
            className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${
              activeField === 'phone'
                ? 'border-red-500 bg-neutral-800/80 ring-2 ring-red-500/20'
                : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs uppercase tracking-wider font-semibold text-neutral-400 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-red-400" />
                WhatsApp / Celular com DDD
              </label>
              {phoneIsValid ? (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Válido
                </span>
              ) : (
                <span className="text-[11px] text-neutral-500">Mínimo 10 dígitos</span>
              )}
            </div>
            <div className="flex items-center">
              <span className="text-neutral-500 font-mono mr-2 text-base sm:text-lg">🇧🇷</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onFocus={() => setActiveField('phone')}
                placeholder="(11) 99999-9999"
                className="w-full bg-transparent text-lg sm:text-xl font-mono font-bold tracking-wider text-white placeholder-neutral-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Touch-Friendly On-Screen Keypad for Totem */}
          {showTouchKeypad && (
            <div className="pt-2 border-t border-neutral-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-neutral-400">
                  {activeField === 'phone' ? 'Teclado Numérico Touch (WhatsApp)' : 'Teclado Touch (Nome)'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleQuickDemo}
                    className="text-xs px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition flex items-center gap-1 active:scale-95"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" /> Preenchimento Rápido
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTouchKeypad(!showTouchKeypad)}
                    className="text-xs text-neutral-500 hover:text-neutral-300"
                  >
                    Ocultar
                  </button>
                </div>
              </div>

              {activeField === 'phone' ? (
                /* Numeric Keypad for Phone */
                <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => handleKeyPress(digit)}
                      className="h-12 sm:h-14 bg-neutral-800/90 hover:bg-neutral-700 text-white font-bold text-xl rounded-xl border border-neutral-700/60 active:scale-95 transition-all flex items-center justify-center shadow"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleKeyPress('CLEAR')}
                    className="h-12 sm:h-14 bg-neutral-800/60 hover:bg-neutral-700/60 text-neutral-400 font-semibold text-xs rounded-xl border border-neutral-800 active:scale-95 transition flex items-center justify-center"
                  >
                    Limpar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeyPress('0')}
                    className="h-12 sm:h-14 bg-neutral-800/90 hover:bg-neutral-700 text-white font-bold text-xl rounded-xl border border-neutral-700/60 active:scale-95 transition flex items-center justify-center shadow"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeyPress('BACKSPACE')}
                    className="h-12 sm:h-14 bg-red-950/40 hover:bg-red-900/50 text-red-300 font-semibold rounded-xl border border-red-900/40 active:scale-95 transition flex items-center justify-center"
                  >
                    <Delete className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                /* Alphabet Touch Row for Name */
                <div className="space-y-1.5 max-w-lg mx-auto">
                  <div className="flex justify-center gap-1">
                    {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => handleKeyPress(k)}
                        className="flex-1 h-10 sm:h-11 bg-neutral-800/90 hover:bg-neutral-700 text-white font-semibold text-sm rounded-lg border border-neutral-700/50 active:scale-95 transition"
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-center gap-1 px-2">
                    {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => handleKeyPress(k)}
                        className="flex-1 h-10 sm:h-11 bg-neutral-800/90 hover:bg-neutral-700 text-white font-semibold text-sm rounded-lg border border-neutral-700/50 active:scale-95 transition"
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-center gap-1">
                    {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => handleKeyPress(k)}
                        className="flex-1 h-10 sm:h-11 bg-neutral-800/90 hover:bg-neutral-700 text-white font-semibold text-sm rounded-lg border border-neutral-700/50 active:scale-95 transition"
                      >
                        {k}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleKeyPress('BACKSPACE')}
                      className="px-3 h-10 sm:h-11 bg-red-950/40 hover:bg-red-900/50 text-red-300 rounded-lg border border-red-900/40 flex items-center justify-center active:scale-95"
                    >
                      <Delete className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleKeyPress('SPACE')}
                      className="w-1/2 h-10 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-xs rounded-lg border border-neutral-700/50 active:scale-95"
                    >
                      ESPAÇO
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveField('phone')}
                      className="w-1/2 h-10 bg-neutral-700/80 hover:bg-neutral-600 text-neutral-100 font-medium text-xs rounded-lg border border-neutral-600 flex items-center justify-center gap-1 active:scale-95"
                    >
                      Ir para Telefone <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Primary Action Button (Touch-Friendly Large Hit Target >= 56px) */}
          <button
            type="submit"
            disabled={!canProceed}
            className={`w-full h-14 sm:h-16 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-xl ${
              canProceed
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 active:scale-[0.99] cursor-pointer'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
            }`}
          >
            <span>Avançar para o Cardápio</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </motion.div>

      {/* Totem Footer Trust Note */}
      <footer className="w-full max-w-2xl text-center py-2 z-10">
        <p className="text-xs text-neutral-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
          Seus dados são utilizados exclusivamente para identificar seu pedido no balcão de retirada.
        </p>
      </footer>
    </div>
  );
};
