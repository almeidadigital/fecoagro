DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notas_fiscais'
    AND column_name = 'numero_nota' AND data_type != 'bigint'
  ) THEN
    UPDATE public.notas_fiscais
    SET numero_nota = '0'
    WHERE numero_nota IS NULL OR numero_nota !~ '^[0-9]+$';

    ALTER TABLE public.notas_fiscais
    ALTER COLUMN numero_nota TYPE BIGINT USING numero_nota::BIGINT;
  END IF;
END $$;
