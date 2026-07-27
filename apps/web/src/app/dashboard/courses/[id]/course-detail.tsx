"use client";

import Link from "next/link";

interface Props {
  course: Record<string, unknown>;
  worlds: Record<string, unknown>[];
  profile: { id: string; name: string } | null;
}

export function CourseDetail({ course, worlds, profile }: Props) {
  const status = course.status as string;

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
