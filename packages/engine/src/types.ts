import type {
  Phase,
  MultFaseByPhase,
  LoyaltyByPhase,
  KappaPrecio,
  LimitePrecio,
  UmbralConsideracion,
} from "./commercial/types.js";

export type { Phase } from "./commercial/types.js";

export interface ProfileConfig {
  readonly profileId: string;
  readonly zones: ReadonlyArray<ZoneConfig>;
  readonly segments: ReadonlyArray<SegmentConfig>;
  readonly channels: ReadonlyArray<ChannelConfig>;
  readonly media: ReadonlyArray<MediaConfig>;
  readonly materials: ReadonlyArray<MaterialConfig>;
  readonly machines: ReadonlyArray<MachineConfig>;
  readonly improvements: ReadonlyArray<ImprovementConfig>;
  readonly laborBenefits: ReadonlyArray<LaborBenefitConfig>;
  readonly supplierMaterials: ReadonlyArray<SupplierMaterialConfig>;
  readonly paymentPlans: ReadonlyArray<PaymentPlanConfig>;
  readonly financialInstruments: FinancialInstrumentsConfig;
  readonly esg: ESGConfig;
  readonly demandParams: DemandParams;
  readonly fprParams: FPRParams;
  readonly initialState?: InitialStateConfig;
}

export interface ZoneConfig {
  readonly zoneId: string;
  readonly name: string;
  readonly populationBySegment: Record<string, number>;
  readonly phase: Phase;
  readonly distributorsByChannel: Record<string, number>;
}

export interface SegmentConfig {
  readonly segmentId: string;
  readonly name: string;
  readonly priceWeight: number;
  readonly channelWeight: number;
  readonly productWeight: number;
  readonly mediaWeight: number;
  readonly budgetWeight: number;
}

export interface ChannelConfig {
  readonly channelId: string;
  readonly name: string;
  readonly active: boolean;
  readonly alfa: number;
  readonly kappa: number;
  readonly setupCostCents: number;
  readonly variableCostCents: number;
}

export interface MediaConfig {
  readonly mediaId: string;
  readonly name: string;
  readonly costPerSpotCents: number;
  readonly maxSpots: number;
  readonly scope: "national" | "regional";
}

export interface MaterialConfig {
  readonly materialId: string;
  readonly name: string;
  readonly costPerUnitCents: number;
  readonly lotSize: number;
}

export interface SupplierMaterialConfig {
  readonly supplierId: string;
  readonly materialId: string;
  readonly costPerUnitCents: number;
  readonly lotSize: number;
  readonly descuentoPct: number;
  readonly umbralDescuento: number;
  readonly probIncumplimiento: number;
  readonly fleteArancelUnitario: number;
}

export interface MachineConfig {
  readonly machineTypeId: string;
  readonly name: string;
  readonly powerKw: number;
}

export interface ImprovementConfig {
  readonly improvementId: string;
  readonly name: string;
  readonly rdCostCents: number;
  readonly variableCostCents: number;
  readonly amortizationPeriods: number;
  readonly dimensions: Record<string, number>;
}

export interface LaborBenefitConfig {
  readonly benefitId: string;
  readonly name: string;
  readonly weight: number;
  readonly curveType: "linear" | "concave" | "convex" | "threshold";
  readonly xMin: number;
  readonly xMax: number;
}

export interface PaymentPlanConfig {
  readonly planId: string;
  readonly key: string;
  readonly plazoSubperiodos: number;
  readonly descuentoPct: number;
}

export interface InitialStateConfig {
  readonly efectivo: number;
  readonly cuentasPorCobrar: number;
  readonly inventario: number;
  readonly activoFijoPlanta: number;
  readonly activoFijoEquipoNeto: number;
  readonly intangiblesNeto: number;
  readonly cuentasPorPagar: number;
  readonly impuestosPorPagar: number;
  readonly lineaCredito: number;
  readonly hipoteca: number;
  readonly prestamoEmergencia: number;
  readonly capitalEmitido: number;
  readonly utilidadesRetenidas: number;
  readonly resultadoPeriodo: number;
  readonly depositosCortoPlazo: number;
}

export interface FinancialInstrumentsConfig {
  readonly creditLineRateBps: number;
  readonly depositRateBps: number;
  readonly mortgageRateBps: number;
  readonly emergencyRateBps: number;
}

export interface ESGConfig {
  readonly solarPanelCostCents: number;
  readonly solarPanelKwh: number;
  readonly treeCostCents: number;
  readonly treesPerTonCO2: number;
  readonly co2CreditCostCents: number;
}

