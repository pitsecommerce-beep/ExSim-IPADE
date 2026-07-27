-- Migration 00003: Extend visibility_params with operational/financial toggles
-- These match the benchmark Visibilidad tab toggles

ALTER TABLE public.visibility_params
  ADD COLUMN IF NOT EXISTS movimiento_maquinas     bool NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS alquiler_maquinas       bool NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hipoteca                bool NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS factoraje               bool NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS prestamo_accionista     bool NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS dividendos              bool NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS emision_acciones        bool NOT NULL DEFAULT false;
