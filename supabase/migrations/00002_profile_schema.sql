-- ExSim IPADE — Normalized Profile Schema
-- Replaces profiles.config JSONB with typed tables
-- Money in DECIMAL (never float). RLS on every table.

COMMENT ON COLUMN public.profiles.config IS 'DEPRECATED — use normalized profile_* tables instead';

-- ============================================================
-- 1. CORE PROFILE PARAMS (1:1 with profiles)
-- ============================================================

CREATE TABLE public.profile_params (
  profile_id         uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  periodos           int NOT NULL DEFAULT 8,
  periodos_por_superperiodo int NOT NULL DEFAULT 4,
  subperiodos_por_periodo int NOT NULL DEFAULT 8,
  unidades_por_subperiodo int NOT NULL DEFAULT 1,
  horas_por_periodo  int NOT NULL DEFAULT 160,
  moneda             char(1) NOT NULL DEFAULT '$',
  periodos_iniciales int NOT NULL DEFAULT 6,
  historico          bool NOT NULL DEFAULT false,
  prompt_debriefing  text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.profile_texts (
  profile_id    uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  nombre_caso   text NOT NULL DEFAULT '',
  descripcion   text NOT NULL DEFAULT '',
  instrucciones text NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. ZONES & SEGMENTS
-- ============================================================

CREATE TABLE public.zones (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key         text NOT NULL,
  name        text NOT NULL,
  active      bool NOT NULL DEFAULT true,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, key)
);

CREATE TABLE public.segments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key         text NOT NULL,
  name        text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, key)
);

CREATE TABLE public.lifecycle_phases (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key         text NOT NULL,
  name        text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, key)
);

CREATE TABLE public.zone_phase_schedule (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  zone_id      uuid NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  phase_id     uuid NOT NULL REFERENCES public.lifecycle_phases(id) ON DELETE CASCADE,
  period_from  int NOT NULL,
  period_to    int,
  trigger_type text NOT NULL DEFAULT 'fixed_period',
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. DEMAND MODEL
-- ============================================================

CREATE TABLE public.demand_params (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  zone_id          uuid NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  segment_id       uuid NOT NULL REFERENCES public.segments(id) ON DELETE CASCADE,
  modelo_precio    text NOT NULL DEFAULT 'LINEAL',
  kappa_precio     decimal NOT NULL DEFAULT 0.2,
  tipo_precio      text NOT NULL DEFAULT 'AVG_MENOS_STDDEV',
  limite_precio    decimal,
  w_precio         decimal NOT NULL DEFAULT 1.0,
  w_publicidad     decimal NOT NULL DEFAULT 1.0,
  w_canal          decimal NOT NULL DEFAULT 1.0,
  w_producto       decimal NOT NULL DEFAULT 1.0,
  demanda_base     decimal NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, zone_id, segment_id)
);

CREATE TABLE public.demand_curves (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  zone_id      uuid NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  segment_id   uuid NOT NULL REFERENCES public.segments(id) ON DELETE CASCADE,
  period       int NOT NULL,
  demand_base  decimal NOT NULL DEFAULT 0,
  growth_rate  decimal NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, zone_id, segment_id, period)
);

-- ============================================================
-- 4. PRODUCT DIMENSIONS
-- ============================================================

CREATE TABLE public.product_dimensions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key         text NOT NULL,
  name        text NOT NULL,
  valor_inicial decimal NOT NULL DEFAULT 0.2,
  valor_min   decimal NOT NULL DEFAULT 0.0,
  valor_max   decimal NOT NULL DEFAULT 1.0,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, key)
);

CREATE TABLE public.segment_dimension_prefs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  segment_id    uuid NOT NULL REFERENCES public.segments(id) ON DELETE CASCADE,
  phase_id      uuid NOT NULL REFERENCES public.lifecycle_phases(id) ON DELETE CASCADE,
  dimension_id  uuid NOT NULL REFERENCES public.product_dimensions(id) ON DELETE CASCADE,
  desired_value decimal NOT NULL DEFAULT 0.5,
  propension    decimal NOT NULL DEFAULT 0.5,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, segment_id, phase_id, dimension_id)
);

-- ============================================================
-- 5. COMMERCIAL: CHANNELS & MEDIA
-- ============================================================

CREATE TABLE public.channels (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key         text NOT NULL,
  name        text NOT NULL,
  tipo        text NOT NULL DEFAULT 'salespeople',
  active      bool NOT NULL DEFAULT true,
  alfa        decimal NOT NULL DEFAULT 0.7,
  kappa       decimal NOT NULL DEFAULT 1.0,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, key)
);

