import { NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";
import { runCommercialPeriod } from "@exsim/commercial-engine";
import type {
  CommercialConfig,
  CompanyDecisions,
  MarketState,
  EngineOptions,
} from "@exsim/commercial-engine";
import type { WorldData, DecisionData } from "@/lib/storage/types";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const storage = getStorage();
  const world = await storage.getWorld(id);

  if (!world) {
    return NextResponse.json({ error: "Mundo no encontrado" }, { status: 404 });
  }

  const periodoActual = world.periodos.find((p) => p.periodo === world.currentPeriod);
  if (!periodoActual) {
    return NextResponse.json(
      { error: `No hay decisiones capturadas para el periodo ${world.currentPeriod}` },
      { status: 400 },
    );
  }

  const periodoAnterior = world.periodos.find((p) => p.periodo === world.currentPeriod - 1);

  const config = buildCommercialConfig(world);
  const decisions = buildDecisions(world, periodoActual.decisiones);
  const state = buildMarketState(periodoAnterior);
  const options: EngineOptions = {
    seed: `world-${world.id}-period-${world.currentPeriod}`,
    noiseEnabled: true,
    period: world.currentPeriod,
    numCompanies: world.empresas.length,
  };

  const output = runCommercialPeriod(config, state, decisions, options);

  const conocimientoNuevo: Record<string, Record<string, { alto: number; bajo: number }>> = {};
  const cuotaAsignadaNueva: Record<string, Record<string, { alto: number; bajo: number }>> = {};

  for (const r of output.results) {
    if (!conocimientoNuevo[r.companyId]) conocimientoNuevo[r.companyId] = {};
    if (!conocimientoNuevo[r.companyId]![r.zoneKey]) {
      conocimientoNuevo[r.companyId]![r.zoneKey] = { alto: 0, bajo: 0 };
    }
    const seg = r.segmentKey === "Alto" ? "alto" : "bajo";
    conocimientoNuevo[r.companyId]![r.zoneKey]![seg] = r.factorPublicidad;

    if (!cuotaAsignadaNueva[r.companyId]) cuotaAsignadaNueva[r.companyId] = {};
    if (!cuotaAsignadaNueva[r.companyId]![r.zoneKey]) {
      cuotaAsignadaNueva[r.companyId]![r.zoneKey] = { alto: 0, bajo: 0 };
    }
    cuotaAsignadaNueva[r.companyId]![r.zoneKey]![seg] = r.cuotaAsignada;
  }

  periodoActual.resultados = output.results;
  periodoActual.conocimiento = conocimientoNuevo;
  periodoActual.cuotaAsignada = cuotaAsignadaNueva;
  world.currentPeriod += 1;

  await storage.saveWorld(world);

  return NextResponse.json({
    periodo: periodoActual.periodo,
    resultados: output.results,
    siguientePeriodo: world.currentPeriod,
  });
}

const PHASE_MAP: Record<string, string> = {
  rollout: "1.Roll-out",
  growth: "2.Growth",
  maturity: "3.Maturity",
  hypermaturity: "4.Hypermaturity",
};

