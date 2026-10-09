-- ==============================================================================
-- TEMAKERIA GOHAN - SCHEMA E POLÍTICAS DE SEGURANÇA (SUPABASE / POSTGRESQL)
-- Tabela: pedidos_totem
-- ==============================================================================

-- 1. Criação da extensão para geração de UUIDs (se não existir)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Criação da tabela pedidos_totem
CREATE TABLE IF NOT EXISTS public.pedidos_totem (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_pedido VARCHAR(20) NOT NULL UNIQUE,
    cliente_nome TEXT NOT NULL,
    cliente_telefone VARCHAR(20) NOT NULL,
    itens JSONB NOT NULL DEFAULT '[]'::jsonb,
    valor_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    observacoes TEXT DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'recebido' CHECK (status IN ('recebido', 'em_preparo', 'pronto', 'entregue', 'cancelado')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Índices de performance para busca rápida no balcão e relatórios
CREATE INDEX IF NOT EXISTS idx_pedidos_totem_codigo ON public.pedidos_totem (codigo_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_totem_status ON public.pedidos_totem (status);
CREATE INDEX IF NOT EXISTS idx_pedidos_totem_criado_em ON public.pedidos_totem (criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_totem_telefone ON public.pedidos_totem (cliente_telefone);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE public.pedidos_totem ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS DE ACESSO (RLS):

-- Política A: Permite que o Totem de Autoatendimento (chave pública/anon) insira novos pedidos
DROP POLICY IF EXISTS "Totem pode inserir novos pedidos" ON public.pedidos_totem;
CREATE POLICY "Totem pode inserir novos pedidos"
ON public.pedidos_totem
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Política B: Permite consulta dos pedidos (pelo totem, cliente ou painel da cozinha)
DROP POLICY IF EXISTS "Permitir consulta de pedidos" ON public.pedidos_totem;
CREATE POLICY "Permitir consulta de pedidos"
ON public.pedidos_totem
FOR SELECT
TO anon, authenticated
USING (true);

-- Política C: Permite atualização de status apenas para usuários autenticados (cozinha / gerência)
DROP POLICY IF EXISTS "Equipe autenticada pode atualizar pedidos" ON public.pedidos_totem;
CREATE POLICY "Equipe autenticada pode atualizar pedidos"
ON public.pedidos_totem
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Trigger para atualizar automaticamente 'atualizado_em'
CREATE OR REPLACE FUNCTION public.handle_pedidos_totem_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_pedidos_totem ON public.pedidos_totem;
CREATE TRIGGER trigger_atualizar_pedidos_totem
    BEFORE UPDATE ON public.pedidos_totem
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_pedidos_totem_atualizado_em();

-- 7. (Opcional) Habilitar Realtime do Supabase para a tela da cozinha
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos_totem;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
