"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import type { WorldData, DecisionData } from "@/lib/storage/types";
import type { EmpresaZonaSegmentoResult } from "@exsim/engine/commercial/types";

type DecRow = Omit<DecisionData, "mejorasActivas"> & { mejorasActivas: string[] };

function defaultDecision(empresaId: string, zonaId: string): DecRow {
  return {
    empresaId,
    zonaId,
    precio: 80,
    vendedores: 10,
    spotsTV: 10,
    enfoqueMarcaTV: 0.5,
    spotsRadio: 20,
    enfoqueMarcaRadio: 0.5,
    mejorasActivas: [],
    productoTerminado: 5000,
    previsionDemanda: 5000,
  };
}

export default function WorldPage() {
  const params = useParams<{ worldId: string }>();
  const [world, setWorld] = useState<WorldData | null>(null);
  const [decisions, setDecisions] = useState<DecRow[]>([]);
  const [results, setResults] = useState<EmpresaZonaSegmentoResult[] | null>(null);
  const [selectedCell, setSelectedCell] = useState<EmpresaZonaSegmentoResult | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<"decisiones" | "resultados">("decisiones");
  const [selectedZona, setSelectedZona] = useState<string>("");

  const loadWorld = useCallback(async () => {
    const res = await fetch(`/api/worlds`);
    if (!res.ok) return;
    const worlds: WorldData[] = await res.json();
    const w = worlds.find((w) => w.id === params.worldId);
    if (w) {
      setWorld(w);
      if (!selectedZona && w.zonas.length > 0) {
        setSelectedZona(w.zonas[0]!.id);
      }
      const decs: DecRow[] = [];
      for (const emp of w.empresas) {
        for (const zona of w.zonas) {
          decs.push(defaultDecision(emp.id, zona.id));
        }
      }
      setDecisions(decs);
    }
  }, [params.worldId, selectedZona]);

  useEffect(() => { void loadWorld(); }, [loadWorld]);

  function updateDecision(empresaId: string, zonaId: string, field: keyof DecRow, value: number | string) {
    setDecisions((prev) =>
      prev.map((d) =>
        d.empresaId === empresaId && d.zonaId === zonaId
          ? { ...d, [field]: value }
          : d,
      ),
    );
  }

  async function runSimulation() {
    if (!world) return;
    setSimulating(true);

    const periodo = {
      periodo: world.currentPeriod,
      decisiones: decisions,
    };

    const worldWithDecisions = {
      ...world,
      periodos: [...world.periodos, periodo],
    };

    await fetch("/api/worlds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(worldWithDecisions),
    });

    const res = await fetch(`/api/worlds/${world.id}/simulate`, {
      method: "POST",
    });

    if (res.ok) {
      const data = await res.json();
      setResults(data.resultados);
      setActiveTab("resultados");
    }

    setSimulating(false);
    await loadWorld();
  }

  if (!world) {
    return <div className="text-ipade-text-muted">Cargando mundo...</div>;
  }

  const zonaActual = world.zonas.find((z) => z.id === selectedZona);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ipade-text">{world.name}</h2>
          <p className="text-sm text-ipade-text-muted">
            Periodo {world.currentPeriod} — {world.empresas.length} empresas — {world.zonas.length} zonas
          </p>
        </div>
        <button
          onClick={runSimulation}
          disabled={simulating}
          className="rounded-md bg-ipade-accent px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {simulating ? "Simulando..." : "Correr cuatrimestre"}
        </button>
      </div>

      <div className="flex gap-1 border-b border-ipade-border">
        <button
          onClick={() => setActiveTab("decisiones")}
          className={`px-4 py-2 text-sm font-medium ${activeTab === "decisiones" ? "border-b-2 border-ipade-accent text-ipade-accent" : "text-ipade-text-muted"}`}
        >
          Decisiones
        </button>
        <button
          onClick={() => setActiveTab("resultados")}
          className={`px-4 py-2 text-sm font-medium ${activeTab === "resultados" ? "border-b-2 border-ipade-accent text-ipade-accent" : "text-ipade-text-muted"}`}
        >
          Resultados
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {world.zonas.map((z) => (
          <button
            key={z.id}
            onClick={() => setSelectedZona(z.id)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium ${
              selectedZona === z.id
                ? "bg-ipade-primary text-white"
                : "bg-ipade-bg text-ipade-text-muted hover:bg-ipade-border"
            }`}
          >
            {z.nombre} ({z.fase})
          </button>
        ))}
      </div>

      {activeTab === "decisiones" && zonaActual && (
        <DecisionTable
          world={world}
          zona={zonaActual}
          decisions={decisions.filter((d) => d.zonaId === selectedZona)}
          onUpdate={updateDecision}
        />
      )}

      {activeTab === "resultados" && results && (
        <ResultsView
          world={world}
          results={results.filter((r) => r.zonaId === selectedZona)}
          selectedCell={selectedCell}
          onSelectCell={setSelectedCell}
        />
      )}

      {activeTab === "resultados" && !results && (
        <div className="rounded-xl border border-dashed border-ipade-border bg-white p-12 text-center">
          <p className="text-ipade-text-muted">Aun no hay resultados. Captura decisiones y corre el cuatrimestre.</p>
        </div>
      )}
    </div>
  );
}

function DecisionTable({
  world,
  zona,
  decisions,
  onUpdate,
}: {
  world: WorldData;
  zona: WorldData["zonas"][number];
  decisions: DecRow[];
  onUpdate: (empresaId: string, zonaId: string, field: keyof DecRow, value: number | string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-ipade-border bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ipade-border bg-ipade-bg">
            <th className="px-4 py-3 text-left font-medium text-ipade-text-muted">Empresa</th>
            <th className="px-4 py-3 text-right font-medium text-ipade-text-muted">Precio</th>
            <th className="px-4 py-3 text-right font-medium text-ipade-text-muted">Vendedores</th>
            <th className="px-4 py-3 text-right font-medium text-ipade-text-muted">v/d</th>
            <th className="px-4 py-3 text-right font-medium text-ipade-text-muted">TV spots</th>
            <th className="px-4 py-3 text-right font-medium text-ipade-text-muted">Radio spots</th>
            <th className="px-4 py-3 text-right font-medium text-ipade-text-muted">Enf. marca</th>
            <th className="px-4 py-3 text-right font-medium text-ipade-text-muted">Gen. TV</th>
            <th className="px-4 py-3 text-right font-medium text-ipade-text-muted">Prod. term.</th>
            <th className="px-4 py-3 text-right font-medium text-ipade-text-muted">Prevision</th>
          </tr>
        </thead>
        <tbody>
          {world.empresas.map((emp) => {
            const dec = decisions.find((d) => d.empresaId === emp.id);
            if (!dec) return null;
            const vd = zona.distribuidores > 0 ? dec.vendedores / zona.distribuidores : 0;
            const tvGen = dec.spotsTV * (1 - dec.enfoqueMarcaTV);
            const isAbsent = dec.precio === 0;

            return (
              <tr key={emp.id} className={`border-b border-ipade-border last:border-0 ${isAbsent ? "bg-red-50 opacity-60" : ""}`}>
                <td className="px-4 py-2 font-medium text-ipade-text">
                  {emp.nombre}
                  {isAbsent && <span className="ml-2 text-xs text-red-500">No participa</span>}
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min={0}
                    value={dec.precio}
                    onChange={(e) => onUpdate(emp.id, zona.id, "precio", parseFloat(e.target.value) || 0)}
                    className="w-20 rounded border border-ipade-border px-2 py-1 text-right text-sm"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min={0}
                    value={dec.vendedores}
                    onChange={(e) => onUpdate(emp.id, zona.id, "vendedores", parseInt(e.target.value) || 0)}
                    className="w-16 rounded border border-ipade-border px-2 py-1 text-right text-sm"
                  />
                </td>
                <td className="px-4 py-2 text-right">
                  <span className={`text-xs ${vd > 2 ? "font-medium text-amber-600" : "text-ipade-text-muted"}`}>
                    {vd.toFixed(2)}
                    {vd > 2 && " (saturado)"}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min={0}
                    value={dec.spotsTV}
                    onChange={(e) => onUpdate(emp.id, zona.id, "spotsTV", parseInt(e.target.value) || 0)}
                    className="w-16 rounded border border-ipade-border px-2 py-1 text-right text-sm"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min={0}
                    value={dec.spotsRadio}
                    onChange={(e) => onUpdate(emp.id, zona.id, "spotsRadio", parseInt(e.target.value) || 0)}
                    className="w-16 rounded border border-ipade-border px-2 py-1 text-right text-sm"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min={0.1}
                    max={0.9}
                    step={0.1}
                    value={dec.enfoqueMarcaTV}
                    onChange={(e) => onUpdate(emp.id, zona.id, "enfoqueMarcaTV", parseFloat(e.target.value) || 0.5)}
                    className="w-16 rounded border border-ipade-border px-2 py-1 text-right text-sm"
                  />
                </td>
                <td className="px-4 py-2 text-right text-xs text-ipade-text-muted">
                  {tvGen.toFixed(1)}
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min={0}
                    value={dec.productoTerminado}
                    onChange={(e) => onUpdate(emp.id, zona.id, "productoTerminado", parseInt(e.target.value) || 0)}
                    className="w-20 rounded border border-ipade-border px-2 py-1 text-right text-sm"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min={0}
                    value={dec.previsionDemanda}
                    onChange={(e) => onUpdate(emp.id, zona.id, "previsionDemanda", parseInt(e.target.value) || 0)}
                    className="w-20 rounded border border-ipade-border px-2 py-1 text-right text-sm"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ResultsView({
  world,
  results,
  selectedCell,
  onSelectCell,
}: {
  world: WorldData;
  results: EmpresaZonaSegmentoResult[];
  selectedCell: EmpresaZonaSegmentoResult | null;
  onSelectCell: (cell: EmpresaZonaSegmentoResult | null) => void;
}) {
  const altoResults = results.filter((r) => r.segmento === "alto");
  const bajoResults = results.filter((r) => r.segmento === "bajo");

  return (
    <div className="space-y-6">
      <SegmentTable
        title="Segmento Alto"
        results={altoResults}
        world={world}
        selectedCell={selectedCell}
        onSelectCell={onSelectCell}
      />
      <SegmentTable
        title="Segmento Bajo"
        results={bajoResults}
        world={world}
        selectedCell={selectedCell}
        onSelectCell={onSelectCell}
      />

      {selectedCell && (
        <TracePanel cell={selectedCell} world={world} onClose={() => onSelectCell(null)} />
      )}
    </div>
  );
}

function SegmentTable({
  title,
  results,
  world,
  selectedCell,
  onSelectCell,
}: {
  title: string;
  results: EmpresaZonaSegmentoResult[];
  world: WorldData;
  selectedCell: EmpresaZonaSegmentoResult | null;
  onSelectCell: (cell: EmpresaZonaSegmentoResult | null) => void;
}) {
  return (
    <div className="rounded-xl border border-ipade-border bg-white shadow-sm">
      <div className="border-b border-ipade-border bg-ipade-bg px-4 py-3">
        <h3 className="font-semibold text-ipade-text">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ipade-border">
              <th className="px-4 py-2 text-left font-medium text-ipade-text-muted">Empresa</th>
              <th className="px-4 py-2 text-right font-medium text-ipade-text-muted">u Precio</th>
              <th className="px-4 py-2 text-right font-medium text-ipade-text-muted">u Presup.</th>
              <th className="px-4 py-2 text-right font-medium text-ipade-text-muted">u Canal</th>
              <th className="px-4 py-2 text-right font-medium text-ipade-text-muted">u Public.</th>
              <th className="px-4 py-2 text-right font-medium text-ipade-text-muted">u Producto</th>
              <th className="px-4 py-2 text-right font-medium text-ipade-text-muted">Total</th>
              <th className="px-4 py-2 text-right font-medium text-ipade-text-muted">Final</th>
              <th className="px-4 py-2 text-right font-medium text-ipade-text-muted">Cuota %</th>
              <th className="px-4 py-2 text-right font-medium text-ipade-text-muted">Dem. gen.</th>
              <th className="px-4 py-2 text-right font-medium text-ipade-text-muted">Ventas</th>
              <th className="px-4 py-2 text-right font-medium text-ipade-text-muted">Faltante</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => {
              const emp = world.empresas.find((e) => e.id === r.empresaId);
              const isSelected = selectedCell?.empresaId === r.empresaId && selectedCell?.segmento === r.segmento;
              return (
                <tr
                  key={r.empresaId}
                  onClick={() => onSelectCell(isSelected ? null : r)}
                  className={`cursor-pointer border-b border-ipade-border last:border-0 hover:bg-blue-50 ${isSelected ? "bg-blue-50" : ""}`}
                >
                  <td className="px-4 py-2 font-medium text-ipade-text">{emp?.nombre ?? r.empresaId}</td>
                  <td className="px-4 py-2 text-right">{r.atributos.uPrecio.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{r.atributos.uPresupuesto.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{r.atributos.uCanal.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{r.atributos.uPublicidad.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{r.atributos.uProducto.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right font-medium">{r.total.toFixed(4)}</td>
                  <td className="px-4 py-2 text-right">{r.final.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right font-bold text-ipade-accent">{(r.cuotaAsignada * 100).toFixed(2)}%</td>
                  <td className="px-4 py-2 text-right">{Math.round(r.demandaGenerada).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">{r.ventas.toLocaleString()}</td>
                  <td className={`px-4 py-2 text-right ${r.faltante > 0 ? "font-medium text-red-600" : "text-ipade-text-muted"}`}>
                    {r.faltante.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TracePanel({
  cell,
  world,
  onClose,
}: {
  cell: EmpresaZonaSegmentoResult;
  world: WorldData;
  onClose: () => void;
}) {
  const emp = world.empresas.find((e) => e.id === cell.empresaId);
  const zona = world.zonas.find((z) => z.id === cell.zonaId);
  const certeza = (nivel: string) => {
    const colors: Record<string, string> = {
      VERIFICADO: "bg-green-100 text-green-800",
      CALIBRADO: "bg-amber-100 text-amber-800",
      SUPUESTO: "bg-red-100 text-red-800",
    };
    return <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${colors[nivel] ?? ""}`}>{nivel}</span>;
  };

  return (
    <div className="rounded-xl border border-ipade-accent bg-white p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-ipade-text">
          Trazabilidad: {emp?.nombre} — {zona?.nombre} — {cell.segmento === "alto" ? "Alto" : "Bajo"}
        </h3>
        <button onClick={onClose} className="text-ipade-text-muted hover:text-ipade-text">Cerrar</button>
      </div>

      <div className="space-y-3 text-sm">
        <div className="rounded-lg bg-ipade-bg p-4">
          <h4 className="mb-2 font-medium text-ipade-text">1. Atributos (escala 0-100)</h4>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="py-1 text-ipade-text-muted">u_precio {certeza("VERIFICADO")}</td>
                <td className="py-1 text-right font-mono">{cell.atributos.uPrecio.toFixed(4)}</td>
                <td className="py-1 pl-3 text-xs text-ipade-text-muted">50 x [1 - (P/Pbar - 1) / kappa]</td>
              </tr>
              <tr>
                <td className="py-1 text-ipade-text-muted">u_presupuesto {certeza("VERIFICADO")}</td>
                <td className="py-1 text-right font-mono">{cell.atributos.uPresupuesto.toFixed(4)}</td>
                <td className="py-1 pl-3 text-xs text-ipade-text-muted">100 x exp(-(P/L)^15)</td>
              </tr>
              <tr>
                <td className="py-1 text-ipade-text-muted">u_canal {certeza("VERIFICADO")}</td>
                <td className="py-1 text-right font-mono">{cell.atributos.uCanal.toFixed(4)}</td>
                <td className="py-1 pl-3 text-xs text-ipade-text-muted">100 x [1 - exp(-(v/d)^2)]</td>
              </tr>
              <tr>
                <td className="py-1 text-ipade-text-muted">u_publicidad {certeza("CALIBRADO")}</td>
                <td className="py-1 text-right font-mono">{cell.atributos.uPublicidad.toFixed(4)}</td>
                <td className="py-1 pl-3 text-xs text-ipade-text-muted">stock de conocimiento</td>
              </tr>
              <tr>
                <td className="py-1 text-ipade-text-muted">u_producto {certeza("SUPUESTO")}</td>
                <td className="py-1 text-right font-mono">{cell.atributos.uProducto.toFixed(4)}</td>
                <td className="py-1 pl-3 text-xs text-ipade-text-muted">punto ideal vs DesiredValue</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-lg bg-ipade-bg p-4">
          <h4 className="mb-2 font-medium text-ipade-text">2. Agregacion y cuota</h4>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="py-1 text-ipade-text-muted">Total (atraccion)</td>
                <td className="py-1 text-right font-mono">{cell.total.toFixed(6)}</td>
              </tr>
              <tr>
                <td className="py-1 text-ipade-text-muted">Final (normalizado)</td>
                <td className="py-1 text-right font-mono">{cell.final.toFixed(4)}</td>
              </tr>
              <tr>
                <td className="py-1 text-ipade-text-muted">Share de atraccion</td>
                <td className="py-1 text-right font-mono">{(cell.shareAtraccion * 100).toFixed(4)}%</td>
              </tr>
              <tr className="font-medium">
                <td className="py-1 text-ipade-text">Cuota asignada</td>
                <td className="py-1 text-right font-mono text-ipade-accent">{(cell.cuotaAsignada * 100).toFixed(4)}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-lg bg-ipade-bg p-4">
          <h4 className="mb-2 font-medium text-ipade-text">3. Demanda y ventas</h4>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="py-1 text-ipade-text-muted">Demanda generada</td>
                <td className="py-1 text-right font-mono">{Math.round(cell.demandaGenerada).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-1 text-ipade-text-muted">Ventas realizadas</td>
                <td className="py-1 text-right font-mono">{cell.ventas.toLocaleString()}</td>
              </tr>
              <tr className={cell.faltante > 0 ? "text-red-600" : ""}>
                <td className="py-1">Faltante</td>
                <td className="py-1 text-right font-mono">{cell.faltante.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
