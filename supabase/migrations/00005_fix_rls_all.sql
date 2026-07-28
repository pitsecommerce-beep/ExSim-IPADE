-- Migration 00005: Fix ALL RLS infinite recursion (idempotent)
--
-- This migration can be run even if 00004 was partially applied.
-- It uses CREATE OR REPLACE for functions and DROP POLICY IF EXISTS.
--
-- ROOT CAUSE: Policies on table A contain subqueries on table B, whose
-- policies subquery back to A. Postgres evaluates RLS on every table
-- referenced in a policy subquery, creating infinite recursion.
--
-- FIX: SECURITY DEFINER functions bypass RLS internally, breaking cycles.

-- ============================================================
-- 1. SECURITY DEFINER HELPERS
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_course_owner(p_course_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.courses WHERE id = p_course_id AND professor_id = public.auth_uid()
) $$;

CREATE OR REPLACE FUNCTION public.is_course_participant(p_course_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.team_members tm
  JOIN public.teams t ON t.id = tm.team_id
  JOIN public.worlds w ON w.id = t.world_id
  WHERE w.course_id = p_course_id AND tm.user_id = public.auth_uid()
) $$;

CREATE OR REPLACE FUNCTION public.is_world_owner(p_world_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.worlds w
  JOIN public.courses c ON c.id = w.course_id
  WHERE w.id = p_world_id AND c.professor_id = public.auth_uid()
) $$;

CREATE OR REPLACE FUNCTION public.is_world_member(p_world_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.team_members tm
  JOIN public.teams t ON t.id = tm.team_id
  WHERE t.world_id = p_world_id AND tm.user_id = public.auth_uid()
) $$;

CREATE OR REPLACE FUNCTION public.is_team_owner(p_team_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.teams t
  JOIN public.worlds w ON w.id = t.world_id
  JOIN public.courses c ON c.id = w.course_id
  WHERE t.id = p_team_id AND c.professor_id = public.auth_uid()
) $$;

CREATE OR REPLACE FUNCTION public.is_team_member(p_team_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.team_members WHERE team_id = p_team_id AND user_id = public.auth_uid()
) $$;

CREATE OR REPLACE FUNCTION public.is_period_owner(p_period_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.periods p
  JOIN public.worlds w ON w.id = p.world_id
  JOIN public.courses c ON c.id = w.course_id
  WHERE p.id = p_period_id AND c.professor_id = public.auth_uid()
) $$;

-- ============================================================
-- 2. DROP ALL OLD RECURSIVE POLICIES (IF EXISTS for idempotency)
-- ============================================================

DROP POLICY IF EXISTS "Professors manage own courses" ON public.courses;
DROP POLICY IF EXISTS "Participants read courses they belong to" ON public.courses;

DROP POLICY IF EXISTS "Professors manage worlds of own courses" ON public.worlds;
DROP POLICY IF EXISTS "Participants read own world" ON public.worlds;

DROP POLICY IF EXISTS "Professors manage teams" ON public.teams;
DROP POLICY IF EXISTS "Participants read own team" ON public.teams;

DROP POLICY IF EXISTS "Professors manage team members" ON public.team_members;

DROP POLICY IF EXISTS "Professors manage periods" ON public.periods;
DROP POLICY IF EXISTS "Participants read own world periods" ON public.periods;

DROP POLICY IF EXISTS "Professors read all decisions in own courses" ON public.decisions;
DROP POLICY IF EXISTS "Team members manage own decisions" ON public.decisions;

DROP POLICY IF EXISTS "Professors read all results in own courses" ON public.simulation_results;
DROP POLICY IF EXISTS "Team members read own results only" ON public.simulation_results;

DROP POLICY IF EXISTS "Professors read jobs in own courses" ON public.simulation_jobs;

-- ============================================================
-- 3. RECREATE ALL POLICIES USING HELPER FUNCTIONS
-- ============================================================

-- COURSES
CREATE POLICY "Professors manage own courses"
  ON public.courses FOR ALL
  USING (professor_id = auth_uid())
  WITH CHECK (professor_id = auth_uid());

CREATE POLICY "Participants read courses they belong to"
  ON public.courses FOR SELECT
  USING (public.is_course_participant(id));

-- WORLDS
CREATE POLICY "Professors manage worlds of own courses"
  ON public.worlds FOR ALL
  USING (public.is_course_owner(course_id))
  WITH CHECK (public.is_course_owner(course_id));

CREATE POLICY "Participants read own world"
  ON public.worlds FOR SELECT
  USING (public.is_world_member(id));

-- TEAMS
CREATE POLICY "Professors manage teams"
  ON public.teams FOR ALL
  USING (public.is_world_owner(world_id))
  WITH CHECK (public.is_world_owner(world_id));

CREATE POLICY "Participants read own team"
  ON public.teams FOR SELECT
  USING (public.is_team_member(id));

-- TEAM_MEMBERS
CREATE POLICY "Professors manage team members"
  ON public.team_members FOR ALL
  USING (public.is_team_owner(team_id))
  WITH CHECK (public.is_team_owner(team_id));

-- PERIODS
CREATE POLICY "Professors manage periods"
  ON public.periods FOR ALL
  USING (public.is_world_owner(world_id))
  WITH CHECK (public.is_world_owner(world_id));

CREATE POLICY "Participants read own world periods"
  ON public.periods FOR SELECT
  USING (public.is_world_member(world_id));

-- DECISIONS
CREATE POLICY "Professors read all decisions in own courses"
  ON public.decisions FOR SELECT
  USING (public.is_period_owner(period_id));

CREATE POLICY "Team members manage own decisions"
  ON public.decisions FOR ALL
  USING (public.is_team_member(team_id))
  WITH CHECK (public.is_team_member(team_id));

-- SIMULATION_RESULTS
CREATE POLICY "Professors read all results in own courses"
  ON public.simulation_results FOR SELECT
  USING (public.is_period_owner(period_id));

CREATE POLICY "Team members read own results only"
  ON public.simulation_results FOR SELECT
  USING (public.is_team_member(team_id));

-- SIMULATION_JOBS
CREATE POLICY "Professors read jobs in own courses"
  ON public.simulation_jobs FOR SELECT
  USING (public.is_world_owner(world_id));
