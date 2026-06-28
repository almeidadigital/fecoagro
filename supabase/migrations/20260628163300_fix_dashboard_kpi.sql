-- Fix get_dashboard_kpi to work without the dropped 'type' column
-- Returns counts, balances, and amounts based on current schema

CREATE OR REPLACE FUNCTION public.get_dashboard_kpi(p_date_now DATE)
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_total_criticas INTEGER;
  v_pending_criticas INTEGER;
  v_completed_criticas INTEGER;
  v_razao_balance NUMERIC;
  v_bank_balance NUMERIC;
  v_total_criticas_amount NUMERIC;
BEGIN
  SELECT COUNT(*) INTO v_total_criticas FROM public.critica;
  SELECT COUNT(*) INTO v_pending_criticas FROM public.critica WHERE status = 'pendente';
  SELECT COUNT(*) INTO v_completed_criticas FROM public.critica WHERE status = 'concluido';
  SELECT COALESCE(SUM(amount), 0) INTO v_total_criticas_amount FROM public.critica;
  SELECT COALESCE(SUM(saldo), 0) INTO v_razao_balance FROM public.razao;
  SELECT COALESCE(SUM(saldo_atual), 0) INTO v_bank_balance FROM public.bancos;

  RETURN json_build_object(
    'totalCriticas', v_total_criticas,
    'pendingCriticas', v_pending_criticas,
    'completedCriticas', v_completed_criticas,
    'totalCriticasAmount', v_total_criticas_amount,
    'razaoBalance', v_razao_balance,
    'bankBalance', v_bank_balance
  );
END;
$$;
