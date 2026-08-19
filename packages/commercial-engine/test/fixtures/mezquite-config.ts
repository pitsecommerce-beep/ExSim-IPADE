import type {
  CommercialConfig,
  SegmentConfig,
  PhaseConfig,
  SegmentPhaseConfig,
  DimensionConfig,
  SegmentDimensionPhaseConfig,
  ChannelConfig,
  ChannelZoneConfig,
  MediumConfig,
  MediaSegmentConfig,
  ImprovementConfig,
  DemandRow,
  CoefficientConfig,
  EngineFlags,
  ZonePhaseScheduleEntry,
  ComercialParams,
} from "../../src/types.js";

import seedData from "./params_seed.json" with { type: "json" };

const seed = seedData as Record<string, unknown>;

const comercialParams: ComercialParams = {
  dopaje_base100: 105,
  escala_global: 0.25,
  actualizacion_instantanea: true,
};

const segments: SegmentConfig[] = (seed.segmentos as Array<Record<string, unknown>>).map((s) => ({
  key: s.nombre_en as string === "High" ? "Alto" : "Bajo",
  w_precio: s.precio as number,
  w_producto: s.producto as number,
  w_canales: s.canales_distribucion as number,
  w_publicidad: s.publicidad as number,
  w_generico: s.generico as number,
  w_caracteristicas_marca: s.caracteristicas_marca as number,
  kappa_precio: s.kappa_precio as number,
  correccion_utilidad: s.correccion_utilidad as number,
}));

const phases: PhaseConfig[] = (seed.fases as Array<Record<string, unknown>>).map((f) => ({
  key: f.fase as string,
  mult_precio: f.precio as number,
  mult_producto: f.producto as number,
  mult_canales: f.canales_distribucion as number,
  mult_publicidad: f.publicidad as number,
  mult_generico: f.generico as number,
  mult_caracteristicas_marca: f.caracteristicas_marca as number,
  mult_correccion_utilidad: f.correccion_utilidad as number,
  rotacion_conocimiento: f.rotacion_conocimiento as number,
  adquisicion_conocimiento: f.adquisicion_conocimiento as number,
  error_base: f.error_base as number,
}));

const segmentPhases: SegmentPhaseConfig[] = (seed.segmentos_fases as Array<Record<string, unknown>>).map((sf) => ({
  segmentKey: sf.segmento as string,
  phaseKey: sf.fase as string,
  loyalty: sf.loyalty as number,
  umbral: sf.umbral as number,
  compra_espontanea: sf.compra_espontanea as number,
}));

const dimensions: DimensionConfig[] = (seed.dimensiones_producto as Array<Record<string, unknown>>).map((d) => ({
  key: d.clave as string,
  name: d.nombre_en as string,
}));

const segmentDimensionPhases: SegmentDimensionPhaseConfig[] = (seed.segmentos_dimensiones_fases as Array<Record<string, unknown>>).map((sdf) => ({
  segmentKey: sdf.segmento as string,
  phaseKey: sdf.fase as string,
  dimensionKey: sdf.dimension as string,
  desired_value: sdf.desired_value as number,
  propension: sdf.propension as number,
}));

const CHANNEL_KEY_MAP: Record<string, string> = {
  "Distribuidores": "distribuidores",
  "Grandes Almacenes": "grandes_almacenes",
  "Tienda en Linea": "tienda_en_linea",
};

const channels: ChannelConfig[] = (seed.canales_distribucion as Array<Record<string, unknown>>).map((c) => ({
  key: CHANNEL_KEY_MAP[c.canal_es as string] ?? (c.canal_es as string),
  tipo: c.tipo as string,
  alfa: c.alfa as number,
  kappa: c.kappa as number,
  active: c.activo as boolean,
}));

const ZONES = ["Centro", "Oeste", "Norte", "Este", "Sur"];

const channelZones: ChannelZoneConfig[] = [];
for (const czRow of seed.canales_distribucion_zona as Array<Record<string, unknown>>) {
  const zone = czRow.zona as string;
  for (const ch of channels) {
    const colName = ch.key;
    const dist = (czRow as Record<string, number>)[colName];
    if (dist !== undefined) {
      channelZones.push({
        channelKey: ch.key,
        zoneKey: zone,
        distribuidores: dist,
        active: ch.active,
      });
    }
  }
}

const media: MediumConfig[] = (seed.medio as Array<Record<string, unknown>>).map((m) => ({
  key: m.nombre_es as string,
  alcance: (m.alcance as string).toLowerCase() as "global" | "local",
  costo_spot: m.coste as number,
  active: m.activo as boolean,
}));

