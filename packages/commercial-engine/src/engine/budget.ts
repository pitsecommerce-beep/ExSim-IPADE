export function computeBudgetFactor(
  price: number,
  limitePrecio: number,
  c: number,
): number {
  if (price === 0) return 0;
  if (limitePrecio === 0) return 0;
  return 100 / (1 + Math.exp(c * (price - limitePrecio) / limitePrecio));
}