export interface DemandParams {
  readonly priceModel: "LINEAR";
  readonly kappaPriceBySegment: KappaPrecio;
  readonly priceRefType: "AVG_SIMPLE";
  readonly channelAlpha: number;
  readonly channelKappa: number;
  readonly budgetExponent: number;
  readonly mediaSaturationK: number;
  readonly mediaSaturationLambda: number;
  readonly priceLimitsByZone: Record<string, LimitePrecio>;
  readonly loyalty: LoyaltyByPhase;
  readonly multFase: MultFaseByPhase;
  readonly demandQuantityByZoneSegment: Record<string, { alto: number; bajo: number }>;
  readonly umbralConsideracion?: UmbralConsideracion;
}

export interface FPRParams {
  readonly salaryWeight: number;
  readonly benefitsWeight: number;
  readonly breakpoints: ReadonlyArray<[satisfaction: number, fpr: number]>;
}

export interface WorldState {
  readonly periodNumber: number;
  readonly teams: Record<string, TeamState>;
}

export interface TeamState {
  readonly teamId: string;
  readonly cashCents: bigint;
  readonly inventories: Record<string, number>;
  readonly machines: Record<string, Record<string, number>>;
  readonly workers: Record<string, number>;
  readonly modules: Record<string, { plant: number; warehouse: number }>;
  readonly knowledgeByZoneSegment: Record<string, Record<string, number>>;
  readonly assignedShareByZoneSegment: Record<string, Record<string, { alto: number; bajo: number }>>;
  readonly hasHistoryByZone: Record<string, boolean>;
  readonly brandEquity: number;
  readonly accumulatedCO2Kg: number;
}

export interface TeamDecisions {
  readonly teamId: string;
  readonly pricing: Record<string, Record<string, number>>;
  readonly production: ProductionDecisions;
  readonly marketing: MarketingDecisions;
  readonly hr: HRDecisions;
  readonly finance: FinanceDecisions;
  readonly logistics: LogisticsDecisions;
  readonly rnd: RnDDecisions;
  readonly esg: ESGDecisions;
}

export interface ProductionDecisions {
  readonly scheduleByZone: Record<string, number>;
}

export interface MarketingDecisions {
  readonly mediaSpots: Record<string, Record<string, number>>;
  readonly salesforceByZone: Record<string, number>;
  readonly brandFocusByMediumZone: {
    readonly tv: { readonly enfoqueMarca: number };
    readonly radio: Record<string, { readonly enfoqueMarca: number }>;
  };
  readonly demandForecastByZone: Record<string, number>;
}

export interface HRDecisions {
  readonly salaryPerWorkerCents: number;
  readonly hiringByZone: Record<string, number>;
  readonly firingByZone: Record<string, number>;
  readonly benefits: Record<string, number>;
}

export interface FinanceDecisions {
  readonly creditLineAmountCents: number;
  readonly depositAmountCents: number;
  readonly dividendsCents: number;
}

export interface LogisticsDecisions {
  readonly transfersByRoute: Record<string, number>;
  readonly materialOrders: Record<string, { supplierId: string; lots: number }>;
}

export interface RnDDecisions {
  readonly activeImprovements: ReadonlyArray<string>;
}

export interface ESGDecisions {
  readonly solarPanels: number;
  readonly trees: number;
  readonly co2Credits: number;
  readonly greenEnergyPct: number;
}

export interface SimulationInput {
  readonly profile: ProfileConfig;
  readonly state: WorldState;
  readonly decisions: ReadonlyArray<TeamDecisions>;
  readonly seed: number;
}

export interface AssignedShareEntry {
  readonly cuotaAsignada: number;
  readonly participacionVentas: number;
}

export interface MarketShareReport {
  readonly assignedShare: Record<string, Record<string, { alto: AssignedShareEntry; bajo: AssignedShareEntry }>>;
  readonly salesShare: Record<string, Record<string, { alto: AssignedShareEntry; bajo: AssignedShareEntry }>>;
  readonly faltante: Record<string, Record<string, { alto: number; bajo: number }>>;
  readonly atributos: Record<string, Record<string, Record<string, {
    uPrecio: number;
    uPresupuesto: number;
    uCanal: number;
    uPublicidad: number;
    uProducto: number;
  }>>>;
}

export interface PeriodReport {
  readonly teamId: string;
  readonly incomeStatement: Record<string, bigint>;
  readonly balanceSheet: Record<string, bigint>;
  readonly marketShareReport: MarketShareReport;
  readonly esgScore: number;
  readonly fpr: number;
}

export interface SimulationTrace {
  readonly steps: ReadonlyArray<TraceStep>;
}

export interface TraceStep {
  readonly phase: string;
  readonly label: string;
  readonly inputs: Record<string, unknown>;
  readonly outputs: Record<string, unknown>;
}

export interface SimulationOutput {
  readonly nextState: WorldState;
  readonly reports: ReadonlyArray<PeriodReport>;
  readonly trace: SimulationTrace;
}