function buildCommercialConfig(world: WorldData): CommercialConfig {
  return {
    comercialParams: {
      dopaje_base100: 105,
      escala_global: 0.25,
      actualizacion_instantanea: true,
    },
    segments: [
      {
        key: "Alto",
        w_precio: 0.5,
        w_producto: 2.0,
        w_canales: 1.0,
        w_publicidad: 2.0,
        w_generico: 1.0,
        w_caracteristicas_marca: 1.0,
        kappa_precio: world.config.kappaPrecioAlto,
        correccion_utilidad: 1.0,
      },
      {
        key: "Bajo",
        w_precio: 2.0,
        w_producto: 1.4,
        w_canales: 1.0,
        w_publicidad: 1.8,
        w_generico: 1.0,
        w_caracteristicas_marca: 1.0,
        kappa_precio: world.config.kappaPrecioBajo,
        correccion_utilidad: 1.7,
      },
    ],
    phases: [
      {
        key: "1.Roll-out",
        mult_precio: 1.12,
        mult_producto: 1,
        mult_canales: 0.25,
        mult_publicidad: 2.20,
        mult_generico: 3.00,
        mult_caracteristicas_marca: 1,
        mult_correccion_utilidad: 1,
        rotacion_conocimiento: 0.45,
        adquisicion_conocimiento: 0.55,
        error_base: 10,
      },
      {
        key: "2.Growth",
        mult_precio: 1.40,
        mult_producto: 1,
        mult_canales: 0.225,
        mult_publicidad: 1.80,
        mult_generico: 2.00,
        mult_caracteristicas_marca: 1,
        mult_correccion_utilidad: 1,
        rotacion_conocimiento: 0.30,
        adquisicion_conocimiento: 0.45,
        error_base: 10,
      },
      {
        key: "3.Maturity",
        mult_precio: 1.50,
        mult_producto: 1,
        mult_canales: 0.16,
        mult_publicidad: 1.10,
        mult_generico: 0.85,
        mult_caracteristicas_marca: 1,
        mult_correccion_utilidad: 1,
        rotacion_conocimiento: 0.20,
        adquisicion_conocimiento: 0.35,
        error_base: 10,
      },
      {
        key: "4.Hypermaturity",
        mult_precio: 1.80,
        mult_producto: 1,
        mult_canales: 0.08,
        mult_publicidad: 0.70,
        mult_generico: 0.40,
        mult_caracteristicas_marca: 1,
        mult_correccion_utilidad: 1,
        rotacion_conocimiento: 0.15,
        adquisicion_conocimiento: 0.30,
        error_base: 10,
      },
    ],
    segmentPhases: [
      { segmentKey: "Alto", phaseKey: "1.Roll-out", loyalty: 0.25, umbral: 0, compra_espontanea: 0 },
      { segmentKey: "Alto", phaseKey: "2.Growth", loyalty: 0.50, umbral: 10, compra_espontanea: 0 },
      { segmentKey: "Alto", phaseKey: "3.Maturity", loyalty: 0.60, umbral: 55, compra_espontanea: 0 },
      { segmentKey: "Alto", phaseKey: "4.Hypermaturity", loyalty: 0.70, umbral: 60, compra_espontanea: 0 },
      { segmentKey: "Bajo", phaseKey: "1.Roll-out", loyalty: 0.25, umbral: 0, compra_espontanea: 0 },
      { segmentKey: "Bajo", phaseKey: "2.Growth", loyalty: 0.25, umbral: 10, compra_espontanea: 0 },
      { segmentKey: "Bajo", phaseKey: "3.Maturity", loyalty: 0.40, umbral: 40, compra_espontanea: 0 },
      { segmentKey: "Bajo", phaseKey: "4.Hypermaturity", loyalty: 0.50, umbral: 50, compra_espontanea: 0 },
    ],
    dimensions: [
      { key: "sostenibilidad", name: "Eco-friendliness" },
      { key: "conveniencia", name: "Convenience" },
      { key: "rendimiento", name: "Performance" },
      { key: "funcionalidades_extra", name: "Extra features" },
      { key: "eficiencia", name: "Efficiency" },
    ],
    segmentDimensionPhases: [],
    channels: [
      { key: "distribuidores", tipo: "fisico", alfa: world.config.canalAlfa, kappa: world.config.canalKappa, active: true },
    ],
    channelZones: world.zonas.map((z) => ({
      channelKey: "distribuidores",
      zoneKey: z.id,
      distribuidores: z.distribuidores,
      active: true,
    })),
    media: [
      { key: "TV", alcance: "global" as const, costo_spot: 1000, active: true },
      { key: "Radio", alcance: "local" as const, costo_spot: 200, active: true },
    ],
    mediaSegments: [
      { mediumKey: "TV", segmentKey: "Alto", impacto_generico: 1, impacto_branding: 1, reach_m: 29.2, reach_lambda: 26.5, reach_k: 1.87 },
      { mediumKey: "TV", segmentKey: "Bajo", impacto_generico: 1, impacto_branding: 1, reach_m: null, reach_lambda: null, reach_k: null },
      { mediumKey: "Radio", segmentKey: "Alto", impacto_generico: 1, impacto_branding: 1, reach_m: 20.0, reach_lambda: 53.8, reach_k: 1.73 },
      { mediumKey: "Radio", segmentKey: "Bajo", impacto_generico: 1, impacto_branding: 1, reach_m: null, reach_lambda: null, reach_k: null },
    ],
    improvements: [],
    demand: world.zonas.flatMap((z) => [
      {
        period: world.currentPeriod,
        zoneKey: z.id,
        segmentKey: "Alto",
        cantidad: z.demandaAlto,
        limite_precio: z.limitePrecioAlto,
        tipo_precio: "promedio",
        precio_referencia: 0,
      },
      {
        period: world.currentPeriod,
        zoneKey: z.id,
        segmentKey: "Bajo",
        cantidad: z.demandaBajo,
        limite_precio: z.limitePrecioBajo,
        tipo_precio: "promedio",
        precio_referencia: 0,
      },
    ]),
    coefficients: [
      { key: "presupuesto_a", segmentKey: null, mediumKey: null, value: 0.7005 },
      { key: "presupuesto_n", segmentKey: null, mediumKey: null, value: 15 },
      { key: "producto_beta", segmentKey: null, mediumKey: null, value: 0.078 },
      { key: "publicidad_theta", segmentKey: null, mediumKey: null, value: 0.375 },
    ],
    flags: {
      ruido_activo: true,
      aplicar_mult_seg_fase_precio: false,
      aplicar_mult_seg_fase_producto: false,
      aplicar_mult_seg_fase_publicidad: true,
      aplicar_mult_seg_fase_canales: true,
      aplicar_mult_seg_fase_presupuesto: false,
      umbral_activo: false,
      actualizacion_instantanea: true,
      clamp_price_factor: true,
      zero_factor_kills_total: false,
    },
    zonePhaseSchedule: world.zonas.map((z) => ({
      zoneKey: z.id,
      phaseKey: PHASE_MAP[z.fase] ?? "2.Growth",
      periodFrom: 1,
      periodTo: null,
    })),
  };
}

