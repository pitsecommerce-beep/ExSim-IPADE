import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

const IPADE_LOGO = "https://www.ipade.mx/wp-content/uploads/2022/10/fav.png?w=512";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = user.user_metadata?.full_name || user.email;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-ipade-sidebar text-white">
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <img
              src={IPADE_LOGO}
              alt="IPADE"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <div>
              <h2 className="text-sm font-bold leading-tight">ExSim</h2>
              <p className="text-[10px] uppercase tracking-wider text-white/50">IPADE</p>
            </div>
          </div>
        </div>

        <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
          <a href="/dashboard" className="rounded-md bg-white/10 px-3 py-2 text-sm font-medium">
            Inicio
          </a>
        </nav>

        <div className="border-t border-white/10 p-4">
          <p className="truncate text-xs text-white/60">{displayName}</p>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-ipade-text">Dashboard</h1>
        <p className="mt-2 text-ipade-text-secondary">
          Bienvenido al simulador de negocios ExSim.
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
