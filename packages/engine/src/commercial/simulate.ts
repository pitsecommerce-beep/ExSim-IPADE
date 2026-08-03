/**
 * Motor comercial completo -- Motor Comercial Mezquite §6.6
 *
 * Orquesta los 5 atributos, agregacion, normalizacion, lealtad,
 * demanda generada y conversion a ventas.
 *
 * Funcion pura: simulateCommercialPeriod(input, estadoPrevio) => output
 */

import type {
  CommercialInput,
  CommercialOutput,
  EmpresaZonaSegmentoResult,
  EstadoPrevio,
  Phase,
} from "./types.js";
import { calcularUPrecio, calcularPromedioPrecios } from "./precio.js";
import { calcularUPresupuesto } from "./presupuesto.js";
import { calcularUCanal } from "./canal.js";
import { calcularConocimiento } from "./publicidad.js";
import { calcularVectorProducto, calcularUProducto } from "./producto.js";
import {
  calcularAtraccion,
  normalizarAMedia100,
  calcularShareAtraccion,
  calcularCuotaConLealtad,
  calcularVentasPeriodo,
} from "./agregacion.js";

type Segmento = "alto" | "bajo";
const SEGMENTOS: ReadonlyArray<Segmento> = ["alto", "bajo"];

interface SegmentoResult {
  empresaId: string;
  segmento: Segmento;
  atributos: {
    uPrecio: number;
    uPresupuesto: number;
    uCanal: number;
    uPublicidad: number;
    uProducto: number;
  };
  total: number;
  final: number;
  shareAtraccion: number;
  cuotaAsignada: number;
  demandaGenerada: number;
  productoTerminado: number;
  previsionDemanda: number;
}

