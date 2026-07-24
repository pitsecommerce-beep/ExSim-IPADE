import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-ipade-sidebar text-white">
        <div className="p-6">
          <h2 className="text-lg font-bold">ExSim IPADE</h2>
          <p className="mt-1 text-sm text-white/60">{user.email}</p>
        </div>
        <nav className="mt-4 flex flex-col gap-1 px-3">
          <a href="/dashboard" className="rounded-md bg-white/10 px-3 py-2 text-sm font-medium">
            Inicio
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-ipade-text">Dashboard</h1>
        <p className="mt-2 text-ipade-text-secondary">
          Bienvenido al simulador de negocios ExSim IPADE.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-ipade-border bg-ipade-surface p-6">
            <h3 className="text-sm font-medium text-ipade-text-muted">Cursos Activos</h3>
            <p className="mt-2 text-3xl font-bold text-ipade-primary">0</p>
          </div>
          <div className="rounded-lg border border-ipade-border bg-ipade-surface p-6">
            <h3 className="text-sm font-medium text-ipade-text-muted">Mundos</h3>
            <p className="mt-2 text-3xl font-bold text-ipade-primary">0</p>
          </div>
          <div className="rounded-lg border border-ipade-border bg-ipade-surface p-6">
            <h3 className="text-sm font-medium text-ipade-text-muted">Equipos</h3>
            <p className="mt-2 text-3xl font-bold text-ipade-primary">0</p>
          </div>
        </div>
      </main>
    </div>
  );
}
