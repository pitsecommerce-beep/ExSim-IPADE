import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();

  const [{ count: courseCount }, { count: worldCount }, { count: teamCount }] = await Promise.all([
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("worlds").select("*", { count: "exact", head: true }),
    supabase.from("teams").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Cursos Activos", value: courseCount ?? 0 },
    { label: "Mundos", value: worldCount ?? 0 },
    { label: "Equipos", value: teamCount ?? 0 },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold text-ipade-text">Dashboard</h1>
      <p className="mt-2 text-ipade-text-secondary">
        Bienvenido al simulador de negocios ExSim.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-ipade-border bg-ipade-surface p-6">
            <h3 className="text-sm font-medium text-ipade-text-muted">{stat.label}</h3>
            <p className="mt-2 text-3xl font-bold text-ipade-primary">{stat.value}</p>
          </div>
        ))}
      </div>
    </>
  );
}
