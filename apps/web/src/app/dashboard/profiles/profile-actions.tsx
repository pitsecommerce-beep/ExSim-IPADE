"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import * as XLSX from "xlsx";

export function ProfileActions() {
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const supabaseRef = useRef<ReturnType<typeof createSupabaseClient> | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createSupabaseClient();
    return supabaseRef.current;
  }

  async function handleCreate() {
    setCreating(true);
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .insert({ name: "Nuevo Perfil", created_by: user.id })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating profile:", error);
      setCreating(false);
      return;
    }
    router.push(`/dashboard/profiles/${data.id}`);
  }

  function handleDownloadTemplate() {
    const wsData = [
      ["nombre", "descripcion"],
      ["Perfil Ejemplo", "Descripción del perfil de simulación"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 30 }, { wch: 40 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Perfiles");
    XLSX.writeFile(wb, "plantilla_perfiles.xlsx");
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target!.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]!];
      if (!ws) return;

      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);
      let imported = 0;

      for (const row of rows) {
        const name = (row["nombre"] ?? row["Nombre"] ?? row["name"] ?? "").trim();
        if (!name) continue;

        const { error } = await supabase
          .from("profiles")
          .insert({ name, created_by: user.id });

        if (!error) imported++;
      }

      if (imported > 0) router.refresh();
    };
    reader.readAsArrayBuffer(file);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleExport() {
    const supabase = getSupabase();
    const { data: profiles } = await supabase
      .from("profiles")
      .select("name, created_at, updated_at")
      .order("name");

    if (!profiles || profiles.length === 0) return;

    const wsData = [
      ["nombre", "creado", "actualizado"],
      ...profiles.map((p: Record<string, unknown>) => [
        p.name,
        new Date(p.created_at as string).toLocaleDateString("es-MX"),
        new Date(p.updated_at as string).toLocaleDateString("es-MX"),
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Perfiles");
    XLSX.writeFile(wb, "perfiles_exsim.xlsx");
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDownloadTemplate}
        className="rounded-md border border-ipade-border px-3 py-2 text-sm text-ipade-text-secondary hover:bg-ipade-bg"
        title="Descargar plantilla Excel"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      </button>
      <button
        onClick={() => fileRef.current?.click()}
        className="rounded-md border border-ipade-border px-3 py-2 text-sm text-ipade-text-secondary hover:bg-ipade-bg"
        title="Importar desde Excel"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      </button>
      <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" />
      <button
        onClick={handleExport}
        className="rounded-md border border-ipade-border px-3 py-2 text-sm text-ipade-text-secondary hover:bg-ipade-bg"
        title="Exportar a Excel"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </button>
      <button
        onClick={handleCreate}
        disabled={creating}
        className="rounded-md bg-ipade-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ipade-accent-hover disabled:opacity-50"
      >
        {creating ? "Creando..." : "Nuevo Perfil"}
      </button>
    </div>
  );
}
