import { describe, it, expect } from "vitest";
import { computeBudgetFactor } from "../src/engine/budget.js";

describe("computeBudgetFactor", () => {
  it("returns 0 when price is 0", () => {
    expect(computeBudgetFactor(0, 100, 0.7005, 15)).toBe(0);
  });

  it("returns 0 when limit is 0", () => {
    expect(computeBudgetFactor(50, 0, 0.7005, 15)).toBe(0);
  });

  // With a ≈ 0.7005 the indifference point (u = 50) is at P ≈ L
  it("returns ~50 when price equals limit", () => {
    const result = computeBudgetFactor(100, 100, 0.7005, 15);
    expect(result).toBeCloseTo(100 * Math.exp(-0.7005), 5);
  });

  it("matches golden Centro|Alto P7 values within 0.05 pts", () => {
    const prices = [77, 75, 75, 79, 80];
    const limit = 109.12;
    const a = 0.7005;
    const n = 15;
    const expected = [99.63, 99.75, 99.75, 99.45, 99.34];
    for (let i = 0; i < prices.length; i++) {
      expect(
        Math.abs(computeBudgetFactor(prices[i]!, limit, a, n) - expected[i]!),
      ).toBeLessThan(0.05);
    }
  });

  it("matches golden Centro|Bajo P7 values within 0.05 pts", () => {
    const prices = [77, 75, 75, 79, 80];
    const limit = 89.12;
    const a = 0.7005;
    const n = 15;
    const expected = [92.48, 94.87, 94.87, 89.15, 87.04];
    for (let i = 0; i < prices.length; i++) {
      expect(
        Math.abs(computeBudgetFactor(prices[i]!, limit, a, n) - expected[i]!),
      ).toBeLessThan(0.05);
    }
  });
});
