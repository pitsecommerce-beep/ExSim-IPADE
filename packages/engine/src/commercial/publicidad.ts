/**
 * Conocimiento de marca (stock) -- Motor Comercial Mezquite §4.2
 *
 * Conoc(t) = Conoc(t-1) * (1 - rotacion_f) + adquisicion_f * g(spots_t) * (1 - Conoc(t-1))
 *
 * g es aditivamente separable: g = gTV(tvGenerico) + coefRadio[s] * radioGenerico
 *
 * REFUTADO: la forma dinamica (Nerlove-Arrow con saturacion, aditiva con retencion) no
 * generaliza entre periodos. Ambas estiman una retencion > 1, que es imposible. En zonas
 * nuevas el modelo si reproduce el conocimiento con error < 0.25 porque el stock previo
 * es cero. La ruta calculada NO debe usarse para propagar el stock entre periodos hasta
 * que la forma dinamica se identifique. Se expone un modo donde el conocimiento se
 * inyecta como dato (rotacion=0, adquisicion=0 preserva el stock previo).
 *
 * Los coeficientes de radio estan medidos empiricamente:
 *   Alto: 0.072 puntos por spot generico
 *   Bajo: 0.133 puntos por spot generico
 */

const COEF_RADIO_ALTO = 0.072;
const COEF_RADIO_BAJO = 0.133;

// §7.2: respuesta de TV por interpolacion lineal sobre puntos medidos.
// Los tres primeros tramos son MEDIDOS (VERIFICADO). Los puntos 40 y 200 son EXTRAPOLACION.
// [x_spots, base_alto, base_bajo]
const CURVA_TV: ReadonlyArray<readonly [number, number, number]> = [
  [0,   0.00,  0.00],
  [5,   7.70,  4.89],
  [6,  19.52,  8.72],
  [7,  28.79, 12.09],
  [15, 40.07, 23.57],
  [40, 55.00, 35.00],  // EXTRAPOLADO
  [200,70.00, 45.00],  // EXTRAPOLADO
];

function interpolarTV(spots: number, segmento: "alto" | "bajo"): number {
  if (spots <= 0) return 0;
  const col = segmento === "alto" ? 1 : 2;
  for (let i = 1; i < CURVA_TV.length; i++) {
    const [x0, ...y0] = CURVA_TV[i - 1]!;
    const [x1, ...y1] = CURVA_TV[i]!;
    if (spots <= x1!) {
      const t = (spots - x0!) / (x1! - x0!);
      return y0[col - 1]! + t * (y1[col - 1]! - y0[col - 1]!);
    }
  }
  const last = CURVA_TV[CURVA_TV.length - 1]!;
  return last[col]!;
}

export function calcularGPublicidad(
  tvGenerico: number,
  radioGenerico: number,
  segmento: "alto" | "bajo",
): number {
  const coefRadio = segmento === "alto" ? COEF_RADIO_ALTO : COEF_RADIO_BAJO;
  return interpolarTV(tvGenerico, segmento) + coefRadio * radioGenerico;
}

// §4.2(a): stock de conocimiento con decaimiento y adquisicion
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