export function simulateCommercialPeriod(
  input: CommercialInput,
  estadoPrevio?: EstadoPrevio,
): CommercialOutput {
  const resultados: EmpresaZonaSegmentoResult[] = [];
  const conocimientoNuevo: Record<string, Record<string, { alto: number; bajo: number }>> = {};
  const cuotaAsignadaNueva: Record<string, Record<string, { alto: number; bajo: number }>> = {};

  for (const zona of input.zonas) {
    const empresasEnZona = input.empresas
      .map((emp) => {
        const decZona = emp.decisiones.find((d) => d.zonaId === zona.zonaId);
        return { empresa: emp, decZona };
      })
      .filter((e) => e.decZona !== undefined);

    const preciosPresentes = empresasEnZona
      .map((e) => e.decZona!.precio)
      .filter((p) => p > 0);

    const pbar = calcularPromedioPrecios(preciosPresentes);

    const tieneHistoriaZona = (segmento: Segmento): boolean => {
      if (!estadoPrevio) return false;
      return Object.values(estadoPrevio.cuotaAsignada).some(
        (empData) => empData[zona.zonaId]?.[segmento] !== undefined,
      );
    };

    const segmentoResults: SegmentoResult[] = [];

    for (const segmento of SEGMENTOS) {
      const loyalty = getLoyalty(zona.fase, segmento, input.loyalty);
      const pesos = segmento === "alto" ? input.pesosSegmento.alto : input.pesosSegmento.bajo;
      const multFase = input.multFase[zona.fase];

      const desiredConfig = input.desiredValues[zona.fase][segmento];

      const limitePrecio = segmento === "alto"
        ? zona.limitePrecio.alto
        : zona.limitePrecio.bajo;

      const demandaZona = segmento === "alto" ? zona.demanda.alto : zona.demanda.bajo;
      const demandaTotal = demandaZona.cantidadPorEmpresa * input.empresas.length;

      const atributosPorEmpresa: Array<{
        empresaId: string;
        uPrecio: number;
        uPresupuesto: number;
        uCanal: number;
        uPublicidad: number;
        uProducto: number;
        total: number;
        productoTerminado: number;
        previsionDemanda: number;
      }> = [];

      for (const { empresa, decZona } of empresasEnZona) {
        const dec = decZona!;
        const precio = dec.precio;

        if (precio === 0) {
          atributosPorEmpresa.push({
            empresaId: empresa.empresaId,
            uPrecio: 0, uPresupuesto: 0, uCanal: 0, uPublicidad: 0, uProducto: 0,
            total: 0,
            productoTerminado: dec.productoTerminado,
            previsionDemanda: dec.previsionDemanda,
          });
          continue;
        }

        const uPrecio = calcularUPrecio(precio, pbar, segmento === "alto"
          ? input.kappaPrecio.alto
          : input.kappaPrecio.bajo);

        const uPresupuesto = calcularUPresupuesto(precio, limitePrecio);

        const uCanal = calcularUCanal(
          dec.vendedores, zona.distribuidores,
          input.canalParams.alfa, input.canalParams.kappa,
        );

        const tvGenerico = empresa.spotsTV * (1 - empresa.enfoqueMarcaTV);
        const radioGenerico = dec.spotsRadio * (1 - dec.enfoqueMarcaRadio);

        const conocPrevio = getConocimientoPrevio(
          estadoPrevio, empresa.empresaId, zona.zonaId, segmento,
        );

        const pubOverride = dec.uPublicidadOverride?.[segmento];
        let uPublicidad: number;
        if (pubOverride !== undefined) {
          uPublicidad = pubOverride;
        } else {
          const rotAdq = input.rotacionAdquisicion[zona.fase];
          uPublicidad = calcularConocimiento(
            conocPrevio, rotAdq.rotacion, rotAdq.adquisicion,
            tvGenerico, radioGenerico, segmento,
          );
        }

        setConocimiento(
          conocimientoNuevo, empresa.empresaId, zona.zonaId, segmento, uPublicidad,
        );

        const prodOverride = dec.uProductoOverride?.[segmento];
        let uProducto: number;
        if (prodOverride !== undefined) {
          uProducto = prodOverride;
        } else {
          const vectorProducto = calcularVectorProducto(
            empresa.mejorasActivas, input.improvements, input.valorInicialDimension,
          );
          uProducto = calcularUProducto(vectorProducto, desiredConfig);
        }

        const total = calcularAtraccion(
          uPrecio, uPublicidad, uProducto, uCanal, uPresupuesto,
          pesos, multFase,
        );

        atributosPorEmpresa.push({
          empresaId: empresa.empresaId,
          uPrecio, uPresupuesto, uCanal, uPublicidad, uProducto, total,
          productoTerminado: dec.productoTerminado,
          previsionDemanda: dec.previsionDemanda,
        });
      }

      const totalesParaNorm = atributosPorEmpresa.map((a) => ({
        empresaId: a.empresaId, total: a.total,
      }));
      const finales = normalizarAMedia100(totalesParaNorm);
      const shares = calcularShareAtraccion(finales);

      for (const atr of atributosPorEmpresa) {
        const finalVal = finales.find((f) => f.empresaId === atr.empresaId)?.final ?? 0;
        const shareVal = shares.find((s) => s.empresaId === atr.empresaId)?.share ?? 0;

        const cuotaPrev = tieneHistoriaZona(segmento)
          ? getCuotaPrevia(estadoPrevio!, atr.empresaId, zona.zonaId, segmento)
          : undefined;

        const cuotaAsignada = atr.total > 0
          ? calcularCuotaConLealtad(shareVal, cuotaPrev, loyalty)
          : 0;

        setCuotaAsignada(
          cuotaAsignadaNueva, atr.empresaId, zona.zonaId, segmento, cuotaAsignada,
        );

        const demandaGenerada = cuotaAsignada * demandaTotal;

        segmentoResults.push({
          empresaId: atr.empresaId,
          segmento,
          atributos: {
            uPrecio: atr.uPrecio, uPresupuesto: atr.uPresupuesto,
            uCanal: atr.uCanal, uPublicidad: atr.uPublicidad, uProducto: atr.uProducto,
          },
          total: atr.total, final: finalVal, shareAtraccion: shareVal,
          cuotaAsignada, demandaGenerada,
          productoTerminado: atr.productoTerminado,
          previsionDemanda: atr.previsionDemanda,
        });
      }
    }

    // §6.3: inventory constraint is per zone, not per segment.
    // Aggregate demand across segments, apply min(inventory, forecast) at zone level,
    // then split sales back to segments in proportion to demand.
    const empresaIds = [...new Set(segmentoResults.map((r) => r.empresaId))];
    for (const empId of empresaIds) {
      const empSegs = segmentoResults.filter((r) => r.empresaId === empId);
      const demandaAlto = empSegs.find((r) => r.segmento === "alto")?.demandaGenerada ?? 0;
      const demandaBajo = empSegs.find((r) => r.segmento === "bajo")?.demandaGenerada ?? 0;
      const demandaZonaTotal = demandaAlto + demandaBajo;

      const empFirst = empSegs[0]!;
      const { ventas: ventasZona, faltante: faltanteZona } = calcularVentasPeriodo(
        demandaZonaTotal,
        empFirst.productoTerminado,
        empFirst.previsionDemanda,
      );

      for (const sr of empSegs) {
        const proporcion = demandaZonaTotal > 0
          ? sr.demandaGenerada / demandaZonaTotal
          : 0;
        const ventas = Math.round(ventasZona * proporcion);
        const faltante = Math.round(faltanteZona * proporcion);

        resultados.push({
          empresaId: sr.empresaId,
          zonaId: zona.zonaId,
          segmento: sr.segmento,
          atributos: sr.atributos,
          total: sr.total,
          final: sr.final,
          shareAtraccion: sr.shareAtraccion,
          cuotaAsignada: sr.cuotaAsignada,
          demandaGenerada: sr.demandaGenerada,
          ventas,
          faltante,
        });
      }
    }
  }

  return { resultados, conocimientoNuevo, cuotaAsignadaNueva };
}

