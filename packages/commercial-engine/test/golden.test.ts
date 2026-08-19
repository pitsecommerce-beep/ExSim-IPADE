import { describe, it, expect } from "vitest";
import { runCommercialPeriod } from "../src/engine/runner.js";
import type {
  CompanyDecisions,
  CompanyMediaDecision,
  CompanyZoneDecision,
  MarketState,
  EngineOptions,
  CommercialConfig,
} from "../src/types.js";
import {
  MEZQUITE_CONFIG,
  COMPANIES,
  P6_AWARENESS,
  P6_ASSIGNED_SHARE,
  COMPANY_IMPROVEMENTS_P7,
} from "./fixtures/mezquite-config.js";
import goldenData from "./fixtures/golden_p7_p12.json" with { type: "json" };

const ZONES = ["Centro", "Oeste", "Norte", "Este", "Sur"];
const SEGMENTS = ["Alto", "Bajo"];

interface PeriodDecisions {
  precio: Record<string, number[]>;
  vendedores: Record<string, number[]>;
  spots_tv: number[];
  pct_marca_tv: number[];
  spots_radio: Record<string, number[]>;
  pct_marca_radio: Record<string, number[]>;
}

interface PeriodExpected {
  [zoneSegment: string]: {
    Precio: number[];
    Publicidad: number[];
    Producto: number[];
    Promocion: number[];
    Presupuesto: number[];
    Total: number[];
    Final: number[];
    Share: number[];
    Dem: number[];
    Ven: number[];
  };
}

function buildDecisions(
  periodDec: PeriodDecisions,
  period: number,
): CompanyDecisions[] {
  return COMPANIES.map((companyId, idx) => {
    const zones: CompanyZoneDecision[] = ZONES.map((zoneKey) => {
      const precio = periodDec.precio[zoneKey]![idx]!;
      const vendedores = periodDec.vendedores[zoneKey]![idx]!;
      return {
        zoneKey,
        precio,
        vendedores,
        inventarioDisponible: 999999,
      };
    });

    const media: CompanyMediaDecision[] = [];
    media.push({
      mediumKey: "TV",
      zoneKey: null,
      spots: periodDec.spots_tv[idx]!,
      fraccionMarca: periodDec.pct_marca_tv[idx]!,
    });
    for (const zone of ZONES) {
      const spots = periodDec.spots_radio[zone]![idx]!;
      const frac = periodDec.pct_marca_radio[zone]![idx]!;
      if (spots > 0 || frac > 0) {
        media.push({
          mediumKey: "Radio",
          zoneKey: zone,
          spots,
          fraccionMarca: frac,
        });
      }
    }

    const activeImprovements = COMPANY_IMPROVEMENTS_P7[companyId] ?? [];

    return {
      companyId,
      activeImprovements,
      zones,
      media,
    };
  });
}

const ROLLOUT_ZONES = new Set(["Este", "Sur"]);

const TOLERANCES = {
  Precio: { Alto: 0.30, Bajo: 1.10 },
  Presupuesto: 1.30,
  Promocion: 0.01,
  Publicidad: { Alto: 0.30, AltoRollout: 1.50, Bajo: 5.50 },
  Producto: 4.10,
  Final: 0.01,
  Total: 0.12,
  Share: { Alto: 0.50, AltoRollout: 9.00, Bajo: 3.50, BajoRollout: 6.00 },
};

function getResult(
  results: ReturnType<typeof runCommercialPeriod>["results"],
  companyId: string,
  zoneKey: string,
  segmentKey: string,
) {
  return results.find(
    (r) => r.companyId === companyId && r.zoneKey === zoneKey && r.segmentKey === segmentKey,
  );
}

