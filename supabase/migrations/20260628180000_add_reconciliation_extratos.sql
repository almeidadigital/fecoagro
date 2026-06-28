-- Add reconciliation columns to extratos_bancarios and seed user

ALTER TABLE public.extratos_bancarios
  ADD COLUMN IF NOT EXISTS razao_id BIGINT REFERENCES public.razao(id) ON DELETE SET NULL;
ALTER TABLE public.extratos_bancarios
  ADD COLUMN IF NOT EXISTS reconciled BOOLEAN NOT NULL DEFAULT FALSE;

-- Reinforce RLS policies
ALTER TABLE public.extratos_bancarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "extratos_select" ON public.extratos_bancarios;
CREATE POLICY "extratos_select" ON public.extratos_bancarios
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "extratos_insert" ON public.extratos_bancarios;
CREATE POLICY "extratos_insert" ON public.extratos_bancarios
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "extratos_update" ON public.extratos_bancarios;
CREATE POLICY "extratos_update" ON public.extratos_bancarios
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "extratos_delete" ON public.extratos_bancarios;
CREATE POLICY "extratos_delete" ON public.extratos_bancarios
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Seed user: andre@almeida.com.br
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'andre@almeida.com.br') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'andre@almeida.com.br',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Andre Almeida"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.users (id, full_name, role)
    VALUES (new_user_id, 'Andre Almeida', 'admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
