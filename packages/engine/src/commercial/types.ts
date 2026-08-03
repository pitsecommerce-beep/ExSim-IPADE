/**
 * Tipos del motor comercial Mezquite.
 * Escala interna: todos los atributos en 0 a 100.
 */

export interface ZonePhaseConfig {
  readonly phase: Phase;
}

export type Phase = "rollout" | "growth" | "maturity" | "hypermaturity";

export interface SegmentId {
  readonly segment: "alto" | "bajo";
}

export interface KappaPrecio {
  readonly alto: number;
  readonly bajo: number;
}

export interface LimitePrecio {
  readonly alto: number;
  readonly bajo: number;
}

export interface CanalParams {
  readonly alfa: number;
  readonly kappa: number;
}

export interface LoyaltyParams {
  readonly alto: number;
  readonly bajo: number;
}

export interface LoyaltyByPhase {
  readonly rollout: LoyaltyParams;
  readonly growth: LoyaltyParams;
  readonly maturity: LoyaltyParams;
  readonly hypermaturity: LoyaltyParams;
}

export interface PesoSegmento {
  readonly precio: number;
  readonly producto: number;
  readonly canal: number;
  readonly publicidad: number;
  readonly presupuesto: number;
  readonly generico: number;
  readonly caracteristicasMarca: number;
  readonly correccionUtilidad: number;
}

export interface MultFase {
  readonly precio: number;
  readonly producto: number;
  readonly canal: number;
  readonly publicidad: number;
  readonly presupuesto: number;
  readonly generico: number;
  readonly caracteristicasMarca: number;
}

export interface MultFaseByPhase {
  readonly rollout: MultFase;
  readonly growth: MultFase;
  readonly maturity: MultFase;
  readonly hypermaturity: MultFase;
}

export interface RotacionAdquisicion {
  readonly rotacion: number;
  readonly adquisicion: number;
}

export interface RotacionAdquisicionByPhase {
  readonly rollout: RotacionAdquisicion;
  readonly growth: RotacionAdquisicion;
  readonly maturity: RotacionAdquisicion;
  readonly hypermaturity: RotacionAdquisicion;
}

export interface DimensionValue {
  readonly sostenibilidad: number;
  readonly conveniencia: number;
  readonly rendimiento: number;
  readonly funcionalidadesExtra: number;
  readonly eficiencia: number;
}

export interface DesiredValueConfig {
  readonly desiredValue: DimensionValue;
  readonly propension: DimensionValue;
}

export interface DesiredValueByPhaseSegment {
  readonly rollout: { readonly alto: DesiredValueConfig; readonly bajo: DesiredValueConfig };
  readonly growth: { readonly alto: DesiredValueConfig; readonly bajo: DesiredValueConfig };
  readonly maturity: { readonly alto: DesiredValueConfig; readonly bajo: DesiredValueConfig };
  readonly hypermaturity: { readonly alto: DesiredValueConfig; readonly bajo: DesiredValueConfig };
}

export interface ImprovementDimensions {
  readonly improvementId: string;
  readonly d1: number;
  readonly d2: number;
  readonly d3: number;
  readonly d4: number;
  readonly d5: number;
}

export interface DemandaZonaSegmento {
  readonly cantidadPorEmpresa: number;
}

// TODO: el umbral de consideracion (hoja Segmentos-Fases, columna "Umbral") no funciona
// como filtro absoluto. En una corrida controlada con conocimiento cero se genero demanda
// de todos modos (supuesto S7). Se deja inerte por defecto hasta identificar su rol real.
export interface UmbralConsideracion {
  readonly rollout: { readonly alto: number; readonly bajo: number };
  readonly growth: { readonly alto: number; readonly bajo: number };
  readonly maturity: { readonly alto: number; readonly bajo: number };
  readonly hypermaturity: { readonly alto: number; readonly bajo: number };
}

export const UMBRAL_DEFAULT: UmbralConsideracion = {
  rollout: { alto: 0, bajo: 0 },
  growth: { alto: 10, bajo: 10 },
  maturity: { alto: 55, bajo: 40 },
  hypermaturity: { alto: 60, bajo: 50 },
};

export interface CommercialInput {
  readonly periodo: number;
  readonly empresas: ReadonlyArray<EmpresaInput>;
  readonly zonas: ReadonlyArray<ZonaInput>;
  readonly kappaPrecio: KappaPrecio;
  readonly canalParams: CanalParams;
  readonly loyalty: LoyaltyByPhase;
  readonly pesosSegmento: { readonly alto: PesoSegmento; readonly bajo: PesoSegmento };
  readonly multFase: MultFaseByPhase;
  readonly rotacionAdquisicion: RotacionAdquisicionByPhase;
  readonly desiredValues: DesiredValueByPhaseSegment;
  readonly valorInicialDimension: number;
  readonly improvements: ReadonlyArray<ImprovementDimensions>;
  readonly umbralConsideracion?: UmbralConsideracion;
}

export interface EmpresaInput {
  readonly empresaId: string;
  readonly nombre: string;
  readonly mejorasActivas: ReadonlyArray<string>;
  readonly spotsTV: number;
  readonly enfoqueMarcaTV: number;
  readonly decisiones: ReadonlyArray<EmpresaZonaInput>;
}

export interface EmpresaZonaInput {
  readonly zonaId: string;
  readonly precio: number;
  readonly vendedores: number;
  readonly spotsRadio: number;
  readonly enfoqueMarcaRadio: number;
  readonly productoTerminado: number;
  readonly previsionDemanda: number;
  readonly uPublicidadOverride?: { alto: number; bajo: number };
  readonly uProductoOverride?: { alto: number; bajo: number };
}

export interface ZonaInput {
  readonly zonaId: string;
  readonly nombre: string;
  readonly fase: Phase;
  readonly distribuidores: number;
  readonly limitePrecio: LimitePrecio;
  readonly demanda: {
    readonly alto: DemandaZonaSegmento;
    readonly bajo: DemandaZonaSegmento;
  };
}

export interface EstadoPrevio {
  readonly conocimiento: Record<string, Record<string, { alto: number; bajo: number }>>;
  readonly cuotaAsignada: Record<string, Record<string, { alto: number; bajo: number }>>;
}

export interface AtributoResult {
  readonly uPrecio: number;
  readonly uPresupuesto: number;
  readonly uCanal: number;
  readonly uPublicidad: number;
  readonly uProducto: number;
}

export interface EmpresaZonaSegmentoResult {
  readonly empresaId: string;
  readonly zonaId: string;
  readonly segmento: "alto" | "bajo";
  readonly atributos: AtributoResult;
  readonly total: number;
  readonly final: number;
  readonly shareAtraccion: number;
  readonly cuotaAsignada: number;
  readonly demandaGenerada: number;
  readonly ventas: number;
  readonly faltante: number;
}

export interface CommercialOutput {
  readonly resultados: ReadonlyArray<EmpresaZonaSegmentoResult>;
  readonly conocimientoNuevo: Record<string, Record<string, { alto: number; bajo: number }>>;
  readonly cuotaAsignadaNueva: Record<string, Record<string, { alto: number; bajo: number }>>;
}