function getLoyalty(
  fase: Phase,
  segmento: Segmento,
  loyalty: CommercialInput["loyalty"],
): number {
  const faseParams = loyalty[fase];
  return segmento === "alto" ? faseParams.alto : faseParams.bajo;
}

function getConocimientoPrevio(
  estado: EstadoPrevio | undefined,
  empresaId: string,
  zonaId: string,
  segmento: Segmento,
): number {
  if (!estado) return 0;
  return estado.conocimiento[empresaId]?.[zonaId]?.[segmento] ?? 0;
}

function getCuotaPrevia(
  estado: EstadoPrevio,
  empresaId: string,
  zonaId: string,
  segmento: Segmento,
): number | undefined {
  return estado.cuotaAsignada[empresaId]?.[zonaId]?.[segmento];
}

function setConocimiento(
  conocimiento: Record<string, Record<string, { alto: number; bajo: number }>>,
  empresaId: string,
  zonaId: string,
  segmento: Segmento,
  valor: number,
): void {
  if (!conocimiento[empresaId]) conocimiento[empresaId] = {};
  if (!conocimiento[empresaId]![zonaId]) {
    conocimiento[empresaId]![zonaId] = { alto: 0, bajo: 0 };
  }
  conocimiento[empresaId]![zonaId]![segmento] = valor;
}

function setCuotaAsignada(
  cuotas: Record<string, Record<string, { alto: number; bajo: number }>>,
  empresaId: string,
  zonaId: string,
  segmento: Segmento,
  valor: number,
): void {
  if (!cuotas[empresaId]) cuotas[empresaId] = {};
  if (!cuotas[empresaId]![zonaId]) {
    cuotas[empresaId]![zonaId] = { alto: 0, bajo: 0 };
  }
  cuotas[empresaId]![zonaId]![segmento] = valor;
}
