import { describe, it, expect } from "vitest";
import {
  computeDimensionMaxes,
  computeDimensionLevel,
  computeDimensionCredit,
  computeProductFactor,
} from "../src/engine/product.js";
import { MEZQUITE_CONFIG } from "./fixtures/mezquite-config.js";

const { dimensions, improvements, segmentDimensionPhases } = MEZQUITE_CONFIG;

describe("computeDimensionMaxes", () => {
  it("sums all improvement contributions per dimension", () => {
    const maxes = computeDimensionMaxes(dimensions, improvements);
    expect(maxes["sostenibilidad"]).toBe(9);
    expect(maxes["conveniencia"]).toBe(20);
    expect(maxes["rendimiento"]).toBe(11);
    expect(maxes["funcionalidades_extra"]).toBe(17);
    expect(maxes["eficiencia"]).toBe(4);
  });
});

describe("computeDimensionLevel", () => {
  it("returns beta when no improvements active", () => {
    expect(computeDimensionLevel("sostenibilidad", [], improvements, 9, 0.078)).toBeCloseTo(0.078, 6);
  });

  it("increases with improvements", () => {
    const level = computeDimensionLevel("sostenibilidad", ["1", "3"], improvements, 9, 0.078);
    expect(level).toBeGreaterThan(0.078);
    expect(level).toBeLessThan(1);
  });
});

describe("computeDimensionCredit", () => {
  it("returns min(level/desired, 1)", () => {
    expect(computeDimensionCredit(0.5, 0.4)).toBe(1);
    expect(computeDimensionCredit(0.2, 0.5)).toBeCloseTo(0.4, 6);
  });

  it("handles desired_value = 0", () => {
    expect(computeDimensionCredit(0.5, 0)).toBe(1);
    expect(computeDimensionCredit(0, 0)).toBe(0);
  });
});

describe("computeProductFactor", () => {
  it("without improvements gives approximately 20", () => {
    const result = computeProductFactor(
      dimensions, [], improvements, segmentDimensionPhases,
      "Alto", "2.Growth", 0.078,
    );
    expect(Math.abs(result - 20)).toBeLessThan(6);
  });

  it("caps at 100", () => {
    const allImprovements = improvements.map((i) => i.id);
    const result = computeProductFactor(
      dimensions, allImprovements, improvements, segmentDimensionPhases,
      "Alto", "1.Roll-out", 0.078,
    );
    expect(result).toBeLessThanOrEqual(100);
  });
});
