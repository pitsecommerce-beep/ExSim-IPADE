import { describe, it, expect } from "vitest";
import {
  computeReach,
  computeMessageWeight,
  computeAwarenessContribution,
  updateAwareness,
} from "../src/engine/advertising.js";

describe("computeReach", () => {
  it("returns 0 when spots is 0", () => {
    expect(computeReach(0, 64.8, 27.9, 2.15)).toBe(0);
  });

  it("returns 0 when M is 0", () => {
    expect(computeReach(35, 0, 27.9, 2.15)).toBe(0);
  });

  it("approaches M as spots increase", () => {
    const highSpots = computeReach(200, 64.8, 27.9, 2.15);
    expect(highSpots).toBeCloseTo(64.8, 0);
  });

  it("TV Alto reach for 35 spots", () => {
    const r = computeReach(35, 64.8, 27.9, 2.15);
    expect(r).toBeGreaterThan(0);
    expect(r).toBeLessThan(64.8);
  });
});

describe("computeMessageWeight", () => {
  it("returns 1 when fraccion marca is 0", () => {
    expect(computeMessageWeight(0, 0.375)).toBe(1);
  });

  it("returns theta when fraccion marca is 1", () => {
    expect(computeMessageWeight(1, 0.375)).toBeCloseTo(0.375, 6);
  });

  it("generic ads contribute more than brand ads", () => {
    const w_generic = computeMessageWeight(0.2, 0.375);
    const w_brand = computeMessageWeight(0.8, 0.375);
    expect(w_generic).toBeGreaterThan(w_brand);
  });
});

describe("updateAwareness", () => {
  it("decays previous awareness by rotacion", () => {
    const result = updateAwareness(50, 0.4, 0);
    expect(result).toBeCloseTo(30, 6);
  });

  it("clamps to 0-100", () => {
    expect(updateAwareness(0, 0.5, 0)).toBe(0);
    expect(updateAwareness(90, 0, 20)).toBe(100);
  });

  it("adds contribution to retained awareness", () => {
    const result = updateAwareness(50, 0.4, 25);
    expect(result).toBeCloseTo(55, 0);
  });
});

describe("computeAwarenessContribution", () => {
  it("handles global medium (TV) applying to all zones", () => {
    const media = [{ key: "TV", alcance: "global" as const, costo_spot: 3000, active: true }];
    const mediaSegments = [{
      mediumKey: "TV",
      segmentKey: "Alto",
      impacto_generico: 0.33,
      impacto_branding: 1,
      reach_m: 64.8,
      reach_lambda: 27.9,
      reach_k: 2.15,
    }];
    const companyMedia = [{ mediumKey: "TV", zoneKey: null, spots: 35, fraccionMarca: 0.8 }];

    const contribution = computeAwarenessContribution(media, mediaSegments, companyMedia, "Alto", "Centro", 0.375);
    expect(contribution).toBeGreaterThan(0);
  });

  it("local medium (Radio) only contributes to the matching zone", () => {
    const media = [{ key: "Radio", alcance: "local" as const, costo_spot: 300, active: true }];
    const mediaSegments = [{
      mediumKey: "Radio",
      segmentKey: "Alto",
      impacto_generico: 0.33,
      impacto_branding: 1,
      reach_m: 8.2,
      reach_lambda: 40,
      reach_k: 1.2,
    }];
    const companyMedia = [
      { mediumKey: "Radio", zoneKey: "Centro", spots: 20, fraccionMarca: 0.85 },
      { mediumKey: "Radio", zoneKey: "Oeste", spots: 22, fraccionMarca: 0.85 },
    ];

    const centroCont = computeAwarenessContribution(media, mediaSegments, companyMedia, "Alto", "Centro", 0.375);
    const oesteCont = computeAwarenessContribution(media, mediaSegments, companyMedia, "Alto", "Oeste", 0.375);
    const norteCont = computeAwarenessContribution(media, mediaSegments, companyMedia, "Alto", "Norte", 0.375);

    expect(centroCont).toBeGreaterThan(0);
    expect(oesteCont).toBeGreaterThan(0);
    expect(norteCont).toBe(0);
  });

  it("skips media with null reach params", () => {
    const media = [{ key: "TV", alcance: "global" as const, costo_spot: 3000, active: true }];
    const mediaSegments = [{
      mediumKey: "TV",
      segmentKey: "Bajo",
      impacto_generico: 1,
      impacto_branding: 0.66,
      reach_m: null,
      reach_lambda: null,
      reach_k: null,
    }];
    const companyMedia = [{ mediumKey: "TV", zoneKey: null, spots: 35, fraccionMarca: 0.5 }];

    const contribution = computeAwarenessContribution(media, mediaSegments, companyMedia, "Bajo", "Centro", 0.375);
    expect(contribution).toBe(0);
  });
});
