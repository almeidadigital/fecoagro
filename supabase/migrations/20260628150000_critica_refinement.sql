-- Critica refinement: remove type/notes, add lote, create lote sequence

ALTER TABLE public.critica DROP COLUMN IF EXISTS type;
ALTER TABLE public.critica DROP COLUMN IF EXISTS notes;
ALTER TABLE public.critica ADD COLUMN IF NOT EXISTS lote BIGINT;

CREATE SEQUENCE IF NOT EXISTS public.lote_seq START 1;

CREATE OR REPLACE FUNCTION public.get_next_lote()
RETURNS BIGINT AS $$
BEGIN
  RETURN nextval('public.lote_seq');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
