import type {
  CommercialConfig,
  MarketState,
  CompanyDecisions,
  EngineOptions,
  CommercialPeriodResult,
  CompanyZoneSegmentResult,
  CoefficientConfig,
} from "../types.js";
import { computeAvailableDemand } from "./demand.js";
import { computeAveragePrice, computePriceFactor } from "./price.js";
import { computeBudgetFactor } from "./budget.js";
import { computePromotionFactor } from "./promotion.js";
import { computeAwarenessContribution, updateAwareness } from "./advertising.js";
import { computeProductFactor } from "./product.js";
import { computeTotalIndex } from "./aggregate.js";
import { computeFinalIndex, computeRawShare, computeAssignedShare } from "./share.js";
import { computeSalesForZone } from "./sales.js";
import { mulberry32, hashSeed, generateNoise } from "./noise.js";

function getCoeff(
  coefficients: ReadonlyArray<CoefficientConfig>,
  key: string,
  segmentKey?: string | null,
  mediumKey?: string | null,
): number {
  const match = coefficients.find(
    (c) =>
      c.key === key &&
      (segmentKey === undefined ? true : c.segmentKey === (segmentKey ?? null)) &&
      (mediumKey === undefined ? true : c.mediumKey === (mediumKey ?? null)),
  );
  if (match === undefined) {
    throw new Error(
      `Missing coefficient: key=${key}, segment=${segmentKey ?? "null"}, medium=${mediumKey ?? "null"}`,
    );
  }
  return match.value;
}

function resolvePhaseForZone(
  config: CommercialConfig,
  zoneKey: string,
  period: number,
): string {
  const entries = config.zonePhaseSchedule
    .filter((e) => e.zoneKey === zoneKey)
    .sort((a, b) => a.periodFrom - b.periodFrom);

  let resolved: string | undefined;
  for (const entry of entries) {
    if (period >= entry.periodFrom && (entry.periodTo === null || period <= entry.periodTo)) {
      resolved = entry.phaseKey;
    }
  }

  if (resolved === undefined) {
    throw new Error(`No phase scheduled for zone=${zoneKey}, period=${period}`);
  }
  return resolved;
}

function getActiveZones(config: CommercialConfig, period: number): ReadonlyArray<string> {
  const zoneKeys = new Set<string>();
  for (const d of config.demand) {
    if (d.period === period && d.cantidad > 0) {
      zoneKeys.add(d.zoneKey);
    }
  }
  return [...zoneKeys];
}

function getActiveSegments(config: CommercialConfig): ReadonlyArray<string> {
  return config.segments.map((s) => s.key);
}

