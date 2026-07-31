"use client";

import { useState, useEffect, useCallback } from "react";
import type { WorldData } from "@/lib/storage/types";
import OnboardingWizard from "./components/OnboardingWizard";

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
  const [showWizard, setShowWizard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadWorlds = useCallback(async () => {
    const res = await fetch("/api/worlds");
    if (res.ok) setWorlds(await res.json());
  }, []);

  useEffect(() => { void loadWorlds(); }, [loadWorlds]);

  async function createWorld(data: {
    name: string;
    currentPeriod: number;
    empresas: { id: string; nombre: string }[];
    zonas: { id: string; nombre: string; fase: string; distribuidores: number; limitePrecioAlto: number; limitePrecioBajo: number; demandaAlto: number; demandaBajo: number }[];
    config: { kappaPrecioAlto: number; kappaPrecioBajo: number; canalAlfa: number; canalKappa: number; valorInicialDimension: number };
  }) {
    const res = await fetch("/api/worlds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        periodos: [],
      }),
    });

    if (res.ok) {
      setShowWizard(false);
      await loadWorlds();
    }
  }

  async function cargarEscenarioP7() {
    setLoading(true);
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
    setLoading(false);
  }

  async function deleteWorld(id: string) {
    setDeleting(id);
    const res = await fetch(`/api/worlds/${id}`, { method: "DELETE" });
    if (res.ok) {
      await loadWorlds();
    }
    setDeleting(null);
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
            disabled={loading}
            className="rounded-md border border-ipade-accent px-4 py-2 text-sm font-medium text-ipade-accent hover:bg-ipade-accent/5 disabled:opacity-50"
          >
            {loading ? "Cargando..." : "Cargar escenario P7"}
          </button>
          <button
            onClick={() => setShowWizard(true)}
            className="rounded-md bg-ipade-primary px-4 py-2 text-sm font-medium text-white hover:bg-ipade-primary-dark"
          >
            Nuevo mundo
          </button>
        </div>
      </div>

      {showWizard && (
        <OnboardingWizard
          onComplete={(data) => void createWorld(data)}
          onCancel={() => setShowWizard(false)}
        />
      )}

      {worlds.length === 0 && !showWizard ? (
        <div className="rounded-xl border border-dashed border-ipade-border bg-white p-12 text-center">
          <p className="text-ipade-text-muted">No hay mundos creados.</p>
          <p className="mt-2 text-sm text-ipade-text-muted">
            Crea un mundo nuevo o carga el escenario del periodo 7 para empezar.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {worlds.map((w) => (
            <div
              key={w.id}
              className="group relative rounded-xl border border-ipade-border bg-white p-6 shadow-sm hover:border-ipade-accent hover:shadow-md"
            >
              <a href={`/simulator/${w.id}`} className="block">
                <h3 className="font-semibold text-ipade-text">{w.name}</h3>
                <div className="mt-2 flex gap-4 text-xs text-ipade-text-muted">
                  <span>{w.empresas.length} empresas</span>
                  <span>{w.zonas.length} zonas</span>
                  <span>Periodo {w.currentPeriod}</span>
                </div>
                {w.periodos.length > 0 && (
                  <div className="mt-2 text-xs text-ipade-accent">
                    {w.periodos.length} periodo{w.periodos.length > 1 ? "s" : ""} simulado{w.periodos.length > 1 ? "s" : ""}
                  </div>
                )}
              </a>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (confirm(`Eliminar "${w.name}"?`)) {
                    void deleteWorld(w.id);
                  }
                }}
                disabled={deleting === w.id}
                className="absolute right-3 top-3 rounded p-1 text-ipade-text-muted opacity-0 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                title="Eliminar mundo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
