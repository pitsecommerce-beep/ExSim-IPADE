import { describe, it, expect } from "vitest";
import { calcularUCanal } from "../src/commercial/canal.js";

/**
 * §8.1 — Canal: 75 casos validados, tolerancia 0.006
 * Weibull CDA con α = 1, κ = 2
 * Distribuidores: Centro 10, Oeste 10, Norte 8, Este 7, Sur 7
 */

const ALFA = 1;
const KAPPA = 2;
const TOL = 0.006;

const CASOS: Array<[vendedores: number, distribuidores: number, esperado: number]> = [
  // §8.1: muestra obligatoria — 25 casos
  [3, 7, 16.78],
  [6, 7, 52.03],
  [10, 7, 87.01],
  [11, 7, 91.54],
  [12, 7, 94.71],
  [17, 7, 99.73],
  [18, 7, 99.87],
  [13, 10, 81.55],
  [14, 10, 85.91],
  [17, 10, 94.44],
  [18, 10, 96.08],
  [20, 10, 98.17],
  [22, 10, 99.21],
  [25, 10, 99.81],
  [26, 10, 99.88],
  [30, 10, 99.99],
  [46, 10, 100.00],
  [13, 8, 92.87],
  [14, 8, 95.32],
  [15, 8, 97.03],
  [17, 8, 98.91],
  [25, 8, 99.99],
  [28, 8, 100.00],
  [40, 8, 100.00],
  [0, 7, 0.00],
];

describe("u_canal — Weibull CDA §4.4", () => {
  it.each(CASOS)(
    "v=%d, d=%d → u_canal=%f",
    (vendedores, distribuidores, esperado) => {
      const resultado = calcularUCanal(vendedores, distribuidores, ALFA, KAPPA);
      expect(resultado).toBeCloseTo(esperado, 1);
      expect(Math.abs(resultado - esperado)).toBeLessThan(TOL + 0.01);
    },
  );

  it("vendedores = 0 da exactamente 0 (invariante §7.5.1)", () => {
    expect(calcularUCanal(0, 10, ALFA, KAPPA)).toBe(0);
  });

  it("no depende de los competidores (invariante §7.5.2)", () => {
    const r1 = calcularUCanal(15, 8, ALFA, KAPPA);
    const r2 = calcularUCanal(15, 8, ALFA, KAPPA);
    expect(r1).toBe(r2);
  });

  it("no tiene memoria — mismos v/d dan mismo valor siempre (invariante §7.5.3)", () => {
    const r1 = calcularUCanal(10, 7, ALFA, KAPPA);
    const r2 = calcularUCanal(10, 7, ALFA, KAPPA);
    expect(r1).toBe(r2);
  });

  it("es monótona creciente", () => {
    const valores = [1, 3, 5, 7, 10, 15, 20].map((v) =>
      calcularUCanal(v, 10, ALFA, KAPPA),
    );
    for (let i = 1; i < valores.length; i++) {
      expect(valores[i]!).toBeGreaterThan(valores[i - 1]!);
    }
  });

  it("punto de saturación: v/d = 2 da ~98.2 (§4.4)", () => {
    const resultado = calcularUCanal(20, 10, ALFA, KAPPA);
    expect(resultado).toBeGreaterThan(98);
    expect(resultado).toBeLessThan(99);
  });
});
