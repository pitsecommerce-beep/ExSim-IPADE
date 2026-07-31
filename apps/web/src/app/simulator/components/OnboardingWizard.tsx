"use client";

import { useState } from "react";
import type { ZonaData } from "@/lib/storage/types";

type Phase = ZonaData["fase"];

interface WizardState {
  name: string;
  empresas: { id: string; nombre: string }[];
  zonas: {
    id: string;
    nombre: string;
    fase: Phase;
    distribuidores: number;
    limitePrecioAlto: number;
    limitePrecioBajo: number;
    demandaAlto: number;
    demandaBajo: number;
  }[];
  config: {
    kappaPrecioAlto: number;
    kappaPrecioBajo: number;
    canalAlfa: number;
    canalKappa: number;
    valorInicialDimension: number;
  };
  currentPeriod: number;
}

const DEFAULT_CONFIG = {
  kappaPrecioAlto: 0.20,
  kappaPrecioBajo: 0.15,
  canalAlfa: 1,
  canalKappa: 2,
  valorInicialDimension: 0.2,
};

const FASES: Phase[] = ["rollout", "growth", "maturity", "hypermaturity"];

const FASE_LABELS: Record<Phase, string> = {
  rollout: "Lanzamiento",
  growth: "Crecimiento",
  maturity: "Madurez",
  hypermaturity: "Hipermadurez",
};

function emptyZona(index: number): WizardState["zonas"][number] {
  return {
    id: `zona-${index + 1}`,
    nombre: `Zona ${index + 1}`,
    fase: "growth",
    distribuidores: 8,
    limitePrecioAlto: 120,
    limitePrecioBajo: 100,
    demandaAlto: 500,
    demandaBajo: 1000,
  };
}

