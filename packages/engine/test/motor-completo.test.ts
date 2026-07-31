import { describe, it, expect } from "vitest";
import { simulateCommercialPeriod } from "../src/commercial/simulate.js";
import type { CommercialInput, EstadoPrevio } from "../src/commercial/types.js";

/**
 * §8.6 — Prueba de extremo a extremo (simplificada)
 *
 * Verifica que simulateCommercialPeriod orquesta correctamente los 5 atributos,
 * la agregación, normalización, cuota y conversión a ventas.
 */

const PESOS_ALTO = {
  precio: 0.5,
  producto: 2.0,
  canal: 1.0,
  publicidad: 2.0,
  generico: 1.0,
  caracteristicasMarca: 1.0,
  correccionUtilidad: 1.0,
};

const PESOS_BAJO = {
  precio: 2.0,
  producto: 1.4,
  canal: 1.0,
  publicidad: 1.8,
  generico: 1.0,
  caracteristicasMarca: 1.0,
  correccionUtilidad: 1.7,
};

const MULT_GROWTH = {
  precio: 1.40,
  producto: 1,
  canal: 0.225,
  publicidad: 1.80,
  generico: 2.00,
  caracteristicasMarca: 1,
};

const MULT_ROLLOUT = {
  precio: 1.12,
  producto: 1,
  canal: 0.25,
  publicidad: 2.20,
  generico: 3.00,
  caracteristicasMarca: 1,
};

const DESIRED_VALUE_DEFAULT = {
  desiredValue: {
    sostenibilidad: 0.5,
    conveniencia: 0.5,
    rendimiento: 0.5,
    funcionalidadesExtra: 0.5,
    eficiencia: 0.5,
  },
  propension: {
    sostenibilidad: 0.5,
    conveniencia: 0.5,
    rendimiento: 0.5,
    funcionalidadesExtra: 0.5,
    eficiencia: 0.5,
  },
};

const BASE_INPUT: CommercialInput = {
  periodo: 7,
  kappaPrecio: { alto: 0.20, bajo: 0.15 },
  canalParams: { alfa: 1, kappa: 2 },
  loyalty: {
    rollout: { alto: 0.25, bajo: 0.25 },
    growth: { alto: 0.50, bajo: 0.25 },
    maturity: { alto: 0.60, bajo: 0.40 },
    hypermaturity: { alto: 0.70, bajo: 0.50 },
  },
  pesosSegmento: { alto: PESOS_ALTO, bajo: PESOS_BAJO },
  multFase: {
    rollout: MULT_ROLLOUT,
    growth: MULT_GROWTH,
    maturity: { precio: 1.50, producto: 1, canal: 0.16, publicidad: 1.10, generico: 0.85, caracteristicasMarca: 1 },
    hypermaturity: { precio: 1.80, producto: 1, canal: 0.08, publicidad: 0.70, generico: 0.40, caracteristicasMarca: 1 },
  },
  rotacionAdquisicion: {
    rollout: { rotacion: 0.45, adquisicion: 0.55 },
    growth: { rotacion: 0.30, adquisicion: 0.45 },
    maturity: { rotacion: 0.20, adquisicion: 0.35 },
    hypermaturity: { rotacion: 0.15, adquisicion: 0.30 },
  },
  desiredValues: {
    rollout: { alto: DESIRED_VALUE_DEFAULT, bajo: DESIRED_VALUE_DEFAULT },
    growth: { alto: DESIRED_VALUE_DEFAULT, bajo: DESIRED_VALUE_DEFAULT },
    maturity: { alto: DESIRED_VALUE_DEFAULT, bajo: DESIRED_VALUE_DEFAULT },
    hypermaturity: { alto: DESIRED_VALUE_DEFAULT, bajo: DESIRED_VALUE_DEFAULT },
  },
  valorInicialDimension: 0.2,
  improvements: [],
  empresas: [
    {
      empresaId: "E1",
      nombre: "Empresa 1",
      mejorasActivas: [],
      spotsTV: 20,
      enfoqueMarcaTV: 0.5,
      decisiones: [{
        zonaId: "centro",
        precio: 80,
        vendedores: 15,
        spotsRadio: 40,
        enfoqueMarcaRadio: 0.5,
        productoTerminado: 10000,
        previsionDemanda: 10000,
      }],
    },
    {
      empresaId: "E2",
      nombre: "Empresa 2",
      mejorasActivas: [],
      spotsTV: 10,
      enfoqueMarcaTV: 0.5,
      decisiones: [{
        zonaId: "centro",
        precio: 85,
        vendedores: 10,
        spotsRadio: 20,
        enfoqueMarcaRadio: 0.5,
        productoTerminado: 10000,
        previsionDemanda: 10000,
      }],
    },
    {
      empresaId: "E3",
      nombre: "Empresa 3",
      mejorasActivas: [],
      spotsTV: 30,
      enfoqueMarcaTV: 0.7,
      decisiones: [{
        zonaId: "centro",
        precio: 75,
        vendedores: 20,
        spotsRadio: 60,
        enfoqueMarcaRadio: 0.3,
        productoTerminado: 10000,
        previsionDemanda: 10000,
      }],
    },
  ],
  zonas: [{
    zonaId: "centro",
    nombre: "Centro",
    fase: "growth",
    distribuidores: 10,
    limitePrecio: { alto: 111.51, bajo: 90.61 },
    demanda: {
      alto: { cantidadPorEmpresa: 800 },
      bajo: { cantidadPorEmpresa: 1700 },
    },
  }],
};

