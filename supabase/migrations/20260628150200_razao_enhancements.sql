-- Add historico and lote columns to razao

ALTER TABLE public.razao ADD COLUMN IF NOT EXISTS historico TEXT;
ALTER TABLE public.razao ADD COLUMN IF NOT EXISTS lote BIGINT;
