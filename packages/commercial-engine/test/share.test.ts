import { describe, it, expect } from "vitest";
import { computeFinalIndex, computeRawShare, computeAssignedShare } from "../src/engine/share.js";

describe("computeFinalIndex", () => {
  it("normalizes against average of all companies", () => {
    const totals = [
      { companyId: "A", total: 100 },
      { companyId: "B", total: 200 },
    ];
    const finals = computeFinalIndex(totals, 5);
    const avg = 300 / 5;
    expect(finals[0]!.final).toBeCloseTo((100 / avg) * 100, 6);
    expect(finals[1]!.final).toBeCloseTo((200 / avg) * 100, 6);
  });

  it("counts absent companies as zero in average", () => {
    const totals = [
      { companyId: "A", total: 100 },
      { companyId: "B", total: 200 },
      { companyId: "C", total: 200 },
    ];
    const finals = computeFinalIndex(totals, 5);
    const sum = finals.reduce((s, f) => s + f.final, 0);
    expect(sum).toBeCloseTo(500, 1);
  });

  it("handles all zeros", () => {
    const totals = [
      { companyId: "A", total: 0 },
      { companyId: "B", total: 0 },
    ];
    const finals = computeFinalIndex(totals, 2);
    expect(finals[0]!.final).toBe(0);
    expect(finals[1]!.final).toBe(0);
  });
});

describe("computeRawShare", () => {
  it("divides final by N", () => {
    const finals = [
      { companyId: "A", final: 100 },
      { companyId: "B", final: 150 },
    ];
    const shares = computeRawShare(finals, 5);
    expect(shares[0]!.share).toBeCloseTo(20, 6);
    expect(shares[1]!.share).toBeCloseTo(30, 6);
  });
});

describe("computeAssignedShare", () => {
  it("returns rawShare when no previous share", () => {
    expect(computeAssignedShare(25, undefined, 0.5)).toBe(25);
  });

  it("applies loyalty smoothing with previous share", () => {
    const result = computeAssignedShare(25, 20, 0.5);
    expect(result).toBeCloseTo(22.5, 6);
  });

  it("returns previous share when loyalty is 1", () => {
    expect(computeAssignedShare(30, 20, 1)).toBeCloseTo(20, 6);
  });

  it("returns raw share when loyalty is 0", () => {
    expect(computeAssignedShare(30, 20, 0)).toBeCloseTo(30, 6);
  });
});
