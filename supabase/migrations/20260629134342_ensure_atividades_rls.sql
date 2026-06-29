-- Ensure RLS is enabled and policies are correct for atividades table
-- Idempotent: safe to run even if policies already exist

ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;

-- SELECT: users can view their own activities
DROP POLICY IF EXISTS "atividades_select" ON public.atividades;
CREATE POLICY "atividades_select" ON public.atividades
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- INSERT: users can insert their own activities
DROP POLICY IF EXISTS "atividades_insert" ON public.atividades;
CREATE POLICY "atividades_insert" ON public.atividades
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- UPDATE: users can update their own activities
DROP POLICY IF EXISTS "atividades_update" ON public.atividades;
CREATE POLICY "atividades_update" ON public.atividades
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- DELETE: users can delete their own activities
DROP POLICY IF EXISTS "atividades_delete" ON public.atividades;
CREATE POLICY "atividades_delete" ON public.atividades
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
