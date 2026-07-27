-- Migration 00004: Profile Extensions + Fix courses RLS infinite recursion
-- Adds: supplier volume discounts, improvement amortization, payment plans,
--        media scope, initial state tables.
-- Fixes: infinite recursion in courses RLS policies.

-- ============================================================
-- 0. FIX: courses RLS infinite recursion
--    The "Participants read courses" policy queries worlds,
--    whose policy queries courses back. A SECURITY DEFINER
--    function breaks the cycle by bypassing RLS internally.
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_course_participant(p_course_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members tm
    JOIN public.teams t ON t.id = tm.team_id
    JOIN public.worlds w ON w.id = t.world_id
    WHERE w.course_id = p_course_id
      AND tm.user_id = public.auth_uid()
  )
$$;

DROP POLICY "Participants read courses they belong to" ON public.courses;

CREATE POLICY "Participants read courses they belong to"
  ON public.courses FOR SELECT
  USING (public.is_course_participant(id));

-- ============================================================
-- 1. EXTENSION: supplier_materials — volume discount & risk
-- ============================================================

ALTER TABLE public.supplier_materials
  ADD COLUMN descuento_pct          DECIMAL NOT NULL DEFAULT 0,
  ADD COLUMN umbral_descuento       INT     NOT NULL DEFAULT 0,
  ADD COLUMN prob_incumplimiento    DECIMAL NOT NULL DEFAULT 0,
  ADD COLUMN flete_arancel_unitario DECIMAL NOT NULL DEFAULT 0;

-- ============================================================
-- 2. EXTENSION: improvements — variable cost & amortization
-- ============================================================

ALTER TABLE public.improvements
  ADD COLUMN costo_variable_unitario DECIMAL NOT NULL DEFAULT 0,
  ADD COLUMN periodos_amortizacion   INT     NOT NULL DEFAULT 3;

-- ============================================================
-- 3. NEW TABLE: payment_plans
-- ============================================================

CREATE TABLE public.payment_plans (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key               text NOT NULL,
  name              text NOT NULL,
  plazo_subperiodos int  NOT NULL DEFAULT 0,
  descuento_pct     decimal NOT NULL DEFAULT 0,
  sort_order        int  NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, key)
);

ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages payment_plans" ON public.payment_plans FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = payment_plans.profile_id AND p.created_by = auth_uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = payment_plans.profile_id AND p.created_by = auth_uid()));

CREATE POLICY "Authenticated read payment_plans" ON public.payment_plans FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE INDEX idx_payment_plans_profile ON public.payment_plans(profile_id);

-- ============================================================
-- 4. EXTENSION: media — scope (nacional / regional)
-- ============================================================

ALTER TABLE public.media
  ADD COLUMN alcance TEXT NOT NULL DEFAULT 'regional';

-- ============================================================
-- 5. NEW TABLES: initial_state, initial_state_zones, initial_state_machines
-- ============================================================

-- 5a. Balance / financial initial state (1:1 with profiles)
CREATE TABLE public.initial_state (
  profile_id            uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  efectivo              decimal NOT NULL DEFAULT 0,
  cuentas_por_cobrar    decimal NOT NULL DEFAULT 0,
  inventario            decimal NOT NULL DEFAULT 0,
  activo_fijo_planta    decimal NOT NULL DEFAULT 0,
  activo_fijo_equipo_neto decimal NOT NULL DEFAULT 0,
  intangibles_neto      decimal NOT NULL DEFAULT 0,
  cuentas_por_pagar     decimal NOT NULL DEFAULT 0,
  impuestos_por_pagar   decimal NOT NULL DEFAULT 0,
  linea_credito         decimal NOT NULL DEFAULT 0,
  hipoteca              decimal NOT NULL DEFAULT 0,
  prestamo_emergencia   decimal NOT NULL DEFAULT 0,
  capital_emitido       decimal NOT NULL DEFAULT 0,
  utilidades_retenidas  decimal NOT NULL DEFAULT 0,
  resultado_periodo     decimal NOT NULL DEFAULT 0,
  depositos_corto_plazo decimal NOT NULL DEFAULT 0,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.initial_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages initial_state" ON public.initial_state FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = initial_state.profile_id AND p.created_by = auth_uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = initial_state.profile_id AND p.created_by = auth_uid()));

CREATE POLICY "Authenticated read initial_state" ON public.initial_state FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE TRIGGER initial_state_updated_at BEFORE UPDATE ON public.initial_state
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5b. Per-zone initial state (1:N with profiles)
CREATE TABLE public.initial_state_zones (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  zone_id         uuid NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  modulos_almacen int     NOT NULL DEFAULT 0,
  precio          decimal NOT NULL DEFAULT 0,
  plan_pago_key   text    NOT NULL DEFAULT 'D',
  vendedores      int     NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, zone_id)
);

ALTER TABLE public.initial_state_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages initial_state_zones" ON public.initial_state_zones FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = initial_state_zones.profile_id AND p.created_by = auth_uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = initial_state_zones.profile_id AND p.created_by = auth_uid()));

CREATE POLICY "Authenticated read initial_state_zones" ON public.initial_state_zones FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE INDEX idx_initial_state_zones_profile ON public.initial_state_zones(profile_id);
CREATE INDEX idx_initial_state_zones_zone ON public.initial_state_zones(zone_id);

-- 5c. Per-machine initial state (1:N with profiles)
CREATE TABLE public.initial_state_machines (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  machine_id  uuid NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
  section_id  uuid NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  cantidad    int  NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, machine_id, section_id)
);

ALTER TABLE public.initial_state_machines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages initial_state_machines" ON public.initial_state_machines FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = initial_state_machines.profile_id AND p.created_by = auth_uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = initial_state_machines.profile_id AND p.created_by = auth_uid()));

CREATE POLICY "Authenticated read initial_state_machines" ON public.initial_state_machines FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE INDEX idx_initial_state_machines_profile ON public.initial_state_machines(profile_id);
CREATE INDEX idx_initial_state_machines_machine ON public.initial_state_machines(machine_id);
CREATE INDEX idx_initial_state_machines_section ON public.initial_state_machines(section_id);
