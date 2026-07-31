/**
 * Motor comercial completo — Motor Comercial Mezquite §6.6
 *
 * Orquesta los 5 atributos, agregación, normalización, lealtad,
 * demanda generada y conversión a ventas.
 *
 * Función pura: simulateCommercialPeriod(input, estadoPrevio) => output
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

    const tieneHistoria =
      estadoPrevio !== undefined &&
      Object.keys(estadoPrevio.cuotaAsignada).length > 0;

    for (const segmento of SEGMENTOS) {
      const loyalty = getLoyalty(zona.fase, segmento, input.loyalty);
      const pesos = segmento === "alto" ? input.pesosSegmento.alto : input.pesosSegmento.bajo;
      const multFase = input.multFase[zona.fase];

      const desiredConfig =
        input.desiredValues[zona.fase][segmento];

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
            uPrecio: 0,
            uPresupuesto: 0,
            uCanal: 0,
            uPublicidad: 0,
            uProducto: 0,
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
          dec.vendedores,
          zona.distribuidores,
          input.canalParams.alfa,
          input.canalParams.kappa,
        );

        const tvGenerico = empresa.spotsTV * (1 - empresa.enfoqueMarcaTV);
        const radioGenerico = dec.spotsRadio * (1 - dec.enfoqueMarcaRadio);

        const conocPrevio = getConocimientoPrevio(
          estadoPrevio, empresa.empresaId, zona.zonaId, segmento,
        );

        const rotAdq = input.rotacionAdquisicion[zona.fase];
        const uPublicidad = calcularConocimiento(
          conocPrevio,
          rotAdq.rotacion,
          rotAdq.adquisicion,
          tvGenerico,
          radioGenerico,
          segmento,
        );

        setConocimiento(
          conocimientoNuevo, empresa.empresaId, zona.zonaId, segmento, uPublicidad,
        );

        const vectorProducto = calcularVectorProducto(
          empresa.mejorasActivas,
          input.improvements,
          input.valorInicialDimension,
        );
        const uProducto = calcularUProducto(vectorProducto, desiredConfig);

        const total = calcularAtraccion(
          uPrecio, uPublicidad, uProducto, uCanal, uPresupuesto,
          pesos, multFase,
        );

        atributosPorEmpresa.push({
          empresaId: empresa.empresaId,
          uPrecio,
          uPresupuesto,
          uCanal,
          uPublicidad,
          uProducto,
          total,
          productoTerminado: dec.productoTerminado,
          previsionDemanda: dec.previsionDemanda,
        });
      }

      const totalesParaNorm = atributosPorEmpresa.map((a) => ({
        empresaId: a.empresaId,
        total: a.total,
      }));
      const finales = normalizarAMedia100(totalesParaNorm);
      const shares = calcularShareAtraccion(finales);

      for (const atr of atributosPorEmpresa) {
        const finalVal = finales.find((f) => f.empresaId === atr.empresaId)?.final ?? 0;
        const shareVal = shares.find((s) => s.empresaId === atr.empresaId)?.share ?? 0;

        const cuotaPrev = tieneHistoria
          ? getCuotaPrevia(estadoPrevio!, atr.empresaId, zona.zonaId, segmento)
          : undefined;

        const cuotaAsignada = atr.total > 0
          ? calcularCuotaConLealtad(shareVal, cuotaPrev, loyalty)
          : 0;

        setCuotaAsignada(
          cuotaAsignadaNueva, atr.empresaId, zona.zonaId, segmento, cuotaAsignada,
        );

        const demandaGenerada = cuotaAsignada * demandaTotal;
        const { ventas, faltante } = calcularVentasPeriodo(
          demandaGenerada,
          atr.productoTerminado,
          atr.previsionDemanda,
        );

        resultados.push({
          empresaId: atr.empresaId,
          zonaId: zona.zonaId,
          segmento,
          atributos: {
            uPrecio: atr.uPrecio,
            uPresupuesto: atr.uPresupuesto,
            uCanal: atr.uCanal,
            uPublicidad: atr.uPublicidad,
            uProducto: atr.uProducto,
          },
          total: atr.total,
          final: finalVal,
          shareAtraccion: shareVal,
          cuotaAsignada,
          demandaGenerada,
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
): number {
  return estado.cuotaAsignada[empresaId]?.[zonaId]?.[segmento] ?? 0;
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
