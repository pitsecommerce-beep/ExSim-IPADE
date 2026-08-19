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
    expect(computePriceFactor(100, 100, 9.911, 113.6)).toBe(50);
    expect(computePriceFactor(77, 77, 12.633, 410.8)).toBe(50);
  });

  it("returns 0 when price is 0", () => {
    expect(computePriceFactor(0, 100, 9.911, 113.6)).toBe(0);
  });

  it("returns 0 when avg price is 0", () => {
    expect(computePriceFactor(100, 0, 9.911, 113.6)).toBe(0);
  });

  it("matches golden Centro|Alto P7 values within 0.30 pts", () => {
    const prices = [77, 75, 75, 79, 80];
    const avg = computeAveragePrice(prices);
    const a = 9.911;
    const b = 113.6;
    const expected = [50.65, 57.12, 57.12, 44.17, 40.93];
    for (let i = 0; i < prices.length; i++) {
      expect(Math.abs(computePriceFactor(prices[i]!, avg, a, b) - expected[i]!)).toBeLessThan(0.3);
    }
  });

  it("matches golden Centro|Bajo P7 values within 1.10 pts", () => {
    const prices = [77, 75, 75, 79, 80];
    const avg = computeAveragePrice(prices);
    const a = 12.633;
    const b = 410.8;
    const expected = [50.86, 59.5, 59.5, 42.23, 37.91];
    for (let i = 0; i < prices.length; i++) {
      expect(Math.abs(computePriceFactor(prices[i]!, avg, a, b) - expected[i]!)).toBeLessThan(1.1);
    }
  });
});