export default function OnboardingWizard({
  onComplete,
  onCancel,
}: {
  onComplete: (world: WizardState) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>({
    name: "",
    currentPeriod: 7,
    empresas: Array.from({ length: 5 }, (_, i) => ({
      id: `empresa-${i + 1}`,
      nombre: `Empresa ${i + 1}`,
    })),
    zonas: [emptyZona(0)],
    config: { ...DEFAULT_CONFIG },
  });

  const steps = [
    { title: "Nombre y periodo", subtitle: "Identifica tu mundo" },
    { title: "Empresas", subtitle: "Quienes compiten" },
    { title: "Zonas", subtitle: "Define la geografia comercial" },
    { title: "Revisar y crear", subtitle: "Confirma tu configuracion" },
  ];

  function setEmpresaCount(n: number) {
    const clamped = Math.max(2, Math.min(8, n));
    const empresas = Array.from({ length: clamped }, (_, i) => ({
      id: state.empresas[i]?.id ?? `empresa-${i + 1}`,
      nombre: state.empresas[i]?.nombre ?? `Empresa ${i + 1}`,
    }));
    setState((s) => ({ ...s, empresas }));
  }

  function updateEmpresaNombre(index: number, nombre: string) {
    setState((s) => ({
      ...s,
      empresas: s.empresas.map((e, i) => (i === index ? { ...e, nombre } : e)),
    }));
  }

  function addZona() {
    setState((s) => ({ ...s, zonas: [...s.zonas, emptyZona(s.zonas.length)] }));
  }

  function removeZona(index: number) {
    if (state.zonas.length <= 1) return;
    setState((s) => ({ ...s, zonas: s.zonas.filter((_, i) => i !== index) }));
  }

  function updateZona(index: number, field: string, value: string | number) {
    setState((s) => ({
      ...s,
      zonas: s.zonas.map((z, i) =>
        i === index ? { ...z, [field]: value } : z,
      ),
    }));
  }

  const canAdvance = () => {
    if (step === 0) return state.name.trim().length > 0;
    if (step === 1) return state.empresas.length >= 2;
    if (step === 2) return state.zonas.length >= 1;
    return true;
  };

  return (
    <div className="rounded-xl border border-ipade-border bg-white p-6 shadow-lg">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {steps.map((_, i) => (
            <div key={i} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  i < step
                    ? "bg-green-500 text-white"
                    : i === step
                    ? "bg-ipade-accent text-white"
                    : "bg-ipade-bg text-ipade-text-muted"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 w-8 sm:w-16 ${
                    i < step ? "bg-green-500" : "bg-ipade-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-3">
          <h3 className="font-semibold text-ipade-text">{steps[step]?.title}</h3>
          <p className="text-sm text-ipade-text-muted">{steps[step]?.subtitle}</p>
        </div>
      </div>

      {/* Step 0: Name & Period */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ipade-text">
              Nombre del mundo
            </label>
            <input
              type="text"
              value={state.name}
              onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
              placeholder="Ej: Simulacion Grupo 3"
              className="w-full rounded-md border border-ipade-border px-3 py-2 text-sm focus:border-ipade-accent focus:outline-none focus:ring-1 focus:ring-ipade-accent"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ipade-text">
              Periodo inicial
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={state.currentPeriod}
              onChange={(e) =>
                setState((s) => ({ ...s, currentPeriod: parseInt(e.target.value) || 7 }))
              }
              className="w-32 rounded-md border border-ipade-border px-3 py-2 text-sm focus:border-ipade-accent focus:outline-none focus:ring-1 focus:ring-ipade-accent"
            />
            <p className="mt-1 text-xs text-ipade-text-muted">
              El periodo en que arranca la simulacion (normalmente 7 para cursos IPADE).
            </p>
          </div>
        </div>
      )}

      {/* Step 1: Empresas */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ipade-text">
              Numero de empresas
            </label>
            <input
              type="number"
              min={2}
              max={8}
              value={state.empresas.length}
              onChange={(e) => setEmpresaCount(parseInt(e.target.value) || 5)}
              className="w-32 rounded-md border border-ipade-border px-3 py-2 text-sm focus:border-ipade-accent focus:outline-none focus:ring-1 focus:ring-ipade-accent"
            />
          </div>
          <div className="space-y-2">
            {state.empresas.map((emp, i) => (
              <div key={emp.id} className="flex items-center gap-3">
                <span className="w-6 text-center text-sm text-ipade-text-muted">{i + 1}</span>
                <input
                  type="text"
                  value={emp.nombre}
                  onChange={(e) => updateEmpresaNombre(i, e.target.value)}
                  className="flex-1 rounded-md border border-ipade-border px-3 py-2 text-sm focus:border-ipade-accent focus:outline-none focus:ring-1 focus:ring-ipade-accent"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Zonas */}
      {step === 2 && (
        <div className="space-y-4">
          {state.zonas.map((zona, i) => (
            <div key={zona.id} className="rounded-lg border border-ipade-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <input
                  type="text"
                  value={zona.nombre}
                  onChange={(e) => updateZona(i, "nombre", e.target.value)}
                  className="rounded-md border border-ipade-border px-3 py-1.5 text-sm font-medium focus:border-ipade-accent focus:outline-none"
                />
                {state.zonas.length > 1 && (
                  <button
                    onClick={() => removeZona(i)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Eliminar
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs text-ipade-text-muted">Fase</label>
                  <select
                    value={zona.fase}
                    onChange={(e) => updateZona(i, "fase", e.target.value)}
                    className="w-full rounded-md border border-ipade-border px-2 py-1.5 text-sm"
                  >
                    {FASES.map((f) => (
                      <option key={f} value={f}>
                        {FASE_LABELS[f]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-ipade-text-muted">Distribuidores</label>
                  <input
                    type="number"
                    min={1}
                    value={zona.distribuidores}
                    onChange={(e) => updateZona(i, "distribuidores", parseInt(e.target.value) || 1)}
                    className="w-full rounded-md border border-ipade-border px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-ipade-text-muted">Lim. precio alto</label>
                  <input
                    type="number"
                    step={0.01}
                    value={zona.limitePrecioAlto}
                    onChange={(e) => updateZona(i, "limitePrecioAlto", parseFloat(e.target.value) || 0)}
                    className="w-full rounded-md border border-ipade-border px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-ipade-text-muted">Lim. precio bajo</label>
                  <input
                    type="number"
                    step={0.01}
                    value={zona.limitePrecioBajo}
                    onChange={(e) => updateZona(i, "limitePrecioBajo", parseFloat(e.target.value) || 0)}
                    className="w-full rounded-md border border-ipade-border px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-ipade-text-muted">Demanda alto</label>
                  <input
                    type="number"
                    min={0}
                    value={zona.demandaAlto}
                    onChange={(e) => updateZona(i, "demandaAlto", parseInt(e.target.value) || 0)}
                    className="w-full rounded-md border border-ipade-border px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-ipade-text-muted">Demanda bajo</label>
                  <input
                    type="number"
                    min={0}
                    value={zona.demandaBajo}
                    onChange={(e) => updateZona(i, "demandaBajo", parseInt(e.target.value) || 0)}
                    className="w-full rounded-md border border-ipade-border px-2 py-1.5 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addZona}
            className="w-full rounded-md border border-dashed border-ipade-border py-2 text-sm text-ipade-text-muted hover:border-ipade-accent hover:text-ipade-accent"
          >
            + Agregar zona
          </button>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-lg bg-ipade-bg p-4">
            <h4 className="mb-2 font-medium text-ipade-text">Resumen</h4>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <dt className="text-ipade-text-muted">Nombre</dt>
              <dd className="font-medium text-ipade-text">{state.name}</dd>
              <dt className="text-ipade-text-muted">Periodo inicial</dt>
              <dd className="font-medium text-ipade-text">{state.currentPeriod}</dd>
              <dt className="text-ipade-text-muted">Empresas</dt>
              <dd className="font-medium text-ipade-text">{state.empresas.length}</dd>
              <dt className="text-ipade-text-muted">Zonas</dt>
              <dd className="font-medium text-ipade-text">{state.zonas.length}</dd>
            </dl>
          </div>

          <div className="rounded-lg bg-ipade-bg p-4">
            <h4 className="mb-2 font-medium text-ipade-text">Empresas</h4>
            <div className="flex flex-wrap gap-2">
              {state.empresas.map((e) => (
                <span
                  key={e.id}
                  className="rounded-full bg-ipade-primary/10 px-3 py-1 text-xs font-medium text-ipade-primary"
                >
                  {e.nombre}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-ipade-bg p-4">
            <h4 className="mb-2 font-medium text-ipade-text">Zonas</h4>
            <div className="space-y-2">
              {state.zonas.map((z) => (
                <div key={z.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-ipade-text">{z.nombre}</span>
                  <div className="flex gap-3 text-xs text-ipade-text-muted">
                    <span>{FASE_LABELS[z.fase]}</span>
                    <span>{z.distribuidores} dist.</span>
                    <span>Alto: {z.demandaAlto}</span>
                    <span>Bajo: {z.demandaBajo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => (step === 0 ? onCancel() : setStep(step - 1))}
          className="rounded-md border border-ipade-border px-4 py-2 text-sm text-ipade-text-muted hover:bg-ipade-bg"
        >
          {step === 0 ? "Cancelar" : "Atras"}
        </button>
        <div className="flex gap-3">
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canAdvance()}
              className="rounded-md bg-ipade-accent px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={() => onComplete(state)}
              className="rounded-md bg-ipade-primary px-6 py-2 text-sm font-medium text-white hover:bg-ipade-primary-dark"
            >
              Crear mundo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
