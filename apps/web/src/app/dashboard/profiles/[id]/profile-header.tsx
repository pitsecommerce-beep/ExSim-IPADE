"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Profile {
  id: string;
  name: string;
}

export function ProfileHeader({ profile }: { profile: Profile }) {
  const [name, setName] = useState(profile.name);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createSupabaseClient> | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createSupabaseClient();
    }
    return supabaseRef.current;
  }

  async function handleSaveName() {
    if (!name.trim()) return;
    setSaving(true);
    await getSupabase().from("profiles").update({ name: name.trim() }).eq("id", profile.id);
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar este perfil? Esta acción no se puede deshacer.")) return;
    await getSupabase().from("profiles").delete().eq("id", profile.id);
    router.push("/dashboard/profiles");
    router.refresh();
  }

  async function handleClone() {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .insert({ name: `${profile.name} (copia)`, created_by: user.id })
      .select("id")
      .single();

    if (data) {
      router.push(`/dashboard/profiles/${data.id}`);
      router.refresh();
    }
  }

  return (
    <div className="mb-6">
      <div className="mb-2 text-sm text-ipade-text-muted">
        <Link href="/dashboard/profiles" className="hover:text-ipade-primary">Perfiles</Link>
        <span className="mx-2">/</span>
        <span>{profile.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                className="rounded-md border border-ipade-border bg-ipade-bg px-3 py-1.5 text-xl font-bold text-ipade-text focus:border-ipade-accent focus:outline-none focus:ring-1 focus:ring-ipade-accent"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                disabled={saving}
                className="rounded-md bg-ipade-accent px-3 py-1.5 text-sm text-white hover:bg-ipade-accent-hover"
              >
                Guardar
              </button>
              <button
                onClick={() => { setEditing(false); setName(profile.name); }}
                className="rounded-md px-3 py-1.5 text-sm text-ipade-text-muted hover:text-ipade-text"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <h1
              className="cursor-pointer text-2xl font-bold text-ipade-text hover:text-ipade-primary"
              onClick={() => setEditing(true)}
              title="Clic para editar nombre"
            >
              {profile.name}
            </h1>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleClone}
            className="rounded-md border border-ipade-border px-3 py-1.5 text-sm text-ipade-text-secondary hover:bg-ipade-bg"
          >
            Clonar
          </button>
          <button
            onClick={handleDelete}
            className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
