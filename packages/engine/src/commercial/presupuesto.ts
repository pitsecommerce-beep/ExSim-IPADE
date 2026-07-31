/**
 * Utilidad de presupuesto (asequibilidad) — Motor Comercial Mezquite §4.5
 *
 * u_presupuesto(i,z,s) = 100 × exp( −(P_i / L_{z,s})^15 )
 *
 * VERIFICADO: exponente 15 estimado por regresión log-log, rango 14.82 a 15.08
 */

// §4.5: L_{z,s} = Límite de Precio, hoja Demanda
const EXPONENTE_PRESUPUESTO = 15;

export function calcularUPresupuesto(
  precioEmpresa: number,
  limitePrecio: number,
): number {
  if (precioEmpresa === 0) return 0;
  return 100 * Math.exp(-Math.pow(precioEmpresa / limitePrecio, EXPONENTE_PRESUPUESTO));
}
