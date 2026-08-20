export function computeBudgetFactor(
  price: number,
  limitePrecio: number,
  a: number,
  n: number,
): number {
  if (price === 0) return 0;
  if (limitePrecio === 0) return 0;
  return 100 * Math.exp(-a * Math.pow(price / limitePrecio, n));
}