CREATE TABLE public.channel_zones (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel_id       uuid NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  zone_id          uuid NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  distribuidores   int NOT NULL DEFAULT 10,
  active           bool NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, channel_id, zone_id)
);

CREATE TABLE public.media (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key         text NOT NULL,
  name        text NOT NULL,
  active      bool NOT NULL DEFAULT true,
  costo_spot  decimal NOT NULL DEFAULT 0,
  limite_spots int,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, key)
);

CREATE TABLE public.media_params (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_id        uuid NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  segment_id      uuid NOT NULL REFERENCES public.segments(id) ON DELETE CASCADE,
  forma           text NOT NULL DEFAULT 'hill',
  lambda          decimal NOT NULL DEFAULT 10,
  k               decimal NOT NULL DEFAULT 1.5,
  qlim_max        decimal NOT NULL DEFAULT 0.8,
  valor_min       decimal NOT NULL DEFAULT 0,
  m_inf           decimal NOT NULL DEFAULT 0,
  m_sup           decimal NOT NULL DEFAULT 1,
  max_alcanzable  decimal NOT NULL DEFAULT 0.8,
  exclusivo       decimal NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, media_id, segment_id)
);

-- ============================================================
-- 6. PRODUCTION
-- ============================================================

CREATE TABLE public.production_params (
  profile_id           uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  costo_modulo_planta  decimal NOT NULL DEFAULT 200000,
  periodos_construccion int NOT NULL DEFAULT 2,
  capacidad_almacen_modulo int NOT NULL DEFAULT 12,
  costo_almacen_modulo decimal NOT NULL DEFAULT 5000,
  costo_desecho        decimal NOT NULL DEFAULT 0,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.sections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key         text NOT NULL,
  name        text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, key)
);

CREATE TABLE public.machines (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key               text NOT NULL,
  name              text NOT NULL,
  capacidad_hora    decimal NOT NULL DEFAULT 1,
  costo_compra      decimal NOT NULL DEFAULT 0,
  costo_instalacion decimal NOT NULL DEFAULT 0,
  periodos_instalacion int NOT NULL DEFAULT 1,
  costo_mantenimiento decimal NOT NULL DEFAULT 0,
  vida_util         int,
  sort_order        int NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, key)
);

CREATE TABLE public.section_machines (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  section_id   uuid NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  machine_id   uuid NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
  requerido    bool NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, section_id, machine_id)
);

CREATE TABLE public.materials (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key         text NOT NULL,
  name        text NOT NULL,
  unidad      text NOT NULL DEFAULT 'pz',
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, key)
);

CREATE TABLE public.suppliers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key         text NOT NULL,
  name        text NOT NULL,
  plazo_pago  int NOT NULL DEFAULT 0,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, key)
);

CREATE TABLE public.supplier_materials (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  supplier_id   uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  material_id   uuid NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  precio        decimal NOT NULL DEFAULT 0,
  lote_minimo   int NOT NULL DEFAULT 1,
  plazo_entrega int NOT NULL DEFAULT 1,
  active        bool NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, supplier_id, material_id)
);

-- ============================================================
-- 7. PEOPLE / HR
-- ============================================================

CREATE TABLE public.hr_params (
  profile_id             uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  salario_base           decimal NOT NULL DEFAULT 93.75,
  horas_por_turno        int NOT NULL DEFAULT 8,
  turnos_por_periodo     int NOT NULL DEFAULT 20,
  costo_contratacion     decimal NOT NULL DEFAULT 500,
  costo_despido          decimal NOT NULL DEFAULT 1000,
  costo_horas_extra_pct  decimal NOT NULL DEFAULT 50,
  max_horas_extra_pct    decimal NOT NULL DEFAULT 25,
  fpr_base               decimal NOT NULL DEFAULT 0.85,
  fpr_max                decimal NOT NULL DEFAULT 1.10,
  fpr1                   decimal NOT NULL DEFAULT 0.90,
  fpr2                   decimal NOT NULL DEFAULT 0.95,
  fpr3                   decimal NOT NULL DEFAULT 1.00,
  fpr4                   decimal NOT NULL DEFAULT 1.05,
  peso_salario           decimal NOT NULL DEFAULT 0.60,
  peso_beneficios        decimal NOT NULL DEFAULT 0.40,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.benefits (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key         text NOT NULL,
  name        text NOT NULL,
  tipo_curva  text NOT NULL DEFAULT 'linear',
  x_min       decimal NOT NULL DEFAULT 0,
  x_max       decimal NOT NULL DEFAULT 100,
  y_min       decimal NOT NULL DEFAULT 0,
  y_max       decimal NOT NULL DEFAULT 1,
  weight      decimal NOT NULL DEFAULT 1,
  unidad      text NOT NULL DEFAULT '',
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, key)
);

