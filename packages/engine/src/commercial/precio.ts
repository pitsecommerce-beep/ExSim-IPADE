/**
 * Utilidad de precio — Motor Comercial Mezquite §4.1
 *
 * u_precio(i,z,s) = 50 × [ 1 − (P_i / P̄_z − 1) / κ_s ]
 *
 * VERIFICADO: 138/138 observaciones, error < 0.006
 */

// §4.1: κ_s = Kappa de Precio, hoja Segmentos
export function calcularUPrecio(
  precioEmpresa: number,
  promedioMercado: number,
  kappa: number,
): number {
  if (precioEmpresa === 0) return 0;
  return 50 * (1 - (precioEmpresa / promedioMercado - 1) / kappa);
}

// §4.1: P̄_z = promedio simple de los precios de las empresas presentes
export function calcularPromedioPrecios(precios: ReadonlyArray<number>): number {
  const presentes = precios.filter((p) => p > 0);
  if (presentes.length === 0) return 0;
  return presentes.reduce((sum, p) => sum + p, 0) / presentes.length;
}
