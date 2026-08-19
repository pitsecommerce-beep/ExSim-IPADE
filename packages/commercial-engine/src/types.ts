export interface CommercialConfig {
  readonly comercialParams: ComercialParams;
  readonly segments: ReadonlyArray<SegmentConfig>;
  readonly phases: ReadonlyArray<PhaseConfig>;
  readonly segmentPhases: ReadonlyArray<SegmentPhaseConfig>;
  readonly dimensions: ReadonlyArray<DimensionConfig>;
  readonly segmentDimensionPhases: ReadonlyArray<SegmentDimensionPhaseConfig>;
  readonly channels: ReadonlyArray<ChannelConfig>;
  readonly channelZones: ReadonlyArray<ChannelZoneConfig>;
  readonly media: ReadonlyArray<MediumConfig>;
  readonly mediaSegments: ReadonlyArray<MediaSegmentConfig>;
  readonly improvements: ReadonlyArray<ImprovementConfig>;
  readonly demand: ReadonlyArray<DemandRow>;
  readonly coefficients: ReadonlyArray<CoefficientConfig>;
  readonly flags: EngineFlags;
  readonly zonePhaseSchedule: ReadonlyArray<ZonePhaseScheduleEntry>;
}

export interface ComercialParams {
  readonly dopaje_base100: number;
  readonly escala_global: number;
  readonly actualizacion_instantanea: boolean;
}

export interface SegmentConfig {
  readonly key: string;
  readonly w_precio: number;
  readonly w_producto: number;
  readonly w_canales: number;
  readonly w_publicidad: number;
  readonly w_generico: number;
  readonly w_caracteristicas_marca: number;
  readonly kappa_precio: number;
  readonly correccion_utilidad: number;
}

export interface PhaseConfig {
  readonly key: string;
  readonly mult_precio: number;
  readonly mult_producto: number;
  readonly mult_canales: number;
  readonly mult_publicidad: number;
  readonly mult_generico: number;
  readonly mult_caracteristicas_marca: number;
  readonly mult_correccion_utilidad: number;
  readonly rotacion_conocimiento: number;
  readonly adquisicion_conocimiento: number;
  readonly error_base: number;
}

export interface SegmentPhaseConfig {
  readonly segmentKey: string;
  readonly phaseKey: string;
  readonly loyalty: number;
  readonly umbral: number;
  readonly compra_espontanea: number;
}

export interface DimensionConfig {
  readonly key: string;
  readonly name: string;
}

export interface SegmentDimensionPhaseConfig {
  readonly segmentKey: string;
  readonly phaseKey: string;
  readonly dimensionKey: string;
  readonly desired_value: number;
  readonly propension: number;
}

export interface ChannelConfig {
  readonly key: string;
  readonly tipo: string;
  readonly alfa: number;
  readonly kappa: number;
  readonly active: boolean;
}

export interface ChannelZoneConfig {
  readonly channelKey: string;
  readonly zoneKey: string;
  readonly distribuidores: number;
  readonly active: boolean;
}

export interface MediumConfig {
  readonly key: string;
  readonly alcance: "global" | "local";
  readonly costo_spot: number;
  readonly active: boolean;
}

export interface MediaSegmentConfig {
  readonly mediumKey: string;
  readonly segmentKey: string;
  readonly impacto_generico: number;
  readonly impacto_branding: number;
  readonly reach_m: number | null;
  readonly reach_lambda: number | null;
  readonly reach_k: number | null;
}

export interface ImprovementConfig {
  readonly id: string;
  readonly dimensions: Record<string, number>;
}

export interface DemandRow {
  readonly period: number;
  readonly zoneKey: string;
  readonly segmentKey: string;
  readonly cantidad: number;
  readonly limite_precio: number;
  readonly tipo_precio: string;
  readonly precio_referencia: number;
}

export interface CoefficientConfig {
  readonly key: string;
  readonly segmentKey: string | null;
  readonly mediumKey: string | null;
  readonly value: number;
}

export interface EngineFlags {
  readonly ruido_activo: boolean;
  readonly aplicar_mult_seg_fase_precio: boolean;
  readonly aplicar_mult_seg_fase_producto: boolean;
  readonly aplicar_mult_seg_fase_publicidad: boolean;
  readonly aplicar_mult_seg_fase_canales: boolean;
  readonly aplicar_mult_seg_fase_presupuesto: boolean;
  readonly umbral_activo: boolean;
  readonly actualizacion_instantanea: boolean;
}

export interface ZonePhaseScheduleEntry {
  readonly zoneKey: string;
  readonly phaseKey: string;
  readonly periodFrom: number;
  readonly periodTo: number | null;
}

export interface MarketState {
  readonly awareness: Record<string, Record<string, Record<string, number>>>;
  readonly assignedShare: Record<string, Record<string, Record<string, number>>>;
}

export interface CompanyDecisions {
  readonly companyId: string;
  readonly activeImprovements: ReadonlyArray<string>;
  readonly zones: ReadonlyArray<CompanyZoneDecision>;
  readonly media: ReadonlyArray<CompanyMediaDecision>;
}

export interface CompanyZoneDecision {
  readonly zoneKey: string;
  readonly precio: number;
  readonly vendedores: number;
  readonly inventarioDisponible: number;
}

export interface CompanyMediaDecision {
  readonly mediumKey: string;
  readonly zoneKey: string | null;
  readonly spots: number;
  readonly fraccionMarca: number;
}

export interface EngineOptions {
  readonly seed: string;
  readonly noiseEnabled: boolean;
  readonly period: number;
  readonly numCompanies: number;
}

export interface CompanyZoneSegmentResult {
  readonly companyId: string;
  readonly zoneKey: string;
  readonly segmentKey: string;
  readonly phaseKey: string;
  readonly factorPrecio: number;
  readonly factorPresupuesto: number;
  readonly factorPromocion: number;
  readonly factorPublicidad: number;
  readonly factorProducto: number;
  readonly indiceTotal: number;
  readonly indiceFinal: number;
  readonly cuotaBruta: number;
  readonly cuotaAsignada: number;
  readonly demandaDisponible: number;
  readonly demandaGenerada: number;
  readonly ventas: number;
  readonly ventasPerdidas: number;
}

export interface CommercialPeriodResult {
  readonly results: ReadonlyArray<CompanyZoneSegmentResult>;
  readonly newAwareness: Record<string, Record<string, Record<string, number>>>;
  readonly newAssignedShare: Record<string, Record<string, Record<string, number>>>;
}
