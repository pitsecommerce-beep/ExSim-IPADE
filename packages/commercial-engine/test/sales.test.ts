import { describe, it, expect } from "vitest";
import { computeSalesForZone } from "../src/engine/sales.js";

describe("computeSalesForZone", () => {
  it("returns zeros when demand is zero", () => {
    const results = computeSalesForZone([
      { segmentKey: "Alto", demandaGenerada: 0 },
      { segmentKey: "Bajo", demandaGenerada: 0 },
    ], 1000);
    expect(results[0]!.ventas).toBe(0);
    expect(results[0]!.ventasPerdidas).toBe(0);
  });

  it("fulfills all demand when inventory is sufficient", () => {
    const results = computeSalesForZone([
      { segmentKey: "Alto", demandaGenerada: 100 },
      { segmentKey: "Bajo", demandaGenerada: 200 },
    ], 500);
    expect(results[0]!.ventas).toBeCloseTo(100, 6);
    expect(results[1]!.ventas).toBeCloseTo(200, 6);
    expect(results[0]!.ventasPerdidas).toBeCloseTo(0, 6);
    expect(results[1]!.ventasPerdidas).toBeCloseTo(0, 6);
  });

  it("rations proportionally across segments when inventory insufficient", () => {
    const results = computeSalesForZone([
      { segmentKey: "Alto", demandaGenerada: 100 },
      { segmentKey: "Bajo", demandaGenerada: 200 },
    ], 150);
    const totalSales = results.reduce((s, r) => s + r.ventas, 0);
    expect(totalSales).toBeCloseTo(150, 6);
    expect(results[0]!.ventas / results[1]!.ventas).toBeCloseTo(0.5, 3);
  });

  it("uses biweekly rationing (4 periods)", () => {
    const results = computeSalesForZone([
      { segmentKey: "Alto", demandaGenerada: 400 },
    ], 50);
    expect(results[0]!.ventas).toBe(50);
    expect(results[0]!.ventasPerdidas).toBeCloseTo(350, 6);
  });
});
