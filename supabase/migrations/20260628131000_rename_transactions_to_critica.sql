-- Rename transactions table to critica (idempotent)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transactions') THEN
    ALTER TABLE public.transactions RENAME TO critica;
  END IF;
END $$;

-- Update get_latest_transaction_id to reference critica
CREATE OR REPLACE FUNCTION public.get_latest_transaction_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT id FROM public.critica ORDER BY created_at DESC, id DESC LIMIT 1);
END;
$$;

-- Update get_dashboard_kpi to reference critica
CREATE OR REPLACE FUNCTION public.get_dashboard_kpi(p_date_now DATE)
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_total_balance NUMERIC;
  v_month_income NUMERIC;
  v_month_expense NUMERIC;
  v_last_month_income NUMERIC;
  v_last_month_expense NUMERIC;
  v_start_month DATE;
  v_end_month DATE;
  v_start_last_month DATE;
  v_end_last_month DATE;
BEGIN
  v_start_month := date_trunc('month', p_date_now);
  v_end_month := (date_trunc('month', p_date_now) + interval '1 month' - interval '1 day')::date;
  v_start_last_month := date_trunc('month', p_date_now - interval '1 month');
  v_end_last_month := (date_trunc('month', p_date_now) - interval '1 day')::date;

  SELECT COALESCE(SUM(CASE WHEN type = 'Receita' THEN amount ELSE -amount END), 0)
  INTO v_total_balance FROM public.critica;

  SELECT COALESCE(SUM(amount), 0) INTO v_month_income
  FROM public.critica WHERE type = 'Receita' AND date >= v_start_month AND date <= v_end_month;

  SELECT COALESCE(SUM(amount), 0) INTO v_month_expense
  FROM public.critica WHERE type = 'Despesa' AND date >= v_start_month AND date <= v_end_month;

  SELECT COALESCE(SUM(amount), 0) INTO v_last_month_income
  FROM public.critica WHERE type = 'Receita' AND date >= v_start_last_month AND date <= v_end_last_month;

  SELECT COALESCE(SUM(amount), 0) INTO v_last_month_expense
  FROM public.critica WHERE type = 'Despesa' AND date >= v_start_last_month AND date <= v_end_last_month;

  RETURN json_build_object(
    'totalBalance', v_total_balance,
    'monthIncome', v_month_income,
    'monthExpense', v_month_expense,
    'lastMonthIncome', v_last_month_income,
    'lastMonthExpense', v_last_month_expense
  );
END;
$$;
