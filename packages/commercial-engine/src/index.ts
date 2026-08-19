export type {
  CommercialConfig,
  ComercialParams,
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
  MarketState,
  CompanyDecisions,
  CompanyZoneDecision,
  CompanyMediaDecision,
  EngineOptions,
  CompanyZoneSegmentResult,
  CommercialPeriodResult,
} from "./types.js";

export { runCommercialPeriod } from "./engine/runner.js";
export { computeAvailableDemand } from "./engine/demand.js";
export { computeAveragePrice, computePriceFactor } from "./engine/price.js";
export { computeBudgetFactor } from "./engine/budget.js";
export { computePromotionFactor } from "./engine/promotion.js";
export {
  computeReach,
  computeMessageWeight,
  computeAwarenessContribution,
  updateAwareness,
} from "./engine/advertising.js";
export {
  computeDimensionMaxes,
  computeDimensionLevel,
  computeDimensionCredit,
  computeProductFactor,
} from "./engine/product.js";
export { computeTotalIndex } from "./engine/aggregate.js";
export type { FactorValues } from "./engine/aggregate.js";
export {
  computeFinalIndex,
  computeRawShare,
  computeAssignedShare,
} from "./engine/share.js";
export { computeSalesForZone } from "./engine/sales.js";
export { mulberry32, hashSeed, generateNoise } from "./engine/noise.js";
