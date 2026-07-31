import { describe, it, expect } from "vitest";
import { calcularVentasPeriodo } from "../src/commercial/agregacion.js";

/**
 * §6.3 — Conversión a ventas
 * vendidas = MIN(demanda/4, productoTerminado, previsión/4) por quincena par
 */

describe("conversión a ventas — §6.3", () => {
  it("sin restricciones, ventas = demanda", () => {
    const { ventas, faltante } = calcularVentasPeriodo(1000, 10000, 10000);
    expect(ventas).toBe(1000);
    expect(faltante).toBe(0);
  });

  it("topeado por inventario", () => {
    const { ventas, faltante } = calcularVentasPeriodo(1000, 500, 10000);
    expect(ventas).toBe(500);
    expect(faltante).toBe(500);
  });

  it("topeado por previsión (§6.3)", () => {
    const { ventas, faltante } = calcularVentasPeriodo(5701, 10000, 3000);
    expect(ventas).toBe(3000);
    expect(faltante).toBe(2701);
  });

  it("inventario se agota progresivamente entre quincenas", () => {
    const { ventas, faltante } = calcularVentasPeriodo(800, 300, 10000);
    expect(ventas).toBe(300);
    expect(faltante).toBe(500);
  });

  it("cero vendedores ≈ cero demanda generada → cero ventas", () => {
    const { ventas, faltante } = calcularVentasPeriodo(0, 5000, 5000);
    expect(ventas).toBe(0);
    expect(faltante).toBe(0);
  });
});
