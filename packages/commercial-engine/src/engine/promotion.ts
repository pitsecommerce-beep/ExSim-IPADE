export function computePromotionFactor(
  vendedores: number,
  distribuidores: number,
  alfa: number,
  kappa: number,
): number {
  if (vendedores === 0 || distribuidores === 0) return 0;
  const x = vendedores / (alfa * distribuidores);
  return 100 * (1 - Math.exp(-Math.pow(x, kappa)));
}
