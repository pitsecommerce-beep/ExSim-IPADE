import { describe, it, expect } from "vitest";
import { calcularGPublicidad, calcularConocimiento } from "../src/commercial/publicidad.js";

/**
 * §4.2 -- Publicidad / Conocimiento de marca
 *
 * TV: interpolacion lineal sobre puntos medidos (VERIFICADO).
 * Radio: coeficientes lineales 0.072 (Alto), 0.133 (Bajo) (VERIFICADO).
 *
 * Puntos medidos en zona nueva (stock previo = 0), segmento Alto,
 * contribucion de radio ya restada:
 *   TV generico 5.0 -> 7.70
 *   TV generico 6.0 -> 19.52
 *   TV generico 7.0 -> 28.79
 *   TV generico 15.0 -> 40.07
 */

describe("g publicidad (respuesta instantanea) -- §4.2", () => {
  const TOL = 0.01;

  it("TV Alto: reproduce los 4 puntos medidos con tolerancia 0.01", () => {
    expect(Math.abs(calcularGPublicidad(5, 0, "alto") - 7.70)).toBeLessThan(TOL);
    expect(Math.abs(calcularGPublicidad(6, 0, "alto") - 19.52)).toBeLessThan(TOL);
    expect(Math.abs(calcularGPublicidad(7, 0, "alto") - 28.79)).toBeLessThan(TOL);
    expect(Math.abs(calcularGPublicidad(15, 0, "alto") - 40.07)).toBeLessThan(TOL);
  });

  it("TV Bajo: reproduce los 4 puntos medidos con tolerancia 0.01", () => {
    expect(Math.abs(calcularGPublicidad(5, 0, "bajo") - 4.89)).toBeLessThan(TOL);
    expect(Math.abs(calcularGPublicidad(6, 0, "bajo") - 8.72)).toBeLessThan(TOL);
    expect(Math.abs(calcularGPublicidad(7, 0, "bajo") - 12.09)).toBeLessThan(TOL);
    expect(Math.abs(calcularGPublicidad(15, 0, "bajo") - 23.57)).toBeLessThan(TOL);
  });

  it("TV generico 7 + radio 50 Alto -> 32.39 (reproduce TEKANI Este)", () => {
    const result = calcularGPublicidad(7, 50, "alto");
    expect(Math.abs(result - 32.39)).toBeLessThan(0.05);
  });

  it("solo la fraccion generica alimenta el conocimiento", () => {
    const gCon90Marca = calcularGPublicidad(1.0, 0, "alto");
    const gConTodo = calcularGPublicidad(10.0, 0, "alto");
    expect(gConTodo).toBeGreaterThan(gCon90Marca);
  });

  it("radio es ~1.8x mas efectivo en Bajo que en Alto (§4.2c)", () => {
    const gAlto = calcularGPublicidad(0, 100, "alto");
    const gBajo = calcularGPublicidad(0, 100, "bajo");
    const ratio = gBajo / gAlto;
    expect(ratio).toBeGreaterThan(1.5);
    expect(ratio).toBeLessThan(2.1);
  });

  it("es aditivamente separable: TV + radio (§4.2c)", () => {
    const gTV = calcularGPublicidad(7.0, 0, "alto");
    const gRadio = calcularGPublicidad(0, 50, "alto");
    const gCombinado = calcularGPublicidad(7.0, 50, "alto");
    expect(gCombinado).toBeCloseTo(gTV + gRadio, 5);
  });

  it("0 spots -> 0", () => {
    expect(calcularGPublicidad(0, 0, "alto")).toBe(0);
    expect(calcularGPublicidad(0, 0, "bajo")).toBe(0);
  });
});

describe("conocimiento de marca (stock) -- §4.2a", () => {
  it("zona nueva: conocimiento previo 0, adquisicion determina el valor", () => {
    const resultado = calcularConocimiento(0, 0.45, 0.55, 7.0, 0, "alto");
    expect(resultado).toBeGreaterThan(0);
  });

  it("sin publicidad generica, conocimiento decae", () => {
    const resultado = calcularConocimiento(50, 0.45, 0.55, 0, 0, "alto");
    expect(resultado).toBeLessThan(50);
  });

  it("rotacion=0, adquisicion=0 preserva el stock previo (modo inyeccion)", () => {
    const previo = 42.5;
    const resultado = calcularConocimiento(previo, 0, 0, 7.0, 50, "alto");
    expect(resultado).toBe(previo);
  });

  it("es determinista", () => {
    const r1 = calcularConocimiento(30, 0.45, 0.55, 7.0, 20, "alto");
    const r2 = calcularConocimiento(30, 0.45, 0.55, 7.0, 20, "alto");
    expect(r1).toBe(r2);
  });

  it("conocimiento esta acotado en [0, 100]", () => {
    const r1 = calcularConocimiento(0, 0.45, 0.55, 0, 0, "alto");
    const r2 = calcularConocimiento(99, 0.01, 0.99, 100, 200, "alto");
    expect(r1).toBeGreaterThanOrEqual(0);
    expect(r2).toBeLessThanOrEqual(100);
  });
});
