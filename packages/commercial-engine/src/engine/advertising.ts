import type { MediaSegmentConfig, MediumConfig, CompanyMediaDecision } from "../types.js";

export function computeReach(
  spots: number,
  M: number,
  lambda: number,
  k: number,
): number {
  if (spots <= 0 || M <= 0) return 0;
  return M * (1 - Math.exp(-Math.pow(spots / lambda, k)));
}

export function computeMessageWeight(
  fraccionMarca: number,
  theta: number,
): number {
  return (1 - fraccionMarca) + theta * fraccionMarca;
}

export function computeAwarenessContribution(
  media: ReadonlyArray<MediumConfig>,
  mediaSegments: ReadonlyArray<MediaSegmentConfig>,
  companyMedia: ReadonlyArray<CompanyMediaDecision>,
  segmentKey: string,
  zoneKey: string,
  theta: number,
): number {
  let totalContribution = 0;

  for (const medium of media) {
    if (!medium.active) continue;

    const msConfig = mediaSegments.find(
      (ms) => ms.mediumKey === medium.key && ms.segmentKey === segmentKey,
    );
    if (!msConfig) continue;
    if (msConfig.reach_m === null || msConfig.reach_lambda === null || msConfig.reach_k === null) {
      continue;
    }

    const relevantDecisions = companyMedia.filter((d) => {
      if (d.mediumKey !== medium.key) return false;
      if (medium.alcance === "global") return true;
      return d.zoneKey === zoneKey;
    });

    let totalSpots = 0;
    let weightedFraccionMarca = 0;
    for (const d of relevantDecisions) {
      totalSpots += d.spots;
      weightedFraccionMarca += d.spots * d.fraccionMarca;
    }

    if (totalSpots === 0) continue;

    const avgFraccionMarca = weightedFraccionMarca / totalSpots;
    const reach = computeReach(totalSpots, msConfig.reach_m, msConfig.reach_lambda, msConfig.reach_k);
    const w = computeMessageWeight(avgFraccionMarca, theta);

    totalContribution += reach * w;
  }

  return totalContribution;
}

export function updateAwareness(
  previousAwareness: number,
  rotacion: number,
  contribution: number,
): number {
  const retained = (1 - rotacion) * previousAwareness;
  const newAwareness = retained + contribution;
  return Math.max(0, Math.min(100, newAwareness));
}
