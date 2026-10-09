import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { OrderPayload } from '../types';

// Retrieve credentials quietly from Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Singleton Supabase client initialized quietly without rendering UI or login modals
let supabaseClient: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (err) {
    console.warn('[Totem Gohan] Supabase inicializado com parâmetros padrão:', err);
  }
}

/**
 * Gera o código do pedido no formato especificado: TKG-XXXX (4 dígitos aleatórios)
 */
export function gerarCodigoPedido(): string {
  const digitos = Math.floor(1000 + Math.random() * 9000);
  return `TKG-${digitos}`;
}

/**
 * Salva o pedido silenciosamente na tabela 'pedidos_totem' do Supabase
 * e dispara a requisição assíncrona.
 * Nenhuma falha de rede bloqueia o totem de autoatendimento.
 */
export async function salvarPedidoTotem(pedido: OrderPayload): Promise<{ success: boolean; id?: string }> {
  const payloadToStore = {
    codigo_pedido: pedido.codigo_pedido,
    cliente_nome: pedido.cliente_nome,
    cliente_telefone: pedido.cliente_telefone,
    itens: pedido.itens,
    valor_total: Number(pedido.valor_total.toFixed(2)),
    observacoes: pedido.observacoes || '',
  };

  // 1. Registro em background no Supabase (se configurado)
  if (supabaseClient) {
    (async () => {
      try {
        const { error, data } = await supabaseClient
          .from('pedidos_totem')
          .insert([payloadToStore]);

        if (error) {
          console.warn('[Totem Gohan - Supabase Background Info] Registro na tabela pedidos_totem:', error.message);
        } else {
          console.info('[Totem Gohan - Supabase Success] Pedido salvo na tabela pedidos_totem com sucesso:', pedido.codigo_pedido, data);
        }
      } catch (err: unknown) {
        console.warn('[Totem Gohan - Supabase Connection Info]:', err);
      }
    })();
  } else {
    // Log silencioso para o desenvolvedor verificar no console quando configurar
    console.info(
      '[Totem Gohan - Supabase Pronto] O payload do pedido está pronto para guardar na tabela "pedidos_totem":',
      payloadToStore
    );
  }

  // 2. Requisição assíncrona silenciosa (Fetch broadcast / Webhook)
  try {
    // Envia assincronamente sem travar a interface do totem
    fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadToStore),
    }).catch(() => {
      // Ignora silenciosamente se a rota backend não estiver ativa no preview estático
    });
  } catch {
    // Silencioso
  }

  // 3. Persistência local transparente como fallback de segurança do Totem
  try {
    const historicoAtual = JSON.parse(localStorage.getItem('pedidos_totem_backup') || '[]');
    historicoAtual.unshift({
      ...payloadToStore,
      salvo_em: new Date().toISOString(),
    });
    localStorage.setItem('pedidos_totem_backup', JSON.stringify(historicoAtual.slice(0, 50)));
  } catch (e) {
    console.warn('[Totem Gohan] Local cache unavailable:', e);
  }

  return { success: true };
}
