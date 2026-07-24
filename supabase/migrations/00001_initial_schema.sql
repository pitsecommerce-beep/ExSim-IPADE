-- ExSim IPADE — Initial Schema
-- All money values in integer cents (no floating point)
-- RLS enabled on every table

-- Enums
CREATE TYPE public.user_role AS ENUM ('professor', 'participant');
CREATE TYPE public.world_status AS ENUM ('setup', 'active', 'paused', 'completed');
CREATE TYPE public.period_status AS ENUM ('pending', 'decisions_open', 'processing', 'completed');

-- Helper: current user id
CREATE OR REPLACE FUNCTION public.auth_uid() RETURNS uuid
  LANGUAGE sql STABLE
  AS $$ SELECT auth.uid() $$;

-- ============================================================
-- PROFILES — simulation configuration templates
-- ============================================================
CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  config      jsonb NOT NULL DEFAULT '{}',
  created_by  uuid NOT NULL REFERENCES auth.users(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professors can manage own profiles"
  ON public.profiles FOR ALL
  USING (created_by = auth_uid())
  WITH CHECK (created_by = auth_uid());

CREATE POLICY "Profiles readable by authenticated"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================
-- COURSES
-- ============================================================
CREATE TABLE public.courses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  professor_id  uuid NOT NULL REFERENCES auth.users(id),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professors manage own courses"
  ON public.courses FOR ALL
  USING (professor_id = auth_uid())
  WITH CHECK (professor_id = auth_uid());

CREATE POLICY "Participants read courses they belong to"
  ON public.courses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      JOIN public.teams t ON t.id = tm.team_id
      JOIN public.worlds w ON w.id = t.world_id
      WHERE w.course_id = courses.id
        AND tm.user_id = auth_uid()
    )
  );

-- ============================================================
-- WORLDS — each course has N worlds, each uses a profile
-- ============================================================
CREATE TABLE public.worlds (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id       uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  profile_id      uuid NOT NULL REFERENCES public.profiles(id),
  name            text NOT NULL,
  current_period  integer NOT NULL DEFAULT 7,
  status          public.world_status NOT NULL DEFAULT 'setup',
  seed            integer NOT NULL DEFAULT floor(random() * 2147483647)::integer,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.worlds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professors manage worlds of own courses"
  ON public.worlds FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = worlds.course_id AND c.professor_id = auth_uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = worlds.course_id AND c.professor_id = auth_uid()
    )
  );

CREATE POLICY "Participants read own world"
  ON public.worlds FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      JOIN public.teams t ON t.id = tm.team_id
      WHERE t.world_id = worlds.id
        AND tm.user_id = auth_uid()
    )
  );

-- ============================================================
-- TEAMS
-- ============================================================
CREATE TABLE public.teams (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id    uuid NOT NULL REFERENCES public.worlds(id) ON DELETE CASCADE,
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (world_id, name)
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professors manage teams"
  ON public.teams FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.worlds w
      JOIN public.courses c ON c.id = w.course_id
      WHERE w.id = teams.world_id AND c.professor_id = auth_uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.worlds w
      JOIN public.courses c ON c.id = w.course_id
      WHERE w.id = teams.world_id AND c.professor_id = auth_uid()
    )
  );

CREATE POLICY "Participants read own team"
  ON public.teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = teams.id AND tm.user_id = auth_uid()
    )
  );

-- ============================================================
-- TEAM_MEMBERS — links auth.users to teams
-- ============================================================
CREATE TABLE public.team_members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id       uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES auth.users(id),
  role_in_team  text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professors manage team members"
  ON public.team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.worlds w ON w.id = t.world_id
      JOIN public.courses c ON c.id = w.course_id
      WHERE t.id = team_members.team_id AND c.professor_id = auth_uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.worlds w ON w.id = t.world_id
      JOIN public.courses c ON c.id = w.course_id
      WHERE t.id = team_members.team_id AND c.professor_id = auth_uid()
    )
  );

CREATE POLICY "Members read own membership"
  ON public.team_members FOR SELECT
  USING (user_id = auth_uid());

CREATE POLICY "Members update own role"
  ON public.team_members FOR UPDATE
  USING (user_id = auth_uid())
  WITH CHECK (user_id = auth_uid());

