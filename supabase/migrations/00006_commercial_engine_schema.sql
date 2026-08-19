-- Migration 00006: Commercial Engine Parameter Schema
-- Extends existing tables and creates new ones for the parametric commercial engine.
-- NO data is inserted. A new profile starts EMPTY.
-- All tables hang from profile_id for full profile cloning.

-- ============================================================
-- 1. EXTEND segments — add weight/exponent columns
-- ============================================================

ALTER TABLE public.segments
  ADD COLUMN IF NOT EXISTS w_precio              decimal NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS w_producto            decimal NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS w_canales             decimal NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS w_publicidad          decimal NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS w_generico            decimal NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS w_caracteristicas_marca decimal NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS kappa_precio          decimal NOT NULL DEFAULT 0.2,
  ADD COLUMN IF NOT EXISTS correccion_utilidad   decimal NOT NULL DEFAULT 1.0;

-- ============================================================
-- 2. EXTEND lifecycle_phases — add commercial engine columns
-- ============================================================

ALTER TABLE public.lifecycle_phases
  ADD COLUMN IF NOT EXISTS mult_precio           decimal NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS mult_producto         decimal NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS mult_canales          decimal NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS mult_publicidad       decimal NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS mult_generico         decimal NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS mult_caracteristicas_marca decimal NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS mult_correccion_utilidad decimal NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS rotacion_conocimiento decimal NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS adquisicion_conocimiento decimal NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS error_base            decimal NOT NULL DEFAULT 0.0;

-- ============================================================
-- 3. EXTEND media_params — add reach curve + impact columns
-- ============================================================

ALTER TABLE public.media_params
  ADD COLUMN IF NOT EXISTS reach_m               decimal,
  ADD COLUMN IF NOT EXISTS reach_lambda          decimal,
  ADD COLUMN IF NOT EXISTS reach_k               decimal,
  ADD COLUMN IF NOT EXISTS impacto_generico      decimal NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS impacto_branding      decimal NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS limite_generico       decimal NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS limite_branding       decimal NOT NULL DEFAULT 20;

COMMENT ON COLUMN public.media_params.reach_m IS 'Maximum reach (M). NULL = not yet estimated for this medium-segment.';
COMMENT ON COLUMN public.media_params.reach_lambda IS 'Scale parameter (lambda). NULL = not yet estimated.';
COMMENT ON COLUMN public.media_params.reach_k IS 'Shape parameter (k). NULL = not yet estimated.';

-- ============================================================
-- 4. EXTEND channels — add cost columns
-- ============================================================

ALTER TABLE public.channels
  ADD COLUMN IF NOT EXISTS coste_configuracion   decimal NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coste_variable        decimal NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coste_cancelacion     decimal NOT NULL DEFAULT 0;

-- ============================================================
-- 5. EXTEND demand_curves — add quantity, limite_precio, tipo_precio
-- ============================================================

ALTER TABLE public.demand_curves
  ADD COLUMN IF NOT EXISTS cantidad              decimal NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS poblacion             decimal NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tipo_precio           text NOT NULL DEFAULT 'avg_menos_stddev',
  ADD COLUMN IF NOT EXISTS precio_referencia     decimal NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS limite_precio         decimal NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS utilidad_base         decimal NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.demand_curves.tipo_precio IS 'avg_menos_stddev or reference';
COMMENT ON COLUMN public.demand_curves.cantidad IS 'Demand quantity per company for this zone-segment-period';
COMMENT ON COLUMN public.demand_curves.limite_precio IS 'Price ceiling for the budget factor';

-- ============================================================
-- 6. NEW TABLE: commercial_params (1:1 with profiles)
-- ============================================================

