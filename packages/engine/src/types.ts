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
  readonly financialInstruments: FinancialInstrumentsConfig;
  readonly esg: ESGConfig;
  readonly demandParams: DemandParams;
  readonly fprParams: FPRParams;
}

export interface ZoneConfig {
  readonly zoneId: string;
  readonly name: string;
  readonly populationBySegment: Record<string, number>;
}

export interface SegmentConfig {
  readonly segmentId: string;
  readonly name: string;
  readonly priceWeight: number;
  readonly channelWeight: number;
  readonly productWeight: number;
  readonly mediaWeight: number;
}

export interface ChannelConfig {
  readonly channelId: string;
  readonly name: string;
  readonly active: boolean;
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
  readonly kappaPriceBySegment: Record<string, number>;
  readonly priceRefType: "AVG_MENOS_STDDEV";
  readonly channelAlpha: number;
  readonly channelKappa: number;
  readonly mediaSaturationK: number;
  readonly mediaSaturationLambda: number;
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
  readonly genericVsBrandSplit: number;
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

export interface PeriodReport {
  readonly teamId: string;
  readonly incomeStatement: Record<string, bigint>;
  readonly balanceSheet: Record<string, bigint>;
  readonly marketShare: Record<string, Record<string, number>>;
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
