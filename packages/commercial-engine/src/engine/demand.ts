export function computeAvailableDemand(
  cantidad: number,
  dopaje_base100: number,
  numCompanies: number,
): number {
  return cantidad * (dopaje_base100 / 100) * numCompanies;
}