CREATE TABLE public.commercial_params (
  profile_id                       uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  dopaje_base100                   decimal NOT NULL DEFAULT 100,
  modelo_precio                    text NOT NULL DEFAULT 'logistic',
  modelo_demanda                   text NOT NULL DEFAULT 'producto_conocimiento',
  prevision_demanda                bool NOT NULL DEFAULT true,
  calidad_contenido                bool NOT NULL DEFAULT false,
  actualizacion_instantanea        bool NOT NULL DEFAULT true,
  escala_global                    decimal NOT NULL DEFAULT 0.25,
  created_at                       timestamptz NOT NULL DEFAULT now(),
  updated_at                       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.commercial_params ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages commercial_params" ON public.commercial_params FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = commercial_params.profile_id AND p.created_by = auth_uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = commercial_params.profile_id AND p.created_by = auth_uid()));

CREATE POLICY "Authenticated read commercial_params" ON public.commercial_params FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE TRIGGER commercial_params_updated_at BEFORE UPDATE ON public.commercial_params
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON COLUMN public.commercial_params.dopaje_base100 IS 'Demand multiplier as percentage (105 = ×1.05). Instructor-controlled.';
COMMENT ON COLUMN public.commercial_params.escala_global IS 'Global exponent scale for the aggregate index (typically 0.25).';

-- ============================================================
-- 7. NEW TABLE: segment_phases (N:M segment × phase)
-- ============================================================

CREATE TABLE public.segment_phases (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id            uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  segment_id            uuid NOT NULL REFERENCES public.segments(id) ON DELETE CASCADE,
  phase_id              uuid NOT NULL REFERENCES public.lifecycle_phases(id) ON DELETE CASCADE,
  loyalty               decimal NOT NULL DEFAULT 0
    CONSTRAINT loyalty_range CHECK (loyalty >= 0 AND loyalty <= 1),
  umbral                decimal NOT NULL DEFAULT 0
    CONSTRAINT umbral_range CHECK (umbral >= 0),
  compra_espontanea     decimal NOT NULL DEFAULT 0,
  rotacion_base         decimal NOT NULL DEFAULT 0,
  actualizacion_percepcion decimal NOT NULL DEFAULT 1,
  created_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, segment_id, phase_id)
);

ALTER TABLE public.segment_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages segment_phases" ON public.segment_phases FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = segment_phases.profile_id AND p.created_by = auth_uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = segment_phases.profile_id AND p.created_by = auth_uid()));

CREATE POLICY "Authenticated read segment_phases" ON public.segment_phases FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE INDEX idx_segment_phases_profile ON public.segment_phases(profile_id);

COMMENT ON COLUMN public.segment_phases.loyalty IS 'Loyalty smoothing factor Lambda (0 to 1).';
COMMENT ON COLUMN public.segment_phases.umbral IS 'Awareness threshold for consideration set. Unverified — leave 0 to disable.';

-- ============================================================
-- 8. NEW TABLE: segment_dimensions (segment × dimension baseline)
-- ============================================================

CREATE TABLE public.segment_dimensions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  segment_id      uuid NOT NULL REFERENCES public.segments(id) ON DELETE CASCADE,
  dimension_id    uuid NOT NULL REFERENCES public.product_dimensions(id) ON DELETE CASCADE,
  valor_inicial   decimal NOT NULL DEFAULT 0.2,
  valor_medio     decimal NOT NULL DEFAULT 1.0,
  valor_final     decimal NOT NULL DEFAULT 1.0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, segment_id, dimension_id)
);

ALTER TABLE public.segment_dimensions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages segment_dimensions" ON public.segment_dimensions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = segment_dimensions.profile_id AND p.created_by = auth_uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = segment_dimensions.profile_id AND p.created_by = auth_uid()));

CREATE POLICY "Authenticated read segment_dimensions" ON public.segment_dimensions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE INDEX idx_segment_dimensions_profile ON public.segment_dimensions(profile_id);

-- ============================================================
-- 9. NEW TABLE: engine_coefficients (estimated parameters)
-- ============================================================

CREATE TABLE public.engine_coefficients (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key             text NOT NULL,
  segment_key     text,
  medium_key      text,
  value           decimal NOT NULL,
  procedencia     text NOT NULL DEFAULT 'estimated',
  version         int NOT NULL DEFAULT 1,
  notas           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, key, segment_key, medium_key)
);

ALTER TABLE public.engine_coefficients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages engine_coefficients" ON public.engine_coefficients FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = engine_coefficients.profile_id AND p.created_by = auth_uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = engine_coefficients.profile_id AND p.created_by = auth_uid()));

CREATE POLICY "Authenticated read engine_coefficients" ON public.engine_coefficients FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE INDEX idx_engine_coefficients_profile ON public.engine_coefficients(profile_id);

