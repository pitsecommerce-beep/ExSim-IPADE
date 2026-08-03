import { describe, it, expect } from "vitest";
import { simulateCommercialPeriod } from "../src/commercial/simulate.js";
import type { CommercialInput, EstadoPrevio } from "../src/commercial/types.js";
import * as F from "./fixtures/periodo7.js";

function buildInput(): { input: CommercialInput; estadoPrevio: EstadoPrevio } {
  const empresas = F.EMPRESAS.map((nombre, i) => ({
    empresaId: nombre,
    nombre,
    mejorasActivas: [] as string[],
    spotsTV: F.SPOTS_TV[i]!,
    enfoqueMarcaTV: F.ENFOQUE_MARCA_TV[i]!,
    decisiones: F.ZONAS.map((zona) => {
      const fase = F.FASE[zona];
      return {
        zonaId: zona,
        precio: F.PRECIO[zona][i]!,
        vendedores: F.VENDEDORES[zona][i]!,
        spotsRadio: F.SPOTS_RADIO[zona][i]!,
        enfoqueMarcaRadio: F.ENFOQUE_MARCA_RADIO[zona][i]!,
        productoTerminado: 999999,
        previsionDemanda: 999999,
        uPublicidadOverride: {
          alto: F.CONOCIMIENTO[zona].alto[i]!,
          bajo: F.CONOCIMIENTO[zona].bajo[i]!,
        },
        uProductoOverride: {
          alto: F.PRODUCTO[fase].alto[i]!,
          bajo: F.PRODUCTO[fase].bajo[i]!,
        },
      };
    }),
  }));

  const zonas = F.ZONAS.map((nombre) => ({
    zonaId: nombre,
    nombre,
    fase: F.FASE[nombre],
    distribuidores: F.DISTRIBUIDORES[nombre],
    limitePrecio: F.LIMITE_PRECIO[nombre],
    demanda: {
      alto: { cantidadPorEmpresa: F.CANTIDAD[nombre].alto },
      bajo: { cantidadPorEmpresa: F.CANTIDAD[nombre].bajo },
    },
  }));

  const gA = F.EXPONENTES.growth.alto;
  const gB = F.EXPONENTES.growth.bajo;
  const rA = F.EXPONENTES.rollout.alto;
  const rB = F.EXPONENTES.rollout.bajo;

  const multRollout = {
    precio: Math.sqrt((rA.precio / gA.precio) * (rB.precio / gB.precio)),
    publicidad: Math.sqrt((rA.publicidad / gA.publicidad) * (rB.publicidad / gB.publicidad)),
    producto: Math.sqrt((rA.producto / gA.producto) * (rB.producto / gB.producto)),
    canal: rA.canal / gA.canal,
    presupuesto: 1.0,
    generico: 1.0,
    caracteristicasMarca: 1.0,
  };

  const input: CommercialInput = {
    periodo: 7,
    empresas,
    zonas,
    kappaPrecio: F.KAPPA_PRECIO,
    canalParams: F.CANAL,
    loyalty: F.LOYALTY,
    pesosSegmento: {
      alto: {
        precio: gA.precio, publicidad: gA.publicidad, producto: gA.producto,
        canal: gA.canal, presupuesto: gA.presupuesto,
        generico: 1.0, caracteristicasMarca: 1.0, correccionUtilidad: gA.correccion,
      },
      bajo: {
        precio: gB.precio, publicidad: gB.publicidad, producto: gB.producto,
        canal: gB.canal, presupuesto: gB.presupuesto,
        generico: 1.0, caracteristicasMarca: 1.0, correccionUtilidad: gB.correccion,
      },
    },
    multFase: {
      growth: { precio: 1.0, producto: 1.0, canal: 1.0, publicidad: 1.0, presupuesto: 1.0, generico: 1.0, caracteristicasMarca: 1.0 },
      rollout: multRollout,
      maturity: { precio: 1.0, producto: 1.0, canal: 1.0, publicidad: 1.0, presupuesto: 1.0, generico: 1.0, caracteristicasMarca: 1.0 },
      hypermaturity: { precio: 1.0, producto: 1.0, canal: 1.0, publicidad: 1.0, presupuesto: 1.0, generico: 1.0, caracteristicasMarca: 1.0 },
    },
    rotacionAdquisicion: {
      rollout: { rotacion: 0, adquisicion: 0 },
      growth: { rotacion: 0, adquisicion: 0 },
      maturity: { rotacion: 0, adquisicion: 0 },
      hypermaturity: { rotacion: 0, adquisicion: 0 },
    },
    desiredValues: {
      rollout: { alto: { desiredValue: { sostenibilidad: 0.5, conveniencia: 0.5, rendimiento: 0.5, funcionalidadesExtra: 0.5, eficiencia: 0.5 }, propension: { sostenibilidad: 0.5, conveniencia: 0.5, rendimiento: 0.5, funcionalidadesExtra: 0.5, eficiencia: 0.5 } }, bajo: { desiredValue: { sostenibilidad: 0.5, conveniencia: 0.5, rendimiento: 0.5, funcionalidadesExtra: 0.5, eficiencia: 0.5 }, propension: { sostenibilidad: 0.5, conveniencia: 0.5, rendimiento: 0.5, funcionalidadesExtra: 0.5, eficiencia: 0.5 } } },
      growth: { alto: { desiredValue: { sostenibilidad: 0.5, conveniencia: 0.5, rendimiento: 0.5, funcionalidadesExtra: 0.5, eficiencia: 0.5 }, propension: { sostenibilidad: 0.5, conveniencia: 0.5, rendimiento: 0.5, funcionalidadesExtra: 0.5, eficiencia: 0.5 } }, bajo: { desiredValue: { sostenibilidad: 0.5, conveniencia: 0.5, rendimiento: 0.5, funcionalidadesExtra: 0.5, eficiencia: 0.5 }, propension: { sostenibilidad: 0.5, conveniencia: 0.5, rendimiento: 0.5, funcionalidadesExtra: 0.5, eficiencia: 0.5 } } },
      maturity: { alto: { desiredValue: { sostenibilidad: 0.5, conveniencia: 0.5, rendimiento: 0.5, funcionalidadesExtra: 0.5, eficiencia: 0.5 }, propension: { sostenibilidad: 0.5, conveniencia: 0.5, rendimiento: 0.5, funcionalidadesExtra: 0.5, eficiencia: 0.5 } }, bajo: { desiredValue: { sostenibilidad: 0.5, conveniencia: 0.5, rendimiento: 0.5, funcionalidadesExtra: 0.5, eficiencia: 0.5 }, propension: { sostenibilidad: 0.5, conveniencia: 0.5, rendimiento: 0.5, funcionalidadesExtra: 0.5, eficiencia: 0.5 } } },
      hypermaturity: { alto: { desiredValue: { sostenibilidad: 0.5, conveniencia: 0.5, rendimiento: 0.5, funcionalidadesExtra: 0.5, eficiencia: 0.5 }, propension: { sostenibilidad: 0.5, conveniencia: 0.5, rendimiento: 0.5, funcionalidadesExtra: 0.5, eficiencia: 0.5 } }, bajo: { desiredValue: { sostenibilidad: 0.5, conveniencia: 0.5, rendimiento: 0.5, funcionalidadesExtra: 0.5, eficiencia: 0.5 }, propension: { sostenibilidad: 0.5, conveniencia: 0.5, rendimiento: 0.5, funcionalidadesExtra: 0.5, eficiencia: 0.5 } } },
    },
    valorInicialDimension: 0.2,
    improvements: [],
  };

  const conocimiento: EstadoPrevio["conocimiento"] = {};
  const cuotaAsignada: EstadoPrevio["cuotaAsignada"] = {};
  for (let i = 0; i < F.EMPRESAS.length; i++) {
    const emp = F.EMPRESAS[i]!;
    conocimiento[emp] = {};
    cuotaAsignada[emp] = {};
    for (const zona of F.ZONAS) {
      conocimiento[emp]![zona] = {
        alto: F.CONOCIMIENTO[zona].alto[i]!,
        bajo: F.CONOCIMIENTO[zona].bajo[i]!,
      };
      if (zona in F.CUOTA_PREVIA) {
        cuotaAsignada[emp]![zona] = {
          alto: F.CUOTA_PREVIA[zona as keyof typeof F.CUOTA_PREVIA],
          bajo: F.CUOTA_PREVIA[zona as keyof typeof F.CUOTA_PREVIA],
        };
      }
    }
  }

  return { input, estadoPrevio: { conocimiento, cuotaAsignada } };
}

