import { describe, it, expect } from "vitest";
import { computePriceFactor, computeAveragePrice } from "../src/engine/price.js";

describe("computeAveragePrice", () => {
  it("computes average of non-zero prices", () => {
    expect(computeAveragePrice([77, 75, 75, 79, 80])).toBeCloseTo(77.2, 6);
  });

  it("excludes zero prices", () => {
    expect(computeAveragePrice([0, 100, 90, 0, 83])).toBeCloseTo(91, 6);
  });

  it("returns 0 for all-zero prices", () => {
    expect(computeAveragePrice([0, 0, 0])).toBe(0);
  });
});

describe("computePriceFactor", () => {
  it("returns exactly 50 when price equals average", () => {
    expect(computePriceFactor(100, 100, 0.2, true)).toBe(50);
    expect(computePriceFactor(77, 77, 0.15, true)).toBe(50);
  });

  it("returns 0 when price is 0", () => {
    expect(computePriceFactor(0, 100, 0.2, true)).toBe(0);
  });

  it("returns 0 when avg price is 0", () => {
    expect(computePriceFactor(100, 0, 0.2, true)).toBe(0);
  });

  it("throws when kappa_precio is 0", () => {
    expect(() => computePriceFactor(100, 100, 0, true)).toThrow("kappa_precio must be non-zero");
  });

  it("x=0 returns exactly 50 with no tolerance", () => {
    expect(computePriceFactor(77.2, 77.2, 0.2, false)).toBe(50);
  });

  it("slope (u-50)/x is constant and equal to -50/kappa", () => {
    const kappa = 0.2;
    const avg = 77.2;
    const expectedSlope = -50 / kappa;
    for (const price of [70, 75, 77, 79, 80, 85]) {
      const x = (price - avg) / avg;
      if (x === 0) continue;
      const u = computePriceFactor(price, avg, kappa, false);
      const slope = (u - 50) / x;
      expect(slope).toBeCloseTo(expectedSlope, 6);
    }
  });

  it("matches golden Centro|Alto P7 values within 0.01 pts", () => {
    const prices = [77, 75, 75, 79, 80];
    const avg = computeAveragePrice(prices);
    const kappa = 0.2;
    const expected = [50.65, 57.12, 57.12, 44.17, 40.93];
    for (let i = 0; i < prices.length; i++) {
      expect(
        Math.abs(computePriceFactor(prices[i]!, avg, kappa, true) - expected[i]!),
      ).toBeLessThan(0.01);
    }
  });

  it("matches golden Centro|Bajo P7 values within 0.01 pts", () => {
    const prices = [77, 75, 75, 79, 80];
    const avg = computeAveragePrice(prices);
    const kappa = 0.15;
    const expected = [50.86, 59.5, 59.5, 42.23, 37.91];
    for (let i = 0; i < prices.length; i++) {
      expect(
        Math.abs(computePriceFactor(prices[i]!, avg, kappa, true) - expected[i]!),
      ).toBeLessThan(0.01);
    }
  });

  it("clamps to [0, 100] when clamp=true", () => {
    const avg = 100;
    const kappa = 0.2;
    expect(computePriceFactor(130, avg, kappa, true)).toBe(0);
    expect(computePriceFactor(70, avg, kappa, true)).toBe(100);
  });

  it("does not clamp when clamp=false", () => {
    const avg = 100;
    const kappa = 0.2;
    expect(computePriceFactor(130, avg, kappa, false)).toBeLessThan(0);
    expect(computePriceFactor(70, avg, kappa, false)).toBeGreaterThan(100);
  });
});