const coefEstimados = seed.coeficientes_estimados as Record<string, unknown>;
const tvAlto = coefEstimados.publicidad_tv_alto as Record<string, number>;
const radioAlto = coefEstimados.publicidad_radio_alto as Record<string, number>;

const mediaSegments: MediaSegmentConfig[] = (seed.medio_segmentos as Array<Record<string, unknown>>).map((ms) => {
  const mediumKey = ms.medio as string;
  const segmentKey = ms.segmento as string;

  let reach_m: number | null = null;
  let reach_lambda: number | null = null;
  let reach_k: number | null = null;

  if (mediumKey === "TV" && segmentKey === "Alto") {
    reach_m = tvAlto.M;
    reach_lambda = tvAlto.L;
    reach_k = tvAlto.k;
  } else if (mediumKey === "Radio" && segmentKey === "Alto") {
    reach_m = radioAlto.M;
    reach_lambda = radioAlto.L;
    reach_k = radioAlto.k;
  } else if (mediumKey === "TV" && segmentKey === "Bajo") {
    reach_m = 24.0;
    reach_lambda = 27.9;
    reach_k = 2.15;
  } else if (mediumKey === "Radio" && segmentKey === "Bajo") {
    reach_m = 21.0;
    reach_lambda = 40;
    reach_k = 1.2;
  }

  return {
    mediumKey,
    segmentKey,
    impacto_generico: ms.impacto_generico as number,
    impacto_branding: ms.impacto_branding as number,
    reach_m,
    reach_lambda,
    reach_k,
  };
});

const improvements: ImprovementConfig[] = (seed.mejoras as Array<Record<string, unknown>>).map((m) => ({
  id: String(m.id),
  dimensions: m.D as Record<string, number>,
}));

const demand: DemandRow[] = (seed.demanda as Array<Record<string, unknown>>).map((d) => ({
  period: d.periodo as number,
  zoneKey: d.zona as string,
  segmentKey: d.segmento as string,
  cantidad: d.cantidad as number,
  limite_precio: d.limite_precio as number,
  tipo_precio: d.tipo_precio as string,
  precio_referencia: d.precio as number,
}));

const coefficients: CoefficientConfig[] = [];
const precioA = coefEstimados.precio_a as Record<string, number>;
const precioB = coefEstimados.precio_b as Record<string, number>;

for (const [seg, val] of Object.entries(precioA)) {
  coefficients.push({ key: "precio_a", segmentKey: seg, mediumKey: null, value: val });
}
for (const [seg, val] of Object.entries(precioB)) {
  coefficients.push({ key: "precio_b", segmentKey: seg, mediumKey: null, value: val });
}
coefficients.push({ key: "presupuesto_c", segmentKey: null, mediumKey: null, value: coefEstimados.presupuesto_c as number });
coefficients.push({ key: "producto_beta", segmentKey: null, mediumKey: null, value: coefEstimados.producto_base_beta as number });
coefficients.push({ key: "publicidad_theta", segmentKey: null, mediumKey: null, value: coefEstimados.publicidad_peso_marca_theta as number });

const flags: EngineFlags = {
  ruido_activo: false,
  aplicar_mult_seg_fase_precio: false,
  aplicar_mult_seg_fase_producto: false,
  aplicar_mult_seg_fase_publicidad: true,
  aplicar_mult_seg_fase_canales: true,
  aplicar_mult_seg_fase_presupuesto: false,
  umbral_activo: false,
  actualizacion_instantanea: true,
};

const zonePhaseSchedule: ZonePhaseScheduleEntry[] = [
  { zoneKey: "Centro", phaseKey: "2.Growth", periodFrom: 1, periodTo: 8 },
  { zoneKey: "Centro", phaseKey: "3.Maturity", periodFrom: 9, periodTo: null },
  { zoneKey: "Oeste", phaseKey: "2.Growth", periodFrom: 1, periodTo: 8 },
  { zoneKey: "Oeste", phaseKey: "3.Maturity", periodFrom: 9, periodTo: null },
  { zoneKey: "Norte", phaseKey: "2.Growth", periodFrom: 1, periodTo: 8 },
  { zoneKey: "Norte", phaseKey: "3.Maturity", periodFrom: 9, periodTo: null },
  { zoneKey: "Este", phaseKey: "1.Roll-out", periodFrom: 7, periodTo: 8 },
  { zoneKey: "Este", phaseKey: "2.Growth", periodFrom: 9, periodTo: null },
  { zoneKey: "Sur", phaseKey: "1.Roll-out", periodFrom: 7, periodTo: 8 },
  { zoneKey: "Sur", phaseKey: "2.Growth", periodFrom: 9, periodTo: null },
];