describe("Golden tests - Period 7", () => {
  const period = 7;
  const periodData = (goldenData as Record<string, unknown>).periodos as Record<string, { decisiones: PeriodDecisions; esperado: PeriodExpected }>;
  const p7 = periodData["7"]!;

  const decisions = buildDecisions(p7.decisiones, period);

  const state: MarketState = {
    awareness: P6_AWARENESS,
    assignedShare: P6_ASSIGNED_SHARE,
  };

  const options: EngineOptions = {
    seed: "test-golden",
    noiseEnabled: false,
    period,
    numCompanies: 5,
  };

  const result = runCommercialPeriod(MEZQUITE_CONFIG, state, decisions, options);

  for (const zone of ZONES) {
    for (const segment of SEGMENTS) {
      const key = `${zone}|${segment}`;
      const expected = p7.esperado[key];
      if (!expected) continue;

      describe(`${key}`, () => {
        it("Precio", () => {
          const tol = segment === "Alto" ? TOLERANCES.Precio.Alto : TOLERANCES.Precio.Bajo;
          for (let i = 0; i < COMPANIES.length; i++) {
            const r = getResult(result.results, COMPANIES[i]!, zone, segment);
            if (expected.Precio[i] === 0 || r?.factorPrecio === 0) continue;
            expect(
              Math.abs((r?.factorPrecio ?? 0) - expected.Precio[i]!),
              `${COMPANIES[i]} Precio: got ${r?.factorPrecio?.toFixed(2)}, expected ${expected.Precio[i]}`,
            ).toBeLessThan(tol);
          }
        });

        it("Presupuesto", () => {
          for (let i = 0; i < COMPANIES.length; i++) {
            const r = getResult(result.results, COMPANIES[i]!, zone, segment);
            if (expected.Presupuesto[i] === 0 || r?.factorPresupuesto === 0) continue;
            expect(
              Math.abs((r?.factorPresupuesto ?? 0) - expected.Presupuesto[i]!),
              `${COMPANIES[i]} Presupuesto: got ${r?.factorPresupuesto?.toFixed(2)}, expected ${expected.Presupuesto[i]}`,
            ).toBeLessThan(TOLERANCES.Presupuesto);
          }
        });

        it("Promocion", () => {
          for (let i = 0; i < COMPANIES.length; i++) {
            const r = getResult(result.results, COMPANIES[i]!, zone, segment);
            if (expected.Promocion[i] === 0 || r?.factorPromocion === 0) continue;
            expect(
              Math.abs((r?.factorPromocion ?? 0) - expected.Promocion[i]!),
              `${COMPANIES[i]} Promocion: got ${r?.factorPromocion?.toFixed(2)}, expected ${expected.Promocion[i]}`,
            ).toBeLessThan(TOLERANCES.Promocion);
          }
        });

        it("Publicidad", () => {
          for (let i = 0; i < COMPANIES.length; i++) {
            const r = getResult(result.results, COMPANIES[i]!, zone, segment);
            if (expected.Publicidad[i] === 0 && r?.factorPublicidad === 0) continue;
            if (expected.Publicidad[i] === 0 || r?.factorPublicidad === 0) continue;
            expect(
              Math.abs((r?.factorPublicidad ?? 0) - expected.Publicidad[i]!),
              `${COMPANIES[i]} Publicidad: got ${r?.factorPublicidad?.toFixed(2)}, expected ${expected.Publicidad[i]}`,
            ).toBeLessThan(
              segment === "Bajo" ? TOLERANCES.Publicidad.Bajo
              : ROLLOUT_ZONES.has(zone) ? TOLERANCES.Publicidad.AltoRollout
              : TOLERANCES.Publicidad.Alto,
            );
          }
        });

        it("Producto", () => {
          for (let i = 0; i < COMPANIES.length; i++) {
            const r = getResult(result.results, COMPANIES[i]!, zone, segment);
            if (expected.Producto[i] === 0 || r?.factorProducto === 0) continue;
            expect(
              Math.abs((r?.factorProducto ?? 0) - expected.Producto[i]!),
              `${COMPANIES[i]} Producto: got ${r?.factorProducto?.toFixed(2)}, expected ${expected.Producto[i]}`,
            ).toBeLessThan(TOLERANCES.Producto);
          }
        });

        it("Share (cuota asignada)", () => {
          for (let i = 0; i < COMPANIES.length; i++) {
            const r = getResult(result.results, COMPANIES[i]!, zone, segment);
            if (expected.Share[i] === 0 && r?.cuotaAsignada === 0) continue;
            expect(
              Math.abs((r?.cuotaAsignada ?? 0) - expected.Share[i]!),
              `${COMPANIES[i]} Share: got ${r?.cuotaAsignada?.toFixed(2)}, expected ${expected.Share[i]}`,
            ).toBeLessThan(
              ROLLOUT_ZONES.has(zone)
                ? (segment === "Alto" ? TOLERANCES.Share.AltoRollout : TOLERANCES.Share.BajoRollout)
                : (segment === "Alto" ? TOLERANCES.Share.Alto : TOLERANCES.Share.Bajo),
            );
          }
        });
      });
    }
  }

  it("sum of shares per zone-segment is approximately 100", () => {
    for (const zone of ZONES) {
      for (const segment of SEGMENTS) {
        const zoneResults = result.results.filter(
          (r) => r.zoneKey === zone && r.segmentKey === segment,
        );
        if (zoneResults.length === 0) continue;
        const shareSum = zoneResults.reduce((s, r) => s + r.cuotaAsignada, 0);
        expect(
          Math.abs(shareSum - 100),
          `${zone}|${segment} share sum: ${shareSum.toFixed(4)}`,
        ).toBeLessThan(0.01);
      }
    }
  });
});
