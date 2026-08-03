import type {
  SimulationInput,
  SimulationOutput,
  SimulationTrace,
  TraceStep,
} from "./types.js";
import { SeededRandom } from "./random.js";

export function simulatePeriod(input: SimulationInput): SimulationOutput {
  const rng = new SeededRandom(input.seed);
  const trace: TraceStep[] = [];

  function addTrace(phase: string, label: string, inputs: Record<string, unknown>, outputs: Record<string, unknown>) {
    trace.push({ phase, label, inputs, outputs });
  }

  addTrace("init", "Simulation started", {
    period: input.state.periodNumber,
    teamCount: input.decisions.length,
    seed: input.seed,
  }, {});

  // Phase 0 scaffold: return unchanged state with empty reports
  // Each phase will be implemented as the engine grows:
  // 1. Production (consume materials, use machines/workers, produce units)
  // 2. Marketing (calculate knowledge, media reach, brand equity)
  // 3. Demand (apply functional forms, allocate market share)
  // 4. Finance (revenue, costs, interest, taxes, cash flow)
  // 5. HR (satisfaction, FPR, hiring/firing)
  // 6. Logistics (transport, warehouse)
  // 7. ESG (emissions, offsets, score)
  // 8. Reports (income statement, balance sheet)

  addTrace("complete", "Simulation completed (scaffold)", {}, {
    rngState: rng.next(),
  });

  const simulationTrace: SimulationTrace = { steps: trace };

  return {
    nextState: {
      ...input.state,
      periodNumber: input.state.periodNumber + 1,
    },
    reports: input.decisions.map((d) => ({
      teamId: d.teamId,
      incomeStatement: {},
      balanceSheet: {},
      marketShareReport: {
        assignedShare: {},
        salesShare: {},
        faltante: {},
        atributos: {},
      },
      esgScore: 0,
      fpr: 1,
    })),
    trace: simulationTrace,
  };
}
