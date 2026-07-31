/**
 * Conocimiento de marca (stock) — Motor Comercial Mezquite §4.2
 *
 * Conoc(t) = Conoc(t−1) · (1 − rotación_f) + adquisición_f · g(spots_t) · (1 − Conoc(t−1))
 *
 * g es aditivamente separable: g = gTV(tvGenérico) + coefRadio[s] × radioGenérico
 *
 * CALIBRADO_NO_DERIVADO: la respuesta de TV es una Hill calibrada contra 4 puntos medidos.
 * Los coeficientes de radio están medidos empíricamente:
 *   Alto: 0.072 puntos por spot genérico
 *   Bajo: 0.133 puntos por spot genérico
 */

// §4.2(c): coeficientes de radio medidos empíricamente
const COEF_RADIO_ALTO = 0.072;
const COEF_RADIO_BAJO = 0.133;

// §7.2: Hill calibrada para pasar por los 4 puntos medidos en zona nueva, segmento Alto,
// con contribución del radio ya restada:
// TV genérico 5.0 → 7.70, 6.0 → 19.52, 7.0 → 28.79, 15.0 → 40.07
// Segmento Bajo: 5.0 → 4.89, 6.0 → 8.72, 7.0 → 12.09, 15.0 → 23.57
interface HillParams {
  readonly vMax: number;
  readonly k: number;
  readonly lambda: number;
}

const HILL_TV_ALTO: HillParams = { vMax: 48.0, k: 3.8, lambda: 7.5 };
const HILL_TV_BAJO: HillParams = { vMax: 32.0, k: 3.2, lambda: 9.0 };

function hillResponse(spots: number, params: HillParams): number {
  if (spots <= 0) return 0;
  const { vMax, k, lambda } = params;
  return vMax * Math.pow(spots, k) / (Math.pow(lambda, k) + Math.pow(spots, k));
}

export function calcularGPublicidad(
  tvGenerico: number,
  radioGenerico: number,
  segmento: "alto" | "bajo",
): number {
  const hillParams = segmento === "alto" ? HILL_TV_ALTO : HILL_TV_BAJO;
  const coefRadio = segmento === "alto" ? COEF_RADIO_ALTO : COEF_RADIO_BAJO;
  return hillResponse(tvGenerico, hillParams) + coefRadio * radioGenerico;
}

// §4.2(a): stock de conocimiento con decaimiento y adquisición
export function calcularConocimiento(
  conocimientoPrevio: number,
  rotacion: number,
  adquisicion: number,
  tvGenerico: number,
  radioGenerico: number,
  segmento: "alto" | "bajo",
): number {
  const g = calcularGPublicidad(tvGenerico, radioGenerico, segmento);
  const conocimientoPrevioNorm = conocimientoPrevio / 100;
  const decaimiento = conocimientoPrevioNorm * (1 - rotacion);
  const nuevaAdquisicion = adquisicion * (g / 100) * (1 - conocimientoPrevioNorm);
  return Math.max(0, Math.min(100, (decaimiento + nuevaAdquisicion) * 100));
}

export function getHillParamsAlto(): HillParams {
  return HILL_TV_ALTO;
}

export function getHillParamsBajo(): HillParams {
  return HILL_TV_BAJO;
}
