-- AI Reconciliation Schema
-- Add AI columns to extratos_bancarios and critica
-- Create reconciliation_patterns table with RLS

-- Add AI columns to extratos_bancarios
ALTER TABLE public.extratos_bancarios
  ADD COLUMN IF NOT EXISTS ai_confidence NUMERIC;
ALTER TABLE public.extratos_bancarios
  ADD COLUMN IF NOT EXISTS ai_reasoning TEXT;
ALTER TABLE public.extratos_bancarios
  ADD COLUMN IF NOT EXISTS ai_reconciliation_id UUID;
ALTER TABLE public.extratos_bancarios
  ADD COLUMN IF NOT EXISTS ai_processed_at TIMESTAMPTZ;

-- Add AI columns to critica
ALTER TABLE public.critica
  ADD COLUMN IF NOT EXISTS ai_confidence NUMERIC;
ALTER TABLE public.critica
  ADD COLUMN IF NOT EXISTS ai_reasoning TEXT;
ALTER TABLE public.critica
  ADD COLUMN IF NOT EXISTS ai_reconciliation_id UUID;
ALTER TABLE public.critica
  ADD COLUMN IF NOT EXISTS ai_processed_at TIMESTAMPTZ;

-- Create reconciliation_patterns table
CREATE TABLE IF NOT EXISTS public.reconciliation_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description_pattern TEXT NOT NULL,
  target_plano_conta_id BIGINT REFERENCES public.plano_contas(id) ON DELETE SET NULL,
  target_centro_custo_id BIGINT REFERENCES public.centro_custos(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reconciliation_patterns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reconciliation_patterns_select" ON public.reconciliation_patterns;
CREATE POLICY "reconciliation_patterns_select" ON public.reconciliation_patterns
  FOR SELECT TO authenticated USING (public.is_admin() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "reconciliation_patterns_insert" ON public.reconciliation_patterns;
CREATE POLICY "reconciliation_patterns_insert" ON public.reconciliation_patterns
  FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "reconciliation_patterns_update" ON public.reconciliation_patterns;
CREATE POLICY "reconciliation_patterns_update" ON public.reconciliation_patterns
  FOR UPDATE TO authenticated USING (public.is_admin() OR auth.uid() = user_id) WITH CHECK (public.is_admin() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "reconciliation_patterns_delete" ON public.reconciliation_patterns;
CREATE POLICY "reconciliation_patterns_delete" ON public.reconciliation_patterns
  FOR DELETE TO authenticated USING (public.is_admin() OR auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS reconciliation_patterns_user_id_idx ON public.reconciliation_patterns(user_id);

-- Ensure contabilidade user has admin role (same as andre@almeida.com.br)
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'contabilidade@fecoagro.coop.br';
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.users (id, full_name, role)
    VALUES (v_user_id, 'Contabilidade', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Contabilidade';
  END IF;
END $$;
