import { describe, it, expect } from "vitest";
import { mulberry32, hashSeed, generateNoise } from "../src/engine/noise.js";

describe("mulberry32", () => {
  it("produces deterministic sequence from same seed", () => {
    const rng1 = mulberry32(12345);
    const rng2 = mulberry32(12345);
    for (let i = 0; i < 10; i++) {
      expect(rng1()).toBe(rng2());
    }
  });

  it("produces values in [0, 1)", () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("hashSeed", () => {
  it("produces consistent hash for same parts", () => {
    const h1 = hashSeed(["game1", "7", "Centro", "Alto", "E1"]);
    const h2 = hashSeed(["game1", "7", "Centro", "Alto", "E1"]);
    expect(h1).toBe(h2);
  });

  it("produces different hashes for different parts", () => {
    const h1 = hashSeed(["game1", "7", "Centro", "Alto", "E1"]);
    const h2 = hashSeed(["game1", "7", "Centro", "Alto", "E2"]);
    expect(h1).not.toBe(h2);
  });
});

describe("generateNoise", () => {
  it("produces values in [1-e, 1+e]", () => {
    const rng = mulberry32(42);
    const e = 10;
    for (let i = 0; i < 1000; i++) {
      const n = generateNoise(rng, e);
      expect(n).toBeGreaterThanOrEqual(0.9);
      expect(n).toBeLessThanOrEqual(1.1);
    }
  });

  it("returns 1 when error is 0", () => {
    const rng = mulberry32(42);
    expect(generateNoise(rng, 0)).toBe(1);
  });
});
