export function computeAveragePrice(prices: ReadonlyArray<number>): number {
  const present = prices.filter((p) => p > 0);
  if (present.length === 0) return 0;
  return present.reduce((s, p) => s + p, 0) / present.length;
}

export function computePriceFactor(
  price: number,
  avgPrice: number,
  a: number,
  b: number,
): number {
  if (price === 0) return 0;
  if (avgPrice === 0) return 0;
  const x = (price - avgPrice) / avgPrice;
  return 100 / (1 + Math.exp(a * x + b * x * x * x));
}