describe("Prueba de extremo a extremo -- Periodo 7 vs cuota asignada real", () => {
  const { input, estadoPrevio } = buildInput();

  it("Error global menor a 2.5 pp", () => {
    const output = simulateCommercialPeriod(input, estadoPrevio);

    let totalError = 0;
    let totalCases = 0;

    for (const zona of F.ZONAS) {
      for (const seg of ["alto", "bajo"] as const) {
        for (let i = 0; i < F.EMPRESAS.length; i++) {
          const emp = F.EMPRESAS[i]!;
          const r = output.resultados.find(
            (r) => r.empresaId === emp && r.zonaId === zona && r.segmento === seg,
          );
          expect(r).toBeDefined();
          const expected = F.CUOTA_ASIGNADA_REAL[zona][seg][i]!;
          const actual = r!.cuotaAsignada * 100;

          if (expected === 0) {
            expect(actual).toBe(0);
          } else {
            totalError += Math.abs(actual - expected);
            totalCases++;
          }
        }
      }
    }

    const avgError = totalError / totalCases;
    expect(avgError).toBeLessThan(2.5);
  });

  it("Error en zonas Growth menor a 1.1 pp", () => {
    const output = simulateCommercialPeriod(input, estadoPrevio);

    const growthZones = ["Centro", "Oeste", "Norte"] as const;
    let totalError = 0;
    let totalCases = 0;

    for (const zona of growthZones) {
      for (const seg of ["alto", "bajo"] as const) {
        for (let i = 0; i < F.EMPRESAS.length; i++) {
          const emp = F.EMPRESAS[i]!;
          const r = output.resultados.find(
            (r) => r.empresaId === emp && r.zonaId === zona && r.segmento === seg,
          );
          const expected = F.CUOTA_ASIGNADA_REAL[zona][seg][i]!;
          const actual = r!.cuotaAsignada * 100;
          totalError += Math.abs(actual - expected);
          totalCases++;
        }
      }
    }

    const avgError = totalError / totalCases;
    expect(avgError).toBeLessThan(1.1);
  });
});
