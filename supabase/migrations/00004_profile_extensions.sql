-- Migration 00004: Profile Extensions + Fix ALL RLS infinite recursion
-- Adds: supplier volume discounts, improvement amortization, payment plans,
--        media scope, initial state tables.
-- Fixes: infinite recursion in RLS policies across courses/worlds/teams/
--         team_members/periods/decisions/simulation_results/simulation_jobs.
--
-- ROOT CAUSE: Policies on table A contain subqueries on table B, whose
-- policies subquery back to A (or through a chain). Postgres evaluates
-- RLS on every table referenced in a policy subquery, creating cycles.
-- FIX: SECURITY DEFINER helper functions bypass RLS internally.

-- ============================================================
-- 0. SECURITY DEFINER HELPERS (bypass RLS to break all cycles)
-- ============================================================

-- Is the current user the professor who owns this course?
CREATE OR REPLACE FUNCTION public.is_course_owner(p_course_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.courses WHERE id = p_course_id AND professor_id = public.auth_uid()
) $$;

-- Is the current user a participant (team member) in a course?
CREATE OR REPLACE FUNCTION public.is_course_participant(p_course_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.team_members tm
  JOIN public.teams t ON t.id = tm.team_id
  JOIN public.worlds w ON w.id = t.world_id
  WHERE w.course_id = p_course_id AND tm.user_id = public.auth_uid()
) $$;

-- Is the current user the professor who owns the course containing this world?
CREATE OR REPLACE FUNCTION public.is_world_owner(p_world_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.worlds w
  JOIN public.courses c ON c.id = w.course_id
  WHERE w.id = p_world_id AND c.professor_id = public.auth_uid()
) $$;

-- Is the current user a team member in this world?
CREATE OR REPLACE FUNCTION public.is_world_member(p_world_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.team_members tm
  JOIN public.teams t ON t.id = tm.team_id
  WHERE t.world_id = p_world_id AND tm.user_id = public.auth_uid()
) $$;

-- Is the current user the professor who owns the course containing this team's world?
CREATE OR REPLACE FUNCTION public.is_team_owner(p_team_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.teams t
  JOIN public.worlds w ON w.id = t.world_id
  JOIN public.courses c ON c.id = w.course_id
  WHERE t.id = p_team_id AND c.professor_id = public.auth_uid()
) $$;

-- Is the current user a member of this team?
CREATE OR REPLACE FUNCTION public.is_team_member(p_team_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.team_members WHERE team_id = p_team_id AND user_id = public.auth_uid()
) $$;

-- Is the current user the professor who owns the course containing this period's world?
CREATE OR REPLACE FUNCTION public.is_period_owner(p_period_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.periods p
  JOIN public.worlds w ON w.id = p.world_id
  JOIN public.courses c ON c.id = w.course_id
  WHERE p.id = p_period_id AND c.professor_id = public.auth_uid()
) $$;

-- ============================================================
-- 0b. DROP & RECREATE ALL RECURSIVE POLICIES
-- ============================================================

-- COURSES
DROP POLICY "Participants read courses they belong to" ON public.courses;
DROP POLICY "Professors manage own courses" ON public.courses;

CREATE POLICY "Professors manage own courses"
  ON public.courses FOR ALL
  USING (professor_id = auth_uid())
  WITH CHECK (professor_id = auth_uid());

CREATE POLICY "Participants read courses they belong to"
  ON public.courses FOR SELECT
  USING (public.is_course_participant(id));

-- WORLDS
DROP POLICY "Professors manage worlds of own courses" ON public.worlds;
DROP POLICY "Participants read own world" ON public.worlds;

CREATE POLICY "Professors manage worlds of own courses"
  ON public.worlds FOR ALL
  USING (public.is_course_owner(course_id))
  WITH CHECK (public.is_course_owner(course_id));

CREATE POLICY "Participants read own world"
  ON public.worlds FOR SELECT
  USING (public.is_world_member(id));

-- TEAMS
DROP POLICY "Professors manage teams" ON public.teams;
DROP POLICY "Participants read own team" ON public.teams;

CREATE POLICY "Professors manage teams"
  ON public.teams FOR ALL
  USING (public.is_world_owner(world_id))
  WITH CHECK (public.is_world_owner(world_id));

CREATE POLICY "Participants read own team"
  ON public.teams FOR SELECT
  USING (public.is_team_member(id));

-- TEAM_MEMBERS
DROP POLICY "Professors manage team members" ON public.team_members;

CREATE POLICY "Professors manage team members"
  ON public.team_members FOR ALL
  USING (public.is_team_owner(team_id))
  WITH CHECK (public.is_team_owner(team_id));

-- PERIODS
DROP POLICY "Professors manage periods" ON public.periods;
DROP POLICY "Participants read own world periods" ON public.periods;

CREATE POLICY "Professors manage periods"
  ON public.periods FOR ALL
  USING (public.is_world_owner(world_id))
  WITH CHECK (public.is_world_owner(world_id));

CREATE POLICY "Participants read own world periods"
  ON public.periods FOR SELECT
  USING (public.is_world_member(world_id));

-- DECISIONS
DROP POLICY "Professors read all decisions in own courses" ON public.decisions;
DROP POLICY "Team members manage own decisions" ON public.decisions;

CREATE POLICY "Professors read all decisions in own courses"
  ON public.decisions FOR SELECT
  USING (public.is_period_owner(period_id));

CREATE POLICY "Team members manage own decisions"
  ON public.decisions FOR ALL
  USING (public.is_team_member(team_id))
  WITH CHECK (public.is_team_member(team_id));

-- SIMULATION_RESULTS
DROP POLICY "Professors read all results in own courses" ON public.simulation_results;
DROP POLICY "Team members read own results only" ON public.simulation_results;

CREATE POLICY "Professors read all results in own courses"
  ON public.simulation_results FOR SELECT
  USING (public.is_period_owner(period_id));

CREATE POLICY "Team members read own results only"
  ON public.simulation_results FOR SELECT
  USING (public.is_team_member(team_id));

-- SIMULATION_JOBS
DROP POLICY "Professors read jobs in own courses" ON public.simulation_jobs;

CREATE POLICY "Professors read jobs in own courses"
  ON public.simulation_jobs FOR SELECT
  USING (public.is_world_owner(world_id));

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
