import { createSupabaseServer } from "@/lib/supabase/server";

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
          Tu profesor aún no te ha asignado a un equipo. Contacta a tu profesor para más información.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ipade-text">Mi Equipo</h1>

      {teams.map((membership) => {
        const team = membership.teams as Record<string, unknown> | null;
        const world = team?.worlds as Record<string, unknown> | null;
        const course = world?.courses as Record<string, unknown> | null;

        return (
          <div key={membership.id as string} className="mb-4 rounded-lg border border-ipade-border bg-ipade-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ipade-text">
                  {team?.name as string ?? "Equipo"}
                </h2>
                <p className="text-sm text-ipade-text-muted">
                  {course?.name as string ?? "Curso"} &middot; {world?.name as string ?? "Mundo"}
                </p>
              </div>
              <span className="rounded-full bg-ipade-bg px-3 py-1 text-xs font-medium text-ipade-text-secondary">
                {membership.role as string ?? "participante"}
              </span>
            </div>

            <div className="rounded-md bg-ipade-bg p-4 text-center text-sm text-ipade-text-muted">
              La interfaz de decisiones estará disponible cuando el profesor inicie la simulación.
            </div>
          </div>
        );
      })}
    </div>
  );
}
