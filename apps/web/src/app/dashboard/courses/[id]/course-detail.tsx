"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import * as XLSX from "xlsx";

interface TeamData {
  id: string;
  name: string;
  team_members: { id: string; user_id: string; users?: { email?: string } | null }[];
}

interface Props {
  course: Record<string, unknown>;
  worlds: (Record<string, unknown> & { teams?: TeamData[] })[];
  profile: { id: string; name: string } | null;
}

export function CourseDetail({ course, worlds, profile }: Props) {
  const status = course.status as string;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "teams" | "settings">("overview");
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createSupabaseClient> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberTeam, setNewMemberTeam] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createSupabaseClient();
    return supabaseRef.current;
  }

  const firstWorld = worlds[0] as (Record<string, unknown> & { teams?: TeamData[] }) | undefined;
  const allTeams: TeamData[] = firstWorld?.teams ?? [];

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

  async function handleLaunchSimulator() {
    setLaunching(true);
    try {
      const res = await fetch(`/api/courses/${course.id}/init-simulator`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/simulator/${data.worldId}`);
      } else {
        const err = await res.json();
        alert(err.error ?? "Error al iniciar el simulador");
      }
    } catch {
      alert("Error de conexión");
    }
    setLaunching(false);
  }

  async function handleUpdateStatus(newStatus: string) {
    const supabase = getSupabase();
    const worldId = firstWorld?.id as string | undefined;
    if (!worldId) return;
    await supabase.from("worlds").update({ status: newStatus }).eq("id", worldId);
    router.refresh();
  }

  async function handleAddMember() {
    if (!newMemberEmail.trim() || !newMemberTeam) return;
    setAddingMember(true);
    setMemberError(null);
    const supabase = getSupabase();

    const { data: existingUsers } = await supabase.rpc("get_users_by_email", {
      email_input: newMemberEmail.trim(),
    });

    let userId: string | null = null;

    if (existingUsers && existingUsers.length > 0) {
      userId = existingUsers[0].id;
    } else {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newMemberEmail.trim(),
        user_metadata: { role: "participant" },
        email_confirm: true,
      });
      if (authError || !authData?.user) {
        setMemberError(authError?.message ?? "No se pudo crear el usuario");
        setAddingMember(false);
        return;
      }
      userId = authData.user.id;
    }

    const { error: memberError } = await supabase.from("team_members").insert({
      team_id: newMemberTeam,
      user_id: userId,
    });

    if (memberError) {
      setMemberError(memberError.message);
    } else {
      setNewMemberEmail("");
      router.refresh();
    }
    setAddingMember(false);
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm("Remover este participante del equipo?")) return;
    const supabase = getSupabase();
    await supabase.from("team_members").delete().eq("id", memberId);
    router.refresh();
  }

  async function handleReassignMember(memberId: string, newTeamId: string) {
    const supabase = getSupabase();
    await supabase.from("team_members").update({ team_id: newTeamId }).eq("id", memberId);
    router.refresh();
  }

  function handleExcelUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target!.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]!];
      if (!ws) return;
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);
      const supabase = getSupabase();

      let added = 0;
      for (const row of rows) {
        const email = (row["email"] ?? row["Email"] ?? row["correo"] ?? "").trim();
        const teamName = (row["equipo"] ?? row["Equipo"] ?? row["team"] ?? "").trim();
        if (!email || !teamName) continue;

        const team = allTeams.find(
          (t) => t.name.toLowerCase() === teamName.toLowerCase(),
        );
        if (!team) continue;

        const { data: authData } = await supabase.auth.admin.createUser({
          email,
          user_metadata: { full_name: row["nombre"] ?? row["Nombre"] ?? "", role: "participant" },
          email_confirm: true,
        });

        if (authData?.user) {
          await supabase.from("team_members").insert({
            team_id: team.id,
            user_id: authData.user.id,
          });
          added++;
        }
      }

      alert(`${added} participantes agregados.`);
      router.refresh();
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  }

  const totalParticipants = allTeams.reduce((acc, t) => acc + t.team_members.length, 0);

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
          <button
            onClick={handleLaunchSimulator}
            disabled={launching || allTeams.length === 0}
            className="rounded-md bg-ipade-accent px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {launching ? "Iniciando..." : "Jugar"}
          </button>
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
            {status === "active" ? "Activo" : status === "completed" ? "Finalizado" : "Configuracion"}
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
          <p className="mt-1 text-2xl font-bold text-ipade-text">{allTeams.length}</p>
        </div>
        <div className="rounded-lg border border-ipade-border bg-ipade-surface p-4">
          <p className="text-xs font-medium text-ipade-text-muted">Participantes</p>
          <p className="mt-1 text-2xl font-bold text-ipade-text">{totalParticipants}</p>
        </div>
      </div>

      <div className="mt-6 flex gap-1 border-b border-ipade-border">
        {([
          { key: "overview", label: "Mundos y Equipos" },
          { key: "teams", label: "Gestionar Participantes" },
          { key: "settings", label: "Configuracion" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === tab.key
                ? "border-b-2 border-ipade-accent text-ipade-accent"
                : "text-ipade-text-muted hover:text-ipade-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="mt-6">
          {worlds.length === 0 ? (
            <div className="rounded-lg border border-dashed border-ipade-border bg-ipade-surface p-8 text-center">
              <p className="text-ipade-text-muted">No hay mundos configurados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {worlds.map((world) => {
                const teams = (world.teams ?? []) as TeamData[];
                return (
                  <div key={world.id as string} className="rounded-lg border border-ipade-border bg-ipade-surface p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold text-ipade-text">{world.name as string}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        world.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {world.status === "active" ? "Activo" : world.status === "completed" ? "Finalizado" : "Configuracion"}
                      </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {teams.map((team) => (
                        <div key={team.id} className="rounded-md bg-ipade-bg p-3">
                          <p className="font-medium text-ipade-text">{team.name}</p>
                          <p className="text-xs text-ipade-text-muted">{team.team_members.length} participantes</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "teams" && (
        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 rounded-md border border-ipade-border bg-ipade-bg px-4 py-2 text-sm font-medium text-ipade-text hover:bg-ipade-surface"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Importar Excel
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleExcelUpload}
              className="hidden"
            />
          </div>

          <div className="rounded-lg border border-ipade-border bg-ipade-surface p-4">
            <h3 className="mb-3 text-sm font-semibold text-ipade-text">Agregar Participante</h3>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-ipade-text-muted">Correo</label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="alumno@ejemplo.com"
                  className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2 text-sm"
                />
              </div>
              <div className="w-48">
                <label className="mb-1 block text-xs text-ipade-text-muted">Equipo</label>
                <select
                  value={newMemberTeam}
                  onChange={(e) => setNewMemberTeam(e.target.value)}
                  className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar...</option>
                  {allTeams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAddMember}
                disabled={addingMember || !newMemberEmail.trim() || !newMemberTeam}
                className="rounded-md bg-ipade-accent px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {addingMember ? "Agregando..." : "Agregar"}
              </button>
            </div>
            {memberError && (
              <p className="mt-2 text-xs text-red-500">{memberError}</p>
            )}
          </div>

          {allTeams.map((team) => (
            <div key={team.id} className="rounded-lg border border-ipade-border bg-ipade-surface">
              <div className="border-b border-ipade-border bg-ipade-bg px-4 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-ipade-text">{team.name}</h3>
                  <span className="text-xs text-ipade-text-muted">{team.team_members.length} miembros</span>
                </div>
              </div>
              {team.team_members.length === 0 ? (
                <div className="p-4 text-center text-sm text-ipade-text-muted">Sin participantes asignados</div>
              ) : (
                <div className="divide-y divide-ipade-border">
                  {team.team_members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-sm text-ipade-text">
                        {(m.users as Record<string, unknown> | null)?.email as string ?? m.user_id}
                      </span>
                      <div className="flex items-center gap-2">
                        <select
                          defaultValue={team.id}
                          onChange={(e) => handleReassignMember(m.id, e.target.value)}
                          className="rounded border border-ipade-border bg-ipade-bg px-2 py-1 text-xs"
                        >
                          {allTeams.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleRemoveMember(m.id)}
                          className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                          title="Remover"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "settings" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-ipade-border bg-ipade-surface p-5">
            <h3 className="mb-3 font-semibold text-ipade-text">Estado del Mundo</h3>
            <div className="flex flex-wrap gap-2">
              {(["setup", "active", "paused", "completed"] as const).map((s) => {
                const worldStatus = (firstWorld?.status as string) ?? "setup";
                const labels: Record<string, string> = {
                  setup: "Configuracion",
                  active: "Activo",
                  paused: "Pausado",
                  completed: "Finalizado",
                };
                return (
                  <button
                    key={s}
                    onClick={() => handleUpdateStatus(s)}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      worldStatus === s
                        ? "bg-ipade-accent text-white"
                        : "border border-ipade-border text-ipade-text-muted hover:bg-ipade-bg"
                    }`}
                  >
                    {labels[s]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-ipade-border bg-ipade-surface p-5">
            <h3 className="mb-3 font-semibold text-ipade-text">Perfil de Simulacion</h3>
            {profile ? (
              <p className="text-sm text-ipade-text">
                <Link href={`/dashboard/profiles/${profile.id}`} className="text-ipade-primary hover:underline">
                  {profile.name}
                </Link>
              </p>
            ) : (
              <p className="text-sm text-ipade-text-muted">Sin perfil asignado</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