-- ============================================================
-- 8. FINANCE
-- ============================================================

CREATE TABLE public.finance_params (
  profile_id              uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  tasa_linea_credito      decimal NOT NULL DEFAULT 10,
  tasa_deposito           decimal NOT NULL DEFAULT 4,
  tasa_hipoteca           decimal NOT NULL DEFAULT 6,
  tasa_emergencia         decimal NOT NULL DEFAULT 30,
  limite_hipoteca         decimal NOT NULL DEFAULT 500000,
  plazo_hipoteca          int NOT NULL DEFAULT 12,
  plazo_cobro_default     int NOT NULL DEFAULT 2,
  impuesto_renta_pct      decimal NOT NULL DEFAULT 30,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 9. LOGISTICS
-- ============================================================

CREATE TABLE public.logistics_params (
  profile_id                uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  costo_envio_base          decimal NOT NULL DEFAULT 0,
  capacidad_almacen_default int NOT NULL DEFAULT 48,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.transport_modes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key             text NOT NULL,
  name            text NOT NULL,
  costo_por_ton_km decimal NOT NULL DEFAULT 0,
  tiempo_periodos  int NOT NULL DEFAULT 1,
  co2_gr_ton_km   decimal NOT NULL DEFAULT 0,
  active          bool NOT NULL DEFAULT true,
  sort_order      int NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, key)
);

CREATE TABLE public.route_distances (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  origin_zone_id uuid NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  dest_zone_id   uuid NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  distance_km    decimal NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, origin_zone_id, dest_zone_id)
);

-- ============================================================
-- 10. INNOVATION / R&D
-- ============================================================

CREATE TABLE public.improvements (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key               text NOT NULL,
  name              text NOT NULL,
  costo             decimal NOT NULL DEFAULT 0,
  periodos_desarrollo int NOT NULL DEFAULT 2,
  activa            bool NOT NULL DEFAULT true,
  sort_order        int NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, key)
);

CREATE TABLE public.improvement_dimensions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  improvement_id  uuid NOT NULL REFERENCES public.improvements(id) ON DELETE CASCADE,
  dimension_id    uuid NOT NULL REFERENCES public.product_dimensions(id) ON DELETE CASCADE,
  delta           decimal NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (improvement_id, dimension_id)
);

-- ============================================================
-- 11. ESG
-- ============================================================

CREATE TABLE public.esg_params (
  profile_id                       uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  factor_electricidad_co2          decimal NOT NULL DEFAULT 400,
  factor_construccion_co2          decimal NOT NULL DEFAULT 500,
  kg_co2_desecho_reciclaje         decimal NOT NULL DEFAULT 12,
  kg_co2_desecho_transporte        decimal NOT NULL DEFAULT 1.2,
  periodos_amortizacion_construccion int NOT NULL DEFAULT 12,
  created_at                       timestamptz NOT NULL DEFAULT now(),
  updated_at                       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.esg_components (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id               uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tipo                     text NOT NULL,
  nombre                   text NOT NULL,
  inversion_unitaria       decimal NOT NULL DEFAULT 0,
  vida_util_periodos       int,
  costo_mantenimiento_pct  decimal NOT NULL DEFAULT 0,
  costo_mantenimiento_fijo decimal NOT NULL DEFAULT 0,
  kwh_generados_periodo    decimal,
  co2_offset_periodo       decimal NOT NULL DEFAULT 0,
  sobrecosto_energia_pct   decimal,
  horizonte_credito        int,
  arboles_por_lote         int,
  activo                   bool NOT NULL DEFAULT true,
  sort_order               int NOT NULL DEFAULT 0,
  created_at               timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, tipo)
);

CREATE TABLE public.esg_material_emissions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  material_id   uuid NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  supplier_id   uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  kg_co2_por_unidad decimal NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, material_id, supplier_id)
);

-- ============================================================
-- 12. BRAND
-- ============================================================

