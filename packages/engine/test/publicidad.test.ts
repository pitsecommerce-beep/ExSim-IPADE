import { describe, it, expect } from "vitest";
import { calcularGPublicidad, calcularConocimiento } from "../src/commercial/publicidad.js";

/**
 * §4.2 — Publicidad / Conocimiento de marca
 * CALIBRADO_NO_DERIVADO para la respuesta de TV
 *
 * Puntos medidos en zona nueva (stock previo = 0), segmento Alto,
 * contribución de radio ya restada:
 *   TV genérico 5.0 → 7.70
 *   TV genérico 6.0 → 19.52
 *   TV genérico 7.0 → 28.79
 *   TV genérico 15.0 → 40.07
 */

describe("g publicidad (respuesta instantánea) — §4.2", () => {
  it("solo la fracción genérica alimenta el conocimiento (invariante §7.5.7)", () => {
    const gCon90Marca = calcularGPublicidad(1.0, 0, "alto");
    const gConTodo = calcularGPublicidad(10.0, 0, "alto");
    expect(gConTodo).toBeGreaterThan(gCon90Marca);
  });

  it("radio es ~1.8x más efectivo en Bajo que en Alto (§4.2c)", () => {
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
});

describe("conocimiento de marca (stock) — §4.2a", () => {
  it("zona nueva: conocimiento previo 0, adquisición determina el valor", () => {
    const resultado = calcularConocimiento(0, 0.45, 0.55, 7.0, 0, "alto");
    expect(resultado).toBeGreaterThan(0);
  });

  it("sin publicidad genérica, conocimiento decae", () => {
    const resultado = calcularConocimiento(50, 0.45, 0.55, 0, 0, "alto");
    expect(resultado).toBeLessThan(50);
  });

  it("es determinista (invariante §7.5.9)", () => {
    const r1 = calcularConocimiento(30, 0.45, 0.55, 7.0, 20, "alto");
    const r2 = calcularConocimiento(30, 0.45, 0.55, 7.0, 20, "alto");
    expect(r1).toBe(r2);
  });

  it("conocimiento está acotado en [0, 100]", () => {
    const r1 = calcularConocimiento(0, 0.45, 0.55, 0, 0, "alto");
    const r2 = calcularConocimiento(99, 0.01, 0.99, 100, 200, "alto");
    expect(r1).toBeGreaterThanOrEqual(0);
    expect(r2).toBeLessThanOrEqual(100);
  });
});