export const MEZQUITE_CONFIG: CommercialConfig = {
  comercialParams,
  segments,
  phases,
  segmentPhases,
  dimensions,
  segmentDimensionPhases,
  channels,
  channelZones,
  media,
  mediaSegments,
  improvements,
  demand,
  coefficients,
  flags,
  zonePhaseSchedule,
};

export const COMPANIES = ["1-ECO-KLIN", "2-DUSTBUSTERS", "3-APEX", "4-COCALLA", "5-TEKANI"];

export const P6_AWARENESS: Record<string, Record<string, Record<string, number>>> = {
  "1-ECO-KLIN": {
    Centro: { Alto: 45.39, Bajo: 28.55 },
    Oeste: { Alto: 37.43, Bajo: 21.52 },
    Norte: { Alto: 30.38, Bajo: 24.48 },
    Este: { Alto: 2.75, Bajo: 0 },
    Sur: { Alto: 0, Bajo: 0 },
  },
  "2-DUSTBUSTERS": {
    Centro: { Alto: 41.71, Bajo: 21.31 },
    Oeste: { Alto: 33.98, Bajo: 15.39 },
    Norte: { Alto: 26.25, Bajo: 16.32 },
    Este: { Alto: 1.09, Bajo: 0 },
    Sur: { Alto: 1.09, Bajo: 0 },
  },
  "3-APEX": {
    Centro: { Alto: 48.95, Bajo: 28.90 },
    Oeste: { Alto: 41.13, Bajo: 22.34 },
    Norte: { Alto: 34.27, Bajo: 25.78 },
    Este: { Alto: 8.68, Bajo: 2.77 },
    Sur: { Alto: 8.68, Bajo: 2.77 },
  },
  "4-COCALLA": {
    Centro: { Alto: 41.18, Bajo: 31.49 },
    Oeste: { Alto: 33.82, Bajo: 26.44 },
    Norte: { Alto: 26.08, Bajo: 27.39 },
    Este: { Alto: 8.57, Bajo: 19.05 },
    Sur: { Alto: 0, Bajo: 0 },
  },
  "5-TEKANI": {
    Centro: { Alto: 44.87, Bajo: 32.83 },
    Oeste: { Alto: 37.05, Bajo: 26.26 },
    Norte: { Alto: 29.32, Bajo: 27.21 },
    Este: { Alto: 0, Bajo: 0 },
    Sur: { Alto: 0.74, Bajo: 0 },
  },
};

export const P6_ASSIGNED_SHARE: Record<string, Record<string, Record<string, number>>> = {
  "1-ECO-KLIN": {
    Centro: { Alto: 16.03, Bajo: 18.71 },
    Oeste: { Alto: 15.95, Bajo: 18.66 },
    Norte: { Alto: 15.74, Bajo: 16.23 },
  },
  "2-DUSTBUSTERS": {
    Centro: { Alto: 21.11, Bajo: 24.90 },
    Oeste: { Alto: 21.00, Bajo: 24.31 },
    Norte: { Alto: 21.15, Bajo: 24.46 },
  },
  "3-APEX": {
    Centro: { Alto: 16.26, Bajo: 21.22 },
    Oeste: { Alto: 16.11, Bajo: 19.34 },
    Norte: { Alto: 16.47, Bajo: 22.23 },
  },
  "4-COCALLA": {
    Centro: { Alto: 19.71, Bajo: 17.23 },
    Oeste: { Alto: 19.68, Bajo: 17.07 },
    Norte: { Alto: 19.44, Bajo: 17.20 },
  },
  "5-TEKANI": {
    Centro: { Alto: 26.89, Bajo: 17.96 },
    Oeste: { Alto: 27.26, Bajo: 20.62 },
    Norte: { Alto: 27.19, Bajo: 19.88 },
  },
};

export const COMPANY_IMPROVEMENTS_P7: Record<string, string[]> = {
  "1-ECO-KLIN": ["1", "2", "3", "7"],
  "2-DUSTBUSTERS": ["1", "3", "4", "7", "8", "9"],
  "3-APEX": ["2", "3", "6", "7"],
  "4-COCALLA": ["1", "2", "7", "8", "12"],
  "5-TEKANI": ["1", "3", "7", "9", "11", "12"],
};
