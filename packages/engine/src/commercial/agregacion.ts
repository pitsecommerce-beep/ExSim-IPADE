/**
 * Agregación multiplicativa — Motor Comercial Mezquite §5.1
 *
 * A_i = correcciónUtilidad[s] × Π_k( (u_k / 100) ^ (pesoSegmento[k][s] × multFase[k][fase]) )
 *
 * §5.2: F_i = A_i normalizado a media 100 entre empresas activas
 * §5.3: share = F_i / Σ F_j
 * §5.4: θ_i = Loyalty × θ_prev + (1 − Loyalty) × share
 */

import type { PesoSegmento, MultFase } from "./types.js";

export function calcularAtraccion(
  uPrecio: number,
  uPublicidad: number,
  uProducto: number,
  uCanal: number,
  uPresupuesto: number,
  pesos: PesoSegmento,
  multFase: MultFase,
): number {
  const factores: ReadonlyArray<{ u: number; pesoSeg: number; pesoFase: number }> = [
    { u: uPrecio, pesoSeg: pesos.precio, pesoFase: multFase.precio },
    { u: uPublicidad, pesoSeg: pesos.publicidad, pesoFase: multFase.publicidad },
    { u: uProducto, pesoSeg: pesos.producto, pesoFase: multFase.producto },
    { u: uCanal, pesoSeg: pesos.canal, pesoFase: multFase.canal },
    { u: uPresupuesto, pesoSeg: pesos.presupuesto, pesoFase: multFase.presupuesto },
  ];

  let producto = pesos.correccionUtilidad;
  for (const f of factores) {
    const uNorm = f.u / 100;
    if (uNorm <= 0) return 0;
    const exponente = f.pesoSeg * f.pesoFase;
    producto *= Math.pow(uNorm, exponente);
  }

  return producto;
}

// §5.2: normalizar a media 100
export function normalizarAMedia100(
  totales: ReadonlyArray<{ empresaId: string; total: number }>,
): ReadonlyArray<{ empresaId: string; final: number }> {
  const activos = totales.filter((t) => t.total > 0);
  if (activos.length === 0) return totales.map((t) => ({ empresaId: t.empresaId, final: 0 }));

  const media = activos.reduce((sum, t) => sum + t.total, 0) / activos.length;
  if (media === 0) return totales.map((t) => ({ empresaId: t.empresaId, final: 0 }));

  return totales.map((t) => ({
    empresaId: t.empresaId,
    final: t.total > 0 ? (t.total / media) * 100 : 0,
  }));
}

// §5.3: share de atracción
export function calcularShareAtraccion(
  finales: ReadonlyArray<{ empresaId: string; final: number }>,
): ReadonlyArray<{ empresaId: string; share: number }> {
  const sumaFinal = finales.reduce((sum, f) => sum + f.final, 0);
  if (sumaFinal === 0) return finales.map((f) => ({ empresaId: f.empresaId, share: 0 }));

  return finales.map((f) => ({
    empresaId: f.empresaId,
    share: f.final / sumaFinal,
  }));
}

// §5.4: mezcla de lealtad
export function calcularCuotaConLealtad(
  shareAtraccion: number,
  cuotaPrevia: number | undefined,
  loyalty: number,
): number {
  if (cuotaPrevia === undefined) {
    return shareAtraccion;
  }
  return loyalty * cuotaPrevia + (1 - loyalty) * shareAtraccion;
}

// §6.3: conversión a ventas por quincena
export function calcularVentasPeriodo(
  demandaGenerada: number,
  productoTerminado: number,
  previsionDemanda: number,
): { ventas: number; faltante: number } {
  let ventasTotal = 0;
  let faltanteTotal = 0;
  let inventarioDisponible = productoTerminado;

  for (let _q = 0; _q < 4; _q++) {
    const demandaQuincena = demandaGenerada / 4;
    const previsionQuincena = previsionDemanda / 4;
    const vendidas = Math.min(demandaQuincena, inventarioDisponible, previsionQuincena);
    inventarioDisponible -= vendidas;
    ventasTotal += vendidas;
    faltanteTotal += demandaQuincena - vendidas;
  }

  return { ventas: Math.round(ventasTotal), faltante: Math.round(faltanteTotal) };
}
