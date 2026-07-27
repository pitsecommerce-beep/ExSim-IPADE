"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import * as XLSX from "xlsx";

export interface ColumnDef<T = Record<string, unknown>> {
  key: string;
  label: string;
  type?: "text" | "number" | "decimal" | "boolean" | "select";
  options?: { value: string; label: string }[];
  editable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface Props {
  profileId: string;
  table: string;
  columns: ColumnDef[];
  filterColumn?: string;
  filterValue?: string;
  canCreate?: boolean;
  canDelete?: boolean;
  defaultValues?: Record<string, unknown>;
  orderBy?: string;
}

type Row = Record<string, unknown> & { id: string };

export function ProfileDataTable({
  profileId,
  table,
  columns,
  filterColumn,
  filterValue,
  canCreate = true,
  canDelete = true,
  defaultValues = {},
  orderBy = "id",
}: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);
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
    let query = supabase.from(table).select("*").eq("profile_id", profileId);
    if (filterColumn && filterValue) {
      query = query.eq(filterColumn, filterValue);
    }
    const { data, error: fetchError } = await query.order(orderBy);
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setRows((data as Row[]) || []);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, table, filterColumn, filterValue, orderBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleCreate() {
    const supabase = getSupabase();
    const newRow: Record<string, unknown> = { profile_id: profileId, ...defaultValues };
    for (const col of columns) {
      if (col.editable !== false && !(col.key in newRow)) {
        if (col.type === "boolean") newRow[col.key] = true;
        else if (col.type === "number" || col.type === "decimal") newRow[col.key] = 0;
        else newRow[col.key] = "";
      }
    }
    if (filterColumn && filterValue) {
      newRow[filterColumn] = filterValue;
    }

    const { data, error: insertError } = await supabase.from(table).insert(newRow).select().single();
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setRows([...rows, data as Row]);
    setEditingId((data as Row).id);
    setEditValues(data as Record<string, unknown>);
  }

  async function handleSave() {
    if (!editingId) return;
    const supabase = getSupabase();
    const updates: Record<string, unknown> = {};
    for (const col of columns) {
      if (col.editable !== false && col.key in editValues) {
        updates[col.key] = editValues[col.key];
      }
    }

    const { error: updateError } = await supabase.from(table).update(updates).eq("id", editingId);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setRows(rows.map((r) => (r.id === editingId ? { ...r, ...updates } : r)));
    setEditingId(null);
    setEditValues({});
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este registro?")) return;
    const supabase = getSupabase();
    const { error: deleteError } = await supabase.from(table).delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setRows(rows.filter((r) => r.id !== id));
  }

  function startEdit(row: Row) {
    setEditingId(row.id);
    setEditValues({ ...row });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValues({});
  }

  function renderCell(col: ColumnDef, row: Row) {
    const isEditing = editingId === row.id;
    const value = isEditing ? editValues[col.key] : row[col.key];

    if (col.render && !isEditing) {
      return col.render(row[col.key], row);
    }

    if (!isEditing || col.editable === false) {
      if (col.type === "boolean") {
        return (value as boolean) ? (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Sí</span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">No</span>
        );
      }
      return <span className="text-ipade-text">{String(value ?? "")}</span>;
    }

    if (col.type === "boolean") {
      return (
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => setEditValues({ ...editValues, [col.key]: e.target.checked })}
          className="h-4 w-4 rounded border-ipade-border text-ipade-accent focus:ring-ipade-accent"
        />
      );
    }

    if (col.type === "select" && col.options) {
      return (
        <select
          value={String(value ?? "")}
          onChange={(e) => setEditValues({ ...editValues, [col.key]: e.target.value })}
          className="w-full rounded border border-ipade-border bg-ipade-bg px-2 py-1 text-sm focus:border-ipade-accent focus:outline-none"
        >
          {col.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={col.type === "number" || col.type === "decimal" ? "number" : "text"}
        step={col.type === "decimal" ? "0.01" : undefined}
        value={String(value ?? "")}
        onChange={(e) =>
          setEditValues({
            ...editValues,
            [col.key]: col.type === "number" ? parseInt(e.target.value) || 0
              : col.type === "decimal" ? parseFloat(e.target.value) || 0
              : e.target.value,
          })
        }
        className="w-full rounded border border-ipade-border bg-ipade-bg px-2 py-1 text-sm focus:border-ipade-accent focus:outline-none"
      />
    );
  }

  if (loading) {
    return <div className="py-8 text-center text-sm text-ipade-text-muted">Cargando...</div>;
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-medium underline">Cerrar</button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-ipade-border bg-ipade-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ipade-border bg-ipade-bg">
              {columns.map((col) => (
                <th key={col.key} className="px-3 py-2.5 font-medium text-ipade-text-secondary" style={{ width: col.width }}>
                  {col.label}
                </th>
              ))}
              <th className="w-24 px-3 py-2.5 text-right font-medium text-ipade-text-secondary">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-8 text-center text-ipade-text-muted">
                  Sin registros.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-ipade-border last:border-0 hover:bg-ipade-bg/30">
                  {columns.map((col) => (
                    <td key={col.key} className="px-3 py-2">
                      {renderCell(col, row)}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right">
                    {editingId === row.id ? (
                      <div className="flex justify-end gap-1">
                        <button onClick={handleSave} className="rounded px-2 py-1 text-xs text-green-600 hover:bg-green-50">
                          Guardar
                        </button>
                        <button onClick={cancelEdit} className="rounded px-2 py-1 text-xs text-ipade-text-muted hover:bg-ipade-bg">
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1">
                        <button onClick={() => startEdit(row)} className="rounded px-2 py-1 text-xs text-ipade-primary hover:bg-ipade-bg">
                          Editar
                        </button>
                        {canDelete && (
                          <button onClick={() => handleDelete(row.id)} className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50">
                            Eliminar
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {canCreate && (
          <button
            onClick={handleCreate}
            className="rounded-md border border-dashed border-ipade-border px-4 py-2 text-sm text-ipade-text-muted transition-colors hover:border-ipade-primary hover:text-ipade-primary"
          >
            + Agregar registro
          </button>
        )}
        {rows.length > 0 && (
          <button
            onClick={() => {
              const data: unknown[][] = [columns.map((c) => c.label)];
              for (const row of rows) {
                data.push(columns.map((c) => row[c.key] ?? ""));
              }
              const ws = XLSX.utils.aoa_to_sheet(data);
              ws["!cols"] = columns.map(() => ({ wch: 18 }));
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, table);
              XLSX.writeFile(wb, `${table}.xlsx`);
            }}
            className="rounded-md border border-ipade-border px-3 py-2 text-xs text-ipade-text-muted hover:text-ipade-primary"
            title="Exportar a Excel"
          >
            Exportar Excel
          </button>
        )}
      </div>
    </div>
  );
}
