-- Update RLS policies for all financial tables to allow admin access
-- Admins (role = 'admin') can access ALL records across the platform
-- Regular users can only access their own records (user_id = auth.uid())

-- Ensure is_admin() function is up to date and secure
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- =============================================
-- Table: atividades
-- =============================================
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "atividades_select" ON public.atividades;
DROP POLICY IF EXISTS "atividades_insert" ON public.atividades;
DROP POLICY IF EXISTS "atividades_update" ON public.atividades;
DROP POLICY IF EXISTS "atividades_delete" ON public.atividades;

CREATE POLICY "atividades_select" ON public.atividades
  FOR SELECT TO authenticated USING (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "atividades_insert" ON public.atividades
  FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "atividades_update" ON public.atividades
  FOR UPDATE TO authenticated USING (public.is_admin() OR auth.uid() = user_id) WITH CHECK (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "atividades_delete" ON public.atividades
  FOR DELETE TO authenticated USING (public.is_admin() OR auth.uid() = user_id);

-- =============================================
-- Table: bancos
-- =============================================
ALTER TABLE public.bancos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bancos_select" ON public.bancos;
DROP POLICY IF EXISTS "bancos_insert" ON public.bancos;
DROP POLICY IF EXISTS "bancos_update" ON public.bancos;
DROP POLICY IF EXISTS "bancos_delete" ON public.bancos;

CREATE POLICY "bancos_select" ON public.bancos
  FOR SELECT TO authenticated USING (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "bancos_insert" ON public.bancos
  FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "bancos_update" ON public.bancos
  FOR UPDATE TO authenticated USING (public.is_admin() OR auth.uid() = user_id) WITH CHECK (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "bancos_delete" ON public.bancos
  FOR DELETE TO authenticated USING (public.is_admin() OR auth.uid() = user_id);

-- =============================================
-- Table: centro_custos
-- =============================================
ALTER TABLE public.centro_custos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "centro_custos_select" ON public.centro_custos;
DROP POLICY IF EXISTS "centro_custos_insert" ON public.centro_custos;
DROP POLICY IF EXISTS "centro_custos_update" ON public.centro_custos;
DROP POLICY IF EXISTS "centro_custos_delete" ON public.centro_custos;

CREATE POLICY "centro_custos_select" ON public.centro_custos
  FOR SELECT TO authenticated USING (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "centro_custos_insert" ON public.centro_custos
  FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "centro_custos_update" ON public.centro_custos
  FOR UPDATE TO authenticated USING (public.is_admin() OR auth.uid() = user_id) WITH CHECK (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "centro_custos_delete" ON public.centro_custos
  FOR DELETE TO authenticated USING (public.is_admin() OR auth.uid() = user_id);

-- =============================================
-- Table: critica
-- =============================================
ALTER TABLE public.critica ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies (including legacy names from transactions table)
DROP POLICY IF EXISTS "Admins and users can insert transactions" ON public.critica;
DROP POLICY IF EXISTS "Admins can delete all transactions" ON public.critica;
DROP POLICY IF EXISTS "Admins can update all transactions" ON public.critica;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.critica;
DROP POLICY IF EXISTS "Collaborators can view latest transaction" ON public.critica;
DROP POLICY IF EXISTS "Standard users can view own transactions" ON public.critica;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.critica;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.critica;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.critica;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.critica;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.critica;
DROP POLICY IF EXISTS "critica_select" ON public.critica;
DROP POLICY IF EXISTS "critica_insert" ON public.critica;
DROP POLICY IF EXISTS "critica_update" ON public.critica;
DROP POLICY IF EXISTS "critica_delete" ON public.critica;

CREATE POLICY "critica_select" ON public.critica
  FOR SELECT TO authenticated USING (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "critica_insert" ON public.critica
  FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "critica_update" ON public.critica
  FOR UPDATE TO authenticated USING (public.is_admin() OR auth.uid() = user_id) WITH CHECK (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "critica_delete" ON public.critica
  FOR DELETE TO authenticated USING (public.is_admin() OR auth.uid() = user_id);

-- =============================================
-- Table: extratos_bancarios
-- =============================================
ALTER TABLE public.extratos_bancarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "extratos_select" ON public.extratos_bancarios;
DROP POLICY IF EXISTS "extratos_insert" ON public.extratos_bancarios;
DROP POLICY IF EXISTS "extratos_update" ON public.extratos_bancarios;
DROP POLICY IF EXISTS "extratos_delete" ON public.extratos_bancarios;
DROP POLICY IF EXISTS "extratos_bancarios_select" ON public.extratos_bancarios;
DROP POLICY IF EXISTS "extratos_bancarios_insert" ON public.extratos_bancarios;
DROP POLICY IF EXISTS "extratos_bancarios_update" ON public.extratos_bancarios;
DROP POLICY IF EXISTS "extratos_bancarios_delete" ON public.extratos_bancarios;

CREATE POLICY "extratos_bancarios_select" ON public.extratos_bancarios
  FOR SELECT TO authenticated USING (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "extratos_bancarios_insert" ON public.extratos_bancarios
  FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "extratos_bancarios_update" ON public.extratos_bancarios
  FOR UPDATE TO authenticated USING (public.is_admin() OR auth.uid() = user_id) WITH CHECK (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "extratos_bancarios_delete" ON public.extratos_bancarios
  FOR DELETE TO authenticated USING (public.is_admin() OR auth.uid() = user_id);

-- =============================================
-- Table: filiais
-- =============================================
ALTER TABLE public.filiais ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "filiais_select" ON public.filiais;
DROP POLICY IF EXISTS "filiais_insert" ON public.filiais;
DROP POLICY IF EXISTS "filiais_update" ON public.filiais;
DROP POLICY IF EXISTS "filiais_delete" ON public.filiais;

CREATE POLICY "filiais_select" ON public.filiais
  FOR SELECT TO authenticated USING (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "filiais_insert" ON public.filiais
  FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "filiais_update" ON public.filiais
  FOR UPDATE TO authenticated USING (public.is_admin() OR auth.uid() = user_id) WITH CHECK (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "filiais_delete" ON public.filiais
  FOR DELETE TO authenticated USING (public.is_admin() OR auth.uid() = user_id);

-- =============================================
-- Table: notas_fiscais
-- =============================================
ALTER TABLE public.notas_fiscais ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notas_fiscais_select" ON public.notas_fiscais;
DROP POLICY IF EXISTS "notas_fiscais_insert" ON public.notas_fiscais;
DROP POLICY IF EXISTS "notas_fiscais_update" ON public.notas_fiscais;
DROP POLICY IF EXISTS "notas_fiscais_delete" ON public.notas_fiscais;

CREATE POLICY "notas_fiscais_select" ON public.notas_fiscais
  FOR SELECT TO authenticated USING (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "notas_fiscais_insert" ON public.notas_fiscais
  FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "notas_fiscais_update" ON public.notas_fiscais
  FOR UPDATE TO authenticated USING (public.is_admin() OR auth.uid() = user_id) WITH CHECK (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "notas_fiscais_delete" ON public.notas_fiscais
  FOR DELETE TO authenticated USING (public.is_admin() OR auth.uid() = user_id);

-- =============================================
-- Table: plano_contas
-- =============================================
ALTER TABLE public.plano_contas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "plano_contas_select" ON public.plano_contas;
DROP POLICY IF EXISTS "plano_contas_insert" ON public.plano_contas;
DROP POLICY IF EXISTS "plano_contas_update" ON public.plano_contas;
DROP POLICY IF EXISTS "plano_contas_delete" ON public.plano_contas;

CREATE POLICY "plano_contas_select" ON public.plano_contas
  FOR SELECT TO authenticated USING (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "plano_contas_insert" ON public.plano_contas
  FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "plano_contas_update" ON public.plano_contas
  FOR UPDATE TO authenticated USING (public.is_admin() OR auth.uid() = user_id) WITH CHECK (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "plano_contas_delete" ON public.plano_contas
  FOR DELETE TO authenticated USING (public.is_admin() OR auth.uid() = user_id);

-- =============================================
-- Table: razao
-- =============================================
ALTER TABLE public.razao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "razao_select" ON public.razao;
DROP POLICY IF EXISTS "razao_insert" ON public.razao;
DROP POLICY IF EXISTS "razao_update" ON public.razao;
DROP POLICY IF EXISTS "razao_delete" ON public.razao;

CREATE POLICY "razao_select" ON public.razao
  FOR SELECT TO authenticated USING (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "razao_insert" ON public.razao
  FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "razao_update" ON public.razao
  FOR UPDATE TO authenticated USING (public.is_admin() OR auth.uid() = user_id) WITH CHECK (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "razao_delete" ON public.razao
  FOR DELETE TO authenticated USING (public.is_admin() OR auth.uid() = user_id);

-- =============================================
-- Update get_dashboard_kpi to SECURITY DEFINER so it bypasses RLS
-- This ensures the function returns global data for admins and
-- respects user-level filtering for non-admins via explicit user_id checks
-- =============================================
CREATE OR REPLACE FUNCTION public.get_dashboard_kpi(p_date_now DATE)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_user_id UUID;
  v_total_criticas INTEGER;
  v_pending_criticas INTEGER;
  v_unreconciled_criticas INTEGER;
  v_completed_criticas INTEGER;
  v_razao_balance NUMERIC;
  v_bank_balance NUMERIC;
  v_total_criticas_amount NUMERIC;
  v_monthly_movement NUMERIC;
  v_supplier_volumes JSON;
BEGIN
  v_is_admin := public.is_admin();
  v_user_id := auth.uid();

  IF v_is_admin THEN
    -- Admin: aggregate ALL data across all users
    SELECT COUNT(*) INTO v_total_criticas FROM public.critica;
    SELECT COUNT(*) INTO v_pending_criticas FROM public.critica WHERE status = 'pendente';
    SELECT COUNT(*) INTO v_unreconciled_criticas FROM public.critica WHERE reconciled = false;
    SELECT COUNT(*) INTO v_completed_criticas FROM public.critica WHERE status = 'concluido';
    SELECT COALESCE(SUM(amount), 0) INTO v_total_criticas_amount FROM public.critica;
    SELECT COALESCE(SUM(amount), 0) INTO v_monthly_movement FROM public.critica
      WHERE date >= date_trunc('month', p_date_now) AND date <= p_date_now;
    SELECT COALESCE(SUM(credito - debito), 0) INTO v_razao_balance FROM public.razao;
    SELECT COALESCE(SUM(saldo_atual), 0) INTO v_bank_balance FROM public.bancos;

    SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO v_supplier_volumes
    FROM (
      SELECT
        fornecedor,
        SUM(valor_total) AS total,
        COUNT(*) AS nota_count
      FROM public.notas_fiscais
      WHERE data_emissao <= p_date_now
      GROUP BY fornecedor
      ORDER BY SUM(valor_total) DESC
    ) t;
  ELSE
    -- Non-admin: only own data
    SELECT COUNT(*) INTO v_total_criticas FROM public.critica WHERE user_id = v_user_id;
    SELECT COUNT(*) INTO v_pending_criticas FROM public.critica WHERE status = 'pendente' AND user_id = v_user_id;
    SELECT COUNT(*) INTO v_unreconciled_criticas FROM public.critica WHERE reconciled = false AND user_id = v_user_id;
    SELECT COUNT(*) INTO v_completed_criticas FROM public.critica WHERE status = 'concluido' AND user_id = v_user_id;
    SELECT COALESCE(SUM(amount), 0) INTO v_total_criticas_amount FROM public.critica WHERE user_id = v_user_id;
    SELECT COALESCE(SUM(amount), 0) INTO v_monthly_movement FROM public.critica
      WHERE date >= date_trunc('month', p_date_now) AND date <= p_date_now AND user_id = v_user_id;
    SELECT COALESCE(SUM(credito - debito), 0) INTO v_razao_balance FROM public.razao WHERE user_id = v_user_id;
    SELECT COALESCE(SUM(saldo_atual), 0) INTO v_bank_balance FROM public.bancos WHERE user_id = v_user_id;

    SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO v_supplier_volumes
    FROM (
      SELECT
        fornecedor,
        SUM(valor_total) AS total,
        COUNT(*) AS nota_count
      FROM public.notas_fiscais
      WHERE data_emissao <= p_date_now AND user_id = v_user_id
      GROUP BY fornecedor
      ORDER BY SUM(valor_total) DESC
    ) t;
  END IF;

  RETURN json_build_object(
    'totalCriticas', v_total_criticas,
    'pendingCriticas', v_pending_criticas,
    'unreconciledCriticas', v_unreconciled_criticas,
    'completedCriticas', v_completed_criticas,
    'totalCriticasAmount', v_total_criticas_amount,
    'razaoBalance', v_razao_balance,
    'bankBalance', v_bank_balance,
    'monthlyMovement', v_monthly_movement,
    'supplierVolumes', v_supplier_volumes
  );
END;
$$;
