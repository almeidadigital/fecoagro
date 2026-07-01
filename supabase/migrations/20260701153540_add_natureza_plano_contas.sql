-- Add natureza column to plano_contas and populate based on classification
-- Also ensure RLS policies and seed user

-- 1. Ensure seed user exists
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'andre@almeida.com.br') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'andre@almeida.com.br',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Andre Almeida"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;

  SELECT id INTO v_user_id FROM auth.users WHERE email = 'andre@almeida.com.br';
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.users (id, full_name, role)
    VALUES (v_user_id, 'Andre Almeida', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Andre Almeida';
  END IF;
END $$;

-- 2. Add natureza column
ALTER TABLE public.plano_contas ADD COLUMN IF NOT EXISTS natureza TEXT;

-- 3. Update natureza based on classification prefix
UPDATE public.plano_contas SET natureza = 'Devedora' WHERE LEFT(classificacao, 1) = '1';
UPDATE public.plano_contas SET natureza = 'Credora' WHERE LEFT(classificacao, 1) = '2';
UPDATE public.plano_contas SET natureza = 'Credora' WHERE LEFT(classificacao, 1) = '3';
UPDATE public.plano_contas SET natureza = 'Devedora' WHERE LEFT(classificacao, 1) = '4';
UPDATE public.plano_contas SET natureza = 'Devedora' WHERE LEFT(classificacao, 1) = '5';

-- 4. Ensure RLS policies (admin-aware)
ALTER TABLE public.plano_contas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "plano_contas_select" ON public.plano_contas;
CREATE POLICY "plano_contas_select" ON public.plano_contas
  FOR SELECT TO authenticated USING (public.is_admin() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "plano_contas_insert" ON public.plano_contas;
CREATE POLICY "plano_contas_insert" ON public.plano_contas
  FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "plano_contas_update" ON public.plano_contas;
CREATE POLICY "plano_contas_update" ON public.plano_contas
  FOR UPDATE TO authenticated USING (public.is_admin() OR auth.uid() = user_id) WITH CHECK (public.is_admin() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "plano_contas_delete" ON public.plano_contas;
CREATE POLICY "plano_contas_delete" ON public.plano_contas
  FOR DELETE TO authenticated USING (public.is_admin() OR auth.uid() = user_id);
