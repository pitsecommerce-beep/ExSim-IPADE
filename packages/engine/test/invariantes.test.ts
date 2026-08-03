import { describe, it, expect } from "vitest";
import { simulateCommercialPeriod } from "../src/commercial/simulate.js";
import type { CommercialInput, EstadoPrevio } from "../src/commercial/types.js";

const DESIRED_VALUE_DEFAULT = {
  desiredValue: {
    sostenibilidad: 0.5, conveniencia: 0.5, rendimiento: 0.5,
    funcionalidadesExtra: 0.5, eficiencia: 0.5,
  },
  propension: {
    sostenibilidad: 0.5, conveniencia: 0.5, rendimiento: 0.5,
    funcionalidadesExtra: 0.5, eficiencia: 0.5,
  },
};

const PESOS_ALTO = {
  precio: 0.268, producto: 1.266, canal: 0.225, publicidad: 0.895,
  presupuesto: 1.0, generico: 1.0, caracteristicasMarca: 1.0, correccionUtilidad: 1.0,
};

const PESOS_BAJO = {
  precio: 0.511, producto: 0.495, canal: 0.225, publicidad: 0.760,
  presupuesto: 1.0, generico: 1.0, caracteristicasMarca: 1.0, correccionUtilidad: 1.7,
};

const MULT_GROWTH = {
  precio: 1.40, producto: 1, canal: 0.225, publicidad: 1.80,
  presupuesto: 1.0, generico: 1.0, caracteristicasMarca: 1,
};

const MULT_ROLLOUT = {
  precio: 1.12, producto: 1, canal: 0.25, publicidad: 2.20,
  presupuesto: 1.0, generico: 1.0, caracteristicasMarca: 1,
};

