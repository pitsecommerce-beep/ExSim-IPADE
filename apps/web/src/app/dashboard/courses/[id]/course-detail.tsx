"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

interface Props {
  course: Record<string, unknown>;
  worlds: Record<string, unknown>[];
  profile: { id: string; name: string } | null;
}

export function CourseDetail({ course, worlds, profile }: Props) {
  const status = course.status as string;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createSupabaseClient> | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createSupabaseClient();
    return supabaseRef.current;
  }

  async function handleDelete() {
    setDeleting(true);
    const supabase = getSupabase();
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", course.id as string);
    if (error) {
      alert(`Error al eliminar: ${error.message}`);
      setDeleting(false);
      setConfirmDelete(false);
      return;
    }
    router.push("/dashboard/courses");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-ipade-text-muted">
            <Link href="/dashboard/courses" className="hover:text-ipade-primary">Cursos</Link>
            <span>/</span>
            <span className="text-ipade-text">{course.name as string}</span>
          </div>
          <h1 className="text-2xl font-bold text-ipade-text">{course.name as string}</h1>
          {profile && (
            <p className="mt-1 text-sm text-ipade-text-secondary">
              Perfil: <Link href={`/dashboard/profiles/${profile.id}`} className="text-ipade-primary hover:underline">{profile.name}</Link>
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              Eliminar
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-md border border-ipade-border px-3 py-1.5 text-xs font-medium text-ipade-text hover:bg-ipade-bg"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Eliminando..." : "Confirmar"}
              </button>
            </div>
          )}
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${
            status === "active"
              ? "bg-green-100 text-green-700"
              : status === "completed"
                ? "bg-gray-100 text-gray-600"
                : "bg-yellow-100 text-yellow-700"
          }`}>
            {status === "active" ? "Activo" : status === "completed" ? "Finalizado" : "Configuración"}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-ipade-border bg-ipade-surface p-4">
          <p className="text-xs font-medium text-ipade-text-muted">Mundos</p>
          <p className="mt-1 text-2xl font-bold text-ipade-text">{worlds.length}</p>
        </div>
        <div className="rounded-lg border border-ipade-border bg-ipade-surface p-4">
          <p className="text-xs font-medium text-ipade-text-muted">Equipos</p>
          <p className="mt-1 text-2xl font-bold text-ipade-text">
            {worlds.reduce((acc, w) => acc + ((w.teams as unknown[]) ?? []).length, 0)}
          </p>
        </div>
        <div className="rounded-lg border border-ipade-border bg-ipade-surface p-4">
          <p className="text-xs font-medium text-ipade-text-muted">Participantes</p>
          <p className="mt-1 text-2xl font-bold text-ipade-text">
            {worlds.reduce((acc, w) => {
              const teams = (w.teams as Record<string, unknown>[]) ?? [];
              return acc + teams.reduce((ta, t) => ta + ((t.team_members as unknown[]) ?? []).length, 0);
            }, 0)}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-ipade-text">Mundos y Equipos</h2>

        {worlds.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ipade-border bg-ipade-surface p-8 text-center">
            <p className="text-ipade-text-muted">No hay mundos configurados.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {worlds.map((world) => {
              const teams = (world.teams as Record<string, unknown>[]) ?? [];
              return (
                <div key={world.id as string} className="rounded-lg border border-ipade-border bg-ipade-surface p-5">
                  <h3 className="mb-3 font-semibold text-ipade-text">{world.name as string}</h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {teams.map((team) => {
                      const members = (team.team_members as Record<string, unknown>[]) ?? [];
                      return (
                        <div key={team.id as string} className="rounded-md bg-ipade-bg p-3">
                          <p className="font-medium text-ipade-text">{team.name as string}</p>
                          <p className="text-xs text-ipade-text-muted">{members.length} participantes</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
