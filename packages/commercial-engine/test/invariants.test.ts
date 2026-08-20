import { describe, it, expect } from "vitest";
import { computePriceFactor, computeAveragePrice } from "../src/engine/price.js";
import { computeTotalIndex } from "../src/engine/aggregate.js";
import { computeFinalIndex, computeRawShare, computeAssignedShare } from "../src/engine/share.js";
import { computeProductFactor } from "../src/engine/product.js";
import { mulberry32, hashSeed, generateNoise } from "../src/engine/noise.js";
import { MEZQUITE_CONFIG } from "./fixtures/mezquite-config.js";
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
  clamp_price_factor: true,
  zero_factor_kills_total: false,
};

describe("Invariants", () => {
  it("x=0 in price factor returns exactly 50", () => {
    const result = computePriceFactor(100, 100, 0.2, true);
    expect(result).toBe(50);
  });

  it("slope (u-50)/x is constant and equal to -50/kappa for all observations", () => {
    const kappa = 0.2;
    const expectedSlope = -50 / kappa;
    const prices = [77, 75, 75, 79, 80];
    const avg = computeAveragePrice(prices);
    for (const price of prices) {
      const x = (price - avg) / avg;
      if (Math.abs(x) < 1e-12) continue;
      const u = computePriceFactor(price, avg, kappa, false);
      const slope = (u - 50) / x;
      expect(slope).toBeCloseTo(expectedSlope, 6);
    }
  });

  it("a zero factor does NOT kill total index (ECO-KLIN Sur P10 case)", () => {
    const factors: FactorValues = {
      precio: 39.19,
      presupuesto: 99.97,
      promocion: 0,
      publicidad: 33.69,
      producto: 77.30,
    };
    const result = computeTotalIndex(factors, SEGMENT_ALTO, PHASE_GROWTH, 0.25, FLAGS, 1);
    expect(result).toBeGreaterThan(0);
  });

  it("zero factor kills total when zero_factor_kills_total=true", () => {
    const flagsKills = { ...FLAGS, zero_factor_kills_total: true };
    const factors: FactorValues = {
      precio: 39.19,
      presupuesto: 99.97,
      promocion: 0,
      publicidad: 33.69,
      producto: 77.30,
    };
    const result = computeTotalIndex(factors, SEGMENT_ALTO, PHASE_GROWTH, 0.25, flagsKills, 1);
    expect(result).toBe(0);
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

  it("product factor without improvements is positive and below 20", () => {
    const cfg = MEZQUITE_CONFIG;
    const beta = cfg.coefficients.find((c) => c.key === "producto_beta")!.value;
    const result = computeProductFactor(
      cfg.dimensions,
      [],
      cfg.improvements,
      cfg.segmentDimensionPhases,
      "Alto",
      "2.Growth",
      beta,
    );
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(20);
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
