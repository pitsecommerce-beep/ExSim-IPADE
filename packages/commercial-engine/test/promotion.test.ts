import { describe, it, expect } from "vitest";
import { computePromotionFactor } from "../src/engine/promotion.js";

describe("computePromotionFactor", () => {
  it("returns 0 when vendedores is 0", () => {
    expect(computePromotionFactor(0, 10, 1, 2)).toBe(0);
  });

  it("returns 0 when distribuidores is 0", () => {
    expect(computePromotionFactor(10, 0, 1, 2)).toBe(0);
  });

  it("matches golden Centro P7 values", () => {
    const vendedores = [17, 22, 17, 26, 18];
    const distribuidores = 10;
    const alfa = 1;
    const kappa = 2;
    const expected = [94.44, 99.21, 94.44, 99.88, 96.08];
    for (let i = 0; i < vendedores.length; i++) {
      expect(computePromotionFactor(vendedores[i]!, distribuidores, alfa, kappa)).toBeCloseTo(expected[i]!, 0.01);
    }
  });

  it("matches extreme cases from spec", () => {
    expect(computePromotionFactor(3, 7, 1, 2)).toBeCloseTo(16.78, 0.5);
    expect(computePromotionFactor(2, 10, 1, 2)).toBeCloseTo(3.92, 0.5);
  });

  it("matches golden Oeste P7 values", () => {
    const vendedores = [18, 16, 13, 23, 13];
    const distribuidores = 10;
    const expected = [96.08, 92.27, 81.55, 99.5, 81.55];
    for (let i = 0; i < vendedores.length; i++) {
      expect(computePromotionFactor(vendedores[i]!, distribuidores, 1, 2)).toBeCloseTo(expected[i]!, 0.01);
    }
  });
});
