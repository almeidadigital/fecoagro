-- Rename notas_fiscais.emissor to fornecedor for consistency with live schema
-- This is idempotent: only renames if the old column exists

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notas_fiscais'
    AND column_name = 'emissor'
  ) THEN
    ALTER TABLE public.notas_fiscais RENAME COLUMN emissor TO fornecedor;
  END IF;
END $$;
