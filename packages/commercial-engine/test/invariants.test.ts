import { describe, it, expect } from "vitest";
import { computePriceFactor, computeAveragePrice } from "../src/engine/price.js";
import { computePromotionFactor } from "../src/engine/promotion.js";
import { computeTotalIndex } from "../src/engine/aggregate.js";
import { computeFinalIndex, computeRawShare, computeAssignedShare } from "../src/engine/share.js";
import { computeProductFactor } from "../src/engine/product.js";
import { mulberry32, hashSeed, generateNoise } from "../src/engine/noise.js";
import { runCommercialPeriod } from "../src/engine/runner.js";
import type { SegmentConfig, PhaseConfig, EngineFlags, FactorValues } from "../src/index.js";

const SEGMENT_ALTO: SegmentConfig = {
  key: "Alto",
  w_precio: 0.5,
  w_producto: 2,
  w_canales: 1,
  w_publicidad: 2,
  w_generico: 1,
  w_caracteristicas_marca: 1,
  kappa_precio: 0.2,
  correccion_utilidad: 1,
};

const PHASE_GROWTH: PhaseConfig = {
  key: "2.Growth",
  mult_precio: 1.4,
  mult_producto: 1,
  mult_canales: 0.225,
  mult_publicidad: 1.8,
  mult_generico: 2,
  mult_caracteristicas_marca: 1,
  mult_correccion_utilidad: 1,
  rotacion_conocimiento: 0.4,
  adquisicion_conocimiento: 0.5,
  error_base: 10,
};

const FLAGS: EngineFlags = {
  ruido_activo: false,
  aplicar_mult_seg_fase_precio: false,
  aplicar_mult_seg_fase_producto: false,
  aplicar_mult_seg_fase_publicidad: true,
  aplicar_mult_seg_fase_canales: true,
  aplicar_mult_seg_fase_presupuesto: false,
  umbral_activo: false,
  actualizacion_instantanea: true,
};

describe("Invariants", () => {
  it("x=0 in price factor returns exactly 50", () => {
    const result = computePriceFactor(100, 100, 9.911, 113.6);
    expect(result).toBe(50);
  });

  it("promotion zero does not kill total index", () => {
    const factors: FactorValues = {
      precio: 50,
      presupuesto: 100,
      promocion: 0,
      publicidad: 50,
      producto: 20,
    };
    const result = computeTotalIndex(factors, SEGMENT_ALTO, PHASE_GROWTH, 0.25, FLAGS, 1);
    expect(result).toBeGreaterThan(0);
  });

  it("final index average includes absent companies as zero", () => {
    const totals = [
      { companyId: "A", total: 100 },
      { companyId: "B", total: 200 },
      { companyId: "C", total: 0 },
    ];
    const finals = computeFinalIndex(totals, 5);
    const avg = (100 + 200) / 5;
    expect(finals.find((f) => f.companyId === "A")!.final).toBeCloseTo((100 / avg) * 100, 6);
    expect(finals.find((f) => f.companyId === "C")!.final).toBe(0);
  });

  it("product factor without improvements gives ~20", () => {
    const dims = [
      { key: "sostenibilidad", name: "Eco-friendliness" },
      { key: "conveniencia", name: "Convenience" },
      { key: "rendimiento", name: "Performance" },
      { key: "funcionalidades_extra", name: "Extra features" },
      { key: "eficiencia", name: "Efficiency" },
    ];
    const improvements = [
      { id: "1", dimensions: { sostenibilidad: 1, conveniencia: 1, rendimiento: 0, funcionalidades_extra: 0, eficiencia: 1 } },
      { id: "2", dimensions: { sostenibilidad: 2, conveniencia: 0, rendimiento: 0, funcionalidades_extra: 0, eficiencia: 0 } },
    ];
    const dimPhases = [
      { segmentKey: "Alto", phaseKey: "2.Growth", dimensionKey: "sostenibilidad", desired_value: 0.4, propension: 0.3 },
      { segmentKey: "Alto", phaseKey: "2.Growth", dimensionKey: "conveniencia", desired_value: 0.5, propension: 0.6 },
      { segmentKey: "Alto", phaseKey: "2.Growth", dimensionKey: "rendimiento", desired_value: 0.7, propension: 0.8 },
      { segmentKey: "Alto", phaseKey: "2.Growth", dimensionKey: "funcionalidades_extra", desired_value: 0.6, propension: 0.7 },
      { segmentKey: "Alto", phaseKey: "2.Growth", dimensionKey: "eficiencia", desired_value: 0.4, propension: 0.3 },
    ];
    const result = computeProductFactor(dims, [], improvements, dimPhases, "Alto", "2.Growth", 0.078);
    expect(Math.abs(result - 20)).toBeLessThan(6);
  });

  it("same seed produces same result twice; different seeds differ", () => {
    const seed1 = hashSeed(["game1", "7", "Centro", "Alto", "company1"]);
    const rng1a = mulberry32(seed1);
    const rng1b = mulberry32(seed1);
    const noise1a = generateNoise(rng1a, 10);
    const noise1b = generateNoise(rng1b, 10);
    expect(noise1a).toBe(noise1b);

    const seed2 = hashSeed(["game1", "7", "Centro", "Alto", "company2"]);
    const rng2 = mulberry32(seed2);
    const noise2 = generateNoise(rng2, 10);
    expect(noise1a).not.toBe(noise2);
  });

  it("with all companies identical, shares are exactly 1/N", () => {
    const N = 5;
    const totals = Array.from({ length: N }, (_, i) => ({
      companyId: `E${i + 1}`,
      total: 500,
    }));
    const finals = computeFinalIndex(totals, N);
    const shares = computeRawShare(finals, N);

    for (const s of shares) {
      expect(s.share).toBeCloseTo(100 / N, 9);
    }
  });

  it("sum of assigned shares per zone-segment is 1 (within 1e-9)", () => {
    const shares = [0.18, 0.22, 0.15, 0.25, 0.20];
    const loyalty = 0.5;
    const rawShares = [0.19, 0.21, 0.16, 0.24, 0.20];
    const assigned = rawShares.map((r, i) => computeAssignedShare(r * 100, shares[i]! * 100, loyalty));
    const sum = assigned.reduce((s, v) => s + v, 0);
    expect(sum).toBeCloseTo(100, 5);
  });
});