describe("simulateCommercialPeriod — motor completo", () => {
  it("produce resultados para todas las combinaciones empresa × zona × segmento", () => {
    const output = simulateCommercialPeriod(BASE_INPUT);
    expect(output.resultados.length).toBe(6);
  });

  it("la suma de cuotas asignadas es ~1 para cada zona-segmento (invariante §7.5.6)", () => {
    const output = simulateCommercialPeriod(BASE_INPUT);
    for (const segmento of ["alto", "bajo"] as const) {
      const cuotas = output.resultados
        .filter((r) => r.zonaId === "centro" && r.segmento === segmento)
        .map((r) => r.cuotaAsignada);
      const suma = cuotas.reduce((s, c) => s + c, 0);
      expect(suma).toBeCloseTo(1, 5);
    }
  });

  it("vendedores = 0 → demanda generada = 0 (invariante §7.5.1)", () => {
    const inputConCero = {
      ...BASE_INPUT,
      empresas: [
        {
          ...BASE_INPUT.empresas[0]!,
          decisiones: [{
            ...BASE_INPUT.empresas[0]!.decisiones[0]!,
            vendedores: 0,
          }],
        },
        BASE_INPUT.empresas[1]!,
        BASE_INPUT.empresas[2]!,
      ],
    };
    const output = simulateCommercialPeriod(inputConCero);
    const e1Resultados = output.resultados.filter((r) => r.empresaId === "E1");
    for (const r of e1Resultados) {
      expect(r.demandaGenerada).toBe(0);
      expect(r.ventas).toBe(0);
    }
  });

  it("zona nueva sin historia: cuota = share de atracción (invariante §7.5.8)", () => {
    const output = simulateCommercialPeriod(BASE_INPUT);
    for (const r of output.resultados) {
      expect(r.cuotaAsignada).toBeCloseTo(r.shareAtraccion, 10);
    }
  });

  it("con lealtad: cuota difiere del share", () => {
    const estadoPrevio: EstadoPrevio = {
      conocimiento: {
        E1: { centro: { alto: 30, bajo: 20 } },
        E2: { centro: { alto: 15, bajo: 10 } },
        E3: { centro: { alto: 40, bajo: 35 } },
      },
      cuotaAsignada: {
        E1: { centro: { alto: 0.40, bajo: 0.35 } },
        E2: { centro: { alto: 0.20, bajo: 0.25 } },
        E3: { centro: { alto: 0.40, bajo: 0.40 } },
      },
    };
    const output = simulateCommercialPeriod(BASE_INPUT, estadoPrevio);
    const altoResults = output.resultados.filter(
      (r) => r.zonaId === "centro" && r.segmento === "alto",
    );
    for (const r of altoResults) {
      expect(r.cuotaAsignada).not.toBeCloseTo(r.shareAtraccion, 5);
    }
  });

  it("el motor es determinista (invariante §7.5.9)", () => {
    const output1 = simulateCommercialPeriod(BASE_INPUT);
    const output2 = simulateCommercialPeriod(BASE_INPUT);
    for (let i = 0; i < output1.resultados.length; i++) {
      expect(output1.resultados[i]!.cuotaAsignada)
        .toBe(output2.resultados[i]!.cuotaAsignada);
      expect(output1.resultados[i]!.demandaGenerada)
        .toBe(output2.resultados[i]!.demandaGenerada);
    }
  });

  it("empresa ausente (precio 0) tiene todas las utilidades = 0 (invariante §7.5.5)", () => {
    const inputConAusente = {
      ...BASE_INPUT,
      empresas: [
        {
          ...BASE_INPUT.empresas[0]!,
          decisiones: [{
            ...BASE_INPUT.empresas[0]!.decisiones[0]!,
            precio: 0,
          }],
        },
        BASE_INPUT.empresas[1]!,
        BASE_INPUT.empresas[2]!,
      ],
    };
    const output = simulateCommercialPeriod(inputConAusente);
    const e1Resultados = output.resultados.filter((r) => r.empresaId === "E1");
    for (const r of e1Resultados) {
      expect(r.atributos.uPrecio).toBe(0);
      expect(r.atributos.uPresupuesto).toBe(0);
      expect(r.atributos.uCanal).toBe(0);
      expect(r.total).toBe(0);
      expect(r.cuotaAsignada).toBe(0);
    }
  });

  it("faltante = demanda - ventas cuando hay restricción de inventario", () => {
    const inputConPocoInv = {
      ...BASE_INPUT,
      empresas: BASE_INPUT.empresas.map((e) => ({
        ...e,
        decisiones: e.decisiones.map((d) => ({
          ...d,
          productoTerminado: 10,
        })),
      })),
    };
    const output = simulateCommercialPeriod(inputConPocoInv);
    for (const r of output.resultados) {
      if (r.demandaGenerada > 10) {
        expect(r.ventas).toBeLessThanOrEqual(10);
        expect(r.faltante).toBeGreaterThan(0);
      }
    }
  });

  it("actualiza el conocimiento de marca", () => {
    const output = simulateCommercialPeriod(BASE_INPUT);
    expect(Object.keys(output.conocimientoNuevo).length).toBe(3);
    for (const emp of ["E1", "E2", "E3"]) {
      expect(output.conocimientoNuevo[emp]?.["centro"]?.alto).toBeGreaterThan(0);
    }
  });

  it("actualiza la cuota asignada para el siguiente periodo", () => {
    const output = simulateCommercialPeriod(BASE_INPUT);
    expect(Object.keys(output.cuotaAsignadaNueva).length).toBe(3);
    let sumaAlto = 0;
    for (const emp of ["E1", "E2", "E3"]) {
      sumaAlto += output.cuotaAsignadaNueva[emp]?.["centro"]?.alto ?? 0;
    }
    expect(sumaAlto).toBeCloseTo(1, 5);
  });
});
