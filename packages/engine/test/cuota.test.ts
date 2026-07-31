import { describe, it, expect } from "vitest";
import {
  normalizarAMedia100,
  calcularShareAtraccion,
  calcularCuotaConLealtad,
} from "../src/commercial/agregacion.js";

/**
 * §8.4 — Cuota en zona nueva: tolerancia 0.01
 * En zona sin historia, theta_i = F_i / Σ F_j (sin lealtad)
 *
 * §8.5 — Lealtad: tolerancia 1.0 punto porcentual
 */

describe("cuota en zona nueva — §5.3", () => {
  it("Este P7 Alto: cuota = share de atracción exacto", () => {
    const finales = [
      { empresaId: "ECO-KLIN", final: 77.86 },
      { empresaId: "DUSTBUSTERS", final: 42.89 },
      { empresaId: "APEX", final: 54.26 },
      { empresaId: "COCALLA", final: 174.90 },
      { empresaId: "TEKANI", final: 150.09 },
    ];

    const shares = calcularShareAtraccion(finales);
    const cuotasEsperadas = [15.57, 8.58, 10.85, 34.98, 30.02];

    for (let i = 0; i < shares.length; i++) {
      const cuotaPct = shares[i]!.share * 100;
      expect(Math.abs(cuotaPct - cuotasEsperadas[i]!)).toBeLessThan(0.01 + 0.005);
    }
  });

  it("la suma de cuotas es exactamente 1 (invariante §7.5.6)", () => {
    const finales = [
      { empresaId: "A", final: 120 },
      { empresaId: "B", final: 80 },
      { empresaId: "C", final: 100 },
    ];
    const shares = calcularShareAtraccion(finales);
    const suma = shares.reduce((s, r) => s + r.share, 0);
    expect(suma).toBeCloseTo(1, 10);
  });

  it("sin lealtad previa, cuota = share (invariante §7.5.8)", () => {
    const cuota = calcularCuotaConLealtad(0.35, undefined, 0.5);
    expect(cuota).toBe(0.35);
  });
});

describe("mezcla de lealtad — §5.4", () => {
  it("Growth Alto con Loyalty = 0.50", () => {
    const share = 0.20;
    const cuotaPrevia = 0.30;
    const loyalty = 0.50;
    const resultado = calcularCuotaConLealtad(share, cuotaPrevia, loyalty);
    expect(resultado).toBeCloseTo(0.25, 4);
  });

  it("Roll-out con Loyalty = 0.25", () => {
    const share = 0.40;
    const cuotaPrevia = 0.20;
    const loyalty = 0.25;
    const resultado = calcularCuotaConLealtad(share, cuotaPrevia, loyalty);
    expect(resultado).toBeCloseTo(0.35, 4);
  });

  it("Loyalty 0 = sin inercia, cuota = share", () => {
    const resultado = calcularCuotaConLealtad(0.40, 0.10, 0);
    expect(resultado).toBe(0.40);
  });

  it("Loyalty 1 = inercia total, cuota = previa", () => {
    const resultado = calcularCuotaConLealtad(0.40, 0.10, 1);
    expect(resultado).toBe(0.10);
  });
});

describe("normalización a media 100 — §5.2", () => {
  it("tres empresas con Total distinto → media de Final es 100", () => {
    const totales = [
      { empresaId: "A", total: 0.5 },
      { empresaId: "B", total: 1.0 },
      { empresaId: "C", total: 1.5 },
    ];
    const normalizados = normalizarAMedia100(totales);
    const media = normalizados.reduce((s, r) => s + r.final, 0) / normalizados.length;
    expect(media).toBeCloseTo(100, 10);
  });

  it("empresa con total 0 sale con final 0", () => {
    const totales = [
      { empresaId: "A", total: 0 },
      { empresaId: "B", total: 1.0 },
    ];
    const normalizados = normalizarAMedia100(totales);
    expect(normalizados.find((r) => r.empresaId === "A")?.final).toBe(0);
  });
});