CREATE TABLE public.brand_params (
  profile_id              uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  multi_brand_enabled     bool NOT NULL DEFAULT false,
  perception_lag          bool NOT NULL DEFAULT true,
  brand_equity_decay      decimal NOT NULL DEFAULT 0.1,
  brand_equity_initial    decimal NOT NULL DEFAULT 0.5,
  actualizacion_percepcion decimal NOT NULL DEFAULT 0.5,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 13. VISIBILITY (reports & information available to teams)
-- ============================================================

CREATE TABLE public.visibility_params (
  profile_id             uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  ver_precios_competencia bool NOT NULL DEFAULT true,
  ver_cuota_mercado      bool NOT NULL DEFAULT true,
  ver_produccion_competencia bool NOT NULL DEFAULT false,
  ver_finanzas_competencia bool NOT NULL DEFAULT false,
  ver_costos_detallados  bool NOT NULL DEFAULT true,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.report_types (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key         text NOT NULL,
  name        text NOT NULL,
  costo       decimal NOT NULL DEFAULT 0,
  active      bool NOT NULL DEFAULT true,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, key)
);

-- ============================================================
-- 14. ENABLE RLS ON ALL NEW TABLES
-- ============================================================

ALTER TABLE public.profile_params ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifecycle_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_phase_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demand_params ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demand_curves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.segment_dimension_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_params ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_params ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_params ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_params ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_params ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_distances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.improvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.improvement_dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_params ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_material_emissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_params ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visibility_params ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_types ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 15. RLS POLICIES — profile owner gets full CRUD, authenticated get SELECT
-- ============================================================

-- Macro: for every profile-child table, the owner is profiles.created_by
-- We create a helper to avoid repeating the subquery

DO $$
DECLARE
  tbl text;
  tbl_1to1 text;
BEGIN
  -- 1:many tables (have profile_id FK column)
  FOREACH tbl IN ARRAY ARRAY[
    'zones', 'segments', 'lifecycle_phases', 'zone_phase_schedule',
    'demand_params', 'demand_curves',
    'product_dimensions', 'segment_dimension_prefs',
    'channels', 'channel_zones', 'media', 'media_params',
    'sections', 'machines', 'section_machines',
    'materials', 'suppliers', 'supplier_materials',
    'benefits', 'transport_modes', 'route_distances',
    'improvements', 'improvement_dimensions',
    'esg_components', 'esg_material_emissions',
    'report_types'
  ]
  LOOP
    EXECUTE format(
      'CREATE POLICY "Owner manages %1$s" ON public.%1$s FOR ALL
       USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = %1$s.profile_id AND p.created_by = auth_uid()))
       WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = %1$s.profile_id AND p.created_by = auth_uid()))',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "Authenticated read %1$s" ON public.%1$s FOR SELECT
       USING (auth.role() = ''authenticated'')',
      tbl
    );
  END LOOP;

  -- 1:1 tables (profile_id IS the PK)
  FOREACH tbl_1to1 IN ARRAY ARRAY[
    'profile_params', 'profile_texts',
    'production_params', 'hr_params', 'finance_params',
    'logistics_params', 'esg_params', 'brand_params', 'visibility_params'
  ]
  LOOP
    EXECUTE format(
      'CREATE POLICY "Owner manages %1$s" ON public.%1$s FOR ALL
       USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = %1$s.profile_id AND p.created_by = auth_uid()))
       WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = %1$s.profile_id AND p.created_by = auth_uid()))',
      tbl_1to1
    );
    EXECUTE format(
      'CREATE POLICY "Authenticated read %1$s" ON public.%1$s FOR SELECT
       USING (auth.role() = ''authenticated'')',
      tbl_1to1
    );
  END LOOP;
END $$;

-- ============================================================
-- 16. TRIGGERS (updated_at on tables that have it)
-- ============================================================

CREATE TRIGGER profile_params_updated_at BEFORE UPDATE ON public.profile_params
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profile_texts_updated_at BEFORE UPDATE ON public.profile_texts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER demand_params_updated_at BEFORE UPDATE ON public.demand_params
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER production_params_updated_at BEFORE UPDATE ON public.production_params
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER hr_params_updated_at BEFORE UPDATE ON public.hr_params
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER finance_params_updated_at BEFORE UPDATE ON public.finance_params
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER logistics_params_updated_at BEFORE UPDATE ON public.logistics_params
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER esg_params_updated_at BEFORE UPDATE ON public.esg_params
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER brand_params_updated_at BEFORE UPDATE ON public.brand_params
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER visibility_params_updated_at BEFORE UPDATE ON public.visibility_params
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 17. INDEXES ON ALL FK COLUMNS
-- ============================================================

