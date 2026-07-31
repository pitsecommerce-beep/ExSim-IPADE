import { describe, it, expect } from "vitest";
import { calcularVectorProducto, calcularUProducto } from "../src/commercial/producto.js";
import type { DesiredValueConfig, ImprovementDimensions } from "../src/commercial/types.js";

/**
 * §4.3 — Producto: estructura confirmada, parámetros pendientes
 * SUPUESTO: forma funcional = producto de similitudes ^ propensión
 */

const VALOR_INICIAL = 0.2;

const MEJORA_A: ImprovementDimensions = {
  improvementId: "A",
  d1: 0.1,
  d2: 0.0,
  d3: 0.3,
  d4: 0.2,
  d5: 0.0,
};

const MEJORA_B: ImprovementDimensions = {
  improvementId: "B",
  d1: 0.0,
  d2: 0.2,
  d3: 0.0,
  d4: 0.0,
  d5: 0.3,
};

describe("vector de producto — §4.3 capa 1", () => {
  it("sin mejoras, todas las dimensiones = valor inicial", () => {
    const vec = calcularVectorProducto([], [MEJORA_A, MEJORA_B], VALOR_INICIAL);
    expect(vec.sostenibilidad).toBe(0.2);
    expect(vec.conveniencia).toBe(0.2);
    expect(vec.rendimiento).toBe(0.2);
    expect(vec.funcionalidadesExtra).toBe(0.2);
    expect(vec.eficiencia).toBe(0.2);
  });

  it("con mejora A, suma las contribuciones D1..D5", () => {
    const vec = calcularVectorProducto(["A"], [MEJORA_A, MEJORA_B], VALOR_INICIAL);
    expect(vec.sostenibilidad).toBeCloseTo(0.3, 5);
    expect(vec.rendimiento).toBeCloseTo(0.5, 5);
    expect(vec.funcionalidadesExtra).toBeCloseTo(0.4, 5);
    expect(vec.eficiencia).toBeCloseTo(0.2, 5);
  });

  it("mejoras son acumulativas (§4.3)", () => {
    const vec = calcularVectorProducto(["A", "B"], [MEJORA_A, MEJORA_B], VALOR_INICIAL);
    expect(vec.sostenibilidad).toBeCloseTo(0.3, 5);
    expect(vec.conveniencia).toBeCloseTo(0.4, 5);
    expect(vec.rendimiento).toBeCloseTo(0.5, 5);
    expect(vec.funcionalidadesExtra).toBeCloseTo(0.4, 5);
    expect(vec.eficiencia).toBeCloseTo(0.5, 5);
  });
});

describe("u_producto (punto ideal) — §4.3 capa 2", () => {
  const config: DesiredValueConfig = {
    desiredValue: {
      sostenibilidad: 0.5,
      conveniencia: 0.5,
      rendimiento: 0.7,
      funcionalidadesExtra: 0.6,
      eficiencia: 0.5,
    },
    propension: {
      sostenibilidad: 0.5,
      conveniencia: 0.5,
      rendimiento: 0.8,
      funcionalidadesExtra: 0.7,
      eficiencia: 0.5,
    },
  };

  it("ofrecido = desired → máxima utilidad (100)", () => {
    const vec = config.desiredValue;
    const resultado = calcularUProducto(vec, config);
    expect(resultado).toBeCloseTo(100, 5);
  });

  it("ofrecido lejos del desired → utilidad baja", () => {
    const vec = {
      sostenibilidad: 0.1,
      conveniencia: 0.1,
      rendimiento: 0.1,
      funcionalidadesExtra: 0.1,
      eficiencia: 0.1,
    };
    const resultado = calcularUProducto(vec, config);
    expect(resultado).toBeLessThan(50);
  });

  it("mismas mejoras dan valor distinto en Growth vs Roll-out (§4.3)", () => {
    const configRollout: DesiredValueConfig = {
      desiredValue: {
        sostenibilidad: 0.3,
        conveniencia: 0.3,
        rendimiento: 0.4,
        funcionalidadesExtra: 0.3,
        eficiencia: 0.3,
      },
      propension: config.propension,
    };

    const vec = calcularVectorProducto(["A"], [MEJORA_A], VALOR_INICIAL);
    const rGrowth = calcularUProducto(vec, config);
    const rRollout = calcularUProducto(vec, configRollout);
    expect(rGrowth).not.toBe(rRollout);
  });
});