-- ============================================================
-- PERIODS
-- ============================================================
CREATE TABLE public.periods (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id        uuid NOT NULL REFERENCES public.worlds(id) ON DELETE CASCADE,
  period_number   integer NOT NULL,
  status          public.period_status NOT NULL DEFAULT 'pending',
  deadline        timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (world_id, period_number)
);

ALTER TABLE public.periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professors manage periods"
  ON public.periods FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.worlds w
      JOIN public.courses c ON c.id = w.course_id
      WHERE w.id = periods.world_id AND c.professor_id = auth_uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.worlds w
      JOIN public.courses c ON c.id = w.course_id
      WHERE w.id = periods.world_id AND c.professor_id = auth_uid()
    )
  );

CREATE POLICY "Participants read own world periods"
  ON public.periods FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      JOIN public.teams t ON t.id = tm.team_id
      WHERE t.world_id = periods.world_id AND tm.user_id = auth_uid()
    )
  );

-- ============================================================
-- DECISIONS — JSONB per team per period
-- ============================================================
CREATE TABLE public.decisions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id     uuid NOT NULL REFERENCES public.periods(id) ON DELETE CASCADE,
  team_id       uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  data          jsonb NOT NULL DEFAULT '{}',
  submitted_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (period_id, team_id)
);

ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professors read all decisions in own courses"
  ON public.decisions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.periods p
      JOIN public.worlds w ON w.id = p.world_id
      JOIN public.courses c ON c.id = w.course_id
      WHERE p.id = decisions.period_id AND c.professor_id = auth_uid()
    )
  );

CREATE POLICY "Team members manage own decisions"
  ON public.decisions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = decisions.team_id AND tm.user_id = auth_uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = decisions.team_id AND tm.user_id = auth_uid()
    )
  );

-- ============================================================
-- SIMULATION_RESULTS — output per team per period
-- ============================================================
CREATE TABLE public.simulation_results (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id       uuid NOT NULL REFERENCES public.periods(id) ON DELETE CASCADE,
  team_id         uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  state_snapshot  jsonb NOT NULL DEFAULT '{}',
  report          jsonb NOT NULL DEFAULT '{}',
  trace           jsonb NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (period_id, team_id)
);

ALTER TABLE public.simulation_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professors read all results in own courses"
  ON public.simulation_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.periods p
      JOIN public.worlds w ON w.id = p.world_id
      JOIN public.courses c ON c.id = w.course_id
      WHERE p.id = simulation_results.period_id AND c.professor_id = auth_uid()
    )
  );

CREATE POLICY "Team members read own results only"
  ON public.simulation_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = simulation_results.team_id AND tm.user_id = auth_uid()
    )
  );

CREATE POLICY "Service role inserts results"
  ON public.simulation_results FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- SIMULATION_JOBS — pg-boss compatible queue
-- ============================================================
CREATE TABLE public.simulation_jobs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id    uuid NOT NULL REFERENCES public.worlds(id),
  period_id   uuid NOT NULL REFERENCES public.periods(id),
  seed        integer NOT NULL,
  status      text NOT NULL DEFAULT 'queued',
  created_at  timestamptz NOT NULL DEFAULT now(),
  started_at  timestamptz,
  completed_at timestamptz,
  error       text
);

ALTER TABLE public.simulation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professors read jobs in own courses"
  ON public.simulation_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.worlds w
      JOIN public.courses c ON c.id = w.course_id
      WHERE w.id = simulation_jobs.world_id AND c.professor_id = auth_uid()
    )
  );

-- ============================================================
-- Updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER worlds_updated_at BEFORE UPDATE ON public.worlds
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER decisions_updated_at BEFORE UPDATE ON public.decisions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_worlds_course ON public.worlds(course_id);
CREATE INDEX idx_teams_world ON public.teams(world_id);
CREATE INDEX idx_team_members_user ON public.team_members(user_id);
CREATE INDEX idx_team_members_team ON public.team_members(team_id);
CREATE INDEX idx_periods_world ON public.periods(world_id);
CREATE INDEX idx_decisions_period ON public.decisions(period_id);
CREATE INDEX idx_decisions_team ON public.decisions(team_id);
CREATE INDEX idx_results_period ON public.simulation_results(period_id);
CREATE INDEX idx_results_team ON public.simulation_results(team_id);
CREATE INDEX idx_jobs_world ON public.simulation_jobs(world_id);
