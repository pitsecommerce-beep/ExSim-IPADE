export interface IndexEntry {
  readonly companyId: string;
  readonly total: number;
}

export function computeFinalIndex(
  totals: ReadonlyArray<IndexEntry>,
  numCompanies: number,
): ReadonlyArray<{ companyId: string; final: number }> {
  const sumAll = totals.reduce((s, t) => s + t.total, 0);
  const avg = sumAll / numCompanies;

  if (avg === 0) {
    return totals.map((t) => ({ companyId: t.companyId, final: 0 }));
  }

  return totals.map((t) => ({
    companyId: t.companyId,
    final: t.total > 0 ? (t.total / avg) * 100 : 0,
  }));
}

export function computeRawShare(
  finals: ReadonlyArray<{ companyId: string; final: number }>,
  numCompanies: number,
): ReadonlyArray<{ companyId: string; share: number }> {
  return finals.map((f) => ({
    companyId: f.companyId,
    share: f.final / numCompanies,
  }));
}

export function computeAssignedShare(
  rawShare: number,
  previousShare: number | undefined,
  loyalty: number,
): number {
  if (previousShare === undefined) {
    return rawShare;
  }
  return loyalty * previousShare + (1 - loyalty) * rawShare;
}