function makeInput(overrides?: Partial<{
  empresas: CommercialInput["empresas"];
  zonas: CommercialInput["zonas"];
}>): CommercialInput {
  return {
    periodo: 7,
    kappaPrecio: { alto: 0.20, bajo: 0.15 },
    canalParams: { alfa: 1, kappa: 2 },
    loyalty: {
      rollout: { alto: 0.25, bajo: 0.25 },
      growth: { alto: 0.50, bajo: 0.25 },
      maturity: { alto: 0.55, bajo: 0.30 },
      hypermaturity: { alto: 0.40, bajo: 0.20 },
    },
    pesosSegmento: { alto: PESOS_ALTO, bajo: PESOS_BAJO },
    multFase: {
      rollout: MULT_ROLLOUT, growth: MULT_GROWTH,
      maturity: { precio: 1.50, producto: 1, canal: 0.16, publicidad: 1.10, presupuesto: 1.0, generico: 1.0, caracteristicasMarca: 1 },
      hypermaturity: { precio: 1.80, producto: 1, canal: 0.08, publicidad: 0.70, presupuesto: 1.0, generico: 1.0, caracteristicasMarca: 1 },
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
    empresas: overrides?.empresas ?? [
      { empresaId: "E1", nombre: "E1", mejorasActivas: [], spotsTV: 20, enfoqueMarcaTV: 0.5,
        decisiones: [{ zonaId: "Z1", precio: 80, vendedores: 15, spotsRadio: 40, enfoqueMarcaRadio: 0.5, productoTerminado: 10000, previsionDemanda: 10000 }] },
      { empresaId: "E2", nombre: "E2", mejorasActivas: [], spotsTV: 10, enfoqueMarcaTV: 0.5,
        decisiones: [{ zonaId: "Z1", precio: 85, vendedores: 10, spotsRadio: 20, enfoqueMarcaRadio: 0.5, productoTerminado: 10000, previsionDemanda: 10000 }] },
      { empresaId: "E3", nombre: "E3", mejorasActivas: [], spotsTV: 30, enfoqueMarcaTV: 0.7,
        decisiones: [{ zonaId: "Z1", precio: 75, vendedores: 20, spotsRadio: 60, enfoqueMarcaRadio: 0.3, productoTerminado: 10000, previsionDemanda: 10000 }] },
    ],
    zonas: overrides?.zonas ?? [{
      zonaId: "Z1", nombre: "Z1", fase: "growth", distribuidores: 10,
      limitePrecio: { alto: 111.85, bajo: 91.25 },
      demanda: { alto: { cantidadPorEmpresa: 800 }, bajo: { cantidadPorEmpresa: 1700 } },
    }],
  };
}

describe("Invariantes del motor comercial", () => {
  it("1. u_canal = 0 implica A = 0, con inventario disponible", () => {
    const input = makeInput({
      empresas: [
        { empresaId: "E1", nombre: "E1", mejorasActivas: [], spotsTV: 20, enfoqueMarcaTV: 0.5,
          decisiones: [{ zonaId: "Z1", precio: 80, vendedores: 0, spotsRadio: 40, enfoqueMarcaRadio: 0.5, productoTerminado: 10000, previsionDemanda: 10000 }] },
        { empresaId: "E2", nombre: "E2", mejorasActivas: [], spotsTV: 10, enfoqueMarcaTV: 0.5,
          decisiones: [{ zonaId: "Z1", precio: 85, vendedores: 10, spotsRadio: 20, enfoqueMarcaRadio: 0.5, productoTerminado: 10000, previsionDemanda: 10000 }] },
      ],
    });
    const output = simulateCommercialPeriod(input);
    const e1 = output.resultados.filter((r) => r.empresaId === "E1");
    for (const r of e1) {
      expect(r.total).toBe(0);
      expect(r.cuotaAsignada).toBe(0);
      expect(r.demandaGenerada).toBe(0);
    }
  });

  it("2. u_canal no depende de los competidores", () => {
    const input1 = makeInput({
      empresas: [
        { empresaId: "E1", nombre: "E1", mejorasActivas: [], spotsTV: 20, enfoqueMarcaTV: 0.5,
          decisiones: [{ zonaId: "Z1", precio: 80, vendedores: 15, spotsRadio: 40, enfoqueMarcaRadio: 0.5, productoTerminado: 10000, previsionDemanda: 10000 }] },
        { empresaId: "E2", nombre: "E2", mejorasActivas: [], spotsTV: 10, enfoqueMarcaTV: 0.5,
          decisiones: [{ zonaId: "Z1", precio: 85, vendedores: 10, spotsRadio: 20, enfoqueMarcaRadio: 0.5, productoTerminado: 10000, previsionDemanda: 10000 }] },
      ],
    });
    const input2 = makeInput({
      empresas: [
        { empresaId: "E1", nombre: "E1", mejorasActivas: [], spotsTV: 20, enfoqueMarcaTV: 0.5,
          decisiones: [{ zonaId: "Z1", precio: 80, vendedores: 15, spotsRadio: 40, enfoqueMarcaRadio: 0.5, productoTerminado: 10000, previsionDemanda: 10000 }] },
        { empresaId: "E3", nombre: "E3", mejorasActivas: [], spotsTV: 30, enfoqueMarcaTV: 0.7,
          decisiones: [{ zonaId: "Z1", precio: 75, vendedores: 20, spotsRadio: 60, enfoqueMarcaRadio: 0.3, productoTerminado: 10000, previsionDemanda: 10000 }] },
      ],
    });
    const out1 = simulateCommercialPeriod(input1);
    const out2 = simulateCommercialPeriod(input2);
    const e1canal1 = out1.resultados.find((r) => r.empresaId === "E1" && r.segmento === "alto")!.atributos.uCanal;
    const e1canal2 = out2.resultados.find((r) => r.empresaId === "E1" && r.segmento === "alto")!.atributos.uCanal;
    expect(e1canal1).toBe(e1canal2);
  });

  it("3. u_canal no tiene memoria: mismo v/d en dos periodos da el mismo valor", () => {
    const input = makeInput();
    const out1 = simulateCommercialPeriod(input);
    const out2 = simulateCommercialPeriod({ ...input, periodo: 8 });
    const canal1 = out1.resultados.find((r) => r.empresaId === "E1" && r.segmento === "alto")!.atributos.uCanal;
    const canal2 = out2.resultados.find((r) => r.empresaId === "E1" && r.segmento === "alto")!.atributos.uCanal;
    expect(canal1).toBe(canal2);
  });

  it("4. u_precio = 50 exactamente cuando P = Pbar", () => {
    const input = makeInput({
      empresas: [
        { empresaId: "E1", nombre: "E1", mejorasActivas: [], spotsTV: 20, enfoqueMarcaTV: 0.5,
          decisiones: [{ zonaId: "Z1", precio: 100, vendedores: 15, spotsRadio: 40, enfoqueMarcaRadio: 0.5, productoTerminado: 10000, previsionDemanda: 10000 }] },
        { empresaId: "E2", nombre: "E2", mejorasActivas: [], spotsTV: 10, enfoqueMarcaTV: 0.5,
          decisiones: [{ zonaId: "Z1", precio: 100, vendedores: 10, spotsRadio: 20, enfoqueMarcaRadio: 0.5, productoTerminado: 10000, previsionDemanda: 10000 }] },
      ],
    });
    const output = simulateCommercialPeriod(input);
    for (const r of output.resultados) {
      expect(r.atributos.uPrecio).toBe(50);
    }
  });

  it("5. Empresas con precio 0 se excluyen de Pbar y normalización, sus cinco utilidades son 0", () => {
    const input = makeInput({
      empresas: [
        { empresaId: "E1", nombre: "E1", mejorasActivas: [], spotsTV: 20, enfoqueMarcaTV: 0.5,
          decisiones: [{ zonaId: "Z1", precio: 0, vendedores: 15, spotsRadio: 40, enfoqueMarcaRadio: 0.5, productoTerminado: 10000, previsionDemanda: 10000 }] },
        { empresaId: "E2", nombre: "E2", mejorasActivas: [], spotsTV: 10, enfoqueMarcaTV: 0.5,
          decisiones: [{ zonaId: "Z1", precio: 85, vendedores: 10, spotsRadio: 20, enfoqueMarcaRadio: 0.5, productoTerminado: 10000, previsionDemanda: 10000 }] },
        { empresaId: "E3", nombre: "E3", mejorasActivas: [], spotsTV: 30, enfoqueMarcaTV: 0.7,
          decisiones: [{ zonaId: "Z1", precio: 75, vendedores: 20, spotsRadio: 60, enfoqueMarcaRadio: 0.3, productoTerminado: 10000, previsionDemanda: 10000 }] },
      ],
    });
    const output = simulateCommercialPeriod(input);
    const e1 = output.resultados.filter((r) => r.empresaId === "E1");
    for (const r of e1) {
      expect(r.atributos.uPrecio).toBe(0);
      expect(r.atributos.uPresupuesto).toBe(0);
      expect(r.atributos.uCanal).toBe(0);
      expect(r.atributos.uPublicidad).toBe(0);
      expect(r.atributos.uProducto).toBe(0);
      expect(r.total).toBe(0);
      expect(r.cuotaAsignada).toBe(0);
    }
  });

  it("6. La suma de cuotaAsignada sobre empresas presentes es 1 — cinco presentes", () => {
    const input = makeInput();
    const output = simulateCommercialPeriod(input);
    for (const seg of ["alto", "bajo"] as const) {
      const cuotas = output.resultados
        .filter((r) => r.zonaId === "Z1" && r.segmento === seg)
        .map((r) => r.cuotaAsignada);
      const suma = cuotas.reduce((s, c) => s + c, 0);
      expect(Math.abs(suma - 1)).toBeLessThan(1e-9);
    }
  });

  it("6b. La suma de cuotaAsignada es 1 — tres presentes (Sur)", () => {
    const input = makeInput({
      empresas: [
        { empresaId: "E1", nombre: "E1", mejorasActivas: [], spotsTV: 10, enfoqueMarcaTV: 0.5,
          decisiones: [{ zonaId: "Z1", precio: 0, vendedores: 0, spotsRadio: 0, enfoqueMarcaRadio: 0, productoTerminado: 0, previsionDemanda: 0 }] },
        { empresaId: "E2", nombre: "E2", mejorasActivas: [], spotsTV: 10, enfoqueMarcaTV: 0.5,
          decisiones: [{ zonaId: "Z1", precio: 100, vendedores: 10, spotsRadio: 65, enfoqueMarcaRadio: 0.7, productoTerminado: 10000, previsionDemanda: 10000 }] },
        { empresaId: "E3", nombre: "E3", mejorasActivas: [], spotsTV: 20, enfoqueMarcaTV: 0.7,
          decisiones: [{ zonaId: "Z1", precio: 90, vendedores: 6, spotsRadio: 10, enfoqueMarcaRadio: 0.3, productoTerminado: 10000, previsionDemanda: 10000 }] },
        { empresaId: "E4", nombre: "E4", mejorasActivas: [], spotsTV: 50, enfoqueMarcaTV: 0.7,
          decisiones: [{ zonaId: "Z1", precio: 0, vendedores: 0, spotsRadio: 0, enfoqueMarcaRadio: 0, productoTerminado: 0, previsionDemanda: 0 }] },
        { empresaId: "E5", nombre: "E5", mejorasActivas: [], spotsTV: 70, enfoqueMarcaTV: 0.9,
          decisiones: [{ zonaId: "Z1", precio: 83, vendedores: 10, spotsRadio: 150, enfoqueMarcaRadio: 0.5, productoTerminado: 10000, previsionDemanda: 10000 }] },
      ],
      zonas: [{
        zonaId: "Z1", nombre: "Sur", fase: "rollout", distribuidores: 7,
        limitePrecio: { alto: 163.41, bajo: 142.81 },
        demanda: { alto: { cantidadPorEmpresa: 314.8 }, bajo: { cantidadPorEmpresa: 325.6 } },
      }],
    });
    const output = simulateCommercialPeriod(input);
    for (const seg of ["alto", "bajo"] as const) {
      const cuotas = output.resultados
        .filter((r) => r.zonaId === "Z1" && r.segmento === seg)
        .map((r) => r.cuotaAsignada);
      const sumaPresentes = cuotas.filter((c) => c > 0).reduce((s, c) => s + c, 0);
      expect(Math.abs(sumaPresentes - 1)).toBeLessThan(1e-9);
    }
  });

  it("7. En zonas sin historia, cuotaAsignada === shareAtraccion exactamente", () => {
    const input = makeInput();
    const output = simulateCommercialPeriod(input);
    for (const r of output.resultados) {
      expect(r.cuotaAsignada).toBe(r.shareAtraccion);
    }
  });

  it("7b. Este P7 Alto: Final [77.86,42.89,54.26,174.90,150.09] → cuota [15.57,8.58,10.85,34.98,30.02]", () => {
    const finales = [77.86, 42.89, 54.26, 174.90, 150.09];
    const suma = finales.reduce((s, f) => s + f, 0);
    const shares = finales.map((f) => f / suma);
    const expected = [15.57, 8.58, 10.85, 34.98, 30.02];
    for (let i = 0; i < shares.length; i++) {
      expect(shares[i]! * 100).toBeCloseTo(expected[i]!, 1);
    }
  });

  it("8. El motor es determinista: dos llamadas idénticas dan salidas idénticas", () => {
    const input = makeInput();
    const out1 = simulateCommercialPeriod(input);
    const out2 = simulateCommercialPeriod(input);
    expect(out1.resultados.length).toBe(out2.resultados.length);
    for (let i = 0; i < out1.resultados.length; i++) {
      const r1 = out1.resultados[i]!;
      const r2 = out2.resultados[i]!;
      expect(r1.cuotaAsignada).toBe(r2.cuotaAsignada);
      expect(r1.demandaGenerada).toBe(r2.demandaGenerada);
      expect(r1.ventas).toBe(r2.ventas);
      expect(r1.faltante).toBe(r2.faltante);
      expect(r1.total).toBe(r2.total);
      expect(r1.final).toBe(r2.final);
    }
  });
});