CREATE INDEX idx_zones_profile ON public.zones(profile_id);
CREATE INDEX idx_segments_profile ON public.segments(profile_id);
CREATE INDEX idx_lifecycle_phases_profile ON public.lifecycle_phases(profile_id);
CREATE INDEX idx_zone_phase_schedule_profile ON public.zone_phase_schedule(profile_id);
CREATE INDEX idx_zone_phase_schedule_zone ON public.zone_phase_schedule(zone_id);
CREATE INDEX idx_zone_phase_schedule_phase ON public.zone_phase_schedule(phase_id);
CREATE INDEX idx_demand_params_profile ON public.demand_params(profile_id);
CREATE INDEX idx_demand_params_zone ON public.demand_params(zone_id);
CREATE INDEX idx_demand_params_segment ON public.demand_params(segment_id);
CREATE INDEX idx_demand_curves_profile ON public.demand_curves(profile_id);
CREATE INDEX idx_demand_curves_zone ON public.demand_curves(zone_id);
CREATE INDEX idx_demand_curves_segment ON public.demand_curves(segment_id);
CREATE INDEX idx_product_dimensions_profile ON public.product_dimensions(profile_id);
CREATE INDEX idx_segment_dimension_prefs_profile ON public.segment_dimension_prefs(profile_id);
CREATE INDEX idx_segment_dimension_prefs_segment ON public.segment_dimension_prefs(segment_id);
CREATE INDEX idx_segment_dimension_prefs_phase ON public.segment_dimension_prefs(phase_id);
CREATE INDEX idx_segment_dimension_prefs_dimension ON public.segment_dimension_prefs(dimension_id);
CREATE INDEX idx_channels_profile ON public.channels(profile_id);
CREATE INDEX idx_channel_zones_profile ON public.channel_zones(profile_id);
CREATE INDEX idx_channel_zones_channel ON public.channel_zones(channel_id);
CREATE INDEX idx_channel_zones_zone ON public.channel_zones(zone_id);
CREATE INDEX idx_media_profile ON public.media(profile_id);
CREATE INDEX idx_media_params_profile ON public.media_params(profile_id);
CREATE INDEX idx_media_params_media ON public.media_params(media_id);
CREATE INDEX idx_media_params_segment ON public.media_params(segment_id);
CREATE INDEX idx_sections_profile ON public.sections(profile_id);
CREATE INDEX idx_machines_profile ON public.machines(profile_id);
CREATE INDEX idx_section_machines_profile ON public.section_machines(profile_id);
CREATE INDEX idx_section_machines_section ON public.section_machines(section_id);
CREATE INDEX idx_section_machines_machine ON public.section_machines(machine_id);
CREATE INDEX idx_materials_profile ON public.materials(profile_id);
CREATE INDEX idx_suppliers_profile ON public.suppliers(profile_id);
CREATE INDEX idx_supplier_materials_profile ON public.supplier_materials(profile_id);
CREATE INDEX idx_supplier_materials_supplier ON public.supplier_materials(supplier_id);
CREATE INDEX idx_supplier_materials_material ON public.supplier_materials(material_id);
CREATE INDEX idx_benefits_profile ON public.benefits(profile_id);
CREATE INDEX idx_transport_modes_profile ON public.transport_modes(profile_id);
CREATE INDEX idx_route_distances_profile ON public.route_distances(profile_id);
CREATE INDEX idx_route_distances_origin ON public.route_distances(origin_zone_id);
CREATE INDEX idx_route_distances_dest ON public.route_distances(dest_zone_id);
CREATE INDEX idx_improvements_profile ON public.improvements(profile_id);
CREATE INDEX idx_improvement_dimensions_profile ON public.improvement_dimensions(profile_id);
CREATE INDEX idx_improvement_dimensions_improvement ON public.improvement_dimensions(improvement_id);
CREATE INDEX idx_improvement_dimensions_dimension ON public.improvement_dimensions(dimension_id);
CREATE INDEX idx_esg_components_profile ON public.esg_components(profile_id);
CREATE INDEX idx_esg_material_emissions_profile ON public.esg_material_emissions(profile_id);
CREATE INDEX idx_esg_material_emissions_material ON public.esg_material_emissions(material_id);
CREATE INDEX idx_esg_material_emissions_supplier ON public.esg_material_emissions(supplier_id);
CREATE INDEX idx_report_types_profile ON public.report_types(profile_id);
