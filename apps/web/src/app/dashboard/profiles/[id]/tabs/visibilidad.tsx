"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

interface ToggleDef {
  key: string;
  label: string;
}

const toggles: ToggleDef[] = [
  { key: "movimiento_maquinas", label: "Movimiento De Máquinas" },
  { key: "alquiler_maquinas", label: "Alquiler De Máquinas" },
  { key: "hipoteca", label: "Hipoteca" },
  { key: "factoraje", label: "Factoraje" },
  { key: "prestamo_accionista", label: "Préstamo De Accionista" },
  { key: "dividendos", label: "Dividendos" },
  { key: "emision_acciones", label: "Emisión De Acciones" },
  { key: "ver_precios_competencia", label: "Ver Precios Competencia" },
  { key: "ver_cuota_mercado", label: "Ver Cuota de Mercado" },
  { key: "ver_produccion_competencia", label: "Ver Producción Competencia" },
  { key: "ver_finanzas_competencia", label: "Ver Finanzas Competencia" },
  { key: "ver_costos_detallados", label: "Ver Costos Detallados" },
];

export function VisibilidadTab({ profileId }: { profileId: string; subtab?: string }) {
  const [values, setValues] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createSupabaseClient> | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createSupabaseClient();
    return supabaseRef.current;
  }

  const fetchData = useCallback(async () => {
    setLoading(true);
    const supabase = getSupabase();
    const { data, error: fetchError } = await supabase
      .from("visibility_params")
      .select("*")
      .eq("profile_id", profileId)
      .maybeSingle();

    if (fetchError) {
      setError(fetchError.message);
    } else if (data) {
      const boolValues: Record<string, boolean> = {};
      for (const t of toggles) {
        boolValues[t.key] = !!(data as Record<string, unknown>)[t.key];
      }
      setValues(boolValues);
    } else {
      const defaults: Record<string, boolean> = {};
      for (const t of toggles) defaults[t.key] = false;
      setValues(defaults);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleToggle(key: string) {
    setValues((prev) => ({ ...prev, [key]: !prev[key] }));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const supabase = getSupabase();

    const payload: Record<string, unknown> = { profile_id: profileId };
    for (const t of toggles) {
      payload[t.key] = values[t.key] ?? false;
    }

    const { error: upsertError } = await supabase
      .from("visibility_params")
      .upsert(payload, { onConflict: "profile_id" });

    if (upsertError) {
      setError(upsertError.message);
    } else {
      setDirty(false);
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="py-8 text-center text-sm text-ipade-text-muted">Cargando...</div>;
  }

  return (
    <div className="rounded-lg border border-ipade-border bg-ipade-surface p-6">
      <h3 className="mb-2 text-lg font-semibold text-ipade-text">Visibilidad</h3>
      <p className="mb-6 text-sm text-ipade-text-muted">
        Activa o desactiva las opciones disponibles para los participantes en la simulación.
      </p>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-medium underline">Cerrar</button>
        </div>
      )}

      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {toggles.map((t) => {
          const active = values[t.key] ?? false;
          return (
            <div key={t.key}>
              <p className="mb-2 text-sm font-semibold text-ipade-text">{t.label}</p>
              <button
                type="button"
                role="switch"
                aria-checked={active}
                onClick={() => handleToggle(t.key)}
                className="group flex items-center gap-2"
              >
                <span
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    active ? "bg-ipade-primary" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
                      active ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </span>
                <span className={`text-sm ${active ? "text-ipade-primary font-medium" : "text-ipade-text-muted"}`}>
                  {active ? "Activo" : "Desactivado"}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="rounded-md bg-ipade-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ipade-accent-hover disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
        {dirty && <span className="text-sm text-ipade-text-muted">Hay cambios sin guardar</span>}
      </div>
    </div>
  );
}
