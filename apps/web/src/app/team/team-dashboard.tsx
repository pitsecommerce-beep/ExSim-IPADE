"use client";

import { useState, useEffect, useCallback } from "react";
import type { WorldData } from "@/lib/storage/types";
import type { CompanyZoneSegmentResult } from "@exsim/commercial-engine";

interface Props {
  worldId: string;
  teamId: string;
  teamName: string;
}

interface DecRow {
  zonaId: string;
  precio: number;
  vendedores: number;
  spotsTV: number;
  enfoqueMarcaTV: number;
  spotsRadio: number;
  enfoqueMarcaRadio: number;
  productoTerminado: number;
  previsionDemanda: number;
}

export function TeamDashboard({ worldId, teamId }: Props) {
  const [world, setWorld] = useState<WorldData | null>(null);
  const [decisions, setDecisions] = useState<DecRow[]>([]);
  const [results, setResults] = useState<CompanyZoneSegmentResult[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"decisions" | "results">("decisions");

  const loadWorld = useCallback(async () => {
    const res = await fetch(`/api/worlds/${worldId}`);
    if (!res.ok) return;
    const w: WorldData = await res.json();
    setWorld(w);

    const lastPeriod = w.periodos[w.periodos.length - 1];
    if (lastPeriod?.resultados) {
      const allResults = lastPeriod.resultados as CompanyZoneSegmentResult[];
      setResults(allResults.filter((r) => r.companyId === teamId));
    }

    setDecisions((prev) => {
      if (prev.length > 0) return prev;
      return w.zonas.map((z) => ({
        zonaId: z.id,
        precio: 80,
        vendedores: 10,
        spotsTV: 10,
        enfoqueMarcaTV: 0.5,
        spotsRadio: 20,
        enfoqueMarcaRadio: 0.5,
        productoTerminado: 5000,
        previsionDemanda: 5000,
      }));
    });
  }, [worldId, teamId]);

  useEffect(() => { void loadWorld(); }, [loadWorld]);

  function updateDecision(zonaId: string, field: keyof DecRow, value: number) {
    setDecisions((prev) =>
      prev.map((d) => (d.zonaId === zonaId ? { ...d, [field]: value } : d)),
    );
    setSaved(false);
  }

  async function handleSave() {
    if (!world) return;
    setSaving(true);

    const decisionData = decisions.map((d) => ({
      empresaId: teamId,
      ...d,
      mejorasActivas: [],
    }));

    const currentPeriod = world.periodos.find((p) => p.periodo === world.currentPeriod);
    let periodos = world.periodos;

    if (currentPeriod) {
      const otherDecisions = currentPeriod.decisiones.filter(
        (d) => d.empresaId !== teamId,
      );
      periodos = periodos.map((p) =>
        p.periodo === world.currentPeriod
          ? { ...p, decisiones: [...otherDecisions, ...decisionData] }
          : p,
      );
    } else {
      periodos = [
        ...periodos,
        { periodo: world.currentPeriod, decisiones: decisionData },
      ];
    }

    await fetch("/api/worlds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...world, periodos }),
    });

    setSaving(false);
    setSaved(true);
  }

  if (!world) {
    return <div className="text-ipade-text-muted">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ipade-text-muted">
          Periodo {world.currentPeriod} &middot; {world.zonas.length} zonas
        </p>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-xs text-green-600">Decisiones guardadas</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-ipade-accent px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar Decisiones"}
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-ipade-border">
        <button
          onClick={() => setActiveTab("decisions")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "decisions"
              ? "border-b-2 border-ipade-accent text-ipade-accent"
              : "text-ipade-text-muted"
          }`}
        >
          Decisiones
        </button>
        <button
          onClick={() => setActiveTab("results")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "results"
              ? "border-b-2 border-ipade-accent text-ipade-accent"
              : "text-ipade-text-muted"
          }`}
        >
          Resultados
        </button>
      </div>

      {activeTab === "decisions" && (
        <div className="space-y-4">
          {world.zonas.map((zona) => {
            const dec = decisions.find((d) => d.zonaId === zona.id);
            if (!dec) return null;
            const vd = zona.distribuidores > 0 ? dec.vendedores / zona.distribuidores : 0;

            return (
              <div key={zona.id} className="rounded-xl border border-ipade-border bg-white shadow-sm">
                <div className="border-b border-ipade-border bg-ipade-bg px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-ipade-text">{zona.nombre}</h3>
                    <span className="rounded-full bg-ipade-surface px-2 py-0.5 text-[10px] font-medium text-ipade-text-muted">
                      {zona.fase}
                    </span>
                  </div>
                </div>
                <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="Precio" value={dec.precio} onChange={(v) => updateDecision(zona.id, "precio", v)} step={1} />
                  <Field label="Vendedores" value={dec.vendedores} onChange={(v) => updateDecision(zona.id, "vendedores", v)} step={1} min={0} />
                  <div>
                    <label className="mb-1 block text-xs text-ipade-text-muted">v/d</label>
                    <p className={`text-sm font-medium ${vd > 2 ? "text-amber-600" : "text-ipade-text"}`}>
                      {vd.toFixed(2)}{vd > 2 ? " (saturado)" : ""}
                    </p>
                  </div>
                  <Field label="Spots TV" value={dec.spotsTV} onChange={(v) => updateDecision(zona.id, "spotsTV", v)} step={1} min={0} />
                  <Field label="Spots Radio" value={dec.spotsRadio} onChange={(v) => updateDecision(zona.id, "spotsRadio", v)} step={1} min={0} />
                  <Field label="Enfoque Marca (TV)" value={dec.enfoqueMarcaTV} onChange={(v) => updateDecision(zona.id, "enfoqueMarcaTV", v)} step={0.1} min={0.1} max={0.9} />
                  <Field label="Producto Terminado" value={dec.productoTerminado} onChange={(v) => updateDecision(zona.id, "productoTerminado", v)} step={100} min={0} />
                  <Field label="Prevision Demanda" value={dec.previsionDemanda} onChange={(v) => updateDecision(zona.id, "previsionDemanda", v)} step={100} min={0} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "results" && results && results.length > 0 && (
        <div className="space-y-4">
          {world.zonas.map((zona) => {
            const zonaResults = results.filter((r) => r.zoneKey === zona.id);
            if (zonaResults.length === 0) return null;

            return (
              <div key={zona.id} className="rounded-xl border border-ipade-border bg-white shadow-sm">
                <div className="border-b border-ipade-border bg-ipade-bg px-4 py-3">
                  <h3 className="font-semibold text-ipade-text">{zona.nombre}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-ipade-border">
                        <th className="px-4 py-2 text-left text-xs font-medium text-ipade-text-muted">Segmento</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-ipade-text-muted">Cuota %</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-ipade-text-muted">Demanda</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-ipade-text-muted">Ventas</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-ipade-text-muted">Faltante</th>
                      </tr>
                    </thead>
                    <tbody>
                      {zonaResults.map((r) => (
                        <tr key={r.segmentKey} className="border-b border-ipade-border last:border-0">
                          <td className="px-4 py-2 font-medium text-ipade-text">
                            {r.segmentKey}
                          </td>
                          <td className="px-4 py-2 text-right font-bold text-ipade-accent">
                            {r.cuotaAsignada.toFixed(2)}%
                          </td>
                          <td className="px-4 py-2 text-right">{Math.round(r.demandaGenerada).toLocaleString()}</td>
                          <td className="px-4 py-2 text-right">{r.ventas.toLocaleString()}</td>
                          <td className={`px-4 py-2 text-right ${r.ventasPerdidas > 0 ? "font-medium text-red-600" : "text-ipade-text-muted"}`}>
                            {r.ventasPerdidas.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "results" && (!results || results.length === 0) && (
        <div className="rounded-xl border border-dashed border-ipade-border bg-white p-12 text-center">
          <p className="text-ipade-text-muted">Aun no hay resultados para tu equipo.</p>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-ipade-text-muted">{label}</label>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2 text-sm text-ipade-text"
      />
    </div>
  );
}
