import type { ImprovementConfig, SegmentDimensionPhaseConfig, DimensionConfig } from "../types.js";

export function computeDimensionMaxes(
  dimensions: ReadonlyArray<DimensionConfig>,
  improvements: ReadonlyArray<ImprovementConfig>,
): Record<string, number> {
  const maxes: Record<string, number> = {};
  for (const dim of dimensions) {
    let total = 0;
    for (const imp of improvements) {
      total += imp.dimensions[dim.key] ?? 0;
    }
    maxes[dim.key] = total;
  }
  return maxes;
}

export function computeDimensionLevel(
  dimensionKey: string,
  activeImprovements: ReadonlyArray<string>,
  improvements: ReadonlyArray<ImprovementConfig>,
  dMax: number,
  beta: number,
): number {
  if (dMax <= 0) return beta;

  let sum = 0;
  for (const imp of improvements) {
    if (activeImprovements.includes(imp.id)) {
      sum += imp.dimensions[dimensionKey] ?? 0;
    }
  }

  return beta + (1 - beta) * (sum / dMax);
}

export function computeDimensionCredit(
  level: number,
  desiredValue: number,
): number {
  if (desiredValue <= 0) return level > 0 ? 1 : 0;
  return Math.min(level / desiredValue, 1);
}

export function computeProductFactor(
  dimensions: ReadonlyArray<DimensionConfig>,
  activeImprovements: ReadonlyArray<string>,
  improvements: ReadonlyArray<ImprovementConfig>,
  dimPhaseConfigs: ReadonlyArray<SegmentDimensionPhaseConfig>,
  segmentKey: string,
  phaseKey: string,
  beta: number,
): number {
  const dMaxes = computeDimensionMaxes(dimensions, improvements);

  const relevantConfigs = dimPhaseConfigs.filter(
    (c) => c.segmentKey === segmentKey && c.phaseKey === phaseKey,
  );

  let weightedSum = 0;
  let totalPropension = 0;

  for (const cfg of relevantConfigs) {
    const dMax = dMaxes[cfg.dimensionKey] ?? 0;
    const level = computeDimensionLevel(
      cfg.dimensionKey,
      activeImprovements,
      improvements,
      dMax,
      beta,
    );
    const credit = computeDimensionCredit(level, cfg.desired_value);
    weightedSum += cfg.propension * credit;
    totalPropension += cfg.propension;
  }

  if (totalPropension === 0) return 0;
  return Math.min(100, 100 * weightedSum / totalPropension);
}
