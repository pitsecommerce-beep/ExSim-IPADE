/**
 * Atractivo de producto (percibido) — Motor Comercial Mezquite §4.3
 *
 * Dos capas:
 * 1. Aditiva: vector_producto = valor_inicial + Σ(mejoras activas · D1..D5)
 * 2. Punto ideal: u_producto = Π( similitud_d ^ propensión_d ) × 100
 *    donde similitud_d = 1 − |ofrecido_d − desiredValue_d|
 *
 * SUPUESTO: la forma funcional de h es un producto de similitudes elevadas a la
 * propensión, como propone ARCHITECTURAL-DECISIONS.md. Validado parcialmente contra
 * la partición por fase de ECO-KLIN (§4.3 del Motor Comercial).
 */

import type { DimensionValue, DesiredValueConfig, ImprovementDimensions } from "./types.js";

export function calcularVectorProducto(
  mejorasActivas: ReadonlyArray<string>,
  improvements: ReadonlyArray<ImprovementDimensions>,
  valorInicial: number,
): DimensionValue {
  let s = valorInicial;
  let c = valorInicial;
  let r = valorInicial;
  let f = valorInicial;
  let e = valorInicial;

  for (const mejora of improvements) {
    if (mejorasActivas.includes(mejora.improvementId)) {
      s += mejora.d1;
      c += mejora.d2;
      r += mejora.d3;
      f += mejora.d4;
      e += mejora.d5;
    }
  }

  return {
    sostenibilidad: s,
    conveniencia: c,
    rendimiento: r,
    funcionalidadesExtra: f,
    eficiencia: e,
  };
}

export function calcularUProducto(
  vectorProducto: DimensionValue,
  config: DesiredValueConfig,
): number {
  const dims: ReadonlyArray<keyof DimensionValue> = [
    "sostenibilidad",
    "conveniencia",
    "rendimiento",
    "funcionalidadesExtra",
    "eficiencia",
  ];

  let producto = 1;
  for (const dim of dims) {
    const ofrecido = vectorProducto[dim];
    const desired = config.desiredValue[dim];
    const propension = config.propension[dim];
    const similitud = Math.max(0, 1 - Math.abs(ofrecido - desired));
    producto *= Math.pow(similitud, propension);
  }

  return producto * 100;
}
