"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

export interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "number" | "decimal" | "boolean" | "select" | "textarea";
  options?: { value: string; label: string }[];
  step?: string;
  placeholder?: string;
}

interface Props {
  profileId: string;
  table: string;
  fields: FieldDef[];
  title?: string;
}

type Row = Record<string, unknown>;

export function ProfileParamsForm({ profileId, table, fields, title }: Props) {
  const [values, setValues] = useState<Row>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const supabaseRef = useRef<ReturnType<typeof createSupabaseClient> | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createSupabaseClient();
    }
    return supabaseRef.current;
  }

  const fetchData = useCallback(async () => {
    setLoading(true);
    const supabase = getSupabase();
    const { data, error: fetchError } = await supabase
      .from(table)
      .select("*")
      .eq("profile_id", profileId)
      .maybeSingle();

    if (fetchError) {
      setError(fetchError.message);
    } else if (data) {
      setValues(data);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, table]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const supabase = getSupabase();

    const payload: Row = { profile_id: profileId };
    for (const f of fields) {
      if (f.key in values) {
        payload[f.key] = values[f.key];
      }
    }

    const { error: upsertError } = await supabase
      .from(table)
      .upsert(payload, { onConflict: "profile_id" });

    if (upsertError) {
      setError(upsertError.message);
    } else {
      setDirty(false);
    }
    setSaving(false);
  }

  function updateField(key: string, value: unknown) {
    setValues({ ...values, [key]: value });
    setDirty(true);
  }

  if (loading) {
    return <div className="py-8 text-center text-sm text-ipade-text-muted">Cargando...</div>;
  }

  return (
    <div className="rounded-lg border border-ipade-border bg-ipade-surface p-6">
      {title && <h3 className="mb-4 text-lg font-semibold text-ipade-text">{title}</h3>}

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-medium underline">Cerrar</button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((f) => {
          const val = values[f.key];
          return (
            <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2 lg:col-span-3" : ""}>
              <label className="mb-1 block text-sm font-medium text-ipade-text-secondary">
                {f.label}
              </label>
              {f.type === "boolean" ? (
                <input
                  type="checkbox"
                  checked={!!val}
                  onChange={(e) => updateField(f.key, e.target.checked)}
                  className="h-4 w-4 rounded border-ipade-border text-ipade-accent focus:ring-ipade-accent"
                />
              ) : f.type === "select" && f.options ? (
                <select
                  value={String(val ?? "")}
                  onChange={(e) => updateField(f.key, e.target.value)}
                  className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2 text-sm focus:border-ipade-accent focus:outline-none"
                >
                  {f.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : f.type === "textarea" ? (
                <textarea
                  value={String(val ?? "")}
                  onChange={(e) => updateField(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  rows={3}
                  className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2 text-sm focus:border-ipade-accent focus:outline-none"
                />
              ) : (
                <input
                  type={f.type === "number" || f.type === "decimal" ? "number" : "text"}
                  step={f.type === "decimal" ? (f.step ?? "0.01") : undefined}
                  value={String(val ?? "")}
                  placeholder={f.placeholder}
                  onChange={(e) =>
                    updateField(
                      f.key,
                      f.type === "number" ? parseInt(e.target.value) || 0
                        : f.type === "decimal" ? parseFloat(e.target.value) || 0
                        : e.target.value,
                    )
                  }
                  className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2 text-sm focus:border-ipade-accent focus:outline-none"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-3">
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
