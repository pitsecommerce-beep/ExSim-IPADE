"use client";

import { useState, useEffect, useCallback } from "react";
import type { WorldData } from "@/lib/storage/types";

const ESCENARIO_P7 = {
  name: "Escenario Periodo 7 (curso real)",
  currentPeriod: 7,
  empresas: [
    { id: "ecoklin", nombre: "ECO-KLIN" },
    { id: "dustbusters", nombre: "DUSTBUSTERS" },
    { id: "apex", nombre: "APEX" },
    { id: "cocalla", nombre: "COCALLA" },
    { id: "tekani", nombre: "TEKANI" },
  ],
  zonas: [
    { id: "centro", nombre: "Centro", fase: "growth" as const, distribuidores: 10, limitePrecioAlto: 111.51, limitePrecioBajo: 90.61, demandaAlto: 1105, demandaBajo: 2345 },
    { id: "oeste", nombre: "Oeste", fase: "growth" as const, distribuidores: 10, limitePrecioAlto: 111.87, limitePrecioBajo: 91.26, demandaAlto: 554, demandaBajo: 1175 },
    { id: "norte", nombre: "Norte", fase: "growth" as const, distribuidores: 8, limitePrecioAlto: 140.66, limitePrecioBajo: 120.87, demandaAlto: 516, demandaBajo: 992 },
    { id: "este", nombre: "Este", fase: "rollout" as const, distribuidores: 7, limitePrecioAlto: 177.29, limitePrecioBajo: 156.59, demandaAlto: 390, demandaBajo: 1170 },
    { id: "sur", nombre: "Sur", fase: "rollout" as const, distribuidores: 7, limitePrecioAlto: 160.00, limitePrecioBajo: 139.40, demandaAlto: 470, demandaBajo: 485 },
  ],
  config: {
    kappaPrecioAlto: 0.20,
    kappaPrecioBajo: 0.15,
    canalAlfa: 1,
    canalKappa: 2,
    valorInicialDimension: 0.2,
  },
};

export default function SimulatorPage() {
  const [worlds, setWorlds] = useState<WorldData[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [numEmpresas, setNumEmpresas] = useState(5);

  const loadWorlds = useCallback(async () => {
    const res = await fetch("/api/worlds");
    if (res.ok) setWorlds(await res.json());
  }, []);

  useEffect(() => { void loadWorlds(); }, [loadWorlds]);

  async function crearMundo() {
    const empresas = Array.from({ length: numEmpresas }, (_, i) => ({
      id: `empresa-${i + 1}`,
      nombre: `Empresa ${i + 1}`,
    }));

    const res = await fetch("/api/worlds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName || "Nuevo Mundo",
        currentPeriod: 7,
        empresas,
        zonas: ESCENARIO_P7.zonas,
        config: ESCENARIO_P7.config,
        periodos: [],
      }),
    });

    if (res.ok) {
      setCreating(false);
      setNewName("");
      await loadWorlds();
    }
  }

  async function cargarEscenarioP7() {
    const res = await fetch("/api/worlds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...ESCENARIO_P7,
        periodos: [],
      }),
    });

    if (res.ok) {
      await loadWorlds();
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ipade-text">Mundos</h2>
          <p className="text-sm text-ipade-text-muted">
            Crea un mundo, captura decisiones y corre el cuatrimestre.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={cargarEscenarioP7}
            className="rounded-md border border-ipade-accent px-4 py-2 text-sm font-medium text-ipade-accent hover:bg-ipade-accent/5"
          >
            Cargar escenario P7
          </button>
          <button
            onClick={() => setCreating(true)}
            className="rounded-md bg-ipade-primary px-4 py-2 text-sm font-medium text-white hover:bg-ipade-primary-dark"
          >
            Nuevo mundo
          </button>
        </div>
      </div>

      {creating && (
        <div className="rounded-xl border border-ipade-border bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-ipade-text">Crear mundo</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-ipade-text-muted">Nombre</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Mi simulacion"
                className="w-full rounded-md border border-ipade-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-ipade-text-muted">Empresas</label>
              <input
                type="number"
                min={2}
                max={8}
                value={numEmpresas}
                onChange={(e) => setNumEmpresas(parseInt(e.target.value) || 5)}
                className="w-full rounded-md border border-ipade-border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setCreating(false)}
              className="rounded-md border border-ipade-border px-4 py-2 text-sm text-ipade-text-muted hover:bg-ipade-bg"
            >
              Cancelar
            </button>
            <button
              onClick={crearMundo}
              className="rounded-md bg-ipade-primary px-4 py-2 text-sm font-medium text-white hover:bg-ipade-primary-dark"
            >
              Crear
            </button>
          </div>
        </div>
      )}

      {worlds.length === 0 && !creating ? (
        <div className="rounded-xl border border-dashed border-ipade-border bg-white p-12 text-center">
          <p className="text-ipade-text-muted">No hay mundos creados.</p>
          <p className="mt-2 text-sm text-ipade-text-muted">
            Crea un mundo nuevo o carga el escenario del periodo 7 para empezar.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {worlds.map((w) => (
            <a
              key={w.id}
              href={`/simulator/${w.id}`}
              className="rounded-xl border border-ipade-border bg-white p-6 shadow-sm hover:border-ipade-accent hover:shadow-md"
            >
              <h3 className="font-semibold text-ipade-text">{w.name}</h3>
              <div className="mt-2 flex gap-4 text-xs text-ipade-text-muted">
                <span>{w.empresas.length} empresas</span>
                <span>{w.zonas.length} zonas</span>
                <span>Periodo {w.currentPeriod}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