export function runCommercialPeriod(
  config: CommercialConfig,
  state: MarketState,
  decisions: ReadonlyArray<CompanyDecisions>,
  options: EngineOptions,
): CommercialPeriodResult {
  const results: CompanyZoneSegmentResult[] = [];
  const newAwareness: Record<string, Record<string, Record<string, number>>> = {};
  const newAssignedShare: Record<string, Record<string, Record<string, number>>> = {};

  const activeZones = getActiveZones(config, options.period);
  const segmentKeys = getActiveSegments(config);

  const beta = getCoeff(config.coefficients, "producto_beta");
  const theta = getCoeff(config.coefficients, "publicidad_theta");
  const presupuestoA = getCoeff(config.coefficients, "presupuesto_a");
  const presupuestoN = getCoeff(config.coefficients, "presupuesto_n");

  const activeChannels = config.channels.filter((ch) => ch.active);

  for (const zoneKey of activeZones) {
    const phaseKey = resolvePhaseForZone(config, zoneKey, options.period);
    const phase = config.phases.find((p) => p.key === phaseKey);
    if (!phase) throw new Error(`Phase config not found: ${phaseKey}`);

    const companiesInZone = decisions.filter((d) =>
      d.zones.some((z) => z.zoneKey === zoneKey && z.precio > 0),
    );

    const pricesInZone = companiesInZone.map((d) => {
      const zd = d.zones.find((z) => z.zoneKey === zoneKey)!;
      return zd.precio;
    });
    const avgPrice = computeAveragePrice(pricesInZone);

    for (const segmentKey of segmentKeys) {
      const segment = config.segments.find((s) => s.key === segmentKey);
      if (!segment) throw new Error(`Segment config not found: ${segmentKey}`);

      const segPhase = config.segmentPhases.find(
        (sp) => sp.segmentKey === segmentKey && sp.phaseKey === phaseKey,
      );
      if (!segPhase) throw new Error(`Segment-phase config not found: ${segmentKey}/${phaseKey}`);

      const demandRow = config.demand.find(
        (d) => d.period === options.period && d.zoneKey === zoneKey && d.segmentKey === segmentKey,
      );
      if (!demandRow) continue;
      if (demandRow.cantidad === 0) continue;

      const demandaDisponible = computeAvailableDemand(
        demandRow.cantidad,
        config.comercialParams.dopaje_base100,
        options.numCompanies,
      );

      const hasHistory = decisions.some((d) => {
        const prev = state.assignedShare[d.companyId]?.[zoneKey]?.[segmentKey];
        return prev !== undefined;
      });

      const companyResults: Array<{
        companyId: string;
        factors: { precio: number; presupuesto: number; promocion: number; publicidad: number; producto: number };
        total: number;
        inventario: number;
      }> = [];

      for (const company of decisions) {
        const zoneDec = company.zones.find((z) => z.zoneKey === zoneKey);

        if (!zoneDec || zoneDec.precio === 0) {
          const prevAwareness = state.awareness[company.companyId]?.[zoneKey]?.[segmentKey] ?? 0;
          setNested(newAwareness, company.companyId, zoneKey, segmentKey, prevAwareness);

          companyResults.push({
            companyId: company.companyId,
            factors: { precio: 0, presupuesto: 0, promocion: 0, publicidad: 0, producto: 0 },
            total: 0,
            inventario: 0,
          });
          continue;
        }

        const factorPrecio = computePriceFactor(zoneDec.precio, avgPrice, segment.kappa_precio, config.flags.clamp_price_factor);

        const factorPresupuesto = computeBudgetFactor(
          zoneDec.precio,
          demandRow.limite_precio,
          presupuestoA,
          presupuestoN,
        );

        let factorPromocion = 0;
        for (const channel of activeChannels) {
          const cz = config.channelZones.find(
            (c) => c.channelKey === channel.key && c.zoneKey === zoneKey && c.active,
          );
          if (!cz) continue;
          factorPromocion += computePromotionFactor(
            zoneDec.vendedores,
            cz.distribuidores,
            channel.alfa,
            channel.kappa,
          );
        }

        const prevAwareness = state.awareness[company.companyId]?.[zoneKey]?.[segmentKey] ?? 0;
        const contribution = computeAwarenessContribution(
          config.media,
          config.mediaSegments,
          company.media,
          segmentKey,
          zoneKey,
          theta,
        );
        const factorPublicidad = updateAwareness(
          prevAwareness,
          phase.rotacion_conocimiento,
          contribution,
        );
        setNested(newAwareness, company.companyId, zoneKey, segmentKey, factorPublicidad);

        const factorProducto = computeProductFactor(
          config.dimensions,
          company.activeImprovements,
          config.improvements,
          config.segmentDimensionPhases,
          segmentKey,
          phaseKey,
          beta,
        );

        let noise = 1;
        if (options.noiseEnabled && config.flags.ruido_activo) {
          const seedNum = hashSeed([options.seed, String(options.period), zoneKey, segmentKey, company.companyId]);
          const rng = mulberry32(seedNum);
          noise = generateNoise(rng, phase.error_base);
        }

        const total = computeTotalIndex(
          {
            precio: factorPrecio,
            presupuesto: factorPresupuesto,
            promocion: factorPromocion,
            publicidad: factorPublicidad,
            producto: factorProducto,
          },
          segment,
          phase,
          config.comercialParams.escala_global,
          config.flags,
          noise,
        );

        companyResults.push({
          companyId: company.companyId,
          factors: {
            precio: factorPrecio,
            presupuesto: factorPresupuesto,
            promocion: factorPromocion,
            publicidad: factorPublicidad,
            producto: factorProducto,
          },
          total,
          inventario: zoneDec.inventarioDisponible,
        });
      }

      const totalEntries = companyResults.map((cr) => ({
        companyId: cr.companyId,
        total: cr.total,
      }));
      const finals = computeFinalIndex(totalEntries, options.numCompanies);
      const rawShares = computeRawShare(finals, options.numCompanies);

      const segDemands: Array<{ companyId: string; segmentKey: string; demandaGenerada: number; inventario: number }> = [];

      for (const cr of companyResults) {
        const finalVal = finals.find((f) => f.companyId === cr.companyId)?.final ?? 0;
        const rawShare = rawShares.find((s) => s.companyId === cr.companyId)?.share ?? 0;

        const prevShare = hasHistory
          ? state.assignedShare[cr.companyId]?.[zoneKey]?.[segmentKey]
          : undefined;

        const cuotaAsignada = cr.total > 0
          ? computeAssignedShare(rawShare, prevShare, segPhase.loyalty)
          : 0;

        setNested(newAssignedShare, cr.companyId, zoneKey, segmentKey, cuotaAsignada);

        const demandaGenerada = cuotaAsignada * demandaDisponible;

        segDemands.push({
          companyId: cr.companyId,
          segmentKey,
          demandaGenerada,
          inventario: cr.inventario,
        });

        results.push({
          companyId: cr.companyId,
          zoneKey,
          segmentKey,
          phaseKey,
          factorPrecio: cr.factors.precio,
          factorPresupuesto: cr.factors.presupuesto,
          factorPromocion: cr.factors.promocion,
          factorPublicidad: cr.factors.publicidad,
          factorProducto: cr.factors.producto,
          indiceTotal: cr.total,
          indiceFinal: finalVal,
          cuotaBruta: rawShare,
          cuotaAsignada,
          demandaDisponible,
          demandaGenerada,
          ventas: 0,
          ventasPerdidas: 0,
        });
      }
    }

    for (const company of decisions) {
      const zoneDec = company.zones.find((z) => z.zoneKey === zoneKey);
      const inventario = zoneDec?.inventarioDisponible ?? 0;

      const companySegDemands = results
        .filter((r) => r.companyId === company.companyId && r.zoneKey === zoneKey)
        .map((r) => ({ segmentKey: r.segmentKey, demandaGenerada: r.demandaGenerada }));

      const salesResults = computeSalesForZone(companySegDemands, inventario);

      for (const sr of salesResults) {
        const idx = results.findIndex(
          (r) => r.companyId === company.companyId && r.zoneKey === zoneKey && r.segmentKey === sr.segmentKey,
        );
        if (idx >= 0) {
          (results[idx] as { ventas: number; ventasPerdidas: number }).ventas = sr.ventas;
          (results[idx] as { ventas: number; ventasPerdidas: number }).ventasPerdidas = sr.ventasPerdidas;
        }
      }
    }
  }

  return { results, newAwareness, newAssignedShare };
}

function setNested(
  obj: Record<string, Record<string, Record<string, number>>>,
  a: string,
  b: string,
  c: string,
  value: number,
): void {
  if (!obj[a]) obj[a] = {};
  if (!obj[a]![b]) obj[a]![b] = {};
  obj[a]![b]![c] = value;
}