function buildDecisions(world: WorldData, decisiones: DecisionData[]): CompanyDecisions[] {
  const byCompany = new Map<string, DecisionData[]>();
  for (const d of decisiones) {
    if (!byCompany.has(d.empresaId)) byCompany.set(d.empresaId, []);
    byCompany.get(d.empresaId)!.push(d);
  }

  return world.empresas.map((emp) => {
    const empDecs = byCompany.get(emp.id) ?? [];
    const first = empDecs[0];

    return {
      companyId: emp.id,
      activeImprovements: first?.mejorasActivas ?? [],
      zones: world.zonas.map((z) => {
        const dec = empDecs.find((d) => d.zonaId === z.id);
        return {
          zoneKey: z.id,
          precio: dec?.precio ?? 0,
          vendedores: dec?.vendedores ?? 0,
          inventarioDisponible: dec?.productoTerminado ?? 999999,
        };
      }),
      media: [
        {
          mediumKey: "TV",
          zoneKey: null,
          spots: first?.spotsTV ?? 0,
          fraccionMarca: first?.enfoqueMarcaTV ?? 0.5,
        },
        ...world.zonas.map((z) => {
          const dec = empDecs.find((d) => d.zonaId === z.id);
          return {
            mediumKey: "Radio",
            zoneKey: z.id,
            spots: dec?.spotsRadio ?? 0,
            fraccionMarca: dec?.enfoqueMarcaRadio ?? 0.5,
          };
        }),
      ],
    };
  });
}

function buildMarketState(
  periodoAnterior?: WorldData["periodos"][number],
): MarketState {
  const awareness: Record<string, Record<string, Record<string, number>>> = {};
  const assignedShare: Record<string, Record<string, Record<string, number>>> = {};

  if (periodoAnterior) {
    for (const [empId, zones] of Object.entries(periodoAnterior.conocimiento ?? {})) {
      awareness[empId] = {};
      for (const [zoneId, segs] of Object.entries(zones)) {
        awareness[empId]![zoneId] = {
          Alto: segs.alto,
          Bajo: segs.bajo,
        };
      }
    }
    for (const [empId, zones] of Object.entries(periodoAnterior.cuotaAsignada ?? {})) {
      assignedShare[empId] = {};
      for (const [zoneId, segs] of Object.entries(zones)) {
        assignedShare[empId]![zoneId] = {
          Alto: segs.alto,
          Bajo: segs.bajo,
        };
      }
    }
  }

  return { awareness, assignedShare };
}
