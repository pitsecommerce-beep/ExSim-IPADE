import PgBoss from "pg-boss";
import { createClient } from "@supabase/supabase-js";
import { simulatePeriod } from "@exsim/engine";
import type { SimulationInput, PeriodReport } from "@exsim/engine";

const DATABASE_URL = process.env["DATABASE_URL"];
const SUPABASE_URL = process.env["SUPABASE_URL"];
const SUPABASE_SERVICE_ROLE_KEY = process.env["SUPABASE_SERVICE_ROLE_KEY"];

if (!DATABASE_URL || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing required environment variables: DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const boss = new PgBoss(DATABASE_URL);

interface SimulationJobData {
  worldId: string;
  periodId: string;
  seed: number;
}

async function handleSimulationJob(jobs: PgBoss.Job<SimulationJobData>[]): Promise<void> {
  const job = jobs[0]!;
  const { worldId, periodId, seed } = job.data;
  console.log(`Processing simulation: world=${worldId} period=${periodId}`);

  const { data: world, error: worldError } = await supabase
    .from("worlds")
    .select("*, profiles(*)")
    .eq("id", worldId)
    .single();

  if (worldError || !world) {
    throw new Error(`Failed to load world ${worldId}: ${worldError?.message}`);
  }

  const { data: decisions, error: decisionsError } = await supabase
    .from("decisions")
    .select("*")
    .eq("period_id", periodId);

  if (decisionsError) {
    throw new Error(`Failed to load decisions for period ${periodId}: ${decisionsError.message}`);
  }

  const { data: previousResult } = await supabase
    .from("simulation_results")
    .select("state_snapshot")
    .eq("period_id", periodId)
    .limit(1)
    .maybeSingle();

  // TODO: Build full SimulationInput from DB data
  // This is the scaffold — will be fleshed out when engine phases are implemented
  const input: SimulationInput = {
    profile: world.profiles?.config as unknown as SimulationInput["profile"],
    state: (previousResult?.state_snapshot ?? { periodNumber: world.current_period, teams: {} }) as unknown as SimulationInput["state"],
    decisions: decisions.map((d) => ({
      teamId: d.team_id,
      ...d.data,
    })) as unknown as SimulationInput["decisions"],
    seed,
  };

  const output = simulatePeriod(input);

  const results = output.reports.map((report: PeriodReport) => ({
    period_id: periodId,
    team_id: report.teamId,
    state_snapshot: output.nextState,
    report,
    trace: output.trace,
  }));

  const { error: insertError } = await supabase
    .from("simulation_results")
    .insert(results);

  if (insertError) {
    throw new Error(`Failed to save results: ${insertError.message}`);
  }

  await supabase
    .from("worlds")
    .update({ current_period: output.nextState.periodNumber })
    .eq("id", worldId);

  await supabase
    .from("periods")
    .update({ status: "completed" })
    .eq("id", periodId);

  console.log(`Simulation complete: world=${worldId} period=${periodId}`);
}

async function main() {
  await boss.start();
  console.log("Worker started, listening for simulation jobs...");

  await boss.work<SimulationJobData>("simulate-period", handleSimulationJob);
}

main().catch((err) => {
  console.error("Worker fatal error:", err);
  process.exit(1);
});
