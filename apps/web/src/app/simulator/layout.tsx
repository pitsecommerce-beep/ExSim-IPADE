import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import Link from "next/link";

export default async function SimulatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = user.user_metadata?.full_name || user.email;

  return (
    <div className="min-h-screen bg-ipade-bg">
      <header className="border-b border-ipade-border bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-md border border-ipade-border px-3 py-1.5 text-sm text-ipade-text-secondary transition-colors hover:bg-ipade-bg hover:text-ipade-text"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Dashboard
            </Link>
            <div>
              <h1 className="text-lg font-bold text-ipade-text">ExSim — Simulador Comercial</h1>
              <p className="text-xs text-ipade-text-muted">IPADE Business School</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/simulator" className="text-sm text-ipade-accent hover:underline">
              Mis mundos
            </Link>
            <span className="text-xs text-ipade-text-muted">{displayName}</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-6">
        {children}
      </main>
    </div>
  );
}