CREATE TRIGGER engine_coefficients_updated_at BEFORE UPDATE ON public.engine_coefficients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.engine_coefficients IS 'Estimated coefficients from reverse engineering. key examples: precio_a, precio_b, presupuesto_c, producto_beta, publicidad_theta, reach_m, reach_lambda, reach_k, ruido_error_base_pct.';
COMMENT ON COLUMN public.engine_coefficients.procedencia IS 'platform (from official UI), estimated (reverse engineered), or manual.';

-- ============================================================
-- 10. NEW TABLE: engine_flags (modeling ambiguity toggles)
-- ============================================================

CREATE TABLE public.engine_flags (
  profile_id                         uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  ruido_activo                       bool NOT NULL DEFAULT true,
  aplicar_mult_seg_fase_precio       bool NOT NULL DEFAULT false,
  aplicar_mult_seg_fase_producto     bool NOT NULL DEFAULT false,
  aplicar_mult_seg_fase_publicidad   bool NOT NULL DEFAULT true,
  aplicar_mult_seg_fase_canales      bool NOT NULL DEFAULT true,
  aplicar_mult_seg_fase_presupuesto  bool NOT NULL DEFAULT true,
  umbral_activo                      bool NOT NULL DEFAULT false,
  actualizacion_instantanea          bool NOT NULL DEFAULT true,
  created_at                         timestamptz NOT NULL DEFAULT now(),
  updated_at                         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.engine_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages engine_flags" ON public.engine_flags FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = engine_flags.profile_id AND p.created_by = auth_uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = engine_flags.profile_id AND p.created_by = auth_uid()));

CREATE POLICY "Authenticated read engine_flags" ON public.engine_flags FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE TRIGGER engine_flags_updated_at BEFORE UPDATE ON public.engine_flags
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON COLUMN public.engine_flags.aplicar_mult_seg_fase_precio IS 'If false, Price exponent = escalaGlobal only (no segment×phase mult). Default false: Price curve already encodes segment sensitivity via kappa.';
COMMENT ON COLUMN public.engine_flags.aplicar_mult_seg_fase_producto IS 'If false, Product exponent = escalaGlobal only. Default false: Product already uses per-phase desired values.';
COMMENT ON COLUMN public.engine_flags.umbral_activo IS 'If true, filter out companies below the awareness threshold. Unverified in the reference data.';

-- ============================================================
-- 11. NEW TABLE: purchase_propensity (channel × segment)
-- ============================================================

CREATE TABLE public.purchase_propensity (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel_id      uuid NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  segment_id      uuid NOT NULL REFERENCES public.segments(id) ON DELETE CASCADE,
  propension_pct  decimal NOT NULL DEFAULT 100
    CONSTRAINT propension_pct_range CHECK (propension_pct >= 0 AND propension_pct <= 100),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, channel_id, segment_id)
);

ALTER TABLE public.purchase_propensity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages purchase_propensity" ON public.purchase_propensity FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = purchase_propensity.profile_id AND p.created_by = auth_uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = purchase_propensity.profile_id AND p.created_by = auth_uid()));

CREATE POLICY "Authenticated read purchase_propensity" ON public.purchase_propensity FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE INDEX idx_purchase_propensity_profile ON public.purchase_propensity(profile_id);

-- ============================================================
-- 12. NEW TABLE: innovation_params (1:1 with profiles)
-- ============================================================

CREATE TABLE public.innovation_params (
  profile_id      uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  granular        bool NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.innovation_params ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages innovation_params" ON public.innovation_params FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = innovation_params.profile_id AND p.created_by = auth_uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = innovation_params.profile_id AND p.created_by = auth_uid()));

CREATE POLICY "Authenticated read innovation_params" ON public.innovation_params FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE TRIGGER innovation_params_updated_at BEFORE UPDATE ON public.innovation_params
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 13. ADD CONSTRAINTS on existing tables (segment_dimension_prefs)
-- ============================================================

ALTER TABLE public.segment_dimension_prefs
  ADD CONSTRAINT desired_value_range CHECK (desired_value >= 0 AND desired_value <= 1),
  ADD CONSTRAINT propension_range CHECK (propension >= 0 AND propension <= 1);
