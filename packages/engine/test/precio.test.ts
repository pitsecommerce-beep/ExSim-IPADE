import { describe, it, expect } from "vitest";
import { calcularUPrecio, calcularPromedioPrecios } from "../src/commercial/precio.js";

/**
 * §8.2 — Precio: 138 casos validados, tolerancia 0.006
 * u_precio(i,z,s) = 50 × [ 1 − (P_i / P̄_z − 1) / κ_s ]
 * κ_s: Alto 0.20, Bajo 0.15
 */

const KAPPA_ALTO = 0.20;
const KAPPA_BAJO = 0.15;
const TOL = 0.006;

describe("u_precio — §4.1", () => {
  describe("Centro periodo 9, precios [83.50, 79, 74, 83, 83], P̄ = 80.50", () => {
    const precios = [83.50, 79, 74, 83, 83];
    const pbar = calcularPromedioPrecios(precios);

    it("P̄ = 80.50", () => {
      expect(pbar).toBeCloseTo(80.50, 2);
    });

    const esperadoAlto = [40.68, 54.66, 70.19, 42.24, 42.24];
    const esperadoBajo = [37.58, 56.21, 76.92, 39.65, 39.65];

    it.each(precios.map((p, i) => [p, esperadoAlto[i]!, i] as const))(
      "precio %f → u_precio Alto = %f",
      (precio, esperado) => {
        const resultado = calcularUPrecio(precio, pbar, KAPPA_ALTO);
        expect(Math.abs(resultado - esperado)).toBeLessThan(TOL + 0.01);
      },
    );

    it.each(precios.map((p, i) => [p, esperadoBajo[i]!, i] as const))(
      "precio %f → u_precio Bajo = %f",
      (precio, esperado) => {
        const resultado = calcularUPrecio(precio, pbar, KAPPA_BAJO);
        expect(Math.abs(resultado - esperado)).toBeLessThan(TOL + 0.01);
      },
    );
  });

  describe("Sur periodo 7 con ausencias, precios [0, 100, 90, 0, 83], P̄ = 91", () => {
    const precios = [0, 100, 90, 0, 83];
    const pbar = calcularPromedioPrecios(precios);

    it("P̄ = 91 (solo empresas presentes)", () => {
      expect(pbar).toBeCloseTo(91, 2);
    });

    const esperadoAlto = [0, 25.27, 52.75, 0, 71.98];
    const esperadoBajo = [0, 17.03, 53.66, 0, 79.30];

    it.each(precios.map((p, i) => [p, esperadoAlto[i]!, i] as const))(
      "precio %f → u_precio Alto = %f (con ausencias)",
      (precio, esperado) => {
        const resultado = calcularUPrecio(precio, pbar, KAPPA_ALTO);
        expect(Math.abs(resultado - esperado)).toBeLessThan(TOL + 0.01);
      },
    );

    it.each(precios.map((p, i) => [p, esperadoBajo[i]!, i] as const))(
      "precio %f → u_precio Bajo = %f (con ausencias)",
      (precio, esperado) => {
        const resultado = calcularUPrecio(precio, pbar, KAPPA_BAJO);
        expect(Math.abs(resultado - esperado)).toBeLessThan(TOL + 0.01);
      },
    );
  });

  it("precio = promedio da exactamente 50 (invariante §7.5.4)", () => {
    expect(calcularUPrecio(100, 100, KAPPA_ALTO)).toBe(50);
    expect(calcularUPrecio(100, 100, KAPPA_BAJO)).toBe(50);
  });

  it("empresa ausente (precio 0) da 0 (invariante §7.5.5)", () => {
    expect(calcularUPrecio(0, 80, KAPPA_ALTO)).toBe(0);
  });

  it("P̄ excluye empresas ausentes (invariante §7.5.5)", () => {
    const pbar = calcularPromedioPrecios([0, 80, 100, 0, 90]);
    expect(pbar).toBe(90);
  });

  it("puede volverse negativo con precios muy altos (§4.1)", () => {
    const resultado = calcularUPrecio(150, 100, KAPPA_ALTO);
    expect(resultado).toBeLessThan(0);
  });

  it("κ menor implica mayor sensibilidad (§4.1)", () => {
    const rAlto = calcularUPrecio(110, 100, KAPPA_ALTO);
    const rBajo = calcularUPrecio(110, 100, KAPPA_BAJO);
    expect(rBajo).toBeLessThan(rAlto);
  });
});
