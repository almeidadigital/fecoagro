-- Ensure seed user exists and fix notas_fiscais seed data with proper numeric values

-- Seed user: andre@almeida.com.br (idempotent)
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

-- Fix seed notas_fiscais: replace numero_nota=0 (from text-to-bigint migration) with proper numbers
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'andre@almeida.com.br';
  IF v_user_id IS NOT NULL THEN
    UPDATE public.notas_fiscais
    SET numero_nota = 1289
    WHERE user_id = v_user_id AND numero_nota = 0 AND emissor = 'Cooperativa Fecoagro';

    UPDATE public.notas_fiscais
    SET numero_nota = 1290
    WHERE user_id = v_user_id AND numero_nota = 0 AND emissor = 'Fornecedor Agro LTDA';

    UPDATE public.notas_fiscais
    SET numero_nota = 1291
    WHERE user_id = v_user_id AND numero_nota = 0 AND emissor = 'Transportadora Sul';
  END IF;
END $$;
