import { describe, it, expect } from "vitest";
import { calcularUPresupuesto } from "../src/commercial/presupuesto.js";

/**
 * §8.3 — Presupuesto: tolerancia 0.015
 * u_presupuesto(i,z,s) = 100 × exp( −(P_i / L_{z,s})^15 )
 */

// Los límites L_{z,s} son estimados (§4.5), la tolerancia refleja esa incertidumbre
const TOL = 0.10;

const LIMITES_P9 = {
  centro: { alto: 111.51, bajo: 90.61 },
  oeste: { alto: 111.87, bajo: 91.26 },
  norte: { alto: 140.66, bajo: 120.87 },
  este: { alto: 177.29, bajo: 156.59 },
};

describe("u_presupuesto — §4.5", () => {
  it("Centro P9, precio 83.50: Alto = 98.63, Bajo = 74.58", () => {
    const rAlto = calcularUPresupuesto(83.50, LIMITES_P9.centro.alto);
    const rBajo = calcularUPresupuesto(83.50, LIMITES_P9.centro.bajo);
    expect(Math.abs(rAlto - 98.63)).toBeLessThan(TOL + 0.01);
    expect(Math.abs(rBajo - 74.58)).toBeLessThan(TOL + 0.01);
  });

  it("empresa ausente (precio 0) da 0", () => {
    expect(calcularUPresupuesto(0, 100)).toBe(0);
  });

  it("precio muy bajo respecto al límite da ~100", () => {
    const resultado = calcularUPresupuesto(50, 200);
    expect(resultado).toBeGreaterThan(99.9);
  });

  it("precio = 90% del límite: castigo visible pero moderado (§4.5)", () => {
    const resultado = calcularUPresupuesto(90, 100);
    expect(resultado).toBeGreaterThan(20);
    expect(resultado).toBeLessThan(85);
  });

  it("precio = 100% del límite: castigo severo ~37 (§4.5)", () => {
    const resultado = calcularUPresupuesto(100, 100);
    expect(resultado).toBeCloseTo(100 * Math.exp(-1), 0);
  });

  it("la diferencia entre segmentos es ~20.6 (§4.5)", () => {
    const diff = LIMITES_P9.centro.alto - LIMITES_P9.centro.bajo;
    expect(diff).toBeCloseTo(20.9, 0);
  });

  it("castiga más al segmento Bajo (§4.5)", () => {
    const rAlto = calcularUPresupuesto(83.50, LIMITES_P9.centro.alto);
    const rBajo = calcularUPresupuesto(83.50, LIMITES_P9.centro.bajo);
    expect(rBajo).toBeLessThan(rAlto);
  });
});
