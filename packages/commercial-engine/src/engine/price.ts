export function computeAveragePrice(prices: ReadonlyArray<number>): number {
  const present = prices.filter((p) => p > 0);
  if (present.length === 0) return 0;
  return present.reduce((s, p) => s + p, 0) / present.length;
}

export function computePriceFactor(
  price: number,
  avgPrice: number,
  kappaPrecio: number,
  clamp: boolean,
): number {
  if (price === 0) return 0;
  if (avgPrice === 0) return 0;
  if (kappaPrecio === 0) throw new Error("kappa_precio must be non-zero");
  const x = (price - avgPrice) / avgPrice;
  const raw = 50 * (1 - x / kappaPrecio);
  if (!clamp) return raw;
  return Math.max(0, Math.min(100, raw));
}
