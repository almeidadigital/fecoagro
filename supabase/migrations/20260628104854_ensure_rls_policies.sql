-- Ensure RLS policies are enabled and correct for bancos, notas_fiscais, razao, and transactions
-- Allows authenticated users to perform ALL operations (SELECT, INSERT, UPDATE, DELETE) for their own user_id

-- =============================================
-- Table: bancos
-- =============================================
ALTER TABLE public.bancos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bancos_select" ON public.bancos;
CREATE POLICY "bancos_select" ON public.bancos
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "bancos_insert" ON public.bancos;
CREATE POLICY "bancos_insert" ON public.bancos
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bancos_update" ON public.bancos;
CREATE POLICY "bancos_update" ON public.bancos
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bancos_delete" ON public.bancos;
CREATE POLICY "bancos_delete" ON public.bancos
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =============================================
-- Table: notas_fiscais
-- =============================================
ALTER TABLE public.notas_fiscais ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notas_fiscais_select" ON public.notas_fiscais;
CREATE POLICY "notas_fiscais_select" ON public.notas_fiscais
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notas_fiscais_insert" ON public.notas_fiscais;
CREATE POLICY "notas_fiscais_insert" ON public.notas_fiscais
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notas_fiscais_update" ON public.notas_fiscais;
CREATE POLICY "notas_fiscais_update" ON public.notas_fiscais
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notas_fiscais_delete" ON public.notas_fiscais;
CREATE POLICY "notas_fiscais_delete" ON public.notas_fiscais
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =============================================
-- Table: razao
-- =============================================
ALTER TABLE public.razao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "razao_select" ON public.razao;
CREATE POLICY "razao_select" ON public.razao
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "razao_insert" ON public.razao;
CREATE POLICY "razao_insert" ON public.razao
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "razao_update" ON public.razao;
CREATE POLICY "razao_update" ON public.razao
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "razao_delete" ON public.razao;
CREATE POLICY "razao_delete" ON public.razao
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =============================================
-- Table: transactions (reinforce user-level policies alongside existing admin/collaborator policies)
-- =============================================
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
CREATE POLICY "Users can insert their own transactions" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
