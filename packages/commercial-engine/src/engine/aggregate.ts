import type { SegmentConfig, PhaseConfig, EngineFlags } from "../types.js";

export interface FactorValues {
  readonly precio: number;
  readonly presupuesto: number;
  readonly promocion: number;
  readonly publicidad: number;
  readonly producto: number;
}

export function computeTotalIndex(
  factors: FactorValues,
  segment: SegmentConfig,
  phase: PhaseConfig,
  escalaGlobal: number,
  flags: EngineFlags,
  noise: number,
): number {
  const entries: ReadonlyArray<{
    value: number;
    segWeight: number;
    phaseMult: number;
    applySegFase: boolean;
  }> = [
    {
      value: factors.precio,
      segWeight: segment.w_precio,
      phaseMult: phase.mult_precio,
      applySegFase: flags.aplicar_mult_seg_fase_precio,
    },
    {
      value: factors.presupuesto,
      segWeight: 1.0,
      phaseMult: 1.0,
      applySegFase: flags.aplicar_mult_seg_fase_presupuesto,
    },
    {
      value: factors.promocion,
      segWeight: segment.w_canales,
      phaseMult: phase.mult_canales,
      applySegFase: flags.aplicar_mult_seg_fase_canales,
    },
    {
      value: factors.publicidad,
      segWeight: segment.w_publicidad,
      phaseMult: phase.mult_publicidad,
      applySegFase: flags.aplicar_mult_seg_fase_publicidad,
    },
    {
      value: factors.producto,
      segWeight: segment.w_producto,
      phaseMult: phase.mult_producto,
      applySegFase: flags.aplicar_mult_seg_fase_producto,
    },
  ];

  let product = segment.correccion_utilidad;

  for (const e of entries) {
    const uNorm = e.value / 100;
    if (uNorm <= 0) {
      if (flags.zero_factor_kills_total) return 0;
      continue;
    }

    let exponent: number;
    if (e.applySegFase) {
      exponent = escalaGlobal * e.segWeight * e.phaseMult;
    } else {
      exponent = escalaGlobal;
    }

    product *= Math.pow(uNorm, exponent);
  }

  return product * noise;
}
