"use client";

import { useRef, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

interface Participant {
  email: string;
  name: string;
  team: string;
}

export function CourseForm({ profiles }: { profiles: { id: string; name: string }[] }) {
  const [name, setName] = useState("");
  const [profileId, setProfileId] = useState(profiles[0]?.id ?? "");
  const [teamCount, setTeamCount] = useState(4);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const supabaseRef = useRef<ReturnType<typeof createSupabaseClient> | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createSupabaseClient();
    return supabaseRef.current;
  }

  function generateTeamNames(count: number): string[] {
    return Array.from({ length: count }, (_, i) => `Equipo ${i + 1}`);
  }

  function handleDownloadTemplate() {
    const teams = generateTeamNames(teamCount);
    const wsData = [
      ["email", "nombre", "equipo"],
      ["alumno1@ejemplo.com", "Juan Pérez", teams[0]],
      ["alumno2@ejemplo.com", "María López", teams[1] ?? teams[0]],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 30 }, { wch: 25 }, { wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Participantes");

    const teamsWs = XLSX.utils.aoa_to_sheet([
      ["Equipos disponibles"],
      ...teams.map((t) => [t]),
    ]);
    XLSX.utils.book_append_sheet(wb, teamsWs, "Equipos");

    XLSX.writeFile(wb, `participantes_${name || "curso"}.xlsx`);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target!.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]!];
      if (!ws) {
        setError("El archivo no contiene datos.");
        return;
      }
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);
      const teams = generateTeamNames(teamCount);

      const parsed: Participant[] = [];
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]!;
        const email = (row["email"] ?? row["Email"] ?? row["correo"] ?? row["Correo"] ?? "").trim();
        const pName = (row["nombre"] ?? row["Nombre"] ?? row["name"] ?? row["Name"] ?? "").trim();
        const team = (row["equipo"] ?? row["Equipo"] ?? row["team"] ?? row["Team"] ?? "").trim();

        if (!email) {
          errors.push(`Fila ${i + 2}: correo faltante`);
          continue;
        }
        if (!team || !teams.includes(team)) {
          errors.push(`Fila ${i + 2}: equipo "${team}" no válido`);
          continue;
        }
        parsed.push({ email, name: pName, team });
      }

      if (errors.length > 0) {
        setError(`Errores en archivo:\n${errors.slice(0, 5).join("\n")}${errors.length > 5 ? `\n...y ${errors.length - 5} más` : ""}`);
      }
      if (parsed.length > 0) {
        setParticipants(parsed);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function addManualParticipant() {
    const teams = generateTeamNames(teamCount);
    setParticipants([...participants, { email: "", name: "", team: teams[0] ?? "" }]);
  }

  function updateParticipant(index: number, field: keyof Participant, value: string) {
    setParticipants(participants.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  }

  function removeParticipant(index: number) {
    setParticipants(participants.filter((_, i) => i !== index));
  }

  async function handleCreate() {
    if (!name.trim()) { setError("El nombre del curso es requerido."); return; }
    if (!profileId) { setError("Selecciona un perfil de simulación."); return; }

    setSaving(true);
    setError(null);
    const supabase = getSupabase();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Sesión expirada."); setSaving(false); return; }

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .insert({
        name: name.trim(),
        profile_id: profileId,
        created_by: user.id,
        status: "draft",
      })
      .select("id")
      .single();

    if (courseError || !course) {
      setError(courseError?.message ?? "Error al crear curso.");
      setSaving(false);
      return;
    }

    const { data: world, error: worldError } = await supabase
      .from("worlds")
      .insert({
        course_id: course.id,
        name: `${name.trim()} - Mundo 1`,
        profile_id: profileId,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (worldError || !world) {
      setError(worldError?.message ?? "Error al crear mundo.");
      setSaving(false);
      return;
    }

    const teams = generateTeamNames(teamCount);
    const teamInserts = teams.map((tName) => ({
      world_id: world.id,
      name: tName,
    }));

    const { data: createdTeams, error: teamsError } = await supabase
      .from("teams")
      .insert(teamInserts)
      .select("id, name");

    if (teamsError || !createdTeams) {
      setError(teamsError?.message ?? "Error al crear equipos.");
      setSaving(false);
      return;
    }

    if (participants.length > 0) {
      const teamMap = new Map(createdTeams.map((t: { id: string; name: string }) => [t.name, t.id]));

      const participantEmails = participants.map((p) => p.email);
      const uniqueEmails = [...new Set(participantEmails)];

      const { data: existingUsers } = await supabase
        .from("auth.users")
        .select("id, email")
        .in("email", uniqueEmails);

      const existingMap = new Map(
        ((existingUsers ?? []) as { id: string; email: string }[]).map((u) => [u.email, u.id])
      );

      const memberInserts: { team_id: string; user_id: string; role: string }[] = [];
      const inviteEmails: { email: string; name: string; teamId: string }[] = [];

      for (const p of participants) {
        const teamId = teamMap.get(p.team);
        if (!teamId) continue;
        const userId = existingMap.get(p.email);
        if (userId) {
          memberInserts.push({ team_id: teamId, user_id: userId, role: "participant" });
        } else {
          inviteEmails.push({ email: p.email, name: p.name, teamId });
        }
      }

      if (memberInserts.length > 0) {
        await supabase.from("team_members").insert(memberInserts);
      }

      if (inviteEmails.length > 0) {
        for (const inv of inviteEmails) {
          const { data: authData } = await supabase.auth.admin.createUser({
            email: inv.email,
            user_metadata: { full_name: inv.name, role: "participant" },
            email_confirm: true,
          });
          if (authData?.user) {
            await supabase.from("team_members").insert({
              team_id: inv.teamId,
              user_id: authData.user.id,
              role: "participant",
            });
          }
        }
      }
    }

    router.push(`/dashboard/courses/${course.id}`);
    router.refresh();
  }

  const teamNames = generateTeamNames(teamCount);
  const participantsByTeam = teamNames.map((t) => ({
    team: t,
    members: participants.filter((p) => p.team === t),
  }));

  return (
    <div className="mx-auto max-w-3xl">
      {/* Step indicators */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => setStep(s as 1 | 2 | 3)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                step === s
                  ? "bg-ipade-primary text-white"
                  : step > s
                    ? "bg-green-100 text-green-700"
                    : "bg-ipade-bg text-ipade-text-muted"
              }`}
            >
              {step > s ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : s}
            </button>
            {s < 3 && <div className={`h-px w-12 ${step > s ? "bg-green-300" : "bg-ipade-border"}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 whitespace-pre-line rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-medium underline">Cerrar</button>
        </div>
      )}

      {/* Step 1: Course details */}
      {step === 1 && (
        <div className="rounded-lg border border-ipade-border bg-ipade-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-ipade-text">Detalles del Curso</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-ipade-text">Nombre del Curso</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2.5 text-sm text-ipade-text placeholder:text-ipade-text-muted focus:border-ipade-accent focus:outline-none focus:ring-1 focus:ring-ipade-accent"
                placeholder="Ej. MBA Estrategia 2025"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ipade-text">Perfil de Simulación</label>
              {profiles.length === 0 ? (
                <p className="text-sm text-ipade-text-muted">
                  No hay perfiles disponibles. Crea uno primero en la sección de Perfiles.
                </p>
              ) : (
                <select
                  value={profileId}
                  onChange={(e) => setProfileId(e.target.value)}
                  className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2.5 text-sm text-ipade-text focus:border-ipade-accent focus:outline-none focus:ring-1 focus:ring-ipade-accent"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ipade-text">Número de Equipos</label>
              <input
                type="number"
                min={2}
                max={20}
                value={teamCount}
                onChange={(e) => setTeamCount(Math.max(2, Math.min(20, parseInt(e.target.value) || 2)))}
                className="w-32 rounded-md border border-ipade-border bg-ipade-bg px-3 py-2.5 text-sm text-ipade-text focus:border-ipade-accent focus:outline-none focus:ring-1 focus:ring-ipade-accent"
              />
              <p className="mt-1 text-xs text-ipade-text-muted">
                Equipos: {teamNames.join(", ")}
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => { if (name.trim() && profileId) setStep(2); else setError("Completa los datos del curso."); }}
              className="rounded-md bg-ipade-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-ipade-accent-hover"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Participants */}
      {step === 2 && (
        <div className="rounded-lg border border-ipade-border bg-ipade-surface p-6">
          <h2 className="mb-2 text-lg font-semibold text-ipade-text">Participantes</h2>
          <p className="mb-4 text-sm text-ipade-text-muted">
            Carga una lista de participantes con Excel o agrega manualmente.
          </p>

          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 rounded-md border border-ipade-border bg-ipade-bg px-4 py-2 text-sm font-medium text-ipade-text transition-colors hover:bg-ipade-surface"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Descargar Plantilla
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 rounded-md border border-ipade-border bg-ipade-bg px-4 py-2 text-sm font-medium text-ipade-text transition-colors hover:bg-ipade-surface"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Cargar Excel
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={addManualParticipant}
              className="flex items-center gap-2 rounded-md border border-dashed border-ipade-border px-4 py-2 text-sm text-ipade-text-muted hover:border-ipade-primary hover:text-ipade-primary"
            >
              + Agregar manual
            </button>
          </div>

          {participants.length > 0 && (
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-ipade-text">{participants.length} participantes</span>
                <button
                  onClick={() => setParticipants([])}
                  className="text-xs text-red-500 hover:underline"
                >
                  Limpiar lista
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto rounded-lg border border-ipade-border">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 border-b border-ipade-border bg-ipade-bg">
                    <tr>
                      <th className="px-3 py-2 font-medium text-ipade-text-secondary">Correo</th>
                      <th className="px-3 py-2 font-medium text-ipade-text-secondary">Nombre</th>
                      <th className="px-3 py-2 font-medium text-ipade-text-secondary">Equipo</th>
                      <th className="w-10 px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((p, i) => (
                      <tr key={i} className="border-b border-ipade-border last:border-0">
                        <td className="px-3 py-1.5">
                          <input
                            type="email"
                            value={p.email}
                            onChange={(e) => updateParticipant(i, "email", e.target.value)}
                            className="w-full bg-transparent text-sm text-ipade-text outline-none placeholder:text-ipade-text-muted"
                            placeholder="correo@ejemplo.com"
                          />
                        </td>
                        <td className="px-3 py-1.5">
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => updateParticipant(i, "name", e.target.value)}
                            className="w-full bg-transparent text-sm text-ipade-text outline-none placeholder:text-ipade-text-muted"
                            placeholder="Nombre"
                          />
                        </td>
                        <td className="px-3 py-1.5">
                          <select
                            value={p.team}
                            onChange={(e) => updateParticipant(i, "team", e.target.value)}
                            className="w-full bg-transparent text-sm text-ipade-text outline-none"
                          >
                            {teamNames.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-1.5 text-center">
                          <button
                            onClick={() => removeParticipant(i)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {participants.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {participantsByTeam.map(({ team, members }) => (
                <div key={team} className="rounded-md bg-ipade-bg p-3 text-center">
                  <p className="text-xs font-medium text-ipade-text-secondary">{team}</p>
                  <p className="text-lg font-bold text-ipade-text">{members.length}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="rounded-md border border-ipade-border px-6 py-2.5 text-sm font-medium text-ipade-text hover:bg-ipade-bg"
            >
              Anterior
            </button>
            <button
              onClick={() => setStep(3)}
              className="rounded-md bg-ipade-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-ipade-accent-hover"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Create */}
      {step === 3 && (
        <div className="rounded-lg border border-ipade-border bg-ipade-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-ipade-text">Resumen</h2>

          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-ipade-bg p-3">
              <dt className="text-xs font-medium text-ipade-text-muted">Curso</dt>
              <dd className="mt-1 font-medium text-ipade-text">{name}</dd>
            </div>
            <div className="rounded-md bg-ipade-bg p-3">
              <dt className="text-xs font-medium text-ipade-text-muted">Perfil</dt>
              <dd className="mt-1 font-medium text-ipade-text">
                {profiles.find((p) => p.id === profileId)?.name ?? "—"}
              </dd>
            </div>
            <div className="rounded-md bg-ipade-bg p-3">
              <dt className="text-xs font-medium text-ipade-text-muted">Equipos</dt>
              <dd className="mt-1 font-medium text-ipade-text">{teamCount}</dd>
            </div>
            <div className="rounded-md bg-ipade-bg p-3">
              <dt className="text-xs font-medium text-ipade-text-muted">Participantes</dt>
              <dd className="mt-1 font-medium text-ipade-text">{participants.length}</dd>
            </div>
          </dl>

          {participants.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-medium text-ipade-text-secondary">Por equipo:</h3>
              <div className="flex flex-wrap gap-2">
                {participantsByTeam.map(({ team, members }) => (
                  <span key={team} className="rounded-full bg-ipade-bg px-3 py-1 text-xs text-ipade-text-secondary">
                    {team}: {members.length}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="rounded-md border border-ipade-border px-6 py-2.5 text-sm font-medium text-ipade-text hover:bg-ipade-bg"
            >
              Anterior
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="rounded-md bg-ipade-accent px-8 py-2.5 text-sm font-medium text-white hover:bg-ipade-accent-hover disabled:opacity-50"
            >
              {saving ? "Creando..." : "Crear Curso"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
