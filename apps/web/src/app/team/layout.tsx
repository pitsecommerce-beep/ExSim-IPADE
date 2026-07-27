import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

const IPADE_LOGO = "https://www.ipade.mx/wp-content/uploads/2022/10/fav.png?w=512";

export default async function TeamLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?tab=participant");
  }

  const { data: membership } = await supabase
    .from("team_members")
    .select("*, teams(name, worlds(name, courses(name)))")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  const teamName = (membership as Record<string, unknown>)?.teams
    ? ((membership as Record<string, unknown>).teams as Record<string, unknown>)?.name as string
    : null;

  return (
    <div className="min-h-screen bg-ipade-bg">
      <header className="border-b border-ipade-border bg-ipade-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={IPADE_LOGO} alt="IPADE" width={28} height={28} className="h-7 w-7 object-contain" />
            <div>
              <span className="font-display text-sm font-bold text-ipade-primary">ExSim</span>
              {teamName && (
                <span className="ml-2 rounded-full bg-ipade-bg px-2 py-0.5 text-xs text-ipade-text-secondary">
                  {teamName}
                </span>
              )}
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
