import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Sidebar } from "./sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto bg-ipade-bg p-8">
        {children}
      </main>
    </div>
  );
}
