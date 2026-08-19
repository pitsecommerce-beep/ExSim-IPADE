export function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(parts: ReadonlyArray<string>): number {
  const str = parts.join("|");
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i);
    h = h | 0;
  }
  return h;
}

export function generateNoise(
  rng: () => number,
  errorBasePct: number,
): number {
  const e = errorBasePct / 100;
  return 1 - e + 2 * e * rng();
}
