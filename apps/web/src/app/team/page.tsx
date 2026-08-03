import { createSupabaseServer } from "@/lib/supabase/server";
import { TeamDashboard } from "./team-dashboard";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: memberships } = await supabase
    .from("team_members")
    .select("*, teams(*, worlds(*, courses(*)))")
    .eq("user_id", user!.id);

  const teams = (memberships ?? []) as Record<string, unknown>[];

  if (teams.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ipade-border bg-ipade-surface p-12 text-center">
        <h2 className="text-lg font-semibold text-ipade-text">Sin equipo asignado</h2>
        <p className="mt-2 text-sm text-ipade-text-muted">
          Tu profesor aun no te ha asignado a un equipo. Contacta a tu profesor para mas informacion.
        </p>
      </div>
    );
  }

  const membership = teams[0]!;
  const team = membership.teams as Record<string, unknown> | null;
  const world = team?.worlds as Record<string, unknown> | null;
  const course = world?.courses as Record<string, unknown> | null;
  const worldStatus = (world?.status as string) ?? "setup";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ipade-text">
          {team?.name as string ?? "Mi Equipo"}
        </h1>
        <p className="text-sm text-ipade-text-muted">
          {course?.name as string ?? "Curso"} &middot; {world?.name as string ?? "Mundo"}
        </p>
      </div>

      {worldStatus !== "active" ? (
        <div className="rounded-lg border border-dashed border-ipade-border bg-ipade-surface p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-ipade-text">Esperando al profesor</h2>
          <p className="mt-2 text-sm text-ipade-text-muted">
            La simulacion aun no ha sido activada. Tu profesor indicara cuando iniciar.
          </p>
          <p className="mt-1 text-xs text-ipade-text-muted">
            Estado: <span className="font-medium">{worldStatus === "setup" ? "Configuracion" : worldStatus === "paused" ? "Pausado" : "Finalizado"}</span>
          </p>
        </div>
      ) : (
        <TeamDashboard
          worldId={world!.id as string}
          teamId={team!.id as string}
          teamName={team!.name as string}
        />
      )}
    </div>
  );
}
